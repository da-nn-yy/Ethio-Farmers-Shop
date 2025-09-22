# Frontend Integration Guide

This guide helps you integrate the Ethio-Farmers-Shop API with your frontend application.

## 🚀 Quick Start

### 1. Base API Configuration
```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:5001/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  // Add authentication token
  setAuthToken: (token) => {
    apiClient.headers['Authorization'] = `Bearer ${token}`;
  },

  // Remove authentication token
  clearAuthToken: () => {
    delete apiClient.headers['Authorization'];
  }
};
```

### 2. API Service Functions
```javascript
// services/apiService.js
import { apiClient } from '../config/api.js';

// Authentication
export const authService = {
  register: (userData) =>
    fetch(`${apiClient.baseURL}/auth/register`, {
      method: 'POST',
      headers: apiClient.headers,
      body: JSON.stringify(userData)
    }),

  devLogin: (credentials) =>
    fetch(`${apiClient.baseURL}/auth/dev-login`, {
      method: 'POST',
      headers: apiClient.headers,
      body: JSON.stringify(credentials)
    }),

  syncUser: (token) =>
    fetch(`${apiClient.baseURL}/auth/sync`, {
      method: 'POST',
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    })
};

// Listings
export const listingService = {
  getActiveListings: () =>
    fetch(`${apiClient.baseURL}/listings/active`),

  searchListings: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${apiClient.baseURL}/search/listings?${queryString}`);
  },

  getListingById: (id) =>
    fetch(`${apiClient.baseURL}/listings/${id}`),

  createListing: (listingData, token) =>
    fetch(`${apiClient.baseURL}/listings`, {
      method: 'POST',
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(listingData)
    })
};

// Orders
export const orderService = {
  createOrder: (orderData, token) =>
    fetch(`${apiClient.baseURL}/orders`, {
      method: 'POST',
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(orderData)
    }),

  getBuyerOrders: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${apiClient.baseURL}/orders/buyer?${queryString}`, {
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    });
  },

  getFarmerOrders: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetch(`${apiClient.baseURL}/orders/farmer?${queryString}`, {
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    });
  }
};

// Favorites
export const favoriteService = {
  addToFavorites: (listingId, token) =>
    fetch(`${apiClient.baseURL}/favorites`, {
      method: 'POST',
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ listingId })
    }),

  getFavoriteListings: (token) =>
    fetch(`${apiClient.baseURL}/favorites/listings`, {
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    }),

  removeFromFavorites: (listingId, token) =>
    fetch(`${apiClient.baseURL}/favorites/${listingId}`, {
      method: 'DELETE',
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    })
};

// Dashboard
export const dashboardService = {
  getBuyerDashboard: (token) =>
    fetch(`${apiClient.baseURL}/dashboard/buyer`, {
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    }),

  getFarmerDashboard: (token) =>
    fetch(`${apiClient.baseURL}/dashboard/farmer`, {
      headers: { ...apiClient.headers, 'Authorization': `Bearer ${token}` }
    })
};
```

## 🔧 React Integration Examples

### 1. Authentication Hook
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { authService } from '../services/apiService.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user data
      authService.syncUser(token)
        .then(res => res.json())
        .then(data => {
          if (data.ok) {
            setUser(data.user);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await authService.devLogin(credentials);
      const data = await response.json();

      if (response.ok) {
        setToken(data.devToken);
        setUser(data.user);
        localStorage.setItem('token', data.devToken);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, logout, loading };
};
```

### 2. Listings Component
```javascript
// components/ListingsList.jsx
import { useState, useEffect } from 'react';
import { listingService } from '../services/apiService.js';

export const ListingsList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    q: '',
    region: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await listingService.searchListings(searchParams);
      const data = await response.json();

      if (response.ok) {
        setListings(data.listings);
      } else {
        console.error('Failed to fetch listings:', data.error);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newParams) => {
    setSearchParams({ ...searchParams, ...newParams, page: 1 });
  };

  if (loading) return <div>Loading listings...</div>;

  return (
    <div>
      <SearchFilters onSearch={handleSearch} />
      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};
```

### 3. Order Management
```javascript
// components/OrderForm.jsx
import { useState } from 'react';
import { orderService } from '../services/apiService.js';
import { useAuth } from '../hooks/useAuth.js';

export const OrderForm = ({ listing }) => {
  const { token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: [{
          listingId: listing.id,
          quantity: quantity
        }],
        notes: notes,
        deliveryFee: 0
      };

      const response = await orderService.createOrder(orderData, token);
      const data = await response.json();

      if (response.ok) {
        alert('Order created successfully!');
        // Redirect or update UI
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          max={listing.quantity}
        />
      </div>
      <div>
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Order...' : 'Place Order'}
      </button>
    </form>
  );
};
```

### 4. Favorites Management
```javascript
// components/FavoriteButton.jsx
import { useState, useEffect } from 'react';
import { favoriteService } from '../services/apiService.js';
import { useAuth } from '../hooks/useAuth.js';

export const FavoriteButton = ({ listingId }) => {
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      checkFavoriteStatus();
    }
  }, [token, listingId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoriteService.getFavoriteStatus(listingId, token);
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      alert('Please login to add favorites');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(listingId, token);
        setIsFavorite(false);
      } else {
        await favoriteService.addToFavorites(listingId, token);
        setIsFavorite(true);
      }
    } catch (error) {
      alert('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};
```

## 📱 Mobile App Integration

### React Native Example
```javascript
// services/apiService.js (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://your-server-ip:5001/api';

export const apiClient = {
  baseURL: API_BASE_URL,

  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('token');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return response.json();
  }
};
```

## 🔍 Error Handling

```javascript
// utils/errorHandler.js
export const handleApiError = (error, response) => {
  if (!response.ok) {
    switch (response.status) {
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden - show access denied message
        return 'Access denied';
      case 404:
        // Not found
        return 'Resource not found';
      case 500:
        // Server error
        return 'Server error. Please try again later.';
      default:
        return error.message || 'An error occurred';
    }
  }
  return null;
};
```

## 🎯 Best Practices

1. **Token Management**: Store tokens securely and refresh them when needed
2. **Error Handling**: Implement consistent error handling across all API calls
3. **Loading States**: Show loading indicators during API calls
4. **Caching**: Cache frequently accessed data to improve performance
5. **Offline Support**: Handle offline scenarios gracefully
6. **Validation**: Validate data on both client and server sides

## 🚀 Testing

```javascript
// tests/api.test.js
import { listingService } from '../services/apiService.js';

describe('API Services', () => {
  test('should fetch active listings', async () => {
    const response = await listingService.getActiveListings();
    expect(response.ok).toBe(true);
  });
});
```

This integration guide provides everything you need to connect your frontend with the Ethio-Farmers-Shop API. The routes are now fully functional and ready for frontend integration!
