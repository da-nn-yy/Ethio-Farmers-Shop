import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStats
} from "../controllers/orderController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Order management
router.post('/', createOrder);
router.get('/buyer', getBuyerOrders);
router.get('/farmer', getFarmerOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);

// Order status management
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

export default router;
