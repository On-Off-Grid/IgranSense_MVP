# Plan: IgranSense Auth & UX Enhancement

This plan adds authentication with role-based access (Local Farm, Farmer, Enterprise, Admin), improves UI/UX across all screens, and prepares the architecture for scaling to 20+ fields and a future Sensors Registry page. The approach keeps a single React codebase using conditional rendering and route guards, while maintaining the dark Tailwind theme.

---

## Execution Phases

| Phase | Name | Dependencies | Status |
|-------|------|--------------|--------|
| 1 | Foundation & Design Tokens | None | ✅ Complete |
| 2 | Auth System (Backend + Frontend) | Phase 1 | ✅ Complete |
| 3 | Farm Overview UX Improvements | Phase 1 | ✅ Complete |
| 4 | Field Detail UX Improvements | Phase 1 | ✅ Complete |
| 5 | Alerts Screen UX Improvements | Phase 2 (for acknowledge/snooze actions) | ✅ Complete |
| 6 | System Status UX Improvements | Phase 1 | ✅ Complete |
| 7 | Sensor Registry Page | Phases 2, 6 | ⬜ Not Started |
| 8 | Role-Based Navigation & Admin | Phases 2, 7 | ⬜ Not Started |
| 9 | Integration Testing & Polish | All above | ⬜ Not Started |

**Phase Dependency Graph:**
```
Phase 1 (Foundation)
    │
    ├──► Phase 2 (Auth) ──────┬──► Phase 5 (Alerts UX)
    │                         │
    │                         └──► Phase 7 (Sensors) ──► Phase 8 (Roles/Admin)
    │
    ├──► Phase 3 (Farm Overview UX)
    │
    ├──► Phase 4 (Field Detail UX)
    │
    └──► Phase 6 (System Status UX) ──► Phase 7 (Sensors)
                                              │
                                              ▼
                                      Phase 9 (Integration)
```

---

## Phase 1: Foundation & Design Tokens

**Goal:** Establish shared utilities, design tokens, and folder structure before feature work.

### Tasks

- [x] 1.1 Create folder structure:
  ```
  frontend/src/
  ├── context/           # New
  ├── hooks/             # New
  ├── layouts/           # New
  ├── pages/             # New
  ├── components/
  │   ├── shared/        # New
  │   └── auth/          # New
  └── styles/            # New
  ```

- [x] 1.2 Create `src/styles/tokens.js` with status colors and surface styles:
  ```javascript
  export const colors = {
    status: {
      ok: { bg: 'bg-green-500', text: 'text-green-400', hex: '#22c55e' },
      warning: { bg: 'bg-orange-500', text: 'text-orange-400', hex: '#f97316' },
      critical: { bg: 'bg-red-500', text: 'text-red-400', hex: '#ef4444' },
    },
    surface: {
      card: 'bg-slate-800',
      border: 'border-slate-700',
      hover: 'hover:border-slate-500',
    },
  };
  ```

- [x] 1.3 Create shared components:
  - `src/components/shared/StatusBadge.jsx` — reusable status pill (ok/warning/critical)
  - `src/components/shared/Card.jsx` — standardized card wrapper
  - `src/components/shared/LoadingSpinner.jsx` — consistent loading state
  - `src/components/shared/ErrorBanner.jsx` — standardized error display

- [x] 1.4 Refactor existing components to use design tokens (replace hardcoded color classes)

### Verification
- [x] All shared components render correctly in isolation
- [x] Existing screens still work after refactor

### Notes / Reassessment
**Completed: March 1, 2026**

**What was done:**
- Created folder structure: `context/`, `hooks/`, `layouts/`, `pages/`, `components/shared/`, `components/auth/`, `styles/`, `utils/`
- Created `src/styles/tokens.js` with expanded design tokens including:
  - Status colors (ok, warning, critical, info, offline) with bg, bgSubtle, text, textBold, border, borderSubtle, hex variants
  - Surface colors (card, cardHover, border, borderHover, background)
  - Helper functions: `getStatusColors()`, `cardClasses`, `cardHoverClasses`
  - Chart styling: `chartTooltipStyle`, `chartAxisStyle`, `chartGridStroke`
- Created shared components with barrel export (`index.js`):
  - `StatusBadge` — supports pill/dot/banner variants, multiple sizes
  - `Card` — supports title, padding, hoverable/clickable states
  - `LoadingSpinner` — supports sizes, optional text, fullHeight mode
  - `ErrorBanner` — supports error/warning/info variants, optional retry button
- Refactored all 4 existing components (FarmOverview, FieldDetail, AlertsList, SystemStatus) to use tokens and shared components

**Observations:**
- The design tokens expanded beyond the original spec to include more variants (bgSubtle, borderSubtle) which proved useful during refactoring
- Added `info` and `offline` status types for future use
- All components now use consistent patterns for loading/error states

**No blockers. Ready for Phase 2, 3, 4, or 6 (all now unblocked).**

---

## Phase 2: Auth System (Backend + Frontend)

**Goal:** Implement login, JWT auth, AuthContext, and route guards.

**Depends on:** Phase 1 (shared components for forms)

### Tasks

#### Backend (FastAPI)
- [x] 2.1 Add auth models to `backend/souhail-edge-sim/app/models.py`:
  - `User` (id, email, hashed_password, role, farm_ids, org_id)
  - `LoginRequest`, `LoginResponse`, `TokenPayload`

- [x] 2.2 Create `backend/souhail-edge-sim/app/services/auth.py`:
  - Password hashing (passlib + bcrypt)
  - JWT encode/decode (python-jose)
  - User validation

- [x] 2.3 Add auth endpoints to `main.py`:
  - `POST /auth/login` → returns JWT + user info
  - `GET /auth/me` → validates token, returns user
  - `POST /auth/logout` (optional, for token blacklist)

- [x] 2.4 Create mock users in `data/users.json`:
  ```json
  [
    { "id": "u1", "email": "farmer@demo.com", "role": "farmer", "farm_ids": ["farm_1"] },
    { "id": "u2", "email": "enterprise@demo.com", "role": "enterprise", "farm_ids": ["farm_1", "farm_2"] },
    { "id": "u3", "email": "admin@igransense.com", "role": "admin", "farm_ids": [] },
    { "id": "u4", "email": "local", "role": "local_farm", "farm_ids": ["farm_1"] }
  ]
  ```

#### Frontend (React)
- [x] 2.5 Create `src/context/AuthContext.jsx`:
  - `AuthProvider` component wrapping app
  - `useAuth()` hook → `{ user, role, login(), logout(), isAuthenticated, isLoading }`
  - Token persistence in `localStorage`

- [x] 2.6 Create `src/pages/LoginPage.jsx`:
  - Dark theme, centered card
  - Email/password fields with validation
  - "Sign In" CTA, "Continue as Local User" link
  - Error states (invalid credentials, server error)

- [x] 2.7 Create `src/components/auth/PrivateRoute.jsx`:
  - Wraps routes requiring authentication
  - Accepts `roles` prop for role-based access
  - Redirects to `/login` if not authenticated

- [x] 2.8 Update `src/api/client.js`:
  - Add `authFetch()` wrapper injecting Bearer token
  - Handle 401 responses (redirect to login)

- [x] 2.9 Update `App.jsx`:
  - Wrap with `AuthProvider`
  - Add `/login` route
  - Protect existing routes with `PrivateRoute`

### Verification
- [x] Can log in with demo credentials
- [x] Invalid credentials show error
- [x] Protected routes redirect to login when unauthenticated
- [x] Token persists across page refresh
- [x] Logout clears token and redirects

### Notes / Reassessment
**Completed: Session 2**

**What was done:**

**Backend:**
- Added auth models to `models.py`: User, UserInDB, LoginRequest, LoginResponse, TokenPayload
- Created `services/auth.py` with:
  - `load_users()` - loads from users.json
  - `get_user_by_email()`, `verify_password()`, `hash_password()`
  - `create_access_token()`, `decode_token()` - JWT handling with python-jose
  - `authenticate_user()`, `get_current_user()` - auth flow functions
- Added auth endpoints to `main.py`:
  - `POST /auth/login` - authenticates and returns JWT + user info
  - `GET /auth/me` - returns current user from token
  - Added `get_optional_user()` and `require_user()` dependencies
- Created `data/users.json` with 4 demo users (password: demo123)
- Updated `requirements.txt` with python-jose[cryptography], passlib[bcrypt]
- Fixed bcrypt compatibility by pinning to bcrypt==4.0.1

**Frontend:**
- Created `context/AuthContext.jsx`:
  - `AuthProvider` with full state management
  - `useAuth()` hook returning user, role, isAuthenticated, isLoading, error, login, loginAsLocal, logout, getToken
  - Token persistence with `igransense_token` and `igransense_user` localStorage keys
- Created `pages/LoginPage.jsx`:
  - Dark themed centered login card
  - Email/password fields with show/hide toggle
  - "Sign In" button with loading state
  - "Continue as Local User" link for offline mode
  - Demo credentials hint
- Created `components/auth/PrivateRoute.jsx`:
  - Shows loading spinner while checking auth
  - Redirects to /login if unauthenticated
  - Role-based access with optional `roles` prop
- Updated `api/client.js`:
  - Added `login()`, `getCurrentUser()` functions
  - Token injection in all fetch requests
  - 401 handling with token cleanup and redirect
- Updated `App.jsx`:
  - Wrapped with AuthProvider
  - Added /login route
  - Protected all routes with PrivateRoute
  - Navbar only shows when authenticated
  - Added user info and logout button to navbar

**Demo Users:**
- farmer@demo.com (Farmer role)
- enterprise@demo.com (Enterprise role)
- admin@igransense.com (Admin role)
- local (Local Farm role, offline mode)

**Issues Resolved:**
- bcrypt module compatibility with passlib - fixed by installing specific version bcrypt==4.0.1

**No blockers. Phases 3, 4, 5, and 6 are now unblocked.**

---

## Phase 3: Farm Overview UX Improvements

**Goal:** Add KPI strip, improve scalability, make cards more actionable.

**Depends on:** Phase 1 (design tokens)

### Tasks

- [x] 3.1 Create `src/components/shared/KPIStrip.jsx`:
  - Props: `{ totalFields, criticalCount, warningCount, okCount, lastSync }`
  - Horizontal flex with colored pills for each status count

- [x] 3.2 Add KPIStrip to `FarmOverview.jsx` above the map:
  - Calculate counts from fields array
  - Use lastSync from OfflineContext

- [x] 3.3 Create `src/components/shared/StatusFilter.jsx`:
  - Dropdown: All / Critical / Warning / OK
  - Search input for field name
  - Emits `onFilterChange({ status, query })`

- [x] 3.4 Add StatusFilter below KPIStrip, filter displayed fields

- [x] 3.5 Extract `src/components/FieldCard.jsx` from FarmOverview:
  - Reusable card with status indicator
  - Add soil moisture progress bar (visual threshold zones)
  - Add "Triggered by" rule name
  - Add "Alerts" badge count linking to filtered alerts

- [ ] 3.6 Install and configure `react-leaflet-cluster`:
  - Cluster markers when zoomed out
  - Single markers when zoomed in
  - **Deferred: Optional enhancement for 20+ fields**

- [x] 3.7 Add map legend (bottom-right corner):
  - Small box with colored dots + labels

- [ ] 3.8 (Future prep) Add virtualization with `react-window` if >20 cards
  - **Deferred: Not needed until scaling**

### Verification
- [x] KPI strip shows correct counts
- [x] Filters update displayed fields and map markers
- [x] Field cards show progress bar and rule trigger
- [ ] Map clusters at low zoom, expands at high zoom (deferred)
- [x] Legend is visible and accurate

### Notes / Reassessment
**Completed: Session 3**

**What was done:**

**New Components:**
- `KPIStrip.jsx` - Horizontal status summary with total fields, critical/warning/ok counts, and last sync time
- `StatusFilter.jsx` - Dropdown for status filter + search input for field names + clear button
- `FieldCard.jsx` - Extracted card component with:
  - Status badge (dot variant)
  - "Triggered by" rule name inference
  - Soil moisture progress bar with colored threshold zones (critical <18%, warning 18-25%, ok >25%)
  - NDVI value display
  - Recommendation text (truncated)
  - Alert count badge (links to filtered alerts)
- `MapLegend.jsx` - Status color legend positioned bottom-right of map

**FarmOverview.jsx Updates:**
- Added `useMemo` for KPI counts calculation
- Added `useMemo` for filtered fields based on status and search query
- Integrated KPIStrip with lastSync from OfflineContext
- Integrated StatusFilter with filter state
- Map now shows only filtered fields
- Uses FieldCard component instead of inline cards
- Added MapLegend inside map container
- Added responsive grid (1/2/3 columns)
- Added empty state message when no fields match filter

**Barrel export updated:**
- Added KPIStrip, StatusFilter, MapLegend to `shared/index.js`

**Deferred tasks:**
- 3.6: react-leaflet-cluster - optional, only needed for 20+ fields
- 3.8: react-window virtualization - only needed when scaling to many fields

**Build verified:** `npm run build` completed successfully

**No blockers. Ready for Phase 4, 5, or 6.**

---

## Phase 4: Field Detail UX Improvements

**Goal:** Add glanceable metrics, improve charts, add time controls.

**Depends on:** Phase 1 (design tokens)

### Tasks

- [x] 4.1 Create `src/components/shared/MetricCard.jsx`:
  - Props: `{ icon, label, value, trend, unit }`
  - Compact card with trend arrow (↑↓→)

- [x] 4.2 Add metrics row to `FieldDetail.jsx`:
  - Grid of 4 MetricCards: Current Soil %, Current NDVI, ET0 (stub), Next Irrigation (stub)
  - Place below status banner

- [x] 4.3 Create `src/components/shared/TimeRangeToggle.jsx`:
  - Toggle buttons: 7D | 30D | 90D
  - Emits `onRangeChange(days)`

- [x] 4.4 Add TimeRangeToggle above charts in FieldDetail

- [x] 4.5 Improve Recharts styling:
  - Add `<CartesianGrid strokeDasharray="3 3" stroke="#334155" />`
  - Larger axis labels: `tick={{ fill: '#94a3b8', fontSize: 12 }}`
  - Add `<ReferenceLine>` for thresholds with labels

- [x] 4.6 Enhance status banner:
  - Full-width colored background
  - Border-left accent: `border-l-4 border-{status}-500`

- [x] 4.7 Add loading skeleton for metrics row

- [x] 4.8 Add empty state: "No readings for this field yet"

### Verification
- [x] Metrics row shows current values with trends
- [x] Time range buttons filter chart data (client-side for now)
- [x] Charts have visible gridlines and threshold lines
- [x] Status banner is visually distinct per status
- [x] Loading/empty states render correctly

### Notes / Reassessment
**Completed: Session 4**

**What was done:**

**New Components:**
- `MetricCard.jsx` - Compact card with icon, label, value, unit, trend arrow (↑/↓/→), status coloring, subtext
- `MetricCardSkeleton.jsx` - Animated loading skeleton for MetricCard
- `TimeRangeToggle.jsx` - Toggle buttons for 7D/30D/90D time range selection

**FieldDetail.jsx Enhancements:**
- Added `timeRange` state (defaults to 30 days)
- Added `calculateTrend()` function comparing recent vs older values
- Added `filterByTimeRange()` function for client-side time filtering
- Added `useMemo` for filtered chart data based on selected time range
- Metrics row with 4 cards:
  - Soil Moisture: value, trend, status coloring based on thresholds
  - NDVI: value, trend, status coloring
  - Temperature: current reading with trend
  - Next Irrigation: actionable guidance based on status
- Enhanced status banner with:
  - Status pill with bold background
  - Border-left accent
  - Full-width colored subtle background
- Time range toggle above charts
- Loading skeleton with MetricCardSkeleton components
- Empty state with icon, heading, and helpful message
- Trend calculations for soil moisture and temperature

**Barrel export updated:**
- Added MetricCard, MetricCardSkeleton, TimeRangeToggle to `shared/index.js`

**Charts already had:**
- CartesianGrid with strokeDasharray
- ReferenceLine thresholds for critical/OK levels
- Proper axis styling

**Build verified:** `npm run build` completed successfully (742 modules)

**No blockers. Ready for Phase 5, 6, 7, or 8.**

---

## Phase 5: Alerts Screen UX Improvements

**Goal:** Better grouping, interactions, and mobile support.

**Depends on:** Phase 2 (auth for acknowledge/snooze actions)

### Tasks

- [x] 5.1 Create `src/components/AlertFilters.jsx`:
  - Search input, severity chips, field dropdown
  - URL param sync (`?field=field_1&severity=critical`)

- [x] 5.2 Create `src/components/AlertGroup.jsx`:
  - Collapsible accordion by severity
  - Count badge in header
  - Critical expanded by default, others collapsed

- [x] 5.3 Create `src/components/AlertCard.jsx`:
  - Severity badge, timestamp, field name, message
  - Action buttons: Acknowledge ✓, Snooze ⏰, Dismiss ✕
  - "View Field" link

- [x] 5.4 Add backend endpoints for alert actions:
  - `POST /alerts/{field_id}/{alert_type}/acknowledge`
  - `POST /alerts/{field_id}/{alert_type}/snooze`
  - `DELETE /alerts/{field_id}/{alert_type}`

- [x] 5.5 Update AlertsList.jsx to use new components

- [x] 5.6 Mobile optimizations:
  - Touch targets ≥44px
  - Condensed single-line layout with expandable details
  - (Future) Swipe gestures

### Verification
- [x] Alerts grouped by severity with collapsible sections
- [x] Search/filter updates list in real-time
- [x] Acknowledge/snooze/dismiss actions work (with auth)
- [x] "View Field" navigates correctly
- [x] Mobile layout is usable at 375px width

### Notes / Reassessment
**Completed: Session 5**

**What was done:**

**New Components:**
- `AlertFilters.jsx` - Search input + severity chips (All/Critical/Warning/Info) + field dropdown + URL param sync
- `AlertGroup.jsx` - Collapsible accordion with severity header, count badge, expand/collapse icon
- `AlertCard.jsx` - Expandable alert card with:
  - Severity dot, field name, relative timestamp, truncated message
  - Expanded: full message, trigger values, action buttons
  - Touch-friendly buttons (min-h-44px)
  - Actions: View Field, Acknowledge, Snooze, Dismiss

**Backend Endpoints Added (main.py):**
- `POST /alerts/{field_id}/{alert_type}/acknowledge` - requires auth
- `POST /alerts/{field_id}/{alert_type}/snooze?hours=N` - requires auth
- `DELETE /alerts/{field_id}/{alert_type}` - requires auth
- In-memory storage for alert states (acknowledged, snoozed, dismissed)

**API Client Updates:**
- Added `acknowledgeAlert(fieldId, alertType)`
- Added `snoozeAlert(fieldId, alertType, hours)`
- Added `dismissAlert(fieldId, alertType)`

**AlertsList.jsx Updates:**
- Integrated AlertFilters with URL param sync
- Grouped alerts by severity using AlertGroup
- Individual alerts rendered with AlertCard
- Action handlers with optimistic UI updates (remove from list on action)
- Actions only available when authenticated
- Empty states for no alerts / no matches
- Alert count display in header

**Mobile Optimizations:**
- All action buttons have min-height 44px for touch targets
- Condensed single-line layout that expands on tap
- Responsive filter layout with flex-wrap

**Build verified:** `npm run build` completed successfully (745 modules)

**No blockers. Ready for Phase 6, 7, or 8.**

---

## Phase 6: System Status UX Improvements

**Goal:** Clickable sensor segments, better MDC presentation.

**Depends on:** Phase 1 (design tokens)

### Tasks

- [x] 6.1 Create `src/components/SensorHealthBar.jsx`:
  - Segmented bar (like GitHub language bar)
  - Segments: online (green), offline (red), low_battery (orange), stale (gray)
  - Each segment is clickable → `/sensors?status={status}`
  - Tooltip on hover with count

- [x] 6.2 Create `src/components/MDCStatusCard.jsx`:
  - Large status indicator (24px dot)
  - Subsections: Status, Uptime %, Last Sync, Last Error
  - (Future) Mini 24h ping history chart

- [x] 6.3 Update SystemStatus.jsx to use new components

- [x] 6.4 Add "View all sensors →" link to future Sensors page

### Verification
- [x] Sensor health bar renders correctly with proportional segments
- [x] Clicking segment navigates to filtered sensors list (even if page doesn't exist yet)
- [x] MDC status card shows accurate real-time status

### Notes / Reassessment
**Completed: Session 6**

**What was done:**

**New Components:**
- `SensorHealthBar.jsx` - GitHub-style segmented bar with:
  - Proportional segments for online, battery_low, offline, stale
  - Tooltips on hover showing count and percentage
  - Clickable segments navigating to `/sensors?status={status}`
  - Legend below bar with clickable status labels
  - Uses design tokens for consistent colors

- `MDCStatusCard.jsx` - Enhanced MDC status display with:
  - Large 24px status indicator with glow effect when online
  - Grid of subsections (Last Sync, Uptime, Version)
  - Relative time formatting ("Just now", "5m ago")
  - Last error display (when applicable)
  - Edge processing active banner

**SystemStatus.jsx Updates:**
- Replaced inline MDC card with MDCStatusCard component
- Replaced simple health bar with SensorHealthBar component  
- Added "View all sensors →" link to Sensor Network card
- Improved layout with larger grid gap
- Added total sensor count display
- Added network health percentage with color coding

**Build verified:** `npm run build` completed successfully (747 modules)

**No blockers. Ready for Phase 7, 8, or 9.**

---

## Phase 7: Sensor Registry Page ✅

**Goal:** New page listing all sensors with filters and details panel.

**Depends on:** Phase 2 (auth), Phase 6 (links from System Status)

### Tasks

#### Backend
- [x] 7.1 Add `GET /sensors` endpoint:
  - Query params: `?status=online&field_id=field_1&type=soil_moisture`
  - Returns list of sensors with extended fields

- [x] 7.2 Add `GET /sensors/{sensor_id}` endpoint:
  - Returns sensor details + recent readings + 24h stats

- [x] 7.3 Extend Sensor model:
  - Add `last_seen_at`, `battery_pct`, `firmware_version`, `field_name`
  - Created `SensorExtended`, `SensorReading`, `SensorDetail` models

#### Frontend
- [x] 7.4 Create `src/components/SensorRegistry.jsx`:
  - Header with total count
  - Filter bar (status chips, field dropdown, type dropdown)
  - Search input with client-side filtering
  - Card grid layout for sensors

- [x] 7.5 Create sensor cards:
  - Shows ID, Type, Field, Status badge, Battery bar, Last Seen
  - Card click opens detail panel
  - Selected state with blue ring

- [x] 7.6 Create `src/components/SensorDetailPanel.jsx`:
  - Fixed slide-out drawer from right
  - Sensor info grid (field, battery, firmware, coordinates)
  - 24h statistics (avg, min, max)
  - Readings sparkline chart with Recharts
  - Action buttons (View Full History, Configure)

- [x] 7.7 Add route `/sensors` in App.jsx
  - Added to navbar navigation

- [x] 7.8 Connect from System Status:
  - SensorHealthBar already navigates to `/sensors?status=...`
  - "View all sensors →" link already present

- [x] 7.9 API client updated:
  - Added `getSensors(filters)` and `getSensorDetail(sensorId)` functions

### Verification
- [x] Sensors page lists all sensors
- [x] Filters work correctly (status, field, type)
- [x] Search works for sensor ID, field name, type
- [x] Clicking card opens detail panel
- [x] Links from System Status work
- [x] Sensor detail shows readings sparkline

### Notes / Reassessment
**Completed files:**
- `backend/souhail-edge-sim/app/models.py` - Added SensorExtended, SensorReading, SensorDetail
- `backend/souhail-edge-sim/app/main.py` - Added /sensors and /sensors/{sensor_id} endpoints
- `frontend/src/api/client.js` - Added getSensors() and getSensorDetail()
- `frontend/src/components/SensorRegistry.jsx` - Main page with filters and card grid
- `frontend/src/components/SensorDetailPanel.jsx` - Slide-out detail panel with chart
- `frontend/src/App.jsx` - Added /sensors route and nav link

**Features implemented:**
- Status filter chips with counts
- Field and type dropdown filters
- Real-time search filtering
- Battery indicator bars
- Relative time formatting ("5m ago")
- Recharts line chart for recent readings
- URL query param sync for filters

**No blockers. Ready for Phase 8 or 9.**

---

## Phase 8: Role-Based Navigation & Admin ✅

**Goal:** Different nav items per role, org/farm selector, admin pages.

**Depends on:** Phase 2 (auth), Phase 7 (sensors link in nav)

### Tasks

- [x] 8.1 Create `src/utils/rolePermissions.js`:
  - Map role → allowed routes (ROLE_ROUTES)
  - Map role → nav items (ROLE_NAV_ITEMS)
  - Map role → allowed actions (ROLE_ACTIONS)
  - Helper functions: getNavItemsForRole(), canAccessRoute(), canPerformAction()

- [x] 8.2 Update NavBar to conditionally render items based on role:
  - Local Farm: Overview, Alerts, System
  - Farmer: Overview, Alerts, Sensors, System
  - Enterprise: + Farm selector dropdown
  - Admin: + Admin nav link

- [x] 8.3 Create org/farm selector popover:
  - Dropdown trigger in navbar with current farm name
  - List of accessible farms with status badges (online/offline)
  - Shows field count per farm
  - Selection persists in localStorage

- [x] 8.4 Create `src/context/FarmContext.jsx`:
  - `useFarm()` → `{ selectedFarm, selectFarm(), farms, hasMultipleFarms }`
  - Mock farms data for enterprise/admin users
  - Auto-selects first farm on login

- [x] 8.5 SelectFarmPage: Implemented via navbar dropdown instead
  - Farm selector available in nav for quick switching
  - No separate page needed

- [x] 8.6 Create `src/layouts/AdminLayout.jsx`:
  - Secondary nav sidebar: Organizations, Users, Diagnostics
  - "Back to Dashboard" link
  - Purple accent color for admin UI

- [x] 8.7 Create admin pages (functional, not just stubs):
  - `src/pages/admin/OrgManager.jsx` - Organization table with search
  - `src/pages/admin/UserManager.jsx` - User table with role filtering
  - `src/pages/admin/Diagnostics.jsx` - Live system stats, resource bars, log viewer

- [x] 8.8 Add admin routes protected by role:
  - `/admin/*` route with role check
  - PrivateRoute updated with `requiredRole` prop
  - Access denied page for non-admin users

### Verification
- [x] Each role sees correct nav items
- [x] Farm selector works for enterprise/admin users
- [x] Admin routes blocked for non-admin users (shows lock icon)
- [x] Farm selection persists in localStorage

### Notes / Reassessment

**Completed files:**
- `frontend/src/utils/rolePermissions.js` - Role-based config and helpers
- `frontend/src/context/FarmContext.jsx` - Multi-farm context provider
- `frontend/src/layouts/AdminLayout.jsx` - Admin layout with sidebar
- `frontend/src/pages/admin/OrgManager.jsx` - Organization management
- `frontend/src/pages/admin/UserManager.jsx` - User management
- `frontend/src/pages/admin/Diagnostics.jsx` - System diagnostics
- `frontend/src/components/auth/PrivateRoute.jsx` - Updated with requiredRole
- `frontend/src/App.jsx` - Updated with FarmProvider and admin routes

**Features implemented:**
- Dynamic nav based on user role
- Farm selector dropdown for multi-farm users
- Admin panel with sidebar navigation
- Organization table with plan badges
- User table with role badges and actions
- Live diagnostics with resource bars and log viewer
- Role-based route protection

**No blockers. Ready for Phase 9.**

---

## Phase 9: Integration Testing & Polish ✅

**Goal:** End-to-end testing, responsive checks, final polish.

**Depends on:** All previous phases

### Tasks

- [x] 9.1 Test complete auth flow:
  - Login → role detection → correct nav → logout
  - Tested with all four demo users

- [x] 9.2 Test cross-screen navigation:
  - Alert → Field Detail (via field_id links)
  - System Status → Sensors (via SensorHealthBar click)
  - Sensors page filter via URL params

- [x] 9.3 Production build verification:
  - `npm run build` passes (755 modules)
  - Chunk size warning noted for future optimization

- [x] 9.4 Test offline behavior:
  - Edge health check ping every 30s
  - "Edge Disconnected" status when API unreachable
  - Auto-recovery when API restarts

- [x] 9.5 Code cleanup:
  - Fixed linting errors (unused imports, setState in effect)
  - Added SURFACE and CHART_CONFIG exports to tokens.js
  - Refactored FarmContext to use useMemo instead of useEffect setState

- [x] 9.6 Update documentation:
  - Updated README.md with auth info and demo users
  - Updated MVP_SPRINT_PLAN.md with Phase 10 completion
  - This plan file fully documented

### Verification
- [x] All features work end-to-end
- [x] Production build succeeds
- [x] Lint errors resolved (only warnings remain)
- [x] Documentation updated

### Notes / Reassessment

**Remaining lint warnings (acceptable for MVP):**
- Fast refresh warnings about exporting hooks from component files
- useEffect dependency warning in AlertFilters (intentional pattern)

**Future improvements identified:**
- Code splitting to reduce chunk size
- More responsive layouts for mobile
- Accessibility audit (keyboard nav, screen reader)
- Performance testing with larger datasets

**All 9 phases complete!**

---

## Reference: Information Architecture

### Route Structure

| Route | Component | Roles Allowed | Notes |
|-------|-----------|---------------|-------|
| `/login` | `LoginPage` | Public | Entry point |
| `/select-farm` | `FarmSelector` | Farmer, Enterprise | Multi-farm users |
| `/` | `FarmOverview` | All | Default home |
| `/field/:fieldId` | `FieldDetail` | All | Drill-down |
| `/alerts` | `AlertsList` | All | With role-based filtering |
| `/sensors` | `SensorRegistry` | All | New page |
| `/sensors/:sensorId` | `SensorDetail` | All | Deep link |
| `/system` | `SystemStatus` | All | MDC + sensor health |
| `/admin` | `AdminLayout` | Admin only | Nested routes |
| `/admin/organizations` | `OrgManager` | Admin | CRUD orgs |
| `/admin/users` | `UserManager` | Admin | CRUD users |
| `/admin/diagnostics` | `Diagnostics` | Admin | System logs |

### Nav Items per Role

| Role | Primary Nav | Specialty Nav |
|------|-------------|---------------|
| Local Farm | Overview, Alerts, System | — |
| Farmer | Overview, Fields, Alerts, Sensors, System | — |
| Enterprise | Multi-Farm Overview, Alerts, Sensors, System | Org/Farm switcher |
| Admin | Overview, Alerts, Sensors, System | Admin menu |

---

## Reference: Design Decisions

- **Single codebase with conditional rendering** over separate apps per role
- **JWT in localStorage** over httpOnly cookies (simpler for MVP)
- **Leaflet clustering** over custom pagination for map
- **Accordion grouping for alerts** over flat list
- **Side drawer for sensor details** over full page

---

## Workflow

After completing each phase:
1. ✅ Mark all tasks complete
2. 📝 Add notes in "Notes / Reassessment" section
3. 🔄 Review dependencies for next phase
4. ⏸️ Wait for user signal to proceed

---

*Last updated: March 1, 2026*
