import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
}) => {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={hover ? { y: -2, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200',
        hover && 'hover:shadow-lg transition-shadow duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Card;