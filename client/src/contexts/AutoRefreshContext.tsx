import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// ======================================
// TIPOS
// ======================================

interface AutoRefreshContextType {
  // Estado de actualización
  isRefreshing: boolean;
  lastRefreshTime: Date | null;
  
  // Funciones de actualización
  refreshAll: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshTimeEntries: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshProject: (projectId: string) => Promise<void>;
  refreshTask: (taskId: string) => Promise<void>;
  
  // Configuración
  setAutoRefreshInterval: (interval: number | null) => void;
  autoRefreshInterval: number | null;
}

// ======================================
// CONTEXTO
// ======================================

const AutoRefreshContext = createContext<AutoRefreshContextType | undefined>(undefined);

// ======================================
// PROVIDER
// ======================================

interface AutoRefreshProviderProps {
  children: React.ReactNode;
  defaultAutoRefreshInterval?: number; // en milisegundos
}

export function AutoRefreshProvider({ 
  children, 
  defaultAutoRefreshInterval = 5 * 60 * 1000 // 5 minutos por defecto
}: AutoRefreshProviderProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshIntervalState] = useState<number | null>(defaultAutoRefreshInterval);

  // ======================================
  // FUNCIONES DE ACTUALIZACIÓN
  // ======================================

  const refreshAll = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Invalidar todas las queries principales
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);

      // Forzar refetch de las queries más importantes
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['projects'] }),
        queryClient.refetchQueries({ queryKey: ['tasks'] }),
        queryClient.refetchQueries({ queryKey: ['time-entries'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard'] }),
      ]);

      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error durante la actualización automática:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshProjects = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.refetchQueries({ queryKey: ['projects'] });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar proyectos:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshTasks = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await queryClient.refetchQueries({ queryKey: ['tasks'] });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar tareas:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshTimeEntries = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      await queryClient.refetchQueries({ queryKey: ['time-entries'] });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar entradas de tiempo:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshDashboard = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.refetchQueries({ queryKey: ['dashboard'] });
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshProject = useCallback(async (projectId: string) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['project', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-by-project', projectId] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['project', projectId] }),
        queryClient.refetchQueries({ queryKey: ['project-stats', projectId] }),
        queryClient.refetchQueries({ queryKey: ['time-entries-by-project', projectId] }),
      ]);

      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar proyecto:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const refreshTask = useCallback(async (taskId: string) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task', taskId] }),
        queryClient.invalidateQueries({ queryKey: ['time-entries-by-task', taskId] }),
        queryClient.invalidateQueries({ queryKey: ['task-time-summary', taskId] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['task', taskId] }),
        queryClient.refetchQueries({ queryKey: ['time-entries-by-task', taskId] }),
        queryClient.refetchQueries({ queryKey: ['task-time-summary', taskId] }),
      ]);

      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRefreshing]);

  const setAutoRefreshInterval = useCallback((interval: number | null) => {
    setAutoRefreshIntervalState(interval);
  }, []);

  // ======================================
  // EFECTO PARA ACTUALIZACIÓN AUTOMÁTICA
  // ======================================

  useEffect(() => {
    if (!autoRefreshInterval) return;

    const intervalId = setInterval(() => {
      refreshAll();
    }, autoRefreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, refreshAll]);

  // ======================================
  // EFECTO PARA ACTUALIZACIÓN AL VOLVER A LA VENTANA
  // ======================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lastRefreshTime) {
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        // Si han pasado más de 5 minutos desde la última actualización, refrescar
        if (timeSinceLastRefresh > fiveMinutes) {
          refreshAll();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lastRefreshTime, refreshAll]);

  // ======================================
  // VALOR DEL CONTEXTO
  // ======================================

  const value: AutoRefreshContextType = {
    isRefreshing,
    lastRefreshTime,
    refreshAll,
    refreshProjects,
    refreshTasks,
    refreshTimeEntries,
    refreshDashboard,
    refreshProject,
    refreshTask,
    setAutoRefreshInterval,
    autoRefreshInterval,
  };

  return (
    <AutoRefreshContext.Provider value={value}>
      {children}
    </AutoRefreshContext.Provider>
  );
}

// ======================================
// HOOK PERSONALIZADO
// ======================================

export function useAutoRefresh() {
  const context = useContext(AutoRefreshContext);
  if (context === undefined) {
    throw new Error('useAutoRefresh must be used within an AutoRefreshProvider');
  }
  return context;
}
