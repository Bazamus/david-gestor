import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  DndContext, 
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
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  MoreHorizontalIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { TaskCard } from '@/components/common/Card';
import SearchInput from '@/components/common/SearchInput';

// Hooks
import { useTasks, useProjectTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useKanbanDnd } from '@/hooks/useKanbanDnd';

// Types
import { Task, TaskWithProject, TaskStatus, TaskPriority } from '@/types';
import type { TaskFilters } from '@/services/taskService';

interface MobileKanbanProps {
  isGlobal?: boolean;
}

const MobileKanban: React.FC<MobileKanbanProps> = ({ isGlobal = false }) => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<TaskFilters>({});
  const [compactView, setCompactView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Detectar si es vista global o específica de proyecto
  const isGlobalView = isGlobal || !projectId;

  // Datos condicionales: global vs específico de proyecto
  const globalQuery = useTasks(filters, { enabled: isGlobalView });
  const projectQuery = useProjectTasks(projectId!, { enabled: !isGlobalView });
  const projectsQuery = useProjects(undefined, { enabled: isGlobalView });
  const { data: projects, isLoading: projectsLoading } = projectsQuery;
  
  const { data: tasks, isLoading, isError } = isGlobalView ? globalQuery : projectQuery;

  // Handler para cambios de filtros
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters((prev: TaskFilters) => ({ ...prev, ...newFilters }));
  };

  // Organizar tareas por estado
  const tasksByStatus = React.useMemo(() => {
    const initial: Record<string, (Task | TaskWithProject)[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
    };

    if (!Array.isArray(tasks)) return initial;

    return tasks.reduce((acc, task) => {
      const status = task.status as TaskStatus;
      if (acc[status]) {
        acc[status].push(task);
      }
      return acc;
    }, initial);
  }, [tasks]);

  // Hook compartido para drag & drop (incluye sensors, handlers y optimistic updates)
  const {
    activeId,
    optimisticTasksByStatus,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useKanbanDnd(tasks as (Task | TaskWithProject)[] | undefined, tasksByStatus);

  // Configuración de columnas
  const columns: { id: TaskStatus; title: string; color: 'blue' | 'yellow' | 'green'; icon: React.ComponentType<{className?: string}> }[] = [
    { id: TaskStatus.TODO, title: 'Por Hacer', color: 'blue', icon: ClockIcon },
    { id: TaskStatus.IN_PROGRESS, title: 'En Progreso', color: 'yellow', icon: AlertTriangleIcon },
    { id: TaskStatus.DONE, title: 'Completado', color: 'green', icon: CheckCircleIcon },
  ];

  // Navegación entre columnas
  const scrollToColumn = (direction: 'prev' | 'next') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const columnWidth = container.offsetWidth;
    const currentScroll = container.scrollLeft;
    
    if (direction === 'next' && currentColumnIndex < columns.length - 1) {
      container.scrollTo({
        left: currentScroll + columnWidth,
        behavior: 'smooth'
      });
      setCurrentColumnIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentColumnIndex > 0) {
      container.scrollTo({
        left: currentScroll - columnWidth,
        behavior: 'smooth'
      });
      setCurrentColumnIndex(prev => prev - 1);
    }
  };

  // Detectar scroll para actualizar índice de columna
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const columnWidth = container.offsetWidth;
      const currentScroll = container.scrollLeft;
      const newIndex = Math.round(currentScroll / columnWidth);
      
      if (newIndex !== currentColumnIndex) {
        setCurrentColumnIndex(newIndex);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentColumnIndex]);

  if (isLoading) {
    return <MobileKanbanSkeleton />;
  }

  if (isError) {
    return <MobileKanbanError onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-4">
      {/* Header móvil */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {!isGlobalView && (
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeftIcon className="w-4 h-4" />}
                onClick={() => navigate(`/projects/${projectId}`)}
              />
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {isGlobalView ? 'Kanban Global' : 'Kanban Proyecto'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tasks?.length || 0} tareas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={compactView ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
              onClick={() => setCompactView(!compactView)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<FilterIcon className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={() => navigate(isGlobalView ? '/tasks/new' : `/projects/${projectId}/tasks/new`)}
            />
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-3">
              <SearchInput
                placeholder="Buscar tareas..."
                onSearch={(searchTerm) => handleFilterChange({ search: searchTerm || undefined })}
                initialValue={filters.search || ''}
                minLength={2}
                debounceMs={300}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  value={filters.priority?.[0] || ''}
                  onChange={(e) => handleFilterChange({ priority: e.target.value ? [e.target.value as TaskPriority] : undefined })}
                >
                  <option value="">Todas las prioridades</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>

                {isGlobalView && (
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    value={filters.project_id || ''}
                    onChange={(e) => handleFilterChange({ project_id: e.target.value || undefined })}
                    disabled={projectsLoading}
                  >
                    <option value="">Todos los proyectos</option>
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de columna actual */}
      <div className="px-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeftIcon className="w-4 h-4" />}
            onClick={() => scrollToColumn('prev')}
            disabled={currentColumnIndex === 0}
          />
          
          <div className="flex items-center space-x-1">
            {columns.map((column, index) => (
              <div
                key={column.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentColumnIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRightIcon className="w-4 h-4" />}
            onClick={() => scrollToColumn('next')}
            disabled={currentColumnIndex === columns.length - 1}
          />
        </div>
      </div>

      {/* Kanban Board con scroll horizontal */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-full snap-start px-4"
            >
              <MobileKanbanColumn
                title={column.title}
                status={column.id as TaskStatus}
                tasks={optimisticTasksByStatus[column.id] || []}
                color={column.color}
                icon={column.icon}
                isGlobal={isGlobalView}
                compactView={compactView}
              />
            </div>
          ))}
        </div>
        
        {/* Drag Overlay para feedback visual */}
        <DragOverlay>
          {activeId && Array.isArray(tasks) ? (
            <div className="opacity-90 rotate-6 scale-105 shadow-2xl">
              {compactView ? (
                <MobileTaskCardCompact
                  task={tasks.find(task => task.id === activeId)!}
                  isGlobal={isGlobalView}
                />
              ) : (
                <TaskCard
                  task={tasks.find(task => task.id === activeId)!}
                  className="cursor-grabbing"
                />
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Componente de columna Kanban móvil
interface MobileKanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: (Task | TaskWithProject)[];
  color: 'blue' | 'yellow' | 'green';
  icon: React.ComponentType<{ className?: string }>;
  isGlobal?: boolean;
  compactView?: boolean;
}

const MobileKanbanColumn: React.FC<MobileKanbanColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  color, 
  icon: Icon,
  isGlobal = false,
  compactView = false
}) => {
  const navigate = useNavigate();
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    yellow: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    green: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
  };

  const colorVariants = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div className="space-y-3">
      {/* Header de columna */}
      <div className={`p-3 rounded-lg border ${colorClasses[color]} sticky top-0 z-10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg ${colorVariants[color]} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {tasks.length} tareas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de tareas */}
      <DroppableColumn id={`column-${status}`}>
        <div className="space-y-2 min-h-[400px]">
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <SortableMobileTaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
                isGlobal={isGlobal}
                compactView={compactView}
              />
            ))}
          </SortableContext>
        
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium">No hay tareas</p>
              <p className="text-xs mt-1">Arrastra una tarea aquí</p>
            </div>
          )}
        </div>
      </DroppableColumn>
    </div>
  );
};

// Componente SortableMobileTaskCard para hacer las tareas arrastrables
interface SortableMobileTaskCardProps {
  task: Task | TaskWithProject;
  onClick?: () => void;
  isGlobal?: boolean;
  compactView?: boolean;
}

const SortableMobileTaskCard: React.FC<SortableMobileTaskCardProps> = ({ 
  task, 
  onClick, 
  isGlobal = false,
  compactView = false
}) => {
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
      {/* Área de drag & drop */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 pointer-events-auto"
      />
      
      {compactView ? (
        <MobileTaskCardCompact
          task={task}
          onViewClick={onClick}
          isGlobal={isGlobal}
          className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow pointer-events-none"
        />
      ) : (
        <TaskCard
          task={task}
          onViewClick={onClick}
          showViewButton={true}
          className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow pointer-events-none"
        />
      )}
      
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

// Componente de tarjeta compacta para móvil
interface MobileTaskCardCompactProps {
  task: Task | TaskWithProject;
  onViewClick?: () => void;
  isGlobal?: boolean;
  className?: string;
}

const MobileTaskCardCompact: React.FC<MobileTaskCardCompactProps> = ({ 
  task, 
  onViewClick, 
  isGlobal = false,
  className = ''
}) => {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-500';
      case TaskPriority.HIGH:
        return 'bg-orange-500';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-500';
      case TaskPriority.LOW:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return 'bg-green-500';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case TaskStatus.TODO:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {task.title}
            </h4>
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            {task.due_date && (
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-3 h-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
            
            {isGlobal && 'project' in task && task.project && (
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: task.project.color }}
                />
                <span className="truncate max-w-20">{task.project.name}</span>
              </div>
            )}
          </div>
        </div>
        
        {onViewClick && (
          <button
            onClick={onViewClick}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <MoreHorizontalIcon className="w-4 h-4" />
          </button>
        )}
      </div>
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

// Componentes de estado de carga y error
const MobileKanbanSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
    <div className="px-4">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const MobileKanbanError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center py-12 px-4">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <span className="text-red-500 text-2xl">⚠️</span>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar el tablero
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      No se pudieron cargar las tareas
    </p>
    <Button variant="primary" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
);

export default MobileKanban;
