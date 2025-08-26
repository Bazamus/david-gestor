import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { supabaseService } from '../services/supabaseService';
import { createError, asyncHandler } from '../middleware/errorHandler';
import { 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectFilters,
  ApiResponse,
  ProjectWithStats,
  ProjectStatus
} from '../types';

// ======================================
// OBTENER TODOS LOS PROYECTOS
// ======================================
export const getProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const filters: ProjectFilters = {
    status: req.query.status ? (req.query.status as string).split(',') as any : undefined,
    search: req.query.search as string,
    start_date: req.query.start_date as string,
    end_date: req.query.end_date as string,
    sort_by: req.query.sort_by as any || 'created_at',
    sort_order: req.query.sort_order as any || 'desc',
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
  };

  try {
    const projects = await supabaseService.getProjects(filters);
    
    const response: ApiResponse<ProjectWithStats[]> = {
      success: true,
      data: projects,
      message: `${projects.length} proyectos encontrados`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener proyectos: ${error}`, 500));
  }
});

// ======================================
// OBTENER PROYECTO POR ID
// ======================================
export const getProjectById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  try {
    const project = await supabaseService.getProjectById(id);

    if (!project) {
      return next(createError('Proyecto no encontrado', 404));
    }

    const response: ApiResponse<ProjectWithStats> = {
      success: true,
      data: project,
      message: 'Proyecto encontrado exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener proyecto: ${error}`, 500));
  }
});

// ======================================
// CREAR NUEVO PROYECTO
// ======================================
export const createProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError('Datos de entrada inválidos', 400));
  }

  const projectData: CreateProjectRequest = req.body;

  // Validaciones adicionales
  if (!projectData.name || projectData.name.trim().length === 0) {
    return next(createError('El nombre del proyecto es requerido', 400));
  }

  // Validar fechas si se proporcionan
  if (projectData.start_date && projectData.end_date) {
    const startDate = new Date(projectData.start_date);
    const endDate = new Date(projectData.end_date);
    
    if (endDate < startDate) {
      return next(createError('La fecha de fin no puede ser anterior a la fecha de inicio', 400));
    }
  }

  // Validar color hex si se proporciona
  if (projectData.color && !/^#[0-9A-Fa-f]{6}$/.test(projectData.color)) {
    return next(createError('El color debe ser un código hex válido (ej: #3B82F6)', 400));
  }

  try {
    // Establecer valores por defecto y limpiar datos
    const newProjectData: any = {
      name: projectData.name.trim(),
      description: projectData.description?.trim() || undefined,
      color: projectData.color || '#3B82F6',
      status: projectData.status || ProjectStatus.PLANNING,
      start_date: projectData.start_date || undefined,
      end_date: projectData.end_date || undefined,
      
      // Información del Cliente
      cliente_empresa: projectData.cliente_empresa?.trim() || undefined,
      contacto_principal: projectData.contacto_principal?.trim() || undefined,
      email_contacto: projectData.email_contacto?.trim() || undefined,
      telefono_contacto: projectData.telefono_contacto?.trim() || undefined,
      tipo_proyecto: projectData.tipo_proyecto?.trim() || undefined,
      prioridad: projectData.prioridad || 'Media',
      
      // Aspectos Técnicos
      stack_tecnologico: projectData.stack_tecnologico || [],
      repositorio_url: projectData.repositorio_url?.trim() || undefined,
      url_staging: projectData.url_staging?.trim() || undefined,
      url_produccion: projectData.url_produccion?.trim() || undefined,
      
      // Gestión y Presupuesto
      presupuesto_estimado: projectData.presupuesto_estimado || undefined,
      moneda: projectData.moneda || 'EUR',
      horas_estimadas: projectData.horas_estimadas || undefined,
      metodo_facturacion: projectData.metodo_facturacion || undefined,
      estado_pago: projectData.estado_pago || 'Pendiente',
      
      // Organización
      etiquetas: projectData.etiquetas || [],
      carpeta_archivos: projectData.carpeta_archivos?.trim() || undefined,
      onedrive_folder_id: projectData.onedrive_folder_id?.trim() || undefined,
      imagen_proyecto: projectData.imagen_proyecto || undefined,
      notas_adicionales: projectData.notas_adicionales?.trim() || undefined,
      
      // Seguimiento
      proxima_tarea: projectData.proxima_tarea?.trim() || undefined,
    };

    const project = await supabaseService.createProject(newProjectData);

    const response: ApiResponse = {
      success: true,
      data: project,
      message: 'Proyecto creado exitosamente',
    };

    res.status(201).json(response);
  } catch (error) {
    next(createError(`Error al crear proyecto: ${error}`, 500));
  }
});

// ======================================
// ACTUALIZAR PROYECTO
// ======================================
export const updateProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError('Datos de entrada inválidos', 400));
  }

  const updateData: UpdateProjectRequest = req.body;

  // Validaciones adicionales
  if (updateData.name && updateData.name.trim().length === 0) {
    return next(createError('El nombre del proyecto no puede estar vacío', 400));
  }

  // Validar fechas si se proporcionan
  if (updateData.start_date && updateData.end_date) {
    const startDate = new Date(updateData.start_date);
    const endDate = new Date(updateData.end_date);
    
    if (endDate < startDate) {
      return next(createError('La fecha de fin no puede ser anterior a la fecha de inicio', 400));
    }
  }

  // Validar color hex si se proporciona
  if (updateData.color && !/^#[0-9A-Fa-f]{6}$/.test(updateData.color)) {
    return next(createError('El color debe ser un código hex válido (ej: #3B82F6)', 400));
  }

  try {
    // Verificar que el proyecto existe
    const existingProject = await supabaseService.getProjectById(id);
    if (!existingProject) {
      return next(createError('Proyecto no encontrado', 404));
    }

    // Limpiar datos de entrada
    const cleanUpdateData: any = {};
    
    // Campos básicos
    if (updateData.name) cleanUpdateData.name = updateData.name.trim();
    if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim() || null;
    if (updateData.color) cleanUpdateData.color = updateData.color;
    if (updateData.status) cleanUpdateData.status = updateData.status;
    if (updateData.start_date !== undefined) cleanUpdateData.start_date = updateData.start_date;
    if (updateData.end_date !== undefined) cleanUpdateData.end_date = updateData.end_date;
    
    // Información del Cliente
    if (updateData.cliente_empresa !== undefined) cleanUpdateData.cliente_empresa = updateData.cliente_empresa?.trim() || null;
    if (updateData.contacto_principal !== undefined) cleanUpdateData.contacto_principal = updateData.contacto_principal?.trim() || null;
    if (updateData.email_contacto !== undefined) cleanUpdateData.email_contacto = updateData.email_contacto?.trim() || null;
    if (updateData.telefono_contacto !== undefined) cleanUpdateData.telefono_contacto = updateData.telefono_contacto?.trim() || null;
    if (updateData.tipo_proyecto !== undefined) cleanUpdateData.tipo_proyecto = updateData.tipo_proyecto?.trim() || null;
    if (updateData.prioridad !== undefined) cleanUpdateData.prioridad = updateData.prioridad;
    
    // Aspectos Técnicos
    if (updateData.stack_tecnologico !== undefined) cleanUpdateData.stack_tecnologico = updateData.stack_tecnologico;
    if (updateData.repositorio_url !== undefined) cleanUpdateData.repositorio_url = updateData.repositorio_url?.trim() || null;
    if (updateData.url_staging !== undefined) cleanUpdateData.url_staging = updateData.url_staging?.trim() || null;
    if (updateData.url_produccion !== undefined) cleanUpdateData.url_produccion = updateData.url_produccion?.trim() || null;
    
    // Gestión y Presupuesto
    if (updateData.presupuesto_estimado !== undefined) cleanUpdateData.presupuesto_estimado = updateData.presupuesto_estimado;
    if (updateData.moneda !== undefined) cleanUpdateData.moneda = updateData.moneda;
    if (updateData.horas_estimadas !== undefined) cleanUpdateData.horas_estimadas = updateData.horas_estimadas;
    if (updateData.metodo_facturacion !== undefined) cleanUpdateData.metodo_facturacion = updateData.metodo_facturacion;
    if (updateData.estado_pago !== undefined) cleanUpdateData.estado_pago = updateData.estado_pago;
    
    // Organización
    if (updateData.etiquetas !== undefined) cleanUpdateData.etiquetas = updateData.etiquetas;
    if (updateData.carpeta_archivos !== undefined) cleanUpdateData.carpeta_archivos = updateData.carpeta_archivos?.trim() || null;
    if (updateData.onedrive_folder_id !== undefined) cleanUpdateData.onedrive_folder_id = updateData.onedrive_folder_id?.trim() || null;
    if (updateData.imagen_proyecto !== undefined) cleanUpdateData.imagen_proyecto = updateData.imagen_proyecto;
    if (updateData.notas_adicionales !== undefined) cleanUpdateData.notas_adicionales = updateData.notas_adicionales?.trim() || null;
    
    // Seguimiento
    if (updateData.proxima_tarea !== undefined) cleanUpdateData.proxima_tarea = updateData.proxima_tarea?.trim() || null;

    const updatedProject = await supabaseService.updateProject(id, cleanUpdateData);

    const response: ApiResponse = {
      success: true,
      data: updatedProject,
      message: 'Proyecto actualizado exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al actualizar proyecto: ${error}`, 500));
  }
});

// ======================================
// ELIMINAR PROYECTO
// ======================================
export const deleteProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  try {
    // Verificar que el proyecto existe
    const existingProject = await supabaseService.getProjectById(id);
    if (!existingProject) {
      return next(createError('Proyecto no encontrado', 404));
    }

    // Verificar si el proyecto tiene tareas
    const tasks = await supabaseService.getTasks({ project_id: id, limit: 1 });
    if (tasks.length > 0) {
      return next(createError(
        'No se puede eliminar un proyecto que tiene tareas asociadas. Elimina primero todas las tareas o archiva el proyecto.',
        409
      ));
    }

    await supabaseService.deleteProject(id);

    const response: ApiResponse = {
      success: true,
      message: 'Proyecto eliminado exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al eliminar proyecto: ${error}`, 500));
  }
});

// ======================================
// OBTENER ESTADÍSTICAS DEL PROYECTO
// ======================================
export const getProjectStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  try {
    const project = await supabaseService.getProjectById(id);

    if (!project) {
      return next(createError('Proyecto no encontrado', 404));
    }

    const stats = {
      total_tasks: project.total_tasks,
      completed_tasks: project.completed_tasks,
      pending_tasks: project.pending_tasks,
      total_estimated_hours: project.total_estimated_hours,
      total_actual_hours: project.total_actual_hours,
      completion_percentage: project.completion_percentage,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
      message: 'Estadísticas del proyecto obtenidas exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener estadísticas del proyecto: ${error}`, 500));
  }
});

// ======================================
// OBTENER LISTA DE PROYECTOS (para selectores)
// ======================================
export const getProjectList = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Llama a un nuevo método en el servicio que obtiene solo id y nombre
    const projectList = await supabaseService.getProjectList();
    
    const response: ApiResponse<{ id: string; name: string }[]> = {
      success: true,
      data: projectList,
      message: `${projectList.length} proyectos encontrados para filtros.`,
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al obtener la lista de proyectos: ${error}`, 500));
  }
});

// ======================================
// ARCHIVAR PROYECTO
// ======================================
export const archiveProject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(createError('ID del proyecto es requerido', 400));
  }

  try {
    // Verificar que el proyecto existe
    const existingProject = await supabaseService.getProjectById(id);
    if (!existingProject) {
      return next(createError('Proyecto no encontrado', 404));
    }

    // Actualizar estado a archivado
    const archivedProject = await supabaseService.updateProject(id, { status: ProjectStatus.ARCHIVED });

    const response: ApiResponse = {
      success: true,
      data: archivedProject,
      message: 'Proyecto archivado exitosamente',
    };

    res.status(200).json(response);
  } catch (error) {
    next(createError(`Error al archivar proyecto: ${error}`, 500));
  }
});