import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import {
  createOrder,
  getBuyerOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = Router();

// All routes require authentication
router.use(authGuard);

// Create new order (buyer places order)
router.post('/', createOrder);

// Get buyer's orders
router.get('/buyer', getBuyerOrders);

// Get specific order by ID
router.get('/:id', getOrderById);

// Update order status (farmer updates)
router.patch('/:id/status', updateOrderStatus);

// Cancel order (buyer can cancel pending orders)
router.patch('/:id/cancel', cancelOrder);

export default router;
