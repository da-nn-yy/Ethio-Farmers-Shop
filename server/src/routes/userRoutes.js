import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { upsertUser, getMe, updateMe, uploadMyAvatar } from "../controllers/userController.js";
import upload, { handleUploadError } from "../middleware/upload.js";

const router = Router();

router.post('/users', authGuard, upsertUser);
router.get('/users/me', authGuard, getMe);
router.put('/users/me', authGuard, updateMe);
router.post('/users/me/avatar', authGuard, upload.single('image'), handleUploadError, uploadMyAvatar);

export default router;
