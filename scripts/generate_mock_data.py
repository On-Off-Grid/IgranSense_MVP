#!/usr/bin/env python3
"""
IgranSense Mock Data Generator

Generates realistic 30-day sensor data for the edge simulation service.
Creates compelling narratives for each farm:

Farm 1 (North Valley Farm):
- Field 1: Starts healthy, degrades to critical (needs irrigation urgently)
- Field 2: Moderate stress, warning zone
- Field 3: Stays healthy throughout (well-irrigated)

Farm 2 (Coastal Olive Grove):
- Field 4: Healthy olive grove
- Field 5: Slight water stress
- Field 6: Citrus orchard - healthy
- Field 7: Vegetable patch - warning
- Field 8: Vegetable patch - critical

Farm 3 (Atlas Highlands Farm):
- Field 9: Date palms - healthy
- Field 10: Date palms - moderate stress
"""

import json
import random
import math
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Output directory
DATA_DIR = Path(__file__).parent.parent / "backend" / "souhail-edge-sim" / "data"

# Configuration
DAYS = 30
READINGS_PER_DAY = 48  # Every 30 minutes
END_DATE = datetime(2026, 2, 28, 6, 0, 0, tzinfo=timezone.utc)
START_DATE = END_DATE - timedelta(days=DAYS)

# Sensor definitions (matching sensors.json)
SENSORS = [
    # Farm 1 - North Valley Farm
    {"sensor_id": "SM_F1_01", "field_id": "field_1", "farm_id": "farm_1", "type": "soil_moisture"},
    {"sensor_id": "SM_F1_02", "field_id": "field_1", "farm_id": "farm_1", "type": "soil_moisture"},
    {"sensor_id": "TH_F1_01", "field_id": "field_1", "farm_id": "farm_1", "type": "temperature"},
    {"sensor_id": "TH_F1_02", "field_id": "field_1", "farm_id": "farm_1", "type": "humidity"},
    {"sensor_id": "SM_F2_01", "field_id": "field_2", "farm_id": "farm_1", "type": "soil_moisture"},
    {"sensor_id": "SM_F2_02", "field_id": "field_2", "farm_id": "farm_1", "type": "soil_moisture"},
    {"sensor_id": "TH_F2_01", "field_id": "field_2", "farm_id": "farm_1", "type": "temperature"},
    {"sensor_id": "TH_F2_02", "field_id": "field_2", "farm_id": "farm_1", "type": "humidity"},
    {"sensor_id": "SM_F3_01", "field_id": "field_3", "farm_id": "farm_1", "type": "soil_moisture"},
    {"sensor_id": "TH_F3_01", "field_id": "field_3", "farm_id": "farm_1", "type": "temperature"},
    # Farm 2 - Coastal Olive Grove
    {"sensor_id": "SM_F4_01", "field_id": "field_4", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "SM_F4_02", "field_id": "field_4", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "TH_F4_01", "field_id": "field_4", "farm_id": "farm_2", "type": "temperature"},
    {"sensor_id": "SM_F5_01", "field_id": "field_5", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "SM_F5_02", "field_id": "field_5", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "TH_F5_01", "field_id": "field_5", "farm_id": "farm_2", "type": "temperature"},
    {"sensor_id": "SM_F6_01", "field_id": "field_6", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "TH_F6_01", "field_id": "field_6", "farm_id": "farm_2", "type": "temperature"},
    {"sensor_id": "SM_F7_01", "field_id": "field_7", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "TH_F7_01", "field_id": "field_7", "farm_id": "farm_2", "type": "temperature"},
    {"sensor_id": "SM_F8_01", "field_id": "field_8", "farm_id": "farm_2", "type": "soil_moisture"},
    {"sensor_id": "TH_F8_01", "field_id": "field_8", "farm_id": "farm_2", "type": "temperature"},
    # Farm 3 - Atlas Highlands Farm
    {"sensor_id": "SM_F9_01", "field_id": "field_9", "farm_id": "farm_3", "type": "soil_moisture"},
    {"sensor_id": "SM_F9_02", "field_id": "field_9", "farm_id": "farm_3", "type": "soil_moisture"},
    {"sensor_id": "TH_F9_01", "field_id": "field_9", "farm_id": "farm_3", "type": "temperature"},
    {"sensor_id": "SM_F10_01", "field_id": "field_10", "farm_id": "farm_3", "type": "soil_moisture"},
    {"sensor_id": "TH_F10_01", "field_id": "field_10", "farm_id": "farm_3", "type": "temperature"},
]

# Field configurations for soil moisture trends
FIELD_CONFIG = {
    # Farm 1 - North Valley Farm
    "field_1": {"start": 35.0, "end": 14.0, "status": "critical"},  # Dramatic decline
    "field_2": {"start": 30.0, "end": 21.0, "status": "warning"},   # Moderate decline
    "field_3": {"start": 32.0, "end": 34.0, "status": "ok"},        # Stable
    # Farm 2 - Coastal Olive Grove
    "field_4": {"start": 38.0, "end": 36.0, "status": "ok"},        # Healthy olives
    "field_5": {"start": 32.0, "end": 23.0, "status": "warning"},   # Slight stress
    "field_6": {"start": 40.0, "end": 38.0, "status": "ok"},        # Healthy citrus
    "field_7": {"start": 28.0, "end": 19.0, "status": "warning"},   # Vegetable stress
    "field_8": {"start": 25.0, "end": 12.0, "status": "critical"},  # Critical vegetables
    # Farm 3 - Atlas Highlands Farm
    "field_9": {"start": 35.0, "end": 33.0, "status": "ok"},        # Healthy dates
    "field_10": {"start": 30.0, "end": 22.0, "status": "warning"},  # Moderate stress
}

# NDVI configurations
NDVI_CONFIG = {
    "field_1": {"start": 0.65, "end": 0.32},
    "field_2": {"start": 0.58, "end": 0.48},
    "field_3": {"start": 0.68, "end": 0.72},
    "field_4": {"start": 0.72, "end": 0.70},
    "field_5": {"start": 0.65, "end": 0.55},
    "field_6": {"start": 0.75, "end": 0.73},
    "field_7": {"start": 0.60, "end": 0.45},
    "field_8": {"start": 0.55, "end": 0.28},
    "field_9": {"start": 0.62, "end": 0.60},
    "field_10": {"start": 0.58, "end": 0.50},
}


def generate_daily_temp_cycle(hour: int, base_temp: float = 20.0) -> float:
    """Generate realistic temperature based on hour of day."""
    hour_offset = (hour - 6) % 24
    temp_variation = 8 * math.sin(math.pi * (hour_offset - 4) / 12)
    noise = random.uniform(-1.5, 1.5)
    return round(base_temp + temp_variation + noise, 1)


def generate_humidity(hour: int, base_humidity: float = 55.0) -> float:
    """Generate humidity inversely related to temperature."""
    hour_offset = (hour - 6) % 24
    humidity_variation = -15 * math.sin(math.pi * (hour_offset - 4) / 12)
    noise = random.uniform(-5, 5)
    return round(max(30, min(85, base_humidity + humidity_variation + noise)), 1)


def generate_soil_moisture_trend(day: int, field_id: str, hour: int) -> float:
    """Generate soil moisture with field-specific trends."""
    config = FIELD_CONFIG.get(field_id, {"start": 30.0, "end": 30.0})
    start = config["start"]
    end = config["end"]
    
    # Linear interpolation with some variation
    base = start - (start - end) * (day / DAYS)
    
    # Daily variation: slightly lower in afternoon (evaporation)
    hour_effect = -2 * (1 if 10 <= hour <= 18 else 0)
    noise = random.uniform(-1, 1)
    
    return round(max(8, min(45, base + hour_effect + noise)), 1)


def generate_readings() -> list:
    """Generate all sensor readings for 30 days."""
    readings = []
    
    current = START_DATE
    day = 0
    
    while current <= END_DATE:
        hour = current.hour
        
        for sensor in SENSORS:
            if sensor["type"] == "soil_moisture":
                value = generate_soil_moisture_trend(day, sensor["field_id"], hour)
                unit = "%"
            elif sensor["type"] == "temperature":
                # Slight variation between farms (coastal cooler, highlands warmer days)
                if sensor["farm_id"] == "farm_2":
                    base_temp = 19  # Coastal - cooler
                elif sensor["farm_id"] == "farm_3":
                    base_temp = 24  # Highlands - warmer days
                else:
                    base_temp = 22  # Default
                value = generate_daily_temp_cycle(hour, base_temp)
                unit = "°C"
            elif sensor["type"] == "humidity":
                value = generate_humidity(hour)
                unit = "%"
            else:
                continue
            
            readings.append({
                "timestamp": current.isoformat().replace("+00:00", "Z"),
                "sensor_id": sensor["sensor_id"],
                "value": value,
                "unit": unit,
                "quality_flag": "good"
            })
        
        current += timedelta(minutes=30)
        if current.hour == 0 and current.minute == 0:
            day += 1
    
    # Sort by timestamp descending (most recent first)
    readings.sort(key=lambda x: x["timestamp"], reverse=True)
    return readings


def generate_ndvi_snapshots() -> list:
    """Generate weekly NDVI snapshots for all fields."""
    snapshots = []
    
    # 5 weekly snapshots
    for week in range(5):
        date = (END_DATE - timedelta(weeks=4-week)).date()
        progress = week / 4  # 0 to 1
        
        for field_id, config in NDVI_CONFIG.items():
            ndvi = config["start"] - (config["start"] - config["end"]) * progress
            snapshots.append({
                "date": date.isoformat(),
                "field_id": field_id,
                "mean_ndvi": round(ndvi, 2),
                "min_ndvi": round(ndvi - 0.05, 2),
                "max_ndvi": round(ndvi + 0.06, 2)
            })
    
    # Sort by date descending
    snapshots.sort(key=lambda x: (x["date"], x["field_id"]), reverse=True)
    return snapshots


def main():
    print("🌱 IgranSense Mock Data Generator")
    print(f"   Generating {DAYS} days of data...")
    print(f"   Date range: {START_DATE.date()} to {END_DATE.date()}")
    print()
    
    # Generate readings
    print("📊 Generating sensor readings...")
    readings = generate_readings()
    readings_file = DATA_DIR / "readings.json"
    with open(readings_file, "w") as f:
        json.dump(readings, f, indent=2)
    print(f"   ✓ {len(readings)} readings written to {readings_file.name}")
    
    # Generate NDVI snapshots
    print("🛰️  Generating NDVI snapshots...")
    ndvi = generate_ndvi_snapshots()
    ndvi_file = DATA_DIR / "ndvi_snapshots.json"
    with open(ndvi_file, "w") as f:
        json.dump(ndvi, f, indent=2)
    print(f"   ✓ {len(ndvi)} snapshots written to {ndvi_file.name}")
    
    print()
    print("✅ Data generation complete!")
    print()
    print("📋 Summary by Farm:")
    print()
    print("🌿 Farm 1 - North Valley Farm:")
    print("   Field 1 (Tomato Block A): CRITICAL - soil moisture ~14%")
    print("   Field 2 (Tomato Block B): WARNING - soil moisture ~21%")
    print("   Field 3 (Tomato Block C): OK - soil moisture ~34%")
    print()
    print("🫒 Farm 2 - Coastal Olive Grove:")
    print("   Field 4 (Olive Grove North): OK - soil moisture ~36%")
    print("   Field 5 (Olive Grove South): WARNING - soil moisture ~23%")
    print("   Field 6 (Citrus Orchard): OK - soil moisture ~38%")
    print("   Field 7 (Vegetable Patch A): WARNING - soil moisture ~19%")
    print("   Field 8 (Vegetable Patch B): CRITICAL - soil moisture ~12%")
    print()
    print("🌴 Farm 3 - Atlas Highlands Farm:")
    print("   Field 9 (Date Palm East): OK - soil moisture ~33%")
    print("   Field 10 (Date Palm West): WARNING - soil moisture ~22%")


if __name__ == "__main__":
    main()
