import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-400">Delicious</h3>
            <p className="text-gray-400">
              Experience the finest dining with our carefully crafted menu and exceptional service.
            </p>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="text-gray-400 hover:text-orange-400 transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/menu" className="hover:text-orange-400 transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="/reservations" className="hover:text-orange-400 transition-colors">
                  Reservations
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-orange-400 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-orange-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Online Ordering</li>
              <li>Table Reservations</li>
              <li>Catering</li>
              <li>Private Events</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>123 Restaurant Street, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@delicious.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Delicious Restaurant. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;