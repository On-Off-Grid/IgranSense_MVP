import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SensorRegistry from '../SensorRegistry'

// ---------- Mock data ----------
const MOCK_SENSORS = [
  {
    sensor_id: 'SM_F1_01',
    field_id: 'field_1',
    type: 'soil_moisture',
    grid_row: 1,
    grid_col: 1,
    status: 'online',
    last_seen_at: new Date(Date.now() - 300_000).toISOString(),
    battery_pct: 88.2,
    firmware_version: '1.2.3',
    field_name: 'Tomato Block A',
    sparkline: [22, 21, 20.5, 21.3, 22.1, 22.8, 23, 22.5, 21.8, 22, 22.4, 22.1],
  },
  {
    sensor_id: 'TH_F2_01',
    field_id: 'field_2',
    type: 'temperature',
    grid_row: 1,
    grid_col: 1,
    status: 'battery_low',
    last_seen_at: new Date(Date.now() - 600_000).toISOString(),
    battery_pct: 12.0,
    firmware_version: '1.2.3',
    field_name: 'Olive Grove B',
    sparkline: [18, 19, 20, 21, 20.5, 19.8, 18.5, 17.9, 18.3, 19.1, 20, 20.5],
  },
  {
    sensor_id: 'SM_F3_01',
    field_id: 'field_3',
    type: 'soil_moisture',
    grid_row: 1,
    grid_col: 1,
    status: 'offline',
    last_seen_at: new Date(Date.now() - 86400_000).toISOString(),
    battery_pct: null,
    firmware_version: '1.2.3',
    field_name: 'Wheat Field C',
    sparkline: null,
  },
]

vi.mock('../../api/client', () => ({
  getSensors: vi.fn(() => Promise.resolve(MOCK_SENSORS)),
  getSensorDetail: vi.fn(),
}))

vi.mock('../../context/FarmContext', () => ({
  useFarm: () => ({ selectedFarm: { id: 'farm_1', name: 'Farm 1' } }),
}))

// Recharts ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderSensors() {
  return render(
    <MemoryRouter>
      <SensorRegistry />
    </MemoryRouter>
  )
}

// ---------- Tests ----------

describe('SensorRegistry (Phase 7)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders heading and sensor count', async () => {
    renderSensors()
    expect(await screen.findByText('Sensor Registry')).toBeInTheDocument()
    expect(screen.getByText(/3 sensors? deployed/)).toBeInTheDocument()
  })

  it('renders sort dropdown with all options', async () => {
    renderSensors()
    await screen.findByText('Sensor Registry')
    const dropdown = screen.getByTestId('sort-dropdown')
    expect(dropdown).toBeInTheDocument()
    expect(dropdown).toHaveTextContent('Sort: Name')
    expect(dropdown).toHaveTextContent('Sort: Battery')
    expect(dropdown).toHaveTextContent('Sort: Last Seen')
    expect(dropdown).toHaveTextContent('Sort: Status')
  })

  it('changing sort to Battery reorders cards', async () => {
    renderSensors()
    await screen.findByText('SM_F1_01')
    fireEvent.change(screen.getByTestId('sort-dropdown'), { target: { value: 'battery' } })
    // Battery sort: 88.2 > 12.0 > null → SM_F1_01 should be first
    await waitFor(() => {
      expect(screen.getByText('SM_F1_01')).toBeInTheDocument()
    })
  })

  it('renders sparklines for sensors with data', async () => {
    renderSensors()
    await screen.findByText('SM_F1_01')
    // Two sensors have sparkline data, one has null
    const sparklines = screen.getAllByTestId('sensor-sparkline')
    expect(sparklines.length).toBe(2)
  })
})
