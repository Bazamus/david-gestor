import { apiClient } from './api';
import { 
  DashboardStats,
  ProductivityStats,
  ProjectProgress,
  TimeMetrics,
  RecentActivity,
  ApiResponse 
} from '@/types';

// ======================================
// INTERFACES ADICIONALES
// ======================================

export interface QuickSummary {
  active_projects: any[];
  recent_tasks: any[];
  overdue_tasks: any[];
  upcoming_tasks: any[];
  counts: {
    active_projects: number;
    recent_tasks: number;
    overdue_tasks: number;
    upcoming_tasks: number;
  };
}

export interface ProjectsProgressSummary {
  projects: ProjectProgress[];
  summary: {
    total_projects: number;
    completed_projects: number;
    average_completion: number;
    projects_on_track: number;
    projects_behind: number;
  };
}

// ======================================
// SERVICIO DE DASHBOARD
// ======================================

class DashboardService {
  private readonly basePath = '/dashboard';

  /**
   * Obtener estadísticas completas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<DashboardStats>>(`${this.basePath}/stats`);
    
    if (!response.data) {
      throw new Error('Error al obtener estadísticas del dashboard');
    }
    
    return response.data;
=======
    const response = await apiClient.get<DashboardStats>(`${this.basePath}/stats`);
    
    if (!response) {
      throw new Error('Error al obtener estadísticas del dashboard');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener resumen rápido para la página principal
   */
  async getQuickSummary(): Promise<QuickSummary> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<QuickSummary>>(`${this.basePath}/summary`);
    
    if (!response.data) {
      throw new Error('Error al obtener resumen rápido');
    }
    
    return response.data;
=======
    const response = await apiClient.get<QuickSummary>(`${this.basePath}/summary`);
    
    if (!response) {
      throw new Error('Error al obtener resumen rápido');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener estadísticas de productividad
   */
  async getProductivityStats(): Promise<ProductivityStats> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<ProductivityStats>>(`${this.basePath}/productivity`);
    
    if (!response.data) {
      throw new Error('Error al obtener estadísticas de productividad');
    }
    
    return response.data;
=======
    const response = await apiClient.get<ProductivityStats>(`${this.basePath}/productivity`);
    
    if (!response) {
      throw new Error('Error al obtener estadísticas de productividad');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener progreso de todos los proyectos
   */
  async getProjectsProgress(): Promise<ProjectsProgressSummary> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<ProjectsProgressSummary>>(`${this.basePath}/projects-progress`);
    
    if (!response.data) {
      throw new Error('Error al obtener progreso de proyectos');
    }
    
    return response.data;
=======
    const response = await apiClient.get<ProjectsProgressSummary>(`${this.basePath}/projects-progress`);
    
    if (!response) {
      throw new Error('Error al obtener progreso de proyectos');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener actividad reciente
   */
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    const response = await apiClient.get<ApiResponse<RecentActivity[]>>(
      `${this.basePath}/recent-activity?limit=${limit}`
    );
    
    return response.data || [];
  }

  /**
   * Obtener métricas de tiempo y estimaciones
   */
  async getTimeMetrics(): Promise<TimeMetrics> {
    const response = await apiClient.get<ApiResponse<TimeMetrics>>(`${this.basePath}/time-metrics`);
    
    if (!response.data) {
      throw new Error('Error al obtener métricas de tiempo');
    }
    
    return response.data;
  }

  // ======================================
  // MÉTODOS DE UTILIDAD
  // ======================================

  /**
   * Formatear estadísticas para gráficos
   */
  formatStatsForCharts(stats: DashboardStats) {
    return {
      // Datos para gráfico de tareas por estado
      tasksByStatus: [
        { name: 'Completadas', value: stats.completed_tasks, color: '#10B981' },
        { name: 'Pendientes', value: stats.pending_tasks, color: '#3B82F6' },
        { name: 'Vencidas', value: stats.overdue_tasks, color: '#EF4444' }
      ],

      // Datos para gráfico de proyectos por estado
      projectsByStatus: [
        { name: 'Activos', value: stats.active_projects, color: '#10B981' },
        { name: 'Total', value: stats.total_projects, color: '#6B7280' }
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
          change: '+0%', // TODO: Calcular cambio real
          trend: 'up' as const,
          color: 'green'
        },
        {
          label: 'Tareas Vencidas',
          value: stats.overdue_tasks,
          change: '+0%', // TODO: Calcular cambio real
          trend: 'down' as const,
          color: 'red'
        },
        {
          label: 'Proyectos Activos',
          value: stats.active_projects,
          change: '+0%', // TODO: Calcular cambio real
          trend: 'up' as const,
          color: 'purple'
        }
      ]
    };
  }

  /**
   * Formatear productividad para gráficos
   */
  formatProductivityForCharts(productivity: ProductivityStats) {
    return {
      // Distribución por prioridad
      priorityDistribution: [
        { name: 'Urgente', value: productivity.priority_distribution.urgent, color: '#EF4444' },
        { name: 'Alta', value: productivity.priority_distribution.high, color: '#F97316' },
        { name: 'Media', value: productivity.priority_distribution.medium, color: '#F59E0B' },
        { name: 'Baja', value: productivity.priority_distribution.low, color: '#3B82F6' }
      ],

      // Distribución por estado
      statusDistribution: [
        { name: 'Por hacer', value: productivity.status_distribution.todo, color: '#6B7280' },
        { name: 'En progreso', value: productivity.status_distribution.in_progress, color: '#3B82F6' },
        { name: 'Completado', value: productivity.status_distribution.done, color: '#10B981' }
      ],

      // Métricas de tiempo
      timeStats: [
        { label: 'Hoy', value: productivity.tasks_completed_today },
        { label: 'Esta semana', value: productivity.tasks_completed_this_week },
        { label: 'Este mes', value: productivity.tasks_completed_this_month }
      ]
    };
  }

  /**
   * Formatear progreso de proyectos
   */
  formatProjectsProgress(progressData: ProjectsProgressSummary) {
    return {
      // Datos para gráfico de barras de progreso
      progressChart: progressData.projects.map(project => ({
        name: project.name,
        completion: project.completion_percentage,
        total_tasks: project.total_tasks,
        color: project.color
      })),

      // Proyectos destacados
      highlights: {
        mostAdvanced: progressData.projects
          .filter(p => p.total_tasks > 0)
          .sort((a, b) => b.completion_percentage - a.completion_percentage)[0],
        
        mostBehind: progressData.projects
          .filter(p => p.total_tasks > 0 && p.completion_percentage < 50)
          .sort((a, b) => a.completion_percentage - b.completion_percentage)[0],
        
        mostActive: progressData.projects
          .sort((a, b) => b.total_tasks - a.total_tasks)[0]
      },

      // Resumen general
      summary: progressData.summary
    };
  }

  /**
   * Formatear métricas de tiempo
   */
  formatTimeMetrics(timeMetrics: TimeMetrics) {
    return {
      // Comparación estimado vs real
      estimationChart: [
        { name: 'Horas Estimadas', value: timeMetrics.total_estimated_hours, color: '#3B82F6' },
        { name: 'Horas Reales', value: timeMetrics.total_actual_hours, color: '#10B981' }
      ],

      // Métricas de precisión
      accuracyMetrics: [
        {
          label: 'Precisión de Estimación',
          value: `${timeMetrics.estimation_accuracy}%`,
          status: timeMetrics.estimation_accuracy >= 80 ? 'good' : 
                 timeMetrics.estimation_accuracy >= 60 ? 'warning' : 'poor'
        },
        {
          label: 'Eficiencia',
          value: `${timeMetrics.efficiency_percentage}%`,
          status: timeMetrics.efficiency_percentage >= 90 ? 'good' : 
                 timeMetrics.efficiency_percentage >= 70 ? 'warning' : 'poor'
        },
        {
          label: 'Tiempo Promedio/Tarea',
          value: `${timeMetrics.average_time_per_task}h`,
          status: 'neutral'
        }
      ],

      // Varianza de tiempo
      timeVariance: {
        value: timeMetrics.time_variance,
        isPositive: timeMetrics.time_variance > 0,
        message: timeMetrics.time_variance > 0 
          ? 'Se está tomando más tiempo del estimado'
          : timeMetrics.time_variance < 0 
          ? 'Se está completando antes del tiempo estimado'
          : 'El tiempo real coincide con el estimado'
      }
    };
  }

  /**
   * Generar insights automáticos basados en las estadísticas
   */
  generateInsights(stats: DashboardStats): Array<{
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    action?: string;
  }> {
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
        message: `Solo has completado el ${completionRate.toFixed(1)}% de tus tareas. Considera revisar tus prioridades.`,
        action: 'Ver consejos de productividad'
      });
    }

    // Insight sobre próximas tareas
    if (stats.upcoming_tasks.length > 0) {
      insights.push({
        type: 'info' as const,
        title: 'Próximas Tareas',
        message: `Tienes ${stats.upcoming_tasks.length} tareas que vencen en los próximos días.`,
        action: 'Ver calendario'
      });
    }

    // Insight sobre proyectos
    if (stats.active_projects === 0 && stats.total_projects > 0) {
      insights.push({
        type: 'warning' as const,
        title: 'Sin Proyectos Activos',
        message: 'No tienes proyectos activos. Considera activar algún proyecto para mantener el momentum.',
        action: 'Activar proyecto'
      });
    }

    return insights;
  }

  /**
   * Calcular tendencias (simulado - en implementación real vendría del backend)
   */
  calculateTrends() {
    // Datos simulados - en implementación real estos vendrían del backend
    return {
      tasksCompletedTrend: {
        current: 45,
        previous: 38,
        change: 18.4,
        direction: 'up' as const
      },
      projectsActiveTrend: {
        current: 8,
        previous: 6,
        change: 33.3,
        direction: 'up' as const
      },
      productivityTrend: {
        current: 78,
        previous: 65,
        change: 20.0,
        direction: 'up' as const
      }
    };
  }
}

// ======================================
// INSTANCIA SINGLETON
// ======================================

export const dashboardService = new DashboardService();
export default dashboardService;