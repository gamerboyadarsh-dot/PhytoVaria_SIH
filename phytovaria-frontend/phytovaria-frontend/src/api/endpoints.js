import { client } from "./client.js";
import {
  mockPlants,
  mockVariants,
  mockDiseaseAssociations,
  mockRiskAssessment,
  mockSensorReadings,
  mockAnalysisResult,
} from "./mockData.js";

/**
 * API endpoints — demoMode=true returns realistic mock data,
 * demoMode=false calls the real FastAPI backend.
 *
 * All backend URLs match the actual FastAPI routes.
 */
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ── Plants ────────────────────────────────────────────────────────────────────

export async function listPlants(demoMode) {
  if (demoMode) { await wait(); return mockPlants; }
  return client.get("/plants");
}

export async function getPlant(demoMode, plantId) {
  if (demoMode) {
    await wait();
    const plant = mockPlants.find((p) => String(p.id) === String(plantId));
    if (!plant) throw new Error("Plant not found");
    return plant;
  }
  return client.get(`/plants/${plantId}`);
}

export async function registerPlant(demoMode, payload) {
  if (demoMode) {
    await wait();
    return {
      id: Date.now(),
      status: "registered",
      registered_at: new Date().toISOString(),
      species: "Solanum lycopersicum",
      ...payload,
    };
  }
  return client.post("/plants", payload);
}

// ── VCF Upload ────────────────────────────────────────────────────────────────

export async function uploadVcf(demoMode, plantId, file) {
  if (demoMode) {
    await wait(900);
    return {
      id: 1,
      plant_id: plantId,
      filename: file?.name ?? "demo.vcf",
      status: "uploaded",
      uploaded_at: new Date().toISOString(),
    };
  }
  const form = new FormData();
  form.append("file", file);
  return client.upload(`/plants/${plantId}/vcf`, form);
}

// ── Analysis (full pipeline) ──────────────────────────────────────────────────

export async function analyzeVcf(demoMode, plantId) {
  if (demoMode) {
    await wait(1800);
    return mockAnalysisResult;
  }
  return client.post(`/plants/${plantId}/analyze`);
}

export async function getAnalysis(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockAnalysisResult;
  }
  return client.get(`/plants/${plantId}/analysis`);
}

// ── Variants ──────────────────────────────────────────────────────────────────

export async function listVariants(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockVariants;
  }
  return client.get(`/plants/${plantId}/variants`);
}

export async function listDiseaseAssociations(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockDiseaseAssociations;
  }
  return client.get(`/plants/${plantId}/disease-associations`);
}

// ── Risk ──────────────────────────────────────────────────────────────────────

export async function getRiskAssessment(demoMode, plantId) {
  if (demoMode) { await wait(600); return { ...mockRiskAssessment, plant_id: plantId }; }
  return client.get(`/plants/${plantId}/risk`);
}

export async function runRiskAnalysis(demoMode, plantId) {
  if (demoMode) {
    await wait(1200);
    return { ...mockRiskAssessment, plant_id: plantId, computed_at: new Date().toISOString() };
  }
  return client.post(`/plants/${plantId}/risk`);
}

// ── Sensor ────────────────────────────────────────────────────────────────────

export async function getSensorReadings(demoMode, plantId) {
  if (demoMode) { await wait(); return mockSensorReadings; }
  return client.get(`/plants/${plantId}/sensor`);
}

export async function postSensorReading(demoMode, payload) {
  // payload: { temperature, humidity, plant_id? }
  if (demoMode) {
    await wait(300);
    return { id: Date.now(), source: "demo", recorded_at: new Date().toISOString(), ...payload };
  }
  return client.post("/sensor", payload);
}

// ── Report ────────────────────────────────────────────────────────────────────

export async function getReport(demoMode, plantId) {
  if (demoMode) {
    await wait(500);
    const plant = mockPlants.find((p) => String(p.id) === String(plantId)) || mockPlants[0];
    return {
      plant,
      genomic_summary: mockAnalysisResult.summary,
      important_variants: mockVariants,
      disease_profile: mockAnalysisResult.disease_susceptibility_profile,
      risk_assessment: {
        overall_risk_score: mockRiskAssessment.overall_risk_score,
        overall_risk_level: mockRiskAssessment.overall_risk_level,
        disease_breakdown: mockRiskAssessment.disease_breakdown,
        computed_at: mockRiskAssessment.computed_at,
      },
      environmental_conditions: {
        readings_count: mockSensorReadings.length,
        average_temperature_c: 25.4,
        average_humidity_pct: 67.2,
        data_source: "demo",
      },
      recommendations: [
        "MODERATE RISK — Late Blight: Monitor humidity closely. Keep below 80% if possible.",
        "Current genomic profile shows manageable resistance gene complement.",
        "Verify Mi-1.2 nematode resistance remains effective — breaks down above 28°C.",
      ],
      methodology_note:
        "DEMO MODE: Data shown is for demonstration purposes. Real analysis connects to the live genomic knowledge base.",
      scientific_limitations: [
        "Analysis currently uses curated public genomic datasets for baseline assessment.",
        "ML models are demonstration models trained on rule-engine labels.",
        "Risk scores are susceptibility indicators, not guaranteed disease probabilities.",
      ],
    };
  }
  return client.get(`/plants/${plantId}/report`);
}
