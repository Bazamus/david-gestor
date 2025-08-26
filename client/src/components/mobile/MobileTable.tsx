import React, { useState } from 'react';
<<<<<<< HEAD
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  Download
=======
import {
  TagIcon,
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
} from 'lucide-react';
import Button from '../common/Button';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  variant?: 'table' | 'cards' | 'auto';
  showActions?: boolean;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (row: any) => void;
    variant?: 'default' | 'danger' | 'primary';
  }[];
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sortable?: {
    column: string;
    direction: 'asc' | 'desc';
    onSort: (column: string, direction: 'asc' | 'desc') => void;
  };
}

const MobileTable: React.FC<MobileTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  variant = 'auto',
  showActions = true,
  actions = [],
  onRowClick,
  searchable = false,
  filterable = false,
  exportable = false,
  pagination,
  sortable
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Determinar el variant basado en el número de columnas y datos
  const getEffectiveVariant = () => {
    if (variant !== 'auto') return variant;
    
    // Si hay muchas columnas o datos complejos, usar cards
    if (columns.length > 4 || data.some(row => Object.keys(row).length > 6)) {
      return 'cards';
    }
    
    return 'table';
  };

  const effectiveVariant = getEffectiveVariant();

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('mobile-table-container');
    if (!container) return;

    const scrollAmount = 200;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newPosition);
  };

  const filteredData = searchable && searchTerm
    ? data.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : data;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const newDirection = sortable.column === columnKey && sortable.direction === 'asc' 
      ? 'desc' 
      : 'asc';
    
    sortable.onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortable || sortable.column !== columnKey) {
      return null;
    }
    
    return sortable.direction === 'asc' ? '↑' : '↓';
  };

  // Vista de tabla con scroll horizontal
  const renderTableView = () => (
    <div className="relative">
      {/* Controles de scroll */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleScroll('left')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Scroll left"
        >
<<<<<<< HEAD
          <ChevronLeft className="w-4 h-4" />
=======
          {/* ChevronLeft */}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
        </button>
        
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Desliza para ver más columnas
        </span>
        
        <button
          onClick={() => handleScroll('right')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Scroll right"
        >
<<<<<<< HEAD
          <ChevronRight className="w-4 h-4" />
=======
          {/* ChevronRight */}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
        </button>
      </div>

      {/* Tabla con scroll horizontal */}
      <div className="overflow-x-auto">
        <div
          id="mobile-table-container"
          className="inline-block min-w-full align-middle"
        >
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ minWidth: column.width || '120px' }}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {getSortIcon(column.key) && (
                        <span className="text-primary">{getSortIcon(column.key)}</span>
                      )}
                    </div>
                  </th>
                ))}
                {showActions && actions.length > 0 && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                  {showActions && actions.length > 0 && (
                    <td className="px-3 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              action.variant === 'danger' ? 'text-red-600 dark:text-red-400' :
                              action.variant === 'primary' ? 'text-primary' :
                              'text-gray-600 dark:text-gray-400'
                            }`}
                            aria-label={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Vista de cards
  const renderCardsView = () => (
    <div className="space-y-3">
      {filteredData.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
            onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
          }`}
          onClick={() => onRowClick?.(row)}
        >
          <div className="space-y-3">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {column.label}:
                </span>
                <div className="text-sm text-gray-900 dark:text-white text-right flex-1 ml-2">
                  {column.render 
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '-')
                  }
                </div>
              </div>
            ))}
            
            {showActions && actions.length > 0 && (
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                {actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                    }}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      action.variant === 'danger' 
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' :
                        action.variant === 'primary'
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header con controles */}
      <div className="mb-4 space-y-3">
        {/* Búsqueda y filtros */}
        <div className="flex items-center space-x-2">
          {searchable && (
            <div className="flex-1 relative">
<<<<<<< HEAD
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
=======
              {/* Search */}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
          
          {filterable && (
            <Button
              variant="outline"
              size="sm"
<<<<<<< HEAD
              icon={<Filter className="w-4 h-4" />}
=======
              icon={<TagIcon className="w-4 h-4" />}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
          )}
          
          {exportable && (
            <Button
              variant="outline"
              size="sm"
<<<<<<< HEAD
              icon={<Download className="w-4 h-4" />}
=======
              className="ml-2"
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
            >
              Exportar
            </Button>
          )}
        </div>

        {/* Información de resultados */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {filteredData.length} de {data.length} resultados
          </span>
          {effectiveVariant === 'table' && (
            <span className="text-xs">
              Desliza horizontalmente para ver más columnas
            </span>
          )}
        </div>
      </div>

      {/* Contenido de la tabla */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
<<<<<<< HEAD
            <Search className="w-6 h-6 text-gray-400" />
=======
            {/* Search */}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
          </div>
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {effectiveVariant === 'table' ? renderTableView() : renderCardsView()}
          
          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MobileTable;
