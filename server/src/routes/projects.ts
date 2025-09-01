import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  archiveProject,
  getProjectList
} from '../controllers/projectController';
import {
  validateCreateProject,
  validateUpdateProject,
  validateProjectId,
  validateProjectFilters
} from '../middleware/validators';

const router = express.Router();

// ======================================
// RUTAS DE PROYECTOS
// ======================================

/**
 * @route   GET /api/projects
 * @desc    Obtener todos los proyectos con filtros opcionales
 * @access  Public (en implementación real sería privado)
 * @params  Query: status, search, start_date, end_date, sort_by, sort_order, limit, offset
 */
/**
 * @route   GET /api/projects/list
 * @desc    Obtener una lista simplificada de proyectos para filtros
 * @access  Public (en implementación real sería privado)
 */
router.get('/list', getProjectList);

router.get('/', validateProjectFilters, getProjects);

/**
 * @route   POST /api/projects
 * @desc    Crear un nuevo proyecto
 * @access  Public (en implementación real sería privado)
 * @body    { name, description?, color?, status?, start_date?, end_date? }
 */
router.post('/', validateCreateProject, createProject);

/**
 * @route   GET /api/projects/:id
 * @desc    Obtener un proyecto específico por ID
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID del proyecto
 */
router.get('/:id', validateProjectId, getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Actualizar un proyecto existente
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID del proyecto
 * @body    { name?, description?, color?, status?, start_date?, end_date? }
 */
router.put('/:id', validateUpdateProject, updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Eliminar un proyecto (solo si no tiene tareas)
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID del proyecto
 */
router.delete('/:id', validateProjectId, deleteProject);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Obtener estadísticas detalladas de un proyecto
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID del proyecto
 */
router.get('/:id/stats', validateProjectId, getProjectStats);

/**
 * @route   PATCH /api/projects/:id/archive
 * @desc    Archivar un proyecto (cambiar estado a 'archived')
 * @access  Public (en implementación real sería privado)
 * @params  id: UUID del proyecto
 */
router.patch('/:id/archive', validateProjectId, archiveProject);

export default router;