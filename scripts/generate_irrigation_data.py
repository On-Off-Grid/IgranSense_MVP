#!/usr/bin/env python3
"""Generate mock irrigation_events.json for the IgranSense edge simulator.

Produces ~180 realistic irrigation events across 10 fields / 3 farms
covering the same 30-day window as readings.json (Jan 30 → Feb 28, 2026).

Irrigation patterns:
  - Tomato blocks (farm_1): drip, every 2-3 days, 800-1500 L per event
  - Olive groves (farm_2 fields 4-5): drip, every 5-7 days, 1500-3000 L
  - Citrus (farm_2 field 6): sprinkler, every 3-4 days, 1000-2000 L
  - Vegetable patches (farm_2 fields 7-8): drip, every 2-3 days, 400-900 L
  - Date palms (farm_3): drip, every 4-6 days, 2000-4000 L
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "souhail-edge-sim" / "data"

# Field definitions: field_id, farm_id, area_ha, irrigation config
FIELD_CONFIGS = [
    # farm_1 — Tomato blocks
    {"field_id": "field_1", "farm_id": "farm_1", "area_ha": 2.5,
     "interval_days": (2, 3), "volume_range": (800, 1500), "method": "drip", "source_weights": {"scheduled": 0.6, "auto": 0.3, "manual": 0.1}},
    {"field_id": "field_2", "farm_id": "farm_1", "area_ha": 3.0,
     "interval_days": (2, 3), "volume_range": (900, 1600), "method": "drip", "source_weights": {"scheduled": 0.6, "auto": 0.3, "manual": 0.1}},
    {"field_id": "field_3", "farm_id": "farm_1", "area_ha": 2.0,
     "interval_days": (2, 4), "volume_range": (700, 1300), "method": "drip", "source_weights": {"scheduled": 0.5, "auto": 0.35, "manual": 0.15}},
    # farm_2 — Olive groves
    {"field_id": "field_4", "farm_id": "farm_2", "area_ha": 4.0,
     "interval_days": (5, 7), "volume_range": (1500, 3000), "method": "drip", "source_weights": {"scheduled": 0.7, "auto": 0.2, "manual": 0.1}},
    {"field_id": "field_5", "farm_id": "farm_2", "area_ha": 3.5,
     "interval_days": (5, 7), "volume_range": (1400, 2800), "method": "drip", "source_weights": {"scheduled": 0.7, "auto": 0.2, "manual": 0.1}},
    # farm_2 — Citrus
    {"field_id": "field_6", "farm_id": "farm_2", "area_ha": 2.8,
     "interval_days": (3, 4), "volume_range": (1000, 2000), "method": "sprinkler", "source_weights": {"scheduled": 0.5, "auto": 0.4, "manual": 0.1}},
    # farm_2 — Vegetable patches
    {"field_id": "field_7", "farm_id": "farm_2", "area_ha": 1.5,
     "interval_days": (2, 3), "volume_range": (400, 900), "method": "drip", "source_weights": {"scheduled": 0.5, "auto": 0.3, "manual": 0.2}},
    {"field_id": "field_8", "farm_id": "farm_2", "area_ha": 1.2,
     "interval_days": (2, 3), "volume_range": (350, 800), "method": "drip", "source_weights": {"scheduled": 0.5, "auto": 0.3, "manual": 0.2}},
    # farm_3 — Date palms
    {"field_id": "field_9", "farm_id": "farm_3", "area_ha": 5.0,
     "interval_days": (4, 6), "volume_range": (2000, 4000), "method": "drip", "source_weights": {"scheduled": 0.6, "auto": 0.3, "manual": 0.1}},
    {"field_id": "field_10", "farm_id": "farm_3", "area_ha": 4.5,
     "interval_days": (4, 6), "volume_range": (1800, 3500), "method": "drip", "source_weights": {"scheduled": 0.6, "auto": 0.3, "manual": 0.1}},
]

START_DATE = datetime(2026, 1, 30, 5, 0, 0)  # matches readings.json window
END_DATE = datetime(2026, 2, 28, 23, 59, 59)

def choose_source(weights: dict) -> str:
    return random.choices(list(weights.keys()), weights=list(weights.values()))[0]

def generate_events():
    events = []
    event_id = 1

    for cfg in FIELD_CONFIGS:
        cursor = START_DATE + timedelta(hours=random.randint(0, 12))
        while cursor < END_DATE:
            # Start time: early morning (4-7 AM) or evening (17-20)
            hour = random.choice([random.randint(4, 7), random.randint(17, 20)])
            start = cursor.replace(hour=hour, minute=random.randint(0, 59))
            # Duration: 30 min to 3 hours
            duration_min = random.randint(30, 180)
            end = start + timedelta(minutes=duration_min)
            volume = random.randint(*cfg["volume_range"])

            events.append({
                "event_id": f"irr_{event_id:04d}",
                "field_id": cfg["field_id"],
                "farm_id": cfg["farm_id"],
                "start_time": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "end_time": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "volume_liters": volume,
                "method": cfg["method"],
                "source": choose_source(cfg["source_weights"]),
            })
            event_id += 1
            # Next event after interval
            gap = random.randint(*cfg["interval_days"])
            cursor += timedelta(days=gap)

    # Sort by start_time
    events.sort(key=lambda e: e["start_time"])
    return events

if __name__ == "__main__":
    events = generate_events()
    out_path = DATA_DIR / "irrigation_events.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2)
    print(f"Generated {len(events)} irrigation events → {out_path}")
