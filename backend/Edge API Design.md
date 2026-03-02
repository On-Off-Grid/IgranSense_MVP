# Souhail Edge Simulation Service – REST API Design

## Overview

This document specifies the FastAPI-based Edge Simulation Service that reads local mock JSON files, applies agronomic rules, computes field status, generates alerts, and exposes a small REST API for Yahya’s dashboard.[^1]
The service simulates the behavior of the real edge micro data center (MDC) by ingesting static JSON files instead of live sensor data, making it ideal for offline demos and early MVP development.[^1]

***

## Folder Structure

A minimal, clean structure for a small FastAPI service:

```text
souhail-edge-sim/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & routes
│   ├── config.py            # Paths, settings
│   ├── models.py            # Pydantic models
│   ├── enums.py             # Status / severity enums
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py   # Read JSON files
│   │   ├── rule_engine.py   # Field status + alerts logic
│   │   └── system_health.py # MDC + sensor health summary
│   └── utils/
│       ├── __init__.py
│       └── time_utils.py    # Time helpers (parse, latest, etc.)
├── data/
│   ├── sensors.json         # Sensor registry
│   ├── readings.json        # 30-day time series (30 min steps)
│   ├── ndvi_snapshots.json  # Weekly NDVI values per field
│   └── rules.json           # Thresholds & alert rules
├── tests/
│   ├── test_fields.py
│   ├── test_alerts.py
│   └── test_system.py
├── README.md
├── requirements.txt
└── uvicorn_run.sh
```

The `data/` files correspond directly to the roadmap specification for mock sensor registry, readings, NDVI snapshots, and agronomic rules.[^1]

***

## Pydantic Models

### Enums (Status and Severity)

```python
# app/enums.py
from enum import Enum


class FieldStatus(str, Enum):
    OK = "ok"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertType(str, Enum):
    IRRIGATION = "irrigation"
    STRESS = "stress"
    SYSTEM = "system"
```

These enums match the dashboard needs: field status (mapped to green/orange/red) and alert severity/types (irrigation, stress, system).[^1]

### Base Sensor/Data Models

```python
# app/models.py
from datetime import datetime, date
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from .enums import FieldStatus, AlertSeverity, AlertType


class Sensor(BaseModel):
    sensor_id: str
    field_id: str
    type: str  # e.g. "soil_moisture", "temperature", "humidity"
    lat: float
    lng: float
    status: str  # e.g. "online", "offline", "battery_low"


class Reading(BaseModel):
    timestamp: datetime
    sensor_id: str
    value: float
    unit: str  # e.g. "%", "°C"
    quality_flag: str  # e.g. "good", "noisy", "missing"


class NDVISnapshot(BaseModel):
    date: date
    field_id: str
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
```

These models follow the exact field definitions proposed for `sensors.json`, `readings.json`, and `ndvi_snapshots.json` in the roadmap.[^1]

### Rule Models (rules.json)

```python
class MoistureRule(BaseModel):
    min_inclusive: Optional[float] = Field(
        None, description="Minimum soil moisture percentage (inclusive)"
    )
    max_exclusive: Optional[float] = Field(
        None, description="Maximum soil moisture percentage (exclusive)"
    )
    status: FieldStatus
    severity: AlertSeverity
    recommendation: str


class NDVITrendRule(BaseModel):
    drop_pct_threshold: float = Field(
        ..., description="Percentage drop week-over-week that triggers an alert"
    )
    severity: AlertSeverity
    recommendation: str


class NDVIAbsoluteRule(BaseModel):
    min_ndvi: float = Field(..., description="Minimum acceptable NDVI for healthy crop")
    severity: AlertSeverity
    recommendation: str


class RulesConfig(BaseModel):
    crop_type: str  # e.g. "tomato"
    soil_moisture_rules: List[MoistureRule]
    ndvi_trend_rules: List[NDVITrendRule]
    ndvi_absolute_rules: List[NDVIAbsoluteRule]
```

The moisture thresholds and NDVI rules mirror the agronomic logic defined in the roadmap (soil moisture <18% critical, 18–25% warning, >25% OK; NDVI drops >15%; NDVI <0.35 stressed).[^1]

### API Response Models

#### Field summary for `/fields`

```python
class FieldSummary(BaseModel):
    id: str
    name: str
    status: FieldStatus
    soil_moisture_pct: float
    ndvi: float
    recommendation: str
```

#### Time series items for `/fields/{id}`

```python
class TimeSeriesPoint(BaseModel):
    timestamp: datetime
    value: float


class NDVITimeSeriesPoint(BaseModel):
    date: date
    mean_ndvi: float
```

#### Field detail response for `/fields/{id}`

```python
class FieldDetail(BaseModel):
    id: str
    name: str
    status: FieldStatus
    soil_moisture_pct: float
    ndvi: float
    recommendation: str


class FieldDetailResponse(BaseModel):
    field: FieldDetail
    soil_moisture_timeseries: List[TimeSeriesPoint]
    temperature_timeseries: List[TimeSeriesPoint]
    ndvi_timeseries: List[NDVITimeSeriesPoint]
```

This structure aligns with the dashboard’s field detail screen, which shows soil moisture, temperature, and NDVI trends over 14–30 days.[^1]

#### Alert model for `/alerts`

```python
class Alert(BaseModel):
    type: AlertType
    severity: AlertSeverity
    field_id: str
    timestamp: datetime
    trigger_values: Dict[str, float]  # e.g. {"soil_moisture_pct": 14.0, "ndvi": 0.32}
    message: str
```

#### System status for `/system`

```python
class SensorHealthSummary(BaseModel):
    total_sensors: int
    online_sensors: int
    offline_sensors: int
    battery_low_sensors: int


class SystemStatus(BaseModel):
    mdc_status: str          # e.g. "online", "offline"
    last_sync: datetime
    sensor_health_summary: SensorHealthSummary
```

The `SystemStatus` model supports the dashboard’s system status screen: MDC status, last sync time, and sensor node health.[^1]

***

## Core Services (Logic Layer)

Below are minimal service-layer stubs. In a real implementation, they would read from `data/` JSON files and compute derived values.

```python
# app/services/data_loader.py
import json
from pathlib import Path
from typing import List

from ..models import Sensor, Reading, NDVISnapshot, RulesConfig

BASE_DIR = Path(__file__).resolve().parents[^2]
DATA_DIR = BASE_DIR / "data"


def load_sensors() -> List[Sensor]:
    with open(DATA_DIR / "sensors.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Sensor(**item) for item in data]


def load_readings() -> List[Reading]:
    with open(DATA_DIR / "readings.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [Reading(**item) for item in data]


def load_ndvi_snapshots() -> List[NDVISnapshot]:
    with open(DATA_DIR / "ndvi_snapshots.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return [NDVISnapshot(**item) for item in data]


def load_rules() -> RulesConfig:
    with open(DATA_DIR / "rules.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return RulesConfig(**data)
```

```python
# app/services/rule_engine.py
from datetime import datetime
from typing import List

from ..enums import FieldStatus, AlertSeverity, AlertType
from ..models import (
    RulesConfig,
    FieldSummary,
    FieldDetailResponse,
    Alert,
    TimeSeriesPoint,
    NDVITimeSeriesPoint,
)


def compute_field_status(
    field_id: str,
    latest_soil_moisture: float,
    latest_ndvi: float,
    ndvi_trend_pct_drop: float,
    rules: RulesConfig,
) -> FieldStatus:
    # Simplified example: apply soil moisture rules first, then NDVI
    for rule in rules.soil_moisture_rules:
        if (
            (rule.min_inclusive is None or latest_soil_moisture >= rule.min_inclusive)
            and (rule.max_exclusive is None or latest_soil_moisture < rule.max_exclusive)
        ):
            return rule.status
    # Fallback
    return FieldStatus.OK


def generate_field_recommendation(
    latest_soil_moisture: float,
    latest_ndvi: float,
    ndvi_trend_pct_drop: float,
    rules: RulesConfig,
) -> str:
    # Very simple: return the first matching soil moisture rule recommendation
    for rule in rules.soil_moisture_rules:
        if (
            (rule.min_inclusive is None or latest_soil_moisture >= rule.min_inclusive)
            and (rule.max_exclusive is None or latest_soil_moisture < rule.max_exclusive)
        ):
            return rule.recommendation
    return "No action needed."


def generate_alerts_for_field(
    field_id: str,
    latest_soil_moisture: float,
    latest_ndvi: float,
    ndvi_trend_pct_drop: float,
    rules: RulesConfig,
) -> List[Alert]:
    alerts: List[Alert] = []
    now = datetime.utcnow()

    # Soil moisture alerts
    for rule in rules.soil_moisture_rules:
        if (
            (rule.min_inclusive is None or latest_soil_moisture >= rule.min_inclusive)
            and (rule.max_exclusive is None or latest_soil_moisture < rule.max_exclusive)
            and rule.severity != AlertSeverity.INFO
        ):
            alerts.append(
                Alert(
                    type=AlertType.IRRIGATION,
                    severity=rule.severity,
                    field_id=field_id,
                    timestamp=now,
                    trigger_values={"soil_moisture_pct": latest_soil_moisture},
                    message=rule.recommendation,
                )
            )

    # NDVI trend alerts
    for rule in rules.ndvi_trend_rules:
        if ndvi_trend_pct_drop >= rule.drop_pct_threshold:
            alerts.append(
                Alert(
                    type=AlertType.STRESS,
                    severity=rule.severity,
                    field_id=field_id,
                    timestamp=now,
                    trigger_values={"ndvi_trend_drop_pct": ndvi_trend_pct_drop},
                    message=rule.recommendation,
                )
            )

    # NDVI absolute alerts
    for rule in rules.ndvi_absolute_rules:
        if latest_ndvi < rule.min_ndvi:
            alerts.append(
                Alert(
                    type=AlertType.STRESS,
                    severity=rule.severity,
                    field_id=field_id,
                    timestamp=now,
                    trigger_values={"ndvi": latest_ndvi},
                    message=rule.recommendation,
                )
            )

    return alerts
```

These service stubs encapsulate the rule-based engine described in the roadmap, using soil moisture and NDVI trends to generate status and alerts.[^1]

***

## FastAPI Routes and Example Responses

### FastAPI App Setup

```python
# app/main.py
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from typing import List

from .models import (
    FieldSummary,
    FieldDetailResponse,
    Alert,
    SystemStatus,
    SensorHealthSummary,
    TimeSeriesPoint,
    NDVITimeSeriesPoint,
)
from .enums import FieldStatus, AlertSeverity, AlertType

app = FastAPI(
    title="Souhail Edge Simulation Service",
    version="0.1.0",
)


@app.get("/fields", response_model=List[FieldSummary])
async def list_fields() -> List[FieldSummary]:
    # TODO: Replace with real computation from data_loader + rule_engine
    example_fields = [
        FieldSummary(
            id="field_1",
            name="Tomato Block A",
            status=FieldStatus.CRITICAL,
            soil_moisture_pct=14.0,
            ndvi=0.32,
            recommendation="Irrigate within the next 6 hours — soil moisture at 14%, below 18% critical threshold.",
        ),
        FieldSummary(
            id="field_2",
            name="Tomato Block B",
            status=FieldStatus.WARNING,
            soil_moisture_pct=21.5,
            ndvi=0.48,
            recommendation="Schedule irrigation within 24h — soil moisture is trending down.",
        ),
    ]
    return example_fields


@app.get("/fields/{field_id}", response_model=FieldDetailResponse)
async def get_field_detail(field_id: str) -> FieldDetailResponse:
    if field_id not in {"field_1", "field_2"}:
        raise HTTPException(status_code=404, detail="Field not found")

    now = datetime.utcnow()
    soil_series = [
        TimeSeriesPoint(timestamp=now - timedelta(hours=i * 6), value=18.0 + i * -0.5)
        for i in range(0, 10)
    ]
    temp_series = [
        TimeSeriesPoint(timestamp=now - timedelta(hours=i * 6), value=22.0 + i * 0.3)
        for i in range(0, 10)
    ]
    ndvi_series = [
        NDVITimeSeriesPoint(date=(now - timedelta(days=7 * i)).date(), mean_ndvi=0.6 - i * 0.05)
        for i in range(0, 4)
    ]

    detail = FieldDetailResponse(
        field={
            "id": field_id,
            "name": "Tomato Block A" if field_id == "field_1" else "Tomato Block B",
            "status": FieldStatus.CRITICAL if field_id == "field_1" else FieldStatus.WARNING,
            "soil_moisture_pct": 14.0 if field_id == "field_1" else 21.5,
            "ndvi": 0.32 if field_id == "field_1" else 0.48,
            "recommendation": "Irrigate within the next 6 hours — soil moisture at 14%, below 18% critical threshold.",
        },
        soil_moisture_timeseries=soil_series,
        temperature_timeseries=temp_series,
        ndvi_timeseries=ndvi_series,
    )

    return detail


@app.get("/alerts", response_model=List[Alert])
async def list_alerts() -> List[Alert]:
    now = datetime.utcnow()
    alerts = [
        Alert(
            type=AlertType.IRRIGATION,
            severity=AlertSeverity.CRITICAL,
            field_id="field_1",
            timestamp=now - timedelta(minutes=15),
            trigger_values={"soil_moisture_pct": 14.0, "threshold_pct": 18.0},
            message="Irrigate Block A immediately — soil moisture at 14% (<18% critical threshold).",
        ),
        Alert(
            type=AlertType.STRESS,
            severity=AlertSeverity.WARNING,
            field_id="field_2",
            timestamp=now - timedelta(hours=3),
            trigger_values={"ndvi": 0.38, "ndvi_drop_pct": 18.0},
            message="Potential stress detected — NDVI dropped 18% week-over-week.",
        ),
    ]
    return alerts


@app.get("/system", response_model=SystemStatus)
async def get_system_status() -> SystemStatus:
    now = datetime.utcnow()
    sensor_health = SensorHealthSummary(
        total_sensors=40,
        online_sensors=36,
        offline_sensors=2,
        battery_low_sensors=2,
    )

    status = SystemStatus(
        mdc_status="online",
        last_sync=now - timedelta(minutes=5),
        sensor_health_summary=sensor_health,
    )
    return status
```

This `main.py` file defines exactly the four endpoints required for Yahya’s dashboard, returning example JSON payloads aligned with the roadmap’s screens and agronomic rules.[^1]

### Example JSON Response – `GET /fields`

```json
[
  {
    "id": "field_1",
    "name": "Tomato Block A",
    "status": "critical",
    "soil_moisture_pct": 14.0,
    "ndvi": 0.32,
    "recommendation": "Irrigate within the next 6 hours — soil moisture at 14%, below 18% critical threshold."
  },
  {
    "id": "field_2",
    "name": "Tomato Block B",
    "status": "warning",
    "soil_moisture_pct": 21.5,
    "ndvi": 0.48,
    "recommendation": "Schedule irrigation within 24h — soil moisture is trending down."
  }
]
```

### Example JSON Response – `GET /fields/{id}`

```json
{
  "field": {
    "id": "field_1",
    "name": "Tomato Block A",
    "status": "critical",
    "soil_moisture_pct": 14.0,
    "ndvi": 0.32,
    "recommendation": "Irrigate within the next 6 hours — soil moisture at 14%, below 18% critical threshold."
  },
  "soil_moisture_timeseries": [
    { "timestamp": "2026-02-26T18:00:00Z", "value": 19.5 },
    { "timestamp": "2026-02-26T12:00:00Z", "value": 18.0 },
    { "timestamp": "2026-02-26T06:00:00Z", "value": 17.0 }
  ],
  "temperature_timeseries": [
    { "timestamp": "2026-02-26T18:00:00Z", "value": 23.1 },
    { "timestamp": "2026-02-26T12:00:00Z", "value": 22.4 },
    { "timestamp": "2026-02-26T06:00:00Z", "value": 21.9 }
  ],
  "ndvi_timeseries": [
    { "date": "2026-02-21", "mean_ndvi": 0.60 },
    { "date": "2026-02-14", "mean_ndvi": 0.55 },
    { "date": "2026-02-07", "mean_ndvi": 0.50 }
  ]
}
```

### Example JSON Response – `GET /alerts`

```json
[
  {
    "type": "irrigation",
    "severity": "critical",
    "field_id": "field_1",
    "timestamp": "2026-02-26T20:45:00Z",
    "trigger_values": {
      "soil_moisture_pct": 14.0,
      "threshold_pct": 18.0
    },
    "message": "Irrigate Block A immediately — soil moisture at 14% (<18% critical threshold)."
  },
  {
    "type": "stress",
    "severity": "warning",
    "field_id": "field_2",
    "timestamp": "2026-02-26T18:00:00Z",
    "trigger_values": {
      "ndvi": 0.38,
      "ndvi_drop_pct": 18.0
    },
    "message": "Potential stress detected — NDVI dropped 18% week-over-week."
  }
]
```

### Example JSON Response – `GET /system`

```json
{
  "mdc_status": "online",
  "last_sync": "2026-02-26T20:55:00Z",
  "sensor_health_summary": {
    "total_sensors": 40,
    "online_sensors": 36,
    "offline_sensors": 2,
    "battery_low_sensors": 2
  }
}
```

***

## `rules.json` Schema and Example

### JSON Schema (conceptual)

```json
{
  "type": "object",
  "properties": {
    "crop_type": { "type": "string" },
    "soil_moisture_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "min_inclusive": { "type": ["number", "null"] },
          "max_exclusive": { "type": ["number", "null"] },
          "status": { "type": "string", "enum": ["ok", "warning", "critical"] },
          "severity": { "type": "string", "enum": ["info", "warning", "critical"] },
          "recommendation": { "type": "string" }
        },
        "required": ["status", "severity", "recommendation"]
      }
    },
    "ndvi_trend_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "drop_pct_threshold": { "type": "number" },
          "severity": { "type": "string", "enum": ["info", "warning", "critical"] },
          "recommendation": { "type": "string" }
        },
        "required": ["drop_pct_threshold", "severity", "recommendation"]
      }
    },
    "ndvi_absolute_rules": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "min_ndvi": { "type": "number" },
          "severity": { "type": "string", "enum": ["info", "warning", "critical"] },
          "recommendation": { "type": "string" }
        },
        "required": ["min_ndvi", "severity", "recommendation"]
      }
    }
  },
  "required": [
    "crop_type",
    "soil_moisture_rules",
    "ndvi_trend_rules",
    "ndvi_absolute_rules"
  ]
}
```

### Example `rules.json` for Tomatoes

This example encodes the roadmap’s irrigation thresholds and NDVI rules for a tomato crop in Souss-Massa.[^1]

```json
{
  "crop_type": "tomato",
  "soil_moisture_rules": [
    {
      "min_inclusive": null,
      "max_exclusive": 18.0,
      "status": "critical",
      "severity": "critical",
      "recommendation": "Irrigate immediately — soil moisture below 18% critical threshold."
    },
    {
      "min_inclusive": 18.0,
      "max_exclusive": 25.0,
      "status": "warning",
      "severity": "warning",
      "recommendation": "Schedule irrigation within 24 hours — soil moisture between 18% and 25%."
    },
    {
      "min_inclusive": 25.0,
      "max_exclusive": null,
      "status": "ok",
      "severity": "info",
      "recommendation": "No irrigation needed — soil moisture above 25%."
    }
  ],
  "ndvi_trend_rules": [
    {
      "drop_pct_threshold": 15.0,
      "severity": "warning",
      "recommendation": "Potential crop stress — NDVI dropped more than 15% week-over-week, inspect field."
    }
  ],
  "ndvi_absolute_rules": [
    {
      "min_ndvi": 0.35,
      "severity": "critical",
      "recommendation": "Severe stress — NDVI below 0.35 for healthy-stage tomato crop, investigate immediately."
    }
  ]
}
```

***

## README with `curl` Examples

```markdown
# Souhail Edge Simulation Service

FastAPI-based edge simulation service for IgranSense. It reads local JSON files (`sensors.json`, `readings.json`, `ndvi_snapshots.json`, `rules.json`), computes field status, and exposes a small REST API for Yahya's dashboard.

## Requirements

- Python 3.10+
- pip

## Installation

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

`requirements.txt` should at minimum contain:

```text
fastapi
uvicorn[standard]
pydantic
python-dateutil
```

## Running the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## Endpoints

### 1. List Fields – `GET /fields`

Returns an array of field summaries with status and current recommendation.

```bash
curl -X GET "http://localhost:8000/fields" \
     -H "accept: application/json"
```

### 2. Field Detail – `GET /fields/{id}`

Returns detailed time series for a specific field plus the current recommendation text.

```bash
curl -X GET "http://localhost:8000/fields/field_1" \
     -H "accept: application/json"
```

### 3. Alerts – `GET /alerts`

Returns a list of generated alerts.

```bash
curl -X GET "http://localhost:8000/alerts" \
     -H "accept: application/json"
```

### 4. System Status – `GET /system`

Returns MDC status, last sync timestamp, and a summary of sensor health.

```bash
curl -X GET "http://localhost:8000/system" \
     -H "accept: application/json"
```

## Data Files

Place your mock data files under the `data/` directory:

- `sensors.json` – sensor registry per field
- `readings.json` – 30-day time series (every 30 minutes)
- `ndvi_snapshots.json` – weekly NDVI values per field
- `rules.json` – agronomic thresholds & alert rules

The structure and value ranges should follow the IgranSense roadmap (soil moisture 8–45%, temperature 12–38 °C, humidity 30–80%, NDVI 0.25–0.85, etc.).
```

---

## References

1. [IgranSense-Roadmap.md](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_faeba0a0-a820-4eec-b370-583e23021ec7/c1df0937-6aec-4035-ba16-78081d69cb8b/IgranSense-Roadmap.md?AWSAccessKeyId=ASIA2F3EMEYEYPQ33C6M&Signature=ygmAk8SKspOK9Q%2FNteLdg82mXJQ%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEH8aCXVzLWVhc3QtMSJGMEQCIA1k%2FQObjZfzaqtiCXXW9%2Fe1FZTzP%2FNSxNuZw1FUiB8rAiBsZaWJugKr6%2FoGj1uXgTm3O90c0EAIXbtdzy4VM9VTJyrzBAhIEAEaDDY5OTc1MzMwOTcwNSIMcKFGrQ1xuWXUhOgzKtAE5pfp9pKL2SpY4SJNs315sEI7ig0%2FYeCnIn4gvrwjLMK0K7uOrRW6%2FGlMGcAX0HITtjBkfquhhHPbSywWuiK63vHxA1H7SPmVcG5qlUqJCCgbrVG8OQVYcUmgSNGc99DPN5l0reQsxcGzPPydVrkOaDff2E8eLN76m78j1GI6wGvTPJz%2Bf6QycVOS2WVa%2BytEGsAPe3e0CoYGXt360Bsn9bSAxQd7CHuVTEqIsOLKmY%2BdkaAFrwAxx7Uzg1Fy3N3R9Sgza5CWfZJwG7LzndwObe56XoqDHlHGJxZUZJBGV%2FmXdrHimg4y%2FBsK8jUjBmeW0seU3CCxKvz876MSAW94fw5IRL82sch13ICnuUh1iEZ%2F3yCaTJ%2BB8X6hcQaoTcyes7Vfz3f%2B2XOObC%2FtML35vMDCd%2Bevd13WceCZSiZ%2FGL9Leo4Fu0fMGVF0%2Fh0DKMVA383f6W4f5lv2UqiYuQrrgk%2BhHfxfGseu8ebHnyf59yajukB%2Bfo7LaPphyfnOEHHnVIFGSj2B8W9REXyhvOrW0RIlH2zFMHGOfsBDsSK9C1WwnEsizI1YazWA3uXJsN1EHuJlvHpc6fxv6LWfwhBxt6bSQeKx77FnhirIzITf4CDxKiO7zvbGXBJXOMwkiy%2B5%2Bm62gZfD0f4vrq5nwB5se97mP7Gia05j0x8UQcmnYXl8CjgHr2v82TlIGUXogK93eZVe%2FzjaDzajTEGP3WsAe4O9pgOU20cd%2FSodJXBQU134PSuRFRB80Uiw29tFgcOWAUomffbLv%2Bs7VPmTSN5UtDDWuojNBjqZAYITqlhbZU8rdvpyigSjfihb0gRk9Yi0MSDQoe9oF3qw%2Bbdvp0OU7gHiaQIzMnmb1p4tq1X3X989NFVvP2USD5pCcJ3xs3Cu7wu6PsYvzC3OoR4%2FmLIjGT6JMNehODBPXailRHDKoZASsa5Qz9dBmvwwUUuCPro2YHrnfNoqDMsXBoSLEWSD284u%2FG6K5pmz5hws4i8oAjKkpQ%3D%3D&Expires=1772237028) - # IgranSense – Realistic MVP Roadmap, Task Assignments & Pitch Narrative

## Executive Summary

This...

2. [IgranSense_slide.pdf](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_faeba0a0-a820-4eec-b370-583e23021ec7/5ff19aea-5835-48dc-bafc-d86230839f35/IgranSense_slide.pdf?AWSAccessKeyId=ASIA2F3EMEYEYPQ33C6M&Signature=bywJ8cxCtOvKS3%2Bx8lyWzIRm2Kk%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEH8aCXVzLWVhc3QtMSJGMEQCIA1k%2FQObjZfzaqtiCXXW9%2Fe1FZTzP%2FNSxNuZw1FUiB8rAiBsZaWJugKr6%2FoGj1uXgTm3O90c0EAIXbtdzy4VM9VTJyrzBAhIEAEaDDY5OTc1MzMwOTcwNSIMcKFGrQ1xuWXUhOgzKtAE5pfp9pKL2SpY4SJNs315sEI7ig0%2FYeCnIn4gvrwjLMK0K7uOrRW6%2FGlMGcAX0HITtjBkfquhhHPbSywWuiK63vHxA1H7SPmVcG5qlUqJCCgbrVG8OQVYcUmgSNGc99DPN5l0reQsxcGzPPydVrkOaDff2E8eLN76m78j1GI6wGvTPJz%2Bf6QycVOS2WVa%2BytEGsAPe3e0CoYGXt360Bsn9bSAxQd7CHuVTEqIsOLKmY%2BdkaAFrwAxx7Uzg1Fy3N3R9Sgza5CWfZJwG7LzndwObe56XoqDHlHGJxZUZJBGV%2FmXdrHimg4y%2FBsK8jUjBmeW0seU3CCxKvz876MSAW94fw5IRL82sch13ICnuUh1iEZ%2F3yCaTJ%2BB8X6hcQaoTcyes7Vfz3f%2B2XOObC%2FtML35vMDCd%2Bevd13WceCZSiZ%2FGL9Leo4Fu0fMGVF0%2Fh0DKMVA383f6W4f5lv2UqiYuQrrgk%2BhHfxfGseu8ebHnyf59yajukB%2Bfo7LaPphyfnOEHHnVIFGSj2B8W9REXyhvOrW0RIlH2zFMHGOfsBDsSK9C1WwnEsizI1YazWA3uXJsN1EHuJlvHpc6fxv6LWfwhBxt6bSQeKx77FnhirIzITf4CDxKiO7zvbGXBJXOMwkiy%2B5%2Bm62gZfD0f4vrq5nwB5se97mP7Gia05j0x8UQcmnYXl8CjgHr2v82TlIGUXogK93eZVe%2FzjaDzajTEGP3WsAe4O9pgOU20cd%2FSodJXBQU134PSuRFRB80Uiw29tFgcOWAUomffbLv%2Bs7VPmTSN5UtDDWuojNBjqZAYITqlhbZU8rdvpyigSjfihb0gRk9Yi0MSDQoe9oF3qw%2Bbdvp0OU7gHiaQIzMnmb1p4tq1X3X989NFVvP2USD5pCcJ3xs3Cu7wu6PsYvzC3OoR4%2FmLIjGT6JMNehODBPXailRHDKoZASsa5Qz9dBmvwwUUuCPro2YHrnfNoqDMsXBoSLEWSD284u%2FG6K5pmz5hws4i8oAjKkpQ%3D%3D&Expires=1772237028)

