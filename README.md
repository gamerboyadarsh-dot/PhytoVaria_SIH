# PhytoVaria — SIH Final Prototype 🍅🧬

> **Genomic Variation Interpretation Platform for Plant Health & Disease Susceptibility Assessment**

PhytoVaria is a software-heavy platform that fuses **genomics, machine learning, and IoT** to accurately interpret disease susceptibility in crops (with a focus on *Solanum lycopersicum* - Tomato).

This repository contains the **complete, integrated, end-to-end working prototype** developed for the Smart India Hackathon.

---

## 🏗️ Architecture & Modules

The platform is divided into four highly specialized modules seamlessly integrated:

1. **`genomic-backend/`**: A high-performance FastAPI server acting as the central nervous system.
2. **`Phytovaria-Bioinformatics/`**: A production-ready genomic pipeline. Parses raw `.vcf` files and interprets variants against a peer-reviewed biological Knowledge Base (curated resistance genes like Tm-2², I-2, Ty-1).
3. **`phytovaria_ml_module/`**: A machine learning engine using Random Forests to fuse genomic protection scores with real-time environmental data to output dynamic susceptibility indices.
4. **`phytovaria-frontend/`**: A modern React/Vite/Tailwind frontend offering an intuitive dashboard, interactive VCF uploads, per-disease risk analysis, and visual explainability.
5. **`person6_iot_package/`**: ESP32 C++ scripts for real-time environmental data collection (Temp/Humidity) plus a `demo_mode_sender.py` fallback.

---

## 🚀 How to Run the Demo

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 2. Setup (One-Time)

**Backend Dependencies:**
```bash
cd genomic-backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
```

**Frontend Dependencies:**
```bash
cd phytovaria-frontend/phytovaria-frontend
npm install
```

### 3. Start the Platform

We have provided a one-click launcher for Windows:
```bash
# In the repository root
.\start_demo.ps1
```

Or manually:
```bash
# Terminal 1: Backend
cd genomic-backend
uvicorn app.main:app --port 8001 --reload

# Terminal 2: Frontend
cd phytovaria-frontend/phytovaria-frontend
npm run dev
```

### 4. Hardware Integration (IoT)

The platform supports live ESP32 DHT11/22 sensor feeds.
1. Flash `person6_iot_package/esp32_sketch/esp32_sketch.ino` to an ESP32.
2. Ensure it connects to the same network and points to your machine's IP (e.g., `http://192.168.1.X:8001/sensor`).
3. *Fallback:* If hardware is disconnected, the frontend automatically falls back to **Demo Sensor Mode**, providing realistic simulated environmental data to keep the ML models functioning during presentations.

---

## 🎯 Demo Workflow for Judges

1. **Register a Plant:** Open `http://localhost:5173`. Click "Register a plant" and enter details (e.g., "Tomato Row A").
2. **Upload Genomics:** Upload the sample VCF file provided at `Phytovaria-Bioinformatics/data/vcf_samples/susceptible_heirloom_SL4.vcf`.
3. **Analyze:** The backend instantly runs the VCF through the bioinformatics parser, matches against the Knowledge Base, runs the ML Risk Engine with environmental data, and returns a unified report.
4. **View Insights:** 
    - Check the **Genomic Analysis** tab to see matched alleles (like *Tm-2²*, *I-2*).
    - Check the **Disease Risk** tab for ML-predicted susceptibility to Early Blight, Late Blight, etc.
    - Check the **Explainability** tab to prove we don't use "black box" AI — every score is tied to specific genes and sensor data.

---

## 🔬 Scientific Honesty

**No hallucinatory AI is used in the biological pipeline.** 
All genomic matching is done deterministically against our curated `variants.json` Knowledge Base containing peer-reviewed data. Unknown alleles are strictly flagged as "Insufficient Evidence" rather than assuming risk. ML is used exclusively for *fusing* known biological parameters with fluid environmental factors.
