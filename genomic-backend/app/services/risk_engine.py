"""
STUB — replace compute_risk() with the real scoring model once the
team defines how variant classifications combine into a risk score.

Contract: compute_risk(variants: List[dict]) -> dict
Input dicts have: classification (and whatever else got added upstream)
Output dict has: risk_score (0-100), risk_level ("low"/"moderate"/"high")
This is the ONLY function routers/risk.py calls.
"""
from typing import List, Dict

WEIGHTS = {
    "pathogenic": 25,
    "likely_pathogenic": 15,
    "uncertain": 5,
    "likely_benign": 1,
    "benign": 0,
}


def compute_risk(variants: List[Dict]) -> Dict:
    # TODO: replace with real weighted/statistical risk model
    score = sum(WEIGHTS.get(v.get("classification"), 0) for v in variants)
    score = min(score, 100)

    if score >= 50:
        level = "high"
    elif score >= 20:
        level = "moderate"
    else:
        level = "low"

    return {"risk_score": float(score), "risk_level": level}
