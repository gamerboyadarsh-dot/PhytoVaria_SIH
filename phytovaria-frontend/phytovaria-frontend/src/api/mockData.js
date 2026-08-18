/**
 * MOCK / DEMO DATA ONLY — clearly labeled.
 *
 * Gene names, variant loci, and disease associations below are sourced
 * from the PhytoVaria curated knowledge base (Solanum lycopersicum).
 * Citations available in the knowledge base (see /docs endpoint).
 *
 * For the demo: these mirror what the real backend returns when
 * a susceptible_heirloom_SL4.vcf is analyzed against the KB.
 * Switch VITE_DEMO_MODE=false to use real backend data.
 */

export const mockPlants = [
  {
    id: 1,
    name: "Tomato-001",
    species: "Solanum lycopersicum",
    variety: "Heirloom (SL4 Reference)",
    location: "Greenhouse 1",
    sample_source: "Leaf tissue (young)",
    collection_date: "2026-08-10",
    notes: "Primary demo sample — susceptible heirloom cultivar",
    status: "analyzed",
    registered_at: "2026-08-10T08:00:00Z",
    thumbnailColor: "#1F4D3D",
  },
  {
    id: 2,
    name: "Tomato-002",
    species: "Solanum lycopersicum",
    variety: "Resistant Cultivar (SL4 R-genes)",
    location: "Field Plot A",
    sample_source: "Leaf tissue (mature)",
    collection_date: "2026-08-12",
    notes: "Resistant cultivar with I-2 and Ph-3 introgression",
    status: "vcf_uploaded",
    registered_at: "2026-08-12T09:30:00Z",
    thumbnailColor: "#4C46A6",
  },
  {
    id: 3,
    name: "Tomato-003",
    species: "Solanum lycopersicum",
    variety: "Unknown cultivar",
    location: "Greenhouse 2",
    sample_source: "Root tissue",
    collection_date: "2026-08-14",
    notes: "Field sample — analysis pending",
    status: "registered",
    registered_at: "2026-08-14T11:00:00Z",
    thumbnailColor: "#B8721E",
  },
];

// Variants from the susceptible heirloom SL4 sample (knowledge base matched)
export const mockVariants = [
  {
    id: 1,
    chrom: "SL4.0ch09",
    pos: 2408520,
    ref: "G",
    alt: "G",
    gene_symbol: "tm-2",
    consequence: "wild_type_reference",
    classification: "EXACT_MATCH",
    evidence_level: "LEVEL_1_DEFINITIVE",
    confidence: 0.05,
    annotation: "Wild-type reference allele — susceptible to Tomato Mosaic Virus.",
  },
  {
    id: 2,
    chrom: "SL4.0ch09",
    pos: 1605420,
    ref: "C",
    alt: "T",
    gene_symbol: "Ve1",
    consequence: "stop_gained_in_susceptible",
    classification: "EXACT_MATCH",
    evidence_level: "LEVEL_1_DEFINITIVE",
    confidence: 0.08,
    annotation: "Premature truncation in Ve1 — loss of Verticillium resistance.",
  },
  {
    id: 3,
    chrom: "SL4.0ch01",
    pos: 1214800,
    ref: "C",
    alt: "A",
    gene_symbol: "Cf-9",
    consequence: "missense_variant",
    classification: "EXACT_MATCH",
    evidence_level: "LEVEL_1_DEFINITIVE",
    confidence: 0.86,
    annotation: "Cf-9 resistance allele — protection against Cladosporium leaf mold.",
  },
  {
    id: 4,
    chrom: "SL4.0ch12",
    pos: 4521890,
    ref: "A",
    alt: "C",
    gene_symbol: null,
    consequence: "intergenic_variant",
    classification: "UNKNOWN_INSUFFICIENT_EVIDENCE",
    evidence_level: null,
    confidence: null,
    annotation: "Unknown / Insufficient Evidence — no curated association found.",
  },
  {
    id: 5,
    chrom: "SL4.0ch03",
    pos: 9876543,
    ref: "T",
    alt: "G",
    gene_symbol: null,
    consequence: "synonymous_variant",
    classification: "UNKNOWN_INSUFFICIENT_EVIDENCE",
    evidence_level: null,
    confidence: null,
    annotation: "Unknown / Insufficient Evidence.",
  },
];

// Real KB disease associations (from associations.json)
export const mockDiseaseAssociations = [
  {
    condition: "Tomato Mosaic Virus (ToMV) & Tobacco Mosaic Virus (TMV)",
    pathogen: "Tomato mosaic virus / Tobacco mosaic virus (Tobamovirus)",
    category: "VIRAL",
    gene_symbol: "tm-2",
    genotype: "G/G (homozygous susceptible)",
    zygosity: "HOMOZYGOUS",
    phenotype: "SUSCEPTIBLE — lacks viral movement protein recognition",
    genomic_protection_score: 0.05,
    evidence_level: "LEVEL_1_DEFINITIVE",
    interpretation: "Susceptible wild-type allele — plant lacks ToMV resistance.",
    environmental_interaction: "Stable across wide greenhouse temperature ranges.",
  },
  {
    condition: "Verticillium Wilt (Race 1)",
    pathogen: "Verticillium dahliae race 1",
    category: "FUNGAL",
    gene_symbol: "Ve1 (truncated)",
    genotype: "C→T (stop gained)",
    zygosity: "HETEROZYGOUS",
    phenotype: "SUSCEPTIBLE — loss-of-function in Ve1 receptor",
    genomic_protection_score: 0.08,
    evidence_level: "LEVEL_1_DEFINITIVE",
    interpretation: "Premature stop codon eliminates Ve1 effector recognition.",
    environmental_interaction: "Elevated in cool moist soils (20-24°C).",
  },
  {
    condition: "Leaf Mold / Cladosporium Leaf Spot",
    pathogen: "Passalora fulva",
    category: "FUNGAL",
    gene_symbol: "Cf-9",
    genotype: "C→A",
    zygosity: "HETEROZYGOUS",
    phenotype: "RESISTANT — Avr9 effector recognition active",
    genomic_protection_score: 0.86,
    evidence_level: "LEVEL_1_DEFINITIVE",
    interpretation: "Cf-9 resistance allele provides foliar leaf mold protection.",
    environmental_interaction: "Risk elevated at humidity >80% in greenhouse.",
  },
];

// Risk assessment — matching backend DiseaseRiskEntry schema
export const mockRiskAssessment = {
  plant_id: 1,
  computed_at: "2026-08-16T09:30:00Z",
  overall_risk_score: 61.4,
  overall_risk_level: "MODERATE",
  // Frontend display fields (keep for compatibility)
  overallLabel: "Moderate",
  overallScore: 0.61,
  confidence: "Moderate",
  disease_breakdown: [
    {
      disease: "Tomato Mosaic Virus (ToMV) & Tobacco Mosaic Virus (TMV)",
      risk_score: 78,
      risk_level: "HIGH",
      confidence: "High",
      genomic_evidence: "Susceptibility allele detected at tm-2 — wild-type reference, no resistance.",
      environmental_note: "Stable across greenhouse temperature ranges.",
      ml_reasoning: null,
      gene_symbol: "tm-2",
      evidence_level: "LEVEL_1_DEFINITIVE",
      category: "VIRAL",
    },
    {
      disease: "Verticillium Wilt (Race 1)",
      risk_score: 72,
      risk_level: "HIGH",
      confidence: "High",
      genomic_evidence: "Ve1 receptor truncated — loss of Verticillium Ave1 recognition.",
      environmental_note: "Risk elevated in cool moist soils (20-24°C).",
      ml_reasoning: null,
      gene_symbol: "Ve1",
      evidence_level: "LEVEL_1_DEFINITIVE",
      category: "FUNGAL",
    },
    {
      disease: "Late Blight",
      risk_score: 55,
      risk_level: "MODERATE",
      confidence: "Low",
      genomic_evidence: "No specific Ph-3 variant detected in this sample.",
      environmental_note: "Extreme risk at humidity >85% and 15-22°C.",
      ml_reasoning: "Model predicts MODERATE risk for Late Blight, driven primarily by humidity. Genomic profile: 0 resistance gene(s).",
      gene_symbol: null,
      evidence_level: "ML_DEMONSTRATION_ONLY",
      category: "ML_PREDICTED",
    },
    {
      disease: "Leaf Mold / Cladosporium Leaf Spot",
      risk_score: 18,
      risk_level: "LOW",
      confidence: "High",
      genomic_evidence: "Cf-9 resistance allele detected — protection against leaf mold active.",
      environmental_note: "Leaf mold proliferates at humidity >80%.",
      ml_reasoning: null,
      gene_symbol: "Cf-9",
      evidence_level: "LEVEL_1_DEFINITIVE",
      category: "FUNGAL",
    },
    {
      disease: "Fusarium Wilt",
      risk_score: 42,
      risk_level: "MODERATE",
      confidence: "Low",
      genomic_evidence: "No I-2 resistance allele detected in this sample.",
      environmental_note: "Soil temperatures 25-28°C highly favor Fusarium infection.",
      ml_reasoning: "Model predicts MODERATE risk for Fusarium Wilt, driven primarily by susceptibility gene count.",
      gene_symbol: null,
      evidence_level: "ML_DEMONSTRATION_ONLY",
      category: "ML_PREDICTED",
    },
  ],
  // Legacy shape (keep for dashboard compatibility)
  traitScores: [
    { trait: "Tomato Mosaic Virus (ToMV)", score: 0.78, label: "High", confidence: "High" },
    { trait: "Verticillium Wilt", score: 0.72, label: "High", confidence: "High" },
    { trait: "Late Blight", score: 0.55, label: "Moderate", confidence: "Low" },
    { trait: "Leaf Mold", score: 0.18, label: "Low", confidence: "High" },
    { trait: "Fusarium Wilt", score: 0.42, label: "Moderate", confidence: "Low" },
  ],
  contributingFactors: [
    { type: "genomic", label: "tm-2 wild-type susceptible allele", weight: 0.45 },
    { type: "genomic", label: "Ve1 receptor truncation (stop_gained)", weight: 0.35 },
    { type: "genomic", label: "Cf-9 resistance allele (protective)", weight: -0.20 },
    { type: "environmental", label: "Humidity 67% — moderate leaf mold pressure", weight: 0.15 },
  ],
};

// Full analysis result (mirrors backend POST /plants/{id}/analyze response)
export const mockAnalysisResult = {
  status: "SUCCESS",
  plant_id: 1,
  vcf_filename: "susceptible_heirloom_SL4.vcf",
  summary: {
    total_vcf_variants: 847,
    variants_evaluated: 847,
    exact_knowledge_base_matches: 3,
    novel_alleles_at_known_loci: 1,
    unknown_insufficient_evidence_variants: 843,
    resistance_alleles_detected: 1,
    susceptibility_alleles_detected: 2,
  },
  disease_susceptibility_profile: mockDiseaseAssociations,
  risk: {
    overall_risk_score: 61.4,
    overall_risk_level: "MODERATE",
    disease_breakdown: mockRiskAssessment.disease_breakdown,
    environmental_context: {
      temperature_c: 25.4,
      humidity_pct: 67.2,
      source: "demo",
    },
  },
  actionable_variants: mockVariants.filter((v) => v.classification === "EXACT_MATCH"),
  unknown_variants_sample: mockVariants.filter((v) => v.classification === "UNKNOWN_INSUFFICIENT_EVIDENCE"),
  methodology_note:
    "DEMO MODE: Risk scores combine curated genomic evidence from the PhytoVaria knowledge base " +
    "with environmental sensor data and a Random Forest demonstration model.",
};

// Sensor readings (realistic greenhouse data)
export const mockSensorReadings = Array.from({ length: 24 }).map((_, i) => {
  const hour = i;
  const baseTemp = 22 + Math.sin((i / 24) * Math.PI * 2) * 4;
  const baseHum = 65 + Math.sin((i / 24) * Math.PI * 2 + 1) * 12;
  return {
    id: i + 1,
    plant_id: 1,
    temperature: Math.round(baseTemp * 10) / 10,
    humidity: Math.round(baseHum * 10) / 10,
    source: "demo",
    recorded_at: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
  };
});

export const mockUser = { name: "Demo User", role: "Field Researcher" };
