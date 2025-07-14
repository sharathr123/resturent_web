import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'wouter';
import Button from './Button';
import Badge from './Badge';
import { formatPrice } from '../../lib/utils';

const FloatingCart: React.FC = () => {
  const { state: cartState } = useCart();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (cartState.itemCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl p-4 mb-4 w-80 max-h-96 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Cart Summary</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {cartState.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.menuItem.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x {formatPrice(item.menuItem.price)}
                    </p>
                  </div>
                </div>
              ))}
              {cartState.items.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  +{cartState.items.length - 3} more items
                </p>
              )}
            </div>

            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(cartState.total)}</span>
              </div>
            </div>

            <Link to="/cart">
              <Button className="w-full">View Cart</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 transition-colors relative"
      >
        <ShoppingCart size={24} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Badge variant="error" size="sm">
            {cartState.itemCount}
          </Badge>
        </motion.div>
      </motion.button>
    </motion.div>
  );
};

export default FloatingCart;