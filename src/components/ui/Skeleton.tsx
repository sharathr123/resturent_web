import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, width, height }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-300 rounded',
        className
      )}
      style={{ width, height }}
    />
  );
};

export default Skeleton;