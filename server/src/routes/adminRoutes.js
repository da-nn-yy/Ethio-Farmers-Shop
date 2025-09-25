import { Router } from "express";
import { authGuard, requireRole } from "../middleware/auth.js";
import {
  getAllUsers,
  updateUserStatus,
  getAllListings,
  updateListingStatus,
  getAllOrders,
  getAdminAnalytics,
  getSystemSettings,
  updateSystemSettings,
  getAdminAuditLogs
} from "../controllers/adminController.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(authGuard, requireRole('admin'));

// User management
router.get('/users', getAllUsers);
router.patch('/users/:userId/status', updateUserStatus);

// Listing management
router.get('/listings', getAllListings);
router.patch('/listings/:listingId/status', updateListingStatus);

// Order management
router.get('/orders', getAllOrders);

// Analytics
router.get('/analytics', getAdminAnalytics);

// System settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Audit logs
router.get('/audit-logs', getAdminAuditLogs);

export default router;
