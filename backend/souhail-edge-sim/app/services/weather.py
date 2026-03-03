"""
Weather & risk service for the IgranSense Edge Simulation.

Reads weather.json via data_loader and builds the response models
consumed by the ``GET /weather`` endpoint.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from ..models import (
    CurrentWeather,
    DailyForecast,
    IrrigationWindow,
    HistoricalRainfall,
    WeatherDashboardResponse,
)
from .data_loader import get_weather_for_farm


# ---------------------------------------------------------------------------
# Thresholds for irrigation-window classification
# ---------------------------------------------------------------------------
RAIN_PROBABILITY_RISKY = 40   # pct – rain ≥ this → risky / avoid
WIND_SPEED_RISKY = 30         # km/h – wind above this → risky
RAIN_PROBABILITY_AVOID = 60   # pct – rain ≥ this → definitely avoid
WIND_SPEED_AVOID = 40         # km/h – wind above this → definitely avoid


# ---------------------------------------------------------------------------
# Irrigation-window logic
# ---------------------------------------------------------------------------

def _classify_irrigation_window(forecast: List[DailyForecast]) -> IrrigationWindow:
    """Derive a simple irrigation-window recommendation from the next 3 days."""
    if not forecast:
        return IrrigationWindow(status="good", reason="No forecast data — assume safe")

    window_days = forecast[:3]
    max_rain = max(d.rain_probability_pct for d in window_days)
    max_wind = max(d.wind_speed_kmh for d in window_days)

    if max_rain >= RAIN_PROBABILITY_AVOID or max_wind >= WIND_SPEED_AVOID:
        return IrrigationWindow(
            status="avoid",
            reason=f"High rain probability ({max_rain}%) or wind ({max_wind:.0f} km/h) in next 3 days",
        )
    if max_rain >= RAIN_PROBABILITY_RISKY or max_wind >= WIND_SPEED_RISKY:
        return IrrigationWindow(
            status="risky",
            reason=f"Elevated rain probability ({max_rain}%) or wind ({max_wind:.0f} km/h) in next 3 days",
        )
    return IrrigationWindow(
        status="good",
        reason="Low rain and wind expected — safe to irrigate",
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_farm_weather(farm_id: str) -> WeatherDashboardResponse | None:
    """
    Build a full ``WeatherDashboardResponse`` for the given farm.

    Returns ``None`` when the farm has no weather data on file.
    """
    raw = get_weather_for_farm(farm_id)
    if not raw:
        return None

    current = CurrentWeather(**raw["current"])
    forecast = [DailyForecast(**d) for d in raw.get("forecast", [])]
    historical = HistoricalRainfall(**raw["historical"])
    irrigation_window = _classify_irrigation_window(forecast)

    return WeatherDashboardResponse(
        farm_id=farm_id,
        current=current,
        forecast=forecast,
        irrigation_window=irrigation_window,
        historical=historical,
    )


def get_compact_weather(farm_id: str, days: int = 3) -> WeatherDashboardResponse | None:
    """
    Return a slimmed-down weather response (only *days* forecast entries).

    Useful for the inline weather widget on the Field Detail page.
    """
    full = get_farm_weather(farm_id)
    if full is None:
        return None

    return WeatherDashboardResponse(
        farm_id=full.farm_id,
        current=full.current,
        forecast=full.forecast[:days],
        irrigation_window=full.irrigation_window,
        historical=full.historical,
    )
