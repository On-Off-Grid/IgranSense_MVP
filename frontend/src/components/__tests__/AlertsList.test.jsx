import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AlertsList from '../AlertsList'

// ---------- Helpers ----------
function hoursAgo(h) {
  return new Date(Date.now() - h * 3600_000).toISOString()
}
function daysAgo(d) {
  return new Date(Date.now() - d * 86400_000).toISOString()
}

// ---------- Mock data (relative timestamps) ----------
const MOCK_ALERTS = [
  {
    type: 'low_soil_moisture',
    severity: 'critical',
    field_id: 'field_1',
    timestamp: hoursAgo(4), // 4 hours ago → within 24h
    trigger_values: { soil_moisture_pct: 12.3 },
    message: 'Soil moisture critically low – irrigate immediately.',
  },
  {
    type: 'low_soil_moisture',
    severity: 'critical',
    field_id: 'field_2',
    timestamp: hoursAgo(5), // 5 hours ago → within 24h
    trigger_values: { soil_moisture_pct: 14.1 },
    message: 'Soil moisture critically low – irrigate immediately.',
  },
  {
    type: 'ndvi_decline',
    severity: 'warning',
    field_id: 'field_3',
    timestamp: daysAgo(2), // 2 days ago → within 7d but outside 24h
    trigger_values: { ndvi: 0.31 },
    message: 'NDVI declining – possible crop stress.',
  },
  {
    type: 'sensor_offline',
    severity: 'info',
    field_id: 'field_4',
    timestamp: daysAgo(47), // 47 days ago → outside 30d
    trigger_values: {},
    message: 'Sensor SM-04 offline for 48 hours.',
  },
]

// ---------- Mocks ----------
vi.mock('../../api/client', () => ({
  getAlerts: vi.fn(() => Promise.resolve(MOCK_ALERTS)),
  acknowledgeAlert: vi.fn(),
  snoozeAlert: vi.fn(),
  dismissAlert: vi.fn(),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock('../../context/FarmContext', () => ({
  useFarm: () => ({ selectedFarm: { id: 'farm_1', name: 'Farm 1' } }),
}))

function renderAlerts() {
  return render(
    <MemoryRouter>
      <AlertsList />
    </MemoryRouter>
  )
}

// ---------- Tests ----------

describe('AlertsList (v2.1 – Phase 6)', () => {
  it('renders heading and test-id', async () => {
    renderAlerts()
    expect(await screen.findByText('Alerts & Recommendations')).toBeInTheDocument()
    expect(screen.getByTestId('alerts-list')).toBeInTheDocument()
  })

  it('shows time-range toggle buttons (1D, 7D, 30D)', async () => {
    renderAlerts()
    await screen.findByText('Alerts & Recommendations')
    expect(screen.getByText('1D')).toBeInTheDocument()
    expect(screen.getByText('7D')).toBeInTheDocument()
    expect(screen.getByText('30D')).toBeInTheDocument()
  })

  it('default 30D shows 3 alerts (excludes old sensor_offline)', async () => {
    renderAlerts()
    // Wait for data to load – the count badge should show "3 alerts"
    expect(await screen.findByText(/3 alert/)).toBeInTheDocument()
  })

  it('switching to 7D still shows 3 alerts', async () => {
    renderAlerts()
    await screen.findByText(/3 alert/)
    fireEvent.click(screen.getByText('7D'))
    expect(await screen.findByText(/3 alert/)).toBeInTheDocument()
  })

  it('switching to 1D shows only today\'s 2 alerts', async () => {
    renderAlerts()
    await screen.findByText(/3 alert/)
    fireEvent.click(screen.getByText('1D'))
    expect(await screen.findByText(/2 alert/)).toBeInTheDocument()
  })

  it('shows "Group similar" toggle', async () => {
    renderAlerts()
    await screen.findByText('Alerts & Recommendations')
    expect(screen.getByTestId('aggregate-toggle')).toBeInTheDocument()
    expect(screen.getByText('Group similar')).toBeInTheDocument()
  })

  it('aggregation groups same-type alerts and shows count', async () => {
    renderAlerts()
    await screen.findByText('Alerts & Recommendations')
    // Enable grouping
    fireEvent.click(screen.getByTestId('aggregate-toggle'))
    // The 2 critical low_soil_moisture alerts should be collapsed
    expect(await screen.findByText(/2 fields with low soil moisture/)).toBeInTheDocument()
  })

  it('toggling aggregation shows Ungrouped label', async () => {
    renderAlerts()
    await screen.findByText('Alerts & Recommendations')
    fireEvent.click(screen.getByTestId('aggregate-toggle'))
    expect(await screen.findByText('Ungrouped')).toBeInTheDocument()
  })
})
