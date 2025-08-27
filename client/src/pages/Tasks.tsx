import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckSquareIcon, 
  PlusIcon, 
  FilterIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/Loading';
import SearchInput from '@/components/common/SearchInput';

// Hooks
import { useTasks, useDeleteTask, useCompleteTask, useReopenTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

// Types
import { TaskWithProject, TaskStatus, TaskPriority } from '@/types';
import type { TaskFilters } from '@/services/taskService';

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [viewMode] = useState<'list' | 'grid'>('list');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  
  // Ref para evitar actualizaciones innecesarias
  const isInitialized = useRef(false);
  const lastUrlParams = useRef<string>('');

  // Queries
  const { data: tasks, isLoading, isError } = useTasks(filters);
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const deleteTask = useDeleteTask();
  const completeTask = useCompleteTask();
  const reopenTask = useReopenTask();

  // Leer parámetros de URL al cargar la página
  useEffect(() => {
    const currentUrlParams = searchParams.toString();
    
    // Evitar actualizaciones innecesarias si los parámetros no han cambiado
    if (isInitialized.current && currentUrlParams === lastUrlParams.current) {
      return;
    }
    
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const projectParam = searchParams.get('project');
    
    const initialFilters: TaskFilters = {};
    
    if (statusParam) {
      // Mapear 'completed' a TaskStatus.DONE
      if (statusParam === 'completed') {
        initialFilters.status = [TaskStatus.DONE];
      } else {
        // Para otros estados, usar el valor directamente
        initialFilters.status = [statusParam as TaskStatus];
      }
    }
    
    if (searchParam) {
      initialFilters.search = searchParam;
    }
    
    if (projectParam) {
      initialFilters.project_id = projectParam;
    }
    
    // Solo actualizar si hay cambios reales
    const filtersChanged = JSON.stringify(initialFilters) !== JSON.stringify(filters);
    if (filtersChanged) {
      setFilters(initialFilters);
    }
    
    isInitialized.current = true;
    lastUrlParams.current = currentUrlParams;
  }, [searchParams, filters]);

  // Computed values
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks;
  }, [tasks]);

  const taskStats = useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, pending: 0, overdue: 0 };
    
    return tasks.reduce((stats, task) => {
      stats.total++;
      if (task.status === 'done') stats.completed++;
      else stats.pending++;
      
      if (task.due_date && new Date(task.due_date) < new Date()) {
        stats.overdue++;
      }
      
      return stats;
    }, { total: 0, completed: 0, pending: 0, overdue: 0 });
  }, [tasks]);

  // Handlers
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Actualizar URL con los nuevos filtros
    const newSearchParams = new URLSearchParams();
    
    if (updatedFilters.status && updatedFilters.status.length > 0) {
      const status = updatedFilters.status[0];
      // Mapear TaskStatus.DONE a 'completed' para la URL
      if (status === TaskStatus.DONE || status === TaskStatus.COMPLETADA) {
        newSearchParams.set('status', 'completed');
      } else {
        newSearchParams.set('status', status);
      }
    }
    
    if (updatedFilters.search) {
      newSearchParams.set('search', updatedFilters.search);
    }
    
    if (updatedFilters.project_id) {
      newSearchParams.set('project', updatedFilters.project_id);
    }
    
    // Solo actualizar URL si realmente ha cambiado
    const newUrlParams = newSearchParams.toString();
    if (newUrlParams !== lastUrlParams.current) {
      setSearchParams(newSearchParams);
      lastUrlParams.current = newUrlParams;
    }
  };

  const handleTaskAction = async (taskId: string, action: 'complete' | 'reopen' | 'delete') => {
    try {
      switch (action) {
        case 'complete':
          await completeTask.mutateAsync(taskId);
          break;
        case 'reopen':
          await reopenTask.mutateAsync(taskId);
          break;
        case 'delete':
          if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            await deleteTask.mutateAsync(taskId);
          }
          break;
      }
    } catch (error) {
      console.error('Error al ejecutar acción:', error);
    }
  };

  const handleBulkAction = async (action: 'complete' | 'delete') => {
    if (selectedTasks.length === 0) return;
    
    try {
      if (action === 'delete' && !confirm(`¿Eliminar ${selectedTasks.length} tareas seleccionadas?`)) {
        return;
      }
      
      await Promise.all(
        selectedTasks.map(taskId => handleTaskAction(taskId, action))
      );
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error en acción masiva:', error);
    }
  };

  if (isLoading) {
    return <TasksSkeleton />;
  }

  if (isError) {
    return <TasksError onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Tareas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra todas tus tareas desde un solo lugar
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<FilterIcon className="w-4 h-4" />}
            onClick={() => {/* TODO: Abrir filtros */}}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => navigate('/tasks/new')}
          >
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckSquareIcon className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center">
            <CheckSquareIcon className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
          <div className="flex items-center">
            <CalendarIcon className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vencidas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        projects={projects || []}
        projectsLoading={projectsLoading}
      />

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedTasks.length} tarea(s) seleccionada(s)
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('complete')}
              >
                Completar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                Eliminar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTasks([])}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={(selected) => {
                setSelectedTasks(prev => 
                  selected 
                    ? [...prev, task.id]
                    : prev.filter(id => id !== task.id)
                );
              }}
              onAction={handleTaskAction}
              onView={() => navigate(`/tasks/${task.id}`)}
              onEdit={() => navigate(`/tasks/${task.id}/edit`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateTask={() => navigate('/tasks/new')} />
      )}
    </div>
  );
};

// Componente de filtros
interface TaskFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  projects: any[];
  projectsLoading: boolean;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onFilterChange, projects, projectsLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <SearchInput
            placeholder="Buscar tareas..."
            onSearch={(searchTerm) => onFilterChange({ search: searchTerm || undefined })}
            initialValue={filters.search || ''}
            minLength={2}
            debounceMs={300}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.status?.[0] || ''}
            onChange={(e) => onFilterChange({ status: e.target.value ? [e.target.value as TaskStatus] : undefined })}
          >
            <option value="">Todos</option>
            <option value="todo">Por hacer</option>
            <option value="in_progress">En progreso</option>
            <option value="done">Completado</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.priority?.[0] || ''}
            onChange={(e) => onFilterChange({ priority: e.target.value ? [e.target.value as TaskPriority] : undefined })}
          >
            <option value="">Todas</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proyecto
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.project_id || ''}
            onChange={(e) => onFilterChange({ project_id: e.target.value || undefined })}
            disabled={projectsLoading}
          >
            <option value="">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {projectsLoading && (
            <p className="text-xs text-gray-500 mt-1">Cargando proyectos...</p>
          )}
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ordenar por
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={`${filters.sort_by || 'created_at'}-${filters.sort_order || 'desc'}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onFilterChange({ sort_by: sortBy as any, sort_order: sortOrder as 'asc' | 'desc' });
            }}
          >
            <option value="created_at-desc">Más recientes</option>
            <option value="created_at-asc">Más antiguos</option>
            <option value="due_date-asc">Fecha límite</option>
            <option value="priority-desc">Prioridad</option>
            <option value="title-asc">Título A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Componente de tarea individual
interface TaskItemProps {
  task: TaskWithProject;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAction: (taskId: string, action: 'complete' | 'reopen' | 'delete') => void;
  onView: () => void;
  onEdit: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  isSelected, 
  onSelect, 
  onAction, 
  onView, 
  onEdit 
}) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isDueSoon = task.due_date && !isOverdue && 
    new Date(task.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar click en checkbox y botones
    if ((e.target as HTMLElement).closest('input, button')) {
      return;
    }
    onView();
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusLabel = () => {
    switch (task.status) {
      case 'todo': return 'Por hacer';
      case 'in_progress': return 'En progreso';
      case 'done': return 'Completado';
      default: return 'Por hacer';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo': return 'bg-gray-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'done': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div 
      className={`
        group relative bg-white dark:bg-gray-800 border-2 
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}
        rounded-xl p-5 cursor-pointer transition-all duration-200
        hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]
        ${task.status === 'done' ? 'opacity-75' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Status Indicator Strip */}
      <div 
        className={`absolute top-0 left-0 w-full h-1 rounded-t-xl ${
          task.status === 'todo' ? 'bg-gray-400' :
          task.status === 'in_progress' ? 'bg-blue-500' :
          'bg-green-500'
        }`}
      />

      {/* Header Row */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          {/* Status and Priority Row */}
          <div className="flex items-center space-x-3 mb-2">
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Status Label */}
            <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>

            {/* Priority Indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor()}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {task.priority === 'urgent' ? 'Urgente' :
                 task.priority === 'high' ? 'Alta' :
                 task.priority === 'medium' ? 'Media' : 'Baja'}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold ${
            task.status === 'done' 
              ? 'line-through text-gray-500 dark:text-gray-400' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {task.title}
          </h3>
        </div>


      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 4 && (
            <span className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
              +{task.tags.length - 4} más
            </span>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          {/* Project Info */}
          {task.project && (
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {task.project.name}
              </span>
            </div>
          )}
          
          {/* Due Date */}
          {task.due_date && (
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              isOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              isDueSoon ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              <CalendarIcon className="w-4 h-4" />
              <span className="font-medium">
                {new Date(task.due_date).toLocaleDateString('es-ES', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            title="Editar"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          {task.status === 'done' ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(task.id, 'reopen'); }}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
              title="Reabrir"
            >
              <CheckSquareIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(task.id, 'complete'); }}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Completar"
            >
              <CheckSquareIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAction(task.id, 'delete'); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

// Componentes de estado
const TasksSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ))}
    </div>
    <div className="space-y-4">
      <CardSkeleton count={5} />
    </div>
  </div>
);

const TasksError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <span className="text-red-500 text-2xl">⚠️</span>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar tareas
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      No se pudieron cargar las tareas
    </p>
    <Button variant="primary" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
);

const EmptyState: React.FC<{ onCreateTask: () => void }> = ({ onCreateTask }) => (
  <div className="text-center py-12">
    <CheckSquareIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No hay tareas
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
      Crea tu primera tarea para comenzar a organizar tu trabajo.
    </p>
    <Button
      variant="primary"
      icon={<PlusIcon className="w-4 h-4" />}
      onClick={onCreateTask}
    >
      Crear primera tarea
    </Button>
  </div>
);

export default Tasks;