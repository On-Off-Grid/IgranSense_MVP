"""Service logic for irrigation & water KPIs, time series, and moisture zones.

Assumptions (documented for transparency):
 • "Water-use efficiency proxy" = fraction of fields with latest NDVI > 0.5.
   This is a simplified crop-health heuristic, not a true WUE calculation.
 • Under-irrigated = latest soil moisture below the *warning* threshold (18 %).
 • Over-irrigated  = latest soil moisture above a fixed saturation proxy (40 %).
   (Rules.json doesn't define saturation, so 40 % is a reasonable guess for
    Mediterranean tomato/olive crops.  A v2.2 improvement would add this to rules.json.)
 • Optimal = everything in between.
 • Time-range buckets: "today" (0–24 h), "7d", "30d", "season" (all data).
"""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from ..models import (
    WaterKPI,
    IrrigationTimeSeries,
    MoistureZone,
    WaterDashboardResponse,
)
from .data_loader import (
    get_irrigation_events_for_farm,
    get_fields_for_farm,
    get_latest_soil_moisture,
    get_latest_ndvi,
    load_rules,
)
from .rule_engine import get_field_name

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SATURATION_THRESHOLD = 40.0  # % soil moisture — above this → over-irrigated

TIME_RANGE_DAYS = {
    "today": 1,
    "7d": 7,
    "30d": 30,
    "season": 365,  # effectively "all"
}


def _cutoff_for_range(time_range: str) -> Optional[datetime]:
    """Return a UTC datetime cutoff for filtering events, or None for 'all'."""
    days = TIME_RANGE_DAYS.get(time_range, 30)
    if days >= 365:
        return None
    return datetime.now(timezone.utc) - timedelta(days=days)


# ---------------------------------------------------------------------------
# KPI computation
# ---------------------------------------------------------------------------

def compute_water_kpis(farm_id: str, time_range: str = "7d") -> WaterKPI:
    """Aggregate water-usage KPIs for *farm_id* within *time_range*."""
    days = TIME_RANGE_DAYS.get(time_range, 7)
    events = get_irrigation_events_for_farm(farm_id, days=days if days < 365 else None)
    fields = get_fields_for_farm(farm_id)

    total_volume = sum(e.volume_liters for e in events)
    total_ha = sum(f.area_ha for f in fields) or 1  # avoid /0
    volume_per_ha = total_volume / total_ha

    # Efficiency proxy: fraction of fields with NDVI > 0.5
    field_ids = [f.field_id for f in fields]
    ndvi_above = sum(1 for fid in field_ids if get_latest_ndvi(fid) > 0.5)
    efficiency = ndvi_above / max(len(field_ids), 1)

    # Moisture classification
    rules = load_rules()
    # Find the warning threshold (max_exclusive of the first rule — 18 %)
    warning_threshold = 18.0
    for rule in rules.soil_moisture_rules:
        if rule.status.value == "critical" and rule.max_exclusive is not None:
            warning_threshold = rule.max_exclusive
            break

    under = opt = over = 0
    for fid in field_ids:
        sm = get_latest_soil_moisture(fid)
        if sm < warning_threshold:
            under += 1
        elif sm > SATURATION_THRESHOLD:
            over += 1
        else:
            opt += 1

    n = max(len(field_ids), 1)
    return WaterKPI(
        total_volume_liters=round(total_volume, 1),
        volume_per_hectare=round(volume_per_ha, 1),
        efficiency_proxy=round(efficiency, 2),
        pct_under_irrigated=round(under / n * 100, 1),
        pct_over_irrigated=round(over / n * 100, 1),
        pct_optimal=round(opt / n * 100, 1),
    )


# ---------------------------------------------------------------------------
# Time-series aggregation (daily volume per field)
# ---------------------------------------------------------------------------

def compute_irrigation_time_series(
    farm_id: str, time_range: str = "7d"
) -> List[IrrigationTimeSeries]:
    """Return daily irrigation volumes grouped by field."""
    days = TIME_RANGE_DAYS.get(time_range, 7)
    events = get_irrigation_events_for_farm(farm_id, days=days if days < 365 else None)

    # {field_id: {date_str: total_liters}}
    by_field: dict[str, dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for e in events:
        date_str = e.start_time.strftime("%Y-%m-%d")
        by_field[e.field_id][date_str] += e.volume_liters

    result: List[IrrigationTimeSeries] = []
    for field_id in sorted(by_field):
        daily = [
            {"date": d, "volume_liters": v}
            for d, v in sorted(by_field[field_id].items())
        ]
        result.append(
            IrrigationTimeSeries(
                field_id=field_id,
                field_name=get_field_name(field_id),
                events=daily,
            )
        )
    return result


# ---------------------------------------------------------------------------
# Moisture zone distribution
# ---------------------------------------------------------------------------

def compute_moisture_zones(farm_id: str) -> MoistureZone:
    """Classify farm's fields into dry / optimal / wet moisture zones."""
    fields = get_fields_for_farm(farm_id)
    rules = load_rules()

    warning_threshold = 18.0
    for rule in rules.soil_moisture_rules:
        if rule.status.value == "critical" and rule.max_exclusive is not None:
            warning_threshold = rule.max_exclusive
            break

    dry = opt = wet = 0
    for f in fields:
        sm = get_latest_soil_moisture(f.field_id)
        if sm < warning_threshold:
            dry += 1
        elif sm > SATURATION_THRESHOLD:
            wet += 1
        else:
            opt += 1

    n = max(len(fields), 1)
    return MoistureZone(
        dry_pct=round(dry / n * 100, 1),
        optimal_pct=round(opt / n * 100, 1),
        wet_pct=round(wet / n * 100, 1),
    )


# ---------------------------------------------------------------------------
# Combined dashboard response
# ---------------------------------------------------------------------------

def compute_water_dashboard(
    farm_id: str, time_range: str = "7d"
) -> WaterDashboardResponse:
    """Build the full water dashboard payload for GET /water."""
    return WaterDashboardResponse(
        kpis=compute_water_kpis(farm_id, time_range),
        irrigation_series=compute_irrigation_time_series(farm_id, time_range),
        moisture_zones=compute_moisture_zones(farm_id),
        time_range=time_range,
    )
