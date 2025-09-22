import { useState, useEffect, createContext, useContext } from 'react';
import { authService, userService } from '../services/apiService.js';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedToken = localStorage.getItem('authToken');
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedAuth === 'true') {
        // Immediately hydrate session from storage to avoid flicker/redirects
        setToken(storedToken);
        setIsAuthenticated(true);
        if (storedUser) {
          try { setUser(JSON.parse(storedUser)); } catch {}
        }

        // Skip API call for now to avoid hanging when backend is not available
        console.log('Using stored session data, skipping API call');
      } else {
        // No valid stored auth
        clearAuth();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setError('Failed to initialize authentication');
      // Do not force logout here to avoid redirect loops
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
  };

  const login = async (credentials) => {
    // Check if this is a dev mode login
    if (credentials.devMode) {
      const devUserData = JSON.parse(localStorage.getItem('devUserData') || '{}');
      console.log('Dev mode login - user data:', devUserData);
      setUser(devUserData);
      setToken(localStorage.getItem('authToken'));
      setIsAuthenticated(true);
      setError(null);
      console.log('Dev mode login successful');
      return { success: true, user: devUserData };
    }
    try {
      setLoading(true);
      setError(null);

      const response = await authService.devLogin(credentials);

      if (response.user && response.devToken) {
        setUser(response.user);
        setToken(response.devToken);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('authToken', response.devToken);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('userRole', response.user.role);

        return { success: true, user: response.user };
      } else {
        throw new Error('Invalid response from server');
      }
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
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      if (!token) return false;
      
      const profileResponse = await authService.getUserProfile();
      if (profileResponse.user) {
        setUser(profileResponse.user);
        localStorage.setItem('userData', JSON.stringify(profileResponse.user));
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
