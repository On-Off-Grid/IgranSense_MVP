"""System health monitoring utilities."""

from datetime import datetime, timezone, timedelta

from ..models import SystemStatus, SensorHealthSummary
from .data_loader import load_sensors


def compute_sensor_health() -> SensorHealthSummary:
    """Compute sensor health summary from sensor registry."""
    sensors = load_sensors()
    
    total = len(sensors)
    online = sum(1 for s in sensors if s.status == "online")
    offline = sum(1 for s in sensors if s.status == "offline")
    battery_low = sum(1 for s in sensors if s.status == "battery_low")
    
    return SensorHealthSummary(
        total_sensors=total,
        online_sensors=online,
        offline_sensors=offline,
        battery_low_sensors=battery_low,
    )


def compute_system_status() -> SystemStatus:
    """Compute overall system status."""
    sensor_health = compute_sensor_health()
    now = datetime.now(timezone.utc)
    
    # Simulate last sync as recent (5 minutes ago)
    last_sync = now - timedelta(minutes=5)
    
    # MDC is online if we have any online sensors
    mdc_status = "online" if sensor_health.online_sensors > 0 else "offline"
    
    return SystemStatus(
        mdc_status=mdc_status,
        last_sync=last_sync,
        sensor_health_summary=sensor_health,
    )
