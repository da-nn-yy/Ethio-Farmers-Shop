import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { createListing, listListings, updateListing, deleteListing } from "../controllers/listingController.js";

const router = Router();

// Public: list/browse
router.get('/listings', listListings);

// Farmer protected: CRUD
router.post('/listings', authGuard, createListing);
router.put('/listings/:id', authGuard, updateListing);
router.delete('/listings/:id', authGuard, deleteListing);

export default router;

