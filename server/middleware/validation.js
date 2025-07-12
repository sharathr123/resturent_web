import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('preparationTime')
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute'),
  handleValidationErrors
];

export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuItem')
    .isMongoId()
    .withMessage('Valid menu item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('orderType')
    .isIn(['delivery', 'pickup', 'dine-in'])
    .withMessage('Invalid order type'),
  handleValidationErrors
];

export const validateReservation = [
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format is required (HH:MM)'),
  body('guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),
  body('customerInfo.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Customer name is required'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('customerInfo.phone')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];