"""
STUB — replace classify_variants() with real logic (e.g. lookup against
ClinVar-style reference DB, or a rules engine) once the team decides
on the classification approach.

Contract: classify_variants(variants: List[dict]) -> List[dict]
Input dicts have: chrom, pos, ref, alt
Output dicts have the same keys PLUS: classification, confidence
This is the ONLY function routers/variant.py calls.
"""
import random
from typing import List, Dict

CLASSIFICATIONS = ["benign", "likely_benign", "uncertain", "likely_pathogenic", "pathogenic"]


def classify_variants(variants: List[Dict]) -> List[Dict]:
    results = []
    for v in variants:
        # TODO: replace with real classification logic
        v = dict(v)
        v["classification"] = random.choice(CLASSIFICATIONS)
        v["confidence"] = round(random.uniform(0.5, 0.99), 2)
        results.append(v)
    return results
