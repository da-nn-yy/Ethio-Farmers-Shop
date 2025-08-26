const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.verifyToken);

// Shopping cart routes
router.get('/cart', orderController.getCart);
router.post('/cart/add', orderController.addToCart);
router.put('/cart/update/:itemId', orderController.updateCartItem);
router.delete('/cart/remove/:itemId', orderController.removeFromCart);
router.delete('/cart/clear', orderController.clearCart);

// Order routes
router.post('/checkout', orderController.createOrder);
router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);

// Farmer routes (only farmers can manage their orders)
router.get('/farmer/orders', authMiddleware.requireFarmer, orderController.getFarmerOrders);
router.put('/farmer/:id/status', authMiddleware.requireFarmer, orderController.updateFarmerOrderStatus);

module.exports = router;
