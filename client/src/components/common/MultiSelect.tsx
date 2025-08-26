import React, { useState, useRef, useEffect } from 'react';
import { XIcon, ChevronDownIcon } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = 'Seleccionar opciones...',
  className = '',
  disabled = false,
  allowCustom = false,
  customPlaceholder = 'Agregar personalizado...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setCustomValue('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const addCustomOption = () => {
    if (customValue.trim() && !value.includes(customValue.trim())) {
      onChange([...value, customValue.trim()]);
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomOption();
    } else if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected values */}
      <div
        className={`min-h-[42px] w-full px-3 py-2 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:bg-gray-700 dark:text-white cursor-pointer ${
          disabled 
            ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed border-gray-300 dark:border-gray-600' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length > 0 ? (
              value.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {val}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(val);
                      }}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                value.includes(option.value) 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {option.label}
              {value.includes(option.value) && (
                <span className="text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
          
          {allowCustom && (
            <>
              <hr className="border-gray-200 dark:border-gray-600" />
              {showCustomInput ? (
                <div className="p-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={handleCustomKeyPress}
                    onBlur={addCustomOption}
                    placeholder={customPlaceholder}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full px-3 py-2 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 italic"
                >
                  + Agregar personalizado
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;