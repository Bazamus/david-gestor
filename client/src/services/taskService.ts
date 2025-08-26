import { apiClient, buildQueryParams } from './api';
import { 
  Task, 
  TaskWithProject,
  CreateTaskForm, 
  UpdateTaskForm,
  TaskStatus,
  TaskPriority,
  ApiResponse,
  KanbanColumn
} from '@/types';

// ======================================
// INTERFACES PARA FILTROS
// ======================================

export interface TaskFilters {
  project_id?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  tags?: string[];
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'position';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskPositionUpdate {
  position: number;
  status?: TaskStatus;
}

// ======================================
// SERVICIO DE TAREAS
// ======================================

class TaskService {
  private readonly basePath = '/tasks';

  /**
   * Obtener todas las tareas con filtros opcionales
   */
  async getTasks(filters?: TaskFilters): Promise<TaskWithProject[]> {
    const endpoint = filters 
      ? `${this.basePath}?${buildQueryParams(filters)}`
      : this.basePath;

<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<TaskWithProject[]>>(endpoint);
    return response.data || [];
=======
    const response = await apiClient.get<TaskWithProject[]>(endpoint);
    return response || [];
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener tareas de un proyecto específico
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<Task[]>>(`${this.basePath}/project/${projectId}`);
    return response.data || [];
=======
    const response = await apiClient.get<Task[]>(`${this.basePath}/project/${projectId}`);
    return response || [];
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Obtener una tarea específica por ID
   */
  async getTaskById(id: string): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.get<ApiResponse<Task>>(`${this.basePath}/${id}`);
    
    if (!response.data) {
      throw new Error('Tarea no encontrada');
    }
    
    return response.data;
=======
    const response = await apiClient.get<Task>(`${this.basePath}/${id}`);
    
    if (!response) {
      throw new Error('Tarea no encontrada');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Crear una nueva tarea
   */
  async createTask(taskData: CreateTaskForm): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.post<ApiResponse<Task>>(this.basePath, taskData);
    
    if (!response.data) {
      throw new Error('Error al crear tarea');
    }
    
    return response.data;
=======
    const response = await apiClient.post<Task>(this.basePath, taskData);
    
    if (!response) {
      throw new Error('Error al crear tarea');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Actualizar una tarea existente
   */
  async updateTask(id: string, taskData: UpdateTaskForm): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.put<ApiResponse<Task>>(`${this.basePath}/${id}`, taskData);
    
    if (!response.data) {
      throw new Error('Error al actualizar tarea');
    }
    
    return response.data;
=======
    const response = await apiClient.put<Task>(`${this.basePath}/${id}`, taskData);
    
    if (!response) {
      throw new Error('Error al actualizar tarea');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Actualizar posición de tarea (para Kanban)
   */
  async updateTaskPosition(id: string, positionData: TaskPositionUpdate): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.patch<ApiResponse<Task>>(`${this.basePath}/${id}/position`, positionData);
    
    if (!response.data) {
      throw new Error('Error al actualizar posición de tarea');
    }
    
    return response.data;
=======
    const response = await apiClient.patch<Task>(`${this.basePath}/${id}/position`, positionData);
    
    if (!response) {
      throw new Error('Error al actualizar posición de tarea');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Completar una tarea
   */
  async completeTask(id: string): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.patch<ApiResponse<Task>>(`${this.basePath}/${id}/complete`);
    
    if (!response.data) {
      throw new Error('Error al completar tarea');
    }
    
    return response.data;
=======
    const response = await apiClient.patch<Task>(`${this.basePath}/${id}/complete`);
    
    if (!response) {
      throw new Error('Error al completar tarea');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Reabrir una tarea completada
   */
  async reopenTask(id: string): Promise<Task> {
<<<<<<< HEAD
    const response = await apiClient.patch<ApiResponse<Task>>(`${this.basePath}/${id}/reopen`);
    
    if (!response.data) {
      throw new Error('Error al reabrir tarea');
    }
    
    return response.data;
=======
    const response = await apiClient.patch<Task>(`${this.basePath}/${id}/reopen`);
    
    if (!response) {
      throw new Error('Error al reabrir tarea');
    }
    
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }

  /**
   * Eliminar una tarea
   */
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Obtener tareas vencidas
   */
  async getOverdueTasks(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(`${this.basePath}/overdue`);
    return response.data || [];
  }

  /**
   * Obtener tareas próximas a vencer
   */
  async getUpcomingTasks(days: number = 7): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      `${this.basePath}/upcoming?days=${days}`
    );
    return response.data || [];
  }

  /**
   * Obtener tareas por prioridad
   */
  async getTasksByPriority(priority: TaskPriority[]): Promise<Task[]> {
    return this.getTasks({
      priority,
      sort_by: 'due_date',
      sort_order: 'asc'
    });
  }

  /**
   * Obtener tareas por etiquetas
   */
  async getTasksByTags(tags: string[]): Promise<Task[]> {
    return this.getTasks({
      tags,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  /**
   * Buscar tareas
   */
  async searchTasks(query: string, projectId?: string): Promise<Task[]> {
    return this.getTasks({
      search: query,
      project_id: projectId,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });
  }

  // ======================================
  // FUNCIONALIDADES KANBAN
  // ======================================

  /**
   * Obtener tareas organizadas por columnas Kanban
   */
  async getKanbanTasks(projectId?: string): Promise<KanbanColumn[]> {
    const tasks = projectId 
      ? await this.getProjectTasks(projectId)
      : await this.getTasks({
          sort_by: 'position',
          sort_order: 'asc'
        });

    return this.organizeTasksIntoColumns(tasks);
  }

  /**
   * Organizar tareas en columnas Kanban
   */
  private organizeTasksIntoColumns(tasks: Task[]): KanbanColumn[] {
    const columns: KanbanColumn[] = [
      {
        id: TaskStatus.TODO,
        title: 'Por hacer',
        tasks: [],
        color: '#6B7280'
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'En progreso',
        tasks: [],
        color: '#3B82F6'
      },
      {
        id: TaskStatus.DONE,
        title: 'Completado',
        tasks: [],
        color: '#10B981'
      }
    ];

    // Distribuir tareas en columnas
    tasks.forEach(task => {
      const column = columns.find(col => col.id === task.status);
      if (column) {
        column.tasks.push(task);
      }
    });

    // Ordenar tareas por posición dentro de cada columna
    columns.forEach(column => {
      column.tasks.sort((a, b) => a.position - b.position);
    });

    return columns;
  }

  /**
   * Mover tarea entre columnas (drag & drop)
   */
  async moveTask(
    taskId: string,
    targetStatus: TaskStatus,
    newPosition: number
  ): Promise<Task> {
    return this.updateTaskPosition(taskId, {
      position: newPosition,
      status: targetStatus
    });
  }

  // ======================================
  // VALIDACIONES Y UTILIDADES
  // ======================================

  /**
   * Validar datos de tarea
   */
  validateTaskData(data: CreateTaskForm | UpdateTaskForm): string[] {
    const errors: string[] = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push('El título de la tarea es requerido');
    }

    if ('title' in data && data.title && data.title.length > 255) {
      errors.push('El título no puede exceder 255 caracteres');
    }

    if (data.description && data.description.length > 2000) {
      errors.push('La descripción no puede exceder 2000 caracteres');
    }

    if (data.estimated_hours && data.estimated_hours < 0) {
      errors.push('Las horas estimadas deben ser un número positivo');
    }

    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        errors.push('La fecha de vencimiento no puede ser en el pasado');
      }
    }

    if (data.tags) {
      for (const tag of data.tags) {
        if (!tag || tag.trim().length === 0) {
          errors.push('Las etiquetas no pueden estar vacías');
          break;
        }
        if (tag.length > 50) {
          errors.push('Cada etiqueta no puede exceder 50 caracteres');
          break;
        }
      }
    }

    return errors;
  }

  /**
   * Obtener estados de tarea con sus etiquetas
   */
  getTaskStatuses(): Array<{ value: TaskStatus; label: string; color: string; description: string }> {
    return [
      {
        value: TaskStatus.TODO,
        label: 'Por hacer',
        color: 'text-gray-600 bg-gray-100',
        description: 'Tarea pendiente por iniciar'
      },
      {
        value: TaskStatus.IN_PROGRESS,
        label: 'En progreso',
        color: 'text-blue-600 bg-blue-100',
        description: 'Tarea en desarrollo'
      },
      {
        value: TaskStatus.DONE,
        label: 'Completado',
        color: 'text-green-600 bg-green-100',
        description: 'Tarea finalizada'
      }
    ];
  }

  /**
   * Obtener prioridades de tarea con sus etiquetas
   */
  getTaskPriorities(): Array<{ value: TaskPriority; label: string; color: string; icon: string }> {
    return [
      {
        value: TaskPriority.LOW,
        label: 'Baja',
        color: 'text-blue-600 bg-blue-100',
        icon: '⬇️'
      },
      {
        value: TaskPriority.MEDIUM,
        label: 'Media',
        color: 'text-yellow-600 bg-yellow-100',
        icon: '➡️'
      },
      {
        value: TaskPriority.HIGH,
        label: 'Alta',
        color: 'text-orange-600 bg-orange-100',
        icon: '⬆️'
      },
      {
        value: TaskPriority.URGENT,
        label: 'Urgente',
        color: 'text-red-600 bg-red-100',
        icon: '🔥'
      }
    ];
  }

  /**
   * Calcular días hasta vencimiento
   */
  getDaysUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Verificar si una tarea está vencida
   */
  isTaskOverdue(task: Task): boolean {
    if (!task.due_date || task.status === TaskStatus.DONE) {
      return false;
    }
    
    return new Date(task.due_date) < new Date();
  }

  /**
   * Verificar si una tarea vence pronto
   */
  isTaskDueSoon(task: Task, days: number = 3): boolean {
    if (!task.due_date || task.status === TaskStatus.DONE) {
      return false;
    }
    
    const daysUntil = this.getDaysUntilDue(task.due_date);
    return daysUntil >= 0 && daysUntil <= days;
  }

  /**
   * Obtener etiquetas únicas de todas las tareas
   */
  async getUniqueTags(projectId?: string): Promise<string[]> {
    const tasks = projectId 
      ? await this.getProjectTasks(projectId)
      : await this.getTasks();
    
    const allTags = tasks.flatMap(task => task.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * Generar estadísticas rápidas de tareas
   */
  generateTaskStats(tasks: Task[]): {
    total: number;
    by_status: Record<TaskStatus, number>;
    by_priority: Record<TaskPriority, number>;
    overdue: number;
    due_today: number;
    due_this_week: number;
  } {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      total: tasks.length,
      by_status: {
        [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
        [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
        [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
        [TaskStatus.NADA]: tasks.filter(t => t.status === TaskStatus.NADA).length,
        [TaskStatus.EN_PROGRESO]: tasks.filter(t => t.status === TaskStatus.EN_PROGRESO).length,
        [TaskStatus.COMPLETADA]: tasks.filter(t => t.status === TaskStatus.COMPLETADA).length,
      },
      by_priority: {
        [TaskPriority.LOW]: tasks.filter(t => t.priority === TaskPriority.LOW).length,
        [TaskPriority.MEDIUM]: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
        [TaskPriority.HIGH]: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
        [TaskPriority.URGENT]: tasks.filter(t => t.priority === TaskPriority.URGENT).length,
      },
      overdue: tasks.filter(t => this.isTaskOverdue(t)).length,
      due_today: tasks.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due.toDateString() === today.toDateString();
      }).length,
      due_this_week: tasks.filter(t => {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        return due >= today && due <= weekFromNow;
      }).length,
    };
  }
}

// ======================================
// INSTANCIA SINGLETON
// ======================================

export const taskService = new TaskService();
export default taskService;