from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers import plants, vcf, variant, risk, sensor, report

app = FastAPI(title="Genomic Risk Backend")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(plants.router)
app.include_router(vcf.router)
app.include_router(variant.router)
app.include_router(risk.router)
app.include_router(sensor.router)
app.include_router(report.router)


@app.get("/health")
def health():
    return {"status": "ok"}
