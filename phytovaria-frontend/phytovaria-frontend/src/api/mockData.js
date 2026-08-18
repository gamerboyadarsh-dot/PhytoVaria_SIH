/**
 * MOCK / DEMO DATA ONLY.
 *
 * These fixtures exist so the frontend can be built and demoed before
 * Member 2 (backend), Member 3 (genomic knowledge base) and Member 4
 * (risk engine) endpoints are wired up. Gene names, variant IDs and
 * disease associations below are placeholders for layout purposes —
 * they are NOT curated scientific claims. Do not present this data as
 * real in front of judges; swap it for live API responses (or Member 3's
 * real curated knowledge base) before the final demo.
 *
 * Shapes here double as the *contract* the frontend expects from the
 * backend — see src/api/endpoints.js for the matching routes.
 */

export const mockPlants = [
  {
    id: "plant_001",
    name: "Tomato Row A-3",
    species: "Solanum lycopersicum",
    variety: "Sample variety (demo)",
    registeredOn: "2026-08-10",
    location: "Greenhouse 1",
    status: "analyzed", // registered | vcf_uploaded | analyzed
    thumbnailColor: "#1F4D3D",
  },
  {
    id: "plant_002",
    name: "Tomato Row B-1",
    species: "Solanum lycopersicum",
    variety: "Sample variety (demo)",
    registeredOn: "2026-08-12",
    location: "Greenhouse 1",
    status: "vcf_uploaded",
    thumbnailColor: "#4C46A6",
  },
  {
    id: "plant_003",
    name: "Tomato Row C-2",
    species: "Solanum lycopersicum",
    variety: "Sample variety (demo)",
    registeredOn: "2026-08-14",
    location: "Field Plot 2",
    status: "registered",
    thumbnailColor: "#B8721E",
  },
];

export const mockVariants = [
  {
    id: "var_001",
    plantId: "plant_001",
    chromosome: "chr06",
    position: 1234567,
    ref: "A",
    alt: "G",
    gene: "DEMO-GENE-1",
    consequence: "missense_variant",
    evidenceLevel: "curated", // curated | limited | unknown
  },
  {
    id: "var_002",
    plantId: "plant_001",
    chromosome: "chr09",
    position: 5432112,
    ref: "C",
    alt: "T",
    gene: "DEMO-GENE-2",
    consequence: "synonymous_variant",
    evidenceLevel: "limited",
  },
  {
    id: "var_003",
    plantId: "plant_001",
    chromosome: "chr02",
    position: 987654,
    ref: "T",
    alt: "A",
    gene: "n/a",
    consequence: "intergenic_variant",
    evidenceLevel: "unknown",
  },
];

export const mockDiseaseAssociations = [
  {
    variantId: "var_001",
    trait: "Sample foliar disease susceptibility",
    evidenceLevel: "curated",
    sourceLabel: "Placeholder source — replace with Member 3 citation",
    note: "Illustrative record for UI only.",
  },
  {
    variantId: "var_002",
    trait: "Sample fruit trait association",
    evidenceLevel: "limited",
    sourceLabel: "Placeholder source — replace with Member 3 citation",
    note: "Illustrative record for UI only.",
  },
  {
    variantId: "var_003",
    trait: "Unknown / Insufficient Evidence",
    evidenceLevel: "unknown",
    sourceLabel: null,
    note: "No curated association found — treated as unknown, not harmful.",
  },
];

export const mockRiskAssessment = {
  plantId: "plant_001",
  generatedAt: "2026-08-16T09:30:00Z",
  overallLabel: "Medium", // Low | Medium | High | Unknown
  overallScore: 0.54, // 0-1 susceptibility score, NOT a probability
  confidence: "Moderate",
  method: "rule_based", // rule_based | ml_demo
  traitScores: [
    { trait: "Sample foliar disease susceptibility", score: 0.71, label: "High", confidence: "Moderate" },
    { trait: "Sample fruit trait association", score: 0.38, label: "Low", confidence: "Low" },
    { trait: "General environmental stress sensitivity", score: 0.5, label: "Medium", confidence: "Low" },
  ],
  contributingFactors: [
    { type: "genomic", label: "DEMO-GENE-1 missense variant (var_001)", weight: 0.4 },
    { type: "environmental", label: "Elevated humidity, last 48h", weight: 0.35 },
    { type: "genomic", label: "DEMO-GENE-2 synonymous variant (var_002)", weight: 0.1 },
  ],
};

export const mockSensorReadings = Array.from({ length: 12 }).map((_, i) => {
  const hour = 8 + i;
  return {
    timestamp: `2026-08-16T${String(hour).padStart(2, "0")}:00:00Z`,
    temperatureC: 24 + Math.sin(i / 2) * 3,
    humidityPct: 60 + Math.cos(i / 3) * 12,
    source: "demo", // demo | esp32
  };
});

export const mockUser = { name: "Demo User", role: "Field Researcher" };
