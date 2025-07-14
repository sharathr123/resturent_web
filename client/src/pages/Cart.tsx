import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'wouter';
import Button from '../components/ui/Button';
import CartItem from '../components/cart/CartItem';
import { formatPrice } from '../lib/utils';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cartState.total;
  const deliveryFee = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to proceed with checkout');
      setLocation('/login');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartState.items.map(item => ({
          menuItem: item.menuItem._id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions
        })),
        orderType: 'delivery' as const,
        deliveryAddress: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'card'
      };

      const result = await api.createOrder(orderData);
      
      if (result.success) {
        clearCart();
        toast.success('Order placed successfully!');
        setLocation('/');
      } else {
        toast.error(result.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred while placing the order');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <ShoppingCart className="mx-auto mb-6 text-gray-400" size={80} />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding some delicious items to your cart!</p>
            <Link to="/menu">
              <Button size="lg">Browse Menu</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link to="/menu">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={20} />
                Continue Shopping
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              <div className="space-y-4">
                {cartState.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">{formatPrice(total)}</span>
                </div>
              </div>

              {deliveryFee > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-orange-600">
                    Add {formatPrice(50 - subtotal)} more for free delivery!
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCheckout}
                isLoading={isLoading}
                disabled={isLoading}
              >
                <CreditCard size={20} className="mr-2" />
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Free delivery on orders over $50
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;