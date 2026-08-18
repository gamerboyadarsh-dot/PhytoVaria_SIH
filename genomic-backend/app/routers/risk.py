import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant, RiskAssessment, SensorReading
from app.schemas import RiskRead, DiseaseScore, ExplanationFactor

router = APIRouter(prefix="/plants", tags=["risk"])


def _parse_risk_record(record: RiskAssessment) -> dict:
    """Parses JSON fields back to structured data."""
    disease_scores = []
    contributing_factors = []

    if record.disease_scores_json:
        try:
            disease_scores = [DiseaseScore(**d) for d in json.loads(record.disease_scores_json)]
        except Exception:
            pass

    if record.explanation_json:
        try:
            contributing_factors = [ExplanationFactor(**f) for f in json.loads(record.explanation_json)]
        except Exception:
            pass

    return {
        "id": record.id,
        "plant_id": record.plant_id,
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "confidence": record.confidence,
        "method": record.method,
        "disease_scores": disease_scores,
        "contributing_factors": contributing_factors,
        "computed_at": record.computed_at,
    }


@router.get("/{plant_id}/risk")
@router.get("/{plant_id}/risk-assessment")   # frontend alias
def get_latest_risk(plant_id: int, session: Session = Depends(get_session)):
    record = session.exec(
        select(RiskAssessment)
        .where(RiskAssessment.plant_id == plant_id)
        .order_by(RiskAssessment.computed_at.desc())
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="No risk assessment found. Run POST /plants/{id}/analyze first.")
    return _parse_risk_record(record)


@router.post("/{plant_id}/risk-assessment/run")
@router.post("/{plant_id}/risk/run")
def run_risk_assessment(plant_id: int, session: Session = Depends(get_session)):
    """Alias that triggers re-analysis of the plant. Delegates to analyze endpoint logic."""
    from app.routers.analysis import analyze_plant
    return analyze_plant(plant_id=plant_id, session=session)
