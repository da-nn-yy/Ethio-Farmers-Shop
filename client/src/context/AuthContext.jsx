import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const googleProvider = new GoogleAuthProvider();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function syncUserToBackend(idToken, payload = {}) {
  return axios.post(`${API_BASE_URL}/api/auth/register`, payload, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await cred.user.getIdToken();
    await syncUserToBackend(idToken);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const idToken = await cred.user.getIdToken();
    await syncUserToBackend(idToken);
    return cred.user;
  };

  const signupWithEmail = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(cred.user, { displayName: name });
    }
    const idToken = await cred.user.getIdToken();
    await syncUserToBackend(idToken, { displayName: name });
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, loading, loginWithEmail, loginWithGoogle, signupWithEmail, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

