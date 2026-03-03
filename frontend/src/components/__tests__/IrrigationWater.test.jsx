import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import IrrigationWater from '../IrrigationWater'

// ---------- Mock API ----------
const MOCK_WATER = {
  kpis: {
    total_volume_liters: 5400,
    volume_per_hectare: 1800,
    efficiency_proxy: 0.67,
    pct_under_irrigated: 33.3,
    pct_over_irrigated: 0,
    pct_optimal: 66.7,
  },
  irrigation_series: [
    {
      field_id: 'F-001',
      field_name: 'Olive Terrace',
      events: [
        { date: '2026-02-25', volume_liters: 800 },
        { date: '2026-02-26', volume_liters: 1200 },
      ],
    },
  ],
  moisture_zones: { dry_pct: 33.3, optimal_pct: 66.7, wet_pct: 0.0 },
  time_range: '7d',
}

vi.mock('../../api/client', () => ({
  getWaterDashboard: vi.fn(() => Promise.resolve(MOCK_WATER)),
}))

vi.mock('../../context/FarmContext', () => ({
  useFarm: () => ({ selectedFarm: { id: 'farm_1', name: 'North Valley Farm' } }),
}))

// ---------- Tests ----------

describe('IrrigationWater', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', async () => {
    render(
      <MemoryRouter>
        <IrrigationWater />
      </MemoryRouter>
    )
    expect(await screen.findByText(/Irrigation & Water/)).toBeInTheDocument()
  })

  it('displays KPI metrics after loading', async () => {
    render(
      <MemoryRouter>
        <IrrigationWater />
      </MemoryRouter>
    )
    expect(await screen.findByText('Total Volume')).toBeInTheDocument()
    expect(screen.getByText('Per Hectare')).toBeInTheDocument()
    expect(screen.getByText('Efficiency Proxy')).toBeInTheDocument()
    expect(screen.getByText('Under-irrigated')).toBeInTheDocument()
    expect(screen.getByText('Over-irrigated')).toBeInTheDocument()
    expect(screen.getByText('Optimal')).toBeInTheDocument()
  })

  it('renders time-range toggle buttons', async () => {
    render(
      <MemoryRouter>
        <IrrigationWater />
      </MemoryRouter>
    )
    await screen.findByText(/Irrigation & Water/)
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('7 D')).toBeInTheDocument()
    expect(screen.getByText('30 D')).toBeInTheDocument()
    expect(screen.getByText('Season')).toBeInTheDocument()
  })

  it('has the page test-id', async () => {
    render(
      <MemoryRouter>
        <IrrigationWater />
      </MemoryRouter>
    )
    expect(await screen.findByTestId('irrigation-water-page')).toBeInTheDocument()
  })
})
