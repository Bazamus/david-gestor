import React from 'react';
<<<<<<< HEAD
import { LucideIcon, MoreHorizontal, Star, Clock, User, Tag } from 'lucide-react';
=======
import { LucideIcon, Star, Clock, User, Tag } from 'lucide-react';
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba

interface CardAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger' | 'success';
}

interface CardBadge {
  label: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  badges?: CardBadge[];
  actions?: CardAction[];
  metadata?: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
  }[];
  status?: 'default' | 'active' | 'completed' | 'pending' | 'overdue';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  onClick?: () => void;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'detailed' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
}

const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  description,
  image,
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/20',
  badges = [],
  actions = [],
  metadata = [],
  status = 'default',
  priority,
  progress,
  onClick,
  loading = false,
  variant = 'default',
  size = 'md'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'completed':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'pending':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'overdue':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getBadgeColor = (color: CardBadge['color']) => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-white';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const baseClasses = `
    rounded-lg border transition-all duration-200
    ${getStatusColor()}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''}
    ${variant === 'interactive' ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
  `;

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={`${baseClasses} ${sizeClasses} animate-pulse`}>
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-lg ${iconBgColor}`}></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${sizeClasses}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start space-x-3">
        {/* Image or Icon */}
        {image ? (
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
        ) : Icon ? (
          <div className={`w-12 h-12 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        ) : null}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Priority indicator */}
            {priority && (
              <div className="flex-shrink-0 ml-2">
                <Star className={`w-4 h-4 ${getPriorityColor()}`} fill="currentColor" />
              </div>
            )}
          </div>

          {/* Description */}
          {description && variant !== 'compact' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {description}
            </p>
          )}

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge.color)}`}
                >
                  {badge.icon && <span className="w-3 h-3">{badge.icon}</span>}
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {progress !== undefined && variant !== 'compact' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      {metadata.length > 0 && variant === 'detailed' && (
        <div className="mt-3 space-y-2">
          {metadata.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              {item.icon && (
                <item.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
              <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
              <span className="text-gray-900 dark:text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                action.variant === 'primary' 
                  ? 'text-primary hover:bg-primary/10' :
                  action.variant === 'danger'
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' :
                  action.variant === 'success'
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' :
                  'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente para grid de cards
interface MobileCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

export const MobileCardGrid: React.FC<MobileCardGridProps> = ({
  children,
  columns = 2,
  gap = 'md'
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3'
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

// Componente para lista de cards
interface MobileCardListProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}

export const MobileCardList: React.FC<MobileCardListProps> = ({
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
export const MobileCardVariants = {
  // Card básica
  basic: (props: Omit<MobileCardProps, 'variant'>) => (
    <MobileCard {...props} variant="default" />
  ),
  
  // Card compacta
  compact: (props: Omit<MobileCardProps, 'variant'>) => (
    <MobileCard {...props} variant="compact" />
  ),
  
  // Card detallada
  detailed: (props: Omit<MobileCardProps, 'variant'>) => (
    <MobileCard {...props} variant="detailed" />
  ),
  
  // Card interactiva
  interactive: (props: Omit<MobileCardProps, 'variant'>) => (
    <MobileCard {...props} variant="interactive" />
  ),
  
  // Card de proyecto
  project: (props: Omit<MobileCardProps, 'icon' | 'iconColor' | 'iconBgColor'>) => (
    <MobileCard 
      {...props} 
      icon={Tag}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-100 dark:bg-blue-900/20"
    />
  ),
  
  // Card de tarea
  task: (props: Omit<MobileCardProps, 'icon' | 'iconColor' | 'iconBgColor'>) => (
    <MobileCard 
      {...props} 
      icon={Clock}
      iconColor="text-green-600 dark:text-green-400"
      iconBgColor="bg-green-100 dark:bg-green-900/20"
    />
  ),
  
  // Card de usuario
  user: (props: Omit<MobileCardProps, 'icon' | 'iconColor' | 'iconBgColor'>) => (
    <MobileCard 
      {...props} 
      icon={User}
      iconColor="text-purple-600 dark:text-purple-400"
      iconBgColor="bg-purple-100 dark:bg-purple-900/20"
    />
  )
};

export default MobileCard;
