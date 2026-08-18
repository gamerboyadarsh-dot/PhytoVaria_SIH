import json
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session

from app.database import get_session
from app.models import Plant, VCFUpload
from app.schemas import VCFUploadRead

router = APIRouter(prefix="/plants", tags=["vcf"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_vcfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".vcf", ".gz"}
MAX_FILE_SIZE_MB = 50


@router.post("/{plant_id}/vcf", response_model=VCFUploadRead)
async def upload_vcf(
    plant_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    plant = session.get(Plant, plant_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")

    # File validation
    filename = file.filename or "upload.vcf"
    ext = os.path.splitext(filename)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Only .vcf and .vcf.gz files are accepted.",
        )

    # Safe filename (prevent path traversal)
    safe_name = f"plant_{plant_id}_{os.path.basename(filename)}"
    save_path = os.path.join(UPLOAD_DIR, safe_name)

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
        )

    with open(save_path, "wb") as f:
        f.write(contents)

    record = VCFUpload(
        plant_id=plant_id,
        filename=filename,
        raw_path=save_path,
        status="uploaded",
    )
    session.add(record)

    # Update plant status
    plant.status = "vcf_uploaded"
    session.add(plant)

    session.commit()
    session.refresh(record)
    return record
