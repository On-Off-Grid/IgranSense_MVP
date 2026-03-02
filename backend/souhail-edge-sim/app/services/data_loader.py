"""Data loading utilities for reading JSON files from the data directory."""

import json
from typing import List, Dict, Any
from functools import lru_cache

from ..config import DATA_DIR
from ..models import Sensor, Reading, NDVISnapshot, RulesConfig, FieldData


@lru_cache(maxsize=1)
def load_sensors() -> List[Sensor]:
    """Load sensor registry from sensors.json."""
    with open(DATA_DIR / "sensors.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Sensor(**item) for item in data]


@lru_cache(maxsize=1)
def load_readings() -> List[Reading]:
    """Load time-series readings from readings.json."""
    with open(DATA_DIR / "readings.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Reading(**item) for item in data]


@lru_cache(maxsize=1)
def load_ndvi_snapshots() -> List[NDVISnapshot]:
    """Load NDVI snapshots from ndvi_snapshots.json."""
    with open(DATA_DIR / "ndvi_snapshots.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [NDVISnapshot(**item) for item in data]


@lru_cache(maxsize=1)
def load_rules() -> RulesConfig:
    """Load agronomic rules from rules.json."""
    with open(DATA_DIR / "rules.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return RulesConfig(**data)


@lru_cache(maxsize=1)
def load_fields() -> List[FieldData]:
    """Load field geometry from fields.json."""
    with open(DATA_DIR / "fields.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [FieldData(**item) for item in data]


def get_fields_for_farm(farm_id: str = None) -> List[FieldData]:
    """Get fields, optionally filtered by farm."""
    fields = load_fields()
    if farm_id:
        return [f for f in fields if f.farm_id == farm_id]
    return fields


def get_field_ids(farm_id: str = None) -> List[str]:
    """Get unique field IDs from sensors, optionally filtered by farm."""
    sensors = load_sensors()
    if farm_id:
        sensors = [s for s in sensors if s.farm_id == farm_id]
    return list(set(s.field_id for s in sensors))


def get_sensors_for_field(field_id: str) -> List[Sensor]:
    """Get all sensors for a specific field."""
    sensors = load_sensors()
    return [s for s in sensors if s.field_id == field_id]


def get_sensors_for_farm(farm_id: str) -> List[Sensor]:
    """Get all sensors for a specific farm."""
    sensors = load_sensors()
    return [s for s in sensors if s.farm_id == farm_id]


def get_readings_for_sensor(sensor_id: str) -> List[Reading]:
    """Get all readings for a specific sensor, sorted by timestamp descending."""
    readings = load_readings()
    sensor_readings = [r for r in readings if r.sensor_id == sensor_id]
    return sorted(sensor_readings, key=lambda r: r.timestamp, reverse=True)


def get_readings_for_field(field_id: str, sensor_type: str) -> List[Reading]:
    """Get all readings for a field filtered by sensor type."""
    sensors = get_sensors_for_field(field_id)
    sensor_ids = {s.sensor_id for s in sensors if s.type == sensor_type}
    readings = load_readings()
    field_readings = [r for r in readings if r.sensor_id in sensor_ids]
    return sorted(field_readings, key=lambda r: r.timestamp, reverse=True)


def get_ndvi_for_field(field_id: str) -> List[NDVISnapshot]:
    """Get NDVI snapshots for a specific field, sorted by date descending."""
    snapshots = load_ndvi_snapshots()
    field_snapshots = [s for s in snapshots if s.field_id == field_id]
    return sorted(field_snapshots, key=lambda s: s.date, reverse=True)


def get_latest_soil_moisture(field_id: str) -> float:
    """Get the latest soil moisture reading for a field."""
    readings = get_readings_for_field(field_id, "soil_moisture")
    if readings:
        return readings[0].value
    return 0.0


def get_latest_ndvi(field_id: str) -> float:
    """Get the latest NDVI value for a field."""
    snapshots = get_ndvi_for_field(field_id)
    if snapshots:
        return snapshots[0].mean_ndvi
    return 0.0


def calculate_ndvi_trend_drop(field_id: str) -> float:
    """Calculate week-over-week NDVI percentage drop."""
    snapshots = get_ndvi_for_field(field_id)
    if len(snapshots) < 2:
        return 0.0
    current = snapshots[0].mean_ndvi
    previous = snapshots[1].mean_ndvi
    if previous == 0:
        return 0.0
    drop_pct = ((previous - current) / previous) * 100
    return max(0.0, drop_pct)  # Only return positive drops


def clear_caches():
    """Clear all cached data - useful for testing or reloading."""
    load_sensors.cache_clear()
    load_readings.cache_clear()
    load_ndvi_snapshots.cache_clear()
    load_rules.cache_clear()
