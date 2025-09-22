import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  getPriceTrends,
  getMarketOverview,
  getSeasonalInsights,
  getMarketComparison,
  getPopularProduce,
  addPriceData
} from "../controllers/marketTrendsController.js";

const router = Router();

// Public routes (no authentication required)
router.get('/price-trends', getPriceTrends);
router.get('/overview', getMarketOverview);
router.get('/seasonal', getSeasonalInsights);
router.get('/comparison', getMarketComparison);
router.get('/popular-produce', getPopularProduce);

// Admin-only routes (requires authentication)
router.post('/price-data', authGuard, addPriceData);

export default router;

