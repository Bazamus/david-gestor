import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error';
  disabled?: boolean;
  required?: boolean;
  completed?: boolean;
}

interface MobileAccordionProps {
  items: AccordionItem[];
  defaultExpanded?: string[];
  allowMultiple?: boolean;
  variant?: 'default' | 'compact' | 'bordered';
  onItemToggle?: (itemId: string, isExpanded: boolean) => void;
  showStatus?: boolean;
  showProgress?: boolean;
}

const MobileAccordion: React.FC<MobileAccordionProps> = ({
  items,
  defaultExpanded = [],
  allowMultiple = false,
  variant = 'default',
  onItemToggle,
  showStatus = true,
  showProgress = true
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    
    if (allowMultiple) {
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
      } else {
        newExpanded.add(itemId);
      }
    } else {
      // Solo un item expandido a la vez
      newExpanded.clear();
      newExpanded.add(itemId);
    }
    
    setExpandedItems(newExpanded);
    onItemToggle?.(itemId, newExpanded.has(itemId));
  };

  const expandAll = () => {
    setExpandedItems(new Set(items.map(item => item.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const getStatusIcon = (status: AccordionItem['status'], completed?: boolean) => {
    if (completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: AccordionItem['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getProgressPercentage = () => {
    if (items.length === 0) return 0;
    const completedItems = items.filter(item => item.completed).length;
    return Math.round((completedItems / items.length) * 100);
  };

  const progressPercentage = getProgressPercentage();

  const baseClasses = {
    default: 'space-y-2',
    compact: 'space-y-1',
    bordered: 'space-y-3'
  };

  const itemClasses = {
    default: 'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700',
    compact: 'bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700',
    bordered: 'bg-white dark:bg-gray-900 rounded-lg border-2'
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      {showProgress && items.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      {allowMultiple && items.length > 1 && (
        <div className="flex space-x-2 mb-4">
          <button
            onClick={expandAll}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Expandir Todo
          </button>
          <button
            onClick={collapseAll}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Colapsar Todo
          </button>
        </div>
      )}

      {/* Accordion Items */}
      <div className={baseClasses[variant]}>
        {items.map((item) => {
          const isExpanded = expandedItems.has(item.id);
          const isDisabled = item.disabled;
          const statusColor = getStatusColor(item.status || 'default');
          
          return (
            <div
              key={item.id}
              className={`${itemClasses[variant]} ${statusColor} overflow-hidden transition-all duration-200 ${
                isDisabled ? 'opacity-50' : ''
              }`}
            >
              <button
                onClick={() => !isDisabled && toggleItem(item.id)}
                disabled={isDisabled}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Icon */}
                  {item.icon && (
                    <div className="flex-shrink-0 w-6 h-6 text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </div>
                  )}
                  
                  {/* Title and Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      {item.required && (
                        <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                          *
                        </span>
                      )}
                    </div>
                    
                    {/* Status indicators */}
                    {showStatus && (
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(item.status, item.completed)}
                        {item.status && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            item.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {item.status === 'success' ? 'Completado' :
                             item.status === 'warning' ? 'Advertencia' :
                             item.status === 'error' ? 'Error' : 'Pendiente'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expand/Collapse Icon */}
                <div className="flex-shrink-0 ml-3">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {/* Content */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    {item.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No hay elementos para mostrar
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileAccordion;
