import { Router } from "express";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";

// Role-based routes
import adminRoutes from "./adminRoutes.js";
import farmerRoutes from "./farmerRoutes.js";
import buyerRoutes from "./buyerRoutes.js";

// Shared/Common routes (accessible to authenticated users)
import userRoutes from "./userRoutes.js";
import profileRoutes from "./profileRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import chatRoutes from "./chatRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import marketTrendsRoutes from "./marketTrendsRoutes.js";
import marketForecastRoutes from "./marketForecastRoutes.js";

// Public/General routes
import listingRoutes from "./listingRoutes.js";
import searchRoutes from "./searchRoutes.js";
import reviewRoutes from "./reviewRoutes.js";

const router = Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);

// Public listing browsing (no auth required)
router.use('/listings', listingRoutes);
router.use('/search', searchRoutes);

// Public review viewing (no auth required for GET)
router.use('/reviews', reviewRoutes);

// ============================================
// ROLE-BASED ROUTES (Role-specific endpoints)
// ============================================
router.use('/admin', adminRoutes);
router.use('/farmer', farmerRoutes);
// Backward-compatible alias (client expects /farmers/*)
router.use('/farmers', farmerRoutes);
router.use('/buyer', buyerRoutes);

// ============================================
// SHARED ROUTES (Any authenticated user)
// ============================================
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);
router.use('/market-trends', marketTrendsRoutes);
router.use('/market', marketForecastRoutes);

// ============================================
// LEGACY ROUTES (Backward compatibility)
// ============================================
// Keep old route paths for backward compatibility
import orderRoutes from "./orderRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import farmerProfileRoutes from "./farmerProfileRoutes.js";

router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/farmer-profile', farmerProfileRoutes);

// Legacy health check endpoint (redirects to new health system)
router.get('/health-legacy', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Ethio-Farmers-Shop API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
