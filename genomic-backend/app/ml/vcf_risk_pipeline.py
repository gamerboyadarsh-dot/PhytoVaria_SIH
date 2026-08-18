"""
End-to-end demo: reads a real VCF file and turns it into an explainable
disease risk assessment, using BOTH the rule engine and the ML module.

This is the missing link between "I trained a model on synthetic numbers"
and "I can show a judge a real VCF file producing a real risk report."
It does NOT touch the database or FastAPI -- it's a standalone script so
you can verify/demo your ML module without depending on Sanidhya's
backend being up.

WHAT IT DOES (matches the project architecture exactly):
  VCF file
    -> parse_vcf_text()              (Divyanshi/Sanidhya's parser, reused as-is)
    -> match each variant to a gene  (same range-matching logic as main.py,
                                       reimplemented standalone against the
                                       JSON seed files -- no DB needed)
    -> look up gene in knowledge base -> build GenomicEvidence per disease
    -> compute_disease_risk()        (the rule engine -- ground truth)
    -> predict_risk_ml()             (your ML module, with the richer
                                       resistance/susceptibility/evidence
                                       features)
    -> printed side-by-side explainable report

WHAT IT DELIBERATELY DOES NOT DO:
  It does NOT retrain the ML model on this VCF. One plant's variants is
  one data point -- not a training set. Training still uses the synthetic,
  rule-derived dataset (see generate_training_data.py) for the same
  honesty reasons documented there. This script is for INFERENCE/DEMO
  on real genomic input, not for training.

USAGE:
  python3 vcf_risk_pipeline.py path/to/file.vcf
  python3 vcf_risk_pipeline.py path/to/file.vcf --temperature 22 --humidity 88 --soil-moisture 60 --light 500
  python3 vcf_risk_pipeline.py path/to/file.vcf --demo-env     # uses built-in demo sensor values
  python3 vcf_risk_pipeline.py path/to/file.vcf --json out.json
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(__file__)
BACKEND_DIR = os.path.join(HERE, "..", "backend")
sys.path.insert(0, BACKEND_DIR)

from app.services.vcf_parser import parse_vcf_text
from app.services.risk_engine import compute_disease_risk, EnvSnapshot, GenomicEvidence

sys.path.insert(0, HERE)
from predict import predict_risk_ml, FEATURES as ML_FEATURES  # noqa: F401
from generate_training_data import genomic_features, EVIDENCE_WEIGHTS  # noqa: F401

DISEASES = ["Early Blight", "Late Blight", "Fusarium Wilt"]

# "Demo Sensor Mode" values, per the project brief -- used only if the
# ESP32 / real sensor isn't available and --demo-env is passed.
DEMO_ENV = {"temperature": 24.0, "humidity": 82.0, "soil_moisture": 55.0, "light": 450.0}


def load_json(relative_path: str) -> dict:
    path = os.path.join(BACKEND_DIR, "data", relative_path)
    with open(path) as f:
        return json.load(f)


def match_variant_to_gene(chromosome: str, position: int, gene_coords: list) -> str | None:
    """
    Standalone reimplementation of main.py's match_variant_to_gene(),
    against the JSON seed directly instead of the DB -- same two-tier
    logic: verified position window first, honest chromosome-level
    fallback (e.g. Ph-3) second. No invented precision.
    """
    for gene in gene_coords:
        if gene["chromosome"] != chromosome:
            continue
        if gene.get("start") is not None and gene.get("end") is not None:
            if gene["start"] <= position <= gene["end"]:
                return gene["gene_symbol"]
    # chromosome-only fallback for genes with no resolved window (e.g. Ph-3)
    for gene in gene_coords:
        if gene["chromosome"] == chromosome and gene.get("start") is None:
            return gene["gene_symbol"]
    return None


def build_genomic_evidence(matched_genes: set, associations: list) -> dict:
    """Returns {disease: [GenomicEvidence, ...]} for genes actually found in this VCF."""
    evidence_by_disease = {d: [] for d in DISEASES}
    for assoc in associations:
        if assoc["gene_symbol"] in matched_genes and assoc["disease"] in evidence_by_disease:
            evidence_by_disease[assoc["disease"]].append(
                GenomicEvidence(
                    gene_symbol=assoc["gene_symbol"],
                    association_type=assoc["association_type"],
                    evidence_level=assoc["evidence_level"].split(" ")[0],  # "strong (cloned gene)" -> "strong"
                    source_citation=assoc["source_citation"],
                )
            )
    return evidence_by_disease


def run_pipeline(vcf_path: str, env_values: dict) -> dict:
    # 1. Parse the VCF
    with open(vcf_path) as f:
        vcf_text = f.read()
    parsed_variants = parse_vcf_text(vcf_text)
    if not parsed_variants:
        raise ValueError("No variants parsed -- check the file is valid VCF text.")

    # 2. Match each variant to a gene
    gene_coords = load_json("gene_coordinates_seed.json")["genes"]
    associations = load_json("knowledge_base_seed.json")["associations"]

    matched_genes = set()
    variant_summary = []
    for v in parsed_variants:
        gene = match_variant_to_gene(v.chromosome, v.position, gene_coords)
        variant_summary.append({
            "chromosome": v.chromosome, "position": v.position,
            "ref": v.ref_allele, "alt": v.alt_allele,
            "genotype": v.genotype, "matched_gene": gene,
        })
        if gene:
            matched_genes.add(gene)

    # 3. Build genomic evidence per disease from matched genes
    evidence_by_disease = build_genomic_evidence(matched_genes, associations)

    # 4. Environment snapshot
    env = EnvSnapshot(**env_values)

    # 5. Run BOTH engines per disease
    report = {
        "vcf_file": os.path.basename(vcf_path),
        "variants_parsed": len(parsed_variants),
        "genes_matched": sorted(matched_genes),
        "variant_detail": variant_summary,
        "environment_used": env_values,
        "results": [],
    }

    for disease in DISEASES:
        evidence = evidence_by_disease[disease]

        rule_result = compute_disease_risk(disease, evidence, env)

        gfeat = genomic_features(evidence)
        ml_result = None
        try:
            ml_result = predict_risk_ml(
                disease,
                resistance_gene_count=gfeat["resistance_gene_count"],
                susceptibility_gene_count=gfeat["susceptibility_gene_count"],
                evidence_strength_score=gfeat["evidence_strength_score"],
                temperature=env.temperature, humidity=env.humidity,
                soil_moisture=env.soil_moisture, light=env.light,
            )
        except FileNotFoundError:
            pass  # models not trained yet -- rule engine result still valid standalone

        report["results"].append({
            "disease": disease,
            "rule_engine": {
                "risk_level": rule_result.risk_level,
                "risk_score": rule_result.risk_score,
                "evidence_level": rule_result.evidence_level,
                "contributing_variants": rule_result.contributing_variants,
                "environmental_factors": rule_result.environmental_factors,
                "explanation": rule_result.explanation,
            },
            "ml_prediction": ml_result,
        })

    return report


def print_report(report: dict):
    print(f"\n{'='*70}")
    print(f" PhytoVaria Risk Report -- {report['vcf_file']}")
    print(f"{'='*70}")
    print(f"Variants parsed: {report['variants_parsed']}")
    print(f"Genes matched:   {', '.join(report['genes_matched']) or '(none)'}")
    print(f"Environment:     {report['environment_used']}")

    for r in report["results"]:
        print(f"\n--- {r['disease']} ---")
        re_ = r["rule_engine"]
        print(f"  Rule engine:  {re_['risk_level']} (score {re_['risk_score']}/100, evidence: {re_['evidence_level']})")
        print(f"    {re_['explanation']}")
        for note in re_["contributing_variants"]:
            print(f"    - {note}")
        for note in re_["environmental_factors"]:
            print(f"    - {note}")

        if r["ml_prediction"]:
            ml = r["ml_prediction"]
            print(f"  ML model:     {ml['predicted_risk_level']} (confidence {ml['confidence']})")
            print(f"    {ml['reasoning']}")
        else:
            print("  ML model:     (not available -- run train_model.py first)")

    print(f"\n{'='*70}\n")


def main():
    parser = argparse.ArgumentParser(description="VCF -> explainable disease risk report")
    parser.add_argument("vcf_path", help="Path to a VCF file")
    parser.add_argument("--temperature", type=float, default=None)
    parser.add_argument("--humidity", type=float, default=None)
    parser.add_argument("--soil-moisture", type=float, default=None, dest="soil_moisture")
    parser.add_argument("--light", type=float, default=None)
    parser.add_argument("--demo-env", action="store_true", help="Use built-in Demo Sensor Mode values")
    parser.add_argument("--json", default=None, help="Optional path to write the full report as JSON")
    args = parser.parse_args()

    if args.demo_env:
        env_values = dict(DEMO_ENV)
    else:
        missing = [k for k in ["temperature", "humidity", "soil_moisture", "light"]
                   if getattr(args, k) is None]
        if missing:
            print(f"Missing environment values: {missing}. "
                  f"Pass them explicitly or use --demo-env for built-in demo values.")
            sys.exit(1)
        env_values = {
            "temperature": args.temperature, "humidity": args.humidity,
            "soil_moisture": args.soil_moisture, "light": args.light,
        }

    report = run_pipeline(args.vcf_path, env_values)
    print_report(report)

    if args.json:
        with open(args.json, "w") as f:
            json.dump(report, f, indent=2, default=str)
        print(f"Full report written to {args.json}")


if __name__ == "__main__":
    main()
