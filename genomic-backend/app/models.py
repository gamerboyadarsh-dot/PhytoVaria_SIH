"""
Core DB tables for PhytoVaria.
Pipeline: Plant → VCF → Variant (annotated) → RiskAssessment → SensorReading → Report
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Plant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    species: Optional[str] = "Solanum lycopersicum"
    variety: Optional[str] = None
    location: Optional[str] = None
    sample_source: Optional[str] = None
    collection_date: Optional[str] = None
    notes: Optional[str] = None
    status: str = Field(default="registered")  # registered | vcf_uploaded | analyzed
    registered_at: datetime = Field(default_factory=datetime.utcnow)


class VCFUpload(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    filename: str
    raw_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="uploaded")  # uploaded | parsed | interpreted
    total_variants: Optional[int] = None
    kb_matches: Optional[int] = None
    pipeline_result_json: Optional[str] = None  # full bioinformatics output


class Variant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vcf_upload_id: int = Field(foreign_key="vcfupload.id")
    chrom: str
    pos: int
    ref: str
    alt: str
    gene_symbol: Optional[str] = None
    gene_id: Optional[str] = None
    consequence: Optional[str] = None
    protein_change: Optional[str] = None
    variant_type: Optional[str] = None
    match_status: Optional[str] = None   # EXACT_MATCH | NOVEL_ALLELE_AT_LOCUS | UNKNOWN_INSUFFICIENT_EVIDENCE
    allele_classification: Optional[str] = None  # RESISTANT_ALLELE | SUSCEPTIBLE_ALLELE | UNKNOWN
    inferred_phenotype: Optional[str] = None
    evidence_level: Optional[str] = None
    confidence_level: Optional[str] = None
    genomic_protection_score: Optional[float] = None
    interpretation: Optional[str] = None
    associations_json: Optional[str] = None  # JSON string of associations list
    citations_json: Optional[str] = None


class RiskAssessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    risk_score: float         # 0–100 overall susceptibility score
    risk_level: str           # low | moderate | high
    confidence: Optional[str] = "Moderate"
    method: Optional[str] = "rule_ml_combined"
    disease_scores_json: Optional[str] = None  # JSON: per-disease breakdown
    explanation_json: Optional[str] = None      # JSON: contributing factors
    computed_at: datetime = Field(default_factory=datetime.utcnow)


class SensorReading(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    soil_moisture: Optional[float] = None
    light: Optional[float] = None
    source: str = Field(default="demo")  # demo | esp32
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
