import { Router } from "express";
import { authGuard } from "../src/middleware/auth.js";
import { upsertUser, getMe, updateMe } from "../src/controllers/userController.js";

const router = Router();

router.post('/users', authGuard, upsertUser);
router.get('/users/me', authGuard, getMe);
router.put('/users/me', authGuard, updateMe);

export default router;
