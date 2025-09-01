import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon: Icon,
  actions,
  children 
}) => {
  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-8 h-8 text-blue-600" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {actions && <div className="flex-shrink-0">{actions}</div>}
          {children && <div className="flex-shrink-0 ml-4">{children}</div>}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        {/* Primera fila: Título y acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="w-6 h-6 text-blue-600" />}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>
          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
        
        {/* Segunda fila: Subtítulo */}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
        
        {/* Tercera fila: Children si existe */}
        {children && (
          <div className="flex-shrink-0">{children}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
