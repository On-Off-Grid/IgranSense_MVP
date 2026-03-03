import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WeatherRisk from '../WeatherRisk'

// ---------- Mock API ----------
const MOCK_WEATHER = {
  farm_id: 'farm_1',
  current: {
    temperature_c: 15.8,
    humidity_pct: 57,
    wind_speed_kmh: 17.0,
    conditions: 'partly_cloudy',
    rainfall_mm_today: 1.1,
    timestamp: '2026-02-28T14:00:00Z',
  },
  forecast: [
    {
      date: '2026-03-01', high_c: 19.8, low_c: 13.6, conditions: 'cloudy',
      rain_probability_pct: 31, wind_speed_kmh: 19.0, humidity_pct: 50,
    },
    {
      date: '2026-03-02', high_c: 17.4, low_c: 12.7, conditions: 'cloudy',
      rain_probability_pct: 27, wind_speed_kmh: 9.3, humidity_pct: 68,
    },
    {
      date: '2026-03-03', high_c: 15.7, low_c: 11.2, conditions: 'rainy',
      rain_probability_pct: 58, wind_speed_kmh: 8.6, humidity_pct: 66,
    },
  ],
  irrigation_window: {
    status: 'risky',
    reason: 'Elevated rain probability (58%) in next 3 days',
  },
  historical: {
    cumulative_rainfall_mm: 128,
    seasonal_average_mm: 145,
    period_start: '2025-10-01',
    period_end: '2026-02-28',
  },
}

vi.mock('../../api/client', () => ({
  getWeather: vi.fn(() => Promise.resolve(MOCK_WEATHER)),
}))

vi.mock('../../context/FarmContext', () => ({
  useFarm: () => ({ selectedFarm: { id: 'farm_1', name: 'North Valley Farm' } }),
}))

// Recharts uses ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// ---------- Tests ----------

describe('WeatherRisk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByText(/Weather & Risk/)).toBeInTheDocument()
  })

  it('displays current conditions after loading', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByText('Current Conditions')).toBeInTheDocument()
    expect(screen.getByText('15.8°C')).toBeInTheDocument()
    expect(screen.getByText('57%')).toBeInTheDocument()
    expect(screen.getByText('17 km/h')).toBeInTheDocument()
  })

  it('renders irrigation window indicator', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByText('Irrigation Window')).toBeInTheDocument()
    expect(screen.getByText('RISKY')).toBeInTheDocument()
  })

  it('renders forecast day cards', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByText('7-Day Forecast')).toBeInTheDocument()
    // Should see high temperatures from the mock data
    expect(screen.getByText('19.8°')).toBeInTheDocument()
    expect(screen.getByText('17.4°')).toBeInTheDocument()
  })

  it('renders historical rainfall section', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByText('Historical Rainfall')).toBeInTheDocument()
  })

  it('has the page test-id', async () => {
    render(<MemoryRouter><WeatherRisk /></MemoryRouter>)
    expect(await screen.findByTestId('weather-risk-page')).toBeInTheDocument()
  })
})
