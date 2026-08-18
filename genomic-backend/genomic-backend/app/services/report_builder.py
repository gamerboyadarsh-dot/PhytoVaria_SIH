"""
Aggregates plant + variant + risk + sensor data into one report payload.
No external logic here — just pulls together what other services/routers
already computed and stored. Safe to extend with PDF/HTML export later.
"""
from typing import Dict, List


def build_report(
    plant: Dict,
    variants: List[Dict],
    risk: Dict | None,
    sensor_readings: List[Dict],
) -> Dict:
    return {
        "plant": plant,
        "variant_summary": {
            "total_variants": len(variants),
            "variants": variants,
        },
        "risk_assessment": risk,
        "sensor_summary": {
            "total_readings": len(sensor_readings),
            "readings": sensor_readings,
        },
    }
