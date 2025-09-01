import React from 'react';
import { LoaderIcon } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Cargando...', 
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const LoadingSpinner = () => (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <LoaderIcon className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
          {text}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return <LoadingSpinner />;
};

// Skeleton Loader para contenido
export const SkeletonLoader: React.FC<{ 
  className?: string;
  count?: number;
  height?: string;
}> = ({ 
  className = '', 
  count = 1,
  height = 'h-4'
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`loading-skeleton ${height} w-full rounded`}
      />
    ))}
  </div>
);

// Loading para cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card">
        <div className="card-header">
          <div className="loading-skeleton h-6 w-3/4 rounded" />
          <div className="loading-skeleton h-4 w-1/2 rounded mt-2" />
        </div>
        <div className="card-content">
          <SkeletonLoader count={3} />
        </div>
      </div>
    ))}
  </div>
);

// Loading para tabla
export const TableSkeleton: React.FC<{ 
  rows?: number;
  columns?: number;
}> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="space-y-2">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <div key={`header-${index}`} className="loading-skeleton h-6 rounded" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={`row-${rowIndex}-col-${colIndex}`} className="loading-skeleton h-4 rounded" />
        ))}
      </div>
    ))}
  </div>
);

export default Loading;