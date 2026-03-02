import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import FarmOverview from './components/FarmOverview';
import FieldDetail from './components/FieldDetail';
import AlertsList from './components/AlertsList';
import SystemStatus from './components/SystemStatus';
import SensorRegistry from './components/SensorRegistry';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider, useFarm } from './context/FarmContext';
import { PrivateRoute } from './components/auth';
import { getNavItemsForRole } from './utils/rolePermissions';
import './index.css';

// Context for offline state
const OfflineContext = createContext({ isOffline: false, lastSync: null });
export const useOffline = () => useContext(OfflineContext);

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [edgeConnected, setEdgeConnected] = useState(true);
  const [lastSync, setLastSync] = useState(() => {
    const saved = localStorage.getItem('igransense_last_sync');
    return saved ? new Date(saved) : null;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Ping edge API periodically
  useEffect(() => {
    const checkEdge = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/health', { 
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          setEdgeConnected(true);
          const now = new Date();
          setLastSync(now);
          localStorage.setItem('igransense_last_sync', now.toISOString());
        } else {
          setEdgeConnected(false);
        }
      } catch {
        setEdgeConnected(false);
      }
    };

    checkEdge();
    const interval = setInterval(checkEdge, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return { isOnline, edgeConnected, lastSync };
}

function NavBar({ isOnline, edgeConnected, lastSync }) {
  const { user, logout } = useAuth();
  const { selectedFarm, farms, selectFarm, hasMultipleFarms } = useFarm();
  const navigate = useNavigate();
  const [farmDropdownOpen, setFarmDropdownOpen] = useState(false);
  
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-slate-300 hover:bg-slate-700'
    }`;

  // Get nav items based on user role
  const navItems = user ? getNavItemsForRole(user.role) : [];

  // Determine status message and color
  let statusText, statusColor, dotColor, showLastSync;
  
  if (!edgeConnected) {
    statusText = 'Edge Disconnected';
    statusColor = 'text-red-400';
    dotColor = 'bg-red-500';
    showLastSync = true;
  } else if (!isOnline) {
    statusText = 'Edge Active (Offline Mode)';
    statusColor = 'text-orange-400';
    dotColor = 'bg-orange-500 animate-pulse';
    showLastSync = false;
  } else {
    statusText = 'Edge Active';
    statusColor = 'text-slate-400';
    dotColor = 'bg-green-500 animate-pulse';
    showLastSync = false;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFarmSelect = (farm) => {
    selectFarm(farm);
    setFarmDropdownOpen(false);
  };

  // Role badge colors
  const roleBadgeClasses = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    enterprise: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    farmer: 'bg-green-500/20 text-green-400 border-green-500/30',
    local_farm: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-bold text-white">IgranSense</h1>
        </div>
        
        {/* Role-based navigation */}
        <div className="flex gap-2">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Farm Selector (for multi-farm users) */}
          {hasMultipleFarms && selectedFarm && (
            <div className="relative">
              <button
                onClick={() => setFarmDropdownOpen(!farmDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 
                           rounded-lg text-white text-sm transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${
                  selectedFarm.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="max-w-[150px] truncate">{selectedFarm.name}</span>
                <svg className={`w-4 h-4 transition-transform ${farmDropdownOpen ? 'rotate-180' : ''}`} 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Farm Dropdown */}
              {farmDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 
                               rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Select Farm</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {farms.map(farm => (
                      <button
                        key={farm.id}
                        onClick={() => handleFarmSelect(farm)}
                        className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors
                                   flex items-center gap-3 ${
                                     selectedFarm?.id === farm.id ? 'bg-slate-700/50' : ''
                                   }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          farm.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{farm.name}</p>
                          <p className="text-slate-400 text-xs truncate">{farm.location}</p>
                        </div>
                        <span className="text-slate-500 text-xs">{farm.fieldCount} fields</span>
                        {selectedFarm?.id === farm.id && (
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edge status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
            <div className="flex flex-col items-end">
              <span className={`text-sm ${statusColor}`}>
                {statusText}
              </span>
              {showLastSync && lastSync && (
                <span className="text-xs text-slate-500">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          {/* User info & logout */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
              <div className="flex flex-col items-end">
                <span className="text-sm text-white">{user.email}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${roleBadgeClasses[user.role] || roleBadgeClasses.local_farm}`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-white transition-colors p-2"
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { isOnline, edgeConnected, lastSync } = useOnlineStatus();
  const { isAuthenticated } = useAuth();

  return (
    <OfflineContext.Provider value={{ isOffline: !isOnline || !edgeConnected, lastSync }}>
      <div className="min-h-screen bg-slate-900">
        {/* Only show navbar when authenticated */}
        {isAuthenticated && (
          <NavBar isOnline={isOnline} edgeConnected={edgeConnected} lastSync={lastSync} />
        )}
        <main className={isAuthenticated ? "p-6 max-w-7xl mx-auto" : ""}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/farm-overview" replace />} />
            <Route path="/farm-overview" element={
              <PrivateRoute>
                <FarmOverview />
              </PrivateRoute>
            } />
            <Route path="/field/:fieldId" element={
              <PrivateRoute>
                <FieldDetail />
              </PrivateRoute>
            } />
            <Route path="/alerts" element={
              <PrivateRoute>
                <AlertsList />
              </PrivateRoute>
            } />
            <Route path="/system" element={
              <PrivateRoute>
                <SystemStatus />
              </PrivateRoute>
            } />
            <Route path="/sensors" element={
              <PrivateRoute>
                <SensorRegistry />
              </PrivateRoute>
            } />
            {/* Admin routes - protected by role */}
            <Route path="/admin/*" element={
              <PrivateRoute requiredRole="admin">
                <AdminLayout />
              </PrivateRoute>
            } />
            {/* Catch-all route - redirect to farm overview */}
            <Route path="*" element={<Navigate to="/farm-overview" replace />} />
          </Routes>
        </main>
      </div>
    </OfflineContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <AppContent />
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
