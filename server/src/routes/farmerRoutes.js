import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getFarmerMetrics,
  getFarmerListings,
  getFarmerOrders,
  getFarmerRecentActivity,
  createFarmerListing
} from "../controllers/farmerController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Get farmer dashboard metrics (active listings, pending orders, earnings, reviews)
router.get('/farmer/metrics', getFarmerMetrics);

// Get farmer's active produce listings
router.get('/farmer/listings', getFarmerListings);

// Get farmer's orders (pending, confirmed, completed)
router.get('/farmer/orders', getFarmerOrders);

// Get recent activity feed for farmer
router.get('/farmer/activity', getFarmerRecentActivity);

// Create new produce listing
router.post('/farmer/listings', createFarmerListing);

export default router;
