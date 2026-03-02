# IgranSense MVP Sprint Plan

**Goal:** Complete functional demo for UM6P Launchpad pitch  
**Deadline:** March 3, 2026  
**Status:** ✅ MVP Complete (Feb 28, 2026)

---

## Completed Phases

### Phase 1: React + Vite + Tailwind Setup ✅
- Vite 7.x with React 19
- Tailwind CSS 4 configured
- React Router for navigation
- Project structure: `frontend/src/components/`

### Phase 2: Farm Overview (Map) ✅
- Leaflet map with OpenStreetMap tiles
- CircleMarkers color-coded by status (green/orange/red)
- Click navigation to field detail
- Tooltip on hover showing field info

### Phase 3: System Status Screen ✅
- MDC online/offline status
- Sensor network summary (10 total, 8 online, 1 offline, 1 battery low)
- 80% operational progress bar
- Edge processing active indicator

### Phase 4: Field Detail Screen ✅
- Soil moisture line chart with threshold lines (18% critical, 25% OK)
- Temperature time-series chart
- Weekly NDVI bar chart
- Status banner with recommendation text

### Phase 5: Alerts Screen ✅
- Alerts list with severity badges
- Timestamp and field attribution
- Recommendation text per alert

### Phase 6: 30-Day Data Expansion ✅
- Python generator script: `scripts/generate_mock_data.py`
- 14,410 readings across 3 fields
- 15 weekly NDVI snapshots
- Narrative: Field 1 (critical decline), Field 2 (warning), Field 3 (healthy)

### Phase 7: Offline Indicator (Partial) ✅
- "Edge Active" status in navbar
- Health check ping to `/health` endpoint
- Last sync timestamp in localStorage

### Phase 8: Documentation ✅
- `docs/scientific_basis.md` - FAO-56 thresholds, NDVI interpretation
- `docs/trl_statement.md` - TRL 4 assessment
- `docs/hardware_spec.md` - Full BOM ($66/node, $195/gateway)

### Phase 9: Polish ✅
- Spread map marker coordinates for visibility
- Added Tooltip component for hover preview

### Phase 10: Authentication & UX Enhancement ✅ (Mar 1, 2026)

**Backend:**
- JWT authentication with 24h token expiration
- Four user roles: local_farm, farmer, enterprise, admin
- Password hashing with bcrypt
- Protected API endpoints with Authorization header
- New `/sensors` and `/sensors/{id}` endpoints with filtering

**Frontend - Auth:**
- Login page with demo user hints
- AuthContext with token persistence
- PrivateRoute guard with role checks
- Role badge in navbar

**Frontend - UX Components:**
- Design tokens in `styles/tokens.js`
- Shared components: Card, StatusBadge, LoadingSpinner, ErrorBanner
- KPIStrip summary for Farm Overview
- MetricCard with TimeRangeToggle for Field Detail
- AlertFilters, AlertGroup, AlertCard for Alerts
- SensorHealthBar, MDCStatusCard for System Status
- SensorRegistry page with filters and detail panel
- AdminLayout with Organizations, Users, Diagnostics pages

**Frontend - Role Features:**
- Dynamic nav items per role
- Farm selector dropdown for enterprise/admin
- Admin panel protected by role

---

## Future Tasks (Post-MVP)

### 🔧 Known Issues
- [ ] **Offline indicator not updating** - `navigator.onLine` not triggering state change when WiFi toggled; needs investigation (possibly browser-specific behavior)
- [ ] Map markers use hardcoded coordinates instead of sensor GPS data
- [ ] No dark/light theme toggle
- [ ] Chunk size warning in production build (>500KB) - consider code splitting

### 🚀 Phase 11: Hardware Integration (TRL 5)
- [ ] ESP32 firmware for real sensor reading
- [ ] LoRa gateway integration with Raspberry Pi
- [ ] Real soil moisture calibration for Moroccan clay soils

### 📱 Phase 12: Mobile Responsiveness
- [ ] Responsive navbar (hamburger menu)
- [ ] Touch-friendly chart interactions
- [ ] PWA manifest for home screen install

### ☁️ Phase 13: Cloud Sync (Optional)
- [ ] Cloud backup when online
- [ ] Real database backend (PostgreSQL/MongoDB)
- [ ] API rate limiting and security hardening

---

## Architecture Summary

```
IgranSense/
├── backend/souhail-edge-sim/     # FastAPI edge simulation
│   ├── app/main.py               # REST API endpoints
│   ├── app/services/             # Rule engine, data loader
│   └── data/                     # JSON data files
├── frontend/                     # React + Vite dashboard
│   ├── src/components/           # FarmOverview, FieldDetail, etc.
│   ├── src/api/client.js         # API fetch helpers
│   └── index.html
├── scripts/
│   └── generate_mock_data.py     # 30-day data generator
└── docs/
    ├── scientific_basis.md
    ├── trl_statement.md
    └── hardware_spec.md
```

## Running the Demo

```bash
# Terminal 1: Start API
cd backend/souhail-edge-sim
source ../../.venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

---

*Last updated: February 28, 2026*
