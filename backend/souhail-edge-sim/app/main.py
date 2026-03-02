"""
IgranSense Edge Simulation Service

FastAPI-based edge simulation service that reads local JSON files,
applies agronomic rules, and exposes a REST API for the dashboard.
"""

from datetime import datetime, timedelta
from random import random, randint
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import API_TITLE, API_VERSION, API_DESCRIPTION
from .models import (
    FieldSummary,
    FieldWithGeometry,
    FieldDetailResponse,
    FieldDetail,
    Alert,
    SystemStatus,
    TimeSeriesPoint,
    NDVITimeSeriesPoint,
    LoginRequest,
    LoginResponse,
    User,
    SensorExtended,
    SensorDetail,
    SensorReading,
)
from .services.data_loader import (
    get_field_ids,
    get_latest_soil_moisture,
    get_latest_ndvi,
    get_readings_for_field,
    get_ndvi_for_field,
    load_rules,
    load_sensors,
    load_readings,
)
from .services.rule_engine import (
    compute_all_field_summaries,
    compute_fields_with_geometry,
    compute_all_alerts,
    compute_field_status,
    get_field_name,
)
from .services.system_health import compute_system_status
from .services.auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
)

# Security scheme for Bearer token
security = HTTPBearer(auto_error=False)


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
)

# Enable CORS for dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API info."""
    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "status": "running",
        "endpoints": ["/fields", "/fields/{field_id}", "/alerts", "/system", "/auth/login", "/auth/me"],
    }


# =============================================================================
# Authentication Endpoints
# =============================================================================

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """Dependency to get current user from token (optional)."""
    if not credentials:
        return None
    return get_current_user(credentials.credentials)


async def require_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """Dependency to require authenticated user."""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@app.post("/auth/login", response_model=LoginResponse, tags=["Auth"])
async def login(request: LoginRequest) -> LoginResponse:
    """
    Authenticate user and return JWT token.
    
    Demo credentials:
    - farmer@demo.com / demo123 (Farmer role)
    - enterprise@demo.com / demo123 (Enterprise role)
    - admin@igransense.com / demo123 (Admin role)
    - local / demo123 (Local Farm role)
    """
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    token = create_access_token(user)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )


@app.get("/auth/me", response_model=User, tags=["Auth"])
async def get_me(user: User = Depends(require_user)) -> User:
    """Get current authenticated user."""
    return user


@app.get("/fields", response_model=List[FieldWithGeometry], tags=["Fields"])
async def list_fields(farm_id: Optional[str] = None) -> List[FieldWithGeometry]:
    """
    Get list of all fields with geometry, sensors, and current status.
    
    Query params:
    - farm_id: Filter by farm (e.g., "farm_1", "farm_2", "farm_3")
    
    Returns fields with:
    - Field geometry (polygon, grid dimensions)
    - Sensors array with grid positions
    - Current status (ok/warning/critical)
    - Latest soil moisture percentage
    - Latest NDVI value
    - Irrigation recommendation
    """
    return compute_fields_with_geometry(farm_id)


@app.get("/fields/{field_id}", response_model=FieldDetailResponse, tags=["Fields"])
async def get_field_detail(field_id: str) -> FieldDetailResponse:
    """
    Get detailed information for a specific field.
    
    Returns:
    - Field status and current values
    - Soil moisture time series (30 days)
    - Temperature time series (30 days)
    - NDVI time series (weekly snapshots)
    """
    # Validate field exists
    field_ids = get_field_ids()
    if field_id not in field_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Field '{field_id}' not found. Available fields: {field_ids}"
        )
    
    # Get current values
    soil_moisture = get_latest_soil_moisture(field_id)
    ndvi = get_latest_ndvi(field_id)
    rules = load_rules()
    status, recommendation = compute_field_status(soil_moisture, ndvi, rules)
    
    # Build time series data
    soil_readings = get_readings_for_field(field_id, "soil_moisture")
    temp_readings = get_readings_for_field(field_id, "temperature")
    ndvi_snapshots = get_ndvi_for_field(field_id)
    
    soil_timeseries = [
        TimeSeriesPoint(timestamp=r.timestamp, value=r.value)
        for r in soil_readings
    ]
    
    temp_timeseries = [
        TimeSeriesPoint(timestamp=r.timestamp, value=r.value)
        for r in temp_readings
    ]
    
    ndvi_timeseries = [
        NDVITimeSeriesPoint(date=s.date, mean_ndvi=s.mean_ndvi)
        for s in ndvi_snapshots
    ]
    
    return FieldDetailResponse(
        field=FieldDetail(
            id=field_id,
            name=get_field_name(field_id),
            status=status,
            soil_moisture_pct=soil_moisture,
            ndvi=ndvi,
            recommendation=recommendation,
        ),
        soil_moisture_timeseries=soil_timeseries,
        temperature_timeseries=temp_timeseries,
        ndvi_timeseries=ndvi_timeseries,
    )


@app.get("/alerts", response_model=List[Alert], tags=["Alerts"])
async def list_alerts(farm_id: Optional[str] = None) -> List[Alert]:
    """
    Get list of active alerts.
    
    Query params:
    - farm_id: Filter by farm (e.g., "farm_1", "farm_2", "farm_3")
    
    Returns alerts sorted by severity (critical first) then timestamp.
    Each alert includes:
    - Type (irrigation/stress/system)
    - Severity (critical/warning/info)
    - Affected field
    - Trigger values that caused the alert
    - Human-readable message
    """
    return compute_all_alerts(farm_id)


# In-memory storage for alert actions (would be a database in production)
_acknowledged_alerts: set = set()
_snoozed_alerts: dict = {}  # alert_key -> snooze_until
_dismissed_alerts: set = set()


def _get_alert_key(field_id: str, alert_type: str) -> str:
    """Generate a unique key for an alert."""
    return f"{field_id}:{alert_type}"


@app.post("/alerts/{field_id}/{alert_type}/acknowledge", tags=["Alerts"])
async def acknowledge_alert(
    field_id: str, 
    alert_type: str,
    user: User = Depends(require_user)
) -> dict:
    """
    Acknowledge an alert. Requires authentication.
    """
    key = _get_alert_key(field_id, alert_type)
    _acknowledged_alerts.add(key)
    return {"status": "acknowledged", "field_id": field_id, "alert_type": alert_type}


@app.post("/alerts/{field_id}/{alert_type}/snooze", tags=["Alerts"])
async def snooze_alert(
    field_id: str, 
    alert_type: str,
    hours: int = 1,
    user: User = Depends(require_user)
) -> dict:
    """
    Snooze an alert for specified hours. Requires authentication.
    """
    from datetime import timedelta
    key = _get_alert_key(field_id, alert_type)
    snooze_until = datetime.utcnow() + timedelta(hours=hours)
    _snoozed_alerts[key] = snooze_until
    return {"status": "snoozed", "field_id": field_id, "alert_type": alert_type, "until": snooze_until.isoformat()}


@app.delete("/alerts/{field_id}/{alert_type}", tags=["Alerts"])
async def dismiss_alert(
    field_id: str, 
    alert_type: str,
    user: User = Depends(require_user)
) -> dict:
    """
    Dismiss an alert. Requires authentication.
    """
    key = _get_alert_key(field_id, alert_type)
    _dismissed_alerts.add(key)
    return {"status": "dismissed", "field_id": field_id, "alert_type": alert_type}


@app.get("/system", response_model=SystemStatus, tags=["System"])
async def get_system_status() -> SystemStatus:
    """
    Get system status.
    
    Returns:
    - MDC status (online/offline)
    - Last sync timestamp
    - Sensor health summary (online/offline/battery_low counts)
    """
    return compute_system_status()


# =============================================================================
# Sensors Endpoints
# =============================================================================

FIELD_NAMES = {
    "field_1": "North Block A",
    "field_2": "South Block B", 
    "field_3": "East Block C",
}


def _generate_sensor_extended(sensor) -> SensorExtended:
    """Convert basic sensor to extended with mock data."""
    # Mock data generation based on sensor status
    now = datetime.utcnow()
    
    if sensor.status == "online":
        last_seen = now - timedelta(minutes=randint(1, 10))
        battery = 50 + random() * 50  # 50-100%
    elif sensor.status == "battery_low":
        last_seen = now - timedelta(minutes=randint(5, 30))
        battery = 5 + random() * 15  # 5-20%
    else:  # offline
        last_seen = now - timedelta(hours=randint(2, 48))
        battery = None
    
    return SensorExtended(
        sensor_id=sensor.sensor_id,
        field_id=sensor.field_id,
        type=sensor.type,
        grid_row=sensor.grid_row,
        grid_col=sensor.grid_col,
        status=sensor.status,
        last_seen_at=last_seen,
        battery_pct=round(battery, 1) if battery else None,
        firmware_version="1.2.3",
        field_name=FIELD_NAMES.get(sensor.field_id, sensor.field_id),
    )


@app.get("/sensors", response_model=List[SensorExtended], tags=["Sensors"])
async def list_sensors(
    status: Optional[str] = None,
    field_id: Optional[str] = None,
    farm_id: Optional[str] = None,
    type: Optional[str] = None,
) -> List[SensorExtended]:
    """
    Get list of all sensors with optional filters.
    
    Query params:
    - status: Filter by status (online, offline, battery_low)
    - field_id: Filter by field
    - farm_id: Filter by farm (e.g., "farm_1", "farm_2", "farm_3")
    - type: Filter by sensor type (soil_moisture, temperature, humidity)
    """
    sensors = load_sensors()
    
    # Apply filters
    if farm_id:
        sensors = [s for s in sensors if s.farm_id == farm_id]
    if status:
        sensors = [s for s in sensors if s.status == status]
    if field_id:
        sensors = [s for s in sensors if s.field_id == field_id]
    if type:
        sensors = [s for s in sensors if s.type == type]
    
    return [_generate_sensor_extended(s) for s in sensors]


@app.get("/sensors/{sensor_id}", response_model=SensorDetail, tags=["Sensors"])
async def get_sensor_detail(sensor_id: str) -> SensorDetail:
    """
    Get detailed information for a specific sensor.
    
    Returns:
    - Extended sensor info
    - Recent readings (last 24 readings)
    - 24-hour statistics
    """
    from .services.data_loader import get_readings_for_sensor
    
    sensors = load_sensors()
    sensor = next((s for s in sensors if s.sensor_id == sensor_id), None)
    
    if not sensor:
        sensor_ids = [s.sensor_id for s in sensors]
        raise HTTPException(
            status_code=404,
            detail=f"Sensor '{sensor_id}' not found. Available sensors: {sensor_ids[:5]}..."
        )
    
    # Get recent readings
    readings = get_readings_for_sensor(sensor_id)[:24]
    recent_readings = [
        SensorReading(
            timestamp=r.timestamp,
            value=r.value,
            unit=r.unit,
        ) for r in readings
    ]
    
    # Calculate 24h stats
    values = [r.value for r in readings]
    avg_24h = sum(values) / len(values) if values else None
    min_24h = min(values) if values else None
    max_24h = max(values) if values else None
    
    return SensorDetail(
        sensor=_generate_sensor_extended(sensor),
        recent_readings=recent_readings,
        avg_value_24h=round(avg_24h, 2) if avg_24h else None,
        min_value_24h=round(min_24h, 2) if min_24h else None,
        max_value_24h=round(max_24h, 2) if max_24h else None,
    )


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
