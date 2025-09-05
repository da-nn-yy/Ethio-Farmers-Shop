import { useState, useEffect, createContext, useContext } from 'react';
import { authService, userService } from '../services/apiService.js';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

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

        // Verify token and get user data from DB
        try {
          const me = await userService.getMe();
          if (me && me.id) {
            setUser({
              id: me.id,
              firebase_uid: me.firebaseUid,
              email: me.email,
              fullName: me.fullName,
              role: me.role,
              region: me.region,
              woreda: me.woreda,
              avatarUrl: me.avatarUrl || null,
              created_at: me.createdAt
            });
          } else {
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
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Persist token for API calls
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('isAuthenticated', 'true');

      // Ensure user exists in MySQL and fetch profile
      await authService.syncUser();
      const me = await userService.getMe();

      if (me && me.id) {
        setUser({
          id: me.id,
          firebase_uid: me.firebaseUid,
          email: me.email,
          fullName: me.fullName,
          role: me.role,
          region: me.region,
          woreda: me.woreda,
          avatarUrl: me.avatarUrl || null,
          created_at: me.createdAt
        });
        setToken(idToken);
        setIsAuthenticated(true);
        localStorage.setItem('userRole', me.role);
        return { success: true, user: me };
      }
      return { success: false, error: 'Login failed' };
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

  const logout = async () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');

    // Call logout service
    authService.logout();
    try { await signOut(auth); } catch {}
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
