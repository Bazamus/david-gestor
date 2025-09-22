import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService, ProjectFilters } from '@/services/projectService';
import { 
  Project,
  ProjectWithStats, 
  CreateProjectForm, 
  UpdateProjectForm,
  ProjectStatus,
  UseApiOptions,
  UseMutationOptions 
} from '@/types';
import { useNotifications } from '@/contexts/NotificationContext';

// Query Keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.all, 'stats', id] as const,
  clients: () => [...projectKeys.all, 'clients'] as const,
};

/**
 * Hook para obtener lista de proyectos
 */
export const useProjects = (filters?: ProjectFilters, options?: UseApiOptions) => {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectService.getProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true, // Refetch al volver a la ventana
    ...options,
  });
};

/**
 * Hook para obtener un proyecto específico
 */
export const useProject = (id: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más frescos
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener estadísticas de un proyecto
 */
export const useProjectStats = (id: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: () => projectService.getProjectStats(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minuto para estadísticas actualizadas
    refetchOnWindowFocus: true,
    ...options,
  });
};

/**
 * Hook para obtener proyectos activos
 */
export const useActiveProjects = (options?: UseApiOptions) => {
  return useProjects(
    { 
      status: [ProjectStatus.ACTIVE],
      sort_by: 'updated_at',
      sort_order: 'desc'
    },
    options
  );
};

/**
 * Hook para obtener proyectos recientes
 */
export const useRecentProjects = (limit: number = 5, options?: UseApiOptions) => {
  return useProjects(
    {
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit
    },
    options
  );
};

// ======================================
// MUTATION HOOKS
// ======================================

/**
 * Hook para crear un nuevo proyecto
 */
export const useCreateProject = (options?: UseMutationOptions<ProjectWithStats, CreateProjectForm>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const project = await projectService.createProject(data);
      // Convertir Project a ProjectWithStats
      return {
        ...project,
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0,
        completion_percentage: 0
      };
    },
    onSuccess: (data, variables) => {
      // Invalidar TODAS las queries relacionadas con proyectos
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.clients() });

      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Forzar refetch inmediato de las queries más importantes
      queryClient.refetchQueries({ queryKey: projectKeys.lists() });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      // Mostrar notificación de éxito
      addNotification({
        type: 'success',
        title: 'Proyecto creado',
        message: `El proyecto "${data.name}" ha sido creado exitosamente.`
      });

      // Callback personalizado
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      addNotification({
        type: 'error',
        title: 'Error al crear proyecto',
        message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.'
      });

      options?.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook para actualizar un proyecto
 */
export const useUpdateProject = (options?: UseMutationOptions<Project, { id: string; data: UpdateProjectForm }>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation<Project, Error, { id: string; data: UpdateProjectForm }>({
    mutationFn: ({ id, data }) => {
      console.log('useUpdateProject: Making API call with:', { id, data });
      return projectService.updateProject(id, data);
    },
    onSuccess: (data, variables) => {
      console.log('useUpdateProject: Success response:', data);
      console.log('useUpdateProject: Variables:', variables);
      
      // Invalidar TODAS las queries relacionadas con proyectos
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.stats(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.clients() });

      // Invalidar queries de dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Actualizar el caché específico de forma optimista
      queryClient.setQueryData(projectKeys.detail(variables.id), data);
      
      // Forzar refetch inmediato
      queryClient.refetchQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.refetchQueries({ queryKey: projectKeys.stats(variables.id) });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Proyecto actualizado',
        message: `El proyecto "${data.name}" ha sido actualizado.`
      });

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      console.error('useUpdateProject: Error:', error);
      console.error('useUpdateProject: Variables:', variables);
      
      addNotification({
        type: 'error',
        title: 'Error al actualizar proyecto',
        message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.'
      });

      options?.onError?.(error, variables);
    },
    ...options,
  });
};

/**
 * Hook para eliminar un proyecto
 */
export const useDeleteProject = (options?: UseMutationOptions<void, string>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: (data, projectId) => {
      // Remover de caché
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: projectKeys.stats(projectId) });

      // Invalidar listas
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.clients() });

      // Invalidar dashboard
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch
      queryClient.refetchQueries({ queryKey: projectKeys.lists() });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Proyecto eliminado',
        message: 'El proyecto ha sido eliminado exitosamente.'
      });

      options?.onSuccess?.(data, projectId);
    },
    onError: (error, projectId) => {
      addNotification({
        type: 'error',
        title: 'Error al eliminar proyecto',
        message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.'
      });

      options?.onError?.(error, projectId);
    },
    ...options,
  });
};

/**
 * Hook para archivar un proyecto
 */
export const useArchiveProject = (options?: UseMutationOptions<ProjectWithStats, string>) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: async (id: string) => {
      const project = await projectService.archiveProject(id);
      // Convertir Project a ProjectWithStats
      return {
        ...project,
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        total_estimated_hours: 0,
        total_actual_hours: 0,
        completion_percentage: 0
      };
    },
    onSuccess: (data, projectId) => {
      // Actualizar caché
      queryClient.setQueryData(projectKeys.detail(projectId), data);
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.clients() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Forzar refetch
      queryClient.refetchQueries({ queryKey: projectKeys.lists() });
      queryClient.refetchQueries({ queryKey: ['dashboard'] });
      
      addNotification({
        type: 'success',
        title: 'Proyecto archivado',
        message: `El proyecto "${data.name}" ha sido archivado.`
      });

      options?.onSuccess?.(data, projectId);
    },
    onError: (error, projectId) => {
      addNotification({
        type: 'error',
        title: 'Error al archivar proyecto',
        message: error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.'
      });

      options?.onError?.(error, projectId);
    },
    ...options,
  });
};

// ======================================
// UTILITY HOOKS
// ======================================

/**
 * Hook para prefetch de proyecto
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: projectKeys.detail(id),
      queryFn: () => projectService.getProjectById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook para buscar proyectos
 */
export const useSearchProjects = (query: string, options?: UseApiOptions) => {
  return useQuery({
    queryKey: [...projectKeys.lists(), 'search', query],
    queryFn: () => projectService.searchProjects(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    ...options,
  });
};

/**
 * Hook para obtener clientes únicos de proyectos
 */
export const useProjectClients = (options?: UseApiOptions) => {
  return useQuery({
    queryKey: projectKeys.clients(),
    queryFn: async () => {
      // Obtener todos los proyectos sin filtros para extraer clientes
      const projects = await projectService.getProjects();

      // Extraer clientes únicos del campo cliente_empresa
      const clientsSet = new Set<string>();
      projects.forEach(project => {
        if (project.cliente_empresa && project.cliente_empresa.trim()) {
          clientsSet.add(project.cliente_empresa.trim());
        }
      });

      // Convertir a array ordenado alfabéticamente
      const clients = Array.from(clientsSet).sort((a, b) => a.localeCompare(b));

      return clients;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false, // No refetch automático
    ...options,
  });
};