import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import listingRoutes from "./listingRoutes.js";
import orderRoutes from "./orderRoutes.js";
import farmerRoutes from "./farmerRoutes.js";
import searchRoutes from "./searchRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import marketTrendsRoutes from "./marketTrendsRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/farmers', farmerRoutes);
router.use('/search', searchRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/market-trends', marketTrendsRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Ethio-Farmers-Shop API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;

