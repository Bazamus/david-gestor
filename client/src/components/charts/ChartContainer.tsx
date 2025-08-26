// ======================================
// CONTENEDOR BASE PARA GRÁFICOS
// ======================================

import React from 'react';
import { ResponsiveContainer } from 'recharts';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ChartContainerProps {
  children: React.ReactElement;
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  subtitle,
  isLoading = false,
  error = null,
  height = 300,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-6 ${className}`}>
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-2">Error al cargar datos</div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {title && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer;
