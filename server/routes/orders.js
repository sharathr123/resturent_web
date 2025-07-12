import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateOrder } from '../middleware/validation.js';

const router = express.Router();

// User routes
router.post('/', protect, validateOrder, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin/Staff routes
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllOrders);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

export default router;