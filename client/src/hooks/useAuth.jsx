import { useState, useEffect, createContext, useContext } from 'react';
import { authService, userService } from '../services/apiService.js';
import sessionManager from '../utils/sessionManager.js';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    initializeAuth();

    // Listen for session cleared events
    const handleSessionCleared = (event) => {
      console.log('Session cleared event received:', event.detail);
      clearAuth();
    };

    window.addEventListener('sessionCleared', handleSessionCleared);

    // Cleanup event listener
    return () => {
      window.removeEventListener('sessionCleared', handleSessionCleared);
    };
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use session manager for session-based storage
      const storedToken = sessionManager.getSessionData('authToken');
      const storedAuth = sessionManager.getSessionData('isAuthenticated');
      const storedUser = sessionManager.getSessionData('userData');

      if (storedToken && storedAuth === 'true') {
        // Immediately hydrate session from storage to avoid flicker/redirects
        setToken(storedToken);
        setIsAuthenticated(true);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            if (parsed?.role) setRole(parsed.role);
          } catch {}
        }

        // Also attempt to fetch fresh user from backend to ensure real data
        try {
          const me = await userService.getMe();
          if (me) {
            setUser(me);
            setRole(me.role || null);
            sessionManager.setSessionData('userData', JSON.stringify(me));
            if (me.role) sessionManager.setSessionData('userRole', me.role);
          }
        } catch (_) {
          // Non-fatal if backend is down
        }
      } else {
        // No valid stored auth - clear everything
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setError(null);
        clearSessionData(); // Clear any remaining session data
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
      // Clear session data on error
      clearSessionData();
    } finally {
      setLoading(false);
    }
  };

  const clearSessionData = () => {
    // Use session manager to clear all session data
    sessionManager.clearSession();
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    setError(null);

    // Clear all session data
    clearSessionData();
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Enforce real auth: try to get user from backend after external auth
      // The actual sign-in should occur via Firebase UI elsewhere
      const me = await userService.getMe();

      if (me) {
        setUser(me);
        setRole(me.role || null);
        setIsAuthenticated(true);
        sessionManager.setSessionData('isAuthenticated', 'true');
        sessionManager.setSessionData('userData', JSON.stringify(me));
        if (me.role) sessionManager.setSessionData('userRole', me.role);
        return { success: true, user: me };
      }
      throw new Error('Authentication failed');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      // Try to authenticate the user immediately after successful registration
      try {
        const { email, password } = userData;
        // Prefer real Firebase sign-in when available (server returns firebase_user in prod flow)
        let signedIn = false;
        try {
          const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);
          signedIn = true;
        } catch (_) {
          // ignore, may be dev mode without Firebase
        }

        // If Firebase sign-in isn't available, fall back to dev login token
        if (!signedIn) {
          try {
            await authService.devLogin({ email, password });
            signedIn = true;
          } catch (_) {}
        }

        // Best-effort: sync user and hydrate role/user locally
        try {
          await authService.syncUser();
        } catch (_) {}
        try {
          const me = await userService.getMe();
          if (me) {
            setUser(me);
            setRole(me.role || null);
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            if (me.role) localStorage.setItem('userRole', me.role);
            localStorage.setItem('userData', JSON.stringify(me));
          }
        } catch (_) {}
      } catch (_) {
        // Non-fatal: even if auto login fails, registration still succeeded
      }

      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    // Call logout service
    authService.logout();
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    if (updatedUser?.role) setRole(updatedUser.role);
    localStorage.setItem('userData', JSON.stringify(updatedUser));

    // Trigger a custom event to notify other components of user data changes
    window.dispatchEvent(new CustomEvent('userDataUpdated', {
      detail: updatedUser
    }));
  };

  const refreshUser = async () => {
    try {
      if (!token) return false;
      const me = await userService.getMe();
      if (me) {
        setUser(me);
        setRole(me.role || null);
        localStorage.setItem('userData', JSON.stringify(me));
        if (me.role) localStorage.setItem('userRole', me.role);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    role: role || user?.role || sessionManager.getSessionData('userRole') || localStorage.getItem('userRole'),
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    clearError,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
