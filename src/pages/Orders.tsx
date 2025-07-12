import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Star } from 'lucide-react';
import { Order } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatPrice, formatDate, formatTime } from '../lib/utils';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {};
      console.log(params, 'params for orders');
      const response = await api.getOrders(params);
      
      if (response.success && response.data) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'warning';
      case 'ready':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600">Track your order history and current orders</p>
        </motion.div>

        {/* Status Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-4 mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {statusOptions?.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedStatus === option.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : orders?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
            <Button>Browse Menu</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders?.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {/* <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order?.orderNumber || order._id?.slice(-8)}
                      </h3> */}
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(order.status)} size="md">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order?.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-orange-600">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>{order.deliveryAddress || 'Pickup'}</span>
                        </div>
                        {order.estimatedDeliveryTime && (
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>
                              Est. delivery: {formatTime(order.estimatedDeliveryTime)}
                            </span>
                          </div>
                        )}
                        {/* {order?.customerInfo?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone size={16} />
                            <span>{order?.customerInfo.phone}</span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          <Star size={16} className="mr-1" />
                          Rate Order
                        </Button>
                      )}
                    </div>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <Button variant="destructive" size="sm">
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;