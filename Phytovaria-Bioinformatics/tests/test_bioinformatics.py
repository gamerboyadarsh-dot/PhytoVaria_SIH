"""
test_bioinformatics.py
======================
Automated test suite verifying the VCF parser, chromosome normalizer,
knowledge base lookups, variant interpretation, and unknown variant safety.
"""

import os
import unittest

from bioinformatics.vcf_parser import VCFParser, normalize_chromosome, get_chromosome_number
from bioinformatics.knowledge_base import GenomicKnowledgeBase
from bioinformatics.variant_matcher import VariantMatcher
from bioinformatics.pipeline import BioinformaticsPipeline


class TestPhytoVariaBioinformatics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cls.kb = GenomicKnowledgeBase()
        cls.matcher = VariantMatcher(cls.kb)
        cls.pipeline = BioinformaticsPipeline(cls.kb)
        cls.samples_dir = os.path.join(base_dir, "data", "vcf_samples")

    def test_chromosome_normalization(self):
        """Tests that varied chromosome formats map to canonical SL4.0 standard."""
        self.assertEqual(normalize_chromosome("chr9"), "SL4.0ch09")
        self.assertEqual(normalize_chromosome("9"), "SL4.0ch09")
        self.assertEqual(normalize_chromosome("ch09"), "SL4.0ch09")
        self.assertEqual(normalize_chromosome("SL4.0ch09"), "SL4.0ch09")
        self.assertEqual(normalize_chromosome("chr1"), "SL4.0ch01")
        self.assertEqual(normalize_chromosome("chr12"), "SL4.0ch12")
        self.assertEqual(get_chromosome_number("SL4.0ch09"), 9)
        self.assertEqual(get_chromosome_number("chr11"), 11)

    def test_knowledge_base_integrity(self):
        """Verifies that all curated entries possess valid genes, alleles, and real PMIDs."""
        self.assertGreaterEqual(len(self.kb.variants), 10)
        self.assertGreaterEqual(len(self.kb.associations), 10)
        
        # Test exact allele query for Tm-2^2
        entry = self.kb.lookup_exact_allele("SL4.0ch09", 2408520, "G", "A")
        self.assertIsNotNone(entry)
        self.assertEqual(entry.gene_symbol, "Tm-2^2")
        self.assertEqual(entry.evidence_level, "LEVEL_1_DEFINITIVE")
        self.assertTrue(len(entry.associations) > 0)
        self.assertTrue(entry.associations[0].citations[0].pmid is not None)

    def test_resistant_cultivar_pipeline(self):
        """Tests pipeline execution on the multi-disease resistant hybrid sample."""
        vcf_path = os.path.join(self.samples_dir, "resistant_cultivar_SL4.vcf")
        result = self.pipeline.process_vcf(vcf_path)
        
        self.assertEqual(result["status"], "SUCCESS")
        summary = result["summary"]
        self.assertGreater(summary["exact_knowledge_base_matches"], 8)
        self.assertGreater(summary["resistance_alleles_detected"], 5)
        
        # Check specific disease conferred protection
        profile = {p["condition"]: p for p in result["disease_susceptibility_profile"]}
        tomv = profile.get("Tomato Mosaic Virus (ToMV) & Tobacco Mosaic Virus (TMV)")
        self.assertIsNotNone(tomv)
        self.assertEqual(tomv["phenotype"], "CONFERRED_RESISTANCE")
        self.assertGreaterEqual(tomv["genomic_protection_score"], 0.90)

    def test_susceptible_heirloom_pipeline(self):
        """Tests pipeline on susceptible heirloom variety lacking R-genes."""
        vcf_path = os.path.join(self.samples_dir, "susceptible_heirloom_SL4.vcf")
        result = self.pipeline.process_vcf(vcf_path)
        
        self.assertEqual(result["status"], "SUCCESS")
        profile = {p["condition"]: p for p in result["disease_susceptibility_profile"]}
        vert = profile.get("Verticillium Wilt (Race 1)")
        self.assertIsNotNone(vert)
        self.assertEqual(vert["phenotype"], "SUSCEPTIBLE")

    def test_strict_unknown_variant_safety(self):
        """
        CRITICAL: Ensures uncatalogued variants are strictly classified as
        'Unknown / Insufficient Evidence' without arbitrary risk scores.
        """
        vcf_path = os.path.join(self.samples_dir, "mixed_field_isolate_SL4.vcf")
        result = self.pipeline.process_vcf(vcf_path)
        
        unknowns = [v for v in result["annotated_variants"] if v["match_status"] == "UNKNOWN_INSUFFICIENT_EVIDENCE"]
        self.assertGreater(len(unknowns), 0)
        
        for u in unknowns:
            self.assertEqual(u["inferred_phenotype"], "INSUFFICIENT_EVIDENCE")
            self.assertIsNone(u["genomic_protection_score"])
            self.assertEqual(u["evidence_level"], "NO_EVIDENCE")
            self.assertIn("Insufficient Evidence", u["interpretation"])

    def test_edge_cases_and_malformed_fields(self):
        """Tests parser resilience against indels, multi-allelics, missing quals, and aliases."""
        vcf_path = os.path.join(self.samples_dir, "edge_cases_test.vcf")
        result = self.pipeline.process_vcf(vcf_path)
        
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["summary"]["total_vcf_variants"], 7)


if __name__ == "__main__":
    unittest.main()
