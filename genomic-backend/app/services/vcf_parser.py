"""
VCF Parser Service — wraps the real Phytovaria Bioinformatics pipeline.
This replaces the original stub and provides the actual genomic analysis.
"""
import os
import sys
from typing import Dict, Any

# Ensure the bioinformatics module can import its own submodules
_BIO_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bioinformatics")

from app.bioinformatics.pipeline import BioinformaticsPipeline
from app.bioinformatics.knowledge_base import GenomicKnowledgeBase

# Point the KB at the data we copied into the backend
_KB_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bio_data", "genomic_kb")
_VARIANTS_PATH = os.path.join(_KB_DATA_DIR, "variants.json")
_ASSOC_PATH = os.path.join(_KB_DATA_DIR, "associations.json")

# Singleton KB + pipeline (loaded once at import time)
try:
    _kb = GenomicKnowledgeBase(variants_path=_VARIANTS_PATH, associations_path=_ASSOC_PATH)
    _pipeline = BioinformaticsPipeline(kb=_kb)
    KB_AVAILABLE = True
except Exception as e:
    print(f"[PhytoVaria] Warning: Genomic Knowledge Base not loaded: {e}")
    _kb = None
    _pipeline = None
    KB_AVAILABLE = False


def run_vcf_pipeline(file_path: str, sample_id: str = None) -> Dict[str, Any]:
    """
    Runs the full bioinformatics pipeline on a VCF file.
    Returns structured pipeline output dict.
    
    If the pipeline is unavailable (missing KB data), returns a safe error dict.
    """
    if not _pipeline or not KB_AVAILABLE:
        return {
            "status": "ERROR",
            "error": "Genomic Knowledge Base not available on this server. Check bio_data/genomic_kb/ directory.",
            "summary": {},
            "annotated_variants": [],
            "actionable_variants": [],
            "disease_susceptibility_profile": [],
            "unknown_variants_sample": [],
        }

    try:
        result = _pipeline.process_vcf(file_path, sample_id=sample_id)
        return result
    except Exception as exc:
        return {
            "status": "ERROR",
            "error": str(exc),
            "summary": {},
            "annotated_variants": [],
            "actionable_variants": [],
            "disease_susceptibility_profile": [],
            "unknown_variants_sample": [],
        }
