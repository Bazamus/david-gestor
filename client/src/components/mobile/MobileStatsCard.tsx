import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  onClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'highlight';
}

const MobileStatsCard: React.FC<MobileStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/20',
  trend,
  onClick,
  loading = false,
  variant = 'default'
}) => {
  const baseClasses = `
    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''}
    ${variant === 'highlight' ? 'ring-2 ring-primary/20' : ''}
  `;

  const compactClasses = variant === 'compact' ? 'p-3' : 'p-4';
  const highlightClasses = variant === 'highlight' ? 'bg-gradient-to-br from-primary/5 to-primary/10' : '';

  if (loading) {
    return (
      <div className={`${baseClasses} ${compactClasses} ${highlightClasses}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className={`w-8 h-8 rounded-lg ${iconBgColor}`}></div>
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          {trend && (
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${compactClasses} ${highlightClasses}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`font-medium text-gray-600 dark:text-gray-400 ${
          variant === 'compact' ? 'text-sm' : 'text-sm'
        }`}>
          {title}
        </h3>
        <div className={`w-8 h-8 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <p className={`font-bold text-gray-900 dark:text-white ${
          variant === 'compact' ? 'text-lg' : 'text-2xl'
        }`}>
          {value}
        </p>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <span className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para grid de estadísticas
interface MobileStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileStatsGrid: React.FC<MobileStatsGridProps> = ({
  children,
  columns = 2,
  gap = 'md'
}) => {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
};

// Componente para lista de estadísticas
interface MobileStatsListProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export const MobileStatsList: React.FC<MobileStatsListProps> = ({
  children,
  spacing = 'md'
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4'
  };

  return (
    <div className={spacingClasses[spacing]}>
      {children}
    </div>
  );
};

// Variantes predefinidas para casos comunes
export const MobileStatsCardVariants = {
  // Métricas principales
  primary: (props: Omit<MobileStatsCardProps, 'variant'>) => (
    <MobileStatsCard {...props} variant="default" />
  ),
  
  // Métricas destacadas
  highlight: (props: Omit<MobileStatsCardProps, 'variant'>) => (
    <MobileStatsCard {...props} variant="highlight" />
  ),
  
  // Métricas compactas para listas
  compact: (props: Omit<MobileStatsCardProps, 'variant'>) => (
    <MobileStatsCard {...props} variant="compact" />
  ),
  
  // Métricas con colores específicos
  success: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-green-600 dark:text-green-400"
      iconBgColor="bg-green-100 dark:bg-green-900/20"
    />
  ),
  
  warning: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-yellow-600 dark:text-yellow-400"
      iconBgColor="bg-yellow-100 dark:bg-yellow-900/20"
    />
  ),
  
  danger: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-red-600 dark:text-red-400"
      iconBgColor="bg-red-100 dark:bg-red-900/20"
    />
  ),
  
  info: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
    />
  ),
  
  purple: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-purple-600 dark:text-purple-400"
      iconBgColor="bg-purple-100 dark:bg-purple-900/20"
    />
  ),
  
  orange: (props: Omit<MobileStatsCardProps, 'iconColor' | 'iconBgColor'>) => (
    <MobileStatsCard 
      {...props} 
      iconColor="text-orange-600 dark:text-orange-400"
      iconBgColor="bg-orange-100 dark:bg-orange-900/20"
    />
  )
};

export default MobileStatsCard;
