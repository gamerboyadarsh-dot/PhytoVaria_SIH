"""
STUB — replace parse_vcf() with real VCF parsing logic (e.g. using pysam
or manual parsing of the VCF spec) once the team has settled on the format.

Contract: parse_vcf(file_path) -> List[dict], where each dict has
keys: chrom, pos, ref, alt
This is the ONLY function routers/vcf.py calls — swap the internals
freely without touching any other file.
"""
from typing import List, Dict


def parse_vcf(file_path: str) -> List[Dict]:
    # TODO: replace with real VCF parsing.
    # Returning fake placeholder records so the rest of the pipeline
    # (variant interpretation, risk, report) can be built and tested now.
    return [
        {"chrom": "1", "pos": 12345, "ref": "A", "alt": "G"},
        {"chrom": "2", "pos": 67890, "ref": "C", "alt": "T"},
    ]
