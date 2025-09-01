import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSearchDebounceProps {
  onSearch: (searchTerm: string) => void;
  debounceMs?: number;
  minLength?: number;
  initialValue?: string;
}

interface UseSearchDebounceReturn {
  searchValue: string;
  debouncedValue: string;
  isSearching: boolean;
  shouldShowMinLengthHint: boolean;
  handleSearchChange: (value: string) => void;
  clearSearch: () => void;
}

export const useSearchDebounce = ({
  onSearch,
  debounceMs = 500,
  minLength = 2,
  initialValue = ''
}: UseSearchDebounceProps): UseSearchDebounceReturn => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  
  // Ref para evitar llamadas innecesarias
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchValue = useRef<string>(initialValue);

  // Efecto para el debounce
  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (searchValue.length === 0) {
      // Si está vacío, ejecutar inmediatamente
      setDebouncedValue('');
      setIsSearching(false);
      if (lastSearchValue.current !== '') {
        onSearch('');
        lastSearchValue.current = '';
      }
      return;
    }

    if (searchValue.length < minLength) {
      // Si es menor al mínimo, no hacer nada
      setIsSearching(false);
      return;
    }

    // Solo iniciar búsqueda si el valor realmente cambió
    if (searchValue === lastSearchValue.current) {
      return;
    }

    // Iniciar loading state
    setIsSearching(true);

    // Crear el timer de debounce
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(searchValue);
      setIsSearching(false);
      onSearch(searchValue);
      lastSearchValue.current = searchValue;
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchValue, debounceMs, minLength, onSearch]);

  // Handler para cambios en el input
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  // Función para limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setDebouncedValue('');
    setIsSearching(false);
    if (lastSearchValue.current !== '') {
      onSearch('');
      lastSearchValue.current = '';
    }
  }, [onSearch]);

  // Determinar si mostrar hint de longitud mínima
  const shouldShowMinLengthHint = searchValue.length > 0 && searchValue.length < minLength;

  return {
    searchValue,
    debouncedValue,
    isSearching,
    shouldShowMinLengthHint,
    handleSearchChange,
    clearSearch,
  };
};