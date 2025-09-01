import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { UseApiOptions } from '@/types';

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
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
    staleTime: 2 * 60 * 1000, // 2 minutos (reducido para datos más frescos)
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
    refetchOnWindowFocus: true,
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
    staleTime: 1 * 60 * 1000, // 1 minuto para datos muy frescos
    refetchInterval: 3 * 60 * 1000, // Refetch cada 3 minutos
    refetchOnWindowFocus: true,
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
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
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
    staleTime: 30 * 1000, // 30 segundos para actividad en tiempo real
    refetchInterval: 2 * 60 * 1000, // Refetch cada 2 minutos
    refetchOnWindowFocus: true,
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Refetch cada 10 minutos
    refetchOnWindowFocus: true,
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

  return {
    stats: statsQuery,
    summary: summaryQuery,
    isLoading: statsQuery.isLoading || summaryQuery.isLoading,
    isError: statsQuery.isError || summaryQuery.isError,
    error: statsQuery.error || summaryQuery.error,
    refetchAll: () => {
      statsQuery.refetch();
      summaryQuery.refetch();
    },
  };
};

/**
 * Hook para datos de gráficos del dashboard
 */
export const useDashboardCharts = (options?: UseApiOptions) => {
  const { data: stats, isLoading, isError } = useDashboardStats(options);

  const chartData = React.useMemo(() => {
    if (!stats) return null;

    const formattedStats = dashboardService.formatStatsForCharts(stats);
    const formattedProductivity = dashboardService.formatProductivityForCharts(stats.productivity_stats);

    return {
      ...formattedStats,
      productivityCharts: formattedProductivity,
    };
  }, [stats]);

  return {
    data: chartData,
    isLoading,
    isError,
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
    if (stats.productivity_stats) {
      const { productivity_percentage } = stats.productivity_stats;
      if (productivity_percentage >= 80) {
        insights.push({
          type: 'success' as const,
          title: 'Excelente Productividad',
          message: `Tu productividad es del ${productivity_percentage.toFixed(1)}%. ¡Sigue así!`
        });
      } else if (productivity_percentage < 50) {
        insights.push({
          type: 'warning' as const,
          title: 'Oportunidad de Mejora',
          message: `Tu productividad es del ${productivity_percentage.toFixed(1)}%. Considera revisar tus prioridades.`
        });
      }
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