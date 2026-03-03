import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FieldDetail from '../FieldDetail'

// ---------- Mock API ----------
const MOCK_FIELD_DETAIL = {
  field: {
    id: 'field_1',
    name: 'Tomato Block A',
    status: 'warning',
    soil_moisture_pct: 22.1,
    ndvi: 0.48,
    recommendation: 'Schedule irrigation within 24 hours.',
  },
  soil_moisture_timeseries: [
    { timestamp: '2026-02-28T10:00:00Z', value: 22.1 },
    { timestamp: '2026-02-27T10:00:00Z', value: 23.5 },
  ],
  temperature_timeseries: [
    { timestamp: '2026-02-28T10:00:00Z', value: 18.3 },
    { timestamp: '2026-02-27T10:00:00Z', value: 17.8 },
  ],
  ndvi_timeseries: [
    { date: '2026-02-28', mean_ndvi: 0.48 },
    { date: '2026-02-21', mean_ndvi: 0.52 },
  ],
  triggers: [
    {
      rule_type: 'soil_moisture',
      threshold: 25,
      actual_value: 22.1,
      severity: 'warning',
      message: 'Schedule irrigation within 24 hours.',
    },
  ],
  weather: {
    temperature_c: 15.8,
    humidity_pct: 57,
    wind_speed_kmh: 17.0,
    conditions: 'partly_cloudy',
    rainfall_mm_today: 1.1,
    timestamp: '2026-02-28T14:00:00Z',
  },
}

vi.mock('../../api/client', () => ({
  getFieldDetail: vi.fn(() => Promise.resolve(MOCK_FIELD_DETAIL)),
}))

// Recharts uses ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/field/field_1']}>
      <Routes>
        <Route path="/field/:fieldId" element={<FieldDetail />} />
      </Routes>
    </MemoryRouter>
  )
}

// ---------- Tests ----------

describe('FieldDetail (v2.1 enhancements)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the field name', async () => {
    renderWithRoute()
    expect(await screen.findByText('Tomato Block A')).toBeInTheDocument()
  })

  it('shows the recommendation explainer', async () => {
    renderWithRoute()
    expect(await screen.findByTestId('recommendation-explainer')).toBeInTheDocument()
    expect(screen.getByText('Why this recommendation?')).toBeInTheDocument()
  })

  it('displays trigger messages', async () => {
    renderWithRoute()
    const matches = await screen.findAllByText(/Schedule irrigation within 24 hours/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('shows inline weather card when weather data is present', async () => {
    renderWithRoute()
    expect(await screen.findByTestId('field-weather-card')).toBeInTheDocument()
    expect(screen.getByText('15.8°C')).toBeInTheDocument()
  })

  it('displays metric cards', async () => {
    renderWithRoute()
    expect(await screen.findByText('Soil Moisture')).toBeInTheDocument()
    expect(screen.getByText('NDVI')).toBeInTheDocument()
    expect(screen.getByText('Temperature')).toBeInTheDocument()
  })
})
