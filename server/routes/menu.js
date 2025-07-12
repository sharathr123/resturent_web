import express from 'express';
import {
  getMenuItems,
  getMenuItem,
  getFeaturedItems,
  getPopularItems,
  getCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateMenuItem } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getMenuItems);
router.get('/featured', getFeaturedItems);
router.get('/popular', getPopularItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItem);

// Admin routes
router.post('/', protect, authorize('admin'), validateMenuItem, createMenuItem);
router.put('/:id', protect, authorize('admin'), validateMenuItem, updateMenuItem);
router.delete('/:id', protect, authorize('admin'), deleteMenuItem);

export default router;