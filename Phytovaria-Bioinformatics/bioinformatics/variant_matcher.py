"""
variant_matcher.py
==================
Biological variant interpretation and matching engine.
Maps parsed VCF genomic records against curated knowledge base evidence.
Strictly adheres to scientific evidence principles: unknown variants are classified
as 'Unknown / Insufficient Evidence' rather than arbitrarily assuming disease risk.
"""

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any

from .vcf_parser import VariantRecord
from .knowledge_base import GenomicKnowledgeBase, VariantKBEntry, AssociationEntry


@dataclass
class MatchedVariantResult:
    """
    Complete scientific annotation and clinical/agronomic interpretation
    of a single variant call.
    """
    chrom: str
    pos: int
    ref: str
    alt: str
    sample_id: str
    genotype: str                       # e.g., '0/1', '1/1', '0/0'
    zygosity: str                       # HOM_REF, HOM_ALT, HET, NO_CALL
    call_quality: Optional[float]
    filter_status: str
    
    # Knowledge Base Match Status
    match_status: str                   # EXACT_MATCH, NOVEL_ALLELE_AT_LOCUS, UNKNOWN_INSUFFICIENT_EVIDENCE
    gene_symbol: str
    gene_id: str
    protein_change: Optional[str]
    consequence: str
    
    # Phenotype & Clinical Interpretation
    allele_classification: str          # RESISTANT_ALLELE, SUSCEPTIBLE_ALLELE, AGRONOMIC_PHENOTYPE, UNKNOWN
    inferred_phenotype: str             # e.g., 'RESISTANT', 'MODERATE_TOLERANCE', 'SUSCEPTIBLE', 'INSUFFICIENT_EVIDENCE'
    confidence_level: str               # HIGH, MODERATE, LOW, UNKNOWN
    evidence_level: str                 # LEVEL_1_DEFINITIVE, LEVEL_2_MODERATE, LEVEL_3_PRELIMINARY, NO_EVIDENCE
    
    # Genomic Protection Score (0.0 = completely susceptible, 1.0 = full immunity, None = unknown)
    genomic_protection_score: Optional[float]
    
    # Summary & Citations
    interpretation: str
    associations: List[Dict[str, Any]] = field(default_factory=list)
    citations: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class VariantMatcher:
    """
    Interprets genomic variations by contextualizing them with scientific literature evidence.
    """

    def __init__(self, knowledge_base: GenomicKnowledgeBase):
        self.kb = knowledge_base

    def match_variant(self, record: VariantRecord, sample_id: Optional[str] = None) -> List[MatchedVariantResult]:
        """
        Evaluates all alternative alleles in a variant record and returns matched interpretations.
        """
        results: List[MatchedVariantResult] = []
        target_sample = sample_id or (list(record.samples.keys())[0] if record.samples else "SAMPLE_1")
        sample_info = record.samples.get(target_sample)
        
        raw_gt = sample_info.raw_gt if sample_info else (record.primary_genotype or "./.")
        zygosity = sample_info.zygosity if sample_info else record.primary_zygosity

        alts = record.alt if record.alt else [record.ref]

        for alt_allele in alts:
            # Step 1: Attempt exact allele lookup in Knowledge Base
            kb_entry = self.kb.lookup_exact_allele(record.canonical_chrom, record.pos, record.ref, alt_allele)
            
            if kb_entry:
                res = self._interpret_known_variant(record, alt_allele, kb_entry, target_sample, raw_gt, zygosity)
                results.append(res)
                continue

            # Step 2: Check if locus/gene is documented, but the allele is novel
            pos_matches = self.kb.lookup_position(record.canonical_chrom, record.pos)
            if pos_matches:
                res = self._interpret_novel_allele_at_known_locus(
                    record, alt_allele, pos_matches[0], target_sample, raw_gt, zygosity
                )
                results.append(res)
                continue

            # Step 3: Uncatalogued variant -> strictly classify as Unknown / Insufficient Evidence
            res = self._interpret_unknown_variant(record, alt_allele, target_sample, raw_gt, zygosity)
            results.append(res)

        return results

    def _interpret_known_variant(
        self,
        record: VariantRecord,
        alt: str,
        kb_entry: VariantKBEntry,
        sample_id: str,
        gt: str,
        zygosity: str
    ) -> MatchedVariantResult:
        """Determines zygosity-specific penetrance and phenotype for curated variants."""
        allele_class = kb_entry.allele_classification
        inheritance = kb_entry.inheritance_mode
        base_score = 0.0
        
        if kb_entry.associations:
            base_score = kb_entry.associations[0].base_genomic_protection_score

        inferred_phenotype = "UNKNOWN"
        protection_score = 0.0
        confidence = "HIGH"

        if allele_class == "RESISTANT_ALLELE":
            if inheritance == "DOMINANT":
                if zygosity in ("HOM_ALT", "HET"):
                    inferred_phenotype = "CONFERRED_RESISTANCE"
                    protection_score = base_score
                elif zygosity == "HOM_REF":
                    inferred_phenotype = "SUSCEPTIBLE"
                    protection_score = 0.05
                else:
                    inferred_phenotype = "INSUFFICIENT_EVIDENCE"
                    protection_score = None
            elif inheritance == "SEMI_DOMINANT":
                if zygosity == "HOM_ALT":
                    inferred_phenotype = "CONFERRED_RESISTANCE"
                    protection_score = base_score
                elif zygosity == "HET":
                    inferred_phenotype = "MODERATE_TOLERANCE"
                    protection_score = round(base_score * 0.65, 2)
                elif zygosity == "HOM_REF":
                    inferred_phenotype = "SUSCEPTIBLE"
                    protection_score = 0.05
                else:
                    inferred_phenotype = "INSUFFICIENT_EVIDENCE"
                    protection_score = None
            elif inheritance == "RECESSIVE":
                if zygosity == "HOM_ALT":
                    inferred_phenotype = "CONFERRED_RESISTANCE"
                    protection_score = base_score
                elif zygosity == "HET":
                    inferred_phenotype = "HETEROZYGOUS_CARRIER_SUSCEPTIBLE"
                    protection_score = 0.15
                elif zygosity == "HOM_REF":
                    inferred_phenotype = "SUSCEPTIBLE"
                    protection_score = 0.05
                else:
                    inferred_phenotype = "INSUFFICIENT_EVIDENCE"
                    protection_score = None

        elif allele_class == "SUSCEPTIBLE_ALLELE":
            # For alleles representing a loss-of-function susceptibility (e.g. Ve1 stop codon)
            if zygosity == "HOM_ALT":
                inferred_phenotype = "SUSCEPTIBLE"
                protection_score = 0.05
            elif zygosity == "HET":
                inferred_phenotype = "CONFERRED_RESISTANCE" if inheritance == "RECESSIVE_SUSCEPTIBILITY" else "MODERATE_RISK"
                protection_score = 0.70 if inheritance == "RECESSIVE_SUSCEPTIBILITY" else 0.40
            elif zygosity == "HOM_REF":
                inferred_phenotype = "CONFERRED_RESISTANCE"
                protection_score = 0.90
            else:
                inferred_phenotype = "INSUFFICIENT_EVIDENCE"
                protection_score = None

        elif allele_class == "AGRONOMIC_PHENOTYPE":
            inferred_phenotype = "AGRONOMIC_EXPRESSION"
            protection_score = 0.00
            confidence = "HIGH"

        # Build association list
        assoc_list = []
        citation_list = []
        for a in kb_entry.associations:
            assoc_list.append({
                "association_id": a.association_id,
                "target_condition": a.target_condition,
                "pathogen": a.pathogen_scientific_name,
                "disease_category": a.disease_category,
                "effect_type": a.effect_type,
                "conferred_phenotype": a.conferred_phenotype,
                "risk_modifier_direction": a.risk_modifier_direction,
                "environmental_interaction": a.environmental_interaction
            })
            for c in a.citations:
                citation_list.append({
                    "title": c.title,
                    "authors": c.authors,
                    "journal": c.journal,
                    "year": c.year,
                    "pmid": c.pmid,
                    "doi": c.doi
                })

        interpretation_text = (
            f"Genotype '{gt}' ({zygosity}) at {kb_entry.gene_symbol} ({kb_entry.protein_change}). "
            f"Result: {inferred_phenotype.replace('_', ' ').title()}. {kb_entry.annotation_summary}"
        )

        return MatchedVariantResult(
            chrom=record.chrom,
            pos=record.pos,
            ref=record.ref,
            alt=alt,
            sample_id=sample_id,
            genotype=gt,
            zygosity=zygosity,
            call_quality=record.qual,
            filter_status=record.filter,
            match_status="EXACT_MATCH",
            gene_symbol=kb_entry.gene_symbol,
            gene_id=kb_entry.gene_id,
            protein_change=kb_entry.protein_change,
            consequence=kb_entry.consequence,
            allele_classification=allele_class,
            inferred_phenotype=inferred_phenotype,
            confidence_level=confidence,
            evidence_level=kb_entry.evidence_level,
            genomic_protection_score=protection_score,
            interpretation=interpretation_text,
            associations=assoc_list,
            citations=citation_list
        )

    def _interpret_novel_allele_at_known_locus(
        self,
        record: VariantRecord,
        alt: str,
        pos_entry: VariantKBEntry,
        sample_id: str,
        gt: str,
        zygosity: str
    ) -> MatchedVariantResult:
        """Handles cases where coordinate is at a known resistance gene, but allele differs."""
        return MatchedVariantResult(
            chrom=record.chrom,
            pos=record.pos,
            ref=record.ref,
            alt=alt,
            sample_id=sample_id,
            genotype=gt,
            zygosity=zygosity,
            call_quality=record.qual,
            filter_status=record.filter,
            match_status="NOVEL_ALLELE_AT_LOCUS",
            gene_symbol=pos_entry.gene_symbol,
            gene_id=pos_entry.gene_id,
            protein_change=None,
            consequence=f"{record.variant_type.lower()}_variant",
            allele_classification="UNKNOWN",
            inferred_phenotype="INSUFFICIENT_EVIDENCE",
            confidence_level="LOW",
            evidence_level="NO_EVIDENCE",
            genomic_protection_score=None,
            interpretation=(
                f"Variant occurs at locus of {pos_entry.gene_symbol} ({record.chrom}:{record.pos} {record.ref}>{alt}), "
                f"but this specific alternate allele has no peer-reviewed disease outcome data. "
                f"Classified strictly as Unknown / Insufficient Evidence."
            ),
            associations=[],
            citations=[]
        )

    def _interpret_unknown_variant(
        self,
        record: VariantRecord,
        alt: str,
        sample_id: str,
        gt: str,
        zygosity: str
    ) -> MatchedVariantResult:
        """Handles completely uncatalogued genomic variants."""
        return MatchedVariantResult(
            chrom=record.chrom,
            pos=record.pos,
            ref=record.ref,
            alt=alt,
            sample_id=sample_id,
            genotype=gt,
            zygosity=zygosity,
            call_quality=record.qual,
            filter_status=record.filter,
            match_status="UNKNOWN_INSUFFICIENT_EVIDENCE",
            gene_symbol="Uncharacterized / Novel Locus",
            gene_id="N/A",
            protein_change=None,
            consequence=f"{record.variant_type.lower()}_variant",
            allele_classification="UNKNOWN",
            inferred_phenotype="INSUFFICIENT_EVIDENCE",
            confidence_level="UNKNOWN",
            evidence_level="NO_EVIDENCE",
            genomic_protection_score=None,
            interpretation=(
                f"Genomic variation at {record.chrom}:{record.pos} ({record.ref}>{alt}). "
                f"No verified disease or trait association exists in the curated tomato knowledge base. "
                f"Classified strictly as Unknown / Insufficient Evidence."
            ),
            associations=[],
            citations=[]
        )
