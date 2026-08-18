from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class PlantCreate(BaseModel):
    name: str
    species: Optional[str] = None


class PlantRead(BaseModel):
    id: int
    name: str
    species: Optional[str]
    registered_at: datetime


class VCFUploadRead(BaseModel):
    id: int
    plant_id: int
    filename: str
    status: str
    uploaded_at: datetime


class VariantRead(BaseModel):
    id: int
    chrom: str
    pos: int
    ref: str
    alt: str
    classification: Optional[str]
    confidence: Optional[float]


class RiskRead(BaseModel):
    id: int
    plant_id: int
    risk_score: float
    risk_level: str
    computed_at: datetime


class SensorReadingCreate(BaseModel):
    sensor_type: str
    value: float


class SensorReadingRead(BaseModel):
    id: int
    plant_id: int
    sensor_type: str
    value: float
    recorded_at: datetime


class ReportRead(BaseModel):
    plant: PlantRead
    variant_summary: dict
    risk_assessment: Optional[dict]
    sensor_summary: dict
