import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import upload, { handleUploadError } from "../middleware/upload.js";
import {
  getFarmerMetrics,
  getFarmerListings,
  getFarmerOrders,
  getFarmerRecentActivity,
  createFarmerListing,
  updateFarmerListing,
  updateListingStatus,
  uploadImage
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

// Update existing produce listing
router.put('/farmer/listings/:id', updateFarmerListing);

// Update listing status
router.patch('/farmer/listings/:id/status', updateListingStatus);

// Upload image
router.post('/farmer/upload-image', authGuard, upload.single('image'), handleUploadError, uploadImage);

export default router;
