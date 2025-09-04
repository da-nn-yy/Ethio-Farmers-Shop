import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/apiService.js';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedRole = localStorage.getItem('userRole');

      if (storedToken && storedAuth === 'true') {
        setToken(storedToken);
        setIsAuthenticated(true);

        // Verify token and get user data
        try {
          const profileResponse = await authService.getUserProfile();
          if (profileResponse.user) {
            setUser(profileResponse.user);
          } else {
            // Token might be invalid, clear auth
            logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.devLogin(credentials);

      if (response.user) {
        setUser(response.user);
        setToken(response.devToken);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('authToken', response.devToken);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.user.role);

        return { success: true, user: response.user };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');

    // Call logout service
    authService.logout();
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
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
