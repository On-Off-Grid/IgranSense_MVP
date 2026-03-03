"""Tests for the GET /water endpoint."""

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.anyio


async def test_water_dashboard_default(client: AsyncClient):
    """GET /water?farm_id=farm_1 returns 200 with expected shape."""
    resp = await client.get("/water", params={"farm_id": "farm_1"})
    assert resp.status_code == 200
    data = resp.json()
    assert "kpis" in data
    assert "irrigation_series" in data
    assert "moisture_zones" in data
    assert "time_range" in data
    # KPI keys
    kpi = data["kpis"]
    for key in (
        "total_volume_liters",
        "volume_per_hectare",
        "efficiency_proxy",
        "pct_under_irrigated",
        "pct_over_irrigated",
        "pct_optimal",
    ):
        assert key in kpi, f"Missing KPI key: {key}"


async def test_water_dashboard_time_ranges(client: AsyncClient):
    """All valid time_range values return 200."""
    for tr in ("today", "7d", "30d", "season"):
        resp = await client.get("/water", params={"farm_id": "farm_1", "time_range": tr})
        assert resp.status_code == 200, f"Failed for time_range={tr}"


async def test_water_dashboard_missing_farm_id(client: AsyncClient):
    """GET /water without farm_id returns 422 (validation error)."""
    resp = await client.get("/water")
    assert resp.status_code == 422


async def test_water_dashboard_invalid_farm(client: AsyncClient):
    """GET /water with non-existent farm returns 404."""
    resp = await client.get("/water", params={"farm_id": "farm_nonexistent"})
    assert resp.status_code == 404


async def test_water_dashboard_invalid_time_range(client: AsyncClient):
    """GET /water with bad time_range returns 400."""
    resp = await client.get("/water", params={"farm_id": "farm_1", "time_range": "99d"})
    assert resp.status_code == 400


async def test_water_time_series_structure(client: AsyncClient):
    """Irrigation series entries have expected fields."""
    resp = await client.get("/water", params={"farm_id": "farm_1"})
    data = resp.json()
    if data["irrigation_series"]:
        entry = data["irrigation_series"][0]
        assert "field_id" in entry
        assert "field_name" in entry
        assert "events" in entry
        if entry["events"]:
            evt = entry["events"][0]
            assert "date" in evt
            assert "volume_liters" in evt


async def test_water_moisture_zones_structure(client: AsyncClient):
    """Moisture zones object has expected fields."""
    resp = await client.get("/water", params={"farm_id": "farm_1"})
    data = resp.json()
    zones = data["moisture_zones"]
    for key in ("dry_pct", "optimal_pct", "wet_pct"):
        assert key in zones, f"Missing moisture zone key: {key}"
    total = zones["dry_pct"] + zones["optimal_pct"] + zones["wet_pct"]
    assert 99.0 <= total <= 101.0, f"Zone percentages should sum to ~100, got {total}"
