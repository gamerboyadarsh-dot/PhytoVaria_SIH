#!/usr/bin/env python3
"""
run_bioinformatics_demo.py
==========================
Standalone demonstration script for PhytoVaria Member 3 (Bioinformatics).
Executes parsing, knowledge base matching, and structured output generation.

Usage:
    python run_bioinformatics_demo.py [path/to/sample.vcf]
"""

import json
import os
import sys

# Ensure UTF-8 output encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from bioinformatics.pipeline import BioinformaticsPipeline


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    if len(sys.argv) > 1:
        vcf_path = sys.argv[1]
    else:
        vcf_path = os.path.join(base_dir, "data", "vcf_samples", "resistant_cultivar_SL4.vcf")

    if not os.path.exists(vcf_path):
        print(f"Error: VCF file not found at {vcf_path}")
        sys.exit(1)

    print("=" * 80)
    print("PhytoVaria -- Genomic Intelligence for Healthier Crops")
    print("Member 3: Bioinformatics & Genomic Knowledge Base Engine")
    print("=" * 80)
    print(f"[*] Target Sample VCF : {os.path.basename(vcf_path)}")
    print(f"[*] Processing Pipeline ...\n")

    pipeline = BioinformaticsPipeline()
    result = pipeline.process_vcf(vcf_path)

    summary = result["summary"]
    print("-" * 80)
    print("GENOMIC SUMMARY REPORT")
    print("-" * 80)
    print(f"  * Total Variants in VCF           : {summary['total_vcf_variants']}")
    print(f"  * Curated Knowledge Base Matches  : {summary['exact_knowledge_base_matches']}")
    print(f"  * Novel Alleles at Known Loci     : {summary['novel_alleles_at_known_loci']}")
    print(f"  * Unknown / Insufficient Evidence : {summary['unknown_insufficient_evidence_variants']}")
    print(f"  * Conferred Resistance Alleles    : {summary['resistance_alleles_detected']}")
    print(f"  * Susceptible Alleles Detected    : {summary['susceptibility_alleles_detected']}")
    print()

    print("-" * 80)
    print("DISEASE SUSCEPTIBILITY & RESISTANCE INVENTORY")
    print("-" * 80)
    for p in result["disease_susceptibility_profile"]:
        score_str = f"{int(p['genomic_protection_score'] * 100)}%" if p['genomic_protection_score'] is not None else "N/A"
        print(f"Condition : {p['condition']}")
        print(f"Pathogen  : {p['pathogen']}")
        print(f"Gene      : {p['gene_symbol']} (GT: {p['genotype']}, {p['zygosity']})")
        print(f"Phenotype : {p['phenotype']} [Protection Score: {score_str}]")
        print(f"Evidence  : {p['evidence_level']}")
        print(f"Env Note  : {p['environmental_interaction']}")
        print("-" * 80)

    print("\n" + "-" * 80)
    print("ACTIONABLE GENOMIC VARIANTS (Curated Matches)")
    print("-" * 80)
    for v in result["actionable_variants"]:
        print(f"* {v['chrom']}:{v['pos']} ({v['ref']}>{v['alt']}) | Gene: {v['gene_symbol']} | {v['protein_change']}")
        print(f"  Inferred: {v['inferred_phenotype']} (Confidence: {v['confidence_level']})")
        if v["citations"]:
            c = v["citations"][0]
            print(f"  Source: {c['authors']} ({c['year']}). {c['journal']}. PMID: {c['pmid']}")
        print()

    if result["unknown_variants_sample"]:
        print("-" * 80)
        print("UNKNOWN / INSUFFICIENT EVIDENCE VARIANTS (Conservative Safety Handling)")
        print("-" * 80)
        for u in result["unknown_variants_sample"][:3]:
            print(f"* {u['chrom']}:{u['pos']} ({u['ref']}>{u['alt']}) -> {u['inferred_phenotype']}")
            print(f"  Note: {u['interpretation']}")
            print()

    # Save output JSON for review
    output_json_path = os.path.join(base_dir, "last_pipeline_output.json")
    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"[*] Complete JSON delivered to: {output_json_path}\n")


if __name__ == "__main__":
    main()
