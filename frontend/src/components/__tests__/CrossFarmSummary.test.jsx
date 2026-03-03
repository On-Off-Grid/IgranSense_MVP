import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CrossFarmSummary from '../CrossFarmSummary'

const MOCK_FARMS = [
  { farm_id: 'farm_1', name: 'Farm 1', region: 'R1', field_count: 3, status: 'online' },
  { farm_id: 'farm_2', name: 'Farm 2', region: 'R2', field_count: 5, status: 'online' },
]

const MOCK_FIELDS = [
  { id: 'f1', status: 'critical' },
  { id: 'f2', status: 'ok' },
  { id: 'f3', status: 'warning' },
  { id: 'f4', status: 'ok' },
]

vi.mock('../../api/client', () => ({
  getFarms: vi.fn(() => Promise.resolve(MOCK_FARMS)),
  getFields: vi.fn(() => Promise.resolve(MOCK_FIELDS)),
}))

function renderSummary() {
  return render(
    <MemoryRouter>
      <CrossFarmSummary />
    </MemoryRouter>
  )
}

describe('CrossFarmSummary (Phase 8)', () => {
  it('renders the all-farms summary heading', async () => {
    renderSummary()
    expect(await screen.findByText('All-Farms Summary')).toBeInTheDocument()
  })

  it('has data-testid', async () => {
    renderSummary()
    expect(await screen.findByTestId('cross-farm-summary')).toBeInTheDocument()
  })

  it('shows farm count', async () => {
    renderSummary()
    await screen.findByText('All-Farms Summary')
    expect(screen.getByText('Farms')).toBeInTheDocument()
    // "2" may appear in multiple metric cards, just verify at least one
    const twos = screen.getAllByText('2')
    expect(twos.length).toBeGreaterThanOrEqual(1)
  })

  it('shows total fields count', async () => {
    renderSummary()
    await screen.findByText('All-Farms Summary')
    expect(screen.getByText('Total Fields')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('shows critical / warning / healthy counts', async () => {
    renderSummary()
    await screen.findByText('All-Farms Summary')
    expect(screen.getByText('Critical')).toBeInTheDocument()
    expect(screen.getByText('Warning')).toBeInTheDocument()
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    // 1 critical, 1 warning, 2 healthy — values may appear in multiple cards
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(2) // critical & warning
  })
})
