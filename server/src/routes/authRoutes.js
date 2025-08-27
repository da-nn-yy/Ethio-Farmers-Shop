import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { syncUser } from "../controllers/authController.js";

const router = Router();

router.post('/auth/sync', authGuard, syncUser);

export default router;
