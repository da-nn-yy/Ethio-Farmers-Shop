import { Router } from "express";
import { authGuard, requireRole } from "../middleware/auth.js";
import upload, { handleUploadError, conditionalSingleUpload } from "../middleware/upload.js";
import {
  getFarmerMetrics,
  getFarmerListings,
  getFarmerOrders,
  getFarmerRecentActivity,
  createFarmerListing,
  updateFarmerListing,
  updateListingStatus,
  bulkUpdateListingStatus,
  bulkDeleteListings,
  uploadImage,
  addListingImage,
  deleteFarmerListing
} from "../controllers/farmerController.js";
import {
  getFarmerDashboard
} from "../controllers/dashboardController.js";
import {
  getFarmerProfile,
  updateFarmerProfile,
  getFarmerProfileStats,
  uploadCertification,
  getFarmerCertifications
} from "../controllers/farmerProfileController.js";
import {
  getFarmerReviews
} from "../controllers/reviewController.js";

const router = Router();

// All routes require authentication and farmer role
router.use(authGuard, requireRole('farmer'));

// Farmer Dashboard
router.get('/dashboard', getFarmerDashboard);

// Farmer dashboard and metrics
router.get('/metrics', getFarmerMetrics);
router.get('/activity', getFarmerRecentActivity);

// Farmer listings management
router.get('/listings', getFarmerListings);
router.post('/listings', createFarmerListing);
router.put('/listings/:id', updateFarmerListing);
router.delete('/listings/:id', deleteFarmerListing);
router.patch('/listings/:id/status', updateListingStatus);
router.patch('/listings/bulk-status', bulkUpdateListingStatus);
router.delete('/listings/bulk', bulkDeleteListings);

// Farmer orders
router.get('/orders', getFarmerOrders);

// Farmer Profile
router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.get('/profile/stats', getFarmerProfileStats);

// Farmer Certifications
router.post('/certifications', upload.single('certification_document'), handleUploadError, uploadCertification);
router.get('/certifications', getFarmerCertifications);

// Farmer Reviews
router.get('/reviews', getFarmerReviews);

// Image upload
router.post('/upload-image', upload.single('image'), handleUploadError, uploadImage);
// Accept either multipart (file) or JSON { url } for adding images
router.post('/listings/:id/images', conditionalSingleUpload('image'), handleUploadError, addListingImage);

// Debug endpoint to check images
router.get('/debug/images/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { pool } = await import('../config/database.js');

    const [images] = await pool.query(`
      SELECT id, listing_id, url, sort_order, created_at
      FROM listing_images
      WHERE listing_id = ?
      ORDER BY sort_order
    `, [listingId]);

    res.json({
      listingId,
      imageCount: images.length,
      images: images
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
