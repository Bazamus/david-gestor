import express from 'express';
import {
  getTimeEntries,
  createTimeEntry,
  getTimeEntryById,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeSummary,
  getProjectTimeSummary,
  getTaskTimeSummary,
  getTimeEntriesByTask,
  getTimeEntriesByProject
} from '../controllers/timeEntryController';

const router = express.Router();

// ======================================
// RUTAS DE TIME ENTRIES
// ======================================

/**
 * @route   GET /api/time-entries
 * @desc    Obtener todas las entradas de tiempo con filtros
 * @access  Public
 * @params  Query: project_id, task_id, date_from, date_to, billable, search, limit, offset
 */
router.get('/', getTimeEntries);

/**
 * @route   POST /api/time-entries
 * @desc    Crear una nueva entrada de tiempo
 * @access  Public
 * @body    { task_id, description, hours, date, start_time?, end_time?, comments?, billable?, rate_per_hour? }
 */
router.post('/', createTimeEntry);

/**
 * @route   GET /api/time-entries/summary
 * @desc    Obtener resumen de tiempo con filtros
 * @access  Public
 * @params  Query: project_id, task_id, date_from, date_to, billable
 */
router.get('/summary', getTimeSummary);

/**
 * @route   GET /api/time-entries/:id
 * @desc    Obtener una entrada de tiempo específica
 * @access  Public
 * @params  id: UUID de la entrada de tiempo
 */
router.get('/:id', getTimeEntryById);

/**
 * @route   PUT /api/time-entries/:id
 * @desc    Actualizar una entrada de tiempo
 * @access  Public
 * @params  id: UUID de la entrada de tiempo
 * @body    { description?, hours?, date?, start_time?, end_time?, comments?, billable?, rate_per_hour? }
 */
router.put('/:id', updateTimeEntry);

/**
 * @route   DELETE /api/time-entries/:id
 * @desc    Eliminar una entrada de tiempo
 * @access  Public
 * @params  id: UUID de la entrada de tiempo
 */
router.delete('/:id', deleteTimeEntry);

// ======================================
// RUTAS PARA TAREAS Y PROYECTOS
// ======================================

/**
 * @route   GET /api/time-entries/task/:id
 * @desc    Obtener entradas de tiempo de una tarea específica
 * @access  Public
 * @params  id: UUID de la tarea
 */
router.get('/task/:id', getTimeEntriesByTask);

/**
 * @route   GET /api/time-entries/task/:id/summary
 * @desc    Obtener resumen de tiempo de una tarea
 * @access  Public
 * @params  id: UUID de la tarea
 */
router.get('/task/:id/summary', getTaskTimeSummary);

/**
 * @route   GET /api/time-entries/project/:id
 * @desc    Obtener entradas de tiempo de un proyecto específico
 * @access  Public
 * @params  id: UUID del proyecto
 */
router.get('/project/:id', getTimeEntriesByProject);

/**
 * @route   GET /api/time-entries/project/:id/summary
 * @desc    Obtener resumen de tiempo de un proyecto
 * @access  Public
 * @params  id: UUID del proyecto
 */
router.get('/project/:id/summary', getProjectTimeSummary);

export default router;
