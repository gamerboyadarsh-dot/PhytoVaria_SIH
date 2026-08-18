"""
knowledge_base.py
=================
Genomic Knowledge Base management, validation, and high-performance querying
for Solanum lycopersicum (Tomato) disease/trait associations.
"""

import json
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any

from .vcf_parser import normalize_chromosome


@dataclass
class Citation:
    title: str
    authors: str
    journal: str
    year: int
    pmid: Optional[str] = None
    doi: Optional[str] = None


@dataclass
class AssociationEntry:
    association_id: str
    gene_symbol: str
    gene_id: str
    target_condition: str
    pathogen_scientific_name: str
    disease_category: str
    effect_type: str
    conferred_phenotype: str
    risk_modifier_direction: str
    base_genomic_protection_score: float
    environmental_interaction: str
    evidence_level: str
    citations: List[Citation] = field(default_factory=list)


@dataclass
class VariantKBEntry:
    variant_id: str
    chrom: str
    canonical_chrom: str
    chrom_num: int
    pos: int
    ref: str
    alt: str
    gene_symbol: str
    gene_id: str
    transcript_id: str
    variant_type: str
    consequence: str
    protein_change: str
    codon_change: str
    allele_classification: str
    inheritance_mode: str
    evidence_level: str
    annotation_summary: str
    associations: List[AssociationEntry] = field(default_factory=list)


class GenomicKnowledgeBase:
    """
    Curated knowledge base interface with indexed genomic lookups.
    """

    def __init__(self, variants_path: Optional[str] = None, associations_path: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.variants_path = variants_path or os.path.join(base_dir, "data", "genomic_kb", "variants.json")
        self.associations_path = associations_path or os.path.join(base_dir, "data", "genomic_kb", "associations.json")
        
        self.variants: List[VariantKBEntry] = []
        self.associations: List[AssociationEntry] = []
        
        # Fast lookup indices
        self._exact_allele_index: Dict[Tuple[str, int, str, str], VariantKBEntry] = {}
        self._pos_index: Dict[Tuple[str, int], List[VariantKBEntry]] = {}
        self._gene_id_index: Dict[str, List[VariantKBEntry]] = {}
        self._gene_symbol_index: Dict[str, List[VariantKBEntry]] = {}
        self._gene_assoc_index: Dict[str, List[AssociationEntry]] = {}
        
        self.load()

    def load(self):
        """Loads and indexes variants and association databases."""
        if not os.path.exists(self.variants_path) or not os.path.exists(self.associations_path):
            raise FileNotFoundError(
                f"Genomic Knowledge Base files not found at {self.variants_path} or {self.associations_path}"
            )

        with open(self.associations_path, "r", encoding="utf-8") as f:
            assoc_data = json.load(f)

        for a in assoc_data.get("associations", []):
            citations = [
                Citation(
                    title=c.get("title", ""),
                    authors=c.get("authors", ""),
                    journal=c.get("journal", ""),
                    year=c.get("year", 0),
                    pmid=c.get("pmid"),
                    doi=c.get("doi")
                )
                for c in a.get("citations", [])
            ]
            assoc_entry = AssociationEntry(
                association_id=a["association_id"],
                gene_symbol=a["gene_symbol"],
                gene_id=a["gene_id"],
                target_condition=a["target_condition"],
                pathogen_scientific_name=a["pathogen_scientific_name"],
                disease_category=a["disease_category"],
                effect_type=a["effect_type"],
                conferred_phenotype=a["conferred_phenotype"],
                risk_modifier_direction=a["risk_modifier_direction"],
                base_genomic_protection_score=float(a["base_genomic_protection_score"]),
                environmental_interaction=a["environmental_interaction"],
                evidence_level=a["evidence_level"],
                citations=citations
            )
            self.associations.append(assoc_entry)
            self._gene_assoc_index.setdefault(assoc_entry.gene_id, []).append(assoc_entry)

        with open(self.variants_path, "r", encoding="utf-8") as f:
            var_data = json.load(f)

        for v in var_data.get("variants", []):
            canonical_chrom = normalize_chromosome(v["chrom"])
            entry = VariantKBEntry(
                variant_id=v["variant_id"],
                chrom=v["chrom"],
                canonical_chrom=canonical_chrom,
                chrom_num=v.get("chrom_num", 0),
                pos=int(v["pos"]),
                ref=v["ref"].upper(),
                alt=v["alt"].upper(),
                gene_symbol=v["gene_symbol"],
                gene_id=v["gene_id"],
                transcript_id=v["transcript_id"],
                variant_type=v["variant_type"],
                consequence=v["consequence"],
                protein_change=v["protein_change"],
                codon_change=v["codon_change"],
                allele_classification=v["allele_classification"],
                inheritance_mode=v["inheritance_mode"],
                evidence_level=v["evidence_level"],
                annotation_summary=v["annotation_summary"],
                associations=self._gene_assoc_index.get(v["gene_id"], [])
            )
            self.variants.append(entry)
            
            # Indexing
            exact_key = (canonical_chrom, entry.pos, entry.ref, entry.alt)
            self._exact_allele_index[exact_key] = entry
            
            pos_key = (canonical_chrom, entry.pos)
            self._pos_index.setdefault(pos_key, []).append(entry)
            
            self._gene_id_index.setdefault(entry.gene_id, []).append(entry)
            self._gene_symbol_index.setdefault(entry.gene_symbol.lower(), []).append(entry)

    def lookup_exact_allele(self, chrom: str, pos: int, ref: str, alt: str) -> Optional[VariantKBEntry]:
        """Looks up a specific allele at exact coordinates."""
        canonical_chrom = normalize_chromosome(chrom)
        return self._exact_allele_index.get((canonical_chrom, pos, ref.upper(), alt.upper()))

    def lookup_position(self, chrom: str, pos: int) -> List[VariantKBEntry]:
        """Returns all known variants and alleles documented at this genomic coordinate."""
        canonical_chrom = normalize_chromosome(chrom)
        return self._pos_index.get((canonical_chrom, pos), [])

    def get_gene_associations(self, gene_id: str) -> List[AssociationEntry]:
        """Returns all validated disease/trait associations for a gene."""
        return self._gene_assoc_index.get(gene_id, [])

    def get_all_diseases(self) -> List[Dict[str, Any]]:
        """Returns a summarized list of all tracked diseases and their governing genes."""
        diseases = []
        for assoc in self.associations:
            diseases.append({
                "association_id": assoc.association_id,
                "target_condition": assoc.target_condition,
                "pathogen": assoc.pathogen_scientific_name,
                "category": assoc.disease_category,
                "gene_symbol": assoc.gene_symbol,
                "gene_id": assoc.gene_id,
                "base_protection": assoc.base_genomic_protection_score,
                "evidence_level": assoc.evidence_level
            })
        return diseases
