# Genomic Risk Backend

## Run it
```
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Visit http://127.0.0.1:8000/docs for interactive API docs (Swagger UI).

## Pipeline
FastAPI -> Database (SQLite via SQLModel) -> VCF API -> Variant Interpretation API -> Risk API -> Sensor API -> Report API

## Endpoints
- POST /plants/                 register a plant
- GET  /plants/{id}             get a plant
- POST /plants/{id}/vcf         upload a VCF file
- POST /plants/{id}/interpret   parse + classify variants from latest VCF
- GET  /plants/{id}/variants    list interpreted variants
- POST /plants/{id}/risk        compute risk score from variants
- GET  /plants/{id}/risk        get latest risk score
- POST /plants/{id}/sensor      add a sensor reading
- GET  /plants/{id}/sensor      list sensor readings
- GET  /plants/{id}/report      full aggregated report

## What's stubbed (swap freely, contracts documented in each file)
- app/services/vcf_parser.py         parse_vcf() — replace with real VCF parsing
- app/services/variant_interpreter.py classify_variants() — replace with real classification
- app/services/risk_engine.py        compute_risk() — replace with real scoring model

Routers never touch these internals directly — only call the documented function contract,
so any teammate can rewrite a service file without breaking anyone else's code.
