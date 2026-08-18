from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Plant
from app.schemas import PlantCreate, PlantRead

router = APIRouter(prefix="/plants", tags=["plants"])


@router.post("/", response_model=PlantRead)
def register_plant(payload: PlantCreate, session: Session = Depends(get_session)):
    plant = Plant(name=payload.name, species=payload.species)
    session.add(plant)
    session.commit()
    session.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantRead)
def get_plant(plant_id: int, session: Session = Depends(get_session)):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


@router.get("/", response_model=list[PlantRead])
def list_plants(session: Session = Depends(get_session)):
    return session.exec(select(Plant)).all()
