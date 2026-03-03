import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { hasMultiFarmAccess } from '../utils/rolePermissions';
import { getFarms } from '../api/client';

const FarmContext = createContext(null);

/**
 * Fallback farms data used when the API is unreachable (offline mode).
 * Mirrors data/farms.json on the backend.
 */
const FALLBACK_FARMS = [
  {
    id: 'farm_1',
    name: 'North Valley Farm',
    location: 'Fes-Meknes, Morocco',
    fieldCount: 3,
    status: 'online',
  },
  {
    id: 'farm_2',
    name: 'Coastal Olive Grove',
    location: 'Tangier-Tetouan, Morocco',
    fieldCount: 5,
    status: 'online',
  },
  {
    id: 'farm_3',
    name: 'Atlas Highlands Farm',
    location: 'Draa-Tafilalet, Morocco',
    fieldCount: 2,
    status: 'offline',
  },
];

const DEFAULT_FARM = {
  id: 'farm_1',
  name: 'My Farm',
  location: 'Local',
  fieldCount: 3,
  status: 'online',
};

/**
 * Normalise a farm object from the API (farms.json shape) to the shape
 * the frontend components expect.
 */
function normaliseFarm(apiFarm) {
  return {
    id: apiFarm.farm_id,
    name: apiFarm.name,
    location: apiFarm.region,
    fieldCount: apiFarm.field_count,
    status: apiFarm.status,
    coordinates: apiFarm.coordinates,
  };
}

/**
 * FarmProvider - Context for multi-farm selection
 * 
 * Provides:
 * - farms: List of accessible farms
 * - selectedFarm: Currently selected farm
 * - selectFarm: Function to change farm
 * - hasMultipleFarms: Boolean for UI logic
 */
export function FarmProvider({ children }) {
  const { user } = useAuth();
  const [apiFarms, setApiFarms] = useState(null); // null = not yet loaded

  // Fetch farms from the API once on mount
  useEffect(() => {
    let cancelled = false;
    getFarms()
      .then((data) => {
        if (!cancelled) setApiFarms(data.map(normaliseFarm));
      })
      .catch(() => {
        // Offline or API unavailable — use fallback
        if (!cancelled) setApiFarms(FALLBACK_FARMS);
      });
    return () => { cancelled = true; };
  }, []);

  // Derive farms list based on user role + loaded API data
  const farms = useMemo(() => {
    if (!user) return [];
    if (!hasMultiFarmAccess(user.role)) return [DEFAULT_FARM];
    return apiFarms ?? FALLBACK_FARMS; // use fallback while loading
  }, [user, apiFarms]);

  // Track selected farm with useState, initialized based on user
  const [selectedFarmId, setSelectedFarmId] = useState(() => {
    const saved = localStorage.getItem('igransense_selected_farm');
    return saved || 'farm_1';
  });

  // Derive selected farm from farms and selectedFarmId
  const selectedFarm = useMemo(() => {
    if (!user || farms.length === 0) return null;
    return farms.find(f => f.id === selectedFarmId) || farms[0];
  }, [user, farms, selectedFarmId]);

  /**
   * Select a different farm
   */
  const selectFarm = useCallback((farmOrId) => {
    const farmId = typeof farmOrId === 'string' ? farmOrId : farmOrId?.id;
    if (farmId) {
      setSelectedFarmId(farmId);
      localStorage.setItem('igransense_selected_farm', farmId);
    }
  }, []);

  const value = useMemo(() => ({
    farms,
    selectedFarm,
    selectFarm,
    hasMultipleFarms: farms.length > 1,
  }), [farms, selectedFarm, selectFarm]);

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
}

/**
 * Hook to access farm context
 * @returns {{farms: Array, selectedFarm: object|null, selectFarm: function, hasMultipleFarms: boolean}}
 */
export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}

export default FarmContext;
