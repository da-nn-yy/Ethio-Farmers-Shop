import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  searchListings,
  searchFarmers,
  getSearchSuggestions,
  getPopularSearches,
  getSearchAnalytics
} from "../controllers/searchController.js";

const router = Router();

// Public search routes (no authentication required)
router.get('/listings', searchListings);
router.get('/farmers', searchFarmers);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

// Admin-only search analytics (requires authentication)
router.get('/analytics', authGuard, getSearchAnalytics);

export default router;


