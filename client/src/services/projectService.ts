import { apiClient, buildQueryParams } from './api';
import { 
  Project, 
  ProjectWithStats, 
  CreateProjectForm, 
  UpdateProjectForm,
  ProjectStatus,
  ApiResponse,
  ProjectListItem
} from '@/types';

// ======================================
// INTERFACES PARA FILTROS
// ======================================

export interface ProjectFilters {
  status?: ProjectStatus[];
  search?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'status';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_percentage: number;
}

// ======================================
// SERVICIO DE PROYECTOS
// ======================================

class ProjectService {
  private readonly basePath = '/projects';

  /**
   * Obtener todos los proyectos con filtros opcionales
   */
  async getProjects(filters?: ProjectFilters): Promise<ProjectWithStats[]> {
    const endpoint = filters 
      ? `${this.basePath}?${buildQueryParams(filters)}`
      : this.basePath;

    const response = await apiClient.get<ApiResponse<ProjectWithStats[]>>(endpoint);
    return response.data || [];
  }

  /**
   * Obtener un proyecto específico por ID
   */
  async getProjectById(id: string): Promise<ProjectWithStats> {
    const response = await apiClient.get<ApiResponse<ProjectWithStats>>(`${this.basePath}/${id}`);
    
    if (!response.data) {
      throw new Error('Proyecto no encontrado');
    }
    
    return response.data;
  }

  /**
   * Crear un nuevo proyecto
   */
  async createProject(projectData: CreateProjectForm): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>(this.basePath, projectData);
    
    if (!response.data) {
      throw new Error('Error al crear proyecto');
    }
    
    return response.data;
  }

  /**
   * Actualizar un proyecto existente
   */
  async updateProject(id: string, projectData: UpdateProjectForm): Promise<Project> {
    console.log('projectService.updateProject: Called with:', { id, projectData });
    
    const response = await apiClient.put<ApiResponse<Project>>(`${this.basePath}/${id}`, projectData);
    
    console.log('projectService.updateProject: Response:', response);
    
    if (!response.data) {
      throw new Error('Error al actualizar proyecto');
    }
    
    return response.data;
  }

  /**
   * Eliminar un proyecto
   */
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Obtener estadísticas de un proyecto
   */
  async getProjectStats(id: string): Promise<ProjectStats> {
    const response = await apiClient.get<ApiResponse<ProjectStats>>(`${this.basePath}/${id}/stats`);
    
    if (!response.data) {
      throw new Error('Error al obtener estadísticas del proyecto');
    }
    
    return response.data;
  }

  /**
   * Obtener una lista simplificada de proyectos para filtros
   */
  async getProjectList(): Promise<ProjectListItem[]> {
    const response = await apiClient.get<ApiResponse<ProjectListItem[]>>(`${this.basePath}/list`);
    return response.data || [];
  }

  /**
   * Archivar un proyecto
   */
  async archiveProject(id: string): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(`${this.basePath}/${id}/archive`);
    
    if (!response.data) {
      throw new Error('Error al archivar proyecto');
    }
    
    return response.data;
  }

  /**
   * Obtener proyectos activos
   */
  async getActiveProjects(): Promise<ProjectWithStats[]> {
    return this.getProjects({
      status: [ProjectStatus.ACTIVE],
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  /**
   * Obtener proyectos recientes
   */
  async getRecentProjects(limit: number = 5): Promise<ProjectWithStats[]> {
    return this.getProjects({
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit
    });
  }

  /**
   * Buscar proyectos por nombre
   */
  async searchProjects(query: string, limit: number = 10): Promise<ProjectWithStats[]> {
    return this.getProjects({
      search: query,
      sort_by: 'updated_at',
      sort_order: 'desc',
      limit
    });
  }

  /**
   * Obtener proyectos por estado
   */
  async getProjectsByStatus(status: ProjectStatus[]): Promise<ProjectWithStats[]> {
    return this.getProjects({
      status,
      sort_by: 'name',
      sort_order: 'asc'
    });
  }

  /**
   * Obtener proyectos con filtro de fecha
   */
  async getProjectsByDateRange(startDate: string, endDate?: string): Promise<ProjectWithStats[]> {
    return this.getProjects({
      start_date: startDate,
      end_date: endDate,
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  }

  /**
   * Validar datos de proyecto antes de enviar
   */
  validateProjectData(data: CreateProjectForm | UpdateProjectForm): string[] {
    const errors: string[] = [];

    if ('name' in data && (!data.name || data.name.trim().length === 0)) {
      errors.push('El nombre del proyecto es requerido');
    }

    if ('name' in data && data.name && data.name.length > 255) {
      errors.push('El nombre del proyecto no puede exceder 255 caracteres');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('La descripción no puede exceder 2000 caracteres');
    }

    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      errors.push('El color debe ser un código hex válido (ej: #3B82F6)');
    }

    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate < startDate) {
        errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
      }
    }

    return errors;
  }

  /**
   * Obtener colores predefinidos para proyectos
   */
  getProjectColors(): Array<{ name: string; value: string; preview: string }> {
    return [
      { name: 'Azul', value: '#3B82F6', preview: 'bg-blue-500' },
      { name: 'Verde', value: '#10B981', preview: 'bg-green-500' },
      { name: 'Amarillo', value: '#F59E0B', preview: 'bg-yellow-500' },
      { name: 'Rojo', value: '#EF4444', preview: 'bg-red-500' },
      { name: 'Púrpura', value: '#8B5CF6', preview: 'bg-purple-500' },
      { name: 'Rosa', value: '#EC4899', preview: 'bg-pink-500' },
      { name: 'Indigo', value: '#6366F1', preview: 'bg-indigo-500' },
      { name: 'Teal', value: '#14B8A6', preview: 'bg-teal-500' },
      { name: 'Naranja', value: '#F97316', preview: 'bg-orange-500' },
      { name: 'Gris', value: '#6B7280', preview: 'bg-gray-500' },
    ];
  }

  /**
   * Obtener estados de proyecto con sus etiquetas
   */
  getProjectStatuses(): Array<{ value: ProjectStatus; label: string; color: string; description: string }> {
    return [
      {
        value: ProjectStatus.PLANNING,
        label: 'Planificación',
        color: 'text-purple-600 bg-purple-100',
        description: 'Proyecto en fase de planificación'
      },
      {
        value: ProjectStatus.ACTIVE,
        label: 'Activo',
        color: 'text-green-600 bg-green-100',
        description: 'Proyecto en desarrollo activo'
      },
      {
        value: ProjectStatus.ON_HOLD,
        label: 'En pausa',
        color: 'text-yellow-600 bg-yellow-100',
        description: 'Proyecto temporalmente pausado'
      },
      {
        value: ProjectStatus.COMPLETED,
        label: 'Completado',
        color: 'text-blue-600 bg-blue-100',
        description: 'Proyecto finalizado exitosamente'
      },
      {
        value: ProjectStatus.ARCHIVED,
        label: 'Archivado',
        color: 'text-gray-600 bg-gray-100',
        description: 'Proyecto archivado'
      }
    ];
  }

  /**
   * Calcular progreso de proyecto basado en tareas
   */
  calculateProgress(project: ProjectWithStats): {
    percentage: number;
    status: 'danger' | 'warning' | 'success';
    message: string;
  } {
    const { completion_percentage, total_tasks } = project;

    if (total_tasks === 0) {
      return {
        percentage: 0,
        status: 'warning',
        message: 'Sin tareas asignadas'
      };
    }

    let status: 'danger' | 'warning' | 'success' = 'success';
    let message = '';

    if (completion_percentage < 25) {
      status = 'danger';
      message = 'Progreso muy bajo';
    } else if (completion_percentage < 75) {
      status = 'warning';
      message = 'En progreso';
    } else {
      status = 'success';
      message = 'Buen progreso';
    }

    return {
      percentage: completion_percentage,
      status,
      message
    };
  }
}

// ======================================
// INSTANCIA SINGLETON
// ======================================

const projectService = new ProjectService();

export const getProjectList = projectService.getProjectList.bind(projectService);

export { projectService };
export default projectService;