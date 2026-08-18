import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session

from app.database import get_session
from app.models import Plant, VCFUpload
from app.schemas import VCFUploadRead

router = APIRouter(prefix="/plants", tags=["vcf"])

UPLOAD_DIR = "uploaded_vcfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{plant_id}/vcf", response_model=VCFUploadRead)
async def upload_vcf(plant_id: int, file: UploadFile = File(...), session: Session = Depends(get_session)):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    save_path = os.path.join(UPLOAD_DIR, f"plant_{plant_id}_{file.filename}")
    with open(save_path, "wb") as f:
        f.write(await file.read())

    record = VCFUpload(
        plant_id=plant_id,
        filename=file.filename,
        raw_path=save_path,
        status="uploaded",
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record
