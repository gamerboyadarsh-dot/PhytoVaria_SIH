"""
pipeline.py
===========
End-to-end Bioinformatics Pipeline for PhytoVaria.
Integrates VCF parsing, quality filtering, chromosome normalization,
knowledge-base matching, and comprehensive reporting for Backend (Member 2)
and Risk Engine (Member 4).
"""

import io
from typing import Dict, List, Optional, Any, Union
from dataclasses import asdict

from .vcf_parser import VCFParser, VariantRecord
from .knowledge_base import GenomicKnowledgeBase
from .variant_matcher import VariantMatcher, MatchedVariantResult


class BioinformaticsPipeline:
    """
    Primary processing pipeline:
    Input: VCF file (path or IO buffer)
    Output: Clean, standardized, structured dictionary/JSON report.
    """

    def __init__(self, kb: Optional[GenomicKnowledgeBase] = None):
        self.kb = kb or GenomicKnowledgeBase()
        self.matcher = VariantMatcher(self.kb)

    def process_vcf(
        self,
        vcf_source: Union[str, io.IOBase],
        sample_id: Optional[str] = None,
        min_quality: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Executes complete genomic variant extraction, annotation, and evidence mapping.
        """
        parser = VCFParser(vcf_source)
        header_metadata = parser.parse_header()
        
        samples_in_vcf = header_metadata.get("samples", [])
        chosen_sample = sample_id
        if not chosen_sample and samples_in_vcf:
            chosen_sample = samples_in_vcf[0]
        elif not chosen_sample:
            chosen_sample = "SAMPLE_1"

        all_records = parser.parse_all()

        total_variants = len(all_records)
        passed_filter_count = 0
        
        matched_results: List[MatchedVariantResult] = []
        
        for rec in all_records:
            if min_quality is not None and rec.qual is not None and rec.qual < min_quality:
                continue
            passed_filter_count += 1
            results = self.matcher.match_variant(rec, sample_id=chosen_sample)
            matched_results.extend(results)

        # Categorize results
        exact_matches = [r for r in matched_results if r.match_status == "EXACT_MATCH"]
        novel_at_locus = [r for r in matched_results if r.match_status == "NOVEL_ALLELE_AT_LOCUS"]
        unknown_variants = [r for r in matched_results if r.match_status == "UNKNOWN_INSUFFICIENT_EVIDENCE"]

        # Synthesize disease resistance & susceptibility profile
        disease_profile: Dict[str, Dict[str, Any]] = {}
        for r in exact_matches:
            for assoc in r.associations:
                cond = assoc["target_condition"]
                disease_profile[cond] = {
                    "condition": cond,
                    "pathogen": assoc["pathogen"],
                    "category": assoc["disease_category"],
                    "gene_symbol": r.gene_symbol,
                    "genotype": r.genotype,
                    "zygosity": r.zygosity,
                    "phenotype": r.inferred_phenotype,
                    "genomic_protection_score": r.genomic_protection_score,
                    "evidence_level": r.evidence_level,
                    "interpretation": r.interpretation,
                    "environmental_interaction": assoc.get("environmental_interaction", "")
                }

        # Build clean JSON deliverable
        return {
            "status": "SUCCESS",
            "pipeline_version": "1.0.0",
            "sample_id": chosen_sample,
            "reference_genome": header_metadata.get("reference") or "Solanum lycopersicum SL4.0 / ITAG4.0",
            "summary": {
                "total_vcf_variants": total_variants,
                "variants_evaluated": len(matched_results),
                "exact_knowledge_base_matches": len(exact_matches),
                "novel_alleles_at_known_loci": len(novel_at_locus),
                "unknown_insufficient_evidence_variants": len(unknown_variants),
                "resistance_alleles_detected": len([r for r in exact_matches if "RESISTANCE" in r.inferred_phenotype]),
                "susceptibility_alleles_detected": len([r for r in exact_matches if "SUSCEPTIBLE" in r.inferred_phenotype])
            },
            "disease_susceptibility_profile": list(disease_profile.values()),
            "annotated_variants": [r.to_dict() for r in matched_results],
            "actionable_variants": [r.to_dict() for r in exact_matches],
            "unknown_variants_sample": [r.to_dict() for r in unknown_variants[:10]]  # sample preview
        }
