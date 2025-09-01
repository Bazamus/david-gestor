import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// ======================================
// HOOK PARA ACTUALIZACIONES AUTOMÁTICAS
// ======================================

/**
 * Hook personalizado para manejar actualizaciones automáticas de manera eficiente
 * Proporciona funciones para invalidar y refrescar queries de forma consistente
 */
export const useAutoRefresh = () => {
  const queryClient = useQueryClient();

  /**
   * Invalidar todas las queries relacionadas con proyectos
   */
  const invalidateProjects = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['project'] });
    queryClient.invalidateQueries({ queryKey: ['project-stats'] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries relacionadas con tareas
   */
  const invalidateTasks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task'] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries relacionadas con tiempo
   */
  const invalidateTimeEntries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['time-entry'] });
    queryClient.invalidateQueries({ queryKey: ['time-summary'] });
    queryClient.invalidateQueries({ queryKey: ['time-entries-by-task'] });
    queryClient.invalidateQueries({ queryKey: ['task-time-summary'] });
    queryClient.invalidateQueries({ queryKey: ['time-entries-by-project'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-summary'] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries del dashboard
   */
  const invalidateDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries relacionadas con un proyecto específico
   */
  const invalidateProject = useCallback((projectId: string) => {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
    queryClient.invalidateQueries({ queryKey: ['time-entries-by-project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-time-summary', projectId] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries relacionadas con una tarea específica
   */
  const invalidateTask = useCallback((taskId: string) => {
    queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    queryClient.invalidateQueries({ queryKey: ['time-entries-by-task', taskId] });
    queryClient.invalidateQueries({ queryKey: ['task-time-summary', taskId] });
  }, [queryClient]);

  /**
   * Invalidar todas las queries y forzar refetch inmediato
   */
  const invalidateAll = useCallback(() => {
    // Invalidar todas las queries principales
    invalidateProjects();
    invalidateTasks();
    invalidateTimeEntries();
    invalidateDashboard();

    // Forzar refetch de las queries más importantes
    queryClient.refetchQueries({ queryKey: ['projects'] });
    queryClient.refetchQueries({ queryKey: ['tasks'] });
    queryClient.refetchQueries({ queryKey: ['time-entries'] });
    queryClient.refetchQueries({ queryKey: ['dashboard'] });
  }, [queryClient, invalidateProjects, invalidateTasks, invalidateTimeEntries, invalidateDashboard]);

  /**
   * Invalidar y refrescar queries relacionadas con un proyecto específico
   */
  const refreshProject = useCallback((projectId: string) => {
    invalidateProject(projectId);
    
    // Forzar refetch inmediato
    queryClient.refetchQueries({ queryKey: ['project', projectId] });
    queryClient.refetchQueries({ queryKey: ['project-stats', projectId] });
    queryClient.refetchQueries({ queryKey: ['time-entries-by-project', projectId] });
    queryClient.refetchQueries({ queryKey: ['project-time-summary', projectId] });
    queryClient.refetchQueries({ queryKey: ['dashboard'] });
  }, [queryClient, invalidateProject]);

  /**
   * Invalidar y refrescar queries relacionadas con una tarea específica
   */
  const refreshTask = useCallback((taskId: string) => {
    invalidateTask(taskId);
    
    // Forzar refetch inmediato
    queryClient.refetchQueries({ queryKey: ['task', taskId] });
    queryClient.refetchQueries({ queryKey: ['time-entries-by-task', taskId] });
    queryClient.refetchQueries({ queryKey: ['task-time-summary', taskId] });
    queryClient.refetchQueries({ queryKey: ['dashboard'] });
  }, [queryClient, invalidateTask]);

  /**
   * Actualizar datos de forma optimista
   */
  const updateOptimistically = useCallback((
    queryKey: string[],
    updater: (oldData: any) => any
  ) => {
    queryClient.setQueryData(queryKey, updater);
  }, [queryClient]);

  /**
   * Remover datos del caché
   */
  const removeFromCache = useCallback((queryKey: string[]) => {
    queryClient.removeQueries({ queryKey });
  }, [queryClient]);

  return {
    // Funciones de invalidación
    invalidateProjects,
    invalidateTasks,
    invalidateTimeEntries,
    invalidateDashboard,
    invalidateProject,
    invalidateTask,
    invalidateAll,
    
    // Funciones de refresh
    refreshProject,
    refreshTask,
    
    // Funciones de caché
    updateOptimistically,
    removeFromCache,
    
    // Acceso directo al queryClient para casos especiales
    queryClient,
  };
};
