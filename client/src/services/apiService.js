import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      window.location.href = '/authentication-login-register';
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Development login (for testing)
  devLogin: async (credentials) => {
    const response = await apiClient.post('/auth/dev-login', credentials);
    if (response.data.devToken) {
      localStorage.setItem('authToken', response.data.devToken);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', response.data.user.role);
    }
    return response.data;
  },

  // Sync user with backend
  syncUser: async () => {
    const response = await apiClient.post('/auth/sync');
    return response.data;
  },

  // Get user profile
  getUserProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  }
};

// User Service
export const userService = {
  // Get current user
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Update user profile
  updateMe: async (userData) => {
    const response = await apiClient.put('/users/me', userData);
    return response.data;
  },

  // Upload user avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Listings Service
export const listingService = {
  // Get all active listings
  getActiveListings: async (params = {}) => {
    const response = await apiClient.get('/listings/active', { params });
    return response.data;
  },

  // Search listings
  searchListings: async (params = {}) => {
    const response = await apiClient.get('/search/listings', { params });
    return response.data;
  },

  // Get listing by ID
  getListingById: async (id) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  // Create new listing (farmers only)
  createListing: async (listingData) => {
    const response = await apiClient.post('/listings', listingData);
    return response.data;
  },

  // Update listing
  updateListing: async (id, listingData) => {
    const response = await apiClient.put(`/listings/${id}`, listingData);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  },

  // Get farmer's listings
  getFarmerListings: async (params = {}) => {
    const response = await apiClient.get('/listings/farmer/my-listings', { params });
    return response.data;
  }
};

// Orders Service
export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  // Get buyer's orders
  getBuyerOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/buyer', { params });
    return response.data;
  },

  // Get farmer's orders
  getFarmerOrders: async (params = {}) => {
    const response = await apiClient.get('/orders/farmer', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`);
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (params = {}) => {
    const response = await apiClient.get('/orders/stats', { params });
    return response.data;
  }
};

// Favorites Service
export const favoriteService = {
  // Add to favorites
  addToFavorites: async (listingId) => {
    const response = await apiClient.post('/favorites', { listingId });
    return response.data;
  },

  // Remove from favorites
  removeFromFavorites: async (listingId) => {
    const response = await apiClient.delete(`/favorites/${listingId}`);
    return response.data;
  },

  // Get favorite listings
  getFavoriteListings: async (params = {}) => {
    const response = await apiClient.get('/favorites/listings', { params });
    return response.data;
  },

  // Get favorite farmers
  getFavoriteFarmers: async (params = {}) => {
    const response = await apiClient.get('/favorites/farmers', { params });
    return response.data;
  },

  // Check if listing is favorited
  checkFavoriteStatus: async (listingId) => {
    const response = await apiClient.get(`/favorites/status/${listingId}`);
    return response.data;
  },

  // Get favorite statistics
  getFavoriteStats: async () => {
    const response = await apiClient.get('/favorites/stats');
    return response.data;
  }
};

// Reviews Service
export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const response = await apiClient.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for listing
  getListingReviews: async (listingId, params = {}) => {
    const response = await apiClient.get(`/reviews/listing/${listingId}`, { params });
    return response.data;
  },

  // Get reviews for farmer
  getFarmerReviews: async (farmerId, params = {}) => {
    const response = await apiClient.get(`/reviews/farmer/${farmerId}`, { params });
    return response.data;
  },

  // Update review
  updateReview: async (id, reviewData) => {
    const response = await apiClient.put(`/reviews/${id}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (id) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (params = {}) => {
    const response = await apiClient.get('/reviews/my-reviews', { params });
    return response.data;
  }
};

// Notifications Service
export const notificationService = {
  // Get user notifications
  getUserNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllNotificationsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await apiClient.get('/notifications/stats');
    return response.data;
  }
};

// Market Trends Service
export const marketTrendsService = {
  // Get price trends
  getPriceTrends: async (params = {}) => {
    const response = await apiClient.get('/market-trends/price-trends', { params });
    return response.data;
  },

  // Get market overview
  getMarketOverview: async (params = {}) => {
    const response = await apiClient.get('/market-trends/overview', { params });
    return response.data;
  },

  // Get seasonal insights
  getSeasonalInsights: async (params = {}) => {
    const response = await apiClient.get('/market-trends/seasonal', { params });
    return response.data;
  },

  // Get market comparison
  getMarketComparison: async (params = {}) => {
    const response = await apiClient.get('/market-trends/comparison', { params });
    return response.data;
  },

  // Get popular produce
  getPopularProduce: async (params = {}) => {
    const response = await apiClient.get('/market-trends/popular-produce', { params });
    return response.data;
  }
};

// Dashboard Service
export const dashboardService = {
  // Get buyer dashboard
  getBuyerDashboard: async () => {
    const response = await apiClient.get('/dashboard/buyer');
    return response.data;
  },

  // Get farmer dashboard
  getFarmerDashboard: async () => {
    const response = await apiClient.get('/dashboard/farmer');
    return response.data;
  },

  // Get admin dashboard
  getAdminDashboard: async () => {
    const response = await apiClient.get('/dashboard/admin');
    return response.data;
  },

  // Get analytics data
  getAnalyticsData: async (params = {}) => {
    const response = await apiClient.get('/dashboard/analytics', { params });
    return response.data;
  }
};

// Farmer Service
export const farmerService = {
  // Get farmer metrics
  getFarmerMetrics: async () => {
    const response = await apiClient.get('/farmers/metrics');
    return response.data;
  },

  // Get farmer activity
  getFarmerActivity: async (params = {}) => {
    const response = await apiClient.get('/farmers/activity', { params });
    return response.data;
  },

  // Get farmer listings
  getFarmerListings: async (params = {}) => {
    const response = await apiClient.get('/farmers/listings', { params });
    return response.data;
  },

  // Create farmer listing
  createFarmerListing: async (listingData) => {
    const response = await apiClient.post('/farmers/listings', listingData);
    return response.data;
  },

  // Update farmer listing
  updateFarmerListing: async (id, listingData) => {
    const response = await apiClient.put(`/farmers/listings/${id}`, listingData);
    return response.data;
  },

  // Update listing status
  updateListingStatus: async (id, status) => {
    const response = await apiClient.patch(`/farmers/listings/${id}/status`, { status });
    return response.data;
  },

  // Get farmer orders
  getFarmerOrders: async (params = {}) => {
    const response = await apiClient.get('/farmers/orders', { params });
    return response.data;
  },

  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/farmers/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Add image to listing
  addListingImage: async (listingId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/farmers/listings/${listingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Search Service
export const searchService = {
  // Search listings
  searchListings: async (params = {}) => {
    const response = await apiClient.get('/search/listings', { params });
    return response.data;
  },

  // Search farmers
  searchFarmers: async (params = {}) => {
    const response = await apiClient.get('/search/farmers', { params });
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (params = {}) => {
    const response = await apiClient.get('/search/suggestions', { params });
    return response.data;
  },

  // Get popular searches
  getPopularSearches: async (params = {}) => {
    const response = await apiClient.get('/search/popular', { params });
    return response.data;
  }
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status,
      details: error.response.data?.details
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0
    };
  }
};

export default apiClient;
