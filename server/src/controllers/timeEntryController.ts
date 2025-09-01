import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { supabaseService } from '../services/supabaseService';
import { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest, 
  TimeEntryFilters,
  TimeSummary,
  ProjectTimeSummary,
  TaskTimeSummary
} from '../types';

// ======================================
// CONTROLADOR DE TIME ENTRIES
// ======================================

/**
 * @route   GET /api/time-entries
 * @desc    Obtener todas las entradas de tiempo con filtros
 * @access  Public
 */
export const getTimeEntries = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const filters: TimeEntryFilters = {
    project_id: req.query.project_id as string,
    task_id: req.query.task_id as string,
    date_from: req.query.date_from as string,
    date_to: req.query.date_to as string,
    billable: req.query.billable === 'true' ? true : req.query.billable === 'false' ? false : undefined,
    search: req.query.search as string,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
  };

  const timeEntries = await supabaseService.getTimeEntries(filters);
  
  res.status(200).json({
    success: true,
    data: timeEntries,
    message: 'Entradas de tiempo obtenidas correctamente'
  });
});

/**
 * @route   POST /api/time-entries
 * @desc    Crear una nueva entrada de tiempo
 * @access  Public
 */
export const createTimeEntry = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const timeEntryData: CreateTimeEntryRequest = req.body;

  // Validaciones básicas
  if (!timeEntryData.task_id || !timeEntryData.description || !timeEntryData.hours || !timeEntryData.date) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: task_id, description, hours, date'
    });
  }

  if (timeEntryData.hours <= 0 || timeEntryData.hours > 24) {
    return res.status(400).json({
      success: false,
      message: 'Las horas deben estar entre 0 y 24'
    });
  }

  const timeEntry = await supabaseService.createTimeEntry(timeEntryData);
  
  return res.status(201).json({
    success: true,
    data: timeEntry,
    message: 'Entrada de tiempo creada correctamente'
  });
});

/**
 * @route   GET /api/time-entries/:id
 * @desc    Obtener una entrada de tiempo específica
 * @access  Public
 */
export const getTimeEntryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de entrada de tiempo requerido'
    });
  }

  const timeEntry = await supabaseService.getTimeEntryById(id);
  
  return res.status(200).json({
    success: true,
    data: timeEntry,
    message: 'Entrada de tiempo obtenida correctamente'
  });
});

/**
 * @route   PUT /api/time-entries/:id
 * @desc    Actualizar una entrada de tiempo
 * @access  Public
 */
export const updateTimeEntry = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData: UpdateTimeEntryRequest = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de entrada de tiempo requerido'
    });
  }

  // Validaciones
  if (updateData.hours && (updateData.hours <= 0 || updateData.hours > 24)) {
    return res.status(400).json({
      success: false,
      message: 'Las horas deben estar entre 0 y 24'
    });
  }

  const timeEntry = await supabaseService.updateTimeEntry(id, updateData);
  
  return res.status(200).json({
    success: true,
    data: timeEntry,
    message: 'Entrada de tiempo actualizada correctamente'
  });
});

/**
 * @route   DELETE /api/time-entries/:id
 * @desc    Eliminar una entrada de tiempo
 * @access  Public
 */
export const deleteTimeEntry = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de entrada de tiempo requerido'
    });
  }

  await supabaseService.deleteTimeEntry(id);
  
  return res.status(200).json({
    success: true,
    message: 'Entrada de tiempo eliminada correctamente'
  });
});

/**
 * @route   GET /api/time-entries/summary
 * @desc    Obtener resumen de tiempo con filtros
 * @access  Public
 */
export const getTimeSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const filters: TimeEntryFilters = {
    project_id: req.query.project_id as string,
    task_id: req.query.task_id as string,
    date_from: req.query.date_from as string,
    date_to: req.query.date_to as string,
    billable: req.query.billable === 'true' ? true : req.query.billable === 'false' ? false : undefined
  };

  const summary = await supabaseService.getTimeSummary(filters);
  
  res.status(200).json({
    success: true,
    data: summary,
    message: 'Resumen de tiempo obtenido correctamente'
  });
});

/**
 * @route   GET /api/projects/:id/time-summary
 * @desc    Obtener resumen de tiempo de un proyecto
 * @access  Public
 */
export const getProjectTimeSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de proyecto requerido'
    });
  }

  const summary = await supabaseService.getProjectTimeSummary(id);
  
  return res.status(200).json({
    success: true,
    data: summary,
    message: 'Resumen de tiempo del proyecto obtenido correctamente'
  });
});

/**
 * @route   GET /api/tasks/:id/time-summary
 * @desc    Obtener resumen de tiempo de una tarea
 * @access  Public
 */
export const getTaskTimeSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }

  const summary = await supabaseService.getTaskTimeSummary(id);
  
  return res.status(200).json({
    success: true,
    data: summary,
    message: 'Resumen de tiempo de la tarea obtenido correctamente'
  });
});

/**
 * @route   GET /api/tasks/:id/time-entries
 * @desc    Obtener entradas de tiempo de una tarea específica
 * @access  Public
 */
export const getTimeEntriesByTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de tarea requerido'
    });
  }

  const timeEntries = await supabaseService.getTimeEntriesByTask(id);
  
  return res.status(200).json({
    success: true,
    data: timeEntries,
    message: 'Entradas de tiempo de la tarea obtenidas correctamente'
  });
});

/**
 * @route   GET /api/projects/:id/time-entries
 * @desc    Obtener entradas de tiempo de un proyecto específico
 * @access  Public
 */
export const getTimeEntriesByProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID de proyecto requerido'
    });
  }

  const timeEntries = await supabaseService.getTimeEntriesByProject(id);
  
  return res.status(200).json({
    success: true,
    data: timeEntries,
    message: 'Entradas de tiempo del proyecto obtenidas correctamente'
  });
});


