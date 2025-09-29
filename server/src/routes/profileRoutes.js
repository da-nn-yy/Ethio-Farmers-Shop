import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { getUnifiedProfile, updateUnifiedProfile } from "../controllers/profileController.js";

const router = Router();

router.use(authGuard);

router.get('/', getUnifiedProfile);
router.put('/', updateUnifiedProfile);

export default router;

