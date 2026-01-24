import { Router } from "express";
import {
  getMarketTrends,
  getMarketForecasts,
  getMarketAnomalies,
  runMarketBacktest
} from "../controllers/marketForecastController.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

// Public endpoints for trends/forecasts/anomalies
router.get("/trends", getMarketTrends);
router.get("/forecasts", getMarketForecasts);
router.get("/anomalies", getMarketAnomalies);

// Admin-only backtest; reuse auth middleware
router.post("/backtest", authGuard, runMarketBacktest);

export default router;
