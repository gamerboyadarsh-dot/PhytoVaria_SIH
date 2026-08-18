from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel


# ──────────────────────── Plant ────────────────────────

class PlantCreate(BaseModel):
    name: str
    species: Optional[str] = "Solanum lycopersicum"
    variety: Optional[str] = None
    location: Optional[str] = None
    sample_source: Optional[str] = None
    collection_date: Optional[str] = None
    notes: Optional[str] = None


class PlantRead(BaseModel):
    id: int
    name: str
    species: Optional[str]
    variety: Optional[str]
    location: Optional[str]
    sample_source: Optional[str]
    collection_date: Optional[str]
    notes: Optional[str]
    status: str
    registered_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── VCF Upload ────────────────────────

class VCFUploadRead(BaseModel):
    id: int
    plant_id: int
    filename: str
    status: str
    uploaded_at: datetime
    total_variants: Optional[int]
    kb_matches: Optional[int]

    class Config:
        from_attributes = True


# ──────────────────────── Variant ────────────────────────

class VariantRead(BaseModel):
    id: int
    chrom: str
    pos: int
    ref: str
    alt: str
    gene_symbol: Optional[str]
    gene_id: Optional[str]
    consequence: Optional[str]
    protein_change: Optional[str]
    variant_type: Optional[str]
    match_status: Optional[str]
    allele_classification: Optional[str]
    inferred_phenotype: Optional[str]
    evidence_level: Optional[str]
    confidence_level: Optional[str]
    genomic_protection_score: Optional[float]
    interpretation: Optional[str]

    class Config:
        from_attributes = True


# ──────────────────────── Risk Assessment ────────────────────────

class DiseaseScore(BaseModel):
    disease: str
    risk_score: float       # 0–100
    risk_level: str         # low | moderate | high
    confidence: str
    genomic_protection_score: Optional[float] = None
    ml_predicted_level: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_reasoning: Optional[str] = None
    evidence_level: Optional[str] = None


class ExplanationFactor(BaseModel):
    type: str               # genomic | environmental | ml
    label: str
    detail: Optional[str] = None
    weight: Optional[float] = None


class RiskRead(BaseModel):
    id: int
    plant_id: int
    risk_score: float
    risk_level: str
    confidence: Optional[str]
    method: Optional[str]
    disease_scores: Optional[List[DiseaseScore]] = None
    contributing_factors: Optional[List[ExplanationFactor]] = None
    computed_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── Sensor ────────────────────────

class SensorReadingCreate(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_moisture: Optional[float] = None
    light: Optional[float] = None
    source: Optional[str] = "esp32"


class SensorReadingRead(BaseModel):
    id: int
    plant_id: int
    temperature: Optional[float]
    humidity: Optional[float]
    soil_moisture: Optional[float]
    light: Optional[float]
    source: str
    recorded_at: datetime

    class Config:
        from_attributes = True


# ──────────────────────── Analysis (pipeline result) ────────────────────────

class AnalysisResultRead(BaseModel):
    status: str
    pipeline_version: str
    sample_id: str
    reference_genome: str
    summary: Dict[str, Any]
    disease_susceptibility_profile: List[Dict[str, Any]]
    annotated_variants: List[Dict[str, Any]]
    actionable_variants: List[Dict[str, Any]]
    unknown_variants_sample: List[Dict[str, Any]]


# ──────────────────────── Report ────────────────────────

class ReportRead(BaseModel):
    plant: PlantRead
    vcf_summary: Optional[Dict[str, Any]] = None
    variant_summary: Dict[str, Any]
    disease_profile: Optional[List[Dict[str, Any]]] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    sensor_summary: Dict[str, Any]
    methodology: str
    limitations: str
    generated_at: datetime
