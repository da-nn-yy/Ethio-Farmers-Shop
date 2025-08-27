import { Router } from "express";
import { authGuard } from "../src/middleware/auth.js";
import { syncUser } from "../src/controllers/authController.js";

const router = Router();

router.post('/auth/sync', authGuard, syncUser);

export default router;
