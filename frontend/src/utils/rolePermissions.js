/**
 * Role-based permissions and navigation configuration
 * 
 * Roles:
 * - local_farm: Basic access - single farm view only
 * - farmer: Full individual access - all features for their farm(s)
 * - enterprise: Multi-farm access with org-level views
 * - admin: Platform admin with full access
 */

/**
 * Navigation items configuration
 */
export const NAV_ITEMS = {
  overview: { path: '/farm-overview', label: 'Farm Overview', icon: '🏠' },
  irrigation: { path: '/irrigation', label: 'Irrigation', icon: '💧' },
  weather: { path: '/weather', label: 'Weather', icon: '⛅' },
  alerts: { path: '/alerts', label: 'Alerts', icon: '🔔' },
  sensors: { path: '/sensors', label: 'Sensors', icon: '📡' },
  system: { path: '/system', label: 'System', icon: '⚙️' },
  admin: { path: '/admin', label: 'Admin', icon: '🛡️' },
};

/**
 * Role to allowed navigation items mapping
 */
export const ROLE_NAV_ITEMS = {
  local_farm: ['overview', 'alerts', 'system'],
  farmer: ['overview', 'irrigation', 'weather', 'alerts', 'sensors', 'system'],
  enterprise: ['overview', 'irrigation', 'weather', 'alerts', 'sensors', 'system'],
  admin: ['overview', 'irrigation', 'weather', 'alerts', 'sensors', 'system', 'admin'],
};

/**
 * Role to allowed routes mapping (for PrivateRoute guards)
 */
export const ROLE_ROUTES = {
  local_farm: ['/farm-overview', '/field/:fieldId', '/alerts', '/system'],
  farmer: ['/farm-overview', '/field/:fieldId', '/irrigation', '/weather', '/alerts', '/sensors', '/system'],
  enterprise: ['/farm-overview', '/field/:fieldId', '/irrigation', '/weather', '/alerts', '/sensors', '/system', '/select-farm'],
  admin: ['/farm-overview', '/field/:fieldId', '/irrigation', '/weather', '/alerts', '/sensors', '/system', '/select-farm', '/admin', '/admin/*'],
};

/**
 * Role to allowed actions mapping
 */
export const ROLE_ACTIONS = {
  local_farm: ['view_data', 'acknowledge_alerts'],
  farmer: ['view_data', 'acknowledge_alerts', 'snooze_alerts', 'dismiss_alerts', 'view_sensors', 'view_irrigation', 'view_weather'],
  enterprise: ['view_data', 'acknowledge_alerts', 'snooze_alerts', 'dismiss_alerts', 'view_sensors', 'view_irrigation', 'view_weather', 'switch_farm', 'view_org_stats', 'view_cross_farm_summary'],
  admin: ['view_data', 'acknowledge_alerts', 'snooze_alerts', 'dismiss_alerts', 'view_sensors', 'view_irrigation', 'view_weather', 'switch_farm', 'view_org_stats', 'view_cross_farm_summary', 'manage_users', 'manage_orgs', 'view_diagnostics'],
};

/**
 * Get navigation items for a role
 * @param {string} role - User role
 * @returns {Array<{path: string, label: string, icon: string}>}
 */
export function getNavItemsForRole(role) {
  const allowedKeys = ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.local_farm;
  return allowedKeys.map(key => NAV_ITEMS[key]).filter(Boolean);
}

/**
 * Check if a role can access a route
 * @param {string} role - User role
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function canAccessRoute(role, path) {
  const allowedRoutes = ROLE_ROUTES[role] || ROLE_ROUTES.local_farm;
  
  return allowedRoutes.some(route => {
    // Handle wildcard routes
    if (route.endsWith('/*')) {
      const prefix = route.slice(0, -2);
      return path.startsWith(prefix);
    }
    // Handle dynamic routes
    if (route.includes(':')) {
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    }
    return route === path;
  });
}

/**
 * Check if a role can perform an action
 * @param {string} role - User role
 * @param {string} action - Action name
 * @returns {boolean}
 */
export function canPerformAction(role, action) {
  const allowedActions = ROLE_ACTIONS[role] || ROLE_ACTIONS.local_farm;
  return allowedActions.includes(action);
}

/**
 * Check if a role has multi-farm access
 * @param {string} role - User role
 * @returns {boolean}
 */
export function hasMultiFarmAccess(role) {
  return role === 'enterprise' || role === 'admin';
}

/**
 * Check if a role has admin access
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isAdmin(role) {
  return role === 'admin';
}

/**
 * Get default landing route for a role
 * @param {string} role - User role
 * @returns {string}
 */
export function getDefaultRoute(role) {
  if (role === 'admin') return '/admin';
  return '/farm-overview';
}

/**
 * Get role display info
 * @param {string} role - User role
 * @returns {{label: string, color: string, description: string}}
 */
export function getRoleInfo(role) {
  const roleInfo = {
    admin: {
      label: 'Platform Admin',
      color: 'purple',
      description: 'Full platform access',
    },
    enterprise: {
      label: 'Enterprise',
      color: 'blue',
      description: 'Multi-farm organization access',
    },
    farmer: {
      label: 'Farmer',
      color: 'green',
      description: 'Full farm management access',
    },
    local_farm: {
      label: 'Local Farm',
      color: 'slate',
      description: 'Basic farm monitoring access',
    },
  };
  
  return roleInfo[role] || roleInfo.local_farm;
}
