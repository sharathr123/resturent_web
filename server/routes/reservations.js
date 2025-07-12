import express from 'express';
import {
  createReservation,
  getUserReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  getAllReservations,
  updateReservationStatus,
  getAvailableTimeSlots
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateReservation } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/availability/:date', getAvailableTimeSlots);

// User routes
router.post('/', protect, validateReservation, createReservation);
router.get('/', protect, getUserReservations);
router.get('/:id', protect, getReservation);
router.put('/:id', protect, updateReservation);
router.put('/:id/cancel', protect, cancelReservation);

// Admin/Staff routes
router.get('/admin/all', protect, authorize('admin', 'staff'), getAllReservations);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateReservationStatus);

export default router;