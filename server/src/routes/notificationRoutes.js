import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  getNotificationStats,
  createSystemNotification
} from "../controllers/notificationController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// User notification management
router.get('/', getUserNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);
router.delete('/:id', deleteNotification);
router.get('/stats', getNotificationStats);

// System notification creation (admin only)
router.post('/system', createSystemNotification);

// Create notification (for internal use)
router.post('/', createNotification);

export default router;

