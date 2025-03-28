import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProductReview,
  getProductsByCategory,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.route('/').get(getProducts);
router.route('/featured').get(getFeaturedProducts);
router.route('/category/:category').get(getProductsByCategory);
router.route('/:id').get(getProductById);

// Rutas protegidas
router.route('/:id/reviews').post(protect, createProductReview);

export default router;