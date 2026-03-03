# Changelog

All notable changes to the IgranSense project are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [2.2.0] — 2026-03-03

### Added

#### Frontend
- **Sidebar navigation** (`Sidebar.jsx`) — collapsible icon-only sidebar (`w-16`) that expands to `w-60` on hover; contains role-based nav links, edge connection status, user info, and logout
- **Header component** (`Header.jsx`) — slim fixed top bar showing 🌱 logo + "IgranSense" title + farm selector dropdown
- **Mobile drawer** — hamburger button in header toggles a slide-out sidebar overlay on small screens
- **Slide-in animation** — CSS keyframe in `App.css` for mobile drawer entrance

### Changed

#### Frontend
- **App.jsx** — removed inline 165-line `NavBar` component; restructured layout to fixed header + sidebar + offset `<main>` content area
- **App.css** — replaced Vite boilerplate (unused `#root` max-width, `.logo` spin, `.card`) with mobile drawer animation
- **AdminLayout.jsx** — adjusted `min-h` calculation for new header height

### Removed
- Inline `NavBar` component (replaced by `Header.jsx` + `Sidebar.jsx`)
- Vite boilerplate CSS rules in `App.css`

### Repo Cleanup
- Removed `prompt.md` (internal AI system prompt)
- Removed `docs/plan-igranSenseAuthUxEnhancement.prompt.md` (internal planning)
- Removed `docs/plan-v2.1-dashboard.md` (internal sprint plan)
- Removed `launch.md` (redundant with QUICKSTART.md)
- Updated `.gitignore` to exclude `*.prompt.md` files
- Updated `README.md` with current screenshots, v2.2 features, and corrected project structure

---

## [2.1.0] — 2026-03-03

### Added

#### Backend
- **`GET /farms`** endpoint — returns farm registry with field counts
- **`GET /water`** endpoint — irrigation KPIs, time series, and moisture zones (supports `farm_id` and `time_range` query params)
- **`GET /weather`** endpoint — current conditions, 5-day forecast, irrigation window, and historical rainfall (supports `compact` mode)
- **Water service** (`app/services/water.py`) — computes irrigation volume KPIs, daily time series, and per-field moisture zone classification
- **Weather service** (`app/services/weather.py`) — builds weather dashboard from `weather.json` data; `get_compact_weather()` for embedded use
- **Rule trigger engine** — `compute_rule_triggers(field_id)` in `rule_engine.py` returns typed `RuleTrigger` objects for soil moisture, NDVI trend, and NDVI absolute rules
- **MDC metrics** — `compute_mdc_metrics()` in `system_health.py` returns simulated CPU, memory, disk, and requests-per-minute values
- **12 new Pydantic models** — `Farm`, `IrrigationEvent`, `WaterKPI`, `IrrigationTimeSeries`, `MoistureZone`, `WaterDashboardResponse`, `CurrentWeather`, `DailyForecast`, `IrrigationWindow`, `HistoricalRainfall`, `WeatherDashboardResponse`, `RuleTrigger`, `MDCMetrics`
- **3 new data files** — `farms.json`, `irrigation_events.json`, `weather.json`
- **3 new data loaders** — `load_farms()`, `load_irrigation_events()`, `load_weather()`
- **50 automated backend tests** (pytest + httpx) across 7 test modules

#### Frontend
- **Irrigation & Water page** (`IrrigationWater.jsx`) — KPI strip, time-range toggle, stacked bar chart (volume + rainfall), moisture zone summary
- **Weather & Risk page** (`WeatherRisk.jsx`) — current conditions with `WeatherIcon`, irrigation window card, 5-day forecast strip, historical rainfall bar chart
- **RecommendationExplainer** component — "Why this recommendation?" panel listing rule triggers with severity coloring
- **FieldWeatherCard** component — compact inline weather widget for Field Detail
- **SensorSparkline** component — tiny 20px Recharts line chart with type-based coloring
- **AggregatedAlertCard** component — expandable card grouping similar alerts by (type, severity)
- **CrossFarmSummary** component — enterprise/admin aggregate KPI strip (farms, fields, critical/warning/healthy)
- **WeatherIcon** shared component — maps weather conditions to emoji icons
- **Sort dropdown** in SensorRegistry — sort by Name, Battery, Last Seen, or Status
- **MDC metrics strip** in SystemStatus — CPU, Memory, Disk, Requests/min cards + "Edge processing active" banner
- **Per-org KPI columns** in OrgManager — critical-fields and offline-sensors counts
- **Role-aware navigation** — `getDefaultRoute(role)` helper; admin → `/admin`, others → `/farm-overview`
- **Route-level access guard** — `canAccessRoute()` in PrivateRoute redirects unauthorized roles
- **`view_cross_farm_summary`** action — enterprise and admin roles see cross-farm KPIs on FarmOverview
- **62 automated frontend tests** (vitest + @testing-library/react) across 10 test files

### Changed

#### Backend
- **`GET /fields/{field_id}`** — response now includes `triggers` (list of `RuleTrigger`) and `weather` (compact weather data)
- **`GET /system`** — response now includes `mdc_metrics` (CPU, memory, disk, requests/min)
- **`GET /sensors`** — `SensorExtended` model now includes `sparkline` field (last N reading values)
- `FieldDetailResponse` model extended with `triggers` and `weather` fields
- `SystemStatus` model extended with optional `mdc_metrics` field

#### Frontend
- **FieldDetail** — charts now have `ReferenceArea` threshold bands (critical/warning/optimal)
- **AlertsList** — added time-range toggle (24h/7d/30d) and aggregation toggle for client-side filtering
- **App.jsx** — added `RoleRedirect` component at root route; new routes for `/irrigation` and `/weather`
- **PrivateRoute** — now checks `canAccessRoute(role, path)` before rendering
- **FarmOverview** — conditionally renders CrossFarmSummary for enterprise/admin
- **rolePermissions.js** — added `getDefaultRoute()`, `view_cross_farm_summary` action, Irrigation and Weather nav items

### Documentation
- Updated Backend README — new endpoints, data files, project structure, test table, curl examples
- Updated Frontend README — new components, API functions, test table, role nav details
- Updated Root README — v2.1 feature list, endpoint table, test coverage, updated project tree
- Created CHANGELOG.md

---

## [2.0.0] — 2026-02-15

Initial MVP release with core dashboard functionality.

### Features
- FastAPI backend with JWT authentication
- React 19 + Vite 7 + Tailwind CSS 4 frontend
- 4 user roles: local_farm, farmer, enterprise, admin
- Farm Overview with expandable field cards
- Field Detail with 30-day time series (soil moisture, temperature, NDVI)
- Alerts page with severity-based grouping
- Sensor Registry with device inventory
- System Status with MDC gateway monitoring
- Admin panel (Users, Organizations, Diagnostics)
- Role-based navigation and permissions
- Mock data with 30-day generated sensor readings
