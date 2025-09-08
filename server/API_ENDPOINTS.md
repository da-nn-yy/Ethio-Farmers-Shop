# Ethio-Farmers-Shop API Endpoints

This document provides a comprehensive list of all available API endpoints for the Ethio-Farmers-Shop application.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the Firebase token in the Authorization header:
```
Authorization: Bearer <firebase-token>
```

## API Endpoints

### 🔐 Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/dev-login` - Development login (for testing)
- `POST /auth/sync` - Sync user data (protected)
- `GET /auth/profile` - Get user profile (protected)

### 👤 Users (`/users`)
- `POST /users` - Create/update user (protected)
- `GET /users/me` - Get current user profile (protected)
- `PUT /users/me` - Update current user profile (protected)
- `POST /users/me/avatar` - Upload user avatar (protected)

### 🌾 Listings (`/listings`)
**Public Routes:**
- `GET /listings/active` - Get all active listings
- `GET /listings/search` - Search listings with filters
- `GET /listings/category/:category` - Get listings by category
- `GET /listings/region/:region` - Get listings by region
- `GET /listings/:id` - Get specific listing by ID

**Protected Routes:**
- `POST /listings` - Create new listing (farmers only)
- `GET /listings` - Get listings with filters (protected)
- `PUT /listings/:id` - Update listing (owner only)
- `DELETE /listings/:id` - Delete listing (owner only)
- `GET /listings/farmer/my-listings` - Get farmer's listings

### 📦 Orders (`/orders`)
All routes require authentication:
- `POST /orders` - Create new order (buyers only)
- `GET /orders/buyer` - Get buyer's orders
- `GET /orders/farmer` - Get farmer's orders
- `GET /orders/stats` - Get order statistics
- `GET /orders/:id` - Get specific order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/cancel` - Cancel order

### 👨‍🌾 Farmers (`/farmers`)
All routes require authentication:
- `GET /farmers/metrics` - Get farmer dashboard metrics
- `GET /farmers/activity` - Get recent activity
- `GET /farmers/listings` - Get farmer's listings
- `POST /farmers/listings` - Create new listing
- `PUT /farmers/listings/:id` - Update listing
- `PATCH /farmers/listings/:id/status` - Update listing status
- `GET /farmers/orders` - Get farmer's orders
- `POST /farmers/upload-image` - Upload image
- `POST /farmers/listings/:id/images` - Add image to listing

### 🔍 Search (`/search`)
**Public Routes:**
- `GET /search/listings` - Search listings
- `GET /search/farmers` - Search farmers
- `GET /search/suggestions` - Get search suggestions
- `GET /search/popular` - Get popular searches

**Protected Routes:**
- `GET /search/analytics` - Get search analytics (admin)

### ⭐ Reviews (`/reviews`)
**Public Routes:**
- `GET /reviews/listing/:listingId` - Get reviews for listing
- `GET /reviews/farmer/:farmerId` - Get reviews for farmer

**Protected Routes:**
- `POST /reviews` - Create review (buyers only)
- `PUT /reviews/:id` - Update review (owner only)
- `DELETE /reviews/:id` - Delete review (owner only)
- `GET /reviews/my-reviews` - Get user's reviews
- `GET /reviews/stats` - Get review statistics (admin)

### 🔔 Notifications (`/notifications`)
All routes require authentication:
- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/stats` - Get notification statistics
- `POST /notifications/system` - Create system notification (admin)
- `POST /notifications` - Create notification

### 📊 Market Trends (`/market-trends`)
**Public Routes:**
- `GET /market-trends/price-trends` - Get price trends
- `GET /market-trends/overview` - Get market overview
- `GET /market-trends/seasonal` - Get seasonal insights
- `GET /market-trends/comparison` - Get market comparison
- `GET /market-trends/popular-produce` - Get popular produce

**Protected Routes:**
- `POST /market-trends/price-data` - Add price data (admin)

### ❤️ Favorites (`/favorites`)
All routes require authentication:
- `POST /favorites` - Add to favorites
- `DELETE /favorites/:listingId` - Remove from favorites
- `GET /favorites/listings` - Get favorite listings
- `GET /favorites/farmers` - Get favorite farmers
- `GET /favorites/stats` - Get favorite statistics
- `GET /favorites/status/:listingId` - Check favorite status
- `POST /favorites/bulk` - Bulk update favorites

### 📈 Dashboard (`/dashboard`)
All routes require authentication:
- `GET /dashboard/buyer` - Get buyer dashboard
- `GET /dashboard/farmer` - Get farmer dashboard
- `GET /dashboard/admin` - Get admin dashboard
- `GET /dashboard/analytics` - Get analytics data

### 🏥 Health Check
- `GET /health` - API health check

## Request/Response Examples

### Create Order
```javascript
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "listingId": 1,
      "quantity": 5
    }
  ],
  "notes": "Please deliver fresh produce",
  "deliveryFee": 50
}
```

### Search Listings
```javascript
GET /api/search/listings?q=tomato&region=Addis%20Ababa&minPrice=10&maxPrice=50&page=1&limit=20
```

### Add to Favorites
```javascript
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": 1
}
```

## Error Responses
All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error


