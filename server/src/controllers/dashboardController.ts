import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { 
  ApiResponse,
  DashboardStats,
  Task,
  TaskStatus,
  Project,
  ProjectStatus,
  TaskPriority
} from '../types';

// ======================================
// OBTENER ESTADÍSTICAS DEL DASHBOARD
// ======================================
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await supabaseService.getDashboardStats();

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
      message: 'Estadísticas del dashboard obtenidas exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener estadísticas del dashboard: ${error}`, 500));
  }
});

// ======================================
// RESUMEN RÁPIDO
// ======================================
export const getQuickSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener proyectos activos
    const activeProjects = await supabaseService.getProjects({
      status: [ProjectStatus.ACTIVE],
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit: 5
    });

    // Obtener tareas recientes
    const recentTasks = await supabaseService.getTasks({
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit: 10
    });

    // Obtener tareas vencidas
    const now = new Date().toISOString();
    const overdueTasks = await supabaseService.getTasks({
      status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      due_date_to: now,
      sort_by: 'due_date',
      sort_order: 'asc',
      limit: 5
    });

    // Obtener tareas próximas (próximos 3 días)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingTasks = await supabaseService.getTasks({
      status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      due_date_from: now,
      due_date_to: threeDaysFromNow.toISOString(),
      sort_by: 'due_date',
      sort_order: 'asc',
      limit: 5
    });

    const summary = {
      active_projects: activeProjects,
      recent_tasks: recentTasks,
      overdue_tasks: overdueTasks,
      upcoming_tasks: upcomingTasks,
      counts: {
        active_projects: activeProjects.length,
        recent_tasks: recentTasks.length,
        overdue_tasks: overdueTasks.length,
        upcoming_tasks: upcomingTasks.length,
      }
    };

    const response: ApiResponse = {
      success: true,
      data: summary,
      message: 'Resumen rápido obtenido exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener resumen rápido: ${error}`, 500));
  }
});

// ======================================
// ESTADÍSTICAS DE PRODUCTIVIDAD
// ======================================
export const getProductivityStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Tareas completadas hoy
    const tasksCompletedToday = await supabaseService.getTasks({
      status: [TaskStatus.DONE],
      // TODO: Filtrar por fecha de actualización >= startOfToday
    });

    // Tareas completadas esta semana
    const tasksCompletedThisWeek = await supabaseService.getTasks({
      status: [TaskStatus.DONE],
      // TODO: Filtrar por fecha de actualización >= startOfWeek
    });

    // Tareas completadas este mes
    const tasksCompletedThisMonth = await supabaseService.getTasks({
      status: [TaskStatus.DONE],
      // TODO: Filtrar por fecha de actualización >= startOfMonth
    });

    // Distribución por prioridad
    const allTasks = await supabaseService.getTasks({});
    const priorityDistribution = {
      urgent: allTasks.filter(t => t.priority === TaskPriority.URGENT).length,
      high: allTasks.filter(t => t.priority === TaskPriority.HIGH).length,
      medium: allTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      low: allTasks.filter(t => t.priority === TaskPriority.LOW).length,
    };

    // Distribución por estado
    const statusDistribution = {
      todo: allTasks.filter(t => t.status === TaskStatus.TODO).length,
      in_progress: allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      done: allTasks.filter(t => t.status === TaskStatus.DONE).length,
    };

    // Calcular tendencias (ejemplo básico)
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const productivity = {
      tasks_completed_today: tasksCompletedToday.length,
      tasks_completed_this_week: tasksCompletedThisWeek.length,
      tasks_completed_this_month: tasksCompletedThisMonth.length,
      completion_rate: completionRate,
      priority_distribution: priorityDistribution,
      status_distribution: statusDistribution,
      total_tasks: totalTasks,
      active_tasks: allTasks.filter(t => t.status !== 'done').length,
    };

    const response: ApiResponse = {
      success: true,
      data: productivity,
      message: 'Estadísticas de productividad obtenidas exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener estadísticas de productividad: ${error}`, 500));
  }
});

// ======================================
// PROGRESO DE PROYECTOS
// ======================================
export const getProjectsProgress = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener todos los proyectos activos con sus estadísticas
    const projects = await supabaseService.getProjects({
      status: [ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD]
    });

    // Ordenar por `completion_percentage` después de que se haya calculado
    projects.sort((a, b) => b.completion_percentage - a.completion_percentage);

    // Calcular métricas de progreso
    const progressData = projects.map(project => ({
      id: project.id,
      name: project.name,
      color: project.color,
      status: project.status,
      completion_percentage: project.completion_percentage,
      total_tasks: project.total_tasks,
      completed_tasks: project.completed_tasks,
      pending_tasks: project.pending_tasks,
      estimated_hours: project.total_estimated_hours,
      actual_hours: project.total_actual_hours,
      efficiency: project.total_estimated_hours > 0 
        ? Math.round((project.total_estimated_hours / (project.total_actual_hours || 1)) * 100)
        : 0
    }));

    // Estadísticas generales
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const averageCompletion = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.completion_percentage, 0) / totalProjects)
      : 0;

    const summary = {
      projects: progressData,
      summary: {
        total_projects: totalProjects,
        completed_projects: completedProjects,
        average_completion: averageCompletion,
        projects_on_track: projects.filter(p => p.completion_percentage >= 50).length,
        projects_behind: projects.filter(p => p.completion_percentage < 25 && p.status === 'active').length,
      }
    };

    const response: ApiResponse = {
      success: true,
      data: summary,
      message: 'Progreso de proyectos obtenido exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener progreso de proyectos: ${error}`, 500));
  }
});

// ======================================
// ACTIVIDAD RECIENTE
// ======================================
export const getRecentActivity = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    // Obtener proyectos recientes
    const recentProjects = await supabaseService.getProjects({
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit: Math.ceil(limit / 2)
    });

    // Obtener tareas recientes
    const recentTasks = await supabaseService.getTasks({
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit: Math.ceil(limit / 2)
    });

    // Combinar y formatear actividad
    const activity: any[] = [];

    // Agregar proyectos a la actividad
    recentProjects.forEach(project => {
      activity.push({
        id: `project-${project.id}`,
        type: 'project',
        action: 'updated',
        title: project.name,
        description: project.description || 'Sin descripción',
        timestamp: project.updated_at,
        metadata: {
          project_id: project.id,
          status: project.status,
          color: project.color
        }
      });
    });

    // Agregar tareas a la actividad
    recentTasks.forEach(task => {
      activity.push({
        id: `task-${task.id}`,
        type: 'task',
        action: task.status === 'done' ? 'completed' : 'updated',
        title: task.title,
        description: task.description || 'Sin descripción',
        timestamp: task.updated_at,
        metadata: {
          task_id: task.id,
          project_id: task.project_id,
          status: task.status,
          priority: task.priority
        }
      });
    });

    // Ordenar por timestamp y limitar
    const sortedActivity = activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    const response: ApiResponse = {
      success: true,
      data: sortedActivity,
      message: 'Actividad reciente obtenida exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener actividad reciente: ${error}`, 500));
  }
});

// ======================================
// MÉTRICAS DE TIEMPO
// ======================================
export const getTimeMetrics = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener todas las tareas con horas
    const allTasks = await supabaseService.getTasks({});

    // Calcular métricas de tiempo
    const tasksWithEstimatedHours = allTasks.filter(t => t.estimated_hours && t.estimated_hours > 0);
    const tasksWithActualHours = allTasks.filter(t => t.actual_hours && t.actual_hours > 0);
    const completedTasksWithBothHours = allTasks.filter(t => 
      t.status === 'done' && 
      t.estimated_hours && 
      t.actual_hours
    );

    const totalEstimatedHours = tasksWithEstimatedHours.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    const totalActualHours = tasksWithActualHours.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

    // Calcular precisión de estimación
    let estimationAccuracy = 0;
    if (completedTasksWithBothHours.length > 0) {
      const accuracySum = completedTasksWithBothHours.reduce((sum, task) => {
        const estimated = task.estimated_hours || 0;
        const actual = task.actual_hours || 0;
        if (estimated === 0) return sum;
        
        // Calcular qué tan cerca estuvo la estimación (100% = perfecto)
        const accuracy = Math.max(0, 100 - Math.abs((actual - estimated) / estimated) * 100);
        return sum + accuracy;
      }, 0);
      
      estimationAccuracy = Math.round(accuracySum / completedTasksWithBothHours.length);
    }

    // Tiempo promedio por tarea
    const averageTimePerTask = tasksWithActualHours.length > 0 
      ? Math.round(totalActualHours / tasksWithActualHours.length * 10) / 10
      : 0;

    // Eficiencia (estimado vs real)
    const efficiency = totalActualHours > 0 
      ? Math.round((totalEstimatedHours / totalActualHours) * 100)
      : 0;

    const timeMetrics = {
      total_estimated_hours: totalEstimatedHours,
      total_actual_hours: totalActualHours,
      tasks_with_time_tracking: tasksWithActualHours.length,
      average_time_per_task: averageTimePerTask,
      estimation_accuracy: estimationAccuracy,
      efficiency_percentage: efficiency,
      completed_tasks_tracked: completedTasksWithBothHours.length,
      time_variance: totalActualHours - totalEstimatedHours,
    };

    const response: ApiResponse = {
      success: true,
      data: timeMetrics,
      message: 'Métricas de tiempo obtenidas exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener métricas de tiempo: ${error}`, 500));
  }
});