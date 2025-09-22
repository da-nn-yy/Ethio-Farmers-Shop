import { Router } from "express";
import { healthCheck, schemaCheck } from "../controllers/healthController.js";

const router = Router();

// Health check routes (no auth required)
router.get('/health', healthCheck);
router.get('/schema', schemaCheck);

export default router;
