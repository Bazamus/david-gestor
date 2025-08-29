import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Project, 
  Task, 
  TimeLog, 
  ProjectWithStats, 
  ProjectFilters, 
  TaskFilters, 
  ProjectStats,
  DashboardStats,
  SearchResult,
  SearchParams,
  TimeEntry,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  TimeEntryFilters,
  TimeSummary,
  ProjectTimeSummary,
  TaskTimeSummary
} from '../types';

class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Faltan variables de entorno de Supabase');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Getter para acceder al cliente desde otros módulos
  getClient() {
    return this.supabase;
  }

  // ======================================
  // MÉTODOS DE PROYECTOS
  // ======================================

  async getProjects(filters?: ProjectFilters): Promise<ProjectWithStats[]> {
    let query = this.supabase
      .from('projects')
      .select(`
        *,
        tasks(id, status, estimated_hours, actual_hours)
      `);

    // Aplicar filtros
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.start_date) {
      query = query.gte('start_date', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('end_date', filters.end_date);
    }

    // Ordenamiento
    const sortBy = filters?.sort_by || 'created_at';
    const sortOrder = filters?.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Paginación
    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener proyectos: ${error.message}`);
    }

    // Calcular estadísticas para cada proyecto
    return data?.map(project => this.calculateProjectStats(project)) || [];
  }

  async getProjectList(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('id, name')
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener la lista de proyectos: ${error.message}`);
    }

    return data || [];
  }

  async getProjectById(id: string): Promise<ProjectWithStats | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        tasks(id, status, estimated_hours, actual_hours)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Proyecto no encontrado
      throw new Error(`Error al obtener proyecto: ${error.message}`);
    }

    return this.calculateProjectStats(data);
  }

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear proyecto: ${error.message}`);
    }

    return data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(projectData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar proyecto: ${error.message}`);
    }

    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar proyecto: ${error.message}`);
    }
  }

  // ======================================
  // MÉTODOS DE TAREAS
  // ======================================

  async getTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = this.supabase
      .from('tasks')
      .select(`
        *,
        project:projects!inner(
          id,
          name,
          color
        )
      `);

    // Aplicar filtros
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.due_date_from) {
      query = query.gte('due_date', filters.due_date_from);
    }

    if (filters?.due_date_to) {
      query = query.lte('due_date', filters.due_date_to);
    }

    // Ordenamiento
    const sortBy = filters?.sort_by || 'position';
    const sortOrder = filters?.sort_order || 'asc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Paginación
    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener tareas: ${error.message}`);
    }

    return data || [];
  }

  async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Tarea no encontrada
      throw new Error(`Error al obtener tarea: ${error.message}`);
    }

    return data;
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    // Si no se proporciona posición, calcular la siguiente
    if (taskData.position === undefined) {
      const { data: lastTask } = await this.supabase
        .from('tasks')
        .select('position')
        .eq('project_id', taskData.project_id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      taskData.position = (lastTask?.position || 0) + 1;
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear tarea: ${error.message}`);
    }

    return data;
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar tarea: ${error.message}`);
    }

    return data;
  }

  async updateTaskPosition(id: string, newPosition: number): Promise<Task> {
    const { data, error } = await this.supabase
      .from('tasks')
      .update({ position: newPosition })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar posición de tarea: ${error.message}`);
    }

    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar tarea: ${error.message}`);
    }
  }

  // ======================================
  // MÉTODOS DE TIME LOGS
  // ======================================

  async getTimeLogs(taskId: string): Promise<TimeLog[]> {
    const { data, error } = await this.supabase
      .from('time_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener time logs: ${error.message}`);
    }

    return data || [];
  }

  async createTimeLog(timeLogData: Omit<TimeLog, 'id' | 'created_at'>): Promise<TimeLog> {
    const { data, error } = await this.supabase
      .from('time_logs')
      .insert([timeLogData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear time log: ${error.message}`);
    }

    return data;
  }

  // ======================================
  // MÉTODOS DE TIME ENTRIES (NUEVOS)
  // ======================================

  async getTimeEntries(filters: TimeEntryFilters = {}): Promise<TimeEntry[]> {
    let query = this.supabase
      .from('time_entries_with_details')
      .select('*')
      .order('date', { ascending: false });

    // Aplicar filtros
    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters.task_id) {
      query = query.eq('task_id', filters.task_id);
    }

    if (filters.date_from) {
      query = query.gte('date', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('date', filters.date_to);
    }

    if (filters.billable !== undefined) {
      query = query.eq('billable', filters.billable);
    }

    if (filters.search) {
      query = query.or(`description.ilike.%${filters.search}%,task_title.ilike.%${filters.search}%,project_name.ilike.%${filters.search}%`);
    }

    // Paginación
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener time entries: ${error.message}`);
    }

    return data || [];
  }

  async getTimeEntryById(id: string): Promise<TimeEntry> {
    const { data, error } = await this.supabase
      .from('time_entries_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error al obtener time entry: ${error.message}`);
    }

    return data;
  }

  async createTimeEntry(timeEntryData: CreateTimeEntryRequest): Promise<TimeEntry> {
    // Validar que la tarea existe
    const { data: task, error: taskError } = await this.supabase
      .from('tasks')
      .select('id, project_id')
      .eq('id', timeEntryData.task_id)
      .single();

    if (taskError || !task) {
      throw new Error('Tarea no encontrada');
    }

    // Preparar datos para inserción
    const insertData = {
      task_id: timeEntryData.task_id,
      description: timeEntryData.description,
      hours: timeEntryData.hours,
      date: timeEntryData.date,
      start_time: timeEntryData.start_time,
      end_time: timeEntryData.end_time,
      comments: timeEntryData.comments,
      billable: timeEntryData.billable ?? true,
      rate_per_hour: timeEntryData.rate_per_hour
    };

    const { data, error } = await this.supabase
      .from('time_logs')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear time entry: ${error.message}`);
    }

    // Obtener la entrada completa con detalles
    return this.getTimeEntryById(data.id);
  }

  async updateTimeEntry(id: string, updateData: UpdateTimeEntryRequest): Promise<TimeEntry> {
    // Filtrar campos que no existen en la tabla time_logs
    const { project_id, task_title, project_name, effective_rate, billable_amount, ...validUpdateData } = updateData as any;

    const { data, error } = await this.supabase
      .from('time_logs')
      .update(validUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar time entry: ${error.message}`);
    }

    // Obtener la entrada completa con detalles
    return this.getTimeEntryById(id);
  }

  async deleteTimeEntry(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('time_logs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar time entry: ${error.message}`);
    }
  }

  async getTimeEntriesByTask(taskId: string): Promise<TimeEntry[]> {
    return this.getTimeEntries({ task_id: taskId });
  }

  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    return this.getTimeEntries({ project_id: projectId });
  }

  async getTimeSummary(filters: TimeEntryFilters = {}): Promise<TimeSummary> {
    const entries = await this.getTimeEntries(filters);
    
    const totalEntries = entries.length;
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
    const billableHours = entries.filter(e => e.billable).reduce((sum, entry) => sum + entry.hours, 0);
    const billableAmount = entries.filter(e => e.billable).reduce((sum, entry) => sum + entry.billable_amount, 0);

    // Calcular promedio de horas por día
    const uniqueDates = new Set(entries.map(e => e.date));
    const averageHoursPerDay = uniqueDates.size > 0 ? totalHours / uniqueDates.size : 0;

    // Proyecto más activo
    const projectHours = entries.reduce((acc, entry) => {
      acc[entry.project_id] = (acc[entry.project_id] || 0) + entry.hours;
      return acc;
    }, {} as Record<string, number>);

    const mostActiveProject = Object.entries(projectHours)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    return {
      total_entries: totalEntries,
      total_hours: totalHours,
      billable_hours: billableHours,
      billable_amount: billableAmount,
      average_hours_per_day: averageHoursPerDay,
      most_active_project: mostActiveProject ? {
        project_id: mostActiveProject[0],
        project_name: entries.find(e => e.project_id === mostActiveProject[0])?.project_name || '',
        hours: mostActiveProject[1]
      } : undefined,
      recent_entries: entries.slice(0, 10)
    };
  }

  async getProjectTimeSummary(projectId: string): Promise<ProjectTimeSummary> {
    const { data, error } = await this.supabase
      .from('project_time_summary')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      throw new Error(`Error al obtener resumen del proyecto: ${error.message}`);
    }

    return data;
  }

  async getTaskTimeSummary(taskId: string): Promise<TaskTimeSummary> {
    try {
      // Obtener información de la tarea y el proyecto
      const { data: taskData, error: taskError } = await this.supabase
        .from('tasks')
        .select(`
          id,
          title,
          project_id,
          projects(id, name)
        `)
        .eq('id', taskId)
        .single();

      if (taskError) {
        throw new Error(`Error al obtener información de la tarea: ${taskError.message}`);
      }

      // Obtener todas las entradas de tiempo para esta tarea
      const { data: timeEntries, error: timeError } = await this.supabase
        .from('time_logs')
        .select('*')
        .eq('task_id', taskId);

      if (timeError) {
        throw new Error(`Error al obtener entradas de tiempo: ${timeError.message}`);
      }

      // Calcular estadísticas
      const totalEntries = timeEntries?.length || 0;
      const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;
      const billableHours = timeEntries?.reduce((sum, entry) => {
        return sum + (entry.billable ? (entry.hours || 0) : 0);
      }, 0) || 0;
      const billableAmount = timeEntries?.reduce((sum, entry) => {
        if (entry.billable && entry.rate_per_hour) {
          return sum + ((entry.hours || 0) * entry.rate_per_hour);
        }
        return sum;
      }, 0) || 0;

      return {
        task_id: taskId,
        task_title: taskData.title,
        project_id: taskData.project_id,
        project_name: taskData.projects?.[0]?.name || '',
        total_entries: totalEntries,
        total_hours: totalHours,
        billable_hours: billableHours,
        billable_amount: billableAmount
      };
    } catch (error) {
      console.error('Error en getTaskTimeSummary:', error);
      // Retornar valores por defecto en caso de error
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
  }

  // ======================================
  // MÉTODOS DE DASHBOARD Y ESTADÍSTICAS
  // ======================================

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Llamada a la función RPC para obtener estadísticas globales
      const { data: stats, error } = await this.supabase.rpc('get_global_stats');

      if (error) {
        throw new Error(`Error al llamar a get_global_stats: ${error.message}`);
      }

      // La función RPC devuelve un array, incluso si es una sola fila.
      const statsData = stats && stats.length > 0 ? stats[0] : null;

      if (!statsData) {
        throw new Error('No se recibieron datos de estadísticas desde la base de datos.');
      }

      // Tareas próximas a vencer (próximos 7 días)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcomingTasks } = await this.supabase
        .from('tasks')
        .select('*, projects!inner(name)')
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .lte('due_date', nextWeek.toISOString())
        .order('due_date', { ascending: true })
        .limit(10);

      return {
        total_projects: statsData.total_projects || 0,
        active_projects: statsData.active_projects || 0,
        total_tasks: statsData.total_tasks || 0,
        completed_tasks: statsData.completed_tasks || 0,
        pending_tasks: statsData.pending_tasks || 0,
        overdue_tasks: statsData.overdue_tasks || 0,
        upcoming_tasks: upcomingTasks || [],
        recent_activity: [], // TODO: Implementar actividad reciente
        productivity_stats: {
          productivity_percentage: statsData.productivity_percentage || 0,
          total_actual_hours: statsData.total_actual_hours || 0,
          // Los siguientes son TODOs como en la implementación original
          tasks_completed_today: 0,
          tasks_completed_this_week: 0,
          hours_logged_today: 0,
          hours_logged_this_week: 0,
          average_task_completion_time: 0,
        },
      };
    } catch (error) {
      console.error('Error en getDashboardStats:', error);
      throw new Error(`Error al obtener estadísticas del dashboard: ${error}`);
    }
  }

  // ======================================
  // MÉTODOS DE BÚSQUEDA
  // ======================================

  async search(params: SearchParams): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const { query, type = 'all', limit = 20 } = params;

    try {
      // Buscar en proyectos
      if (type === 'all' || type === 'project') {
        const { data: projects } = await this.supabase
          .from('projects')
          .select('id, name, description')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);

        projects?.forEach(project => {
          results.push({
            type: 'project',
            id: project.id,
            title: project.name,
            description: project.description,
            match_score: this.calculateMatchScore(query, project.name, project.description),
          });
        });
      }

      // Buscar en tareas
      if (type === 'all' || type === 'task') {
        const { data: tasks } = await this.supabase
          .from('tasks')
          .select('id, title, description, projects!inner(name)')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(limit);

        tasks?.forEach(task => {
          results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            description: task.description,
            project_name: (task.projects as any)?.[0]?.name || 'Sin proyecto',
            match_score: this.calculateMatchScore(query, task.title, task.description),
          });
        });
      }

      // Ordenar por score de coincidencia
      return results
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);

    } catch (error) {
      throw new Error(`Error en búsqueda: ${error}`);
    }
  }

  // ======================================
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ======================================

  private calculateProjectStats(project: any): ProjectWithStats {
    const tasks = project.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
    const pendingTasks = totalTasks - completedTasks;
    const totalEstimatedHours = tasks.reduce((sum: number, t: any) => sum + (t.estimated_hours || 0), 0);
    const totalActualHours = tasks.reduce((sum: number, t: any) => sum + (t.actual_hours || 0), 0);
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Remover el array de tasks del resultado final
    const { tasks: _, ...projectData } = project;

    return {
      ...projectData,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: pendingTasks,
      total_estimated_hours: totalEstimatedHours,
      total_actual_hours: totalActualHours,
      completion_percentage: completionPercentage,
    };
  }

  private calculateMatchScore(query: string, title: string, description?: string): number {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description?.toLowerCase() || '';

    let score = 0;

    // Coincidencia exacta en título (mayor peso)
    if (titleLower.includes(queryLower)) {
      score += 10;
    }

    // Coincidencia exacta en descripción
    if (descLower.includes(queryLower)) {
      score += 5;
    }

    // Coincidencias de palabras individuales
    const queryWords = queryLower.split(' ');
    queryWords.forEach(word => {
      if (titleLower.includes(word)) score += 3;
      if (descLower.includes(word)) score += 1;
    });

    return score;
  }
}

// Exportar instancia singleton
export const supabaseService = new SupabaseService();