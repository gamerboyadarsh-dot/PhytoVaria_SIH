from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant, SensorReading
from app.schemas import SensorReadingCreate, SensorReadingRead

router = APIRouter(prefix="/plants", tags=["sensor"])


@router.post("/{plant_id}/sensor", response_model=SensorReadingRead)
def add_sensor_reading(
    plant_id: int, payload: SensorReadingCreate, session: Session = Depends(get_session)
):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    record = SensorReading(
        plant_id=plant_id,
        sensor_type=payload.sensor_type,
        value=payload.value,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("/{plant_id}/sensor", response_model=list[SensorReadingRead])
def get_sensor_readings(plant_id: int, session: Session = Depends(get_session)):
    return session.exec(
        select(SensorReading).where(SensorReading.plant_id == plant_id)
    ).all()
