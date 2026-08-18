from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant, RiskAssessment, SensorReading
from app.services.report_builder import build_report

router = APIRouter(prefix="/plants", tags=["report"])


@router.get("/{plant_id}/report")
def get_report(plant_id: int, session: Session = Depends(get_session)):
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

    risk = session.exec(
        select(RiskAssessment)
        .where(RiskAssessment.plant_id == plant_id)
        .order_by(RiskAssessment.computed_at.desc())
    ).first()

    sensor_readings = session.exec(
        select(SensorReading).where(SensorReading.plant_id == plant_id)
    ).all()

    return build_report(
        plant=plant.dict(),
        variants=[v.dict() for v in variants],
        risk=risk.dict() if risk else None,
        sensor_readings=[s.dict() for s in sensor_readings],
    )
