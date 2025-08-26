import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged, signOut, getIdToken } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the Firebase ID token
          const token = await getIdToken(user);
          // Store token in localStorage for API requests
          localStorage.setItem('authToken', token);
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
      } else {
        // Remove token when user logs out
        localStorage.removeItem('authToken');
      }

      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = { currentUser, logout };
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
