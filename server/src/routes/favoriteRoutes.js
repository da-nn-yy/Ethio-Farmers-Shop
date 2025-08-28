import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { listFavorites, addFavorite, removeFavorite, listFavoriteFarmers } from "../controllers/favoriteController.js";

const router = Router();

router.get('/favorites', authGuard, listFavorites);
router.get('/favorites/farmers', authGuard, listFavoriteFarmers);
router.post('/favorites', authGuard, addFavorite);
router.delete('/favorites/:listingId', authGuard, removeFavorite);

export default router;

