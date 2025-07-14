import React from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Star, Clock } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Experience
                <span className="text-orange-600"> Culinary</span>
                <br />
                Excellence
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                Discover a world of flavors crafted with passion and served with love. 
                Every dish tells a story of tradition, innovation, and exceptional taste.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/menu">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Menu
                </Button>
              </Link>
              <Link to="/reservations">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Book Table
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center space-x-6 pt-4"
            >
              <div className="flex items-center space-x-2">
                <ChefHat className="text-orange-600" size={24} />
                <span className="text-gray-700">Expert Chefs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="text-orange-600" size={24} />
                <span className="text-gray-700">5-Star Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-orange-600" size={24} />
                <span className="text-gray-700">Fast Delivery</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Delicious food"
                className="w-full h-full object-cover"
              />
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-500" size={20} />
                  <span className="font-semibold text-gray-900">4.9</span>
                  <span className="text-gray-600 text-sm">Rating</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="text-orange-600" size={20} />
                  <span className="font-semibold text-gray-900">30 min</span>
                  <span className="text-gray-600 text-sm">Delivery</span>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-100 rounded-full opacity-40"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;