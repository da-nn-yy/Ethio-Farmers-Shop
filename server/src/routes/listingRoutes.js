import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { createListing, listListings, updateListing, deleteListing, getListingById } from "../controllers/listingController.js";

const router = Router();

// Public: list/browse
router.get('/listings', listListings);
router.get('/listings/:id', getListingById);

// Farmer protected: CRUD
router.post('/listings', authGuard, createListing);
router.put('/listings/:id', authGuard, updateListing);
router.delete('/listings/:id', authGuard, deleteListing);

export default router;

