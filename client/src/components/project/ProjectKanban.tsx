import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  PlusIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { CardSkeleton } from '@/components/common/Loading';
import { TaskCard } from '@/components/common/Card';

// Hooks
import { useProjectTasks, useUpdateTaskPosition } from '@/hooks/useTasks';

// Types
import { Task, TaskStatus } from '@/types';

interface ProjectKanbanProps {
  projectId: string;
}

const ProjectKanban: React.FC<ProjectKanbanProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sensors para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Datos del proyecto y tareas
  const { data: tasks, isLoading, isError } = useProjectTasks(projectId!);
  const updateTaskPosition = useUpdateTaskPosition();

  // Organizar tareas por estado
  const tasksByStatus = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return { 
        todo: [], 
        in_progress: [], 
        done: [] 
      };
    }
    
    const defaultColumns = { 
      todo: [], 
      in_progress: [], 
      done: [] 
    };
    
    return tasks.reduce((acc, task) => {
      const status = task.status as TaskStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, defaultColumns as any);
  }, [tasks]);

  // Manejar drag over entre columnas
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Si es una columna (droppable)
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as TaskStatus;
      const activeTask = tasks?.find(task => task.id === activeId);
      
      if (activeTask && activeTask.status !== newStatus) {
        // Aquí podríamos mostrar un preview visual del drop
      }
    }
  }, [tasks]);

  // Manejar drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    // Validar que tasks existe y es un array
    if (!tasks || !Array.isArray(tasks)) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find(task => task.id === active.id);
    
    if (!activeTask) {
      setActiveId(null);
      return;
    }

    // Si se suelta en una columna
    if (over.id.toString().startsWith('column-')) {
      const newStatus = over.id.toString().replace('column-', '') as TaskStatus;
      
      if (activeTask.status !== newStatus) {
        try {
          await updateTaskPosition.mutateAsync({
            taskId: activeTask.id,
            newStatus: newStatus,
            newPosition: 0, // Se insertará al principio de la nueva columna
          });
        } catch (error) {
          console.error('Error al mover tarea:', error);
        }
      }
    } else {
      // Si se suelta en otra tarea
      const overTask = tasks.find(task => task.id === over.id);
      
      if (!overTask) {
        setActiveId(null);
        return;
      }

      const activeStatus = activeTask.status as TaskStatus;
      const overStatus = overTask.status as TaskStatus;

      // Si se mueve a una columna diferente
      if (activeStatus !== overStatus) {
        try {
          await updateTaskPosition.mutateAsync({
            taskId: activeTask.id,
            newStatus: overStatus,
            newPosition: 0,
          });
        } catch (error) {
          console.error('Error al mover tarea:', error);
        }
      } else {
        // Si se mueve dentro de la misma columna
        const activeStatusTasks = (tasksByStatus as any)[activeStatus] || [];
        const oldIndex = activeStatusTasks.findIndex((task: any) => task.id === active.id);
        const newIndex = activeStatusTasks.findIndex((task: any) => task.id === over.id);
        
        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          try {
            await updateTaskPosition.mutateAsync({
              taskId: activeTask.id,
              newStatus: activeStatus,
              newPosition: newIndex,
            });
          } catch (error) {
            console.error('Error al reordenar tarea:', error);
          }
        }
      }
    }
    
    setActiveId(null);
  }, [tasks, tasksByStatus, updateTaskPosition]);

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  if (isError) {
    return <KanbanError onRetry={() => window.location.reload()} />;
  }

  const activeTask = activeId && tasks && Array.isArray(tasks) ? tasks.find(task => task.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tablero Kanban
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Organiza tus tareas arrastrándolas entre columnas
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
        >
          Nueva Tarea
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={({ active }) => setActiveId(active.id as string)}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna: Por Hacer */}
          <KanbanColumn
            title="Por Hacer"
            status={TaskStatus.TODO}
            tasks={tasksByStatus.todo}
            color="blue"
            projectId={projectId!}
          />

          {/* Columna: En Progreso */}
          <KanbanColumn
            title="En Progreso"
            status={TaskStatus.IN_PROGRESS}
            tasks={tasksByStatus.in_progress}
            color="yellow"
            projectId={projectId!}
          />

          {/* Columna: Completado */}
          <KanbanColumn
            title="Completado"
            status={TaskStatus.DONE}
            tasks={tasksByStatus.done}
            color="green"
            projectId={projectId!}
          />
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              className="rotate-3 opacity-90"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// Componente de columna Kanban con funcionalidad droppable
interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: 'blue' | 'yellow' | 'green';
  projectId: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  status, 
  tasks = [], // Default empty array
  color, 
  // projectId parameter removed as it's not used
}) => {
  const navigate = useNavigate();
  
  // Asegurar que tasks siempre sea un array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    yellow: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    green: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
  };

  return (
    <DroppableColumn id={`column-${status}`}>
      <div className="space-y-4">
        {/* Header de columna */}
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <span className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-800 rounded-full">
              {safeTasks.length}
            </span>
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-3 min-h-[400px]">
          <SortableContext items={safeTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {safeTasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => navigate(`/tasks/${task.id}`)}
              />
            ))}
          </SortableContext>
          
          {safeTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No hay tareas en esta columna</p>
              <p className="text-xs mt-1">Arrastra tareas aquí</p>
            </div>
          )}
        </div>
      </div>
    </DroppableColumn>
  );
};

// Componente droppable para columnas
const DroppableColumn: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

// Componente sortable para tareas

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onClick }) => {
  const navigate = useNavigate();
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
  };

  const handleViewClick = () => {
    navigate(`/tasks/${task.id}`);
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
        onClick={onClick}
        onViewClick={handleViewClick}
        showViewButton={true}
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      />
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

export default ProjectKanban; 