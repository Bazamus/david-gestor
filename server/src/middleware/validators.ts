import { body, param, query } from 'express-validator';
import { ProjectStatus, TaskStatus, TaskPriority } from '../types';

// ======================================
// VALIDADORES PARA PROYECTOS
// ======================================

export const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del proyecto es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hex válido (ej: #3B82F6)'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Estado de proyecto inválido'),
  
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida (ISO 8601)'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida (ISO 8601)')
    .custom((value, { req }) => {
      if (value && req.body.start_date) {
        const startDate = new Date(req.body.start_date);
        const endDate = new Date(value);
        if (endDate < startDate) {
          throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
        }
      }
      return true;
    }),
];

export const validateUpdateProject = [
  param('id')
    .isUUID()
    .withMessage('ID de proyecto inválido'),
  
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre del proyecto no puede estar vacío')
    .isLength({ min: 1, max: 255 })
    .withMessage('El nombre debe tener entre 1 y 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('El color debe ser un código hex válido (ej: #3B82F6)'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Estado de proyecto inválido'),
  
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida (ISO 8601)'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida (ISO 8601)'),
];

export const validateProjectId = [
  param('id')
    .isUUID()
    .withMessage('ID de proyecto inválido'),
];

// ======================================
// VALIDADORES PARA TAREAS
// ======================================

export const validateCreateTask = [
  body('project_id')
    .isUUID()
    .withMessage('ID de proyecto inválido'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título de la tarea es requerido')
    .isLength({ min: 1, max: 255 })
    .withMessage('El título debe tener entre 1 y 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Estado de tarea inválido'),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Prioridad de tarea inválida'),
  
  body('due_date')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (isNaN(Date.parse(value))) {
        throw new Error('Fecha de vencimiento debe ser una fecha válida');
      }
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        throw new Error('La fecha de vencimiento no puede ser en el pasado');
      }
      return true;
    })
    .withMessage('Fecha de vencimiento debe ser una fecha válida'),
  
  body('estimated_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Las horas estimadas deben ser un número positivo'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
    .custom((tags) => {
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Cada etiqueta debe ser un string no vacío');
          }
          if (tag.length > 50) {
            throw new Error('Cada etiqueta no puede exceder 50 caracteres');
          }
        }
      }
      return true;
    }),
  
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La posición debe ser un número entero positivo'),
  
  // Campos expandidos - Información y asignación
  body('tipo_tarea')
    .optional()
    .isString()
    .withMessage('Tipo de tarea debe ser un string'),
  
  body('asignado_a')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (typeof value !== 'string') {
        throw new Error('Asignado debe ser un string');
      }
      if (value.length > 255) {
        throw new Error('Asignado debe tener máximo 255 caracteres');
      }
      return true;
    })
    .withMessage('Asignado debe tener máximo 255 caracteres'),
  
  body('complejidad')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true; // Permitir valores vacíos
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Complejidad debe ser un número entre 1 y 5');
      }
      return true;
    })
    .withMessage('Complejidad debe ser un número entre 1 y 5'),
  
  body('tarea_padre_id')
    .optional()
    .isUUID()
    .withMessage('ID de tarea padre inválido'),
  
  // Seguimiento y progreso
  body('porcentaje_completado')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Porcentaje completado debe estar entre 0 y 100'),
  
  body('tiempo_estimado_horas')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tiempo estimado debe ser un número positivo'),
  
  body('tiempo_real_horas')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tiempo real debe ser un número positivo'),
  
  body('fecha_inicio')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (isNaN(Date.parse(value))) {
        throw new Error('Fecha de inicio debe ser una fecha válida');
      }
      return true;
    })
    .withMessage('Fecha de inicio debe ser una fecha válida'),
  
  // Criterios y validación
  body('criterios_aceptacion')
    .optional()
    .isArray()
    .withMessage('Criterios de aceptación debe ser un array'),
  
  body('definicion_terminado')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Definición de terminado no puede exceder 1000 caracteres'),
  
  body('bloqueadores')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Bloqueadores no puede exceder 1000 caracteres'),
  
  // Información técnica
  body('branch_git')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Branch de Git no puede exceder 255 caracteres'),
  
  body('commit_relacionado')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Commit relacionado no puede exceder 255 caracteres'),
  
  body('url_pull_request')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      // Validar URL solo si hay un valor
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('URL de pull request debe ser una URL válida');
      }
      return true;
    })
    .withMessage('URL de pull request debe ser una URL válida'),
  
  // Dependencias y relaciones
  body('dependencias')
    .optional()
    .isArray()
    .withMessage('Dependencias debe ser un array'),
  
  body('impacto_otras_tareas')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Impacto en otras tareas no puede exceder 1000 caracteres'),
  
  // Archivos y recursos
  body('archivos_adjuntos')
    .optional()
    .isArray()
    .withMessage('Archivos adjuntos debe ser un array'),
  
  body('enlaces_referencia')
    .optional()
    .isArray()
    .withMessage('Enlaces de referencia debe ser un array'),
  
  body('onedrive_folder_id')
    .optional()
    .isString()
    .withMessage('ID de carpeta OneDrive debe ser un string'),
  
  // Automatización y recurrencia
  body('es_recurrente')
    .optional()
    .isBoolean()
    .withMessage('Es recurrente debe ser un booleano'),
  
    body('frecuencia_recurrencia')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (typeof value !== 'string') {
        throw new Error('Frecuencia de recurrencia debe ser un string');
      }
      const validFrequencies = ['diaria', 'semanal', 'quincenal', 'mensual', 'trimestral', 'semestral', 'anual', 'personalizada'];
      if (!validFrequencies.includes(value)) {
        throw new Error('Frecuencia de recurrencia debe ser uno de: diaria, semanal, quincenal, mensual, trimestral, semestral, anual, personalizada');
      }
      return true;
    })
    .withMessage('Frecuencia de recurrencia debe ser un valor válido'),
  
  body('notas_internas')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Notas internas no puede exceder 2000 caracteres'),
];

export const validateUpdateTask = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea inválido'),
  
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El título de la tarea no puede estar vacío')
    .isLength({ min: 1, max: 255 })
    .withMessage('El título debe tener entre 1 y 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Estado de tarea inválido'),
  
  body('priority')
    .optional()
    .isIn(Object.values(TaskPriority))
    .withMessage('Prioridad de tarea inválida'),
  
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de vencimiento debe ser una fecha válida (ISO 8601)'),
  
  body('estimated_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las horas estimadas deben ser un número entero positivo'),
  
  body('actual_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Las horas reales deben ser un número entero positivo'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Las etiquetas deben ser un array')
    .custom((tags) => {
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            throw new Error('Cada etiqueta debe ser un string no vacío');
          }
          if (tag.length > 50) {
            throw new Error('Cada etiqueta no puede exceder 50 caracteres');
          }
        }
      }
      return true;
    }),
  
  body('position')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La posición debe ser un número entero positivo'),
  
  // Campos expandidos - Información y asignación
  body('tipo_tarea')
    .optional()
    .isString()
    .withMessage('Tipo de tarea debe ser un string'),
  
  body('asignado_a')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (typeof value !== 'string') {
        throw new Error('Asignado debe ser un string');
      }
      if (value.length > 255) {
        throw new Error('Asignado debe tener máximo 255 caracteres');
      }
      return true;
    })
    .withMessage('Asignado debe tener máximo 255 caracteres'),
  
  body('complejidad')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) {
        return true; // Permitir valores vacíos
      }
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 5) {
        throw new Error('Complejidad debe ser un número entre 1 y 5');
      }
      return true;
    })
    .withMessage('Complejidad debe ser un número entre 1 y 5'),
  
  body('tarea_padre_id')
    .optional()
    .isUUID()
    .withMessage('ID de tarea padre inválido'),
  
  // Seguimiento y progreso
  body('porcentaje_completado')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Porcentaje completado debe estar entre 0 y 100'),
  
  body('tiempo_estimado_horas')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tiempo estimado debe ser un número positivo'),
  
  body('tiempo_real_horas')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tiempo real debe ser un número positivo'),
  
  body('fecha_inicio')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      if (isNaN(Date.parse(value))) {
        throw new Error('Fecha de inicio debe ser una fecha válida');
      }
      return true;
    })
    .withMessage('Fecha de inicio debe ser una fecha válida'),
  
  // Criterios y validación
  body('criterios_aceptacion')
    .optional()
    .isArray()
    .withMessage('Criterios de aceptación debe ser un array'),
  
  body('definicion_terminado')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Definición de terminado no puede exceder 1000 caracteres'),
  
  body('bloqueadores')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Bloqueadores no puede exceder 1000 caracteres'),
  
  // Información técnica
  body('branch_git')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Branch de Git no puede exceder 255 caracteres'),
  
  body('commit_relacionado')
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage('Commit relacionado no puede exceder 255 caracteres'),
  
  body('url_pull_request')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Permitir valores vacíos
      }
      // Validar URL solo si hay un valor
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('URL de pull request debe ser una URL válida');
      }
      return true;
    })
    .withMessage('URL de pull request debe ser una URL válida'),
  
  // Dependencias y relaciones
  body('dependencias')
    .optional()
    .isArray()
    .withMessage('Dependencias debe ser un array'),
  
  body('impacto_otras_tareas')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Impacto en otras tareas no puede exceder 1000 caracteres'),
  
  // Archivos y recursos
  body('archivos_adjuntos')
    .optional()
    .isArray()
    .withMessage('Archivos adjuntos debe ser un array'),
  
  body('enlaces_referencia')
    .optional()
    .isArray()
    .withMessage('Enlaces de referencia debe ser un array'),
  
  body('onedrive_folder_id')
    .optional()
    .isString()
    .withMessage('ID de carpeta OneDrive debe ser un string'),
  
  // Automatización y recurrencia
  body('es_recurrente')
    .optional()
    .isBoolean()
    .withMessage('Es recurrente debe ser un booleano'),
  
  body('notas_internas')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('Notas internas no puede exceder 2000 caracteres'),
];

export const validateUpdateTaskPosition = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea inválido'),
  
  body('position')
    .isInt({ min: 0 })
    .withMessage('La posición es requerida y debe ser un número entero positivo'),
  
  body('status')
    .optional()
    .isIn(Object.values(TaskStatus))
    .withMessage('Estado de tarea inválido'),
];

export const validateTaskId = [
  param('id')
    .isUUID()
    .withMessage('ID de tarea inválido'),
];

export const validateProjectIdParam = [
  param('projectId')
    .isUUID()
    .withMessage('ID de proyecto inválido'),
];

// ======================================
// VALIDADORES PARA BÚSQUEDA
// ======================================

export const validateSearch = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Parámetro de búsqueda requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('La búsqueda debe tener entre 2 y 100 caracteres'),
  
  query('type')
    .optional()
    .isIn(['all', 'project', 'task'])
    .withMessage('Tipo de búsqueda inválido. Debe ser: all, project, o task'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser mayor o igual a 0'),
];

export const validateSearchSuggestions = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Parámetro de búsqueda requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
];

export const validateSearchByTags = [
  query('tags')
    .trim()
    .notEmpty()
    .withMessage('Parámetro de etiquetas requerido')
    .custom((tags) => {
      const tagList = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      if (tagList.length === 0) {
        throw new Error('Se requiere al menos una etiqueta válida');
      }
      return true;
    }),
];

// ======================================
// VALIDADORES PARA FILTROS
// ======================================

export const validateProjectFilters = [
  query('status')
    .optional()
    .custom((value) => {
      if (value) {
        const statuses = value.split(',');
        for (const status of statuses) {
          if (!Object.values(ProjectStatus).includes(status.trim() as ProjectStatus)) {
            throw new Error(`Estado de proyecto inválido: ${status}`);
          }
        }
      }
      return true;
    }),
  
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser una fecha válida (ISO 8601)'),
  
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser una fecha válida (ISO 8601)'),
  
  query('sort_by')
    .optional()
    .isIn(['name', 'created_at', 'updated_at', 'status'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden de clasificación inválido. Debe ser asc o desc'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser mayor o igual a 0'),
];

export const validateTaskFilters = [
  query('project_id')
    .optional()
    .isUUID()
    .withMessage('ID de proyecto inválido'),
  
  query('status')
    .optional()
    .custom((value) => {
      if (value) {
        const statuses = value.split(',');
        for (const status of statuses) {
          if (!Object.values(TaskStatus).includes(status.trim() as TaskStatus)) {
            throw new Error(`Estado de tarea inválido: ${status}`);
          }
        }
      }
      return true;
    }),
  
  query('priority')
    .optional()
    .custom((value) => {
      if (value) {
        const priorities = value.split(',');
        for (const priority of priorities) {
          if (!Object.values(TaskPriority).includes(priority.trim() as TaskPriority)) {
            throw new Error(`Prioridad de tarea inválida: ${priority}`);
          }
        }
      }
      return true;
    }),
  
  query('due_date_from')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida (ISO 8601)'),
  
  query('due_date_to')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida (ISO 8601)'),
  
  query('sort_by')
    .optional()
    .isIn(['title', 'created_at', 'updated_at', 'due_date', 'priority', 'position'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden de clasificación inválido. Debe ser asc o desc'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser mayor o igual a 0'),
];

// ======================================
// VALIDADORES PARA DASHBOARD
// ======================================

export const validateDashboardFilters = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Los días deben estar entre 1 y 365'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
];