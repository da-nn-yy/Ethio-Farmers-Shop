import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  upsertUser,
  getMe,
  updateMe,
  uploadMyAvatar,
  deleteUserAndData,
  deleteOrphanOrders,
  deleteAllUsersAndData
} from "../controllers/userController.js";
import upload, { handleUploadError } from "../middleware/upload.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// User management
router.post('/', upsertUser);
router.get('/me', getMe);
router.put('/me', updateMe);
router.post('/me/avatar', upload.single('image'), handleUploadError, uploadMyAvatar);

// Maintenance endpoints (protect appropriately in production)
router.delete('/:id', deleteUserAndData);
router.delete('/maintenance/orphan-orders', deleteOrphanOrders);
router.delete('/', deleteAllUsersAndData);

export default router;
