import { Router } from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import listingRoutes from "./listingRoutes.js";
import orderRoutes from "./orderRoutes.js";
import farmerRoutes from "./farmerRoutes.js";
import farmerProfileRoutes from "./farmerProfileRoutes.js";
import searchRoutes from "./searchRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import chatRoutes from "./chatRoutes.js";
import marketTrendsRoutes from "./marketTrendsRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import healthRoutes from "./healthRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import adminRoutes from "./adminRoutes.js";
import profileRoutes from "./profileRoutes.js";

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/orders', orderRoutes);
router.use('/farmers', farmerRoutes);
router.use('/farmer-profile', farmerProfileRoutes);
router.use('/search', searchRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/market-trends', marketTrendsRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/health', healthRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);

// Legacy health check endpoint (redirects to new health system)
router.get('/health-legacy', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Ethio-Farmers-Shop API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
