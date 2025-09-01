import express from 'express';
import {
  getTasks,
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskPosition,
  deleteTask,
  completeTask,
  reopenTask,
  getOverdueTasks,
  getUpcomingTasks
} from '../controllers/taskController';
import {
  validateCreateTask,
  validateUpdateTask,
  validateUpdateTaskPosition,
  validateTaskId,
  validateProjectIdParam,
  validateTaskFilters
} from '../middleware/validators';

const router = express.Router();

// ======================================
// RUTAS DE TAREAS
// ======================================

/**
 * @route   GET /api/tasks
 * @desc    Obtener todas las tareas con filtros opcionales
 * @access  Public (en implementación real sería privado)
 * @params  Query: project_id, status, priority, tags, due_date_from, due_date_to, search, sort_by, sort_order, limit, offset
 */
router.get('/', validateTaskFilters, getTasks);

/**
 * @route   POST /api/tasks
 * @desc    Crear una nueva tarea
 * @access  Public (en implementación real sería privado)
 * @body    { project_id, title, description?, status?, priority?, due_date?, estimated_hours?, tags?, position? }
 */
router.post('/', validateCreateTask, createTask);

/**
 * @route   GET /api/tasks/overdue
 * @desc    Obtener tareas vencidas
 * @access  Public (en implementación real sería privado)
 */
router.get('/overdue', getOverdueTasks);

/**
 * @route   GET /api/tasks/upcoming
 * @desc    Obtener tareas próximas a vencer
 * @access  Public (en implementación real sería privado)
 * @params  Query: days (opcional, por defecto 7)
 */
router.get('/upcoming', getUpcomingTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Obtener una tarea específica por ID
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 */
router.get('/:id', validateTaskId, getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Actualizar una tarea existente
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 * @body    { title?, description?, status?, priority?, due_date?, estimated_hours?, actual_hours?, tags?, position? }
 */
router.put('/:id', validateUpdateTask, updateTask);

/**
 * @route   PATCH /api/tasks/:id/position
 * @desc    Actualizar posición de tarea (para Kanban drag & drop)
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 * @body    { position, status? }
 */
router.patch('/:id/position', validateUpdateTaskPosition, updateTaskPosition);

/**
 * @route   PATCH /api/tasks/:id/complete
 * @desc    Marcar tarea como completada
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 */
router.patch('/:id/complete', validateTaskId, completeTask);

/**
 * @route   PATCH /api/tasks/:id/reopen
 * @desc    Reabrir una tarea completada
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 */
router.patch('/:id/reopen', validateTaskId, reopenTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Eliminar una tarea
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID de la tarea
 */
router.delete('/:id', validateTaskId, deleteTask);

// ======================================
// RUTAS ANIDADAS - TAREAS POR PROYECTO
// ======================================

/**
 * @route   GET /api/projects/:projectId/tasks
 * @desc    Obtener todas las tareas de un proyecto específico
 * @access  Public (en implementación real sería privado)
 * @params  projectId: UUID del proyecto
 */
router.get('/project/:projectId', validateProjectIdParam, getProjectTasks);

export default router;