import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntryService } from '@/services/timeEntryService';
import { 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest, 
  TimeEntryFilters
} from '@/types';

// ======================================
// HOOKS PARA TIME ENTRIES
// ======================================

// Hook para obtener entradas de tiempo
export const useTimeEntries = (filters: TimeEntryFilters = {}) => {
  return useQuery({
    queryKey: ['time-entries', filters],
    queryFn: () => timeEntryService.getTimeEntries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
};

// Hook para obtener una entrada de tiempo específica
export const useTimeEntry = (id: string) => {
  return useQuery({
    queryKey: ['time-entry', id],
    queryFn: () => timeEntryService.getTimeEntry(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
  });
};

// Hook para crear una entrada de tiempo
export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeEntryRequest) => timeEntryService.createTimeEntry(data),
    onSuccess: (_, variables) => {
      // Invalidar TODAS las queries relacionadas con tiempo
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entry'] });
      queryClient.invalidateQueries({ queryKey: ['time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-task'] });
      queryClient.invalidateQueries({ queryKey: ['task-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-project'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-summary'] });
      
      // Invalidar queries de tareas y proyectos
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Invalidación específica si se conoce la tarea
      if (variables?.task_id) {
        queryClient.invalidateQueries({ queryKey: ['time-entries-by-task', variables.task_id] });
        queryClient.invalidateQueries({ queryKey: ['task-time-summary', variables.task_id] });
        queryClient.invalidateQueries({ queryKey: ['task', variables.task_id] });
      }
      
      // Forzar refetch inmediato de las queries más importantes
      queryClient.refetchQueries({ queryKey: ['time-entries'] });
      queryClient.refetchQueries({ queryKey: ['time-summary'] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      if (variables?.task_id) {
        queryClient.refetchQueries({ queryKey: ['time-entries-by-task', variables.task_id] });
        queryClient.refetchQueries({ queryKey: ['task-time-summary', variables.task_id] });
      }
    },
  });
};

// Hook para actualizar una entrada de tiempo
export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimeEntryRequest }) =>
      timeEntryService.updateTimeEntry(id, data),
    onSuccess: (_, { id, data }) => {
      // Invalidar TODAS las queries relacionadas con tiempo
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entry', id] });
      queryClient.invalidateQueries({ queryKey: ['time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-task'] });
      queryClient.invalidateQueries({ queryKey: ['task-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-project'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-summary'] });
      
      // Invalidar queries de tareas y proyectos
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Invalidación específica si se conoce la tarea
      if (data?.task_id) {
        queryClient.invalidateQueries({ queryKey: ['time-entries-by-task', data.task_id] });
        queryClient.invalidateQueries({ queryKey: ['task-time-summary', data.task_id] });
        queryClient.invalidateQueries({ queryKey: ['task', data.task_id] });
      }
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['time-entries'] });
      queryClient.refetchQueries({ queryKey: ['time-summary'] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      if (data?.task_id) {
        queryClient.refetchQueries({ queryKey: ['time-entries-by-task', data.task_id] });
        queryClient.refetchQueries({ queryKey: ['task-time-summary', data.task_id] });
      }
    },
  });
};

// Hook para eliminar una entrada de tiempo
export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeEntryService.deleteTimeEntry(id),
    onSuccess: () => {
      // Invalidar TODAS las queries relacionadas con tiempo
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['time-entry'] });
      queryClient.invalidateQueries({ queryKey: ['time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-task'] });
      queryClient.invalidateQueries({ queryKey: ['task-time-summary'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries-by-project'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-summary'] });
      
      // Invalidar queries de tareas y proyectos
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-stats'] });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: ['time-entries'] });
      queryClient.refetchQueries({ queryKey: ['time-summary'] });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Hook para obtener resumen de tiempo
export const useTimeSummary = (filters: TimeEntryFilters = {}) => {
  return useQuery({
    queryKey: ['time-summary', filters],
    queryFn: () => timeEntryService.getTimeSummary(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
};

// Hook para obtener entradas de tiempo por tarea
export const useTimeEntriesByTask = (taskId: string) => {
  return useQuery({
    queryKey: ['time-entries-by-task', taskId],
    queryFn: () => timeEntryService.getTimeEntriesByTask(taskId),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
  });
};

// Hook para obtener resumen de tiempo por tarea
export const useTaskTimeSummary = (taskId: string) => {
  return useQuery({
    queryKey: ['task-time-summary', taskId],
    queryFn: () => timeEntryService.getTaskTimeSummary(taskId),
    enabled: !!taskId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
  });
};

// Hook para obtener entradas de tiempo por proyecto
export const useTimeEntriesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['time-entries-by-project', projectId],
    queryFn: () => timeEntryService.getTimeEntriesByProject(projectId),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
  });
};

// Hook para obtener resumen de tiempo por proyecto
export const useProjectTimeSummary = (projectId: string) => {
  return useQuery({
    queryKey: ['project-time-summary', projectId],
    queryFn: () => timeEntryService.getProjectTimeSummary(projectId),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
  });
};
