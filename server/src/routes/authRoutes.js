import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  syncUser,
  registerUser,
  getUserProfile
} from "../controllers/authController.js";

const router = Router();

// Public routes
router.post('/register', registerUser);
// router.post('/dev-login', devLogin); // removed: dev auth

// Protected routes
router.post('/sync', authGuard, syncUser);
router.get('/profile', authGuard, getUserProfile);

export default router;
