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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-8 h-8 text-blue-600" />}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {actions && <div className="flex-shrink-0">{actions}</div>}
          {children && <div className="flex-shrink-0 ml-4">{children}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
