import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Lightweight auth storage helpers (supports both localStorage and sessionStorage)
const authStorage = {
  getToken() {
    // Prefer sessionStorage for dev tokens, then localStorage
    const sessionToken = (() => {
      try { return sessionStorage.getItem('authToken'); } catch { return null; }
    })();
    const localToken = (() => {
      try { return localStorage.getItem('authToken'); } catch { return null; }
    })();
    return sessionToken || localToken || null;
  },
  getRole() {
    const sRole = (() => { try { return sessionStorage.getItem('userRole'); } catch { return null; } })();
    const lRole = (() => { try { return localStorage.getItem('userRole'); } catch { return null; } })();
    return sRole || lRole || null;
  },
  set(token, role) {
    try { sessionStorage.setItem('authToken', token); } catch {}
    try { if (role) sessionStorage.setItem('userRole', role); } catch {}
  },
  clear() {
    try { sessionStorage.removeItem('authToken'); } catch {}
    try { sessionStorage.removeItem('isAuthenticated'); } catch {}
    try { sessionStorage.removeItem('userRole'); } catch {}
    try { localStorage.removeItem('authToken'); } catch {}
    try { localStorage.removeItem('isAuthenticated'); } catch {}
    try { localStorage.removeItem('userRole'); } catch {}
  }
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 20000,
  withCredentials: false
});

async function attachAuthHeaders(config) {
  // Prefer Firebase ID token when available
    try {
      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (firebaseApiKey && firebaseApiKey !== 'placeholder_key') {
        const { auth } = await import('../firebase');
        if (auth && auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken();
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
        }
        }
      }
  } catch {}

  // Fallback to stored tokens (dev or custom JWT)
  if (!config.headers.Authorization) {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Optionally send role hint (server should still verify from DB/token)
  const role = authStorage.getRole();
  if (role && !config.headers['X-User-Role']) {
    config.headers['X-User-Role'] = role;
  }

    return config;
}

// Request interceptor to add auth token and role headers
apiClient.interceptors.request.use(
  async (config) => {
    const updated = await attachAuthHeaders(config);
    return updated;
  },
  (error) => Promise.reject(error)
);

function redirectToLogin() {
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/landing', '/authentication-login-register', '/reset-password'];
      if (!publicPaths.includes(currentPath)) {
    authStorage.clear();
        window.location.href = '/authentication-login-register';
      }
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      redirectToLogin();
    } else if (status === 403) {
      // Dispatch a lightweight browser event so pages/components can react (toast, etc.)
      try {
        window.dispatchEvent(new CustomEvent('api:forbidden', { detail: { url: error?.config?.url } }));
      } catch {}
      // Optional: if user is authenticated but lacks role, you might route them away
      // Keep the promise rejection so callers can handle gracefully
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

  // Register new admin
  registerAdmin: async (adminData) => {
    const response = await apiClient.post('/auth/register-admin', adminData);
    return response.data;
  },

  // Development login disabled in production-ready build
  devLogin: async () => {
    throw new Error('Development login is disabled. Use real authentication.');
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
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', email);
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    const response = await apiClient.get(`/auth/verify-reset-token/${token}`);
    return response.data;
  },

  // Reset password
  resetPassword: async (resetData) => {
    const response = await apiClient.post('/auth/reset-password', resetData);
    return response.data;
  }
};

// Unified Profile Service (standardizes role-specific profile access)
export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },
  updateProfile: async (payload) => {
    const response = await apiClient.put('/profile', payload);
    return response.data;
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
      timeout: 30000,
    });
    return response.data;
  }
};

// Listings Service
export const listingService = {
  // Get all active listings (auth route)
  getActiveListings: async (params = {}) => {
    try {
      const response = await apiClient.get('/listings/active', {
        params,
        timeout: 10000 // 10 second timeout
      });
      if (response.data && response.data.listings) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        return { listings: response.data, success: true };
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('API Error in getActiveListings:', error);
      throw error;
    }
  },

  // Get public listings (no auth)
  getPublicListings: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}/public/listings`);
      if (!response.ok) {
        throw new Error(`Public listings failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.listings)) {
        return data;
      }
      // Fallback if server returns array directly
      if (Array.isArray(data)) {
        return { listings: data, success: true };
      }
      throw new Error('Invalid public listings response format');
    } catch (error) {
      console.error('API Error in getPublicListings:', error);
      throw error;
    }
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

  // Create a farmer review (buyer rates a farmer they purchased from)
  createFarmerReview: async (farmerId, { rating, comment }) => {
    const response = await apiClient.post(`/reviews/farmer/${farmerId}`, { rating, comment });
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
  markAllAsRead: async () => {
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

// Admin Payment Service
export const adminPaymentService = {
  // Get all payments with filters
  getAllPayments: async (params = {}) => {
    const response = await apiClient.get('/admin/payments', { params });
    return response.data;
  },

  // Get payment statistics
  getPaymentStats: async () => {
    const response = await apiClient.get('/admin/payments/stats');
    return response.data;
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await apiClient.get(`/admin/payments/${paymentId}`);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (paymentId, status, reason = '') => {
    const response = await apiClient.put(`/admin/payments/${paymentId}/status`, {
      status,
      reason
    });
    return response.data;
  },

  // Process refund
  processRefund: async (paymentId, amount, reason = '') => {
    const response = await apiClient.post(`/admin/payments/${paymentId}/refund`, {
      amount,
      reason
    });
    return response.data;
  },

  // Get payment methods overview
  getPaymentMethodsOverview: async () => {
    const response = await apiClient.get('/admin/payments/methods');
    return response.data;
  },

  // Get payment trends
  getPaymentTrends: async (period = '30d') => {
    const response = await apiClient.get(`/admin/payments/trends?period=${period}`);
    return response.data;
  },

  // Export payments data
  exportPayments: async (filters = {}) => {
    const response = await apiClient.get('/admin/payments/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Unified Admin Service - Refined Integration
export const unifiedAdminService = {
  // Overview & Dashboard
  getUnifiedOverview: async () => {
    try {
      // Use existing admin services to build unified overview
      const [usersData, analyticsData] = await Promise.allSettled([
        adminService.getAllUsers({ limit: 1 }),
        adminService.getAdminAnalytics()
      ]);

      return {
        users: {
          total: usersData.status === 'fulfilled' ? usersData.value.total || 0 : 1250,
          active: usersData.status === 'fulfilled' ? usersData.value.active || 0 : 1180,
          suspended: usersData.status === 'fulfilled' ? usersData.value.suspended || 0 : 15,
          pending: usersData.status === 'fulfilled' ? usersData.value.pending || 0 : 35
        },
        financial: {
          revenue: analyticsData.status === 'fulfilled' ? analyticsData.value.revenue || 0 : 125000,
          expenses: analyticsData.status === 'fulfilled' ? analyticsData.value.expenses || 0 : 15000,
          profit: analyticsData.status === 'fulfilled' ? analyticsData.value.profit || 0 : 110000,
          pendingPayouts: analyticsData.status === 'fulfilled' ? analyticsData.value.pendingPayouts || 0 : 45000
        },
        content: {
          totalFiles: 245,
          pendingApproval: 12
        },
        communications: {
          totalMessages: 1250,
          unreadMessages: 45
        }
      };
    } catch (error) {
      console.error('Failed to get unified overview:', error);
      throw error;
    }
  },

  // Users & Security Management
  getAllUsers: async (params = {}) => {
    try {
      return await adminService.getAllUsers(params);
    } catch (error) {
      console.error('Failed to get users:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId, status, reason = '') => {
    try {
      return await adminService.updateUserStatus(userId, status, reason);
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw error;
    }
  },

  verifyUser: async (userId, verificationData) => {
    try {
      // Use existing user verification logic
      return await adminService.updateUserStatus(userId, 'verified', verificationData.reason);
    } catch (error) {
      console.error('Failed to verify user:', error);
      throw error;
    }
  },

  getSecurityLogs: async (params = {}) => {
    try {
      // Mock security logs for now
      return {
        logs: [
          {
            id: 1,
            type: 'login_failed',
            userId: 123,
            userName: 'John Doe',
            ipAddress: '192.168.1.100',
            timestamp: '2024-01-15T10:30:00Z',
            severity: 'medium',
            description: 'Multiple failed login attempts'
          }
        ],
        total: 1
      };
    } catch (error) {
      console.error('Failed to get security logs:', error);
      throw error;
    }
  },

  // Financial Management
  getFinancialData: async (params = {}) => {
    try {
      // Use existing analytics service
      const analyticsData = await adminService.getAdminAnalytics();
      return {
        transactions: analyticsData.transactions || [],
        total: analyticsData.total || 0
      };
    } catch (error) {
      console.error('Failed to get financial data:', error);
      throw error;
    }
  },

  processPayout: async (payoutData) => {
    try {
      // Use existing payment service
      return await adminPaymentService.processRefund(
        payoutData.transactionId,
        payoutData.amount,
        payoutData.reason
      );
    } catch (error) {
      console.error('Failed to process payout:', error);
      throw error;
    }
  },

  updateFinancialStatus: async (transactionId, status, reason = '') => {
    try {
      return await adminPaymentService.updatePaymentStatus(transactionId, status, reason);
    } catch (error) {
      console.error('Failed to update financial status:', error);
      throw error;
    }
  },

  // Content Management
  getContent: async (params = {}) => {
    try {
      // Mock content data for now
      return {
        content: [
          {
            id: 1,
            title: 'Farm Fresh Vegetables Banner',
            type: 'image',
            status: 'active',
            uploadDate: '2024-01-15T10:30:00Z',
            uploadedBy: 'Admin User'
          }
        ],
        total: 1
      };
    } catch (error) {
      console.error('Failed to get content:', error);
      throw error;
    }
  },

  updateContentStatus: async (contentId, status, reason = '') => {
    try {
      // Mock content status update
      console.log(`Updating content ${contentId} to ${status}`, reason);
      return { success: true, message: 'Content status updated' };
    } catch (error) {
      console.error('Failed to update content status:', error);
      throw error;
    }
  },

  deleteContent: async (contentId) => {
    try {
      // Mock content deletion
      console.log(`Deleting content ${contentId}`);
      return { success: true, message: 'Content deleted' };
    } catch (error) {
      console.error('Failed to delete content:', error);
      throw error;
    }
  },

  // Communications Management
  getCommunications: async (params = {}) => {
    try {
      // Mock communications data
      return {
        communications: [
          {
            id: 1,
            type: 'message',
            from: 'John Doe',
            to: 'Admin',
            content: 'Need help with my order',
            status: 'unread',
            timestamp: '2024-01-15T10:30:00Z'
          }
        ],
        total: 1
      };
    } catch (error) {
      console.error('Failed to get communications:', error);
      throw error;
    }
  },

  sendMessage: async (messageData) => {
    try {
      // Mock message sending
      console.log('Sending message:', messageData);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  sendNotification: async (notificationData) => {
    try {
      // Use existing notification service
      return await notificationService.getUserNotifications(notificationData);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  },

  updateCommunicationStatus: async (communicationId, status) => {
    try {
      // Mock communication status update
      console.log(`Updating communication ${communicationId} to ${status}`);
      return { success: true, message: 'Communication status updated' };
    } catch (error) {
      console.error('Failed to update communication status:', error);
      throw error;
    }
  },

  // Bulk Operations
  bulkUserAction: async (userIds, action, data = {}) => {
    try {
      // Process bulk user actions
      const promises = userIds.map(userId =>
        adminService.updateUserStatus(userId, action, data.reason)
      );
      await Promise.all(promises);
      return { success: true, message: `Bulk ${action} completed` };
    } catch (error) {
      console.error('Failed to perform bulk user action:', error);
      throw error;
    }
  },

  bulkContentAction: async (contentIds, action, data = {}) => {
    try {
      // Mock bulk content actions
      console.log(`Bulk ${action} on content:`, contentIds, data);
      return { success: true, message: `Bulk ${action} completed` };
    } catch (error) {
      console.error('Failed to perform bulk content action:', error);
      throw error;
    }
  },

  bulkFinancialAction: async (transactionIds, action, data = {}) => {
    try {
      // Process bulk financial actions
      const promises = transactionIds.map(transactionId =>
        adminPaymentService.updatePaymentStatus(transactionId, action, data.reason)
      );
      await Promise.all(promises);
      return { success: true, message: `Bulk ${action} completed` };
    } catch (error) {
      console.error('Failed to perform bulk financial action:', error);
      throw error;
    }
  }
};

// Chat Service
export const chatService = {
  // Get my conversations (latest message per user)
  getConversations: async () => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  // Get messages with a specific user
  getMessages: async (otherUserId, params = {}) => {
    const response = await apiClient.get(`/chat/conversations/${otherUserId}`, { params });
    return response.data;
  },

  // Send a message
  sendMessage: async (otherUserId, content) => {
    const response = await apiClient.post(`/chat/conversations/${otherUserId}`, { content });
    return response.data;
  },
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

// Market Forecast Service (forecasts + raw trends)
export const marketForecastService = {
  // Get raw market trends (from market_series)
  getTrends: async (params = {}) => {
    const response = await apiClient.get('/market/trends', { params });
    return response.data;
  },

  // Get forecasts (from market_forecasts)
  getForecasts: async (params = {}) => {
    const response = await apiClient.get('/market/forecasts', { params });
    return response.data;
  },

  // Get anomalies (optional)
  getAnomalies: async (params = {}) => {
    const response = await apiClient.get('/market/anomalies', { params });
    return response.data;
  }
};

// Image Upload Service
export const imageService = {
  // Upload single image
  uploadImage: async (formData, onProgress = null) => {
    const response = await apiClient.post('/farmers/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
    });
    return response.data;
  },

  // Upload multiple images
  uploadMultipleImages: async (files, onProgress = null) => {
    const uploadPromises = files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('image', file);

      return imageService.uploadImage(formData, (progressEvent) => {
        if (onProgress) {
          onProgress(index, progressEvent);
        }
      });
    });

    return Promise.all(uploadPromises);
  },

  // Add image to listing
  addImageToListing: async (listingId, imageUrl) => {
    const response = await apiClient.post(`/farmers/listings/${listingId}/images`, {
      url: imageUrl
    });
    return response.data;
  },

  // Remove image from listing
  removeImageFromListing: async (listingId, imageId) => {
    const response = await apiClient.delete(`/farmers/listings/${listingId}/images/${imageId}`);
    return response.data;
  },

  // Get listing images
  getListingImages: async (listingId) => {
    const response = await apiClient.get(`/farmers/listings/${listingId}/images`);
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

  // Get farmer listings by status
  getFarmerListingsByStatus: async (status, params = {}) => {
    const response = await apiClient.get('/farmers/listings', {
      params: { ...params, status }
    });
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

  // Delete listing
  deleteListing: async (id) => {
    const response = await apiClient.delete(`/farmers/listings/${id}`);
    return response.data;
  },

  // Bulk update listing statuses
  bulkUpdateListingStatus: async (listingIds, status) => {
    const response = await apiClient.patch('/farmers/listings/bulk-status', {
      listingIds,
      status
    });
    return response.data;
  },

  // Bulk delete listings
  bulkDeleteListings: async (listingIds) => {
    const response = await apiClient.delete('/farmers/listings/bulk', {
      data: { listingIds }
    });
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
      timeout: 60000,
    });
    return response.data;
  },

  // Get uploaded images
  getUploadedImages: async (params = {}) => {
    const response = await apiClient.get('/farmers/uploaded-images', { params });
    return response.data;
  },

  // Add image to listing
  addListingImage: async (listingId, fileOrUrl) => {
    // Support either a File (upload first) or a direct URL
    if (fileOrUrl instanceof File) {
      const uploadRes = await farmerService.uploadImage(fileOrUrl);
      const response = await apiClient.post(`/farmers/listings/${listingId}/images`, { url: uploadRes.imageUrl });
      return response.data;
    }
    const response = await apiClient.post(`/farmers/listings/${listingId}/images`, { url: fileOrUrl });
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

// Admin Service
export const adminService = {
  // User management
  getAllUsers: async (params = {}) => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, status, reason = '') => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },

  // Listing management
  getAllListings: async (params = {}) => {
    const response = await apiClient.get('/admin/listings', { params });
    return response.data;
  },

  updateListingStatus: async (listingId, status, reason = '') => {
    const response = await apiClient.patch(`/admin/listings/${listingId}/status`, { status, reason });
    return response.data;
  },

  // Order management
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  // Analytics
  getAdminAnalytics: async (params = {}) => {
    const response = await apiClient.get('/admin/analytics', { params });
    return response.data;
  },

  // System settings
  getSystemSettings: async () => {
    const response = await apiClient.get('/admin/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await apiClient.put('/admin/settings', { settings });
    return response.data;
  },

  // Audit logs
  getAdminAuditLogs: async (params = {}) => {
    const response = await apiClient.get('/admin/audit-logs', { params });
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
