import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SystemStatus from '../SystemStatus'

// ---------- Mock data ----------
const MOCK_STATUS = {
  mdc_status: 'online',
  last_sync: new Date().toISOString(),
  sensor_health_summary: {
    total_sensors: 27,
    online_sensors: 22,
    offline_sensors: 3,
    battery_low_sensors: 2,
  },
  mdc_metrics: {
    cpu_pct: 18.3,
    memory_pct: 42.1,
    disk_pct: 27.8,
    requests_per_min: 65,
  },
}

vi.mock('../../api/client', () => ({
  getSystemStatus: vi.fn(() => Promise.resolve(MOCK_STATUS)),
}))

function renderSystem() {
  return render(
    <MemoryRouter>
      <SystemStatus />
    </MemoryRouter>
  )
}

describe('SystemStatus (Phase 7)', () => {
  it('renders heading and test-id', async () => {
    renderSystem()
    expect(await screen.findByText('System Status')).toBeInTheDocument()
    expect(screen.getByTestId('system-status')).toBeInTheDocument()
  })

  it('shows edge processing banner', async () => {
    renderSystem()
    expect(await screen.findByTestId('edge-banner')).toBeInTheDocument()
    const matches = screen.getAllByText(/Edge processing active/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('displays 4 MDC MetricCards', async () => {
    renderSystem()
    await screen.findByText('System Status')
    const strip = screen.getByTestId('mdc-metrics-strip')
    expect(strip).toBeInTheDocument()
    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('Memory')).toBeInTheDocument()
    expect(screen.getByText('Disk')).toBeInTheDocument()
    expect(screen.getByText('Req/min')).toBeInTheDocument()
  })

  it('shows metric values', async () => {
    renderSystem()
    await screen.findByText('System Status')
    expect(screen.getByText('18.3')).toBeInTheDocument()
    expect(screen.getByText('42.1')).toBeInTheDocument()
    expect(screen.getByText('27.8')).toBeInTheDocument()
    expect(screen.getByText('65')).toBeInTheDocument()
  })

  it('shows sensor network health', async () => {
    renderSystem()
    expect(await screen.findByText('27')).toBeInTheDocument()
    expect(screen.getByText(/sensors deployed/)).toBeInTheDocument()
  })
})
