import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileKanban } from '@/components/mobile';
import { 
  DndContext, 
  closestCorners,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PlusIcon, 
  ArrowLeftIcon,
  FolderIcon,
  FilterIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/Loading';
import { TaskCard } from '@/components/common/Card';
import SearchInput from '@/components/common/SearchInput';

// Hooks
import { useTasks, useProjectTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useKanbanDnd } from '@/hooks/useKanbanDnd';

// Types
import { Task, TaskWithProject, TaskStatus, TaskPriority } from '@/types';
import type { TaskFilters } from '@/services/taskService';

const Kanban: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { isMobile } = useIsMobile();
  const [filters, setFilters] = useState<TaskFilters>({});

  // Detectar si es vista global o específica de proyecto
  const isGlobalView = !projectId;

  // Datos condicionales: global vs específico de proyecto - SIEMPRE se debe llamar
  const globalQuery = useTasks(filters, { enabled: isGlobalView });
  const projectQuery = useProjectTasks(projectId!, { enabled: !isGlobalView });
  const projectsQuery = useProjects(undefined, { enabled: isGlobalView });
  const { data: projects, isLoading: projectsLoading } = projectsQuery;
  
  const { data: tasks, isLoading, isError } = isGlobalView ? globalQuery : projectQuery;

  // Organizar tareas por estado - SIEMPRE se debe llamar
  const tasksByStatus = React.useMemo(() => {
    if (!Array.isArray(tasks)) return { todo: [], in_progress: [], done: [] };
    
    return tasks.reduce((acc, task) => {
      const status = task.status as TaskStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {} as Record<TaskStatus, (Task | TaskWithProject)[]>);
  }, [tasks]);

  // Hook compartido para drag & drop (incluye sensors, handlers y optimistic updates)
  const {
    activeId,
    optimisticTasksByStatus,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDnd(tasks as (Task | TaskWithProject)[] | undefined, tasksByStatus);

  // Handler para cambios de filtros
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev: TaskFilters) => ({ ...prev, ...newFilters }));
  };

  // AHORA podemos hacer el renderizado condicional después de que todos los hooks se hayan llamado
  if (isMobile) {
    return <MobileKanban isGlobal={isGlobalView} />;
  }

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  if (isError) {
    return <KanbanError onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isGlobalView && (
            <Button
              variant="ghost"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              Volver al Proyecto
            </Button>
          )}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FolderIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isGlobalView ? 'Tablero Kanban Global' : 'Tablero Kanban del Proyecto'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isGlobalView 
                ? 'Gestiona todas las tareas de todos tus proyectos en un solo lugar'
                : 'Organiza las tareas de este proyecto arrastrándolas entre columnas'
              }
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate(isGlobalView ? '/tasks/new' : `/projects/${projectId}/tasks/new`)}
        >
          Nueva Tarea
        </Button>
      </div>

      {/* Filtros para vista global */}
      {isGlobalView && (
        <KanbanFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          projects={projects || []}
          projectsLoading={projectsLoading}
        />
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna: Por Hacer */}
          <KanbanColumn
            title="Por Hacer"
            status={'todo' as TaskStatus}
            tasks={optimisticTasksByStatus.todo || []}
            color="blue"
            isGlobal={isGlobalView}
          />

          {/* Columna: En Progreso */}
          <KanbanColumn
            title="En Progreso"
            status={'in_progress' as TaskStatus}
            tasks={optimisticTasksByStatus.in_progress || []}
            color="yellow"
            isGlobal={isGlobalView}
          />

          {/* Columna: Completado */}
          <KanbanColumn
            title="Completado"
            status={'done' as TaskStatus}
            tasks={optimisticTasksByStatus.done || []}
            color="green"
            isGlobal={isGlobalView}
          />
        </div>
        
        {/* Drag Overlay para feedback visual */}
        <DragOverlay>
          {activeId && Array.isArray(tasks) ? (
            <div className="opacity-90 rotate-6 scale-105 shadow-2xl">
              <TaskCard
                task={tasks.find(task => task.id === activeId)!}
                className="cursor-grabbing"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Componente de columna Kanban
interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: (Task | TaskWithProject)[];
  color: 'blue' | 'yellow' | 'green';
  isGlobal?: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  color, 
  isGlobal = false 
}) => {
  const navigate = useNavigate();
  
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    yellow: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    green: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
  };

  return (
    <div className="space-y-4">
      {/* Header de columna */}
      <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Lista de tareas */}
      <DroppableColumn id={`column-${status}`}>
        <div className="space-y-3 min-h-[400px]">
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
                isGlobal={isGlobal}
              />
            ))}
          </SortableContext>
        
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No hay tareas en esta columna</p>
              {isGlobal && (
                <p className="text-xs mt-2">Crea una nueva tarea para comenzar</p>
              )}
            </div>
          )}
        </div>
      </DroppableColumn>
    </div>
  );
};

// Componentes de estado de carga y error
const KanbanSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="space-y-3">
            <CardSkeleton count={3} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const KanbanError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <span className="text-red-500 text-2xl">⚠️</span>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar el tablero
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      No se pudieron cargar las tareas del proyecto
    </p>
    <Button variant="primary" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
);

// Componente SortableTaskCard para hacer las tareas arrastrables
interface SortableTaskCardProps {
  task: Task | TaskWithProject;
  onClick?: () => void; // Ahora se usa para el botón "Ver"
  isGlobal?: boolean;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onClick, isGlobal = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Área de drag & drop - excluye el área del botón */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 pointer-events-auto"
        style={{ 
          clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 70px), calc(100% - 120px) calc(100% - 70px), calc(100% - 120px) 100%, 0 100%)'
        }}
      />
      
      <TaskCard
        task={task}
        onViewClick={onClick}
        showViewButton={true}
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      />
      
      {/* Indicador de proyecto en modo global */}
      {isGlobal && 'project' in task && task.project && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 pointer-events-none">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: task.project.color }}
            title={task.project.name}
          />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {task.project.name}
          </span>
        </div>
      )}
    </div>
  );
};

// Componente DroppableColumn para hacer las columnas receptoras de drop
interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors duration-200 ${
        isOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
      }`}
    >
      {children}
    </div>
  );
};

// Componente de filtros para Kanban
interface KanbanFiltersProps {
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  projects: any[];
  projectsLoading: boolean;
}

const KanbanFilters: React.FC<KanbanFiltersProps> = ({ filters, onFilterChange, projects, projectsLoading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              const [sort_by, sort_order] = e.target.value.split('-');
              onFilterChange({ 
                sort_by: sort_by as any,
                sort_order: sort_order as 'asc' | 'desc'
              });
            }}
          >
            <option value="created_at-desc">Más recientes</option>
            <option value="created_at-asc">Más antiguos</option>
            <option value="title-asc">Título A-Z</option>
            <option value="title-desc">Título Z-A</option>
            <option value="due_date-asc">Fecha límite ↑</option>
            <option value="due_date-desc">Fecha límite ↓</option>
            <option value="priority-desc">Prioridad alta</option>
            <option value="priority-asc">Prioridad baja</option>
          </select>
        </div>
      </div>

      {/* Clear filters button */}
      {(filters.search || filters.priority || filters.project_id || filters.sort_by !== 'created_at' || filters.sort_order !== 'desc') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ search: undefined, priority: undefined, project_id: undefined, sort_by: 'created_at', sort_order: 'desc' })}
            className="text-gray-600 dark:text-gray-400"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default Kanban;