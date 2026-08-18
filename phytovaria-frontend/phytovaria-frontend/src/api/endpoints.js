import { client } from "./client.js";
import {
  mockPlants,
  mockVariants,
  mockDiseaseAssociations,
  mockRiskAssessment,
  mockSensorReadings,
} from "./mockData.js";

/**
 * Every function here takes `demoMode` as its first argument so the same
 * call site works whether Demo Mode is on or off. Real paths are guesses
 * at a REST contract that matches the architecture diagram — Member 2
 * should treat this file as the frontend's expected contract and flag
 * anything that needs to change, rather than the frontend guessing again
 * mid-integration.
 *
 * A short network delay is added in demo mode so loading states are
 * visible during development/demo — remove `wait()` calls if that's
 * more annoying than useful.
 */
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export async function listPlants(demoMode) {
  if (demoMode) {
    await wait();
    return mockPlants;
  }
  return client.get("/plants");
}

export async function getPlant(demoMode, plantId) {
  if (demoMode) {
    await wait();
    const plant = mockPlants.find((p) => p.id === plantId);
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
  return client.post("/plants", payload);
}

export async function uploadVcf(demoMode, plantId, file) {
  if (demoMode) {
    await wait(900);
    return { plantId, filename: file?.name ?? "demo.vcf", variantCount: 3, status: "vcf_uploaded" };
  }
  const form = new FormData();
  form.append("file", file);
  return client.upload(`/plants/${plantId}/vcf`, form);
}

export async function listVariants(demoMode, plantId) {
  if (demoMode) {
    await wait();
    return mockVariants.filter((v) => v.plantId === plantId);
  }
  return client.get(`/plants/${plantId}/variants`);
}

export async function listDiseaseAssociations(demoMode, plantId) {
  if (demoMode) {
    await wait();
    const variantIds = mockVariants.filter((v) => v.plantId === plantId).map((v) => v.id);
    return mockDiseaseAssociations.filter((d) => variantIds.includes(d.variantId));
  }
  return client.get(`/plants/${plantId}/disease-associations`);
}

export async function getRiskAssessment(demoMode, plantId) {
  if (demoMode) {
    await wait(600);
    return { ...mockRiskAssessment, plantId };
  }
  return client.get(`/plants/${plantId}/risk-assessment`);
}

export async function runRiskAnalysis(demoMode, plantId) {
  if (demoMode) {
    await wait(1200);
    return { ...mockRiskAssessment, plantId, generatedAt: new Date().toISOString() };
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

export async function getReport(demoMode, plantId) {
  if (demoMode) {
    await wait(500);
    return {
      plantId,
      generatedAt: new Date().toISOString(),
      summary:
        "Demo report summary — replace with real generated content once the risk engine and knowledge base are connected.",
    };
  }
  return client.get(`/plants/${plantId}/report`);
}
