#!/usr/bin/env python3
"""Generate mock weather.json for the IgranSense edge simulator.

Produces per-farm weather data with:
  - current conditions (as of late Feb 2026)
  - 7-day forecast (Mar 1-7, 2026)
  - historical seasonal rainfall comparison

Climate context: Mediterranean Morocco in late winter / early spring.
  Fes-Meknes (farm_1):   mild, some rain, 12-20°C
  Tangier-Tetouan (farm_2): coastal, moderate rain, 13-19°C
  Draa-Tafilalet (farm_3): semi-arid, dry, 10-25°C
"""

import json
import random
from datetime import date, datetime
from pathlib import Path

random.seed(99)

DATA_DIR = Path(__file__).resolve().parent.parent / "backend" / "souhail-edge-sim" / "data"

CONDITIONS = ["sunny", "partly_cloudy", "cloudy", "rainy"]

FARM_CLIMATE = {
    "farm_1": {
        "name": "Fes-Meknes",
        "temp_range": (10, 22),
        "humidity_range": (45, 80),
        "wind_range": (5, 25),
        "rain_probability_base": 35,
        "seasonal_avg_mm": 145,
        "cumulative_mm": 128,
    },
    "farm_2": {
        "name": "Tangier-Tetouan",
        "temp_range": (11, 20),
        "humidity_range": (55, 85),
        "wind_range": (8, 35),
        "rain_probability_base": 45,
        "seasonal_avg_mm": 180,
        "cumulative_mm": 162,
    },
    "farm_3": {
        "name": "Draa-Tafilalet",
        "temp_range": (8, 27),
        "humidity_range": (20, 50),
        "wind_range": (5, 20),
        "rain_probability_base": 10,
        "seasonal_avg_mm": 55,
        "cumulative_mm": 38,
    },
}


def pick_condition(rain_prob):
    if rain_prob > 60:
        return "rainy"
    elif rain_prob > 40:
        return random.choice(["cloudy", "rainy"])
    elif rain_prob > 20:
        return random.choice(["partly_cloudy", "cloudy"])
    else:
        return random.choice(["sunny", "partly_cloudy"])


def generate_farm_weather(farm_id: str, climate: dict) -> dict:
    tmin, tmax = climate["temp_range"]
    hmin, hmax = climate["humidity_range"]
    wmin, wmax = climate["wind_range"]

    # Current conditions (Feb 28, 2026 afternoon)
    cur_temp = round(random.uniform(tmin + 3, tmax - 2), 1)
    cur_humidity = random.randint(hmin, hmax)
    cur_wind = round(random.uniform(wmin, wmax), 1)
    cur_rain_today = round(random.uniform(0, 8), 1) if random.random() < 0.35 else 0.0
    cur_condition = "rainy" if cur_rain_today > 2 else pick_condition(climate["rain_probability_base"])

    current = {
        "temperature_c": cur_temp,
        "humidity_pct": cur_humidity,
        "wind_speed_kmh": cur_wind,
        "conditions": cur_condition,
        "rainfall_mm_today": cur_rain_today,
        "timestamp": "2026-02-28T14:00:00Z",
    }

    # 7-day forecast (Mar 1-7)
    forecast = []
    for i in range(7):
        d = date(2026, 3, 1 + i)
        rain_prob = min(95, max(5, climate["rain_probability_base"] + random.randint(-20, 25)))
        high = round(random.uniform(tmin + 4, tmax), 1)
        low = round(random.uniform(tmin, high - 3), 1)
        wind = round(random.uniform(wmin, wmax), 1)
        humidity = random.randint(hmin, hmax)
        condition = pick_condition(rain_prob)

        forecast.append({
            "date": d.isoformat(),
            "high_c": high,
            "low_c": low,
            "conditions": condition,
            "rain_probability_pct": rain_prob,
            "wind_speed_kmh": wind,
            "humidity_pct": humidity,
        })

    # Historical rainfall
    historical = {
        "cumulative_rainfall_mm": climate["cumulative_mm"],
        "seasonal_average_mm": climate["seasonal_avg_mm"],
        "period_start": "2025-10-01",
        "period_end": "2026-02-28",
    }

    return {
        "farm_id": farm_id,
        "current": current,
        "forecast": forecast,
        "historical": historical,
    }


def main():
    weather_data = {}
    for farm_id, climate in FARM_CLIMATE.items():
        weather_data[farm_id] = generate_farm_weather(farm_id, climate)

    out_path = DATA_DIR / "weather.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(weather_data, f, indent=2)
    print(f"Generated weather data for {len(weather_data)} farms → {out_path}")


if __name__ == "__main__":
    main()
