import express from 'express';
import {
  globalSearch,
  searchProjects,
  searchTasks,
  getSearchSuggestions,
  searchByTags,
  getSearchHistory,
  getSearchStats
} from '../controllers/searchController';
import {
  validateSearch,
  validateSearchSuggestions,
  validateSearchByTags,
  validateProjectFilters,
  validateTaskFilters
} from '../middleware/validators';

const router = express.Router();

// ======================================
// RUTAS DE BÚSQUEDA
// ======================================

/**
 * @route   GET /api/search
 * @desc    Búsqueda global en proyectos y tareas
 * @access  Public (en implementación real sería privado)
 * @params  Query: q (requerido), type (opcional: all|project|task), limit, offset
 */
router.get('/', validateSearch, globalSearch);

/**
 * @route   GET /api/search/projects
 * @desc    Búsqueda avanzada de proyectos
 * @access  Public (en implementación real sería privado)
 * @params  Query: q (requerido), status, start_date, end_date, sort_by, sort_order, limit, offset
 */
router.get('/projects', validateSearch, validateProjectFilters, searchProjects);

/**
 * @route   GET /api/search/tasks
 * @desc    Búsqueda avanzada de tareas
 * @access  Public (en implementación real sería privado)
 * @params  Query: q (requerido), project_id, status, priority, tags, due_date_from, due_date_to, sort_by, sort_order, limit, offset
 */
router.get('/tasks', validateSearch, validateTaskFilters, searchTasks);

/**
 * @route   GET /api/search/suggestions
 * @desc    Obtener sugerencias de búsqueda en tiempo real
 * @access  Public (en implementación real sería privado)
 * @params  Query: q (requerido, mínimo 1 carácter)
 */
router.get('/suggestions', validateSearchSuggestions, getSearchSuggestions);

/**
 * @route   GET /api/search/tags
 * @desc    Buscar tareas por etiquetas específicas
 * @access  Public (en implementación real sería privado)
 * @params  Query: tags (requerido, separado por comas)
 */
router.get('/tags', validateSearchByTags, searchByTags);

/**
 * @route   GET /api/search/history
 * @desc    Obtener historial de búsquedas (simulado)
 * @access  Public (en implementación real sería privado)
 */
router.get('/history', getSearchHistory);

/**
 * @route   GET /api/search/stats
 * @desc    Obtener estadísticas de búsqueda y contenido
 * @access  Public (en implementación real sería privado)
 */
router.get('/stats', getSearchStats);

export default router;