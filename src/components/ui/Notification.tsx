import React from 'react';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';

interface NotificationProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  action,
}) => {
  const typeColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${typeColors[type]}`}
    >
      <div className="flex items-start">
        <Bell className="w-5 h-5 mt-0.5 mr-3" />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1 opacity-90">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium underline mt-2 hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Notification;