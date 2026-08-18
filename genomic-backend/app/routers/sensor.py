from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, SensorReading
from app.schemas import SensorReadingCreate, SensorReadingRead

router = APIRouter(prefix="/plants", tags=["sensor"])


@router.post("/{plant_id}/sensor", response_model=SensorReadingRead)
@router.post("/{plant_id}/sensor-data", response_model=SensorReadingRead)  # IoT alias
def add_sensor_reading(
    plant_id: int,
    payload: SensorReadingCreate,
    session: Session = Depends(get_session),
):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    record = SensorReading(
        plant_id=plant_id,
        temperature=payload.temperature,
        humidity=payload.humidity,
        soil_moisture=payload.soil_moisture,
        light=payload.light,
        source=payload.source or "esp32",
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/{plant_id}/sensor", response_model=list[SensorReadingRead])
@router.get("/{plant_id}/sensor-readings", response_model=list[SensorReadingRead])   # frontend alias
def get_sensor_readings(plant_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(SensorReading)
        .where(SensorReading.plant_id == plant_id)
        .order_by(SensorReading.recorded_at.desc())
    ).all()


@router.post("/sensor", response_model=SensorReadingRead)  # Generic ESP32 endpoint (no plant_id)
def add_generic_sensor_reading(
    payload: SensorReadingCreate,
    session: Session = Depends(get_session),
):
    """
    ESP32 sends to /sensor without a plant_id.
    Stores reading linked to plant_id=1 by default (first registered plant).
    """
    # Find first available plant
    plant = session.exec(select(Plant)).first()
    if not plant:
        raise HTTPException(status_code=404, detail="No plants registered yet. Register a plant first.")

    record = SensorReading(
        plant_id=plant.id,
        temperature=payload.temperature,
        humidity=payload.humidity,
        soil_moisture=payload.soil_moisture,
        light=payload.light,
        source=payload.source or "esp32",
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record
