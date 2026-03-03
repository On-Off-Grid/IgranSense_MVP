# IgranSense Frontend

React-based dashboard for the IgranSense Smart Irrigation Decision Support System.

> **Owner**: Frontend Team  
> **Backend API**: See [../backend/souhail-edge-sim/README.md](../backend/souhail-edge-sim/README.md)

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| Vite | 7.3.1 | Build tool & dev server |
| React Router DOM | 7.13.1 | Client-side routing |
| Tailwind CSS | 4.2.1 | Utility-first styling |
| Recharts | 3.7.0 | Charts & data visualization |
| Axios | 1.13.6 | HTTP client (optional) |

## Prerequisites

- **Node.js**: 20+ (`node --version`)
- **npm**: 10+ (`npm --version`)
- **Backend API running** at `http://localhost:8000`

## Installation

```bash
# From project root
cd frontend

# Install dependencies
npm install
```

## Running the Development Server

```bash
npm run dev
```

Opens at **http://localhost:5173**

> API requests to `/api/*` are proxied to `http://localhost:8000` automatically.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run vitest test suite |
| `npx vitest --ui` | Open vitest browser UI |

## Project Structure

```
frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite config with API proxy
├── eslint.config.js        # ESLint configuration
├── public/                 # Static assets
└── src/
    ├── main.jsx            # React entry point
    ├── App.jsx             # Root component with routing
    ├── App.css             # Global styles
    ├── index.css           # Tailwind imports
    ├── api/
    │   └── client.js       # API client (fetchAPI, auth functions)
    ├── components/
    │   ├── FarmOverview.jsx       # Main dashboard view
    │   ├── FieldCard.jsx          # Field summary card
    │   ├── ExpandableFieldCard.jsx# Expandable field with schematic
    │   ├── FieldDetail.jsx        # Field detail charts + threshold bands (v2.1)
    │   ├── FieldSchematic.jsx     # Sensor grid visualization
    │   ├── AlertsList.jsx         # Alerts with time-range & aggregation (v2.1)
    │   ├── AlertCard.jsx          # Single alert display
    │   ├── AlertGroup.jsx         # Grouped alerts by field
    │   ├── AlertFilters.jsx       # Alert filtering controls
    │   ├── AggregatedAlertCard.jsx# Expandable aggregated alert card (v2.1)
    │   ├── SensorRegistry.jsx     # Sensor inventory with sort dropdown (v2.1)
    │   ├── SensorDetailPanel.jsx  # Sensor details modal
    │   ├── SensorHealthBar.jsx    # Sensor status indicator
    │   ├── SensorIcon.jsx         # Sensor type icons
    │   ├── SensorSparkline.jsx    # Tiny sparkline for sensor readings (v2.1)
    │   ├── SystemStatus.jsx       # System health + MDC metrics strip (v2.1)
    │   ├── MDCStatusCard.jsx      # Edge gateway status
    │   ├── IrrigationWater.jsx    # Irrigation & Water page (v2.1)
    │   ├── WeatherRisk.jsx        # Weather & Risk page (v2.1)
    │   ├── RecommendationExplainer.jsx # Rule trigger explainer (v2.1)
    │   ├── FieldWeatherCard.jsx   # Inline weather widget (v2.1)
    │   ├── CrossFarmSummary.jsx   # Enterprise cross-farm KPIs (v2.1)
    │   ├── auth/
    │   │   ├── index.js           # Auth component exports
    │   │   └── PrivateRoute.jsx   # Route protection + role guard (v2.1)
    │   └── shared/
    │       ├── index.js           # Shared component exports
    │       ├── Card.jsx           # Reusable card wrapper
    │       ├── ErrorBanner.jsx    # Error display component
    │       ├── KPIStrip.jsx       # Key metrics strip
    │       ├── LoadingSpinner.jsx # Loading indicator
    │       ├── MapLegend.jsx      # Map color legend
    │       ├── MetricCard.jsx     # Metric display card
    │       ├── MetricCardSkeleton.jsx # Loading skeleton
    │       ├── StatusBadge.jsx    # Status label component
    │       ├── StatusFilter.jsx   # Status filter dropdown
    │       ├── TimeRangeToggle.jsx# Time range selector
    │       └── WeatherIcon.jsx    # Weather condition icon (v2.1)
    ├── context/
    │   ├── AuthContext.jsx        # Authentication state
    │   └── FarmContext.jsx        # Multi-farm selection state
    ├── layouts/
    │   └── AdminLayout.jsx        # Admin panel layout
    ├── pages/
    │   ├── LoginPage.jsx          # Login form
    │   └── admin/
    │       ├── Diagnostics.jsx    # System diagnostics
    │       ├── OrgManager.jsx     # Organization management
    │       └── UserManager.jsx    # User management
    ├── styles/
    │   └── tokens.js              # Design tokens
    └── utils/
        └── rolePermissions.js     # Role-based access control
```

## Architecture

### Data Flow

```
┌────────────────┐     Fetch     ┌──────────────────┐
│  React Views   │ ───────────▶  │  /api/* Proxy    │
│  (Components)  │ ◀───────────  │  (Vite Config)   │
└───────┬────────┘     JSON      └────────┬─────────┘
        │                                  │
        │ State                            │ HTTP
        ▼                                  ▼
┌────────────────┐               ┌──────────────────┐
│   Contexts     │               │  Backend API     │
│  Auth + Farm   │               │  localhost:8000  │
└────────────────┘               └──────────────────┘
```

### API Client (`src/api/client.js`)

All API calls go through the centralized client:

| Function | Endpoint | Description |
|----------|----------|-------------|
| `login(email, password)` | `POST /api/auth/login` | Authenticate user |
| `getCurrentUser(token)` | `GET /api/auth/me` | Validate token |
| `getFarms()` | `GET /api/farms` | Fetch farm registry (v2.1) |
| `getFields(farmId?)` | `GET /api/fields` | Fetch field summaries |
| `getFieldDetail(fieldId)` | `GET /api/fields/{id}` | Fetch field + triggers + weather |
| `getAlerts(farmId?)` | `GET /api/alerts` | Fetch active alerts |
| `getSystemStatus()` | `GET /api/system` | Fetch system + MDC metrics |
| `getSensors(filters)` | `GET /api/sensors` | Fetch sensor registry |
| `getSensorDetail(sensorId)` | `GET /api/sensors/{id}` | Fetch sensor details |
| `getWaterDashboard(farmId, timeRange)` | `GET /api/water` | Fetch water KPIs (v2.1) |
| `getWeather(farmId, compact)` | `GET /api/weather` | Fetch weather data (v2.1) |

### Authentication Flow

1. User submits login form → `login()` API call
2. Backend returns JWT token + user object
3. Token stored in `localStorage` (`igransense_token`)
4. `AuthContext` provides `user`, `isAuthenticated`, `login()`, `logout()`
5. `PrivateRoute` checks role permissions before rendering protected routes

### Role-Based Access Control

| Role | Nav Items | Multi-Farm | Admin Panel |
|------|-----------|------------|-------------|
| `local_farm` | Overview, Alerts, System | ❌ | ❌ |
| `farmer` | Overview, Alerts, Sensors, Irrigation, Weather, System | ❌ | ❌ |
| `enterprise` | Overview, Alerts, Sensors, Irrigation, Weather, System + Cross-Farm Summary | ✅ | ❌ |
| `admin` | All + Admin | ✅ | ✅ |

Role-aware default landing:
- `admin` → `/admin`
- All others → `/farm-overview`

See `src/utils/rolePermissions.js` for detailed permission mappings.

## Key Components

### FarmOverview
- Main dashboard displaying all fields as expandable cards
- KPI strip showing field status counts
- Status and search filtering
- Fetches data from `/api/fields` and `/api/alerts`

### FieldDetail
- 30-day soil moisture time series chart with threshold reference bands (v2.1)
- Temperature time series chart with reference bands (v2.1)
- Weekly NDVI bar chart with reference bands (v2.1)
- **RecommendationExplainer** panel — "Why this recommendation?" with rule triggers (v2.1)
- **FieldWeatherCard** — inline current weather widget (v2.1)
- Current status and recommendation display

### IrrigationWater (v2.1)
- Water KPI strip: total volume, efficiency, events count, avg per event
- Time-range toggle (24h / 7d / 30d)
- Stacked bar chart of irrigation volume & rainfall
- Moisture zone summary (deficit / optimal / surplus per field)

### WeatherRisk (v2.1)
- Current conditions card with WeatherIcon
- Irrigation window recommendation
- 5-day forecast strip
- Historical monthly rainfall bar chart

### AlertsList
- Grouped alerts by field with severity badges
- **Time-range toggle** (24h / 7d / 30d) for client-side filtering (v2.1)
- **Aggregation toggle** — groups similar alerts by (type, severity) (v2.1)
- Actions: Acknowledge, Snooze, Dismiss
- Filtering by severity and alert type

### SensorRegistry
- Table of all sensors with status indicators
- **Sort dropdown** — Name, Battery, Last Seen, Status (v2.1)
- **Sparkline** for recent sensor readings (v2.1)
- Filter by status, field, and sensor type
- Click to view detailed sensor info

### SystemStatus
- MDC gateway status card
- **MDC metrics strip** — CPU, Memory, Disk, Requests/min (v2.1)
- **"Edge processing active" banner** (v2.1)
- Sensor health summary

### CrossFarmSummary (v2.1)
- Enterprise/admin aggregate KPI strip
- Shows total farms, fields, critical/warning/healthy counts
- Rendered conditionally at top of FarmOverview

## Environment Variables

The frontend uses Vite's proxy configuration (no `.env` needed for development):

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

For production builds, set the API URL via environment variable:

```bash
VITE_API_URL=https://api.igransense.com npm run build
```

## Modifying Features

### Adding a New Page

1. Create component in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`:
   ```jsx
   <Route path="/new-page" element={<PrivateRoute roles={['farmer', 'admin']}><NewPage /></PrivateRoute>} />
   ```
3. Add nav item in `src/utils/rolePermissions.js`:
   ```javascript
   export const NAV_ITEMS = {
     // ...existing
     newPage: { path: '/new-page', label: 'New Page', icon: '📄' },
   };
   ```
4. Update `ROLE_NAV_ITEMS` to include the new page for appropriate roles

### Adding a New API Endpoint

1. Add function in `src/api/client.js`:
   ```javascript
   export async function getNewData() {
     return fetchAPI('/new-endpoint');
   }
   ```
2. Import and use in your component:
   ```javascript
   import { getNewData } from '../api/client';
   ```

### Adding a New Shared Component

1. Create component in `src/components/shared/NewComponent.jsx`
2. Export from `src/components/shared/index.js`:
   ```javascript
   export { default as NewComponent } from './NewComponent';
   ```

## Testing (v2.1)

```bash
# Run all tests
npm test

# Run tests in watch mode
npx vitest

# Run a specific test file
npx vitest src/components/__tests__/IrrigationWater.test.jsx
```

Test coverage (62 tests across 10 files):

| File | Tests | Covers |
|------|------:|--------|
| `shared/__tests__/Card.test.jsx` | 3 | Card component |
| `__tests__/IrrigationWater.test.jsx` | 4 | Irrigation page |
| `__tests__/WeatherRisk.test.jsx` | 6 | Weather page |
| `__tests__/FieldDetail.test.jsx` | 5 | Field detail + bands |
| `__tests__/AlertsList.test.jsx` | 8 | Alerts + time-range + aggregation |
| `__tests__/SensorRegistry.test.jsx` | 4 | Sensor sort & sparkline |
| `__tests__/SystemStatus.test.jsx` | 5 | System + MDC metrics |
| `__tests__/OrgManager.test.jsx` | 4 | Admin org KPIs |
| `__tests__/rolePermissions.test.jsx` | 18 | All role permission helpers |
| `__tests__/CrossFarmSummary.test.jsx` | 5 | Enterprise summary |
| **Total** | **62** | |

Test tooling: vitest 4.0 + @testing-library/react + jsdom

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API connection refused | Ensure backend is running at `localhost:8000` |
| CORS errors | Check backend CORS middleware allows `localhost:5173` |
| Blank page after login | Check browser console for auth errors |
| Styles not loading | Run `npm install` to ensure Tailwind is installed |

## Contributing

1. Follow the component structure conventions
2. Use Tailwind utility classes for styling
3. Add new shared components to `components/shared/`
4. Test all user roles when modifying permissions
5. Update this README when adding new features
