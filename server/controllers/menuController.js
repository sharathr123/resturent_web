import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res) => {
  try {
    const {
      category,
      search,
      isVegetarian,
      isVegan,
      isGlutenFree,
      minPrice,
      maxPrice,
      sortBy = 'name',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { isAvailable: true };

    if (category) {
      query.categoryId = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (isVegetarian === 'true') query.isVegetarian = true;
    if (isVegan === 'true') query.isVegan = true;
    if (isGlutenFree === 'true') query.isGlutenFree = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions.price = 1;
        break;
      case 'price-high':
        sortOptions.price = -1;
        break;
      case 'rating':
        sortOptions['rating.average'] = -1;
        break;
      case 'popular':
        sortOptions.popularity = -1;
        break;
      default:
        sortOptions.name = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const menuItems = await MenuItem.find(query)
      .populate('categoryId', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('categoryId', 'name slug');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get featured menu items
// @route   GET /api/menu/featured
// @access  Public
export const getFeaturedItems = async (req, res) => {
  try {
    const featuredItems = await MenuItem.find({
      isFeatured: true,
      isAvailable: true
    })
      .populate('categoryId', 'name slug')
      .sort({ popularity: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: featuredItems.length,
      data: featuredItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get popular menu items
// @route   GET /api/menu/popular
// @access  Public
export const getPopularItems = async (req, res) => {
  try {
    const popularItems = await MenuItem.find({
      isAvailable: true
    })
      .populate('categoryId', 'name slug')
      .sort({ popularity: -1, 'rating.average': -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      count: popularItems.length,
      data: popularItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create menu item (Admin only)
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    
    await menuItem.populate('categoryId', 'name slug');

    res.status(201).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update menu item (Admin only)
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete menu item (Admin only)
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};