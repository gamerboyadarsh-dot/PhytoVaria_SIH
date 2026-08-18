"""
FastAPI application for PhytoVaria — Genomic Intelligence for Healthier Crops.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import plants, vcf, variant, risk, sensor, report, analysis

app = FastAPI(
    title="PhytoVaria Genomic API",
    description="Genomic Variation Interpretation Platform for Plant Health and Disease Susceptibility Assessment",
    version="1.0.0",
)

# ──────────────────────── CORS ────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:4173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production via CORS_ORIGINS env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────── Startup ────────────────────────

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    print("PhytoVaria backend started. Database tables ready.")


# ──────────────────────── Routers ────────────────────────

app.include_router(plants.router)
app.include_router(vcf.router)
app.include_router(analysis.router)
app.include_router(variant.router)
app.include_router(risk.router)
app.include_router(sensor.router)
app.include_router(report.router)


# ──────────────────────── Health ────────────────────────

@app.get("/health", tags=["health"])
def health():
    return {
        "status": "ok",
        "service": "PhytoVaria Genomic API",
        "version": "1.0.0"
    }
