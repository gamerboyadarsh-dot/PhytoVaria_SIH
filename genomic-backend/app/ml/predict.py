"""
Loads trained models and provides predictions with confidence + a plain
explanation of which features drove the prediction (via feature importance,
not a false claim of causal certainty).

Usage from backend:
    from ml.predict import predict_risk_ml
    result = predict_risk_ml("Fusarium Wilt", resistance_gene_count=2,
                              temperature=26, humidity=85, soil_moisture=55, light=600)
"""
import os
import joblib
import numpy as np
import pandas as pd

HERE = os.path.dirname(__file__)
MODELS_DIR = os.path.join(HERE, "models")
FEATURES = [
    "resistance_gene_count", "susceptibility_gene_count", "evidence_strength_score",
    "temperature", "humidity", "soil_moisture", "light",
]

_FEATURE_LABELS = {
    "resistance_gene_count": "number of resistance genes detected",
    "susceptibility_gene_count": "number of susceptibility genes detected",
    "evidence_strength_score": "overall genomic evidence strength",
    "temperature": "temperature",
    "humidity": "humidity",
    "soil_moisture": "soil moisture",
    "light": "light level",
}

_model_cache = {}


def _load_model(disease: str):
    if disease not in _model_cache:
        path = os.path.join(MODELS_DIR, f"{disease.replace(' ', '_')}_model.joblib")
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"No trained model for '{disease}' at {path}. Run train_model.py first."
            )
        _model_cache[disease] = joblib.load(path)
    return _model_cache[disease]


def _build_reasoning(disease: str, prediction: str, top_feature: str,
                      resistance_gene_count: int, susceptibility_gene_count: int) -> str:
    """Plain-English sentence explaining WHY, not just WHAT -- this is the
    piece that actually answers 'is it highly susceptible and why' for a
    judge or a dashboard user, instead of a bare label + number."""
    genomic_bits = [f"{resistance_gene_count} resistance gene(s)"]
    if susceptibility_gene_count:
        genomic_bits.append(f"{susceptibility_gene_count} susceptibility gene(s)")
    genomic_summary = ", ".join(genomic_bits)

    return (
        f"Model predicts {prediction} risk for {disease}, driven primarily by "
        f"{_FEATURE_LABELS.get(top_feature, top_feature)}. "
        f"Genomic profile: {genomic_summary}."
    )


def predict_risk_ml(disease: str, resistance_gene_count: int, temperature: float,
                     humidity: float, soil_moisture: float, light: float,
                     susceptibility_gene_count: int = 0,
                     evidence_strength_score: float = None) -> dict:
    """
    NOTE for backend integration (main.py): the two new keyword args
    (susceptibility_gene_count, evidence_strength_score) are optional with
    safe defaults so this stays backward-compatible with the current call
    site. For full accuracy, main.py should be updated to pass real values
    computed from matched_evidence -- see ml/README.md integration section.
    If evidence_strength_score isn't passed, we approximate it from the
    gene counts using the rule engine's own "moderate" weight (0.6) as a
    reasonable default -- clearly a fallback, not a claim of precision.
    """
    if evidence_strength_score is None:
        evidence_strength_score = round(
            -0.6 * resistance_gene_count + 0.6 * susceptibility_gene_count, 3
        )

    model = _load_model(disease)
    X = pd.DataFrame(
        [[resistance_gene_count, susceptibility_gene_count, evidence_strength_score,
          temperature, humidity, soil_moisture, light]],
        columns=FEATURES,
    )

    prediction = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    classes = model.classes_
    confidence = float(max(proba))

    importances = dict(zip(FEATURES, model.feature_importances_.round(3)))
    top_feature = max(importances, key=importances.get)

    reasoning = _build_reasoning(
        disease, prediction, top_feature, resistance_gene_count, susceptibility_gene_count
    )

    return {
        "disease": disease,
        "predicted_risk_level": prediction,
        "confidence": round(confidence, 3),
        "class_probabilities": {c: round(float(p), 3) for c, p in zip(classes, proba)},
        "most_influential_feature": top_feature,
        "reasoning": reasoning,
        "note": (
            "This is a student model of our rule engine, not an independently "
            "validated real-world predictor -- see ml/models/training_report.md"
        ),
    }


if __name__ == "__main__":
    # quick smoke test
    example = predict_risk_ml(
        "Fusarium Wilt",
        resistance_gene_count=2,
        susceptibility_gene_count=0,
        temperature=26, humidity=85, soil_moisture=55, light=600,
    )
    import json
    print(json.dumps(example, indent=2))
