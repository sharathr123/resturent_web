import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      orderType,
      deliveryAddress,
      customerNotes,
      paymentMethod
    } = req.body;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${menuItem?.name || 'unknown'} is not available`
        });
      }

      const itemSubtotal = menuItem.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        subtotal: itemSubtotal
      });
    }

    // Calculate fees and taxes
    const deliveryFee = orderType === 'delivery' ? (subtotal > 50 ? 0 : 5.99) : 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      deliveryFee,
      total,
      orderType,
      deliveryAddress,
      customerNotes,
      paymentMethod,
      customerInfo: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      }
    });

    await order.populate([
      { path: 'userId', select: 'name email phone' },
      { path: 'items.menuItem', select: 'name image price' }
    ]);

    // Update menu item popularity
    for (const item of items) {
      await MenuItem.findByIdAndUpdate(
        item.menuItem,
        { $inc: { popularity: item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.menuItem', 'name image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('items.menuItem', 'name image price')
      .populate('assignedDriver', 'name phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin/staff
    if (order.userId._id.toString() !== req.user.id && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status (Admin/Staff only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Staff
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    
    if (note) {
      order.timeline.push({
        status,
        note,
        timestamp: new Date()
      });
    }

    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Emit real-time update
    req.io.to(`user_${order.userId}`).emit('orderUpdate', {
      orderId: order._id,
      status: order.status,
      message: `Your order is now ${status}`
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all orders (Admin/Staff only)
// @route   GET /api/admin/orders
// @access  Private/Admin/Staff
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      orderType,
      startDate,
      endDate
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.menuItem', 'name image price')
      .populate('assignedDriver', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};