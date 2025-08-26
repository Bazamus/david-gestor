import { useState, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { TimelineItem, TimelineFilters, TimelineKPIsData } from '../types/timeline';

// Configurar moment para español
moment.locale('es');

export const useTimeline = () => {
  const [filters, setFilters] = useState<TimelineFilters>({
    dateRange: {
      start: moment().startOf('month'),
      end: moment().endOf('month')
    },
    quickFilter: 'month',
    view: 'projects'
  });

  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Función para aplicar filtros rápidos
  const applyQuickFilter = useCallback((filter: TimelineFilters['quickFilter']) => {
    const now = moment();
    let start: moment.Moment;
    let end: moment.Moment;

    switch (filter) {
      case 'today':
        start = now.clone().startOf('day');
        end = now.clone().endOf('day');
        break;
      case 'week':
        start = now.clone().startOf('week');
        end = now.clone().endOf('week');
        break;
      case 'month':
        start = now.clone().startOf('month');
        end = now.clone().endOf('month');
        break;
      case 'quarter':
        start = now.clone().startOf('quarter');
        end = now.clone().endOf('quarter');
        break;
      case 'year':
        start = now.clone().startOf('year');
        end = now.clone().endOf('year');
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
      quickFilter: filter
    }));
  }, []);

  // Función para actualizar filtros de fecha personalizados
  const updateDateRange = useCallback((start: moment.Moment, end: moment.Moment) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
      quickFilter: 'custom'
    }));
  }, []);

  // Función para cambiar vista
  const changeView = useCallback((view: TimelineFilters['view']) => {
    setFilters(prev => ({ ...prev, view }));
  }, []);

  // Función para abrir detalles de un item
  const openItemDetail = useCallback((item: TimelineItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  }, []);

  // Función para cerrar detalles
  const closeItemDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedItem(null);
  }, []);

  // Función para calcular KPIs (placeholder - se implementará con datos reales)
  const calculateKPIs = useCallback((): TimelineKPIsData => {
    // TODO: Implementar cálculo real con datos de la API
    return {
      activeProjects: 12,
      totalProjects: 15,
      completedTasks: 45,
      pendingTasks: 23,
      overdueTasks: 3,
      totalTasks: 71,
      averageProgress: 68,
      upcomingDeadlines: 5,
      criticalDeadlines: 2
    };
  }, []);

  return {
    filters,
    selectedItem,
    isDetailOpen,
    applyQuickFilter,
    updateDateRange,
    changeView,
    openItemDetail,
    closeItemDetail,
    calculateKPIs
  };
}; 