import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskFilters } from '@/services/taskService';
import { 
  Task, 
  CreateTaskForm, 
  UpdateTaskForm,
  TaskStatus,
  TaskPriority,
  UseApiOptions,
  UseMutationOptions 
} from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  project: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  kanban: (projectId: string) => [...taskKeys.all, 'kanban', projectId] as const,
  overdue: () => [...taskKeys.all, 'overdue'] as const,
  upcoming: () => [...taskKeys.all, 'upcoming'] as const,
};

// ======================================
// QUERY HOOKS
// ======================================

/**
 * Hook para obtener lista de tareas con filtros
 */
export const useTasks = (filters?: TaskFilters, options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskService.getTasks(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener una tarea específica
 */
export const useTask = (id: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.getTaskById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas de un proyecto específico
 */
export const useProjectTasks = (projectId: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.project(projectId),
    queryFn: () => taskService.getProjectTasks(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 segundos para datos muy frescos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas organizadas para Kanban
 */
export const useKanbanTasks = (projectId: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.kanban(projectId),
    queryFn: () => taskService.getKanbanTasks(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 segundos para Kanban en tiempo real
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas vencidas
 */
export const useOverdueTasks = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.overdue(),
    queryFn: () => taskService.getOverdueTasks(),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas próximas a vencer
 */
export const useUpcomingTasks = (days: number = 7, options?: UseApiOptions) => {
  return useQuery({
    queryKey: taskKeys.upcoming(),
    queryFn: () => taskService.getUpcomingTasks(days),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas por prioridad
 */
export const useTasksByPriority = (priorities: TaskPriority[], options?: UseApiOptions) => {
  return useQuery({
    queryKey: [...taskKeys.all, 'priority', priorities],
    queryFn: () => taskService.getTasksByPriority(priorities),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener tareas por etiquetas
 */
export const useTasksByTags = (tags: string[], options?: UseApiOptions) => {
  return useQuery({
    queryKey: [...taskKeys.all, 'tags', tags],
    queryFn: () => taskService.getTasksByTags(tags),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para buscar tareas
 */
export const useSearchTasks = (query: string, projectId?: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: [...taskKeys.all, 'search', query, projectId],
    queryFn: () => taskService.searchTasks(query, projectId),
    enabled: !!query && query.length > 2,
    staleTime: 30 * 1000, // 30 segundos para búsquedas
    refetchOnWindowFocus: true,
    ...options,
  });
};

// ======================================
// MUTATION HOOKS
// ======================================

/**
 * Hook para crear una nueva tarea
 */
export const useCreateTask = (options?: UseMutationOptions<Task, CreateTaskForm>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (taskData: CreateTaskForm) => taskService.createTask(taskData),
    onSuccess: (newTask) => {
      // Invalidar TODAS las queries relacionadas con tareas
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(newTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(newTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos para actualizar estadísticas
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', newTask.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', newTask.project_id] });
      
      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato de las queries más importantes
      queryClient.refetchQueries({ queryKey: taskKeys.project(newTask.project_id) });
      queryClient.refetchQueries({ queryKey: taskKeys.kanban(newTask.project_id) });
      queryClient.refetchQueries({ queryKey: ['project', newTask.project_id] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Tarea creada',
        message: `La tarea "${newTask.title}" se ha creado correctamente`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al crear tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

/**
 * Hook para actualizar una tarea
 */
export const useUpdateTask = (options?: UseMutationOptions<Task, { id: string; data: UpdateTaskForm }>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskForm }) => 
      taskService.updateTask(id, data),
    onSuccess: (updatedTask) => {
      // Actualizar cache de la tarea específica de forma optimista
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);
      
      // Invalidar TODAS las queries relacionadas con tareas
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(updatedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(updatedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedTask.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', updatedTask.project_id] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: taskKeys.project(updatedTask.project_id) });
      queryClient.refetchQueries({ queryKey: taskKeys.kanban(updatedTask.project_id) });
      queryClient.refetchQueries({ queryKey: ['project', updatedTask.project_id] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Tarea actualizada',
        message: `La tarea "${updatedTask.title}" se ha actualizado correctamente`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al actualizar tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

/**
 * Hook para actualizar posición de tarea (Kanban)
 */
export const useUpdateTaskPosition = (options?: UseMutationOptions<Task, { 
  taskId: string; 
  newStatus: TaskStatus; 
  newPosition: number 
}>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ taskId, newStatus, newPosition }: { 
      taskId: string; 
      newStatus: TaskStatus; 
      newPosition: number 
    }) => taskService.updateTaskPosition(taskId, { 
      position: newPosition, 
      status: newStatus 
    }),
    onSuccess: (updatedTask) => {
      // Invalidar queries de Kanban y proyecto inmediatamente
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(updatedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(updatedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedTask.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', updatedTask.project_id] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato para Kanban
      queryClient.refetchQueries({ queryKey: taskKeys.kanban(updatedTask.project_id) });
      queryClient.refetchQueries({ queryKey: taskKeys.project(updatedTask.project_id) });
      queryClient.refetchQueries({ queryKey: ['project', updatedTask.project_id] });
      
      // No mostrar notificación para movimientos de Kanban
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al mover tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

/**
 * Hook para completar una tarea
 */
export const useCompleteTask = (options?: UseMutationOptions<Task, string>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (taskId: string) => taskService.completeTask(taskId),
    onSuccess: (completedTask) => {
      // Invalidar TODAS las queries relacionadas
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(completedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(completedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', completedTask.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', completedTask.project_id] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: taskKeys.project(completedTask.project_id) });
      queryClient.refetchQueries({ queryKey: taskKeys.kanban(completedTask.project_id) });
      queryClient.refetchQueries({ queryKey: ['project', completedTask.project_id] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Tarea completada',
        message: `La tarea "${completedTask.title}" se ha marcado como completada`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al completar tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

/**
 * Hook para reabrir una tarea
 */
export const useReopenTask = (options?: UseMutationOptions<Task, string>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (taskId: string) => taskService.reopenTask(taskId),
    onSuccess: (reopenedTask) => {
      // Invalidar TODAS las queries relacionadas
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.project(reopenedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.kanban(reopenedTask.project_id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', reopenedTask.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', reopenedTask.project_id] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: taskKeys.project(reopenedTask.project_id) });
      queryClient.refetchQueries({ queryKey: taskKeys.kanban(reopenedTask.project_id) });
      queryClient.refetchQueries({ queryKey: ['project', reopenedTask.project_id] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Tarea reabierta',
        message: `La tarea "${reopenedTask.title}" se ha reabierto`,
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al reabrir tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

/**
 * Hook para eliminar una tarea
 */
export const useDeleteTask = (options?: UseMutationOptions<void, string>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Remover del cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });
      
      // Invalidar TODAS las queries relacionadas
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.overdue() });
      queryClient.invalidateQueries({ queryKey: taskKeys.upcoming() });
      
      // Invalidar queries de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch
      queryClient.refetchQueries({ queryKey: taskKeys.lists() });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Tarea eliminada',
        message: 'La tarea se ha eliminado correctamente',
      });
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Error al eliminar tarea',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
    ...options,
  });
};

// ======================================
// UTILITY HOOKS
// ======================================

/**
 * Hook para obtener opciones de estado de tareas
 */
export const useTaskStatuses = () => {
  return taskService.getTaskStatuses();
};

/**
 * Hook para obtener opciones de prioridad de tareas
 */
export const useTaskPriorities = () => {
  return taskService.getTaskPriorities();
};

/**
 * Hook para obtener etiquetas únicas
 */
export const useUniqueTags = (projectId?: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: [...taskKeys.all, 'tags', 'unique', projectId],
    queryFn: () => taskService.getUniqueTags(projectId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para prefetch de tareas
 */
export const usePrefetchTasks = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchTask: (id: string) => 
      queryClient.prefetchQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => taskService.getTaskById(id),
      }),
    prefetchProjectTasks: (projectId: string) =>
      queryClient.prefetchQuery({
        queryKey: taskKeys.project(projectId),
        queryFn: () => taskService.getProjectTasks(projectId),
      }),
  };
}; 