import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';

export interface CommandPaletteItem {
  id: string;
  type: 'project' | 'task' | 'action' | 'navigation';
  title: string;
  subtitle?: string;
  iconType: 'folder' | 'task' | 'plus' | 'home' | 'kanban' | 'settings';
  iconColor?: string;
  action: () => void;
  category: string;
  keywords: string[];
  priority: number;
}

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Datos para búsqueda
  const { data: projects = [] } = useProjects({});
  const { data: tasks = [] } = useTasks({});

  // Función para fuzzy matching básico
  const fuzzyMatch = (text: string, query: string): number => {
    if (!query) return 1;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Coincidencia exacta
    if (textLower.includes(queryLower)) {
      return 0.9;
    }
    
    // Coincidencia de caracteres en orden
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    
    if (queryIndex === queryLower.length) {
      return 0.6;
    }
    
    return 0;
  };

  // Generar items de proyectos
  const projectItems: CommandPaletteItem[] = useMemo(() => {
    return projects.map(project => ({
      id: `project-${project.id}`,
      type: 'project' as const,
      title: project.name,
      subtitle: project.description || 'Proyecto',
      iconType: 'folder' as const,
      iconColor: project.color,
      action: () => {
        navigate(`/projects/${project.id}`);
        setIsOpen(false);
      },
      category: 'Proyectos',
      keywords: [project.name, project.description || '', project.status],
      priority: 5,
    }));
  }, [projects, navigate]);

  // Generar items de tareas
  const taskItems: CommandPaletteItem[] = useMemo(() => {
    return tasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task' as const,
      title: task.title,
      subtitle: 'project' in task ? `${task.project.name}` : 'Tarea',
      iconType: 'task' as const,
      action: () => {
        navigate(`/tasks/${task.id}`);
        setIsOpen(false);
      },
      category: 'Tareas',
      keywords: [task.title, task.description || '', task.status, task.priority],
      priority: 4,
    }));
  }, [tasks, navigate]);

  // Acciones rápidas
  const actionItems: CommandPaletteItem[] = useMemo(() => [
    {
      id: 'create-project',
      type: 'action' as const,
      title: 'Crear nuevo proyecto',
      subtitle: 'Agregar un proyecto nuevo',
      iconType: 'plus' as const,
      action: () => {
        navigate('/projects/new');
        setIsOpen(false);
      },
      category: 'Acciones',
      keywords: ['crear', 'nuevo', 'proyecto', 'add', 'new', 'project'],
      priority: 6,
    },
    {
      id: 'create-task',
      type: 'action' as const,
      title: 'Crear nueva tarea',
      subtitle: 'Agregar una tarea nueva',
      iconType: 'plus' as const,
      action: () => {
        navigate('/tasks/new');
        setIsOpen(false);
      },
      category: 'Acciones',
      keywords: ['crear', 'nueva', 'tarea', 'add', 'new', 'task'],
      priority: 6,
    },
    {
      id: 'go-dashboard',
      type: 'navigation' as const,
      title: 'Ir al Dashboard',
      subtitle: 'Vista general de proyectos',
      iconType: 'home' as const,
      action: () => {
        navigate('/dashboard');
        setIsOpen(false);
      },
      category: 'Navegación',
      keywords: ['dashboard', 'inicio', 'home', 'overview'],
      priority: 7,
    },
    {
      id: 'go-projects',
      type: 'navigation' as const,
      title: 'Ver todos los proyectos',
      subtitle: 'Lista de proyectos',
      iconType: 'folder' as const,
      action: () => {
        navigate('/projects');
        setIsOpen(false);
      },
      category: 'Navegación',
      keywords: ['proyectos', 'projects', 'lista'],
      priority: 6,
    },
    {
      id: 'go-tasks',
      type: 'navigation' as const,
      title: 'Ver todas las tareas',
      subtitle: 'Lista de tareas',
      iconType: 'task' as const,
      action: () => {
        navigate('/tasks');
        setIsOpen(false);
      },
      category: 'Navegación',
      keywords: ['tareas', 'tasks', 'lista'],
      priority: 6,
    },
    {
      id: 'go-kanban',
      type: 'navigation' as const,
      title: 'Tablero Kanban Global',
      subtitle: 'Vista de tablero',
      iconType: 'kanban' as const,
      action: () => {
        navigate('/kanban');
        setIsOpen(false);
      },
      category: 'Navegación',
      keywords: ['kanban', 'tablero', 'board'],
      priority: 5,
    },
    {
      id: 'go-settings',
      type: 'navigation' as const,
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      iconType: 'settings' as const,
      action: () => {
        navigate('/settings');
        setIsOpen(false);
      },
      category: 'Navegación',
      keywords: ['configuración', 'settings', 'ajustes', 'config'],
      priority: 3,
    },
  ], [navigate]);

  // Todos los items disponibles
  const allItems = useMemo(() => [
    ...actionItems,
    ...projectItems,
    ...taskItems,
  ], [actionItems, projectItems, taskItems]);

  // Filtrar y ordenar items basado en la búsqueda
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sin búsqueda, mostrar acciones principales y elementos recientes
      return allItems
        .filter(item => item.priority >= 6)
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);
    }

    // Con búsqueda, filtrar y puntuar
    const scoredItems = allItems
      .map(item => {
        const titleScore = fuzzyMatch(item.title, searchQuery);
        const keywordScore = Math.max(
          ...item.keywords.map(keyword => fuzzyMatch(keyword, searchQuery))
        );
        const subtitleScore = item.subtitle ? fuzzyMatch(item.subtitle, searchQuery) : 0;
        
        const maxScore = Math.max(titleScore, keywordScore, subtitleScore);
        
        return {
          ...item,
          score: maxScore,
        };
      })
      .filter(item => item.score > 0.3)
      .sort((a, b) => {
        // Primero por score, luego por prioridad
        if (Math.abs(a.score - b.score) < 0.1) {
          return b.priority - a.priority;
        }
        return b.score - a.score;
      });

    return scoredItems.slice(0, 10);
  }, [allItems, searchQuery]);

  // Agrupar items por categoría
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Handlers de teclado
  const openPalette = useCallback(() => {
    setIsOpen(true);
    setSearchQuery('');
  }, []);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  const togglePalette = useCallback(() => {
    if (isOpen) {
      closePalette();
    } else {
      openPalette();
    }
  }, [isOpen, openPalette, closePalette]);

  // Event listeners para atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K o Ctrl+K
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        togglePalette();
      }
      
      // Escape para cerrar
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closePalette();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePalette, closePalette]);

  return {
    isOpen,
    searchQuery,
    setSearchQuery,
    filteredItems,
    groupedItems,
    openPalette,
    closePalette,
    togglePalette,
  };
};