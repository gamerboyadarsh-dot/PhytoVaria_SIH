/**
 * DEMO / MOCK DATA — used when Demo Mode is ON.
 *
 * Gene names and disease associations below are drawn from the real PhytoVaria
 * Genomic Knowledge Base (curated tomato resistance gene literature).
 * They are used for UI layout/demo purposes when the backend is unavailable.
 *
 * Do NOT present this data as newly-derived results in front of judges —
 * always label demo data as "Demo Mode" in the UI.
 */

export const mockPlants = [
  {
    id: 1,
    name: "Tomato-001",
    species: "Solanum lycopersicum",
    variety: "Susceptible Heirloom",
    location: "Greenhouse 1",
    sample_source: "Leaf tissue",
    collection_date: "2026-08-15",
    status: "analyzed",
    registered_at: "2026-08-15T09:00:00Z",
    thumbnailColor: "#1F4D3D",
  },
  {
    id: 2,
    name: "Tomato-002",
    species: "Solanum lycopersicum",
    variety: "Resistant Cultivar SL4",
    location: "Greenhouse 2",
    sample_source: "Leaf tissue",
    collection_date: "2026-08-16",
    status: "vcf_uploaded",
    registered_at: "2026-08-16T10:00:00Z",
    thumbnailColor: "#4C3A1A",
  },
];

export const mockVariants = [
  {
    id: 1,
    plantId: 1,
    chrom: "SL4.0ch09",
    pos: 2408520,
    ref: "G",
    alt: "A",
    gene_symbol: "Tm-2²",
    gene_id: "Solyc09g007010",
    consequence: "missense_variant",
    protein_change: "p.Glu520Lys",
    variant_type: "SNP",
    match_status: "EXACT_MATCH",
    allele_classification: "RESISTANT_ALLELE",
    inferred_phenotype: "CONFERRED_RESISTANCE",
    evidence_level: "LEVEL_1_DEFINITIVE",
    confidence_level: "HIGH",
    genomic_protection_score: 0.95,
    interpretation:
      "Genotype '0/1' (HET) at Tm-2² (p.Glu520Lys). Result: Conferred Resistance. Functional missense substitution in CC-NBS-LRR domain conferring resistance against Tomato Mosaic Virus (ToMV).",
    associations: [
      {
        target_condition: "Tomato Mosaic Virus (ToMV)",
        pathogen: "Tomato Mosaic Virus",
        disease_category: "Viral",
        effect_type: "RESISTANCE",
        conferred_phenotype: "BROAD_SPECTRUM_RESISTANCE",
        risk_modifier_direction: "PROTECTIVE",
        environmental_interaction: "Temperature above 33°C may overcome resistance.",
      },
    ],
  },
  {
    id: 2,
    plantId: 1,
    chrom: "SL4.0ch11",
    pos: 51208310,
    ref: "A",
    alt: "G",
    gene_symbol: "I-2",
    gene_id: "Solyc11g071430",
    consequence: "missense_variant",
    protein_change: "p.Ile653Val",
    variant_type: "SNP",
    match_status: "EXACT_MATCH",
    allele_classification: "RESISTANT_ALLELE",
    inferred_phenotype: "CONFERRED_RESISTANCE",
    evidence_level: "LEVEL_1_DEFINITIVE",
    confidence_level: "HIGH",
    genomic_protection_score: 0.92,
    interpretation:
      "Resistance allele at I-2 locus. Confers race-specific resistance to Fusarium oxysporum f. sp. lycopersici race 2.",
    associations: [
      {
        target_condition: "Fusarium Wilt",
        pathogen: "Fusarium oxysporum f. sp. lycopersici",
        disease_category: "Fungal",
        effect_type: "RESISTANCE",
        conferred_phenotype: "RACE_SPECIFIC_RESISTANCE",
        risk_modifier_direction: "PROTECTIVE",
        environmental_interaction: "Resistance may be reduced in high-temperature soils (>28°C).",
      },
    ],
  },
  {
    id: 3,
    plantId: 1,
    chrom: "SL4.0ch01",
    pos: 1214800,
    ref: "C",
    alt: "T",
    gene_symbol: "Cf-9",
    gene_id: "Solyc01g006550",
    consequence: "snp_variant",
    protein_change: null,
    variant_type: "SNP",
    match_status: "NOVEL_ALLELE_AT_LOCUS",
    allele_classification: "UNKNOWN",
    inferred_phenotype: "INSUFFICIENT_EVIDENCE",
    evidence_level: "NO_EVIDENCE",
    confidence_level: "LOW",
    genomic_protection_score: null,
    interpretation:
      "Variant at Cf-9 locus (Cladosporium fulvum race-9 resistance gene), but this specific alternate allele has no peer-reviewed disease outcome data. Classified as Unknown / Insufficient Evidence.",
    associations: [],
  },
];

export const mockDiseaseAssociations = [
  {
    condition: "Tomato Mosaic Virus (ToMV)",
    pathogen: "Tomato Mosaic Virus",
    category: "Viral",
    gene_symbol: "Tm-2²",
    genotype: "0/1",
    zygosity: "HET",
    phenotype: "CONFERRED_RESISTANCE",
    genomic_protection_score: 0.95,
    evidence_level: "LEVEL_1_DEFINITIVE",
    interpretation:
      "Heterozygous resistance allele at Tm-2² confers broad-spectrum protection against ToMV.",
    environmental_interaction: "Temperature above 33°C may overcome Tm-2² resistance.",
  },
  {
    condition: "Fusarium Wilt",
    pathogen: "Fusarium oxysporum f. sp. lycopersici",
    category: "Fungal",
    gene_symbol: "I-2",
    genotype: "0/1",
    zygosity: "HET",
    phenotype: "CONFERRED_RESISTANCE",
    genomic_protection_score: 0.92,
    evidence_level: "LEVEL_1_DEFINITIVE",
    interpretation:
      "I-2 resistance allele identified — race-specific protection against Fusarium wilt race 2.",
    environmental_interaction: "Warm soils (>28°C) may reduce I-2 efficacy.",
  },
];

export const mockRiskAssessment = {
  id: 1,
  plant_id: 1,
  risk_score: 38.0,
  risk_level: "low",
  confidence: "Moderate",
  method: "rule_ml_combined",
  disease_scores: [
    {
      disease: "Early Blight",
      risk_score: 38.0,
      risk_level: "low",
      confidence: "Moderate",
      genomic_protection_score: 0.5,
      ml_predicted_level: "low",
      ml_confidence: 0.78,
      ml_reasoning:
        "Model predicts low risk for Early Blight, driven primarily by resistance gene count. Genomic profile: 2 resistance gene(s).",
      evidence_level: "NO_EVIDENCE",
    },
    {
      disease: "Late Blight",
      risk_score: 46.0,
      risk_level: "moderate",
      confidence: "Low",
      genomic_protection_score: 0.5,
      ml_predicted_level: "moderate",
      ml_confidence: 0.65,
      ml_reasoning:
        "Model predicts moderate risk for Late Blight, driven primarily by humidity level. Genomic profile: 2 resistance gene(s).",
      evidence_level: "NO_EVIDENCE",
    },
    {
      disease: "Fusarium Wilt",
      risk_score: 30.0,
      risk_level: "low",
      confidence: "Moderate",
      genomic_protection_score: 0.92,
      ml_predicted_level: "low",
      ml_confidence: 0.82,
      ml_reasoning:
        "Model predicts low risk for Fusarium Wilt, driven primarily by resistance gene count. Genomic profile: 1 resistance gene(s).",
      evidence_level: "LEVEL_1_DEFINITIVE",
    },
  ],
  contributing_factors: [
    {
      type: "genomic",
      label: "I-2 — Conferred Resistance",
      detail: "Genomic protection score: 0.92",
      weight: 0.05,
    },
    {
      type: "environmental",
      label: "Fusarium Wilt — Environmental risk",
      detail: "Temperature: 26.5°C, Humidity: 82.0%",
      weight: 0.4,
    },
    {
      type: "ml",
      label: "ML Model — Random Forest (demonstration)",
      detail: "Trained on synthetic rule-derived labels. Not field-validated.",
      weight: null,
    },
  ],
  computed_at: "2026-08-18T09:30:00Z",
  // Frontend-specific fields for legacy compatibility
  overallLabel: "Low",
  overallScore: 0.38,
  traitScores: [
    { trait: "Early Blight", score: 0.38, label: "Low", confidence: "Moderate" },
    { trait: "Late Blight", score: 0.46, label: "Medium", confidence: "Low" },
    { trait: "Fusarium Wilt", score: 0.30, label: "Low", confidence: "Moderate" },
  ],
};

export const mockSensorReadings = Array.from({ length: 12 }).map((_, i) => {
  const hour = 8 + i;
  return {
    id: i + 1,
    plant_id: 1,
    temperature: parseFloat((24 + Math.sin(i / 2) * 3).toFixed(1)),
    humidity: parseFloat((65 + Math.cos(i / 3) * 12).toFixed(1)),
    soil_moisture: parseFloat((50 + Math.sin(i / 4) * 8).toFixed(1)),
    light: parseFloat((450 + Math.cos(i / 2) * 100).toFixed(1)),
    source: "demo",
    recorded_at: `2026-08-18T${String(hour).padStart(2, "0")}:00:00Z`,
    // Legacy alias fields
    temperatureC: parseFloat((24 + Math.sin(i / 2) * 3).toFixed(1)),
    humidityPct: parseFloat((65 + Math.cos(i / 3) * 12).toFixed(1)),
  };
});

export const mockUser = { name: "Demo Researcher", role: "Field Researcher" };
