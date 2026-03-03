"""Tests for the GET /weather endpoint and weather service."""

import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.anyio


# ---------------------------------------------------------------------------
# Endpoint tests
# ---------------------------------------------------------------------------

async def test_weather_dashboard_full(client: AsyncClient):
    """GET /weather?farm_id=farm_1 returns 200 with expected top-level keys."""
    resp = await client.get("/weather", params={"farm_id": "farm_1"})
    assert resp.status_code == 200
    data = resp.json()
    for key in ("farm_id", "current", "forecast", "irrigation_window", "historical"):
        assert key in data, f"Missing key: {key}"
    assert data["farm_id"] == "farm_1"


async def test_weather_current_shape(client: AsyncClient):
    """Current-conditions block has required fields."""
    resp = await client.get("/weather", params={"farm_id": "farm_1"})
    current = resp.json()["current"]
    for key in ("temperature_c", "humidity_pct", "wind_speed_kmh", "conditions",
                "rainfall_mm_today", "timestamp"):
        assert key in current, f"Missing current field: {key}"


async def test_weather_forecast_seven_days(client: AsyncClient):
    """Full response includes 7-day forecast."""
    resp = await client.get("/weather", params={"farm_id": "farm_1"})
    forecast = resp.json()["forecast"]
    assert isinstance(forecast, list)
    assert len(forecast) == 7
    day = forecast[0]
    for key in ("date", "high_c", "low_c", "conditions", "rain_probability_pct",
                "wind_speed_kmh", "humidity_pct"):
        assert key in day, f"Missing forecast field: {key}"


async def test_weather_compact_three_days(client: AsyncClient):
    """Compact mode returns at most 3 forecast days."""
    resp = await client.get("/weather", params={"farm_id": "farm_1", "compact": "true"})
    assert resp.status_code == 200
    forecast = resp.json()["forecast"]
    assert len(forecast) <= 3


async def test_weather_irrigation_window(client: AsyncClient):
    """Irrigation window has status and reason."""
    resp = await client.get("/weather", params={"farm_id": "farm_1"})
    window = resp.json()["irrigation_window"]
    assert window["status"] in ("good", "risky", "avoid")
    assert isinstance(window["reason"], str) and len(window["reason"]) > 0


async def test_weather_historical(client: AsyncClient):
    """Historical rainfall block has expected fields."""
    resp = await client.get("/weather", params={"farm_id": "farm_1"})
    hist = resp.json()["historical"]
    for key in ("cumulative_rainfall_mm", "seasonal_average_mm",
                "period_start", "period_end"):
        assert key in hist, f"Missing historical field: {key}"


async def test_weather_missing_farm_id(client: AsyncClient):
    """GET /weather without farm_id returns 422."""
    resp = await client.get("/weather")
    assert resp.status_code == 422


async def test_weather_invalid_farm(client: AsyncClient):
    """GET /weather with non-existent farm returns 404."""
    resp = await client.get("/weather", params={"farm_id": "farm_nonexistent"})
    assert resp.status_code == 404


async def test_weather_all_farms(client: AsyncClient):
    """All three farms return valid weather data."""
    for fid in ("farm_1", "farm_2", "farm_3"):
        resp = await client.get("/weather", params={"farm_id": fid})
        assert resp.status_code == 200, f"Failed for {fid}"
        assert resp.json()["farm_id"] == fid


# ---------------------------------------------------------------------------
# Service-level tests
# ---------------------------------------------------------------------------

def test_irrigation_window_classification():
    """Unit test the irrigation-window logic with synthetic forecasts."""
    from app.services.weather import _classify_irrigation_window
    from app.models import DailyForecast
    from datetime import date

    base = dict(high_c=20, low_c=10, conditions="sunny", humidity_pct=50)

    # Good
    good_fc = [DailyForecast(date=date(2026, 3, 1), rain_probability_pct=10,
                             wind_speed_kmh=5, **base)]
    assert _classify_irrigation_window(good_fc).status == "good"

    # Risky (rain 45%)
    risky_fc = [DailyForecast(date=date(2026, 3, 1), rain_probability_pct=45,
                              wind_speed_kmh=5, **base)]
    assert _classify_irrigation_window(risky_fc).status == "risky"

    # Avoid (rain 65%)
    avoid_fc = [DailyForecast(date=date(2026, 3, 1), rain_probability_pct=65,
                              wind_speed_kmh=5, **base)]
    assert _classify_irrigation_window(avoid_fc).status == "avoid"

    # Avoid (wind 42 km/h)
    wind_fc = [DailyForecast(date=date(2026, 3, 1), rain_probability_pct=10,
                             wind_speed_kmh=42, **base)]
    assert _classify_irrigation_window(wind_fc).status == "avoid"

    # Empty forecast → good
    assert _classify_irrigation_window([]).status == "good"
