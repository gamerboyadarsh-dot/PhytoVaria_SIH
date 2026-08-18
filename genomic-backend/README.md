# Genomic Risk Backend

## Setup
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Visit http://127.0.0.1:8000/docs for interactive API docs (Swagger UI).

## Pipeline
FastAPI -> Database -> VCF API -> Variant Interpretation API -> Risk API -> Sensor API -> Report API

## Day-by-day status
- Day 2: plants.py (register/list plant), vcf.py (upload VCF) — DONE, real logic
- Day 3: variant.py -> POST /plants/{id}/interpret — uses STUB classify_variants() in services/variant_interpreter.py
- Day 4: risk.py -> POST /plants/{id}/risk — uses STUB compute_risk() in services/risk_engine.py
- Day 5: sensor.py -> POST/GET /plants/{id}/sensor, report.py -> GET /plants/{id}/report — DONE, real logic

## IMPORTANT for whoever fills in real logic
Two functions are placeholders and need the team's real domain logic dropped in:
1. `app/services/vcf_parser.py` -> parse_vcf(file_path) -> List[dict]
2. `app/services/variant_interpreter.py` -> classify_variants(variants) -> List[dict]
3. `app/services/risk_engine.py` -> compute_risk(variants) -> dict

Do NOT touch routers when replacing these — only the function body inside services/.
This keeps everyone's work isolated and mergeable.

## Typical flow to test end-to-end
1. POST /plants/  {"name": "Tomato-1"}
2. POST /plants/{id}/vcf  (multipart file upload)
3. POST /plants/{id}/interpret
4. POST /plants/{id}/risk
5. POST /plants/{id}/sensor  {"sensor_type": "soil_moisture", "value": 42.5}
6. GET  /plants/{id}/report
