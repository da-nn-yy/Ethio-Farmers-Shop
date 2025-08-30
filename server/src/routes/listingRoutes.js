import { Router } from "express";
import {
  getAllActiveListings,
  getListingById,
  searchListings,
  getListingsByCategory,
  getListingsByRegion
} from "../controllers/listingController.js";

const router = Router();

// Get all active listings (for buyer dashboard)
router.get('/active', getAllActiveListings);

// Get listing by ID
router.get('/:id', getListingById);

// Search listings with filters
router.get('/search', searchListings);

// Get listings by category
router.get('/category/:category', getListingsByCategory);

// Get listings by region
router.get('/region/:region', getListingsByRegion);

export default router;
