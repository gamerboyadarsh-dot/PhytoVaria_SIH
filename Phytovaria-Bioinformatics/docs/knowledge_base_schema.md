# PhytoVaria Knowledge Base Schema & API Contract

This document provides the standard JSON and data structures exported by the **Bioinformatics / Knowledge Base Module (Member 3)** to the **FastAPI Backend (Member 2)** and the **AI/ML Risk Engine (Member 4)**.

---

## 1. Schema: `variants.json`

Each variant entry represents a curated allele at a specific genomic coordinate on *Solanum lycopersicum* Reference SL4.0.

```json
{
  "variant_id": "VAR_SL4_09_007010_01",
  "chrom": "SL4.0ch09",
  "chrom_num": 9,
  "pos": 2408520,
  "ref": "G",
  "alt": "A",
  "gene_symbol": "Tm-2^2",
  "gene_id": "Solyc09g007010",
  "transcript_id": "Solyc09g007010.1.1",
  "variant_type": "SNP",
  "consequence": "missense_variant",
  "protein_change": "p.Glu520Lys",
  "codon_change": "GAG>AAG",
  "allele_classification": "RESISTANT_ALLELE",
  "inheritance_mode": "DOMINANT",
  "evidence_level": "LEVEL_1_DEFINITIVE",
  "annotation_summary": "Functional missense substitution in CC-NBS-LRR..."
}
```

### Key Field Descriptions:
- `allele_classification`: `RESISTANT_ALLELE` | `SUSCEPTIBLE_ALLELE` | `AGRONOMIC_PHENOTYPE` | `UNKNOWN`
- `inheritance_mode`: `DOMINANT` | `SEMI_DOMINANT` | `RECESSIVE` | `RECESSIVE_SUSCEPTIBILITY`
- `evidence_level`: `LEVEL_1_DEFINITIVE` (multi-lab / cloned) | `LEVEL_2_MODERATE` (GWAS / QTL mapped) | `LEVEL_3_PRELIMINARY` | `NO_EVIDENCE`

---

## 2. Schema: `associations.json`

Maps genes and functional alleles to pathogen responses, disease susceptibility, and environmental interactions.

```json
{
  "association_id": "ASSOC_TOMV_TM2_01",
  "gene_symbol": "Tm-2^2",
  "gene_id": "Solyc09g007010",
  "target_condition": "Tomato Mosaic Virus (ToMV) & Tobacco Mosaic Virus (TMV)",
  "pathogen_scientific_name": "Tomato mosaic virus / Tobacco mosaic virus (Tobamovirus)",
  "disease_category": "VIRAL",
  "effect_type": "CONFERRED_RESISTANCE",
  "conferred_phenotype": "Durable dominant immunity...",
  "risk_modifier_direction": "PROTECTIVE",
  "base_genomic_protection_score": 0.95,
  "environmental_interaction": "Stable across wide greenhouse temperature ranges...",
  "evidence_level": "LEVEL_1_DEFINITIVE",
  "citations": [
    {
      "title": "The tomato Tm-2(2) resistance gene...",
      "authors": "Lanfermeijer FC, Warmink J, Hille J",
      "journal": "Molecular Plant-Microbe Interactions",
      "year": 2005,
      "pmid": "16167765",
      "doi": "10.1094/MPMI-18-0947"
    }
  ]
}
```

---

## 3. Schema: Pipeline Output (Sent from Parser to Backend / Risk Engine)

When the backend executes `BioinformaticsPipeline.process_vcf(vcf_file_path)`:

```json
{
  "status": "SUCCESS",
  "pipeline_version": "1.0.0",
  "sample_id": "SAMPLE_RESISTANT_01",
  "reference_genome": "Solanum lycopersicum SL4.0 / ITAG4.0",
  "summary": {
    "total_vcf_variants": 13,
    "variants_evaluated": 13,
    "exact_knowledge_base_matches": 11,
    "novel_alleles_at_known_loci": 0,
    "unknown_insufficient_evidence_variants": 2,
    "resistance_alleles_detected": 10,
    "susceptibility_alleles_detected": 0
  },
  "disease_susceptibility_profile": [
    {
      "condition": "Tomato Mosaic Virus (ToMV) & Tobacco Mosaic Virus (TMV)",
      "pathogen": "Tomato mosaic virus / Tobacco mosaic virus (Tobamovirus)",
      "category": "VIRAL",
      "gene_symbol": "Tm-2^2",
      "genotype": "1/1",
      "zygosity": "HOM_ALT",
      "phenotype": "CONFERRED_RESISTANCE",
      "genomic_protection_score": 0.95,
      "evidence_level": "LEVEL_1_DEFINITIVE",
      "interpretation": "Genotype '1/1' (HOM_ALT) at Tm-2^2 (p.Glu520Lys)...",
      "environmental_interaction": "Stable across wide greenhouse temperature ranges..."
    }
  ],
  "actionable_variants": [ ... ],
  "unknown_variants_sample": [ ... ]
}
```
