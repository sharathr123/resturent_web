import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { MenuItem } from '../../types';
import { api } from '../../lib/api';

const PopularDishes: React.FC = () => {
  const { addItem } = useCart();
  const [dishes, setDishes] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        const response = await api.getPopularItems();
        if (response.success && response.data) {
          setDishes(response.data);
        }
      } catch (error) {
        console.error('Error fetching popular dishes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularDishes();
  }, []);

  const handleAddToCart = (dish: MenuItem) => {
    addItem(dish, 1);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Dishes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our customers' favorite dishes crafted with love and expertise
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish, index) => (
            <motion.div
              key={dish._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  {dish.isVegetarian && (
                    <Badge variant="success" size="sm">
                      Vegetarian
                    </Badge>
                  )}
                  {dish.isGlutenFree && (
                    <Badge variant="info" size="sm">
                      Gluten-Free
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-500" size={16} />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dish.name}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {dish.description}
                </p>

                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{dish.preparationTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{dish.nutrition.calories} cal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(dish.price)}
                  </span>
                  <Button
                    onClick={() => handleAddToCart(dish)}
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
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg" variant="outline">
            View Full Menu
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularDishes;