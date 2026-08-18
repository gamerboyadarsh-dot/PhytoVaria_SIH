"""
Risk Engine — integrates the ML module and rule-based scoring.
Produces per-disease risk scores with explainability.
"""
import os
import sys
import json
from typing import List, Dict, Optional, Any

# Add ML module path
_ML_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml")

# Try to import ML predict function
try:
    sys.path.insert(0, _ML_DIR)
    from predict import predict_risk_ml  # noqa
    ML_AVAILABLE = True
except Exception as e:
    print(f"[PhytoVaria] Warning: ML module not loaded: {e}")
    ML_AVAILABLE = False

DISEASES = ["Early Blight", "Late Blight", "Fusarium Wilt", "Bacterial Spot"]

# Environmental thresholds for rule-based environmental scoring
ENV_THRESHOLDS = {
    "Early Blight": {"temp_range": (20, 30), "humidity_min": 70},
    "Late Blight": {"temp_range": (10, 24), "humidity_min": 75},
    "Fusarium Wilt": {"temp_range": (25, 35), "humidity_min": 40},
    "Bacterial Spot": {"temp_range": (24, 30), "humidity_min": 85},
}


def _env_risk_score(disease: str, temperature: float, humidity: float) -> float:
    """Returns 0.0–1.0 indicating how favorable conditions are for this disease."""
    thresholds = ENV_THRESHOLDS.get(disease, {})
    score = 0.0

    t_min, t_max = thresholds.get("temp_range", (0, 100))
    h_min = thresholds.get("humidity_min", 0)

    temp_ok = t_min <= temperature <= t_max
    humid_ok = humidity >= h_min

    if temp_ok and humid_ok:
        score = 0.8
    elif temp_ok or humid_ok:
        score = 0.4
    else:
        score = 0.1

    return score


def compute_disease_risk_from_pipeline(
    pipeline_result: Dict[str, Any],
    sensor_readings: List[Dict],
) -> Dict[str, Any]:
    """
    Computes full disease risk from bioinformatics pipeline output + sensor data.
    
    Returns:
        {
          "overall_risk_score": float (0-100),
          "overall_risk_level": str,
          "disease_scores": [...],
          "contributing_factors": [...],
          "method": str
        }
    """
    disease_profile = {
        d["condition"]: d
        for d in pipeline_result.get("disease_susceptibility_profile", [])
    }

    # Latest sensor reading
    temp = 25.0
    humidity = 60.0
    soil_moisture = 50.0
    light = 500.0
    if sensor_readings:
        latest = sensor_readings[-1]
        temp = latest.get("temperature") or latest.get("temperatureC") or 25.0
        humidity = latest.get("humidity") or latest.get("humidityPct") or 60.0
        soil_moisture = latest.get("soil_moisture") or 50.0
        light = latest.get("light") or 500.0

    disease_scores = []
    contributing_factors = []
    all_scores = []

    for disease in DISEASES:
        dp = disease_profile.get(disease)

        # Genomic component
        genomic_protection = 0.5  # default neutral
        evidence_level = "NO_EVIDENCE"
        genomic_phenotype = "UNKNOWN"
        if dp:
            genomic_protection = dp.get("genomic_protection_score", 0.5) or 0.5
            evidence_level = dp.get("evidence_level", "NO_EVIDENCE")
            genomic_phenotype = dp.get("phenotype", "UNKNOWN")

        # Genomic susceptibility: 1 - protection, normalized to 0-100
        genomic_susceptibility = (1.0 - min(max(genomic_protection, 0.0), 1.0)) * 100

        # Environmental component (0-100)
        env_factor = _env_risk_score(disease, temp, humidity) * 100

        # Resistance gene counts for ML
        actionable = pipeline_result.get("actionable_variants", [])
        resistance_count = sum(
            1 for v in actionable
            if v.get("allele_classification") == "RESISTANT_ALLELE"
            and any(
                a.get("target_condition") == disease
                for a in v.get("associations", [])
            )
        )
        susceptibility_count = sum(
            1 for v in actionable
            if v.get("allele_classification") == "SUSCEPTIBLE_ALLELE"
            and any(
                a.get("target_condition") == disease
                for a in v.get("associations", [])
            )
        )

        # Combined rule-based score: 60% genomic, 40% environmental
        combined_score = round(0.60 * genomic_susceptibility + 0.40 * env_factor, 1)

        # ML prediction
        ml_predicted_level = None
        ml_confidence = None
        ml_reasoning = None

        if ML_AVAILABLE:
            try:
                ml_result = predict_risk_ml(
                    disease=disease,
                    resistance_gene_count=resistance_count,
                    susceptibility_gene_count=susceptibility_count,
                    temperature=temp,
                    humidity=humidity,
                    soil_moisture=soil_moisture,
                    light=light,
                )
                ml_predicted_level = ml_result.get("predicted_risk_level")
                ml_confidence = ml_result.get("confidence")
                ml_reasoning = ml_result.get("reasoning")
            except Exception:
                pass

        # Risk level classification
        if combined_score >= 65:
            risk_level = "high"
        elif combined_score >= 35:
            risk_level = "moderate"
        else:
            risk_level = "low"

        all_scores.append(combined_score)

        ds = {
            "disease": disease,
            "risk_score": combined_score,
            "risk_level": risk_level,
            "confidence": "Moderate" if evidence_level != "NO_EVIDENCE" else "Low",
            "genomic_protection_score": genomic_protection,
            "genomic_phenotype": genomic_phenotype,
            "ml_predicted_level": ml_predicted_level,
            "ml_confidence": ml_confidence,
            "ml_reasoning": ml_reasoning,
            "evidence_level": evidence_level,
        }
        disease_scores.append(ds)

        # Contributing factors
        if dp:
            contributing_factors.append({
                "type": "genomic",
                "label": f"{dp.get('gene_symbol', 'Unknown gene')} — {genomic_phenotype.replace('_', ' ').title()}",
                "detail": f"Genomic protection score: {genomic_protection:.2f}",
                "weight": round(0.60 * genomic_susceptibility / 100, 2),
            })

        contributing_factors.append({
            "type": "environmental",
            "label": f"{disease} — Environmental risk",
            "detail": f"Temperature: {temp}°C, Humidity: {humidity}%",
            "weight": round(0.40 * env_factor / 100, 2),
        })

    # Overall score = max disease score (worst case)
    overall_score = round(max(all_scores), 1) if all_scores else 50.0
    if overall_score >= 65:
        overall_level = "high"
    elif overall_score >= 35:
        overall_level = "moderate"
    else:
        overall_level = "low"

    method = "rule_ml_combined" if ML_AVAILABLE else "rule_based"

    return {
        "overall_risk_score": overall_score,
        "overall_risk_level": overall_level,
        "disease_scores": disease_scores,
        "contributing_factors": contributing_factors,
        "method": method,
    }
