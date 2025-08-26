import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { Calendar, ChevronDown, X, Check } from 'lucide-react';

// Configurar moment para español
moment.locale('es');

// Función para obtener el nombre completo del mes en español
const getFullMonthName = (date: moment.Moment): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[date.month()];
};

interface DateRangePickerProps {
  dateRange: {
    start: moment.Moment;
    end: moment.Moment;
  };
  quickFilter: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  onQuickFilterChange: (filter: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom') => void;
  onDateRangeChange: (start: moment.Moment, end: moment.Moment) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  quickFilter,
  onQuickFilterChange,
  onDateRangeChange
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState(dateRange);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar modal al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsCustomOpen(false);
      }
    };

    if (isCustomOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isCustomOpen]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCustomOpen(false);
      }
    };

    if (isCustomOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isCustomOpen]);

  // Actualizar tempDateRange cuando cambie dateRange
  useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  const quickFilters = [
    { key: 'today', label: 'Hoy', icon: '📅' },
    { key: 'week', label: 'Semana', icon: '📆' },
    { key: 'month', label: 'Mes', icon: '🗓️' },
    { key: 'quarter', label: 'Trimestre', icon: '📊' },
    { key: 'year', label: 'Año', icon: '📈' },
    { key: 'custom', label: 'Personalizada', icon: '⚙️' }
  ];

  const formatDateRange = () => {
    if (quickFilter === 'custom') {
      return `${dateRange.start.format('DD/MM/YYYY')} - ${dateRange.end.format('DD/MM/YYYY')}`;
    }
    return quickFilters.find(f => f.key === quickFilter)?.label || 'Personalizada';
  };

  const handleQuickFilterClick = (filterKey: string) => {
    onQuickFilterChange(filterKey as any);
    if (filterKey === 'custom') {
      setIsCustomOpen(true);
    } else {
      setIsCustomOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    onDateRangeChange(tempDateRange.start, tempDateRange.end);
    onQuickFilterChange('custom');
    setIsCustomOpen(false);
  };

  const handleCancelCustomRange = () => {
    setTempDateRange(dateRange);
    setIsCustomOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Filtros rápidos compactos */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => handleQuickFilterClick(filter.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              quickFilter === filter.key
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <span className="text-sm">{filter.icon}</span>
            <span className="text-xs">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Selector de fecha personalizada compacto */}
      <div className="relative">
        <button
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 w-full"
        >
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rango Personalizado</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">{formatDateRange()}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCustomOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Modal flotante centrado */}
        {isCustomOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div 
              ref={modalRef}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 w-full max-w-md mx-4 transform transition-all duration-200"
            >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Seleccionar Fechas</h3>
                <button
                  onClick={handleCancelCustomRange}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={tempDateRange.start.format('YYYY-MM-DD')}
                    onChange={(e) => {
                      const newStart = moment(e.target.value);
                      setTempDateRange(prev => ({ ...prev, start: newStart }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={tempDateRange.end.format('YYYY-MM-DD')}
                    onChange={(e) => {
                      const newEnd = moment(e.target.value);
                      setTempDateRange(prev => ({ ...prev, end: newEnd }));
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Información compacta del rango */}
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  {tempDateRange.start.format('DD')} de {getFullMonthName(tempDateRange.start)} - {tempDateRange.end.format('DD')} de {getFullMonthName(tempDateRange.end)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {tempDateRange.end.diff(tempDateRange.start, 'days')} días
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleApplyCustomRange}
                  className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Aplicar
                </button>
                <button
                  onClick={handleCancelCustomRange}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Información del rango seleccionado compacta */}
      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <Calendar className="w-4 h-4 text-blue-500" />
        <div className="flex-1">
          <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
            {dateRange.start.format('DD')} de {getFullMonthName(dateRange.start)} - {dateRange.end.format('DD')} de {getFullMonthName(dateRange.end)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {dateRange.end.diff(dateRange.start, 'days')} días • {quickFilters.find(f => f.key === quickFilter)?.label}
          </div>
        </div>
        {quickFilter === 'custom' && (
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
            Personalizado
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker; 