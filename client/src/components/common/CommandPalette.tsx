import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCommandPaletteContext } from '@/contexts/CommandPaletteContext';
import { SearchIcon, CommandIcon } from 'lucide-react';
import CommandPaletteIcon from './CommandPaletteIcon';

const CommandPalette: React.FC = () => {
  const {
    isOpen,
    searchQuery,
    setSearchQuery,
    groupedItems,
    closePalette,
  } = useCommandPaletteContext();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Crear una lista plana de todos los items para navegación
  const flatItems = React.useMemo(() => {
    const items: any[] = [];
    Object.entries(groupedItems).forEach(([, categoryItems]) => {
      items.push(...categoryItems);
    });
    return items;
  }, [groupedItems]);

  // Reset selected index cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, groupedItems]);

  // Auto-focus en el input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatItems.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
        break;
      case 'Enter':
        event.preventDefault();
        if (flatItems[selectedIndex]) {
          flatItems[selectedIndex].action();
        }
        break;
      case 'Escape':
        event.preventDefault();
        closePalette();
        break;
    }
  }, [flatItems, selectedIndex, closePalette]);

  // Click fuera del modal para cerrar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closePalette();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closePalette]);

  // Determinar si estamos en Mac para mostrar el shortcut correcto
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header con input de búsqueda */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <SearchIcon className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar proyectos, tareas, acciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 outline-none text-base"
          />
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
              {shortcutKey}K
            </kbd>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-h-96 overflow-y-auto">
          {Object.keys(groupedItems).length === 0 ? (
            // Estado vacío
            <div className="py-8 text-center">
              <SearchIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No se encontraron resultados' : 'Escribe para buscar...'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Prueba con "proyecto", "tarea" o "crear"
              </p>
            </div>
          ) : (
            // Resultados agrupados
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="py-2">
                {/* Header de categoría */}
                <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {category} ({items.length})
                </div>
                
                {/* Items de la categoría */}
                {items.map((item, categoryIndex) => {
                  // Calcular el índice global para este item
                  const globalIndex = Object.entries(groupedItems)
                    .slice(0, Object.keys(groupedItems).indexOf(category))
                    .reduce((acc, [, catItems]) => acc + catItems.length, 0) + categoryIndex;
                  
                  const isSelected = globalIndex === selectedIndex;
                  
                  return (
                    <button
                      key={item.id}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isSelected ? 'bg-primary/10 dark:bg-primary/20 border-r-2 border-primary' : ''
                      }`}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 text-gray-600 dark:text-gray-300">
                          <CommandPaletteIcon 
                            iconType={item.iconType} 
                            iconColor={item.iconColor}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                        
                        {/* Badge de tipo */}
                        {item.type === 'action' && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Acción
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer con tips */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↑↓</kbd>
                <span>navegar</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">↵</kbd>
                <span>seleccionar</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">esc</kbd>
                <span>cerrar</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <CommandIcon className="w-3 h-3" />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;