import { apiClient } from './api';
import { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest, 
  TimeEntryFilters,
  TimeSummary,
  ProjectTimeSummary,
  TaskTimeSummary,
  ApiResponse
} from '@/types';
import { buildQueryParams } from './api';

// ======================================
// SERVICIO DE TIME ENTRIES
// ======================================

export const timeEntryService = {
  // Obtener todas las entradas de tiempo con filtros
  async getTimeEntries(filters: TimeEntryFilters = {}): Promise<TimeEntry[]> {
    const endpoint = `/time-entries?${buildQueryParams(filters)}`;
    const response = await apiClient.get<ApiResponse<TimeEntry[]>>(endpoint);
    return response.data || [];
  },

  // Obtener una entrada de tiempo específica
  async getTimeEntry(id: string): Promise<TimeEntry> {
    const response = await apiClient.get<ApiResponse<TimeEntry>>(`/time-entries/${id}`);
    if (!response.data) {
      throw new Error('Entrada de tiempo no encontrada');
    }
    return response.data;
  },

  // Crear una nueva entrada de tiempo
  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    const response = await apiClient.post<ApiResponse<TimeEntry>>('/time-entries', data);
    if (!response.data) {
      throw new Error('Error al crear entrada de tiempo');
    }
    return response.data;
  },

  // Actualizar una entrada de tiempo
  async updateTimeEntry(id: string, data: UpdateTimeEntryRequest): Promise<TimeEntry> {
    const response = await apiClient.put<ApiResponse<TimeEntry>>(`/time-entries/${id}`, data);
    if (!response.data) {
      throw new Error('Error al actualizar entrada de tiempo');
    }
    return response.data;
  },

  // Eliminar una entrada de tiempo
  async deleteTimeEntry(id: string): Promise<void> {
    await apiClient.delete(`/time-entries/${id}`);
  },

  // Obtener resumen de tiempo
  async getTimeSummary(filters: TimeEntryFilters = {}): Promise<TimeSummary> {
    const endpoint = `/time-entries/summary?${buildQueryParams(filters)}`;
    const response = await apiClient.get<ApiResponse<TimeSummary>>(endpoint);
    if (!response.data) {
      throw new Error('Error al obtener resumen de tiempo');
    }
    return response.data;
  },

  // Obtener entradas de tiempo por tarea
  async getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<ApiResponse<TimeEntry[]>>(`/time-entries/task/${taskId}`);
    return response.data || [];
  },

  // Obtener resumen de tiempo por tarea
  async getTaskTimeSummary(taskId: string): Promise<TaskTimeSummary> {
    const response = await apiClient.get<ApiResponse<TaskTimeSummary>>(`/time-entries/task/${taskId}/summary`);
    if (!response.data) {
      throw new Error('Error al obtener resumen de tarea');
    }
    return response.data;
  },

  // Obtener entradas de tiempo por proyecto
  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    const response = await apiClient.get<ApiResponse<TimeEntry[]>>(`/time-entries/project/${projectId}`);
    return response.data || [];
  },

  // Obtener resumen de tiempo por proyecto
  async getProjectTimeSummary(projectId: string): Promise<ProjectTimeSummary> {
    const response = await apiClient.get<ApiResponse<ProjectTimeSummary>>(`/time-entries/project/${projectId}/summary`);
    if (!response.data) {
      throw new Error('Error al obtener resumen de proyecto');
    }
    return response.data;
  }
};
