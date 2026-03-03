"""Tests for data loading functions — verifies all JSON files are
parseable and the loader helpers return expected shapes."""

import pytest
from app.services.data_loader import (
    load_sensors,
    load_readings,
    load_ndvi_snapshots,
    load_rules,
    load_fields,
    load_farms,
    load_irrigation_events,
    load_weather,
    get_fields_for_farm,
    get_irrigation_events_for_farm,
    get_weather_for_farm,
    clear_caches,
)


@pytest.fixture(autouse=True)
def _clear():
    """Ensure a fresh cache for each test."""
    clear_caches()
    yield
    clear_caches()


# ---------------------------------------------------------------------------
# Core loaders (existing data files)
# ---------------------------------------------------------------------------

def test_load_sensors_returns_list():
    sensors = load_sensors()
    assert isinstance(sensors, list)
    assert len(sensors) > 0
    assert hasattr(sensors[0], "sensor_id")


def test_load_readings_returns_list():
    readings = load_readings()
    assert isinstance(readings, list)
    assert len(readings) > 0
    assert hasattr(readings[0], "timestamp")


def test_load_ndvi_snapshots_returns_list():
    snapshots = load_ndvi_snapshots()
    assert isinstance(snapshots, list)
    assert len(snapshots) > 0
    assert hasattr(snapshots[0], "mean_ndvi")


def test_load_rules_returns_config():
    rules = load_rules()
    assert rules.crop_type == "tomato"
    assert len(rules.soil_moisture_rules) >= 3


def test_load_fields_returns_all_ten():
    fields = load_fields()
    assert len(fields) == 10
    farm_ids = {f.farm_id for f in fields}
    assert farm_ids == {"farm_1", "farm_2", "farm_3"}


def test_load_farms_returns_three():
    farms = load_farms()
    assert len(farms) == 3
    assert {f.farm_id for f in farms} == {"farm_1", "farm_2", "farm_3"}


# ---------------------------------------------------------------------------
# New v2.1 loaders — irrigation events
# ---------------------------------------------------------------------------

def test_load_irrigation_events_is_non_empty():
    events = load_irrigation_events()
    assert isinstance(events, list)
    assert len(events) > 50  # generator produces ~90


def test_irrigation_event_has_required_fields():
    events = load_irrigation_events()
    e = events[0]
    assert e.event_id
    assert e.field_id
    assert e.farm_id
    assert e.volume_liters > 0
    assert e.method in ("drip", "sprinkler")
    assert e.source in ("scheduled", "auto", "manual")


def test_get_irrigation_events_for_farm_filters():
    farm1 = get_irrigation_events_for_farm("farm_1")
    farm2 = get_irrigation_events_for_farm("farm_2")
    assert all(e.farm_id == "farm_1" for e in farm1)
    assert all(e.farm_id == "farm_2" for e in farm2)
    # farm_1 has 3 fields, farm_2 has 5 — farm_2 should have events too
    assert len(farm2) > 0


def test_get_irrigation_events_sorted():
    events = get_irrigation_events_for_farm("farm_1")
    timestamps = [e.start_time for e in events]
    assert timestamps == sorted(timestamps)


# ---------------------------------------------------------------------------
# New v2.1 loaders — weather
# ---------------------------------------------------------------------------

def test_load_weather_returns_dict_with_three_farms():
    weather = load_weather()
    assert isinstance(weather, dict)
    assert set(weather.keys()) == {"farm_1", "farm_2", "farm_3"}


def test_weather_farm_has_expected_sections():
    weather = load_weather()
    for farm_id, data in weather.items():
        assert "current" in data, f"{farm_id} missing 'current'"
        assert "forecast" in data, f"{farm_id} missing 'forecast'"
        assert "historical" in data, f"{farm_id} missing 'historical'"
        assert len(data["forecast"]) == 7


def test_get_weather_for_farm_returns_data():
    data = get_weather_for_farm("farm_1")
    assert "current" in data
    assert data["current"]["temperature_c"] is not None


def test_get_weather_for_unknown_farm_returns_empty():
    data = get_weather_for_farm("farm_999")
    assert data == {}


# ---------------------------------------------------------------------------
# Helper — fields for farm
# ---------------------------------------------------------------------------

def test_get_fields_for_farm_filters():
    farm1 = get_fields_for_farm("farm_1")
    assert len(farm1) == 3
    assert all(f.farm_id == "farm_1" for f in farm1)


def test_get_fields_for_farm_no_filter():
    all_fields = get_fields_for_farm()
    assert len(all_fields) == 10
