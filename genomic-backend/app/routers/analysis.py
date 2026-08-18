"""
Analysis router — runs the full bioinformatics pipeline on a plant's uploaded VCF.
POST /plants/{id}/analyze  → runs pipeline, stores results, returns structured output.
GET  /plants/{id}/disease-associations → returns disease profile from last analysis.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, VCFUpload, Variant, RiskAssessment, SensorReading
from app.services.vcf_parser import run_vcf_pipeline
from app.services.risk_engine import compute_disease_risk_from_pipeline

router = APIRouter(prefix="/plants", tags=["analysis"])


@router.post("/{plant_id}/analyze")
def analyze_plant(plant_id: int, session: Session = Depends(get_session)):
    """
    Full pipeline: VCF parse → bioinformatics annotation → KB matching → risk engine.
    Stores all results in the database. Returns the full analysis output.
    """
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    # Get latest VCF upload
    upload = session.exec(
        select(VCFUpload)
        .where(VCFUpload.plant_id == plant_id)
        .order_by(VCFUpload.uploaded_at.desc())
    ).first()
    if not upload:
        raise HTTPException(status_code=404, detail="No VCF uploaded for this plant. Upload a VCF first.")

    # Run the bioinformatics pipeline
    pipeline_result = run_vcf_pipeline(upload.raw_path, sample_id=f"plant_{plant_id}")

    if pipeline_result.get("status") == "ERROR":
        raise HTTPException(status_code=500, detail=pipeline_result.get("error", "Pipeline error"))

    # Get latest sensor readings for risk calculation
    sensor_readings = session.exec(
        select(SensorReading)
        .where(SensorReading.plant_id == plant_id)
        .order_by(SensorReading.recorded_at.desc())
    ).all()
    sensor_dicts = [
        {
            "temperature": s.temperature,
            "humidity": s.humidity,
            "soil_moisture": s.soil_moisture,
            "light": s.light,
        }
        for s in sensor_readings
    ]

    # Compute risk assessment
    risk_result = compute_disease_risk_from_pipeline(pipeline_result, sensor_dicts)

    # Store pipeline result in VCFUpload record
    summary = pipeline_result.get("summary", {})
    upload.total_variants = summary.get("total_vcf_variants", 0)
    upload.kb_matches = summary.get("exact_knowledge_base_matches", 0)
    upload.status = "interpreted"
    upload.pipeline_result_json = json.dumps(pipeline_result, default=str)
    session.add(upload)

    # Store annotated variants
    # First delete old variants for this upload
    old_variants = session.exec(
        select(Variant).where(Variant.vcf_upload_id == upload.id)
    ).all()
    for v in old_variants:
        session.delete(v)

    for v_dict in pipeline_result.get("annotated_variants", []):
        variant = Variant(
            vcf_upload_id=upload.id,
            chrom=v_dict.get("chrom", "?"),
            pos=v_dict.get("pos", 0),
            ref=v_dict.get("ref", "?"),
            alt=v_dict.get("alt", "?"),
            gene_symbol=v_dict.get("gene_symbol"),
            gene_id=v_dict.get("gene_id"),
            consequence=v_dict.get("consequence"),
            protein_change=v_dict.get("protein_change"),
            variant_type=v_dict.get("variant_type"),
            match_status=v_dict.get("match_status"),
            allele_classification=v_dict.get("allele_classification"),
            inferred_phenotype=v_dict.get("inferred_phenotype"),
            evidence_level=v_dict.get("evidence_level"),
            confidence_level=v_dict.get("confidence_level"),
            genomic_protection_score=v_dict.get("genomic_protection_score"),
            interpretation=v_dict.get("interpretation"),
            associations_json=json.dumps(v_dict.get("associations", [])),
            citations_json=json.dumps(v_dict.get("citations", [])),
        )
        session.add(variant)

    # Store risk assessment
    disease_scores = risk_result.get("disease_scores", [])
    contributing_factors = risk_result.get("contributing_factors", [])

    risk_record = RiskAssessment(
        plant_id=plant_id,
        risk_score=risk_result["overall_risk_score"],
        risk_level=risk_result["overall_risk_level"],
        confidence="Moderate",
        method=risk_result.get("method", "rule_based"),
        disease_scores_json=json.dumps(disease_scores),
        explanation_json=json.dumps(contributing_factors),
    )
    session.add(risk_record)

    # Update plant status
    plant.status = "analyzed"
    session.add(plant)

    session.commit()

    # Return enriched response
    return {
        "status": "SUCCESS",
        "plant_id": plant_id,
        "pipeline": pipeline_result,
        "risk": risk_result,
    }


@router.get("/{plant_id}/disease-associations")
def get_disease_associations(plant_id: int, session: Session = Depends(get_session)):
    """
    Returns disease susceptibility profile from the most recent VCF analysis.
    """
    upload = session.exec(
        select(VCFUpload)
        .where(VCFUpload.plant_id == plant_id)
        .order_by(VCFUpload.uploaded_at.desc())
    ).first()

    if not upload or not upload.pipeline_result_json:
        raise HTTPException(
            status_code=404,
            detail="No analysis found for this plant. Run POST /plants/{id}/analyze first."
        )

    try:
        pipeline_result = json.loads(upload.pipeline_result_json)
        return {
            "plant_id": plant_id,
            "disease_susceptibility_profile": pipeline_result.get("disease_susceptibility_profile", []),
            "summary": pipeline_result.get("summary", {}),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not parse stored analysis: {e}")
