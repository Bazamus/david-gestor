import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { UseApiOptions } from '@/types';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  productivity: () => [...dashboardKeys.all, 'productivity'] as const,
  projectsProgress: () => [...dashboardKeys.all, 'projects-progress'] as const,
  recentActivity: (limit?: number) => [...dashboardKeys.all, 'recent-activity', limit] as const,
  timeMetrics: () => [...dashboardKeys.all, 'time-metrics'] as const,
};

// ======================================
// QUERY HOOKS
// ======================================

/**
 * Hook para obtener estadísticas completas del dashboard
 */
export const useDashboardStats = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 15 * 60 * 1000, // Refetch cada 15 minutos
    ...options,
  });
};

/**
 * Hook para obtener resumen rápido
 */
export const useQuickSummary = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: () => dashboardService.getQuickSummary(),
    staleTime: 3 * 60 * 1000, // 3 minutos
    refetchInterval: 10 * 60 * 1000, // Refetch cada 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener estadísticas de productividad
 */
export const useProductivityStats = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.productivity(),
    queryFn: () => dashboardService.getProductivityStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options,
  });
};

/**
 * Hook para obtener progreso de proyectos
 */
export const useProjectsProgress = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.projectsProgress(),
    queryFn: () => dashboardService.getProjectsProgress(),
    staleTime: 3 * 60 * 1000, // 3 minutos
    ...options,
  });
};

/**
 * Hook para obtener actividad reciente
 */
export const useRecentActivity = (limit: number = 20, options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(limit),
    queryFn: () => dashboardService.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000, // 1 minuto
    ...options,
  });
};

/**
 * Hook para obtener métricas de tiempo
 */
export const useTimeMetrics = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: dashboardKeys.timeMetrics(),
    queryFn: () => dashboardService.getTimeMetrics(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

// ======================================
// HOOKS COMBINADOS Y DERIVADOS
// ======================================

/**
 * Hook que combina datos esenciales para el dashboard
 */
export const useDashboardData = (options?: UseApiOptions) => {
  const statsQuery = useDashboardStats(options);
  const summaryQuery = useQuickSummary(options);
  const productivityQuery = useProductivityStats(options);

  return {
    stats: statsQuery,
    summary: summaryQuery,
    productivity: productivityQuery,
    isLoading: statsQuery.isLoading || summaryQuery.isLoading || productivityQuery.isLoading,
    isError: statsQuery.isError || summaryQuery.isError || productivityQuery.isError,
    error: statsQuery.error || summaryQuery.error || productivityQuery.error,
    refetchAll: () => {
      statsQuery.refetch();
      summaryQuery.refetch();
      productivityQuery.refetch();
    },
  };
};

/**
 * Hook para datos de gráficos del dashboard
 */
export const useDashboardCharts = (options?: UseApiOptions) => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats(options);
  const { data: productivity, isLoading: productivityLoading } = useProductivityStats(options);

  // Procesar datos para gráficos
  const chartData = React.useMemo(() => {
    if (!stats || !productivity) return null;

    return {
      // Datos para gráfico de tareas por estado
      tasksByStatus: [
        { name: 'Completadas', value: stats.completed_tasks, color: '#10B981' },
        { name: 'Pendientes', value: stats.pending_tasks, color: '#3B82F6' },
        { name: 'Vencidas', value: stats.overdue_tasks, color: '#EF4444' }
      ],

      // Datos para gráfico de prioridades
      tasksByPriority: [
        { name: 'Urgente', value: productivity.priority_distribution.urgent, color: '#EF4444' },
        { name: 'Alta', value: productivity.priority_distribution.high, color: '#F97316' },
        { name: 'Media', value: productivity.priority_distribution.medium, color: '#F59E0B' },
        { name: 'Baja', value: productivity.priority_distribution.low, color: '#3B82F6' }
      ],

      // Métricas principales
      keyMetrics: [
        {
          label: 'Proyectos Totales',
          value: stats.total_projects,
          change: '+0%', // TODO: Calcular cambio real
          trend: 'up' as const,
          color: 'blue'
        },
        {
          label: 'Tareas Completadas',
          value: stats.completed_tasks,
          change: '+0%',
          trend: 'up' as const,
          color: 'green'
        },
        {
          label: 'Tareas Vencidas',
          value: stats.overdue_tasks,
          change: '+0%',
          trend: 'down' as const,
          color: 'red'
        },
        {
          label: 'Proyectos Activos',
          value: stats.active_projects,
          change: '+0%',
          trend: 'up' as const,
          color: 'purple'
        }
      ]
    };
  }, [stats, productivity]);

  return {
    data: chartData,
    isLoading: statsLoading || productivityLoading,
    isError: !chartData && !statsLoading && !productivityLoading,
  };
};

/**
 * Hook para insights automáticos
 */
export const useDashboardInsights = (options?: UseApiOptions) => {
  const { data: stats } = useDashboardStats(options);

  const insights = React.useMemo(() => {
    if (!stats) return [];

    const insights = [];

    // Insight sobre tareas vencidas
    if (stats.overdue_tasks > 0) {
      insights.push({
        type: 'error' as const,
        title: 'Tareas Vencidas',
        message: `Tienes ${stats.overdue_tasks} tareas vencidas que requieren atención inmediata.`,
        action: 'Ver tareas vencidas'
      });
    }

    // Insight sobre productividad
    const completionRate = stats.total_tasks > 0 
      ? (stats.completed_tasks / stats.total_tasks) * 100 
      : 0;

    if (completionRate >= 80) {
      insights.push({
        type: 'success' as const,
        title: 'Excelente Productividad',
        message: `Has completado el ${completionRate.toFixed(1)}% de tus tareas. ¡Sigue así!`
      });
    } else if (completionRate < 50) {
      insights.push({
        type: 'warning' as const,
        title: 'Oportunidad de Mejora',
        message: `Solo has completado el ${completionRate.toFixed(1)}% de tus tareas. Considera revisar tus prioridades.`
      });
    }

    // Insight sobre próximas tareas
    if (stats.upcoming_tasks.length > 0) {
      insights.push({
        type: 'info' as const,
        title: 'Próximas Tareas',
        message: `Tienes ${stats.upcoming_tasks.length} tareas que vencen en los próximos días.`
      });
    }

    return insights;
  }, [stats]);

  return insights;
};