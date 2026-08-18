"""
vcf_parser.py
==============
Robust, resilient VCF (Variant Call Format v4.1/v4.2/v4.3) parser.
Pure Python standard library implementation for zero-dependency reliability,
with automatic chromosome normalization and multi-sample / multi-allelic support.
"""

import gzip
import io
import re
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any, Union, Generator


# Canonical chromosome mapping for Solanum lycopersicum (Tomato)
# Reference: SL4.0 / ITAG4.0 (and legacy SL2.5/SL3.0)
CHROMOSOME_ALIASES: Dict[str, str] = {
    # Standard numbers
    "1": "SL4.0ch01", "2": "SL4.0ch02", "3": "SL4.0ch03", "4": "SL4.0ch04",
    "5": "SL4.0ch05", "6": "SL4.0ch06", "7": "SL4.0ch07", "8": "SL4.0ch08",
    "9": "SL4.0ch09", "10": "SL4.0ch10", "11": "SL4.0ch11", "12": "SL4.0ch12",
    # chr prefixes
    "chr1": "SL4.0ch01", "chr2": "SL4.0ch02", "chr3": "SL4.0ch03", "chr4": "SL4.0ch04",
    "chr5": "SL4.0ch05", "chr6": "SL4.0ch06", "chr7": "SL4.0ch07", "chr8": "SL4.0ch08",
    "chr9": "SL4.0ch09", "chr10": "SL4.0ch10", "chr11": "SL4.0ch11", "chr12": "SL4.0ch12",
    "chr01": "SL4.0ch01", "chr02": "SL4.0ch02", "chr03": "SL4.0ch03", "chr04": "SL4.0ch04",
    "chr05": "SL4.0ch05", "chr06": "SL4.0ch06", "chr07": "SL4.0ch07", "chr08": "SL4.0ch08",
    "chr09": "SL4.0ch09",
    # ch prefixes
    "ch01": "SL4.0ch01", "ch02": "SL4.0ch02", "ch03": "SL4.0ch03", "ch04": "SL4.0ch04",
    "ch05": "SL4.0ch05", "ch06": "SL4.0ch06", "ch07": "SL4.0ch07", "ch08": "SL4.0ch08",
    "ch09": "SL4.0ch09", "ch10": "SL4.0ch10", "ch11": "SL4.0ch11", "ch12": "SL4.0ch12",
    # SL3.0 & SL4.0 exact
    "sl4.0ch01": "SL4.0ch01", "sl4.0ch02": "SL4.0ch02", "sl4.0ch03": "SL4.0ch03", "sl4.0ch04": "SL4.0ch04",
    "sl4.0ch05": "SL4.0ch05", "sl4.0ch06": "SL4.0ch06", "sl4.0ch07": "SL4.0ch07", "sl4.0ch08": "SL4.0ch08",
    "sl4.0ch09": "SL4.0ch09", "sl4.0ch10": "SL4.0ch10", "sl4.0ch11": "SL4.0ch11", "sl4.0ch12": "SL4.0ch12",
    "sl3.0ch01": "SL4.0ch01", "sl3.0ch02": "SL4.0ch02", "sl3.0ch03": "SL4.0ch03", "sl3.0ch04": "SL4.0ch04",
    "sl3.0ch05": "SL4.0ch05", "sl3.0ch06": "SL4.0ch06", "sl3.0ch07": "SL4.0ch07", "sl3.0ch08": "SL4.0ch08",
    "sl3.0ch09": "SL4.0ch09", "sl3.0ch10": "SL4.0ch10", "sl3.0ch11": "SL4.0ch11", "sl3.0ch12": "SL4.0ch12",
    # Chloroplast & Mitochondria
    "chrc": "SL4.0ch00_chloroplast", "chrm": "SL4.0ch00_mitochondria",
    "chloroplast": "SL4.0ch00_chloroplast", "mitochondria": "SL4.0ch00_mitochondria",
}


def normalize_chromosome(chrom: str) -> str:
    """
    Normalizes arbitrary chromosome identifiers to canonical SL4.0 format.
    E.g., 'chr9', '9', 'ch09', 'SL4.0ch09' -> 'SL4.0ch09'
    """
    cleaned = chrom.strip().lower()
    if cleaned in CHROMOSOME_ALIASES:
        return CHROMOSOME_ALIASES[cleaned]
    # Handle uppercase or standard prefix
    upper_cleaned = chrom.strip().upper()
    if upper_cleaned.startswith("SL4.0CH"):
        return f"SL4.0ch{upper_cleaned[7:].zfill(2)}"
    return chrom.strip()


def get_chromosome_number(chrom: str) -> Optional[int]:
    """Extracts integer chromosome number (1..12) if present."""
    match = re.search(r'(?:chr|ch|sl[0-9]\.[0-9]ch)?0?([1-9]|1[0-2])$', chrom.strip(), re.IGNORECASE)
    if match:
        return int(match.group(1))
    return None


@dataclass
class GenotypeInfo:
    """Represents sample-specific genotype information."""
    raw_gt: str = "./."
    allele_indices: List[Optional[int]] = field(default_factory=list)
    phased: bool = False
    zygosity: str = "UNKNOWN"  # HOM_REF, HOM_ALT, HET, NO_CALL
    depth: Optional[int] = None
    genotype_quality: Optional[float] = None
    allele_depth: List[int] = field(default_factory=list)

    @classmethod
    def parse(cls, gt_str: str, format_keys: List[str], sample_values: List[str]) -> "GenotypeInfo":
        data = dict(zip(format_keys, sample_values))
        raw_gt = data.get("GT", gt_str or "./.")
        
        phased = "|" in raw_gt
        delims = ["|", "/"]
        parts = [raw_gt]
        for d in delims:
            if d in raw_gt:
                parts = raw_gt.split(d)
                break
        
        indices = []
        for p in parts:
            p = p.strip()
            if p.isdigit():
                indices.append(int(p))
            else:
                indices.append(None)
                
        # Determine zygosity
        if not indices or all(idx is None for idx in indices):
            zygosity = "NO_CALL"
        elif all(idx == 0 for idx in indices):
            zygosity = "HOM_REF"
        elif len(set(indices)) == 1 and indices[0] is not None and indices[0] > 0:
            zygosity = "HOM_ALT"
        else:
            zygosity = "HET"

        # Parse Depth (DP)
        dp = None
        if "DP" in data and data["DP"].isdigit():
            dp = int(data["DP"])
            
        # Parse GQ
        gq = None
        if "GQ" in data:
            try:
                gq = float(data["GQ"])
            except ValueError:
                gq = None
                
        # Parse AD
        ad_list = []
        if "AD" in data:
            for ad_val in data["AD"].split(","):
                if ad_val.strip().isdigit():
                    ad_list.append(int(ad_val.strip()))

        return cls(
            raw_gt=raw_gt,
            allele_indices=indices,
            phased=phased,
            zygosity=zygosity,
            depth=dp,
            genotype_quality=gq,
            allele_depth=ad_list
        )


@dataclass
class VariantRecord:
    """
    Represents a fully parsed single genomic variant record.
    """
    chrom: str
    canonical_chrom: str
    pos: int
    id: Optional[str]
    ref: str
    alt: List[str]
    qual: Optional[float]
    filter: str
    info: Dict[str, Any]
    format: List[str]
    samples: Dict[str, GenotypeInfo]
    variant_type: str = "SNP"  # SNP, INDEL, MNP, STRUCTURAL
    primary_genotype: Optional[str] = None  # e.g., '0/1', '1/1'
    primary_zygosity: str = "UNKNOWN"       # HOM_REF, HOM_ALT, HET, NO_CALL

    def to_dict(self) -> Dict[str, Any]:
        """Converts record to JSON-serializable dictionary."""
        d = asdict(self)
        return d


class VCFParser:
    """
    Resilient, streamable VCF Parser.
    Handles standard VCF 4.0-4.3 files with comprehensive metadata preservation.
    """

    def __init__(self, filepath_or_buffer: Union[str, io.IOBase]):
        self.source = filepath_or_buffer
        self.metadata: Dict[str, Any] = {
            "fileformat": None,
            "reference": None,
            "headers": [],
            "info_definitions": {},
            "format_definitions": {},
            "samples": []
        }
        self.header_parsed = False

    def _open_stream(self):
        """Opens file handle, handling gzip compression seamlessly."""
        if isinstance(self.source, (io.IOBase, io.StringIO)):
            return self.source
        
        filepath = str(self.source)
        if filepath.endswith(".gz"):
            return gzip.open(filepath, mode="rt", encoding="utf-8", errors="replace")
        return open(filepath, mode="r", encoding="utf-8", errors="replace")

    def _determine_variant_type(self, ref: str, alts: List[str]) -> str:
        """Determines if the variant is a SNP, INDEL, or complex MNP."""
        ref_len = len(ref)
        if not alts:
            return "UNKNOWN"
        
        has_len_diff = any(len(alt) != ref_len for alt in alts)
        if has_len_diff:
            return "INDEL"
        
        if ref_len == 1 and all(len(alt) == 1 for alt in alts):
            return "SNP"
        
        return "MNP"

    def _parse_info_field(self, info_str: str) -> Dict[str, Any]:
        """Parses standard INFO tag string into typed dictionary."""
        info_dict = {}
        if not info_str or info_str == ".":
            return info_dict

        items = info_str.split(";")
        for item in items:
            if not item:
                continue
            if "=" in item:
                k, v = item.split("=", 1)
                k = k.strip()
                v = v.strip()
                # Parse numeric if possible
                if v.isdigit():
                    info_dict[k] = int(v)
                else:
                    try:
                        info_dict[k] = float(v)
                    except ValueError:
                        info_dict[k] = v
            else:
                # Boolean flag
                info_dict[item.strip()] = True
        return info_dict

    def parse_header(self) -> Dict[str, Any]:
        """Parses header lines without loading all records into memory."""
        stream = self._open_stream()
        should_close = not isinstance(self.source, io.IOBase)
        
        try:
            for line in stream:
                line = line.strip()
                if not line:
                    continue
                if line.startswith("##"):
                    self.metadata["headers"].append(line)
                    if line.startswith("##fileformat="):
                        self.metadata["fileformat"] = line.split("=", 1)[1]
                    elif line.startswith("##reference="):
                        self.metadata["reference"] = line.split("=", 1)[1]
                elif line.startswith("#CHROM"):
                    cols = line[1:].split("\t")
                    if len(cols) > 9:
                        self.metadata["samples"] = cols[9:]
                    self.header_parsed = True
                    break
        finally:
            if should_close:
                stream.close()
                
        return self.metadata

    def parse_records(self) -> Generator[VariantRecord, None, None]:
        """
        Yields VariantRecord objects sequentially.
        Scales efficiently to large VCF files.
        """
        stream = self._open_stream()
        should_close = not isinstance(self.source, io.IOBase)
        
        samples = []
        try:
            for line in stream:
                line = line.strip()
                if not line:
                    continue
                if line.startswith("##"):
                    continue
                if line.startswith("#CHROM"):
                    cols = line[1:].split("\t")
                    if len(cols) > 9:
                        samples = cols[9:]
                        self.metadata["samples"] = samples
                    continue

                parts = line.split("\t")
                if len(parts) < 8:
                    continue  # Malformed line

                chrom = parts[0].strip()
                try:
                    pos = int(parts[1].strip())
                except ValueError:
                    continue  # Invalid position

                var_id = parts[2].strip() if parts[2].strip() != "." else None
                ref = parts[3].strip().upper()
                alts = [alt.strip().upper() for alt in parts[4].split(",") if alt.strip()]
                
                try:
                    qual = float(parts[5].strip()) if parts[5].strip() != "." else None
                except ValueError:
                    qual = None

                filter_val = parts[6].strip()
                info = self._parse_info_field(parts[7])

                format_keys = []
                sample_data: Dict[str, GenotypeInfo] = {}

                if len(parts) > 8:
                    format_keys = parts[8].strip().split(":")
                    for i, s_name in enumerate(samples):
                        col_idx = 9 + i
                        if col_idx < len(parts):
                            sample_val_str = parts[col_idx].strip()
                            s_vals = sample_val_str.split(":")
                            sample_data[s_name] = GenotypeInfo.parse(
                                gt_str=s_vals[0] if s_vals else "./.",
                                format_keys=format_keys,
                                sample_values=s_vals
                            )

                # Identify primary sample genotype (first sample if present)
                primary_gt = None
                primary_zyg = "UNKNOWN"
                if samples and samples[0] in sample_data:
                    p_info = sample_data[samples[0]]
                    primary_gt = p_info.raw_gt
                    primary_zyg = p_info.zygosity

                yield VariantRecord(
                    chrom=chrom,
                    canonical_chrom=normalize_chromosome(chrom),
                    pos=pos,
                    id=var_id,
                    ref=ref,
                    alt=alts,
                    qual=qual,
                    filter=filter_val,
                    info=info,
                    format=format_keys,
                    samples=sample_data,
                    variant_type=self._determine_variant_type(ref, alts),
                    primary_genotype=primary_gt,
                    primary_zygosity=primary_zyg
                )
        finally:
            if should_close:
                stream.close()

    def parse_all(self) -> List[VariantRecord]:
        """Parses and returns all variant records in a single list."""
        return list(self.parse_records())
