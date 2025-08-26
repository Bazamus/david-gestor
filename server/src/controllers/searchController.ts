import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../services/supabaseService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { 
  ApiResponse,
  SearchResult,
  SearchParams
} from '../types';

// ======================================
// BÚSQUEDA GLOBAL
// ======================================
export const globalSearch = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { q: query, type, limit, offset } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return next(createError('Parámetro de búsqueda requerido', 400));
  }

  if (query.trim().length < 2) {
    return next(createError('La búsqueda debe tener al menos 2 caracteres', 400));
  }

  const searchParams: SearchParams = {
    query: query.trim(),
    type: type as any || 'all',
    limit: limit ? parseInt(limit as string) : 20,
    offset: offset ? parseInt(offset as string) : 0,
  };

  // Validar parámetros
  if (searchParams.limit && (searchParams.limit < 1 || searchParams.limit > 100)) {
    return next(createError('El límite debe estar entre 1 y 100', 400));
  }

  if (searchParams.offset && searchParams.offset < 0) {
    return next(createError('El offset debe ser mayor o igual a 0', 400));
  }

  if (searchParams.type && !['all', 'project', 'task'].includes(searchParams.type)) {
    return next(createError('Tipo de búsqueda inválido. Debe ser: all, project, o task', 400));
  }

  try {
    const results = await supabaseService.search(searchParams);

    const response: ApiResponse<SearchResult[]> = {
      success: true,
      data: results,
      message: `${results.length} resultados encontrados para "${searchParams.query}"`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error en búsqueda: ${error}`, 500));
  }
});

// ======================================
// BÚSQUEDA AVANZADA DE PROYECTOS
// ======================================
export const searchProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    q: query, 
    status, 
    start_date, 
    end_date,
    sort_by,
    sort_order,
    limit,
    offset 
  } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return next(createError('Parámetro de búsqueda requerido', 400));
  }

  try {
    const projects = await supabaseService.getProjects({
      search: query.trim(),
      status: status ? (status as string).split(',') as any : undefined,
      start_date: start_date as string,
      end_date: end_date as string,
      sort_by: sort_by as any || 'updated_at',
      sort_order: sort_order as any || 'desc',
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0,
    });

    const response: ApiResponse = {
      success: true,
      data: projects,
      message: `${projects.length} proyectos encontrados`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error en búsqueda de proyectos: ${error}`, 500));
  }
});

// ======================================
// BÚSQUEDA AVANZADA DE TAREAS
// ======================================
export const searchTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { 
    q: query,
    project_id,
    status,
    priority,
    tags,
    due_date_from,
    due_date_to,
    sort_by,
    sort_order,
    limit,
    offset 
  } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return next(createError('Parámetro de búsqueda requerido', 400));
  }

  try {
    const tasks = await supabaseService.getTasks({
      search: query.trim(),
      project_id: project_id as string,
      status: status ? (status as string).split(',') as any : undefined,
      priority: priority ? (priority as string).split(',') as any : undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      due_date_from: due_date_from as string,
      due_date_to: due_date_to as string,
      sort_by: sort_by as any || 'updated_at',
      sort_order: sort_order as any || 'desc',
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0,
    });

    const response: ApiResponse = {
      success: true,
      data: tasks,
      message: `${tasks.length} tareas encontradas`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error en búsqueda de tareas: ${error}`, 500));
  }
});

// ======================================
// SUGERENCIAS DE BÚSQUEDA
// ======================================
export const getSearchSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { q: query } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return next(createError('Parámetro de búsqueda requerido', 400));
  }

  if (query.trim().length < 2) {
    const response: ApiResponse = {
      success: true,
      data: [],
      message: 'Se requieren al menos 2 caracteres para sugerencias',
    };
    return res.status(200).json(response);
  }

  try {
    // Buscar coincidencias parciales en proyectos y tareas
    const [projects, tasks] = await Promise.all([
      supabaseService.getProjects({
        search: query.trim(),
        limit: 5,
        sort_by: 'updated_at',
        sort_order: 'desc'
      }),
      supabaseService.getTasks({
        search: query.trim(),
        limit: 5,
        sort_by: 'updated_at',
        sort_order: 'desc'
      })
    ]);

    // Formatear sugerencias
    const suggestions = [
      ...projects.map(project => ({
        type: 'project',
        id: project.id,
        title: project.name,
        description: project.description,
        color: project.color,
        match_type: 'name'
      })),
      ...tasks.map(task => ({
        type: 'task',
        id: task.id,
        title: task.title,
        description: task.description,
        project_id: task.project_id,
        priority: task.priority,
        match_type: 'title'
      }))
    ];

    // Obtener también sugerencias de etiquetas populares
    const allTasks = await supabaseService.getTasks({ limit: 100 });
    const tagFrequency: { [key: string]: number } = {};
    
    allTasks.forEach(task => {
      task.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        }
      });
    });

    const tagSuggestions = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([tag, count]) => ({
        type: 'tag',
        title: tag,
        count,
        match_type: 'tag'
      }));

    const allSuggestions = [...suggestions, ...tagSuggestions];

    const response: ApiResponse = {
      success: true,
      data: allSuggestions,
      message: `${allSuggestions.length} sugerencias encontradas`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener sugerencias: ${error}`, 500));
  }
});

// ======================================
// BUSCAR POR ETIQUETAS
// ======================================
export const searchByTags = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { tags } = req.query;

  if (!tags || typeof tags !== 'string' || tags.trim().length === 0) {
    return next(createError('Parámetro de etiquetas requerido', 400));
  }

  const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

  if (tagList.length === 0) {
    return next(createError('Se requiere al menos una etiqueta válida', 400));
  }

  try {
    const tasks = await supabaseService.getTasks({
      tags: tagList,
      sort_by: 'updated_at',
      sort_order: 'desc'
    });

    // Calcular relevancia basada en coincidencias de etiquetas
    const tasksWithRelevance = tasks.map(task => {
      const matchingTags = task.tags.filter(tag => 
        tagList.some(searchTag => 
          tag.toLowerCase().includes(searchTag.toLowerCase())
        )
      );
      
      return {
        ...task,
        matching_tags: matchingTags,
        relevance_score: matchingTags.length / tagList.length
      };
    });

    // Ordenar por relevancia
    tasksWithRelevance.sort((a, b) => b.relevance_score - a.relevance_score);

    const response: ApiResponse = {
      success: true,
      data: tasksWithRelevance,
      message: `${tasksWithRelevance.length} tareas encontradas con las etiquetas especificadas`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error en búsqueda por etiquetas: ${error}`, 500));
  }
});

// ======================================
// HISTORIAL DE BÚSQUEDAS (SIMULADO)
// ======================================
export const getSearchHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // En una implementación real, esto vendría de una base de datos
  // Por ahora retornamos un historial simulado
  const mockHistory = [
    {
      query: 'frontend development',
      type: 'all',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      results_count: 15
    },
    {
      query: 'API documentation',
      type: 'task',
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      results_count: 8
    },
    {
      query: 'database schema',
      type: 'project',
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      results_count: 3
    }
  ];

  const response: ApiResponse = {
    success: true,
    data: mockHistory,
    message: 'Historial de búsquedas obtenido exitosamente',
  };

  res.status(200).json(response);
});

// ======================================
// ESTADÍSTICAS DE BÚSQUEDA
// ======================================
export const getSearchStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener datos para estadísticas
    const [allProjects, allTasks] = await Promise.all([
      supabaseService.getProjects({}),
      supabaseService.getTasks({})
    ]);

    // Calcular estadísticas
    const totalProjects = allProjects.length;
    const totalTasks = allTasks.length;
    
    // Etiquetas más populares
    const tagFrequency: { [key: string]: number } = {};
    allTasks.forEach(task => {
      task.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    const popularTags = Object.entries(tagFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    // Distribuciones
    const projectStatusDistribution = allProjects.reduce((acc: any, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const taskStatusDistribution = allTasks.reduce((acc: any, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const taskPriorityDistribution = allTasks.reduce((acc: any, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totals: {
        projects: totalProjects,
        tasks: totalTasks,
        unique_tags: Object.keys(tagFrequency).length
      },
      distributions: {
        project_status: projectStatusDistribution,
        task_status: taskStatusDistribution,
        task_priority: taskPriorityDistribution
      },
      popular_tags: popularTags,
      search_tips: [
        'Usa palabras clave específicas para mejores resultados',
        'Combina filtros de estado y prioridad para búsquedas avanzadas',
        'Las etiquetas son útiles para organizar y encontrar tareas',
        'Búsquedas de 2+ caracteres muestran sugerencias automáticas'
      ]
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Estadísticas de búsqueda obtenidas exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener estadísticas de búsqueda: ${error}`, 500));
  }
});