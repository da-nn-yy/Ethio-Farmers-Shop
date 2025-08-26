import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Products API
export const productsAPI = {
  search: (params) => api.get('/products/search', { params }),
  getCategories: () => api.get('/products/categories'),
  getFeatured: () => api.get('/products/featured'),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getFarmerListings: () => api.get('/products/farmer/my-listings'),
  getFavorites: () => api.get('/products/favorites'),
  toggleFavorite: (id) => api.post(`/products/${id}/favorite`),
  addReview: (id, reviewData) => api.post(`/products/${id}/review`, reviewData),
};

// Orders API
export const ordersAPI = {
  getCart: () => api.get('/orders/cart'),
  addToCart: (productId, quantity) => api.post('/orders/cart/add', { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/orders/cart/update/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/orders/cart/remove/${itemId}`),
  clearCart: () => api.delete('/orders/cart/clear'),
  createOrder: (orderData) => api.post('/orders/checkout', orderData),
  getUserOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getFarmerOrders: () => api.get('/orders/farmer/orders'),
  updateFarmerOrderStatus: (id, status) => api.put(`/orders/farmer/${id}/status`, { status }),
};

export default api;
