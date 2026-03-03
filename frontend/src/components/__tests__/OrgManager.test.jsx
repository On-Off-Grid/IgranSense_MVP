import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import OrgManager from '../../pages/admin/OrgManager'

function renderOrg() {
  return render(
    <MemoryRouter>
      <OrgManager />
    </MemoryRouter>
  )
}

describe('OrgManager (Phase 7)', () => {
  it('renders heading', () => {
    renderOrg()
    expect(screen.getByText('Organizations')).toBeInTheDocument()
  })

  it('shows Critical Fields column header', () => {
    renderOrg()
    expect(screen.getByText('Critical Fields')).toBeInTheDocument()
  })

  it('shows Offline Sensors column header', () => {
    renderOrg()
    expect(screen.getByText('Offline Sensors')).toBeInTheDocument()
  })

  it('displays KPI values for each org', () => {
    renderOrg()
    // Fes Valley: 2 critical, 1 offline
    // Atlas: 0 critical, 3 offline
    // Coastal: 1 critical, 0 offline
    // Looking for the specific values to be rendered
    const twos = screen.getAllByText('2')
    expect(twos.length).toBeGreaterThanOrEqual(1)
    const threes = screen.getAllByText('3')
    expect(threes.length).toBeGreaterThanOrEqual(1)
  })
})
