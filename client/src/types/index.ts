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

export interface ProjectListItem {
  id: string;
  name: string;
}

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
  
  // ======================================
  // CAMPOS PARA TIME TRACKING
  // ======================================
  default_hourly_rate?: number;
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
  
  // ======================================
  // CAMPOS EXPANDIDOS (22 nuevos campos)
  // ======================================
  
  // SECCIÓN 1: GESTIÓN Y ASIGNACIÓN (4 campos)
  tipo_tarea?: TipoTarea;
  asignado_a?: string;
  complejidad?: ComplejidadTarea;
  tarea_padre_id?: string;
  
  // SECCIÓN 2: SEGUIMIENTO Y PROGRESO (4 campos)
  porcentaje_completado?: number;
  tiempo_estimado_horas?: number;
  tiempo_real_horas?: number;
  fecha_inicio?: string;
  
  // SECCIÓN 3: CRITERIOS Y VALIDACIÓN (3 campos)
  criterios_aceptacion?: CriterioAceptacion[];
  definicion_terminado?: string;
  bloqueadores?: string;
  
  // SECCIÓN 4: DESARROLLO Y TÉCNICO (3 campos)
  branch_git?: string;
  commit_relacionado?: string;
  url_pull_request?: string;
  
  // SECCIÓN 5: DEPENDENCIAS Y RELACIONES (2 campos)
  dependencias?: string[];
  impacto_otras_tareas?: string;
  
  // SECCIÓN 6: ARCHIVOS Y RECURSOS (3 campos)
  archivos_adjuntos?: ArchivoAdjunto[];
  enlaces_referencia?: string[];
  onedrive_folder_id?: string;
  
  // SECCIÓN 7: AUTOMATIZACIÓN Y RECURRENCIA (2 campos)
  es_recurrente?: boolean;
  notas_internas?: string;
  
  // ======================================
  // CAMPOS PARA TIME TRACKING
  // ======================================
  hourly_rate?: number;
  
  // ======================================
  // CAMPOS CALCULADOS PARA JERARQUÍA
  // ======================================
  subtask_count?: number;
  completed_subtasks?: number;
  subtasks?: Task[];
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
// INTERFACES EXTENDIDAS CON ESTADÍSTICAS
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

// ======================================
// INTERFACES PARA FORMULARIOS
// ======================================

export interface CreateProjectForm {
  // Información Básica
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
  tipo_proyecto?: string; // Requerido según instrucciones
  prioridad?: 'Alta' | 'Media' | 'Baja';
  
  // Aspectos Técnicos
  stack_tecnologico?: string[];
  repositorio_url?: string;
  url_staging?: string;
  url_produccion?: string;
  
  // Gestión y Presupuesto
  presupuesto_estimado?: number;
  moneda?: 'EUR' | 'USD' | 'MXN' | 'COP' | 'ARS';
  horas_estimadas?: number;
  metodo_facturacion?: 'Por horas' | 'Precio fijo' | 'Por hitos';
  estado_pago?: 'Pendiente' | 'Parcial' | 'Pagado';
  
  // Organización
  etiquetas?: string[];
  carpeta_archivos?: string;
  onedrive_folder_id?: string;
  imagen_proyecto?: File | null;
  notas_adicionales?: string;
  
  // Seguimiento (campos automáticos - no incluidos en formulario)
  // ultima_actividad - se actualiza automáticamente
  proxima_tarea?: string;
}

export interface UpdateProjectForm extends Partial<CreateProjectForm> {}

// ======================================
// TIPOS PARA OPCIONES DEL FORMULARIO
// ======================================

export type TipoProyecto = 
  | 'Página Web'
  | 'Aplicación React'
  | 'E-commerce'
  | 'Dashboard'
  | 'API'
  | 'App Mobile'
  | 'Landing Page'
  | 'Blog'
  | 'Sistema Administrativo'
  | 'Otro';

export type TecnologiaStack = 
  | 'React'
  | 'Vite'
  | 'Next.js'
  | 'TypeScript'
  | 'JavaScript'
  | 'Node.js'
  | 'Express'
  | 'Supabase'
  | 'MongoDB'
  | 'PostgreSQL'
  | 'Tailwind CSS'
  | 'Material UI'
  | 'Bootstrap'
  | 'SASS'
  | 'GraphQL'
  | 'REST API'
  | 'Firebase'
  | 'Vercel'
  | 'Netlify';

export type PrioridadProyecto = 'Alta' | 'Media' | 'Baja';

export type MetodoFacturacion = 'Por horas' | 'Precio fijo' | 'Por hitos';

export type EstadoPago = 'Pendiente' | 'Parcial' | 'Pagado';

export type Moneda = 'EUR' | 'USD' | 'MXN' | 'COP' | 'ARS';

// ======================================
// TIPOS PARA CAMPOS EXPANDIDOS DE TAREAS
// ======================================

export type TipoTarea = 
  | 'desarrollo'
  | 'diseño'
  | 'testing'
  | 'documentación'
  | 'reunión'
  | 'investigación'
  | 'revisión'
  | 'deployment'
  | 'mantenimiento'
  | 'bug_fix'
  | 'feature'
  | 'refactoring';

export type ComplejidadTarea = 1 | 2 | 3 | 4 | 5;



// Interfaz para criterios de aceptación
export interface CriterioAceptacion {
  id: string;
  descripcion: string;
  completado?: boolean;
  fecha_completado?: string;
}

// Interfaz para archivos adjuntos (preparado para OneDrive)
export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url_temporal?: string; // Para preview local
  onedrive_id?: string; // Para integración futura
  onedrive_url?: string;
  fecha_subida: string;
  subido_por?: string;
}

// ======================================
// INTERFACES PARA ONEDRIVE (Preparación futura)
// ======================================

export interface OneDriveFileInfo {
  fileId: string;
  fileName: string;
  downloadUrl: string;
  webUrl: string;
}

export interface OneDriveFolderInfo {
  folderId: string;
  folderPath: string;
  webUrl: string;
}

export interface OneDriveUploadOptions {
  projectName: string;
  file: File;
  onProgress?: (progress: number) => void;
  onComplete?: (fileInfo: OneDriveFileInfo) => void;
  onError?: (error: string) => void;
}

export interface CreateTaskForm {
  // Campos originales
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  tags?: string[];
  position?: number;
  
  // ======================================
  // CAMPOS EXPANDIDOS (22 nuevos campos)
  // ======================================
  
  // SECCIÓN 1: GESTIÓN Y ASIGNACIÓN (4 campos)
  tipo_tarea?: TipoTarea;
  asignado_a?: string;
  complejidad?: ComplejidadTarea;
  tarea_padre_id?: string;
  
  // SECCIÓN 2: SEGUIMIENTO Y PROGRESO (4 campos)
  porcentaje_completado?: number;
  tiempo_estimado_horas?: number;
  tiempo_real_horas?: number;
  fecha_inicio?: string;
  
  // SECCIÓN 3: CRITERIOS Y VALIDACIÓN (3 campos)
  criterios_aceptacion?: CriterioAceptacion[];
  definicion_terminado?: string;
  bloqueadores?: string;
  
  // SECCIÓN 4: DESARROLLO Y TÉCNICO (3 campos)
  branch_git?: string;
  commit_relacionado?: string;
  url_pull_request?: string;
  
  // SECCIÓN 5: DEPENDENCIAS Y RELACIONES (2 campos)
  dependencias?: string[];
  impacto_otras_tareas?: string;
  
  // SECCIÓN 6: ARCHIVOS Y RECURSOS (3 campos)
  archivos_adjuntos?: ArchivoAdjunto[];
  enlaces_referencia?: string[];
  onedrive_folder_id?: string;
  
  // SECCIÓN 7: AUTOMATIZACIÓN Y RECURRENCIA (2 campos)
  es_recurrente?: boolean;
  notas_internas?: string;
}

export interface UpdateTaskForm extends Partial<CreateTaskForm> {}

// ======================================
// INTERFACES PARA DASHBOARD
// ======================================

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
  type: 'project' | 'task';
  action: 'created' | 'updated' | 'completed';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    project_id?: string;
    task_id?: string;
    status?: string;
    priority?: string;
    color?: string;
  };
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

export interface ProjectProgress {
  id: string;
  name: string;
  color: string;
  status: ProjectStatus;
  completion_percentage: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  estimated_hours: number;
  actual_hours: number;
  efficiency: number;
}

export interface TimeMetrics {
  total_estimated_hours: number;
  total_actual_hours: number;
  tasks_with_time_tracking: number;
  average_time_per_task: number;
  estimation_accuracy: number;
  efficiency_percentage: number;
  completed_tasks_tracked: number;
  time_variance: number;
}

// ======================================
// INTERFACES PARA BÚSQUEDA
// ======================================

export interface SearchResult {
  type: 'project' | 'task';
  id: string;
  title: string;
  description?: string;
  project_name?: string;
  match_score: number;
}

export interface SearchSuggestion {
  type: 'project' | 'task' | 'tag';
  id?: string;
  title: string;
  description?: string;
  project_id?: string;
  priority?: TaskPriority;
  color?: string;
  count?: number;
  match_type: 'name' | 'title' | 'tag';
}

export interface SearchFilters {
  query: string;
  type?: 'all' | 'project' | 'task';
  project_id?: string;
  status?: string[];
  priority?: string[];
  tags?: string[];
  due_date_from?: string;
  due_date_to?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ======================================
// INTERFACES PARA UI/UX
// ======================================

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  isOpen: boolean;
  type?: 'create' | 'edit' | 'delete' | 'view';
  data?: any;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
}

// ======================================
// INTERFACES PARA CONFIGURACIÓN
// ======================================

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  defaultProjectView: 'grid' | 'list';
  defaultTaskView: 'kanban' | 'list';
  notificationsEnabled: boolean;
  autoSave: boolean;
  compactMode: boolean;
}

export interface AppConfig {
  apiUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  appVersion: string;
  features: {
    timeTracking: boolean;
    notifications: boolean;
    export: boolean;
    import: boolean;
  };
}

// ======================================
// INTERFACES PARA NAVEGACIÓN
// ======================================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
  isActive?: boolean;
  permissions?: string[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

// ======================================
// INTERFACES PARA FORMULARIOS AVANZADOS
// ======================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox' | 'radio' | 'multiselect';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

// ======================================
// INTERFACES PARA KANBAN
// ======================================

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
  maxTasks?: number;
}

export interface DragItem {
  id: string;
  type: 'task';
  data: Task;
}

export interface DropResult {
  draggedId: string;
  sourceColumnId: TaskStatus;
  targetColumnId: TaskStatus;
  sourceIndex: number;
  targetIndex: number;
}

// ======================================
// INTERFACES PARA GRÁFICOS
// ======================================

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressData {
  project: string;
  completed: number;
  remaining: number;
  total: number;
  color: string;
}

// ======================================
// UTILIDADES DE TIPOS
// ======================================

export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list' | 'kanban';
export type ThemeMode = 'light' | 'dark' | 'system';
export type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ======================================
// INTERFACES PARA API RESPONSES
// ======================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiError {
  error: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  stack?: string;
  url?: string;
  method?: string;
  retryAfter?: number;
}

// ======================================
// HOOKS PERSONALIZADOS
// ======================================

export interface UseApiOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UseMutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: any, variables: TVariables) => void;
}

// ======================================
// EXPORTACIONES DE TIPOS DE REPORTES
// ======================================

export * from './reportes';