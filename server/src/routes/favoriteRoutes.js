import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  addToFavorites,
  removeFromFavorites,
  getFavoriteListings,
  checkFavoriteStatus,
  getFavoriteFarmers,
  getFavoriteStats,
  bulkUpdateFavorites
} from "../controllers/favoriteController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Favorite management
router.post('/', addToFavorites);
router.delete('/:listingId', removeFromFavorites);
router.get('/listings', getFavoriteListings);
router.get('/farmers', getFavoriteFarmers);
router.get('/stats', getFavoriteStats);
router.get('/status/:listingId', checkFavoriteStatus);

// Bulk operations
router.post('/bulk', bulkUpdateFavorites);

export default router;
