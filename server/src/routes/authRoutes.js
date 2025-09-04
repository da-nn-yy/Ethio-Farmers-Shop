import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  syncUser,
  registerUser,
  devLogin,
  getUserProfile
} from "../controllers/authController.js";

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/dev-login', devLogin);

// Protected routes
router.post('/sync', authGuard, syncUser);
router.get('/profile', authGuard, getUserProfile);

export default router;
