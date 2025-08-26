import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabaseService } from '../services/supabaseService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters,
  ApiResponse,
  Task,
  TaskStatus,
  TaskPriority
} from '../types';

// ======================================
// OBTENER TODAS LAS TAREAS
// ======================================
export const getTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const filters: TaskFilters = {
    project_id: req.query.project_id as string,
    status: req.query.status ? (req.query.status as string).split(',') as TaskStatus[] : undefined,
    priority: req.query.priority ? (req.query.priority as string).split(',') as TaskPriority[] : undefined,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    search: req.query.search as string,
    due_date_from: req.query.due_date_from as string,
    due_date_to: req.query.due_date_to as string,
    sort_by: req.query.sort_by as any || 'position',
    sort_order: req.query.sort_order as any || 'asc',
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
  };

  try {
    const tasks = await supabaseService.getTasks(filters);
    
    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `${tasks.length} tareas encontradas`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener tareas: ${error}`, 500));
  }
});

// ======================================
// OBTENER TAREAS DE UN PROYECTO
// ======================================
export const getProjectTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;

  if (!projectId) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  try {
    // Verificar que el proyecto existe
    const project = await supabaseService.getProjectById(projectId);
    if (!project) {
      return next(createError('Proyecto no encontrado', 404));
    }

    const tasks = await supabaseService.getTasks({ project_id: projectId });
    
    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `${tasks.length} tareas encontradas para el proyecto`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener tareas del proyecto: ${error}`, 500));
  }
});

// ======================================
// OBTENER TAREA POR ID
// ======================================
export const getTaskById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  try {
    const task = await supabaseService.getTaskById(id);

    if (!task) {
      return next(createError('Tarea no encontrada', 404));
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
      message: 'Tarea encontrada exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener tarea: ${error}`, 500));
  }
});

// ======================================
// CREAR NUEVA TAREA
// ======================================
export const createTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError('Datos de entrada inválidos', 400));
  }

  const taskData: CreateTaskRequest = req.body;

  // Validaciones adicionales
  if (!taskData.title || taskData.title.trim().length === 0) {
    return next(createError('El título de la tarea es requerido', 400));
  }

  if (!taskData.project_id) {
    return next(createError('El ID del proyecto es requerido', 400));
  }

  // Validar que las horas estimadas sean positivas
  if (taskData.estimated_hours && taskData.estimated_hours < 0) {
    return next(createError('Las horas estimadas deben ser un número positivo', 400));
  }

  // Validar fecha de vencimiento (no puede ser en el pasado)
  if (taskData.due_date) {
    const dueDate = new Date(taskData.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      return next(createError('La fecha de vencimiento no puede ser en el pasado', 400));
    }
  }

  try {
    // Verificar que el proyecto existe
    const project = await supabaseService.getProjectById(taskData.project_id);
    if (!project) {
      return next(createError('Proyecto no encontrado', 404));
    }

    // Establecer valores por defecto
    const newTaskData = {
      project_id: taskData.project_id,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || undefined,
      status: taskData.status || TaskStatus.NADA,
      priority: taskData.priority || TaskPriority.MEDIUM,
      due_date: taskData.due_date || undefined,
      estimated_hours: taskData.estimated_hours || undefined,
      tags: taskData.tags || [],
      position: taskData.position || 0,
      
      // Campos expandidos - Información y asignación
      tipo_tarea: taskData.tipo_tarea || 'desarrollo',
      asignado_a: taskData.asignado_a || undefined,
      complejidad: typeof taskData.complejidad === 'number' ? taskData.complejidad : 3,
      tarea_padre_id: taskData.tarea_padre_id || undefined,
      
      // Seguimiento y progreso
      porcentaje_completado: taskData.porcentaje_completado || 0,
      tiempo_estimado_horas: taskData.tiempo_estimado_horas || undefined,
      tiempo_real_horas: taskData.tiempo_real_horas || undefined,
      fecha_inicio: taskData.fecha_inicio || undefined,
      
      // Criterios y validación
      criterios_aceptacion: taskData.criterios_aceptacion || [],
      definicion_terminado: taskData.definicion_terminado || undefined,
      bloqueadores: taskData.bloqueadores || undefined,
      
      // Información técnica
      branch_git: taskData.branch_git || undefined,
      commit_relacionado: taskData.commit_relacionado || undefined,
      url_pull_request: taskData.url_pull_request || undefined,
      
      // Dependencias y relaciones
      dependencias: taskData.dependencias || [],
      impacto_otras_tareas: taskData.impacto_otras_tareas || undefined,
      
      // Archivos y recursos
      archivos_adjuntos: taskData.archivos_adjuntos || [],
      enlaces_referencia: taskData.enlaces_referencia || [],
      onedrive_folder_id: taskData.onedrive_folder_id || undefined,
      
      // Automatización y recurrencia
      es_recurrente: taskData.es_recurrente || false,
  
      notas_internas: taskData.notas_internas || undefined
    };

    const task = await supabaseService.createTask(newTaskData);

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
      message: 'Tarea creada exitosamente',
    };

    res.status(201).json(response);
  } catch (error) {
    next(createError(`Error al crear tarea: ${error}`, 500));
  }
});

// ======================================
// ACTUALIZAR TAREA
// ======================================
export const updateTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError('Datos de entrada inválidos', 400));
  }

  const updateData: UpdateTaskRequest = req.body;

  // Validaciones adicionales
  if (updateData.title && updateData.title.trim().length === 0) {
    return next(createError('El título de la tarea no puede estar vacío', 400));
  }

  // Validar horas estimadas y reales
  if (updateData.estimated_hours && updateData.estimated_hours < 0) {
    return next(createError('Las horas estimadas deben ser un número positivo', 400));
  }

  if (updateData.actual_hours && updateData.actual_hours < 0) {
    return next(createError('Las horas reales deben ser un número positivo', 400));
  }

  // Validar fecha de vencimiento (permitir fechas pasadas para tareas existentes)
  if (updateData.due_date) {
    const dueDate = new Date(updateData.due_date);
    if (isNaN(dueDate.getTime())) {
      return next(createError('Formato de fecha de vencimiento inválido', 400));
    }
    // Permitir fechas pasadas para tareas existentes (pueden tener fechas de vencimiento que ya pasaron)
  }

  try {
    // Verificar que la tarea existe
    const existingTask = await supabaseService.getTaskById(id);
    if (!existingTask) {
      return next(createError('Tarea no encontrada', 404));
    }

    // Limpiar datos de entrada - Campos básicos
    const cleanUpdateData: any = {};
    if (updateData.title) cleanUpdateData.title = updateData.title.trim();
    if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim() || undefined;
    if (updateData.status) cleanUpdateData.status = updateData.status;
    if (updateData.priority) cleanUpdateData.priority = updateData.priority;
    if (updateData.due_date !== undefined) cleanUpdateData.due_date = updateData.due_date;
    if (updateData.estimated_hours !== undefined) cleanUpdateData.estimated_hours = updateData.estimated_hours;
    if (updateData.actual_hours !== undefined) cleanUpdateData.actual_hours = updateData.actual_hours;
    if (updateData.tags !== undefined) cleanUpdateData.tags = updateData.tags;
    if (updateData.position !== undefined) cleanUpdateData.position = updateData.position;

    // Campos expandidos - Gestión y asignación
    if (updateData.tipo_tarea !== undefined) cleanUpdateData.tipo_tarea = updateData.tipo_tarea;
    if (updateData.asignado_a !== undefined) cleanUpdateData.asignado_a = updateData.asignado_a?.trim() || undefined;
    if (updateData.complejidad !== undefined) cleanUpdateData.complejidad = updateData.complejidad;
    if (updateData.tarea_padre_id !== undefined) cleanUpdateData.tarea_padre_id = updateData.tarea_padre_id;

    // Seguimiento y progreso
    if (updateData.porcentaje_completado !== undefined) cleanUpdateData.porcentaje_completado = updateData.porcentaje_completado;
    if (updateData.tiempo_estimado_horas !== undefined) cleanUpdateData.tiempo_estimado_horas = updateData.tiempo_estimado_horas;
    if (updateData.tiempo_real_horas !== undefined) cleanUpdateData.tiempo_real_horas = updateData.tiempo_real_horas;
    if (updateData.fecha_inicio !== undefined) cleanUpdateData.fecha_inicio = updateData.fecha_inicio;

    // Criterios de aceptación
    if (updateData.criterios_aceptacion !== undefined) cleanUpdateData.criterios_aceptacion = updateData.criterios_aceptacion;
    if (updateData.definicion_terminado !== undefined) cleanUpdateData.definicion_terminado = updateData.definicion_terminado?.trim() || undefined;
    if (updateData.bloqueadores !== undefined) cleanUpdateData.bloqueadores = updateData.bloqueadores?.trim() || undefined;

    // Información técnica
    if (updateData.branch_git !== undefined) cleanUpdateData.branch_git = updateData.branch_git?.trim() || undefined;
    if (updateData.commit_relacionado !== undefined) cleanUpdateData.commit_relacionado = updateData.commit_relacionado?.trim() || undefined;
    if (updateData.url_pull_request !== undefined) cleanUpdateData.url_pull_request = updateData.url_pull_request?.trim() || undefined;

    // Dependencias y relaciones
    if (updateData.dependencias !== undefined) cleanUpdateData.dependencias = updateData.dependencias;
    if (updateData.impacto_otras_tareas !== undefined) cleanUpdateData.impacto_otras_tareas = updateData.impacto_otras_tareas?.trim() || undefined;

    // Archivos y recursos
    if (updateData.archivos_adjuntos !== undefined) cleanUpdateData.archivos_adjuntos = updateData.archivos_adjuntos;
    if (updateData.enlaces_referencia !== undefined) cleanUpdateData.enlaces_referencia = updateData.enlaces_referencia;
    if (updateData.onedrive_folder_id !== undefined) cleanUpdateData.onedrive_folder_id = updateData.onedrive_folder_id?.trim() || undefined;

    // Automatización y recurrencia
    if (updateData.es_recurrente !== undefined) cleanUpdateData.es_recurrente = updateData.es_recurrente;
    if (updateData.notas_internas !== undefined) cleanUpdateData.notas_internas = updateData.notas_internas?.trim() || undefined;

    const updatedTask = await supabaseService.updateTask(id, cleanUpdateData);

    const response: ApiResponse<Task> = {
      success: true,
      data: updatedTask,
      message: 'Tarea actualizada exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al actualizar tarea: ${error}`, 500));
  }
});

// ======================================
// ACTUALIZAR POSICIÓN DE TAREA (KANBAN)
// ======================================
export const updateTaskPosition = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { position, status } = req.body;

  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  if (position === undefined) {
    return next(createError('La nueva posición es requerida', 400));
  }

  if (position < 0) {
    return next(createError('La posición debe ser un número positivo', 400));
  }

  try {
    // Verificar que la tarea existe
    const existingTask = await supabaseService.getTaskById(id);
    if (!existingTask) {
      return next(createError('Tarea no encontrada', 404));
    }

    // Actualizar posición y estado si se proporciona
    const updateData: any = { position };
    if (status) {
      updateData.status = status;
    }

    const updatedTask = await supabaseService.updateTask(id, updateData);

    const response: ApiResponse<Task> = {
      success: true,
      data: updatedTask,
      message: 'Posición de tarea actualizada exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al actualizar posición de tarea: ${error}`, 500));
  }
});

// ======================================
// ELIMINAR TAREA
// ======================================
export const deleteTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  try {
    // Verificar que la tarea existe
    const existingTask = await supabaseService.getTaskById(id);
    if (!existingTask) {
      return next(createError('Tarea no encontrada', 404));
    }

    await supabaseService.deleteTask(id);

    const response: ApiResponse = {
      success: true,
      message: 'Tarea eliminada exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al eliminar tarea: ${error}`, 500));
  }
});

// ======================================
// COMPLETAR TAREA
// ======================================
export const completeTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  try {
    // Verificar que la tarea existe
    const existingTask = await supabaseService.getTaskById(id);
    if (!existingTask) {
      return next(createError('Tarea no encontrada', 404));
    }

    if (existingTask.status === TaskStatus.DONE) {
      return next(createError('La tarea ya está completada', 400));
    }

    // Marcar como completada
    const completedTask = await supabaseService.updateTask(id, { status: TaskStatus.DONE });

    const response: ApiResponse<Task> = {
      success: true,
      data: completedTask,
      message: 'Tarea completada exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al completar tarea: ${error}`, 500));
  }
});

// ======================================
// REABRIR TAREA
// ======================================
export const reopenTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID de la tarea es requerido', 400));
  }

  try {
    // Verificar que la tarea existe
    const existingTask = await supabaseService.getTaskById(id);
    if (!existingTask) {
      return next(createError('Tarea no encontrada', 404));
    }

    if (existingTask.status !== TaskStatus.DONE) {
      return next(createError('Solo se pueden reabrir tareas completadas', 400));
    }

    // Reabrir tarea
    const reopenedTask = await supabaseService.updateTask(id, { status: TaskStatus.TODO });

    const response: ApiResponse<Task> = {
      success: true,
      data: reopenedTask,
      message: 'Tarea reabierta exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al reabrir tarea: ${error}`, 500));
  }
});

// ======================================
// OBTENER TAREAS VENCIDAS
// ======================================
export const getOverdueTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date().toISOString();
    
    const tasks = await supabaseService.getTasks({
      status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      due_date_to: now,
      sort_by: 'due_date',
      sort_order: 'asc'
    });

    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `${tasks.length} tareas vencidas encontradas`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener tareas vencidas: ${error}`, 500));
  }
});

// ======================================
// OBTENER TAREAS PRÓXIMAS A VENCER
// ======================================
export const getUpcomingTasks = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const days = parseInt(req.query.days as string) || 7;

  try {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const tasks = await supabaseService.getTasks({
      status: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      due_date_from: now.toISOString(),
      due_date_to: futureDate.toISOString(),
      sort_by: 'due_date',
      sort_order: 'asc'
    });

    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      message: `${tasks.length} tareas próximas a vencer en ${days} días`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener tareas próximas a vencer: ${error}`, 500));
  }
});