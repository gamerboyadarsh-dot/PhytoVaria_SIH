from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant
from app.schemas import VariantRead
from app.services.vcf_parser import parse_vcf
from app.services.variant_interpreter import classify_variants

router = APIRouter(prefix="/plants", tags=["variants"])


@router.post("/{plant_id}/interpret", response_model=list[VariantRead])
def interpret_variants(plant_id: int, session: Session = Depends(get_session)):
    """
    Parses the plant's most recent VCF upload, classifies each variant,
    and stores the results. Run this after /plants/{id}/vcf.
    """
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    upload = session.exec(
        select(VCFUpload)
        .where(VCFUpload.plant_id == plant_id)
        .order_by(VCFUpload.uploaded_at.desc())
    ).first()
    if not upload:
        raise HTTPException(status_code=404, detail="No VCF uploaded for this plant yet")

    raw_variants = parse_vcf(upload.raw_path)
    classified = classify_variants(raw_variants)

    stored = []
    for v in classified:
        record = Variant(
            vcf_upload_id=upload.id,
            chrom=v["chrom"],
            pos=v["pos"],
            ref=v["ref"],
            alt=v["alt"],
            classification=v["classification"],
            confidence=v["confidence"],
        )
        session.add(record)
        stored.append(record)

    upload.status = "interpreted"
    session.add(upload)
    session.commit()
    for r in stored:
        session.refresh(r)
    return stored


@router.get("/{plant_id}/variants", response_model=list[VariantRead])
def get_variants(plant_id: int, session: Session = Depends(get_session)):
    uploads = session.exec(
        select(VCFUpload).where(VCFUpload.plant_id == plant_id)
    ).all()
    upload_ids = [u.id for u in uploads]
    if not upload_ids:
        return []
    return session.exec(
        select(Variant).where(Variant.vcf_upload_id.in_(upload_ids))
    ).all()
