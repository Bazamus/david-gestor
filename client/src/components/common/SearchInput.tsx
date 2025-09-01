import React from 'react';
import { SearchIcon, LoaderIcon, XIcon } from 'lucide-react';
import { useSearchDebounce } from '@/hooks/useSearchDebounce';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
  debounceMs?: number;
  minLength?: number;
  className?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Buscar...",
  onSearch,
  initialValue = '',
  debounceMs = 500,
  minLength = 2,
  className = '',
  disabled = false,
}) => {
  const {
    searchValue,
    isSearching,
    shouldShowMinLengthHint,
    handleSearchChange,
    clearSearch,
  } = useSearchDebounce({
    onSearch,
    debounceMs,
    minLength,
    initialValue,
  });

  return (
    <div className={`relative ${className}`}>
      {/* Input principal */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            shouldShowMinLengthHint ? 'border-amber-300 dark:border-amber-500' : ''
          }`}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={disabled}
        />
        
        {/* Indicadores en el lado derecho */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Loading spinner */}
          {isSearching && (
            <LoaderIcon className="w-4 h-4 text-blue-500 animate-spin" />
          )}
          
          {/* Clear button */}
          {searchValue && !isSearching && (
            <button
              type="button"
              onClick={clearSearch}
              className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded"
              title="Limpiar búsqueda"
            >
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Hint de longitud mínima */}
      {shouldShowMinLengthHint && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md shadow-sm z-10">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center">
            <SearchIcon className="w-3 h-3 mr-1" />
            Escribe al menos {minLength} caracteres para buscar
          </p>
        </div>
      )}

      {/* Estado de búsqueda activa */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm z-10">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center">
            <LoaderIcon className="w-3 h-3 mr-1 animate-spin" />
            Buscando...
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchInput;