from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant, RiskAssessment
from app.schemas import RiskRead
from app.services.risk_engine import compute_risk

router = APIRouter(prefix="/plants", tags=["risk"])


@router.post("/{plant_id}/risk", response_model=RiskRead)
def compute_plant_risk(plant_id: int, session: Session = Depends(get_session)):
    """Computes risk from the plant's already-interpreted variants."""
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    uploads = session.exec(
        select(VCFUpload).where(VCFUpload.plant_id == plant_id)
    ).all()
    upload_ids = [u.id for u in uploads]
    variants = []
    if upload_ids:
        variants = session.exec(
            select(Variant).where(Variant.vcf_upload_id.in_(upload_ids))
        ).all()
    if not variants:
        raise HTTPException(status_code=404, detail="No interpreted variants yet — run /interpret first")

    variant_dicts = [{"classification": v.classification} for v in variants]
    result = compute_risk(variant_dicts)

    record = RiskAssessment(
        plant_id=plant_id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/{plant_id}/risk", response_model=RiskRead)
def get_latest_risk(plant_id: int, session: Session = Depends(get_session)):
    record = session.exec(
        select(RiskAssessment)
        .where(RiskAssessment.plant_id == plant_id)
        .order_by(RiskAssessment.computed_at.desc())
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="No risk assessment yet")
    return record
