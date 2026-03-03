"""Tests for the enhanced GET /fields/{field_id} endpoint (v2.1) and compute_rule_triggers."""

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.anyio


# ---------------------------------------------------------------------------
# Endpoint tests
# ---------------------------------------------------------------------------

async def test_field_detail_has_triggers(client: AsyncClient):
    """GET /fields/field_1 now includes a triggers array."""
    resp = await client.get("/fields/field_1")
    assert resp.status_code == 200
    data = resp.json()
    assert "triggers" in data
    assert isinstance(data["triggers"], list)


async def test_field_detail_trigger_shape(client: AsyncClient):
    """Each trigger has the expected fields."""
    resp = await client.get("/fields/field_1")
    triggers = resp.json()["triggers"]
    if triggers:
        t = triggers[0]
        for key in ("rule_type", "threshold", "actual_value", "severity", "message"):
            assert key in t, f"Missing trigger field: {key}"
        assert t["rule_type"] in ("soil_moisture", "ndvi_trend", "ndvi_absolute")
        assert t["severity"] in ("critical", "warning", "info")


async def test_field_detail_has_weather(client: AsyncClient):
    """GET /fields/field_1 now includes compact inline weather."""
    resp = await client.get("/fields/field_1")
    data = resp.json()
    assert "weather" in data
    # weather may be null if no data, but for our mock data it should exist
    if data["weather"] is not None:
        for key in ("temperature_c", "humidity_pct", "wind_speed_kmh", "conditions"):
            assert key in data["weather"], f"Missing weather field: {key}"


async def test_field_detail_still_has_original_fields(client: AsyncClient):
    """Ensure the original response shape is preserved."""
    resp = await client.get("/fields/field_1")
    data = resp.json()
    for key in ("field", "soil_moisture_timeseries", "temperature_timeseries", "ndvi_timeseries"):
        assert key in data
    field = data["field"]
    for key in ("id", "name", "status", "soil_moisture_pct", "ndvi", "recommendation"):
        assert key in field


async def test_field_detail_404(client: AsyncClient):
    """Non-existent field returns 404."""
    resp = await client.get("/fields/field_999")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Service-level tests for compute_rule_triggers
# ---------------------------------------------------------------------------

def test_compute_rule_triggers_returns_list():
    """compute_rule_triggers returns a list of RuleTrigger for a valid field."""
    from app.services.rule_engine import compute_rule_triggers
    triggers = compute_rule_triggers("field_1")
    assert isinstance(triggers, list)
    # Each item should be a RuleTrigger model
    for t in triggers:
        assert hasattr(t, "rule_type")
        assert hasattr(t, "severity")
        assert hasattr(t, "message")


def test_compute_rule_triggers_includes_soil_rule():
    """At least one soil moisture trigger fires for known test data."""
    from app.services.rule_engine import compute_rule_triggers
    # Across 10 fields, at least one should have a soil moisture trigger
    found_soil = False
    for fid in [f"field_{i}" for i in range(1, 11)]:
        triggers = compute_rule_triggers(fid)
        if any(t.rule_type == "soil_moisture" for t in triggers):
            found_soil = True
            break
    assert found_soil, "Expected at least one soil_moisture trigger across all fields"
