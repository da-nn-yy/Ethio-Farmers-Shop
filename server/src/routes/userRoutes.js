import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { upsertUser, getMe, updateMe } from "../controllers/userController.js";

const router = Router();

router.post('/users', authGuard, upsertUser);
router.get('/users/me', authGuard, getMe);
router.put('/users/me', authGuard, updateMe);

export default router;
