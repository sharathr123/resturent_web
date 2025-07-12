import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  return (
    <div className={cn('flex items-center', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
          sizeClasses[size].track,
          checked ? 'bg-orange-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.span
          className={cn(
            'inline-block bg-white rounded-full shadow transform transition-transform',
            sizeClasses[size].thumb
          )}
          animate={{
            x: checked ? sizeClasses[size].translate.replace('translate-x-', '') : '0',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span className={cn('ml-3 text-sm', disabled ? 'text-gray-400' : 'text-gray-900')}>
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;