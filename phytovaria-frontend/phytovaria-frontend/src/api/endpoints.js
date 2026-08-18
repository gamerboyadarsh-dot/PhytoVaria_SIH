import { client } from "./client.js";
import {
  mockPlants,
  mockVariants,
  mockDiseaseAssociations,
  mockRiskAssessment,
  mockSensorReadings,
} from "./mockData.js";

/**
 * PhytoVaria API endpoints.
 * Every function takes `demoMode` as first arg so the same call site works
 * whether Demo Mode is on (mock data) or off (real backend).
 *
 * BACKEND CONTRACT (FastAPI on localhost:8001, proxied via /api):
 *   GET  /plants/                          → list plants
 *   POST /plants/                          → register plant
 *   GET  /plants/:id                       → get plant
 *   POST /plants/:id/vcf                   → upload VCF
 *   POST /plants/:id/analyze               → run full pipeline
 *   GET  /plants/:id/variants              → get annotated variants
 *   GET  /plants/:id/disease-associations  → disease profile
 *   GET  /plants/:id/risk-assessment       → risk assessment (alias)
 *   POST /plants/:id/risk-assessment/run   → re-run risk
 *   GET  /plants/:id/sensor-readings       → sensor readings (alias)
 *   POST /plants/:id/sensor               → add sensor reading
 *   GET  /plants/:id/report                → full report
 */
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function listPlants(demoMode) {
  if (demoMode) { await wait(); return mockPlants; }
  return client.get("/plants/");
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
    return { id: `plant_${Date.now()}`, status: "registered", ...payload };
  }
  return client.post("/plants/", payload);
}

export async function uploadVcf(demoMode, plantId, file) {
  if (demoMode) {
    await wait(900);
    return {
      id: 1,
      plant_id: plantId,
      filename: file?.name ?? "demo.vcf",
      status: "uploaded",
      total_variants: null,
      kb_matches: null,
    };
  }
  const form = new FormData();
  form.append("file", file);
  return client.upload(`/plants/${plantId}/vcf`, form);
}

export async function analyzePlant(demoMode, plantId) {
  if (demoMode) {
    await wait(1500);
    return {
      status: "SUCCESS",
      plant_id: plantId,
      pipeline: {
        summary: {
          total_vcf_variants: 12,
          exact_knowledge_base_matches: 2,
          novel_alleles_at_known_loci: 8,
          unknown_insufficient_evidence_variants: 2,
          resistance_alleles_detected: 1,
          susceptibility_alleles_detected: 1,
        },
      },
      risk: mockRiskAssessment,
    };
  }
  return client.post(`/plants/${plantId}/analyze`);
}

export async function listVariants(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockVariants.filter((v) => String(v.plantId) === String(plantId));
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

export async function getRiskAssessment(demoMode, plantId) {
  if (demoMode) {
    await wait(600);
    return { ...mockRiskAssessment, plant_id: plantId };
  }
  // Backend supports both /risk and /risk-assessment
  return client.get(`/plants/${plantId}/risk-assessment`);
}

export async function runRiskAnalysis(demoMode, plantId) {
  if (demoMode) {
    await wait(1200);
    return { ...mockRiskAssessment, plant_id: plantId, generatedAt: new Date().toISOString() };
  }
  return client.post(`/plants/${plantId}/risk-assessment/run`);
}

export async function getSensorReadings(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockSensorReadings;
  }
  return client.get(`/plants/${plantId}/sensor-readings`);
}

export async function addSensorReading(demoMode, plantId, payload) {
  if (demoMode) {
    await wait(300);
    return { id: Date.now(), plant_id: plantId, source: "demo", ...payload };
  }
  return client.post(`/plants/${plantId}/sensor`, payload);
}

export async function getReport(demoMode, plantId) {
  if (demoMode) {
    await wait(500);
    return {
      plant_id: plantId,
      generated_at: new Date().toISOString(),
      plant: mockPlants.find((p) => String(p.id) === String(plantId)) || mockPlants[0],
      variant_summary: {
        total: 12,
        exact_matches: 2,
        novel_at_locus: 8,
        unknown: 2,
        resistant_alleles: 1,
        susceptible_alleles: 1,
        key_variants: mockVariants.slice(0, 3),
      },
      disease_profile: mockDiseaseAssociations,
      risk_assessment: mockRiskAssessment,
      sensor_summary: { total_readings: mockSensorReadings.length, latest: mockSensorReadings[0] },
      methodology: "Rule-based + ML-combined genomic interpretation pipeline using curated tomato knowledge base.",
      limitations: "Prototype using public genomic data. Risk scores are susceptibility indicators, not guaranteed probabilities.",
    };
  }
  return client.get(`/plants/${plantId}/report`);
}
