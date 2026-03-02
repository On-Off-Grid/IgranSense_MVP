"""Rule engine for computing field status and generating alerts."""

from datetime import datetime, timezone
from typing import List, Tuple

from ..enums import FieldStatus, AlertSeverity, AlertType
from ..models import (
    RulesConfig,
    FieldSummary,
    FieldWithGeometry,
    SensorResponse,
    Alert,
)
from .data_loader import (
    load_rules,
    get_field_ids,
    get_fields_for_farm,
    get_sensors_for_field,
    get_latest_soil_moisture,
    get_latest_ndvi,
    calculate_ndvi_trend_drop,
)


# Field name mapping
FIELD_NAMES = {
    # Farm 1 - North Valley Farm (Fes-Meknes)
    "field_1": "Tomato Block A",
    "field_2": "Tomato Block B", 
    "field_3": "Tomato Block C",
    # Farm 2 - Coastal Olive Grove (Tangier-Tetouan)
    "field_4": "Olive Grove North",
    "field_5": "Olive Grove South",
    "field_6": "Citrus Orchard",
    "field_7": "Vegetable Patch A",
    "field_8": "Vegetable Patch B",
    # Farm 3 - Atlas Highlands Farm (Draa-Tafilalet)
    "field_9": "Date Palm East",
    "field_10": "Date Palm West",
}


def get_field_name(field_id: str) -> str:
    """Get human-readable field name."""
    return FIELD_NAMES.get(field_id, f"Field {field_id}")


def compute_field_status(
    soil_moisture: float,
    ndvi: float,
    rules: RulesConfig,
) -> Tuple[FieldStatus, str]:
    """
    Compute field status and recommendation based on soil moisture and NDVI.
    Returns (status, recommendation).
    """
    # Check soil moisture rules first (more urgent)
    for rule in rules.soil_moisture_rules:
        min_ok = rule.min_inclusive is None or soil_moisture >= rule.min_inclusive
        max_ok = rule.max_exclusive is None or soil_moisture < rule.max_exclusive
        if min_ok and max_ok:
            return rule.status, rule.recommendation
    
    # Default to OK
    return FieldStatus.OK, "No action needed."


def generate_alerts_for_field(
    field_id: str,
    soil_moisture: float,
    ndvi: float,
    ndvi_trend_drop: float,
    rules: RulesConfig,
) -> List[Alert]:
    """Generate all applicable alerts for a field."""
    alerts: List[Alert] = []
    now = datetime.now(timezone.utc)
    
    # Check soil moisture rules
    for rule in rules.soil_moisture_rules:
        min_ok = rule.min_inclusive is None or soil_moisture >= rule.min_inclusive
        max_ok = rule.max_exclusive is None or soil_moisture < rule.max_exclusive
        
        if min_ok and max_ok and rule.severity != AlertSeverity.INFO:
            alerts.append(Alert(
                type=AlertType.IRRIGATION,
                severity=rule.severity,
                field_id=field_id,
                timestamp=now,
                trigger_values={
                    "soil_moisture_pct": soil_moisture,
                    "threshold_pct": rule.max_exclusive if rule.max_exclusive else rule.min_inclusive or 0,
                },
                message=f"{get_field_name(field_id)}: {rule.recommendation}",
            ))
            break  # Only one moisture alert per field
    
    # Check NDVI trend rules
    for rule in rules.ndvi_trend_rules:
        if ndvi_trend_drop >= rule.drop_pct_threshold:
            alerts.append(Alert(
                type=AlertType.STRESS,
                severity=rule.severity,
                field_id=field_id,
                timestamp=now,
                trigger_values={
                    "ndvi_drop_pct": round(ndvi_trend_drop, 1),
                    "threshold_pct": rule.drop_pct_threshold,
                },
                message=f"{get_field_name(field_id)}: {rule.recommendation}",
            ))
    
    # Check NDVI absolute rules
    for rule in rules.ndvi_absolute_rules:
        if ndvi < rule.min_ndvi:
            alerts.append(Alert(
                type=AlertType.STRESS,
                severity=rule.severity,
                field_id=field_id,
                timestamp=now,
                trigger_values={
                    "ndvi": ndvi,
                    "threshold_ndvi": rule.min_ndvi,
                },
                message=f"{get_field_name(field_id)}: {rule.recommendation}",
            ))
    
    return alerts


def compute_all_field_summaries(farm_id: str = None) -> List[FieldSummary]:
    """Compute status summaries for all fields, optionally filtered by farm."""
    rules = load_rules()
    field_ids = get_field_ids(farm_id)
    summaries = []
    
    for field_id in sorted(field_ids):
        soil_moisture = get_latest_soil_moisture(field_id)
        ndvi = get_latest_ndvi(field_id)
        status, recommendation = compute_field_status(soil_moisture, ndvi, rules)
        
        summaries.append(FieldSummary(
            id=field_id,
            name=get_field_name(field_id),
            status=status,
            soil_moisture_pct=soil_moisture,
            ndvi=ndvi,
            recommendation=recommendation,
        ))
    
    return summaries


def compute_fields_with_geometry(farm_id: str = None) -> List[FieldWithGeometry]:
    """Compute fields with geometry, sensors, and status for 2D schematic view."""
    rules = load_rules()
    fields = get_fields_for_farm(farm_id)
    result = []
    
    for field in fields:
        field_id = field.field_id
        soil_moisture = get_latest_soil_moisture(field_id)
        ndvi = get_latest_ndvi(field_id)
        status, recommendation = compute_field_status(soil_moisture, ndvi, rules)
        
        # Get sensors for this field
        sensors = get_sensors_for_field(field_id)
        sensor_responses = [
            SensorResponse(
                sensor_id=s.sensor_id,
                field_id=s.field_id,
                type=s.type,
                grid_row=s.grid_row,
                grid_col=s.grid_col,
                status=s.status,
            )
            for s in sensors
        ]
        
        result.append(FieldWithGeometry(
            id=field_id,
            farm_id=field.farm_id,
            name=field.name,
            area_ha=field.area_ha,
            polygon=field.polygon,
            grid_rows=field.grid_rows,
            grid_cols=field.grid_cols,
            status=status,
            soil_moisture_pct=soil_moisture,
            ndvi=ndvi,
            recommendation=recommendation,
            sensors=sensor_responses,
        ))
    
    return result


def compute_all_alerts(farm_id: str = None) -> List[Alert]:
    """Generate alerts for all fields, optionally filtered by farm."""
    rules = load_rules()
    field_ids = get_field_ids(farm_id)
    all_alerts = []
    
    for field_id in field_ids:
        soil_moisture = get_latest_soil_moisture(field_id)
        ndvi = get_latest_ndvi(field_id)
        ndvi_trend_drop = calculate_ndvi_trend_drop(field_id)
        
        alerts = generate_alerts_for_field(
            field_id, soil_moisture, ndvi, ndvi_trend_drop, rules
        )
        all_alerts.extend(alerts)
    
    # Sort by severity (critical first) then timestamp
    severity_order = {AlertSeverity.CRITICAL: 0, AlertSeverity.WARNING: 1, AlertSeverity.INFO: 2}
    all_alerts.sort(key=lambda a: (severity_order[a.severity], -a.timestamp.timestamp()))
    
    return all_alerts
