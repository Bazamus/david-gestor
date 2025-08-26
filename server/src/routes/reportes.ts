// ======================================
// RUTAS PARA REPORTES Y KPIs - ACLIMAR
// Sistema profesional para facturación y seguimiento de proyectos
// ======================================

import { Router } from 'express';
import {
  obtenerEstadisticasGenerales,
  obtenerHorasPorProyecto,
  obtenerHorasDiarias,
  obtenerReporteProyecto,
  obtenerMetricasAvanzadas,
  obtenerSemanasDisponibles,
  testEndpoint,
  testPDF,
  obtenerDatosTareasPDF
} from '../controllers/reporteController';

const router = Router();

// ======================================
// MIDDLEWARE DE VALIDACIÓN
// ======================================

/**
 * Middleware para validar parámetros de fecha
 */
function validarFiltrosFecha(req: any, res: any, next: any) {
  const { fecha_inicio, fecha_fin } = req.query;
  
  if (fecha_inicio && !isValidDate(fecha_inicio)) {
    return res.status(400).json({
      error: 'Formato de fecha_inicio inválido. Use YYYY-MM-DD'
    });
  }
  
  if (fecha_fin && !isValidDate(fecha_fin)) {
    return res.status(400).json({
      error: 'Formato de fecha_fin inválido. Use YYYY-MM-DD'
    });
  }
  
  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    return res.status(400).json({
      error: 'La fecha_inicio no puede ser posterior a fecha_fin'
    });
  }
  
  next();
}

/**
 * Valida formato de fecha YYYY-MM-DD
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// ======================================
// RUTAS PRINCIPALES PARA FACTURACIÓN
// ======================================

/**
 * GET /api/reportes/estadisticas-generales
 * Obtiene estadísticas generales para el dashboard
 * Datos precisos para mostrar al cliente
 */
router.get('/estadisticas-generales', obtenerEstadisticasGenerales);

/**
 * GET /api/reportes/proyecto/:id
 * Obtiene reporte detallado de un proyecto específico
 * Para presentación profesional al cliente
 */
router.get('/proyecto/:id', obtenerReporteProyecto);

// ======================================
// RUTAS PARA ANÁLISIS DE HORAS
// ======================================

/**
 * GET /api/reportes/horas-por-proyecto
 * Obtiene distribución de horas trabajadas por proyecto
 * Esencial para justificar facturación
 * Query params: fecha_inicio, fecha_fin, proyectos[]
 */
router.get('/horas-por-proyecto', validarFiltrosFecha, obtenerHorasPorProyecto);

/**
 * GET /api/reportes/horas-diarias
 * Obtiene horas trabajadas por día para gráficos de tendencias
 * Muestra productividad diaria al cliente
 * Query params: fecha_inicio, fecha_fin
 */
router.get('/horas-diarias', validarFiltrosFecha, obtenerHorasDiarias);

/**
 * GET /api/reportes/metricas-avanzadas
 * Obtiene métricas avanzadas con filtro de semana actual
 * Para analytics y productividad por día de la semana
 */
router.get('/metricas-avanzadas', obtenerMetricasAvanzadas);

/**
 * GET /api/reportes/semanas-disponibles
 * Obtiene información de semanas disponibles para el selector
 * Para permitir navegación entre diferentes semanas
 */
router.get('/semanas-disponibles', obtenerSemanasDisponibles);

/**
 * GET /api/reportes/test
 * Endpoint de prueba para verificar conectividad
 */
router.get('/test', testEndpoint);

/**
 * GET /api/reportes/test-pdf
 * Endpoint de prueba para generar un PDF
 */
router.get('/test-pdf', testPDF);

/**
 * GET /api/reportes/datos-tareas-pdf
 * Obtiene datos de tareas con horas para reportes PDF
 * Query params: fecha_inicio, fecha_fin
 */
router.get('/datos-tareas-pdf', validarFiltrosFecha, obtenerDatosTareasPDF);

// ======================================
// RUTAS DE SALUD Y DIAGNÓSTICO
// ======================================

/**
 * GET /api/reportes/health
 * Verifica el estado del sistema de reportes
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Aclimar Reports API',
    version: '1.0.0',
    endpoints: [
      'GET /estadisticas-generales',
      'GET /proyecto/:id',
      'GET /horas-por-proyecto',
      'GET /horas-diarias'
    ]
  });
});

export default router;
