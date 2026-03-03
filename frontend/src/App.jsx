import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FarmOverview from './components/FarmOverview';
import FieldDetail from './components/FieldDetail';
import AlertsList from './components/AlertsList';
import SystemStatus from './components/SystemStatus';
import SensorRegistry from './components/SensorRegistry';
import IrrigationWater from './components/IrrigationWater';
import WeatherRisk from './components/WeatherRisk';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { PrivateRoute } from './components/auth';
import { getDefaultRoute } from './utils/rolePermissions';
import './index.css';
import './App.css';

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



function RoleRedirect() {
  const { user } = useAuth();
  const target = user ? getDefaultRoute(user.role) : '/farm-overview';
  return <Navigate to={target} replace />;
}

function AppContent() {
  const { isOnline, edgeConnected, lastSync } = useOnlineStatus();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <OfflineContext.Provider value={{ isOffline: !isOnline || !edgeConnected, lastSync }}>
      <div className="min-h-screen bg-slate-900">
        {/* Header + Sidebar when authenticated */}
        {isAuthenticated && (
          <>
            <Header onHamburgerClick={() => setMobileMenuOpen(prev => !prev)} />
            <Sidebar
              isOnline={isOnline}
              edgeConnected={edgeConnected}
              lastSync={lastSync}
              mobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
          </>
        )}
        <main className={isAuthenticated ? "pt-14 md:pl-16 p-6 max-w-7xl mx-auto" : ""}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RoleRedirect />} />
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
            <Route path="/irrigation" element={
              <PrivateRoute>
                <IrrigationWater />
              </PrivateRoute>
            } />
            <Route path="/weather" element={
              <PrivateRoute>
                <WeatherRisk />
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
