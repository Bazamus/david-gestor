import express from 'express';
import {
  getDashboardStats,
  getQuickSummary,
  getProductivityStats,
  getProjectsProgress,
  getRecentActivity,
  getTimeMetrics
} from '../controllers/dashboardController';
import { validateDashboardFilters } from '../middleware/validators';

const router = express.Router();

// ======================================
// RUTAS DEL DASHBOARD
// ======================================

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas completas del dashboard
 * @access  Public (en implementación real sería privado)
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/dashboard/summary
 * @desc    Obtener resumen rápido para la página principal
 * @access  Public (en implementación real sería privado)
 */
router.get('/summary', getQuickSummary);

/**
 * @route   GET /api/dashboard/productivity
 * @desc    Obtener estadísticas de productividad
 * @access  Public (en implementación real sería privado)
 */
router.get('/productivity', getProductivityStats);

/**
 * @route   GET /api/dashboard/projects-progress
 * @desc    Obtener progreso de todos los proyectos
 * @access  Public (en implementación real sería privado)
 */
router.get('/projects-progress', getProjectsProgress);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Obtener actividad reciente
 * @access  Public (en implementación real sería privado)
 * @params  Query: limit (opcional, por defecto 20)
 */
router.get('/recent-activity', validateDashboardFilters, getRecentActivity);

/**
 * @route   GET /api/dashboard/time-metrics
 * @desc    Obtener métricas de tiempo y estimaciones
 * @access  Public (en implementación real sería privado)
 */
router.get('/time-metrics', getTimeMetrics);

export default router;