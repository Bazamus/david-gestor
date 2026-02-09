import { useState, useCallback, useRef } from 'react';
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import { useUpdateTaskPosition } from '@/hooks/useTasks';
import { Task, TaskWithProject, TaskStatus } from '@/types';

// Tipo genérico para las tareas del Kanban
type KanbanTask = Task | TaskWithProject;

// Tipo para las tareas organizadas por estado
type TasksByStatus = Record<string, KanbanTask[]>;

interface UseKanbanDndOptions {
  /** Distancia mínima en px para activar el drag (default: 8) */
  activationDistance?: number;
}

interface UseKanbanDndReturn {
  /** ID de la tarea que se está arrastrando */
  activeId: string | null;
  /** Tareas organizadas por estado (con actualizaciones optimistas aplicadas) */
  optimisticTasksByStatus: TasksByStatus;
  /** Sensors configurados para DndContext */
  sensors: ReturnType<typeof useSensors>;
  /** Handler para onDragStart de DndContext */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handler para onDragOver de DndContext (no-op, el DragOverlay da feedback visual) */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handler para onDragEnd de DndContext */
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Hook compartido para la lógica de drag & drop del Kanban.
 * 
 * Centraliza:
 * - Configuración de sensors con activationConstraint
 * - Actualización optimista local al soltar (sin esperar al API)
 * - Cálculo de newStatus y newPosition
 * - Llamada a la mutación de posición con rollback en caso de error
 * 
 * NOTA: NO se mueven items entre SortableContexts durante onDragOver
 * porque eso causa que dnd-kit pierda el tracking del item activo y
 * el drop falle silenciosamente. El DragOverlay ya proporciona
 * feedback visual suficiente durante el arrastre.
 * 
 * @param tasks - Array de tareas (del query)
 * @param tasksByStatus - Tareas agrupadas por estado (del memo del componente)
 * @param options - Opciones de configuración
 */
export function useKanbanDnd(
  tasks: KanbanTask[] | undefined,
  tasksByStatus: TasksByStatus,
  options?: UseKanbanDndOptions
): UseKanbanDndReturn {
  const { activationDistance = 8 } = options || {};
  const updateTaskPosition = useUpdateTaskPosition();

  const [activeId, setActiveId] = useState<string | null>(null);

  // Estado optimista: se superpone sobre tasksByStatus mientras se resuelve la mutación
  const [optimisticOverride, setOptimisticOverride] = useState<TasksByStatus | null>(null);

  // Referencia para poder revertir en caso de error
  const rollbackRef = useRef<TasksByStatus | null>(null);

  // ── Sensors ────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Helpers ────────────────────────────────────────────────────────
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const findTask = useCallback(
    (id: string): KanbanTask | undefined => safeTasks.find((t) => t.id === id),
    [safeTasks]
  );

  // Construir un nuevo tasksByStatus moviendo una tarea
  const buildOptimisticState = useCallback(
    (
      source: TasksByStatus,
      taskId: string,
      fromStatus: string,
      toStatus: string,
      toIndex: number
    ): TasksByStatus => {
      const result: TasksByStatus = {};

      // Copiar todas las columnas
      for (const key of Object.keys(source)) {
        result[key] = [...(source[key] || [])];
      }

      // Encontrar y quitar la tarea de su columna origen
      const fromColumn = result[fromStatus] || [];
      const taskIndex = fromColumn.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return source; // Seguridad
      const [movedTask] = fromColumn.splice(taskIndex, 1);

      // Crear copia de la tarea con status actualizado
      const updatedTask = { ...movedTask, status: toStatus as TaskStatus };

      // Insertar en la columna destino en la posición correcta
      const toColumn = result[toStatus] || [];
      const clampedIndex = Math.min(toIndex, toColumn.length);
      toColumn.splice(clampedIndex, 0, updatedTask);

      result[fromStatus] = fromColumn;
      result[toStatus] = toColumn;

      return result;
    },
    []
  );

  // ── Handlers ───────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // onDragOver: NO modificamos el estado de las columnas aquí.
  // Mover items entre SortableContexts durante el drag causa que dnd-kit
  // pierda el tracking del item activo y el drop falle.
  // El feedback visual lo proporciona el DragOverlay + el highlight de la columna (isOver).
  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Intencionalmente vacío - ver nota arriba
    },
    []
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over || active.id === over.id) {
        setOptimisticOverride(null);
        return;
      }

      const activeTask = findTask(active.id as string);
      if (!activeTask) {
        setOptimisticOverride(null);
        return;
      }

      let newStatus: TaskStatus = activeTask.status as TaskStatus;
      let newPosition = 0;

      const overId = over.id.toString();

      if (overId.startsWith('column-')) {
        // Drop sobre una columna (vacía o zona general)
        newStatus = overId.replace('column-', '') as TaskStatus;
        newPosition = 0;
      } else {
        // Drop sobre otra tarea
        const overTask = findTask(overId);
        if (!overTask) {
          setOptimisticOverride(null);
          return;
        }

        newStatus = overTask.status as TaskStatus;

        // Calcular posición usando la columna de destino
        const targetColumn = tasksByStatus[newStatus] || [];

        if (activeTask.status === newStatus) {
          // Reordenamiento dentro de la misma columna
          const oldIndex = targetColumn.findIndex((t) => t.id === active.id);
          const newIndex = targetColumn.findIndex((t) => t.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            newPosition = newIndex;
          } else {
            setOptimisticOverride(null);
            return;
          }
        } else {
          // Movimiento entre columnas: posición = índice de la tarea de destino
          newPosition = targetColumn.findIndex((t) => t.id === over.id);
          if (newPosition === -1) newPosition = 0;
        }
      }

      // Evitar llamada innecesaria si no hay cambio real
      if (activeTask.status === newStatus && newPosition === (activeTask.position ?? 0)) {
        setOptimisticOverride(null);
        return;
      }

      // ── Actualización optimista ──────────────────────────────────
      // Guardar estado anterior para rollback
      rollbackRef.current = { ...tasksByStatus };

      // Construir estado optimista final y aplicar inmediatamente en la UI
      const optimistic = buildOptimisticState(
        tasksByStatus,
        activeTask.id,
        activeTask.status,
        newStatus,
        newPosition
      );
      setOptimisticOverride(optimistic);

      // ── Llamada al API ──────────────────────────────────────────
      try {
        await updateTaskPosition.mutateAsync({
          taskId: activeTask.id,
          newStatus,
          newPosition,
        });
        // Éxito: limpiar el override, el refetch del query lo sustituirá
        setOptimisticOverride(null);
      } catch (error) {
        console.error('Error al mover tarea:', error);
        // Rollback: restaurar estado anterior para que la UI vuelva al estado original
        if (rollbackRef.current) {
          setOptimisticOverride(rollbackRef.current);
          // Limpiar después de un breve delay para que el usuario vea el estado revertido
          setTimeout(() => setOptimisticOverride(null), 100);
        } else {
          setOptimisticOverride(null);
        }
      } finally {
        rollbackRef.current = null;
      }
    },
    [findTask, tasksByStatus, buildOptimisticState, updateTaskPosition]
  );

  // ── Valor de retorno ───────────────────────────────────────────────
  // Si hay un override optimista activo, usarlo; si no, usar tasksByStatus original
  const optimisticTasksByStatus = optimisticOverride || tasksByStatus;

  return {
    activeId,
    optimisticTasksByStatus,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
