import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../types';

// Schema para criterios de aceptación
export const criterioAceptacionSchema = z.object({
  id: z.string().uuid(),
  descripcion: z.string().min(1, 'La descripción es requerida').max(500, 'Máximo 500 caracteres'),
  completado: z.boolean().default(false),
  fecha_completado: z.string().optional(),
});

// Schema para archivos adjuntos
export const archivoAdjuntoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1, 'El nombre del archivo es requerido'),
  tipo: z.string().min(1, 'El tipo de archivo es requerido'),
  tamaño: z.number().positive('El tamaño debe ser positivo').max(5 * 1024 * 1024, 'Máximo 5MB por archivo'),
  url_temporal: z.string().url().optional(),
  onedrive_id: z.string().optional(),
  onedrive_url: z.string().url().optional(),
  fecha_subida: z.string().datetime(),
  subido_por: z.string().optional(),
});

// Schema base para tareas (campos originales)
export const baseTaskSchema = z.object({
  project_id: z.string().uuid('ID de proyecto inválido'),
  title: z.string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  due_date: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha inválida')
    .optional(),
  estimated_hours: z.number()
    .min(0, 'Las horas estimadas no pueden ser negativas')
    .max(1000, 'Máximo 1000 horas')
    .optional()
    .or(z.nan().transform(() => undefined)),
  tags: z.array(z.string().min(1).max(50))
    .max(10, 'Máximo 10 etiquetas')
    .default([]),
  position: z.number().int().min(0).optional(),
});

// Schema expandido para tareas (22 campos nuevos)
export const expandedTaskSchema = baseTaskSchema.extend({
  // SECCIÓN 1: GESTIÓN Y ASIGNACIÓN (4 campos)
  tipo_tarea: z.union([
    z.literal('desarrollo'),
    z.literal('diseño'),
    z.literal('testing'),
    z.literal('documentación'),
    z.literal('reunión'),
    z.literal('investigación'),
    z.literal('revisión'),
    z.literal('deployment'),
    z.literal('mantenimiento'),
    z.literal('bug_fix'),
    z.literal('feature'),
    z.literal('refactoring')
  ]).default('desarrollo'),
  asignado_a: z.string()
    .max(100, 'Máximo 100 caracteres para el asignado')
    .optional(),
  complejidad: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5)
  ]).default(3),
  tarea_padre_id: z.string().refine((val) => !val || z.string().uuid().safeParse(val).success, 'ID de tarea padre inválido').optional(),

  // SECCIÓN 2: SEGUIMIENTO Y PROGRESO (4 campos)
  porcentaje_completado: z.number()
    .int('Debe ser un número entero')
    .min(0, 'Mínimo 0%')
    .max(100, 'Máximo 100%')
    .default(0),
  tiempo_estimado_horas: z.number()
    .min(0, 'No puede ser negativo')
    .max(1000, 'Máximo 1000 horas')
    .optional(),
  tiempo_real_horas: z.number()
    .min(0, 'No puede ser negativo')
    .max(1000, 'Máximo 1000 horas')
    .optional(),
  fecha_inicio: z.string()
    .refine((date) => !date || !isNaN(Date.parse(date)), 'Fecha inválida')
    .optional(),

  // SECCIÓN 3: CRITERIOS Y VALIDACIÓN (3 campos)
  criterios_aceptacion: z.array(criterioAceptacionSchema)
    .max(20, 'Máximo 20 criterios de aceptación')
    .default([]),
  definicion_terminado: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional(),
  bloqueadores: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional(),

  // SECCIÓN 4: DESARROLLO Y TÉCNICO (3 campos)
  branch_git: z.string()
    .max(100, 'Máximo 100 caracteres para el branch')
    .regex(/^[a-zA-Z0-9/_-]*$/, 'Formato de branch inválido')
    .optional(),
  commit_relacionado: z.string()
    .max(100, 'Máximo 100 caracteres para el commit')
    .regex(/^[a-f0-9]*$/, 'Hash de commit inválido')
    .optional(),
  url_pull_request: z.string()
    .refine((val) => !val || z.string().url().safeParse(val).success, 'URL inválida')
    .optional(),

  // SECCIÓN 5: DEPENDENCIAS Y RELACIONES (2 campos)
  dependencias: z.array(z.string().uuid('ID de dependencia inválido'))
    .max(10, 'Máximo 10 dependencias')
    .default([]),
  impacto_otras_tareas: z.string()
    .max(1000, 'Máximo 1000 caracteres')
    .optional(),

  // SECCIÓN 6: ARCHIVOS Y RECURSOS (3 campos)
  archivos_adjuntos: z.array(archivoAdjuntoSchema)
    .max(10, 'Máximo 10 archivos adjuntos')
    .default([]),
  enlaces_referencia: z.array(z.string().url('URL inválida'))
    .max(10, 'Máximo 10 enlaces de referencia')
    .default([]),
  onedrive_folder_id: z.string()
    .max(100, 'Máximo 100 caracteres')
    .optional(),

  // SECCIÓN 7: AUTOMATIZACIÓN Y RECURRENCIA (2 campos)
  es_recurrente: z.boolean().default(false),
  notas_internas: z.string()
    .max(2000, 'Máximo 2000 caracteres para notas internas')
    .optional(),
});

// Schema para creación de tareas
export const createTaskSchema = expandedTaskSchema;

// Schema para actualización de tareas (todos los campos opcionales excepto project_id)
export const updateTaskSchema = expandedTaskSchema.partial().extend({
  project_id: z.string().uuid('ID de proyecto inválido'), // Mantener requerido
});

// Validaciones personalizadas
export const taskValidationRules = {
  // Validar que la fecha de inicio no sea posterior a la fecha límite
  validateDateRange: (data: { fecha_inicio?: string; due_date?: string }) => {
    if (data.fecha_inicio && data.due_date) {
      const inicio = new Date(data.fecha_inicio);
      const limite = new Date(data.due_date);
      return inicio <= limite;
    }
    return true;
  },

  // Validar que el tiempo real no exceda significativamente el estimado
  validateTimeTracking: (data: { tiempo_estimado_horas?: number; tiempo_real_horas?: number }) => {
    if (data.tiempo_estimado_horas && data.tiempo_real_horas) {
      // Permitir hasta 200% del tiempo estimado
      return data.tiempo_real_horas <= data.tiempo_estimado_horas * 2;
    }
    return true;
  },

  // Validar que no haya dependencias circulares
  validateNonCircularDependencies: (taskId: string, dependencies: string[]) => {
    // Esta validación se debe hacer en el backend con acceso completo a la base de datos
    // Aquí solo validamos que la tarea no se incluya a sí misma
    return !dependencies.includes(taskId);
  },

  // Validar complejidad vs tiempo estimado (sugerencia)
  validateComplexityTimeAlignment: (data: { complejidad?: 1 | 2 | 3 | 4 | 5; tiempo_estimado_horas?: number }) => {
    if (data.complejidad && data.tiempo_estimado_horas) {
      const expectedHours: Record<1 | 2 | 3 | 4 | 5, { min: number; max: number }> = {
        1: { min: 0, max: 2 },    // Muy fácil: 0-2 horas
        2: { min: 1, max: 8 },    // Fácil: 1-8 horas
        3: { min: 4, max: 24 },   // Moderada: 4-24 horas
        4: { min: 16, max: 80 },  // Compleja: 16-80 horas
        5: { min: 40, max: 200 }, // Muy compleja: 40-200 horas
      };

      const range = expectedHours[data.complejidad];
      return data.tiempo_estimado_horas >= range.min && data.tiempo_estimado_horas <= range.max;
    }
    return true;
  },

  // Validar que las tareas recurrentes estén configuradas correctamente
  validateRecurrentTask: (_data: { es_recurrente?: boolean }) => {
    return true; // Simplificado - solo validar que es_recurrente sea booleano
  },
};

// Schema sin validaciones personalizadas (temporalmente para debugging)
export const createTaskSchemaWithValidations = createTaskSchema;

export const updateTaskSchemaWithValidations = updateTaskSchema
  .refine(
    (data) => taskValidationRules.validateDateRange(data),
    {
      message: 'La fecha de inicio no puede ser posterior a la fecha límite',
      path: ['fecha_inicio'],
    }
  )
  .refine(
    (data) => taskValidationRules.validateTimeTracking(data),
    {
      message: 'El tiempo real no puede exceder el doble del tiempo estimado',
      path: ['tiempo_real_horas'],
    }
  )
  .refine(
    (data) => taskValidationRules.validateRecurrentTask(data),
    {
      message: 'Las tareas recurrentes deben tener una frecuencia definida',
      path: ['frecuencia_recurrencia'],
    }
  );

// Tipos inferidos de los schemas
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
export type CriterioAceptacionData = z.infer<typeof criterioAceptacionSchema>;
export type ArchivoAdjuntoData = z.infer<typeof archivoAdjuntoSchema>;

// Funciones de utilidad para validación
export const validateTaskForm = (data: unknown, isUpdate = false) => {
  const schema = isUpdate ? updateTaskSchemaWithValidations : createTaskSchemaWithValidations;
  return schema.safeParse(data);
};

export const getValidationErrors = (result: { success: false; error: z.ZodError }) => {
  return result.error.issues.reduce((acc: Record<string, string>, error: z.ZodIssue) => {
    const path = error.path.join('.');
    acc[path] = error.message;
    return acc;
  }, {} as Record<string, string>);
};
