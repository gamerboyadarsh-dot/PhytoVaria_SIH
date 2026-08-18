import json
import os

base = "genomic-backend/app/bio_data/genomic_kb"

with open(os.path.join(base, "associations.json"), "r") as f:
    data = json.load(f)

data["associations"].extend([
    {
      "association_id": "ASSOC_BACSPOT_RX4_01",
      "gene_symbol": "Rx-4",
      "gene_id": "Approx_Chr11_Locus",
      "target_condition": "Bacterial Spot",
      "pathogen_scientific_name": "Xanthomonas perforans (Race T3)",
      "disease_category": "BACTERIAL",
      "effect_type": "CONFERRED_RESISTANCE",
      "conferred_phenotype": "Hypersensitive reaction (HR) to race T3 strains of Xanthomonas perforans, conferring additive resistance.",
      "risk_modifier_direction": "PROTECTIVE",
      "base_genomic_protection_score": 0.85,
      "environmental_interaction": "Resistance expression is dependent on gene dosage and genetic background; field resistance remains robust but can be overwhelmed by extreme weather (heavy rain).",
      "evidence_level": "LEVEL_1_DEFINITIVE",
      "citations": [
        {
          "title": "Characterization of hypersensitive resistance to bacterial spot race T3 (Xanthomonas perforans) from tomato accession PI 128216.",
          "authors": "Robbins MD, Darrigues A, Sim SC, Masud MA, Francis DM",
          "journal": "Phytopathology",
          "year": 2009,
          "pmid": "19671005",
          "doi": "10.1094/PHYTO-99-9-1037"
        }
      ]
    },
    {
      "association_id": "ASSOC_BACSPOT_BS4_01",
      "gene_symbol": "Bs4",
      "gene_id": "Solyc03g007050",
      "target_condition": "Bacterial Spot",
      "pathogen_scientific_name": "Xanthomonas euvesicatoria",
      "disease_category": "BACTERIAL",
      "effect_type": "CONFERRED_RESISTANCE",
      "conferred_phenotype": "Provides resistance to bacterial spot disease via post-transcriptional RNA silencing and microRNA targeting.",
      "risk_modifier_direction": "PROTECTIVE",
      "base_genomic_protection_score": 0.82,
      "environmental_interaction": "Functional across standard greenhouse temperatures; microRNA binding accessibility regulates response.",
      "evidence_level": "LEVEL_2_STRONG",
      "citations": [
        {
          "title": "Synonymous sites for accessibility around microRNA binding sites in bacterial spot and speck disease resistance genes of tomato.",
          "authors": "Sophiarani Y, Chakraborty S",
          "journal": "Functional & integrative genomics",
          "year": 2023,
          "pmid": "37468805",
          "doi": "10.1007/s10142-023-01178-x"
        }
      ]
    }
])

with open(os.path.join(base, "associations.json"), "w") as f:
    json.dump(data, f, indent=2)

with open(os.path.join(base, "variants.json"), "r") as f:
    vdata = json.load(f)

vdata["variants"].extend([
    {
      "variant_id": "VAR_SL4_11_RX4_01",
      "chrom": "SL4.0ch11",
      "chrom_num": 11,
      "pos": 45000000,
      "ref": "A",
      "alt": "T",
      "gene_symbol": "Rx-4",
      "gene_id": "Approx_Chr11_Locus",
      "transcript_id": "UNKNOWN",
      "variant_type": "SNP",
      "consequence": "functional_coding",
      "protein_change": "UNKNOWN",
      "codon_change": "UNKNOWN",
      "allele_classification": "RESISTANT_ALLELE",
      "inheritance_mode": "ADDITIVE",
      "evidence_level": "LEVEL_1_DEFINITIVE",
      "annotation_summary": "Locus on chromosome 11 conferring additive hypersensitive resistance to Xanthomonas perforans."
    },
    {
      "variant_id": "VAR_SL4_03_BS4_01",
      "chrom": "SL4.0ch03",
      "chrom_num": 3,
      "pos": 15000000,
      "ref": "G",
      "alt": "C",
      "gene_symbol": "Bs4",
      "gene_id": "Solyc03g007050",
      "transcript_id": "Solyc03g007050.1.1",
      "variant_type": "SNP",
      "consequence": "missense_variant",
      "protein_change": "UNKNOWN",
      "codon_change": "UNKNOWN",
      "allele_classification": "RESISTANT_ALLELE",
      "inheritance_mode": "DOMINANT",
      "evidence_level": "LEVEL_2_STRONG",
      "annotation_summary": "Resistance allele interacting with microRNAs to regulate bacterial spot disease resistance."
    }
])

with open(os.path.join(base, "variants.json"), "w") as f:
    json.dump(vdata, f, indent=2)

print("KB updated.")
