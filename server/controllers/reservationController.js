import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

// @desc    Create new reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = async (req, res) => {
  try {
    const {
      date,
      time,
      guests,
      customerInfo,
      specialRequests,
      occasion,
      seatingPreference
    } = req.body;

    // Check if the time slot is available
    const existingReservation = await Reservation.findOne({
      date: new Date(date),
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const reservation = await Reservation.create({
      userId: req.user.id,
      date: new Date(date),
      time,
      guests,
      customerInfo,
      specialRequests,
      occasion,
      seatingPreference
    });

    await reservation.populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
export const getUserReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(query)
      .populate('userId', 'name email phone')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
export const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns the reservation or is admin/staff
    if (reservation.userId._id.toString() !== req.user.id && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
export const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns the reservation
    if (reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reservation'
      });
    }

    // Check if reservation can be updated
    if (['completed', 'cancelled', 'no-show'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update this reservation'
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
// @access  Private
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns the reservation
    if (reservation.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Check if reservation can be cancelled
    if (['completed', 'cancelled', 'no-show'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this reservation'
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all reservations (Admin/Staff only)
// @route   GET /api/admin/reservations
// @access  Private/Admin/Staff
export const getAllReservations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      date,
      guests
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (date) {
      const searchDate = new Date(date);
      query.date = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }
    if (guests) query.guests = parseInt(guests);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(query)
      .populate('userId', 'name email phone')
      .sort({ date: 1, time: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reservations.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update reservation status (Admin/Staff only)
// @route   PUT /api/reservations/:id/status
// @access  Private/Admin/Staff
export const updateReservationStatus = async (req, res) => {
  try {
    const { status, notes, tableNumber } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = status;
    if (notes) reservation.notes = notes;
    if (tableNumber) reservation.tableNumber = tableNumber;

    await reservation.save();

    // Emit real-time update
    req.io.to(`user_${reservation.userId}`).emit('reservationUpdate', {
      reservationId: reservation._id,
      status: reservation.status,
      message: `Your reservation status has been updated to ${status}`
    });

    res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available time slots
// @route   GET /api/reservations/availability/:date
// @access  Public
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.params;
    const { guests = 2 } = req.query;

    const searchDate = new Date(date);
    
    // Get all reservations for the date
    const existingReservations = await Reservation.find({
      date: {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'confirmed', 'seated'] }
    });

    // Define available time slots (restaurant hours)
    const allTimeSlots = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
      '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    // Filter out booked slots (simplified - in real app, consider table capacity)
    const bookedTimes = existingReservations.map(res => res.time);
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        date,
        availableSlots,
        totalSlots: allTimeSlots.length,
        availableCount: availableSlots.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};