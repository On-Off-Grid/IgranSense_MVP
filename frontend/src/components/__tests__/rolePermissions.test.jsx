import { describe, it, expect } from 'vitest'
import {
  getNavItemsForRole,
  canAccessRoute,
  canPerformAction,
  getDefaultRoute,
  hasMultiFarmAccess,
  ROLE_NAV_ITEMS,
} from '../../utils/rolePermissions'

describe('rolePermissions (Phase 8)', () => {
  // ---- 8.1 default redirect ----
  it('admin default route is /admin', () => {
    expect(getDefaultRoute('admin')).toBe('/admin')
  })

  it('farmer default route is /farm-overview', () => {
    expect(getDefaultRoute('farmer')).toBe('/farm-overview')
  })

  it('local_farm default route is /farm-overview', () => {
    expect(getDefaultRoute('local_farm')).toBe('/farm-overview')
  })

  it('enterprise default route is /farm-overview', () => {
    expect(getDefaultRoute('enterprise')).toBe('/farm-overview')
  })

  // ---- 8.3 local_farm restrictions ----
  it('local_farm nav has no irrigation/weather/sensors', () => {
    const keys = ROLE_NAV_ITEMS.local_farm
    expect(keys).not.toContain('irrigation')
    expect(keys).not.toContain('weather')
    expect(keys).not.toContain('sensors')
  })

  it('local_farm cannot access /irrigation', () => {
    expect(canAccessRoute('local_farm', '/irrigation')).toBe(false)
  })

  it('local_farm cannot access /weather', () => {
    expect(canAccessRoute('local_farm', '/weather')).toBe(false)
  })

  it('local_farm cannot access /sensors', () => {
    expect(canAccessRoute('local_farm', '/sensors')).toBe(false)
  })

  it('farmer CAN access /irrigation', () => {
    expect(canAccessRoute('farmer', '/irrigation')).toBe(true)
  })

  it('enterprise CAN access /weather', () => {
    expect(canAccessRoute('enterprise', '/weather')).toBe(true)
  })

  // ---- 8.4 cross-farm summary action ----
  it('enterprise can view_cross_farm_summary', () => {
    expect(canPerformAction('enterprise', 'view_cross_farm_summary')).toBe(true)
  })

  it('admin can view_cross_farm_summary', () => {
    expect(canPerformAction('admin', 'view_cross_farm_summary')).toBe(true)
  })

  it('farmer cannot view_cross_farm_summary', () => {
    expect(canPerformAction('farmer', 'view_cross_farm_summary')).toBe(false)
  })

  it('local_farm cannot view_cross_farm_summary', () => {
    expect(canPerformAction('local_farm', 'view_cross_farm_summary')).toBe(false)
  })

  // ---- nav items ----
  it('farmer nav includes irrigation and weather', () => {
    const items = getNavItemsForRole('farmer')
    const labels = items.map(i => i.label)
    expect(labels).toContain('Irrigation')
    expect(labels).toContain('Weather')
  })

  it('admin nav includes admin item', () => {
    const items = getNavItemsForRole('admin')
    const labels = items.map(i => i.label)
    expect(labels).toContain('Admin')
  })

  // ---- multi-farm ----
  it('enterprise has multi-farm access', () => {
    expect(hasMultiFarmAccess('enterprise')).toBe(true)
  })

  it('local_farm does NOT have multi-farm access', () => {
    expect(hasMultiFarmAccess('local_farm')).toBe(false)
  })
})
