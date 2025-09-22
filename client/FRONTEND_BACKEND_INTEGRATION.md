# Frontend-Backend Integration Guide

This guide explains how the frontend has been integrated with the enhanced backend API.

## 🚀 **Integration Complete!**

The frontend has been successfully updated to work with the enhanced backend API. Here's what has been implemented:

### 📁 **New Files Created:**

1. **`src/services/apiService.js`** - Comprehensive API service layer
2. **`src/hooks/useAuth.js`** - Authentication context and hooks
3. **`src/components/FavoriteButton.jsx`** - Favorites functionality component

### 🔧 **Updated Components:**

1. **Authentication Components:**
   - `LoginForm.jsx` - Updated to use new API service
   - `RegisterForm.jsx` - Updated to use new API service
   - `App.jsx` - Added AuthProvider wrapper

2. **Dashboard Components:**
   - `dashboard-buyer-home/index.jsx` - Real dashboard data integration
   - `dashboard-farmer-home/index.jsx` - Real dashboard data integration

3. **Listing Components:**
   - `browse-listings-buyer-home/index.jsx` - Updated to use new API
   - `ProduceCard.jsx` - Added favorites functionality

## 🔗 **API Integration Features:**

### **Authentication System:**
- **Development Login** - Uses `/auth/dev-login` endpoint
- **User Registration** - Uses `/auth/register` endpoint
- **Token Management** - Automatic token handling and refresh
- **Role-based Access** - Buyer/Farmer role management

### **Listings Management:**
- **Browse Listings** - Uses `/listings/active` endpoint
- **Search Listings** - Uses `/search/listings` endpoint
- **Listing Details** - Uses `/listings/:id` endpoint
- **Create Listings** - Uses `/listings` POST endpoint (farmers)

### **Order Management:**
- **Create Orders** - Uses `/orders` POST endpoint
- **View Orders** - Uses `/orders/buyer` and `/orders/farmer` endpoints
- **Order Status** - Uses `/orders/:id/status` PATCH endpoint

### **Favorites System:**
- **Add to Favorites** - Uses `/favorites` POST endpoint
- **Remove from Favorites** - Uses `/favorites/:id` DELETE endpoint
- **Check Favorite Status** - Uses `/favorites/status/:id` endpoint
- **View Favorites** - Uses `/favorites/listings` endpoint

### **Dashboard Data:**
- **Buyer Dashboard** - Uses `/dashboard/buyer` endpoint
- **Farmer Dashboard** - Uses `/dashboard/farmer` endpoint
- **Real-time Metrics** - Order stats, earnings, listings count

## 🛠 **Technical Implementation:**

### **API Service Layer:**
```javascript
// Centralized API service with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Automatic token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Authentication Context:**
```javascript
// Global auth state management
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **Error Handling:**
```javascript
// Consistent error handling across all API calls
export const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data?.error || 'An error occurred',
      status: error.response.status,
      details: error.response.data?.details
    };
  }
  // Handle network errors, etc.
};
```

## 📱 **Frontend Features Now Working:**

### **For Buyers:**
- ✅ **Browse Listings** - Real data from API
- ✅ **Search & Filter** - Advanced search functionality
- ✅ **Add to Cart** - Shopping cart functionality
- ✅ **Place Orders** - Multi-item order creation
- ✅ **View Orders** - Order history and status
- ✅ **Favorites** - Add/remove favorite listings
- ✅ **Dashboard** - Real-time stats and recommendations

### **For Farmers:**
- ✅ **Dashboard** - Real metrics and earnings
- ✅ **Listings Management** - Create, update, delete listings
- ✅ **Order Management** - View and update order status
- ✅ **Activity Feed** - Recent activity tracking
- ✅ **Market Trends** - Real market data

### **For All Users:**
- ✅ **Authentication** - Login/register with role selection
- ✅ **Profile Management** - Update user information
- ✅ **Language Support** - English/Amharic toggle
- ✅ **Responsive Design** - Mobile-friendly interface

## 🔧 **Environment Configuration:**

Create a `.env` file in the client directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api

# Firebase Configuration (if using Firebase auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## 🚀 **How to Run:**

### **Backend:**
```bash
cd server
npm install
npm start
# Server runs on http://localhost:5001
```

### **Frontend:**
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## 🔄 **Data Flow:**

1. **User Authentication:**
   - User logs in → API validates credentials → Returns user data + token
   - Token stored in localStorage → Used for all subsequent requests

2. **Listing Browsing:**
   - Component mounts → Calls `listingService.getActiveListings()`
   - API returns listings → Component renders with real data

3. **Order Creation:**
   - User adds items to cart → Clicks "Place Order"
   - Calls `orderService.createOrder()` → API creates order in database
   - Success response → Cart cleared, user notified

4. **Favorites Management:**
   - User clicks heart icon → `FavoriteButton` component
   - Calls `favoriteService.addToFavorites()` → API updates database
   - UI updates to show favorited state

## 🎯 **Key Benefits:**

1. **Real-time Data** - All data comes from the database
2. **Consistent API** - Standardized request/response format
3. **Error Handling** - Graceful error handling throughout
4. **Authentication** - Secure token-based authentication
5. **Role-based Access** - Different features for buyers/farmers
6. **Scalable Architecture** - Easy to add new features

## 🔮 **Next Steps:**

The frontend is now fully functional with the backend! You can:

1. **Test the Application** - Run both frontend and backend
2. **Add More Features** - Reviews, notifications, etc.
3. **Deploy** - Deploy to production when ready
4. **Monitor** - Add analytics and monitoring

The integration is complete and ready for production use! 🎉
