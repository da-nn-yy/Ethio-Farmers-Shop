import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  syncUser,
  registerUser,
  devLogin,
  getUserProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword
} from "../controllers/authController.js";

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/dev-login', devLogin);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/sync', authGuard, syncUser);
router.get('/profile', authGuard, getUserProfile);

export default router;
