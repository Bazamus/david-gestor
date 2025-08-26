import { apiClient } from './api';
import { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest, 
  TimeEntryFilters,
  TimeSummary,
  ProjectTimeSummary,
  TaskTimeSummary
<<<<<<< HEAD
} from '@/types';
=======
 } from '@/types';
import type { ApiResponse } from '@/types';
import { buildQueryParams } from './api';
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba

// ======================================
// SERVICIO DE TIME ENTRIES
// ======================================

export const timeEntryService = {
  // Obtener todas las entradas de tiempo con filtros
  async getTimeEntries(filters: TimeEntryFilters = {}): Promise<TimeEntry[]> {
<<<<<<< HEAD
    try {
      const params = new URLSearchParams();
      
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.task_id) params.append('task_id', filters.task_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.billable !== undefined) params.append('billable', filters.billable.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await apiClient.get<TimeEntry[]>(`/time-entries?${params.toString()}`);
      
      // Validar la estructura de respuesta
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        console.warn('Respuesta inesperada del servidor:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener time entries:', error);
      return [];
    }
=======
    const endpoint = Object.keys(filters || {}).length
      ? `/time-entries?${buildQueryParams(filters)}`
      : '/time-entries';
    const response = await apiClient.get<TimeEntry[]>(endpoint);
    return response || [];
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Obtener una entrada de tiempo específica
  async getTimeEntry(id: string): Promise<TimeEntry> {
<<<<<<< HEAD
    const response = await apiClient.get<TimeEntry>(`/time-entries/${id}`);
    return (response as any).data || response;
=======
    const response = await apiClient.get<ApiResponse<TimeEntry>>(`/time-entries/${id}`);
    if (!response.data) {
      throw new Error('Entrada de tiempo no encontrada');
    }
    return response.data;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Crear una nueva entrada de tiempo
  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
<<<<<<< HEAD
    const response = await apiClient.post<TimeEntry>('/time-entries', data);
    return (response as any).data || response;
=======
    const response = await apiClient.post<ApiResponse<TimeEntry>>('/time-entries', data);
    if (!response.data) {
      throw new Error('Error al crear entrada de tiempo');
    }
    return response.data;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Actualizar una entrada de tiempo
  async updateTimeEntry(id: string, data: UpdateTimeEntryRequest): Promise<TimeEntry> {
<<<<<<< HEAD
    const response = await apiClient.put<TimeEntry>(`/time-entries/${id}`, data);
    return (response as any).data || response;
=======
    const response = await apiClient.put<ApiResponse<TimeEntry>>(`/time-entries/${id}`, data);
    if (!response.data) {
      throw new Error('Error al actualizar entrada de tiempo');
    }
    return response.data;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Eliminar una entrada de tiempo
  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`/time-entries/${id}`);
  },

  // Obtener resumen de tiempo
  async getTimeSummary(filters: TimeEntryFilters = {}): Promise<TimeSummary> {
<<<<<<< HEAD
    try {
      const params = new URLSearchParams();
      
      if (filters.project_id) params.append('project_id', filters.project_id);
      if (filters.task_id) params.append('task_id', filters.task_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.billable !== undefined) params.append('billable', filters.billable.toString());

      const response = await apiClient.get<TimeSummary>(`/time-entries/summary?${params.toString()}`);
      
      // Validar la estructura de respuesta
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as any).data;
      } else if (response) {
        return response;
      } else {
        console.warn('Respuesta inesperada del servidor para resumen:', response);
        return {
          total_entries: 0,
          total_hours: 0,
          billable_hours: 0,
          billable_amount: 0,
          average_hours_per_day: 0,
          recent_entries: []
        };
      }
    } catch (error) {
      console.error('Error al obtener resumen de tiempo:', error);
      return {
        total_entries: 0,
        total_hours: 0,
        billable_hours: 0,
        billable_amount: 0,
        average_hours_per_day: 0,
        recent_entries: []
      };
    }
=======
    const endpoint = Object.keys(filters || {}).length
      ? `/time-entries/summary?${buildQueryParams(filters)}`
      : '/time-entries/summary';
    const response = await apiClient.get<TimeSummary>(endpoint);
    if (!response) {
      throw new Error('Error al obtener resumen de tiempo');
    }
    return response;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Obtener entradas de tiempo por tarea
  async getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]> {
<<<<<<< HEAD
    try {
      const response = await apiClient.get<TimeEntry[]>(`/time-entries/task/${taskId}`);
      
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        console.warn('Respuesta inesperada del servidor para time entries por tarea:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener time entries por tarea:', error);
      return [];
    }
=======
    const response = await apiClient.get<TimeEntry[]>(`/time-entries/task/${taskId}`);
    return response || [];
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Obtener resumen de tiempo por tarea
  async getTaskTimeSummary(taskId: string): Promise<TaskTimeSummary> {
<<<<<<< HEAD
    try {
      const response = await apiClient.get<TaskTimeSummary>(`/time-entries/task/${taskId}/summary`);
      
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as any).data;
      } else if (response) {
        return response;
      } else {
        console.warn('Respuesta inesperada del servidor para resumen de tarea:', response);
        return {
          task_id: taskId,
          task_title: '',
          project_id: '',
          project_name: '',
          total_entries: 0,
          total_hours: 0,
          billable_hours: 0,
          billable_amount: 0
        };
      }
    } catch (error) {
      console.error('Error al obtener resumen de tarea:', error);
      return {
        task_id: taskId,
        task_title: '',
        project_id: '',
        project_name: '',
        total_entries: 0,
        total_hours: 0,
        billable_hours: 0,
        billable_amount: 0
      };
    }
=======
    const response = await apiClient.get<ApiResponse<TaskTimeSummary>>(`/time-entries/task/${taskId}/summary`);
    if (!response.data) {
      throw new Error('Error al obtener resumen de tarea');
    }
    return response.data;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Obtener entradas de tiempo por proyecto
  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
<<<<<<< HEAD
    try {
      const response = await apiClient.get<TimeEntry[]>(`/time-entries/project/${projectId}`);
      
      if (response && Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)) {
        return (response as any).data;
      } else {
        console.warn('Respuesta inesperada del servidor para time entries por proyecto:', response);
        return [];
      }
    } catch (error) {
      console.error('Error al obtener time entries por proyecto:', error);
      return [];
    }
=======
    const response = await apiClient.get<ApiResponse<TimeEntry[]>>(`/time-entries/project/${projectId}`);
    return response.data || [];
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  },

  // Obtener resumen de tiempo por proyecto
  async getProjectTimeSummary(projectId: string): Promise<ProjectTimeSummary> {
<<<<<<< HEAD
    try {
      const response = await apiClient.get<ProjectTimeSummary>(`/time-entries/project/${projectId}/summary`);
      
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as any).data;
      } else if (response) {
        return response;
      } else {
        console.warn('Respuesta inesperada del servidor para resumen de proyecto:', response);
        return {
          project_id: projectId,
          project_name: '',
          default_hourly_rate: 0,
          total_tasks: 0,
          completed_tasks: 0,
          total_entries: 0,
          total_hours: 0,
          billable_hours: 0,
          billable_amount: 0
        };
      }
    } catch (error) {
      console.error('Error al obtener resumen de proyecto:', error);
      return {
        project_id: projectId,
        project_name: '',
        default_hourly_rate: 0,
        total_tasks: 0,
        completed_tasks: 0,
        total_entries: 0,
        total_hours: 0,
        billable_hours: 0,
        billable_amount: 0
      };
    }
=======
    const response = await apiClient.get<ApiResponse<ProjectTimeSummary>>(`/time-entries/project/${projectId}/summary`);
    if (!response.data) {
      throw new Error('Error al obtener resumen de proyecto');
    }
    return response.data;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  }
};
