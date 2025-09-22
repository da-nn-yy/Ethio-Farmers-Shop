import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import { authGuard } from '../middleware/auth.js';

const router = Router();

// All payment routes require auth
router.use(authGuard);

// Payment method routes
router.get('/methods/:userId', paymentController.getUserPaymentMethods);
router.post('/methods/:userId', paymentController.addPaymentMethod);
router.put('/methods/:paymentMethodId/verify', paymentController.verifyPaymentMethod);
router.delete('/methods/:paymentMethodId', paymentController.removePaymentMethod);

// Payment processing routes
router.post('/process', paymentController.processPayment);
router.get('/history/:userId', paymentController.getPaymentHistory);
router.get('/stats/:userId', paymentController.getPaymentStats);

// Advanced payment features
router.get('/dashboard/:userId', paymentController.getPaymentDashboard);
router.get('/trends', paymentController.getPaymentTrends);
router.get('/bank-performance', paymentController.getBankPerformance);
router.get('/fraud-report/:userId', paymentController.getFraudReport);
router.post('/refund/:paymentId', paymentController.processRefund);
router.get('/status/:paymentId', paymentController.getPaymentStatus);
router.get('/providers', paymentController.getPaymentProviders);

// Testing and simulation routes
router.post('/simulate', paymentController.simulatePaymentProcessing);

export default router;
