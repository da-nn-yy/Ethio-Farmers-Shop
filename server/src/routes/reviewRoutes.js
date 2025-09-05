import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  createReview,
  getListingReviews,
  getFarmerReviews,
  updateReview,
  deleteReview,
  getUserReviews,
  getReviewStats
} from "../controllers/reviewController.js";

const router = Router();

// Public routes (no authentication required)
router.get('/listing/:listingId', getListingReviews);
router.get('/farmer/:farmerId', getFarmerReviews);

// Protected routes (authentication required)
router.use(authGuard);

// Review management
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// User-specific routes
router.get('/my-reviews', getUserReviews);

// Admin routes
router.get('/stats', getReviewStats);

export default router;


