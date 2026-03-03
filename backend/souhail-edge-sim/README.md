# IgranSense Edge Simulation Service (Backend)

FastAPI-based edge simulation service for IgranSense. Reads local JSON files, applies agronomic rules, generates alerts, and exposes a REST API for the frontend dashboard.

> **Owner**: Backend Team  
> **Frontend Dashboard**: See [../../frontend/README.md](../../frontend/README.md)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.0+ | Web framework |
| Uvicorn | 0.27.0+ | ASGI server |
| Pydantic | 2.5.0+ | Data validation & models |
| python-jose | 3.3.0+ | JWT token handling |
| passlib + bcrypt | 1.7.4+ / 4.0.1 | Password hashing |
| python-dateutil | 2.8.2+ | Date/time utilities |

## Prerequisites

- **Python**: 3.10+ (`python3 --version`)
- **pip**: Latest (`pip --version`)

## Installation

```bash
# From project root
cd backend/souhail-edge-sim

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running the API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **API Root**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
souhail-edge-sim/
├── requirements.txt         # Python dependencies
├── README.md                # This file
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app & all routes
│   ├── config.py            # Paths, API settings
│   ├── models.py            # Pydantic models (request/response)
│   ├── enums.py             # Status & severity enums
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth.py          # JWT auth, password hashing
│   │   ├── data_loader.py   # Read JSON data files
│   │   ├── rule_engine.py   # Field status & alert logic
│   │   └── system_health.py # MDC & sensor health summary
│   └── utils/
│       ├── __init__.py
│       └── time_utils.py    # Time helpers
└── data/
    ├── fields.json          # Field geometry & grid config
    ├── sensors.json         # Sensor registry per field
    ├── readings.json        # 30-day sensor time series
    ├── ndvi_snapshots.json  # Weekly NDVI values per field
    ├── rules.json           # Agronomic thresholds
    └── users.json           # Demo user accounts
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate user, returns JWT token |
| `GET` | `/auth/me` | Get current authenticated user |

### Fields

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fields` | List all fields with geometry & status |
| `GET` | `/fields/{field_id}` | Get field detail with time series |

**Query Parameters** for `GET /fields`:
- `farm_id` (optional): Filter by farm (e.g., `farm_1`, `farm_2`, `farm_3`)

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts` | List all active alerts |
| `POST` | `/alerts/{field_id}/{alert_type}/acknowledge` | Acknowledge alert (auth required) |
| `POST` | `/alerts/{field_id}/{alert_type}/snooze` | Snooze alert (auth required) |
| `DELETE` | `/alerts/{field_id}/{alert_type}` | Dismiss alert (auth required) |

**Query Parameters** for `GET /alerts`:
- `farm_id` (optional): Filter by farm

### Sensors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sensors` | List all sensors with status |
| `GET` | `/sensors/{sensor_id}` | Get sensor detail with readings |

**Query Parameters** for `GET /sensors`:
- `status` (optional): Filter by status (`online`, `offline`, `battery_low`)
- `field_id` (optional): Filter by field
- `farm_id` (optional): Filter by farm
- `type` (optional): Filter by sensor type (`soil_moisture`, `temperature`, `humidity`)

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/system` | Get MDC status & sensor health summary |
| `GET` | `/health` | Health check endpoint |

## Response Examples

### GET /fields
```json
[
  {
    "id": "field_1",
    "name": "Tomato Block A",
    "farm_id": "farm_1",
    "status": "critical",
    "soil_moisture_pct": 14.0,
    "ndvi": 0.32,
    "recommendation": "Irrigate immediately — soil moisture below 18% critical threshold.",
    "polygon": [[0, 0], [100, 0], [100, 100], [0, 100]],
    "grid_rows": 3,
    "grid_cols": 4,
    "sensors": [...]
  }
]
```

### GET /alerts
```json
[
  {
    "field_id": "field_1",
    "type": "irrigation",
    "severity": "critical",
    "message": "Soil moisture critically low at 14%",
    "trigger_value": 14.0,
    "threshold": 18.0,
    "created_at": "2026-03-03T10:30:00Z"
  }
]
```

### GET /system
```json
{
  "mdc_status": "online",
  "last_sync": "2026-03-03T10:45:00Z",
  "sensor_health": {
    "total": 12,
    "online": 10,
    "offline": 1,
    "battery_low": 1
  }
}
```

## Agronomic Rules

The rule engine applies FAO-56 thresholds for tomatoes in Souss-Massa region:

### Soil Moisture Thresholds

| Soil Moisture | Status | Action |
|---------------|--------|--------|
| < 18% | Critical | Irrigate immediately |
| 18-25% | Warning | Schedule within 24h |
| > 25% | OK | No action needed |

### NDVI Rules

| Condition | Severity | Action |
|-----------|----------|--------|
| Drop > 15% week-over-week | Warning | Check for water stress |
| NDVI < 0.35 | Critical | Severe stress detected |

Rules are configurable in `data/rules.json`.

## Authentication

### JWT Tokens
- Tokens expire after 24 hours
- Include `Authorization: Bearer <token>` header for protected routes
- Secret key is in `services/auth.py` (change in production!)

### Demo Users

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `admin@igransense.com` | `demo123` | admin | Full access + admin panel |
| `enterprise@demo.com` | `demo123` | enterprise | Multi-farm access |
| `farmer@demo.com` | `demo123` | farmer | Single farm, full features |
| `local` | `demo123` | local_farm | Basic monitoring only |

Users are stored in `data/users.json` with bcrypt-hashed passwords.

## Data Files

### fields.json
Defines field geometry and sensor grid layout:
```json
{
  "field_id": "field_1",
  "farm_id": "farm_1",
  "name": "Tomato Block A",
  "area_ha": 2.5,
  "polygon": [[0, 0], [100, 0], [100, 100], [0, 100]],
  "grid_rows": 3,
  "grid_cols": 4
}
```

### sensors.json
Lists sensors with grid positions:
```json
{
  "sensor_id": "SM_F1_01",
  "field_id": "field_1",
  "farm_id": "farm_1",
  "type": "soil_moisture",
  "grid_row": 1,
  "grid_col": 1,
  "status": "online"
}
```

### readings.json
Time-series sensor data (30 days, every 30 minutes):
```json
{
  "timestamp": "2026-03-01T06:00:00Z",
  "sensor_id": "SM_F1_01",
  "value": 22.5,
  "unit": "%",
  "quality_flag": "good"
}
```

### ndvi_snapshots.json
Weekly NDVI values from satellite imagery:
```json
{
  "date": "2026-02-24",
  "field_id": "field_1",
  "mean_ndvi": 0.45,
  "min_ndvi": 0.38,
  "max_ndvi": 0.52
}
```

## CORS Configuration

CORS is enabled for all origins during development:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Modifying Features

### Adding a New Endpoint

1. Add route function in `app/main.py`:
   ```python
   @app.get("/new-endpoint", response_model=NewModel, tags=["New"])
   async def new_endpoint():
       return {"data": "value"}
   ```

2. Add Pydantic model in `app/models.py` if needed:
   ```python
   class NewModel(BaseModel):
       data: str
   ```

### Adding a New Agronomic Rule

1. Update `data/rules.json` with new thresholds
2. Modify `services/rule_engine.py` to apply the new rule
3. Add corresponding alert type in `enums.py` if needed

### Adding a New User Role

1. Add role to `enums.py` (if using enum)
2. Update `data/users.json` with test users
3. Coordinate with frontend team to update `rolePermissions.js`

### Adding a New Data Source

1. Create new JSON file in `data/`
2. Add loader function in `services/data_loader.py`
3. Create Pydantic models in `models.py`
4. Add endpoint in `main.py`

## Integration with Frontend

The frontend proxies requests from `/api/*` to this backend. Endpoint mapping:

| Frontend Function | Backend Endpoint |
|------------------|------------------|
| `login()` | `POST /auth/login` |
| `getCurrentUser()` | `GET /auth/me` |
| `getFields()` | `GET /fields` |
| `getFieldDetail()` | `GET /fields/{id}` |
| `getAlerts()` | `GET /alerts` |
| `getSystemStatus()` | `GET /system` |
| `getSensors()` | `GET /sensors` |
| `getSensorDetail()` | `GET /sensors/{id}` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Ensure virtual environment is activated |
| `Port 8000 in use` | Kill existing process or use `--port 8001` |
| `JSON decode error` | Check data files for valid JSON syntax |
| `401 Unauthorized` | Check JWT token expiration; re-login |
| CORS errors from frontend | Verify CORS middleware allows frontend origin |

## Testing

```bash
# Test API is running
curl http://localhost:8000/

# Test login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "farmer@demo.com", "password": "demo123"}'

# Test fields endpoint
curl http://localhost:8000/fields
```

## Contributing

1. Follow existing code structure and naming conventions
2. Add Pydantic models for all request/response schemas
3. Document new endpoints in this README
4. Coordinate API changes with frontend team
5. Update `data/` JSON files when adding new mock data
