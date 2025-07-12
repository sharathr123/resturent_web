import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, Star, Users, Utensils, MapPin } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      title: 'Easy Online Ordering',
      description: 'Browse our menu and place orders with just a few clicks.',
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      title: 'Fast Delivery',
      description: 'Get your favorite dishes delivered hot and fresh in 30 minutes.',
    },
    {
      icon: <Star className="w-8 h-8 text-orange-600" />,
      title: 'Premium Quality',
      description: 'We use only the finest ingredients to create exceptional dishes.',
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: 'Table Reservations',
      description: 'Reserve your table in advance for a perfect dining experience.',
    },
    {
      icon: <Utensils className="w-8 h-8 text-orange-600" />,
      title: 'Expert Chefs',
      description: 'Our skilled chefs bring years of culinary expertise to every dish.',
    },
    {
      icon: <MapPin className="w-8 h-8 text-orange-600" />,
      title: 'Multiple Locations',
      description: 'Find us at convenient locations throughout the city.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Delicious?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to providing you with the best dining experience possible
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;