"""Tests for Phase 7 – System Status MDC metrics & Sensor sparklines."""

import pytest


# ---------------------------------------------------------------------------
# System Status – MDC metrics
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_system_includes_mdc_metrics(client):
    resp = await client.get("/system")
    assert resp.status_code == 200
    data = resp.json()
    assert "mdc_metrics" in data
    m = data["mdc_metrics"]
    for key in ("cpu_pct", "memory_pct", "disk_pct", "requests_per_min"):
        assert key in m
        assert isinstance(m[key], (int, float))
        assert m[key] >= 0


@pytest.mark.anyio
async def test_mdc_metrics_ranges(client):
    resp = await client.get("/system")
    m = resp.json()["mdc_metrics"]
    assert 0 <= m["cpu_pct"] <= 100
    assert 0 <= m["memory_pct"] <= 100
    assert 0 <= m["disk_pct"] <= 100
    assert m["requests_per_min"] >= 0


# ---------------------------------------------------------------------------
# Sensors – sparkline field
# ---------------------------------------------------------------------------

@pytest.mark.anyio
async def test_sensors_include_sparkline(client):
    """Every sensor in the list should carry a sparkline array."""
    resp = await client.get("/sensors")
    assert resp.status_code == 200
    sensors = resp.json()
    assert len(sensors) > 0
    for s in sensors:
        assert "sparkline" in s
        if s["sparkline"] is not None:
            assert isinstance(s["sparkline"], list)
            assert all(isinstance(v, (int, float)) for v in s["sparkline"])


@pytest.mark.anyio
async def test_sparkline_max_length(client):
    """Sparkline should have at most 12 data points."""
    resp = await client.get("/sensors")
    for s in resp.json():
        if s["sparkline"]:
            assert len(s["sparkline"]) <= 12


@pytest.mark.anyio
async def test_sensor_detail_still_works(client):
    """Ensure sensor detail endpoint still returns readings."""
    resp = await client.get("/sensors")
    first_id = resp.json()[0]["sensor_id"]
    detail = await client.get(f"/sensors/{first_id}")
    assert detail.status_code == 200
    d = detail.json()
    assert "recent_readings" in d
    assert "sensor" in d
    assert "sparkline" in d["sensor"]
