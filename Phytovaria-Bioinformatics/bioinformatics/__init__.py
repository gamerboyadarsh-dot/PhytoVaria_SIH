"""
PhytoVaria Bioinformatics Package
==================================
Genomic variation parsing, annotation, and evidence-based matching engine
for Solanum lycopersicum (Tomato).
"""

from .vcf_parser import VCFParser, VariantRecord
from .knowledge_base import GenomicKnowledgeBase
from .variant_matcher import VariantMatcher, MatchedVariantResult
from .pipeline import BioinformaticsPipeline

__version__ = "1.0.0"
__all__ = [
    "VCFParser",
    "VariantRecord",
    "GenomicKnowledgeBase",
    "VariantMatcher",
    "MatchedVariantResult",
    "BioinformaticsPipeline",
]
