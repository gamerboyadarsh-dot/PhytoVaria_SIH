"""
Core DB tables. Add fields as the team's requirements firm up —
these cover the minimum needed to make the pipeline (VCF -> Variant ->
Risk -> Sensor -> Report) connect end to end.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Plant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    species: Optional[str] = None
    registered_at: datetime = Field(default_factory=datetime.utcnow)


class VCFUpload(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    filename: str
    raw_path: str  # where the uploaded file is stored on disk
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="uploaded")  # uploaded -> parsed -> interpreted


class Variant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vcf_upload_id: int = Field(foreign_key="vcfupload.id")
    chrom: str
    pos: int
    ref: str
    alt: str
    classification: Optional[str] = None  # filled in by variant interpretation, Day 3
    confidence: Optional[float] = None


class RiskAssessment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    risk_score: float
    risk_level: str  # e.g. "low" / "moderate" / "high"
    computed_at: datetime = Field(default_factory=datetime.utcnow)


class SensorReading(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    plant_id: int = Field(foreign_key="plant.id")
    sensor_type: str  # e.g. "soil_moisture", "temperature"
    value: float
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
