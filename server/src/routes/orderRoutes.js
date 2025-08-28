import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import { createOrder, listMyOrders, updateOrderStatus } from "../controllers/orderController.js";

const router = Router();

router.get('/orders', authGuard, listMyOrders);
router.post('/orders', authGuard, createOrder);
router.put('/orders/:id/status', authGuard, updateOrderStatus);

export default router;

