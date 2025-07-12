import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
    >
      <div className="flex-shrink-0">
        <img
          src={item.menuItem.image}
          alt={item.menuItem.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {item.menuItem.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {formatPrice(item.menuItem.price)} each
        </p>
        
        <div className="flex items-center space-x-2 mb-2">
          {item.menuItem.isVegetarian && (
            <Badge variant="success" size="sm">
              Vegetarian
            </Badge>
          )}
          {item.menuItem.isSpicy && (
            <Badge variant="warning" size="sm">
              Spicy
            </Badge>
          )}
        </div>

        {item.specialInstructions && (
          <p className="text-sm text-gray-500 italic">
            Note: {item.specialInstructions}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            <Minus size={16} />
          </Button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(item.quantity + 1)}
          >
            <Plus size={16} />
          </Button>
        </div>

        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {formatPrice(item.price)}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeItem(item.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </motion.div>
  );
};

export default CartItem;