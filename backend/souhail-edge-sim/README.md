# IgranSense Edge Simulation Service

FastAPI-based edge simulation service for IgranSense. It reads local JSON files (`sensors.json`, `readings.json`, `ndvi_snapshots.json`, `rules.json`), computes field status using agronomic rules, generates alerts, and exposes a REST API for Yahya's dashboard.

This simulates the behavior of the real edge micro data center (MDC).

## Requirements

- Python 3.10+
- pip

## Installation

```bash
cd backend/souhail-edge-sim

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive API docs: `http://localhost:8000/docs`

## Endpoints

### 1. List Fields – `GET /fields`

Returns an array of field summaries with status and current recommendation.

```bash
curl -X GET "http://localhost:8000/fields" -H "accept: application/json"
```

**Response:**
```json
[
  {
    "id": "field_1",
    "name": "Tomato Block A",
    "status": "critical",
    "soil_moisture_pct": 14.0,
    "ndvi": 0.32,
    "recommendation": "Irrigate immediately — soil moisture below 18% critical threshold."
  }
]
```

### 2. Field Detail – `GET /fields/{id}`

Returns detailed time series for a specific field plus the current recommendation text.

```bash
curl -X GET "http://localhost:8000/fields/field_1" -H "accept: application/json"
```

### 3. Alerts – `GET /alerts`

Returns a list of generated alerts sorted by severity.

```bash
curl -X GET "http://localhost:8000/alerts" -H "accept: application/json"
```

### 4. System Status – `GET /system`

Returns MDC status, last sync timestamp, and a summary of sensor health.

```bash
curl -X GET "http://localhost:8000/system" -H "accept: application/json"
```

## Data Files

Place your mock data files under the `data/` directory:

- `sensors.json` – sensor registry per field
- `readings.json` – 30-day time series (every 30 minutes)
- `ndvi_snapshots.json` – weekly NDVI values per field
- `rules.json` – agronomic thresholds & alert rules

### Agronomic Rules (rules.json)

The rules encode irrigation thresholds for tomatoes in Souss-Massa:

| Soil Moisture | Status | Action |
|--------------|--------|--------|
| < 18% | Critical | Irrigate immediately |
| 18-25% | Warning | Schedule within 24h |
| > 25% | OK | No action needed |

NDVI rules:
- Drop > 15% week-over-week → Warning (potential stress)
- NDVI < 0.35 → Critical (severe stress)

## Project Structure

```
souhail-edge-sim/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & routes
│   ├── config.py            # Paths, settings
│   ├── models.py            # Pydantic models
│   ├── enums.py             # Status / severity enums
│   ├── services/
│   │   ├── data_loader.py   # Read JSON files
│   │   ├── rule_engine.py   # Field status + alerts logic
│   │   └── system_health.py # MDC + sensor health summary
│   └── utils/
│       └── time_utils.py    # Time helpers
├── data/
│   ├── sensors.json
│   ├── readings.json
│   ├── ndvi_snapshots.json
│   └── rules.json
├── requirements.txt
└── README.md
```

## Integration with Dashboard

Yahya's dashboard should fetch from these endpoints:

| Dashboard Screen | Endpoint |
|-----------------|----------|
| Farm Overview (Map) | `GET /fields` |
| Field Detail | `GET /fields/{field_id}` |
| Alerts & Recommendations | `GET /alerts` |
| System Status | `GET /system` |

CORS is enabled for all origins to allow local development.
