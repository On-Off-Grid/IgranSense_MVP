/**
 * API Client for IgranSense Edge Simulation Service
 * 
 * Fetches data from the FastAPI backend running on localhost:8000
 */

const API_BASE = '/api';
const TOKEN_KEY = 'igransense_token';

/**
 * Get auth token from localStorage
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 */
async function fetchAPI(endpoint, options = {}) {
  try {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('igransense_user');
      // Don't redirect here - let the AuthContext handle it
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// =============================================================================
// Auth Endpoints
// =============================================================================

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{access_token: string, token_type: string, user: object}>}
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Get current authenticated user
 * @param {string} token - JWT token
 * @returns {Promise<object|null>} User object or null if invalid
 */
export async function getCurrentUser(token) {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

// =============================================================================
// Data Endpoints
// =============================================================================

/**
 * Get all fields with status summaries
 * @param {string} [farmId] - Optional farm ID to filter by
 * @returns {Promise<Array>} List of field summaries
 */
export async function getFields(farmId = null) {
  const params = farmId ? `?farm_id=${farmId}` : '';
  return fetchAPI(`/fields${params}`);
}

/**
 * Get detailed info for a specific field
 * @param {string} fieldId - Field ID (e.g., "field_1")
 * @returns {Promise<Object>} Field detail with time series
 */
export async function getFieldDetail(fieldId) {
  return fetchAPI(`/fields/${fieldId}`);
}

/**
 * Get all active alerts
 * @param {string} [farmId] - Optional farm ID to filter by
 * @returns {Promise<Array>} List of alerts sorted by severity
 */
export async function getAlerts(farmId = null) {
  const params = farmId ? `?farm_id=${farmId}` : '';
  return fetchAPI(`/alerts${params}`);
}

/**
 * Acknowledge an alert
 * @param {string} fieldId - Field ID
 * @param {string} alertType - Alert type (irrigation/stress/system)
 * @returns {Promise<Object>} Acknowledgement confirmation
 */
export async function acknowledgeAlert(fieldId, alertType) {
  return fetchAPI(`/alerts/${fieldId}/${alertType}/acknowledge`, {
    method: 'POST',
  });
}

/**
 * Snooze an alert
 * @param {string} fieldId - Field ID
 * @param {string} alertType - Alert type
 * @param {number} [hours=1] - Hours to snooze
 * @returns {Promise<Object>} Snooze confirmation
 */
export async function snoozeAlert(fieldId, alertType, hours = 1) {
  return fetchAPI(`/alerts/${fieldId}/${alertType}/snooze?hours=${hours}`, {
    method: 'POST',
  });
}

/**
 * Dismiss an alert
 * @param {string} fieldId - Field ID
 * @param {string} alertType - Alert type
 * @returns {Promise<Object>} Dismissal confirmation
 */
export async function dismissAlert(fieldId, alertType) {
  return fetchAPI(`/alerts/${fieldId}/${alertType}`, {
    method: 'DELETE',
  });
}

/**
 * Get system status (MDC, sensors)
 * @returns {Promise<Object>} System health info
 */
export async function getSystemStatus() {
  return fetchAPI('/system');
}

// =============================================================================
// Sensor Endpoints
// =============================================================================

/**
 * Get all sensors with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} [filters.status] - Filter by status (online, offline, battery_low)
 * @param {string} [filters.field_id] - Filter by field
 * @param {string} [filters.farm_id] - Filter by farm
 * @param {string} [filters.type] - Filter by sensor type
 * @returns {Promise<Array>} List of sensors
 */
export async function getSensors(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.field_id) params.append('field_id', filters.field_id);
  if (filters.farm_id) params.append('farm_id', filters.farm_id);
  if (filters.type) params.append('type', filters.type);
  const queryString = params.toString();
  return fetchAPI(`/sensors${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get detailed info for a specific sensor
 * @param {string} sensorId - Sensor ID
 * @returns {Promise<Object>} Sensor detail with recent readings
 */
export async function getSensorDetail(sensorId) {
  return fetchAPI(`/sensors/${sensorId}`);
}

export default {
  login,
  getCurrentUser,
  getFields,
  getFieldDetail,
  getAlerts,
  acknowledgeAlert,
  snoozeAlert,
  dismissAlert,
  getSystemStatus,
  getSensors,
  getSensorDetail,
};
