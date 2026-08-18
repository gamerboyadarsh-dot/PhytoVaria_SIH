"""
Generates training data for the ML risk model.

HONESTY NOTE (read this before touching anything else in ml/):
We do NOT have real field data linking actual tomato plants' genomes +
environments to CONFIRMED disease outcomes. Getting that would require
a season of field trials, which is impossible in 6 days. So we do the
scientifically honest thing instead of faking biological ground truth:

We sample random (genomic evidence, environment) combinations and label
them using the EXISTING rule engine from backend/app/services/risk_engine.py
(the one built on real cited gene-disease associations). The ML model
therefore learns to approximate our expert rule system -- it is a
"student model" of the rules, not an independently-validated predictor
of real-world disease.
"""
import random
import os
from dataclasses import dataclass

DISEASES = ["Early Blight", "Late Blight", "Fusarium Wilt", "Bacterial Spot"]

EVIDENCE_WEIGHTS = {"strong": 1.0, "moderate": 0.6, "weak": 0.3}

DISEASE_GENES = {
    "Fusarium Wilt": [
        ("I-2", "resistance", "strong"),
        ("I-3", "resistance", "strong"),
    ],
    "Late Blight": [
        ("Ph-2", "resistance", "strong"),
        ("Ph-3", "resistance", "moderate"),
    ],
    "Early Blight": [
        ("EB_QTL_habrochaites", "resistance", "moderate"),
    ],
    "Bacterial Spot": [
        ("Rx-4", "resistance", "strong"),
        ("Bs4", "resistance", "moderate"),
    ],
}

@dataclass
class EnvSnapshot:
    temperature: float
    humidity: float
    soil_moisture: float
    light: float

@dataclass
class GenomicEvidence:
    gene_symbol: str
    association_type: str
    evidence_level: str
    source_citation: str

@dataclass
class RiskResult:
    risk_level: str
    risk_score: float

ENV_THRESHOLDS = {
    "Early Blight": {"temp_range": (20, 30), "humidity_min": 70},
    "Late Blight": {"temp_range": (10, 24), "humidity_min": 75},
    "Fusarium Wilt": {"temp_range": (25, 35), "humidity_min": 40},
    "Bacterial Spot": {"temp_range": (24, 30), "humidity_min": 85},
}

def _env_risk_score(disease: str, temperature: float, humidity: float) -> float:
    thresholds = ENV_THRESHOLDS.get(disease, {})
    t_min, t_max = thresholds.get("temp_range", (0, 100))
    h_min = thresholds.get("humidity_min", 0)
    temp_ok = t_min <= temperature <= t_max
    humid_ok = humidity >= h_min
    if temp_ok and humid_ok: return 0.8
    elif temp_ok or humid_ok: return 0.4
    else: return 0.1

def compute_disease_risk(disease: str, evidence: list, env: EnvSnapshot) -> RiskResult:
    env_factor = _env_risk_score(disease, env.temperature, env.humidity) * 100
    
    protection = 0.5
    for e in evidence:
        if e.association_type == "resistance":
            val = 0.8 if e.evidence_level == "strong" else 0.6
            protection = max(protection, val)
    
    genomic_susceptibility = (1.0 - protection) * 100
    combined_score = round(0.60 * genomic_susceptibility + 0.40 * env_factor, 1)
    
    if combined_score >= 65: level = "high"
    elif combined_score >= 35: level = "moderate"
    else: level = "low"
    
    return RiskResult(risk_level=level, risk_score=combined_score)

def random_env() -> EnvSnapshot:
    return EnvSnapshot(
        temperature=round(random.uniform(15, 38), 1),
        humidity=round(random.uniform(30, 98), 1),
        soil_moisture=round(random.uniform(10, 90), 1),
        light=round(random.uniform(100, 1200), 1),
    )

def random_genomic_evidence(disease: str) -> list:
    pool = DISEASE_GENES[disease]
    evidence = []
    for gene_symbol, assoc_type, level in pool:
        if random.random() < 0.5:
            evidence.append(GenomicEvidence(gene_symbol, assoc_type, level, "seed_citation"))
    return evidence

def genomic_features(evidence: list) -> dict:
    resistance_count = sum(1 for e in evidence if e.association_type == "resistance")
    susceptibility_count = sum(1 for e in evidence if e.association_type == "susceptibility")
    strength_score = 0.0
    for e in evidence:
        weight = EVIDENCE_WEIGHTS.get(e.evidence_level, 0.3)
        sign = -1 if e.association_type == "resistance" else 1
        strength_score += sign * weight
    return {
        "resistance_gene_count": resistance_count,
        "susceptibility_gene_count": susceptibility_count,
        "evidence_strength_score": round(strength_score, 3),
    }

def generate_dataset(n_samples: int = 3000, seed: int = 42):
    random.seed(seed)
    rows = []
    for _ in range(n_samples):
        env = random_env()
        for disease in DISEASES:
            evidence = random_genomic_evidence(disease)
            result = compute_disease_risk(disease, evidence, env)
            gfeat = genomic_features(evidence)
            rows.append({
                "disease": disease,
                **gfeat,
                "temperature": env.temperature,
                "humidity": env.humidity,
                "soil_moisture": env.soil_moisture,
                "light": env.light,
                "risk_level": result.risk_level,
                "risk_score": result.risk_score,
            })
    return rows

if __name__ == "__main__":
    import csv
    rows = generate_dataset()
    out_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_training_data.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} rows -> {out_path}")
    print("REMINDER: labels come from the rule engine, not real field outcomes. See module docstring.")
