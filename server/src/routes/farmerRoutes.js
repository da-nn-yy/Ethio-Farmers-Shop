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
  uploadImage,
  addListingImage
} from "../controllers/farmerController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Get farmer dashboard metrics (active listings, pending orders, earnings, reviews)
router.get('/metrics', getFarmerMetrics);

// Get farmer's active produce listings
router.get('/listings', getFarmerListings);

// Get farmer's orders (pending, confirmed, completed)
router.get('/orders', getFarmerOrders);

// Get recent activity feed for farmer
router.get('/activity', getFarmerRecentActivity);

// Create new produce listing
router.post('/listings', createFarmerListing);

// Update existing produce listing
router.put('/listings/:id', updateFarmerListing);

// Update listing status
router.patch('/listings/:id/status', updateListingStatus);

// Upload image
router.post('/upload-image', upload.single('image'), handleUploadError, uploadImage);

// Attach image to a specific listing (file or JSON url)
router.post('/listings/:id/images', upload.single('image'), handleUploadError, addListingImage);

export default router;
