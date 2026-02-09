import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
  pointerWithin,
  closestCenter,
  rectIntersection,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';

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
  /** Tareas organizadas por estado (con estado local de drag aplicado) */
  optimisticTasksByStatus: TasksByStatus;
  /** Sensors configurados para DndContext */
  sensors: ReturnType<typeof useSensors>;
  /** Collision detection custom para multi-container */
  collisionDetection: CollisionDetection;
  /** Handler para onDragStart de DndContext */
  handleDragStart: (event: DragStartEvent) => void;
  /** Handler para onDragOver de DndContext */
  handleDragOver: (event: DragOverEvent) => void;
  /** Handler para onDragEnd de DndContext */
  handleDragEnd: (event: DragEndEvent) => void;
}

/**
 * Hook compartido para la lógica de drag & drop del Kanban.
 *
 * Implementa el patrón multi-container oficial de dnd-kit:
 * - Estado local de IDs por container (sincronizado con query data)
 * - Collision detection custom: pointerWithin para columnas + closestCenter para items
 * - onDragOver mueve items entre containers en estado local
 * - onDragEnd finaliza con arrayMove (misma columna) o confirma cross-container + API
 * - Rollback si el API falla
 */
export function useKanbanDnd(
  tasks: KanbanTask[] | undefined,
  tasksByStatus: TasksByStatus,
  options?: UseKanbanDndOptions
): UseKanbanDndReturn {
  const { activationDistance = 8 } = options || {};
  const updateTaskPosition = useUpdateTaskPosition();

  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Estado local: IDs de items por container ──────────────────────
  // Se manipula rápidamente durante el drag sin re-derivar objetos completos.
  const [containerItems, setContainerItems] = useState<Record<string, string[]>>({});

  // Sincronizar desde los datos del query cuando cambian
  // (al cargar, tras refetch del API, etc.)
  useEffect(() => {
    // Solo sincronizar si NO estamos en medio de un drag
    // para no pisar el estado local mientras el usuario arrastra.
    if (activeId) return;

    const next: Record<string, string[]> = {};
    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
      next[status] = statusTasks.map((t) => t.id);
    }
    setContainerItems(next);
  }, [tasksByStatus, activeId]);

  // Resetear containerItems al estado del query (para rollback)
  const resetContainers = useCallback(() => {
    const next: Record<string, string[]> = {};
    for (const [status, statusTasks] of Object.entries(tasksByStatus)) {
      next[status] = statusTasks.map((t) => t.id);
    }
    setContainerItems(next);
  }, [tasksByStatus]);

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

  // Buscar en qué container está un item (no depende del status original)
  const findContainer = useCallback(
    (itemId: string): string | undefined => {
      for (const [containerId, ids] of Object.entries(containerItems)) {
        if (ids.includes(itemId)) return containerId;
      }
      return undefined;
    },
    [containerItems]
  );

  // ── Collision Detection Custom ─────────────────────────────────────
  // Resuelve:
  //   - Columnas vacías (pointerWithin detecta el DroppableColumn)
  //   - Columnas con items (closestCenter dentro del container)
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      // 1. Buscar colisiones con pointerWithin (detecta columnas vacías)
      const pointerCollisions = pointerWithin(args);
      const collisions =
        pointerCollisions.length > 0
          ? pointerCollisions
          : rectIntersection(args);

      const overId = getFirstCollision(collisions, 'id');

      if (overId != null) {
        const overStr = overId.toString();

        // Si colisionamos con una columna que tiene items,
        // buscar el item más cercano dentro de ella
        if (overStr.startsWith('column-')) {
          const containerId = overStr.replace('column-', '');
          const itemIds = containerItems[containerId] || [];

          if (itemIds.length > 0) {
            const closestItems = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  itemIds.includes(container.id.toString())
              ),
            });
            if (closestItems.length > 0) return closestItems;
          }
        }

        // Columna vacía o item directo
        return collisions;
      }

      return [];
    },
    [containerItems]
  );

  // ── Handlers ───────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // onDragOver: detecta cruce entre containers y mueve el item ID
  // al nuevo container en el estado local. Esto permite que:
  // - La tarjeta aparezca visualmente en la columna destino mientras se arrastra
  // - dnd-kit trackee el item en su nuevo SortableContext
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const draggedId = active.id.toString();
      const overId = over.id.toString();

      // Determinar container origen y destino
      const activeContainer = findContainer(draggedId);
      const overContainer = overId.startsWith('column-')
        ? overId.replace('column-', '')
        : findContainer(overId);

      // Si no encontramos containers o son el mismo, no hacer nada
      if (
        !activeContainer ||
        !overContainer ||
        activeContainer === overContainer
      ) {
        return;
      }

      // Mover item entre containers
      setContainerItems((prev) => {
        const activeItems = [...(prev[activeContainer] || [])];
        const overItems = [...(prev[overContainer] || [])];

        // Quitar del container origen
        const activeIndex = activeItems.indexOf(draggedId);
        if (activeIndex === -1) return prev;
        activeItems.splice(activeIndex, 1);

        // Calcular índice de inserción en destino
        let insertIndex: number;
        if (overId.startsWith('column-')) {
          // Drop sobre la columna misma (vacía o zona general): al final
          insertIndex = overItems.length;
        } else {
          // Drop sobre un item: insertar en su posición
          const overIndex = overItems.indexOf(overId);
          insertIndex = overIndex >= 0 ? overIndex : overItems.length;
        }

        overItems.splice(insertIndex, 0, draggedId);

        return {
          ...prev,
          [activeContainer]: activeItems,
          [overContainer]: overItems,
        };
      });
    },
    [findContainer]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) {
        resetContainers();
        return;
      }

      const draggedId = active.id.toString();
      const overId = over.id.toString();

      // Determinar containers
      const activeContainer = findContainer(draggedId);
      const overContainer = overId.startsWith('column-')
        ? overId.replace('column-', '')
        : findContainer(overId);

      if (!activeContainer || !overContainer) {
        resetContainers();
        return;
      }

      if (activeContainer === overContainer) {
        // ── Mismo container: reordenar con arrayMove ─────────────
        const items = containerItems[activeContainer] || [];
        const oldIndex = items.indexOf(draggedId);
        const newIndex = items.indexOf(overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(items, oldIndex, newIndex);
          setContainerItems((prev) => ({
            ...prev,
            [activeContainer]: reordered,
          }));

          // Llamar al API
          try {
            await updateTaskPosition.mutateAsync({
              taskId: draggedId,
              newStatus: activeContainer as TaskStatus,
              newPosition: newIndex,
            });
          } catch (error) {
            console.error('Error al reordenar tarea:', error);
            resetContainers();
          }
        }
      } else {
        // ── Cross-container (ya movido en onDragOver) ────────────
        const overItems = containerItems[overContainer] || [];
        const newIndex = overItems.indexOf(draggedId);

        // Llamar al API
        try {
          await updateTaskPosition.mutateAsync({
            taskId: draggedId,
            newStatus: overContainer as TaskStatus,
            newPosition: Math.max(0, newIndex),
          });
        } catch (error) {
          console.error('Error al mover tarea entre columnas:', error);
          resetContainers();
        }
      }
    },
    [findContainer, containerItems, updateTaskPosition, resetContainers]
  );

  // ── Derivar optimisticTasksByStatus de containerItems ──────────────
  // Convierte IDs -> objetos de tarea completos para el render.
  const optimisticTasksByStatus = useMemo(() => {
    const result: TasksByStatus = {};
    for (const [status, ids] of Object.entries(containerItems)) {
      result[status] = ids
        .map((id) => safeTasks.find((t) => t.id === id))
        .filter((t): t is KanbanTask => t != null);
    }
    return result;
  }, [containerItems, safeTasks]);

  return {
    activeId,
    optimisticTasksByStatus,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
