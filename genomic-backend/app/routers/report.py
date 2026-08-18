import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant, RiskAssessment, SensorReading

router = APIRouter(prefix="/plants", tags=["report"])


@router.get("/{plant_id}/report")
def get_report(plant_id: int, session: Session = Depends(get_session)):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    # VCF uploads
    uploads = session.exec(
        select(VCFUpload).where(VCFUpload.plant_id == plant_id)
        .order_by(VCFUpload.uploaded_at.desc())
    ).all()

    latest_upload = uploads[0] if uploads else None
    pipeline_result = None
    if latest_upload and latest_upload.pipeline_result_json:
        try:
            pipeline_result = json.loads(latest_upload.pipeline_result_json)
        except Exception:
            pass

    # Variants
    upload_ids = [u.id for u in uploads]
    variants = []
    if upload_ids:
        variants = session.exec(
            select(Variant).where(Variant.vcf_upload_id.in_(upload_ids))
        ).all()

    # Risk assessment
    risk = session.exec(
        select(RiskAssessment)
        .where(RiskAssessment.plant_id == plant_id)
        .order_by(RiskAssessment.computed_at.desc())
    ).first()

    risk_data = None
    if risk:
        disease_scores = []
        contributing_factors = []
        if risk.disease_scores_json:
            try:
                disease_scores = json.loads(risk.disease_scores_json)
            except Exception:
                pass
        if risk.explanation_json:
            try:
                contributing_factors = json.loads(risk.explanation_json)
            except Exception:
                pass
        risk_data = {
            "risk_score": risk.risk_score,
            "risk_level": risk.risk_level,
            "confidence": risk.confidence,
            "method": risk.method,
            "disease_scores": disease_scores,
            "contributing_factors": contributing_factors,
            "computed_at": risk.computed_at.isoformat() if risk.computed_at else None,
        }

    # Sensor readings
    sensor_readings = session.exec(
        select(SensorReading)
        .where(SensorReading.plant_id == plant_id)
        .order_by(SensorReading.recorded_at.desc())
    ).all()

    # Variant summary
    known_count = sum(1 for v in variants if v.match_status == "EXACT_MATCH")
    novel_count = sum(1 for v in variants if v.match_status == "NOVEL_ALLELE_AT_LOCUS")
    unknown_count = sum(1 for v in variants if v.match_status == "UNKNOWN_INSUFFICIENT_EVIDENCE")
    resistant_count = sum(1 for v in variants if v.allele_classification == "RESISTANT_ALLELE")
    susceptible_count = sum(1 for v in variants if v.allele_classification == "SUSCEPTIBLE_ALLELE")

    key_variants = [
        {
            "chrom": v.chrom,
            "pos": v.pos,
            "ref": v.ref,
            "alt": v.alt,
            "gene_symbol": v.gene_symbol,
            "consequence": v.consequence,
            "protein_change": v.protein_change,
            "match_status": v.match_status,
            "allele_classification": v.allele_classification,
            "inferred_phenotype": v.inferred_phenotype,
            "evidence_level": v.evidence_level,
            "interpretation": v.interpretation,
        }
        for v in variants
        if v.match_status in ("EXACT_MATCH", "NOVEL_ALLELE_AT_LOCUS")
    ]

    # Latest sensor
    latest_sensor = None
    if sensor_readings:
        s = sensor_readings[0]
        latest_sensor = {
            "temperature": s.temperature,
            "humidity": s.humidity,
            "soil_moisture": s.soil_moisture,
            "light": s.light,
            "source": s.source,
            "recorded_at": s.recorded_at.isoformat() if s.recorded_at else None,
        }

    return {
        "generated_at": datetime.utcnow().isoformat(),
        "plant": {
            "id": plant.id,
            "name": plant.name,
            "species": plant.species,
            "variety": plant.variety,
            "location": plant.location,
            "sample_source": plant.sample_source,
            "collection_date": plant.collection_date,
            "notes": plant.notes,
            "status": plant.status,
            "registered_at": plant.registered_at.isoformat() if plant.registered_at else None,
        },
        "vcf_summary": {
            "filename": latest_upload.filename if latest_upload else None,
            "uploaded_at": latest_upload.uploaded_at.isoformat() if latest_upload else None,
            "total_variants": latest_upload.total_variants if latest_upload else 0,
            "kb_matches": latest_upload.kb_matches if latest_upload else 0,
            "reference_genome": pipeline_result.get("reference_genome") if pipeline_result else "Solanum lycopersicum SL4.0",
        },
        "variant_summary": {
            "total": len(variants),
            "exact_matches": known_count,
            "novel_at_locus": novel_count,
            "unknown": unknown_count,
            "resistant_alleles": resistant_count,
            "susceptible_alleles": susceptible_count,
            "key_variants": key_variants,
        },
        "disease_profile": pipeline_result.get("disease_susceptibility_profile", []) if pipeline_result else [],
        "risk_assessment": risk_data,
        "sensor_summary": {
            "total_readings": len(sensor_readings),
            "latest": latest_sensor,
        },
        "methodology": (
            "PhytoVaria uses a rule-based + ML-combined genomic interpretation pipeline. "
            "Variants are matched against a curated knowledge base of validated tomato resistance genes "
            "(Tm-2²/ToMV, I-2/Fusarium, Ty-1/TYLCV, Ph-3/Late Blight, Ve1/Verticillium etc.) "
            "sourced from peer-reviewed literature. Environmental data from ESP32/DHT sensors "
            "is integrated for contextual disease risk assessment. "
            "ML (Random Forest) models trained on rule-derived labels provide supplementary signals."
        ),
        "limitations": (
            "This is a computational prototype using curated public genomic data. "
            "The ML models are trained on synthetic rule-derived labels, not field-validated data. "
            "Risk scores are susceptibility indicators, NOT guaranteed probabilities. "
            "Unknown variants (not in the KB) are classified as Insufficient Evidence, not harmful. "
            "Real clinical genomic validation requires sequencing of actual field samples and "
            "validated phenotypic studies."
        ),
    }
