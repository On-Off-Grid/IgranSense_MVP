"""Pydantic models for the Edge Simulation Service."""

from datetime import datetime, date
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from .enums import FieldStatus, AlertSeverity, AlertType


# =============================================================================
# Base Data Models (matching JSON file structures)
# =============================================================================

class Sensor(BaseModel):
    """Sensor registry entry - matches sensors.json structure."""
    sensor_id: str
    field_id: str
    farm_id: str = "farm_1"  # Default for backward compatibility
    type: str  # e.g. "soil_moisture", "temperature", "humidity"
    grid_row: int = 1  # Row position in field grid
    grid_col: int = 1  # Column position in field grid
    status: str  # e.g. "online", "offline", "battery_low"


class FieldData(BaseModel):
    """Field geometry and grid configuration - matches fields.json structure."""
    field_id: str
    farm_id: str
    name: str
    area_ha: float
    polygon: List[List[float]]  # Normalized coordinates [[x,y], ...]
    grid_rows: int
    grid_cols: int


class Reading(BaseModel):
    """Time-series sensor reading - matches readings.json structure."""
    timestamp: datetime
    sensor_id: str
    value: float
    unit: str  # e.g. "%", "°C"
    quality_flag: str  # e.g. "good", "noisy", "missing"


class NDVISnapshot(BaseModel):
    """Weekly NDVI values per field - matches ndvi_snapshots.json structure."""
    date: date
    field_id: str
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float


# =============================================================================
# Rule Configuration Models (matching rules.json structure)
# =============================================================================

class MoistureRule(BaseModel):
    """Soil moisture threshold rule."""
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
    """NDVI week-over-week drop rule."""
    drop_pct_threshold: float = Field(
        ..., description="Percentage drop week-over-week that triggers an alert"
    )
    severity: AlertSeverity
    recommendation: str


class NDVIAbsoluteRule(BaseModel):
    """NDVI absolute threshold rule."""
    min_ndvi: float = Field(
        ..., description="Minimum acceptable NDVI for healthy crop"
    )
    severity: AlertSeverity
    recommendation: str


class RulesConfig(BaseModel):
    """Complete agronomic rules configuration."""
    crop_type: str  # e.g. "tomato"
    soil_moisture_rules: List[MoistureRule]
    ndvi_trend_rules: List[NDVITrendRule]
    ndvi_absolute_rules: List[NDVIAbsoluteRule]


# =============================================================================
# API Response Models
# =============================================================================

class FieldSummary(BaseModel):
    """Field summary for GET /fields response."""
    id: str
    name: str
    status: FieldStatus
    soil_moisture_pct: float
    ndvi: float
    recommendation: str


class SensorResponse(BaseModel):
    """Sensor info for field response."""
    sensor_id: str
    field_id: str
    type: str
    grid_row: int
    grid_col: int
    status: str


class FieldWithGeometry(BaseModel):
    """Extended field response with geometry and sensors for 2D schematic."""
    id: str
    farm_id: str
    name: str
    area_ha: float
    polygon: List[List[float]]
    grid_rows: int
    grid_cols: int
    status: FieldStatus
    soil_moisture_pct: float
    ndvi: float
    recommendation: str
    sensors: List[SensorResponse]


class TimeSeriesPoint(BaseModel):
    """Single point in a time series."""
    timestamp: datetime
    value: float


class NDVITimeSeriesPoint(BaseModel):
    """Single NDVI data point."""
    date: date
    mean_ndvi: float


class FieldDetail(BaseModel):
    """Detailed field information."""
    id: str
    name: str
    status: FieldStatus
    soil_moisture_pct: float
    ndvi: float
    recommendation: str


class FieldDetailResponse(BaseModel):
    """Complete field detail response for GET /fields/{id}."""
    field: FieldDetail
    soil_moisture_timeseries: List[TimeSeriesPoint]
    temperature_timeseries: List[TimeSeriesPoint]
    ndvi_timeseries: List[NDVITimeSeriesPoint]


class Alert(BaseModel):
    """Alert model for GET /alerts response."""
    type: AlertType
    severity: AlertSeverity
    field_id: str
    timestamp: datetime
    trigger_values: Dict[str, float]
    message: str


class SensorHealthSummary(BaseModel):
    """Summary of sensor health status."""
    total_sensors: int
    online_sensors: int
    offline_sensors: int
    battery_low_sensors: int


class SystemStatus(BaseModel):
    """System status for GET /system response."""
    mdc_status: str  # "online" or "offline"
    last_sync: datetime
    sensor_health_summary: SensorHealthSummary


# =============================================================================
# Sensor Registry Models
# =============================================================================

class SensorExtended(BaseModel):
    """Extended sensor info for GET /sensors response."""
    sensor_id: str
    field_id: str
    type: str  # "soil_moisture", "temperature", "humidity"
    grid_row: int
    grid_col: int
    status: str  # "online", "offline", "battery_low"
    last_seen_at: Optional[datetime] = None
    battery_pct: Optional[float] = None
    firmware_version: Optional[str] = None
    field_name: Optional[str] = None  # Denormalized for convenience


class SensorReading(BaseModel):
    """Single sensor reading for detail view."""
    timestamp: datetime
    value: float
    unit: str


class SensorDetail(BaseModel):
    """Detailed sensor info for GET /sensors/{id} response."""
    sensor: SensorExtended
    recent_readings: List[SensorReading]
    avg_value_24h: Optional[float] = None
    min_value_24h: Optional[float] = None
    max_value_24h: Optional[float] = None


# =============================================================================
# Authentication Models
# =============================================================================

class User(BaseModel):
    """User model for authentication."""
    id: str
    email: str
    role: str  # "local_farm", "farmer", "enterprise", "admin"
    farm_ids: List[str] = []
    org_id: Optional[str] = None


class UserInDB(User):
    """User model with hashed password for storage."""
    hashed_password: str


class LoginRequest(BaseModel):
    """Login request payload."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response with token and user info."""
    access_token: str
    token_type: str = "bearer"
    user: User


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: str  # user email
    role: str
    exp: Optional[datetime] = None
