import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getBuyerDashboard,
  getFarmerDashboard,
  getAdminDashboard,
  getAnalyticsData
} from "../controllers/dashboardController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Dashboard routes
router.get('/buyer', getBuyerDashboard);
router.get('/farmer', getFarmerDashboard);
router.get('/admin', getAdminDashboard);

// Analytics data for charts
router.get('/analytics', getAnalyticsData);

export default router;


