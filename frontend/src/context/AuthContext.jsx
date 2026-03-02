import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getCurrentUser } from '../api/client';

/**
 * Auth context for managing user authentication state
 */
const AuthContext = createContext(null);

const TOKEN_KEY = 'igransense_token';
const USER_KEY = 'igransense_user';

/**
 * Auth provider component - wraps app to provide auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      
      if (token && savedUser) {
        try {
          // Validate token with backend
          const validatedUser = await getCurrentUser(token);
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } catch (err) {
          // Token validation failed, try to use cached user for offline mode
          console.warn('Token validation failed, using cached user:', err);
          setUser(JSON.parse(savedUser));
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Log in with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await apiLogin(email, password);
      if (response.access_token && response.user) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Log in as local user (no credentials required)
   */
  const loginAsLocal = async () => {
    return login('local', 'demo123');
  };

  /**
   * Log out current user
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setError(null);
  };

  /**
   * Get current auth token
   */
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginAsLocal,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * @returns {{ user: object|null, role: string|null, isAuthenticated: boolean, isLoading: boolean, error: string|null, login: function, loginAsLocal: function, logout: function, getToken: function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
