import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import upload, { handleUploadError } from "../middleware/upload.js";
import {
  getFarmerProfile,
  updateFarmerProfile,
  getFarmerProfileStats,
  uploadCertification,
  getFarmerCertifications
} from "../controllers/farmerProfileController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Farmer profile routes
router.get('/profile', getFarmerProfile);
router.put('/profile', updateFarmerProfile);
router.get('/profile/stats', getFarmerProfileStats);

// Certification routes
router.post('/certifications', upload.single('certification_document'), handleUploadError, uploadCertification);
router.get('/certifications', getFarmerCertifications);

export default router;
