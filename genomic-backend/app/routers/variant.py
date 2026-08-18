import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant
from app.schemas import VariantRead

router = APIRouter(prefix="/plants", tags=["variants"])


@router.get("/{plant_id}/variants")
def get_variants(plant_id: int, session: Session = Depends(get_session)):
    uploads = session.exec(
        select(VCFUpload).where(VCFUpload.plant_id == plant_id)
    ).all()
    upload_ids = [u.id for u in uploads]
    if not upload_ids:
        return []

    variants = session.exec(
        select(Variant).where(Variant.vcf_upload_id.in_(upload_ids))
    ).all()

    return [
        {
            "id": v.id,
            "chrom": v.chrom,
            "pos": v.pos,
            "ref": v.ref,
            "alt": v.alt,
            "gene_symbol": v.gene_symbol,
            "gene_id": v.gene_id,
            "consequence": v.consequence,
            "protein_change": v.protein_change,
            "variant_type": v.variant_type,
            "match_status": v.match_status,
            "allele_classification": v.allele_classification,
            "inferred_phenotype": v.inferred_phenotype,
            "evidence_level": v.evidence_level,
            "confidence_level": v.confidence_level,
            "genomic_protection_score": v.genomic_protection_score,
            "interpretation": v.interpretation,
            "associations": json.loads(v.associations_json) if v.associations_json else [],
        }
        for v in variants
    ]
