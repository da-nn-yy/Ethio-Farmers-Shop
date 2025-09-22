import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth.jsx';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth() || {};
  const [items, setItems] = useState([]);

  // Build a per-user storage key. Fallbacks: firebase_uid -> id -> email -> 'guest'
  const userId = user?.firebase_uid || user?.id || user?.email || 'guest';
  const storageKey = `cart_${userId}`;

  // Load cart for current user (with legacy migration from global_cart once)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      }
      // Legacy migration: move global_cart to per-user key only if present and current per-user is empty
      const legacy = localStorage.getItem('global_cart');
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          localStorage.setItem(storageKey, JSON.stringify(parsedLegacy));
          localStorage.removeItem('global_cart');
          setItems(parsedLegacy);
        }
      } else {
        setItems([]);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch {}
  }, [items, storageKey]);

  const addItem = (item, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id, quantity) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity } : i);
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const clear = () => setItems([]);

  const totalItems = useMemo(() => items.reduce((t, i) => t + (Number(i.quantity) || 0), 0), [items]);
  const totalCost = useMemo(() => items.reduce((t, i) => t + (Number(i.pricePerKg) || 0) * (Number(i.quantity) || 0), 0), [items]);

  const value = { items, addItem, updateQuantity, removeItem, clear, totalItems, totalCost };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};


