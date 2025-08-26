import React from 'react';
import Button from '@/components/common/Button';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
  onClick?: () => void;
  showLink?: boolean;
  linkText?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  onClick,
  showLink = false,
  linkText = 'Ver más',
  trend
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-blue-500',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-green-500',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-purple-500',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-red-500',
      hover: 'hover:bg-red-100 dark:hover:bg-red-900/30'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-yellow-500',
      hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
    },
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      icon: 'text-gray-500',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/30'
    }
  };

  const classes = colorClasses[color];

  return (
    <div 
      className={`card border ${classes.bg} ${classes.border} ${onClick ? 'cursor-pointer' : ''} ${classes.hover} transition-colors duration-200`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {trend && (
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className={`p-2 rounded-lg ${classes.icon}`}>
              {icon}
            </div>
          )}
        </div>
        
        {showLink && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              className={`${classes.text} hover:${classes.text} p-0 h-auto`}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              {linkText} →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
