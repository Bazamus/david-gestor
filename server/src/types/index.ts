// ======================================
// TIPOS PRINCIPALES DE LA APLICACIÓN
// ======================================

// Enums para estados y prioridades
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  // Nuevos estados para CheckPoints
  NADA = 'NADA',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ======================================
// INTERFACES DE ENTIDADES
// ======================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  // Información del Cliente
  cliente_empresa?: string;
  contacto_principal?: string;
  email_contacto?: string;
  telefono_contacto?: string;
  tipo_proyecto?: string;
  prioridad?: string;
  // Aspectos Técnicos
  stack_tecnologico?: string[];
  repositorio_url?: string;
  url_staging?: string;
  url_produccion?: string;
  // Gestión y Presupuesto
  presupuesto_estimado?: number;
  moneda?: string;
  horas_estimadas?: number;
  metodo_facturacion?: string;
  estado_pago?: string;
  // Organización
  etiquetas?: string[];
  carpeta_archivos?: string;
  onedrive_folder_id?: string;
  imagen_proyecto?: string | null;
  notas_adicionales?: string;
  // Seguimiento (campos automáticos)
  ultima_actividad?: string;
  proxima_tarea?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  task_id: string;
  description?: string;
  hours: number;
  date: string;
  created_at: string;
  // Nuevos campos para time tracking mejorado
  comments?: string;
  start_time?: string;
  end_time?: string;
  billable: boolean;
  rate_per_hour?: number;
}

// Nuevos tipos para time tracking mejorado
export interface TimeEntry {
  id: string;
  task_id: string;
  project_id: string; // Calculado
  description: string;
  hours: number;
  date: string;
  start_time?: string;
  end_time?: string;
  comments?: string;
  billable: boolean;
  rate_per_hour?: number;
  created_at: string;
  // Campos calculados
  task_title: string;
  project_name: string;
  effective_rate: number;
  billable_amount: number;
}

export interface CreateTimeEntryRequest {
  task_id: string;
  description: string;
  hours: number;
  date: string;
  start_time?: string;
  end_time?: string;
  comments?: string;
  billable?: boolean;
  rate_per_hour?: number;
}

export interface UpdateTimeEntryRequest extends Partial<CreateTimeEntryRequest> {}

export interface TimeEntryFilters {
  project_id?: string;
  task_id?: string;
  date_from?: string;
  date_to?: string;
  billable?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TimeSummary {
  total_entries: number;
  total_hours: number;
  billable_hours: number;
  billable_amount: number;
  average_hours_per_day: number;
  most_active_project?: {
    project_id: string;
    project_name: string;
    hours: number;
  };
  recent_entries: TimeEntry[];
}

export interface ProjectTimeSummary {
  project_id: string;
  project_name: string;
  default_hourly_rate: number;
  total_tasks: number;
  completed_tasks: number;
  total_entries: number;
  total_hours: number;
  billable_hours: number;
  billable_amount: number;
  first_entry_date?: string;
  last_entry_date?: string;
}

export interface TaskTimeSummary {
  task_id: string;
  task_title: string;
  project_id: string;
  project_name: string;
  total_entries: number;
  total_hours: number;
  billable_hours: number;
  billable_amount: number;
  first_entry_date?: string;
  last_entry_date?: string;
}

// ======================================
// INTERFACES PARA REQUESTS
// ======================================

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  // Información del Cliente
  cliente_empresa?: string;
  contacto_principal?: string;
  email_contacto?: string;
  telefono_contacto?: string;
  tipo_proyecto?: string;
  prioridad?: string;
  // Aspectos Técnicos
  stack_tecnologico?: string[];
  repositorio_url?: string;
  url_staging?: string;
  url_produccion?: string;
  // Gestión y Presupuesto
  presupuesto_estimado?: number;
  moneda?: string;
  horas_estimadas?: number;
  metodo_facturacion?: string;
  estado_pago?: string;
  // Organización
  etiquetas?: string[];
  carpeta_archivos?: string;
  onedrive_folder_id?: string;
  imagen_proyecto?: string | null;
  notas_adicionales?: string;
  // Seguimiento
  proxima_tarea?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export interface CreateTaskRequest {
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
  position?: number;
  
  // Campos expandidos - Información y asignación
  tipo_tarea?: string;
  asignado_a?: string;
  complejidad?: number;
  tarea_padre_id?: string;
  
  // Seguimiento y progreso
  porcentaje_completado?: number;
  tiempo_estimado_horas?: number;
  tiempo_real_horas?: number;
  fecha_inicio?: string;
  
  // Criterios y validación
  criterios_aceptacion?: any[];
  definicion_terminado?: string;
  bloqueadores?: string;
  
  // Información técnica
  branch_git?: string;
  commit_relacionado?: string;
  url_pull_request?: string;
  
  // Dependencias y relaciones
  dependencias?: string[];
  impacto_otras_tareas?: string;
  
  // Archivos y recursos
  archivos_adjuntos?: any[];
  enlaces_referencia?: string[];
  onedrive_folder_id?: string;
  
  // Automatización y recurrencia
  es_recurrente?: boolean;

  notas_internas?: string;
}

export interface UpdateTaskRequest extends Partial<Omit<CreateTaskRequest, 'project_id'>> {
  actual_hours?: number;
}

export interface CreateTimeLogRequest {
  task_id: string;
  description?: string;
  hours: number;
  date?: string;
}

// ======================================
// INTERFACES PARA RESPONSES
// ======================================

export interface ProjectWithStats extends Project {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_percentage: number;
}

export interface TaskWithProject extends Task {
  project: Pick<Project, 'id' | 'name' | 'color'>;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  completion_percentage: number;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  upcoming_tasks: Task[];
  recent_activity: RecentActivity[];
  productivity_stats: ProductivityStats;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'project_updated' | 'task_created' | 'task_updated' | 'task_completed';
  title: string;
  description: string;
  timestamp: string;
  project_id?: string;
  task_id?: string;
}

export interface ProductivityStats {
  productivity_percentage: number;
  total_actual_hours: number;
  tasks_completed_today: number;
  tasks_completed_this_week: number;
  hours_logged_today: number;
  hours_logged_this_week: number;
  average_task_completion_time: number;
}

// ======================================
// INTERFACES PARA BÚSQUEDA Y FILTROS
// ======================================

export interface SearchResult {
  type: 'project' | 'task';
  id: string;
  title: string;
  description?: string;
  project_name?: string;
  match_score: number;
}

export interface SearchParams {
  query: string;
  type?: 'project' | 'task' | 'all';
  limit?: number;
  offset?: number;
}

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

// ======================================
// INTERFACES PARA RESPUESTAS DE API
// ======================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  error: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  stack?: string;
  url?: string;
  method?: string;
}

// ======================================
// INTERFACES PARA VALIDACIONES
// ======================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ======================================
// UTILIDADES DE TIPOS
// ======================================

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Tipo para ordenamiento
export type SortOrder = 'asc' | 'desc';

// Tipo para operaciones CRUD
export type CrudOperation = 'create' | 'read' | 'update' | 'delete';

// Tipo para niveles de log
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';