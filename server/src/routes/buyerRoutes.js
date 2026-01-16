import { Router } from "express";
import { authGuard, requireRole } from "../middleware/auth.js";
import {
  getBuyerOrders,
  createOrder,
  getOrderById,
  cancelOrder
} from "../controllers/orderController.js";
import {
  getFavoriteListings,
  addToFavorites,
  removeFromFavorites,
  checkFavoriteStatus,
  getFavoriteFarmers,
  getFavoriteStats
} from "../controllers/favoriteController.js";
import {
  createReview,
  getUserReviews,
  getListingReviews
} from "../controllers/reviewController.js";
import {
  getListings,
  getAllActiveListings,
  searchListings,
  getListingsByCategory,
  getListingsByRegion,
  getListingById
} from "../controllers/listingController.js";
import {
  getBuyerDashboard
} from "../controllers/dashboardController.js";

const router = Router();

// All routes require authentication and buyer role
router.use(authGuard, requireRole('buyer'));

// Buyer Dashboard
router.get('/dashboard', getBuyerDashboard);

// Buyer Orders
router.get('/orders', getBuyerOrders);
router.post('/orders', createOrder);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/cancel', cancelOrder);

// Buyer Favorites
router.get('/favorites/listings', getFavoriteListings);
router.get('/favorites/farmers', getFavoriteFarmers);
router.get('/favorites/stats', getFavoriteStats);
router.post('/favorites', addToFavorites);
router.delete('/favorites/:listingId', removeFromFavorites);
router.get('/favorites/status/:listingId', checkFavoriteStatus);

// Buyer Reviews
router.get('/reviews', getUserReviews);
router.post('/reviews', createReview);
router.get('/reviews/listing/:listingId', getListingReviews);

// Buyer Browse Listings (buyer-specific listing views)
router.get('/listings', getListings);
router.get('/listings/active', getAllActiveListings);
router.get('/listings/search', searchListings);
router.get('/listings/category/:category', getListingsByCategory);
router.get('/listings/region/:region', getListingsByRegion);
router.get('/listings/:id', getListingById);

export default router;
