const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no auth required)
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

// Protected routes (auth required)
router.use(authMiddleware.verifyToken);

// Farmer routes (only farmers can create/edit listings)
router.post('/', authMiddleware.requireFarmer, productController.createProduct);
router.put('/:id', authMiddleware.requireFarmer, productController.updateProduct);
router.delete('/:id', authMiddleware.requireFarmer, productController.deleteProduct);
router.get('/farmer/my-listings', authMiddleware.requireFarmer, productController.getFarmerListings);

// Buyer routes
router.get('/favorites', productController.getFavoriteProducts);
router.post('/:id/favorite', productController.toggleFavorite);
router.post('/:id/review', productController.addReview);

module.exports = router;
