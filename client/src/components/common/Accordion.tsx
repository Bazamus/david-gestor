import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface AccordionProps {
  title: string;
  icon?: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  icon,
  isOpen = false,
  onToggle,
  children,
  className = '',
  required = false
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const isControlled = onToggle !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-gray-600 dark:text-gray-400">{icon}</span>}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
        <span className="text-gray-600 dark:text-gray-400">
          {open ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </span>
      </button>
      
      {open && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;