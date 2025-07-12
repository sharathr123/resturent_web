import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Clock, Plus, Heart } from 'lucide-react';
import { MenuItem, Category } from '../../types';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import toast from 'react-hot-toast';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, [selectedCategory, searchQuery, filters, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        isVegetarian: filters.isVegetarian || undefined,
        isVegan: filters.isVegan || undefined,
        isGlutenFree: filters.isGlutenFree || undefined,
        sortBy,
      };

      const response = await api.getMenuItems(params);
      if (response.success && response.data) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
    toast.success(`Added ${item.name} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-xl text-gray-600">Discover our delicious offerings</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isVegetarian}
                  onChange={(e) => setFilters({ ...filters, isVegetarian: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isVegan}
                  onChange={(e) => setFilters({ ...filters, isVegan: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Vegan</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.isGlutenFree}
                  onChange={(e) => setFilters({ ...filters, isGlutenFree: e.target.checked })}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Gluten-Free</span>
              </label>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-50'
              }`}
            >
              All Items
            </button>
            {categories?.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id!)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category._id
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6]?.map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems?.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                      {item.isVegetarian && (
                        <Badge variant="success" size="sm">Vegetarian</Badge>
                      )}
                      {item.isVegan && (
                        <Badge variant="success" size="sm">Vegan</Badge>
                      )}
                      {item.isGlutenFree && (
                        <Badge variant="info" size="sm">Gluten-Free</Badge>
                      )}
                    </div>
                    <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                      <Heart size={16} className="text-gray-600" />
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{item.preparationTime} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-500" />
                        <span>4.8</span>
                      </div>
                      <div>
                        <span>{item.nutrition.calories} cal</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">
                        {formatPrice(item.price)}
                      </span>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>Add to Cart</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {!loading && menuItems?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;