// ======================================
// CONTROLADOR DE REPORTES Y KPIs - ACLIMAR
// Sistema profesional para facturación y seguimiento de proyectos
// ======================================

import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService';

// ======================================
// INTERFACES PARA REPORTES
// ======================================

interface FiltrosReporte {
  fecha_inicio?: string;
  fecha_fin?: string;
  proyectos?: string[];
  estados?: string[];
  incluye_archivados?: boolean;
}

interface EstadisticasGenerales {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosCompletados: number;
  totalTareas: number;
  tareasCompletadas: number;
  totalHoras: number;
  horasEstaSemana: number;
  eficienciaPromedio: number;
}

interface HorasPorProyecto {
  proyecto_id: string;
  nombre_proyecto: string;
  total_horas: number;
  horas_estimadas: number;
  progreso_porcentaje: number;
  color: string;
}

interface HorasDiarias {
  fecha: string;
  total_horas: number;
  proyectos_activos: number;
}

interface TendenciaProductividad {
  periodo: string;
  horas_trabajadas: number;
  tareas_completadas: number;
  eficiencia: number;
}

// ======================================
// CONTROLADORES PRINCIPALES
// ======================================

/**
 * Obtiene estadísticas generales para el dashboard de Aclimar
 * Cálculos precisos para facturación y seguimiento de proyectos
 */
export const obtenerEstadisticasGenerales = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    
    // ======================================
    // CONSULTAS OPTIMIZADAS CON AGREGACIONES SQL
    // ======================================
    
    // 1. Estadísticas de proyectos
    const { data: statsProyectos, error: errorProyectos } = await supabase
      .rpc('get_project_stats');
    
    if (errorProyectos) {
      console.error('Error obteniendo estadísticas de proyectos:', errorProyectos);
      // Fallback a consulta manual si la función RPC no existe
      const { data: proyectos, error: fallbackError } = await supabase
        .from('projects')
        .select('status')
        .neq('status', 'archived');
      
      if (fallbackError) {
        throw new Error(`Error en consulta de proyectos: ${fallbackError.message}`);
      }
      
      const totalProyectos = proyectos?.length || 0;
      const proyectosActivos = proyectos?.filter(p => p.status === 'active').length || 0;
      const proyectosCompletados = proyectos?.filter(p => p.status === 'completed').length || 0;
      
      // Continuar con el resto de cálculos...
    }

    // 2. Estadísticas de tareas con campos expandidos
    const { data: statsTareas, error: errorTareas } = await supabase
      .from('tasks')
      .select(`
        status,
        tiempo_estimado_horas,
        tiempo_real_horas,
        porcentaje_completado
      `);

    if (errorTareas) {
      throw new Error(`Error en consulta de tareas: ${errorTareas.message}`);
    }

    // 3. Horas de esta semana desde time_logs
    const inicioSemana = obtenerInicioSemana();
    const finSemana = obtenerFinSemana();

    const { data: horasSemanales, error: errorHorasSemanales } = await supabase
      .from('time_logs')
      .select('hours')
      .gte('date', inicioSemana)
      .lte('date', finSemana);

    if (errorHorasSemanales) {
      throw new Error(`Error en consulta de horas semanales: ${errorHorasSemanales.message}`);
    }

    // 4. Total de horas desde time_logs (más preciso que desde tareas)
    const { data: totalHorasData, error: errorTotalHoras } = await supabase
      .from('time_logs')
      .select('hours');

    if (errorTotalHoras) {
      throw new Error(`Error en consulta de total horas: ${errorTotalHoras.message}`);
    }

    // ======================================
    // CÁLCULOS PRECISOS PARA FACTURACIÓN
    // ======================================

    // Estadísticas de proyectos
    const totalProyectos = statsProyectos?.[0]?.total_proyectos || 
      (await supabase.from('projects').select('id', { count: 'exact' }).neq('status', 'archived')).count || 0;
    
    const proyectosActivos = statsProyectos?.[0]?.proyectos_activos || 
      (await supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'active')).count || 0;
    
    const proyectosCompletados = statsProyectos?.[0]?.proyectos_completados || 
      (await supabase.from('projects').select('id', { count: 'exact' }).eq('status', 'completed')).count || 0;

    // Estadísticas de tareas
    const totalTareas = statsTareas?.length || 0;
    const tareasCompletadas = statsTareas?.filter(t => 
      t.status === 'done' || 
      t.status === 'COMPLETADA' || 
      t.porcentaje_completado === 100
    ).length || 0;

    // Cálculo preciso de horas totales desde time_logs
    const totalHoras = totalHorasData?.reduce((sum, log) => {
      const horas = parseFloat(log.hours) || 0;
      return sum + horas;
    }, 0) || 0;

    // Horas de esta semana
    const horasEstaSemana = horasSemanales?.reduce((sum, log) => {
      const horas = parseFloat(log.hours) || 0;
      return sum + horas;
    }, 0) || 0;

    // Cálculo de eficiencia promedio mejorado
    const tareasConTiempos = statsTareas?.filter(t => 
      t.tiempo_estimado_horas && 
      t.tiempo_real_horas && 
      parseFloat(t.tiempo_estimado_horas) > 0 && 
      parseFloat(t.tiempo_real_horas) > 0
    ) || [];

    let eficienciaPromedio = 0;
    if (tareasConTiempos.length > 0) {
      const eficiencias = tareasConTiempos.map(t => {
        const estimado = parseFloat(t.tiempo_estimado_horas!);
        const real = parseFloat(t.tiempo_real_horas!);
        // Eficiencia = min(estimado/real, 1.5) para evitar valores extremos
        return Math.min(estimado / real, 1.5);
      });
      
      eficienciaPromedio = eficiencias.reduce((sum, eff) => sum + eff, 0) / eficiencias.length;
      // Convertir a porcentaje y limitar a 100%
      eficienciaPromedio = Math.min(eficienciaPromedio * 100, 100);
    }

    // ======================================
    // RESPUESTA ESTRUCTURADA
    // ======================================

    const estadisticas: EstadisticasGenerales = {
      totalProyectos,
      proyectosActivos,
      proyectosCompletados,
      totalTareas,
      tareasCompletadas,
      totalHoras: Math.round(totalHoras * 100) / 100, // Redondear a 2 decimales
      horasEstaSemana: Math.round(horasEstaSemana * 100) / 100,
      eficienciaPromedio: Math.round(eficienciaPromedio * 100) / 100
    };

    console.log('📊 Estadísticas calculadas:', {
      ...estadisticas,
      timestamp: new Date().toISOString(),
      periodo_semana: `${inicioSemana} - ${finSemana}`
    });

    res.json(estadisticas);

  } catch (error) {
    console.error('❌ Error crítico en obtenerEstadisticasGenerales:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Error al calcular estadísticas del proyecto',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene horas trabajadas por proyecto para gráficos
 * Datos precisos para facturación
 */
export const obtenerHorasPorProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    const filtros = extraerFiltros(req.query);

    // Consulta optimizada con JOIN para obtener horas por proyecto
    let query = supabase
      .from('time_logs')
      .select(`
        hours,
        tasks!inner(
          project_id,
          projects!inner(
            id,
            name,
            color
          )
        )
      `);

    // Aplicar filtros de fecha si existen
    if (filtros.fecha_inicio) {
      query = query.gte('date', filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      query = query.lte('date', filtros.fecha_fin);
    }

    const { data: timeLogsData, error } = await query;

    if (error) {
      throw new Error(`Error en consulta de horas por proyecto: ${error.message}`);
    }

    // Agrupar horas por proyecto
    const horasPorProyecto = new Map<string, HorasPorProyecto>();

    timeLogsData?.forEach((log: any) => {
      const proyecto = log.tasks.projects;
      const proyectoId = proyecto.id;
      const horas = parseFloat(log.hours) || 0;

      if (horasPorProyecto.has(proyectoId)) {
        const existing = horasPorProyecto.get(proyectoId)!;
        existing.total_horas += horas;
      } else {
        horasPorProyecto.set(proyectoId, {
          proyecto_id: proyectoId,
          nombre_proyecto: proyecto.name,
          total_horas: horas,
          horas_estimadas: 0, // Se calculará después
          progreso_porcentaje: 0, // Se calculará después
          color: proyecto.color || '#3B82F6'
        });
      }
    });

    // Obtener horas estimadas por proyecto
    const proyectoIds = Array.from(horasPorProyecto.keys());
    if (proyectoIds.length > 0) {
      const { data: tareasData, error: tareasError } = await supabase
        .from('tasks')
        .select('project_id, tiempo_estimado_horas, porcentaje_completado')
        .in('project_id', proyectoIds);

      if (tareasError) {
        console.warn('Error obteniendo horas estimadas:', tareasError);
      } else {
        // Agrupar horas estimadas por proyecto
        const horasEstimadasPorProyecto = new Map<string, { estimadas: number; progreso: number }>();
        
        tareasData?.forEach((tarea: any) => {
          const proyectoId = tarea.project_id;
          const horasEstimadas = parseFloat(tarea.tiempo_estimado_horas) || 0;
          const progreso = parseInt(tarea.porcentaje_completado) || 0;

          if (horasEstimadasPorProyecto.has(proyectoId)) {
            const existing = horasEstimadasPorProyecto.get(proyectoId)!;
            existing.estimadas += horasEstimadas;
            existing.progreso = Math.max(existing.progreso, progreso); // Usar el progreso máximo
          } else {
            horasEstimadasPorProyecto.set(proyectoId, {
              estimadas: horasEstimadas,
              progreso: progreso
            });
          }
        });

        // Actualizar datos con horas estimadas
        horasPorProyecto.forEach((proyecto, proyectoId) => {
          const estimaciones = horasEstimadasPorProyecto.get(proyectoId);
          if (estimaciones) {
            proyecto.horas_estimadas = estimaciones.estimadas;
            proyecto.progreso_porcentaje = estimaciones.progreso;
          }
        });
      }
    }

    // Convertir a array y ordenar por horas trabajadas
    const resultado = Array.from(horasPorProyecto.values())
      .map(proyecto => ({
        ...proyecto,
        total_horas: Math.round(proyecto.total_horas * 100) / 100
      }))
      .sort((a, b) => b.total_horas - a.total_horas);

    console.log('📊 Horas por proyecto calculadas:', {
      total_proyectos: resultado.length,
      total_horas: resultado.reduce((sum, p) => sum + p.total_horas, 0),
      periodo: filtros.fecha_inicio && filtros.fecha_fin ? 
        `${filtros.fecha_inicio} - ${filtros.fecha_fin}` : 'Todos los períodos'
    });

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error en obtenerHorasPorProyecto:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({
      error: 'Error al obtener horas por proyecto',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene horas trabajadas por día para gráficos de tendencias
 * Esencial para mostrar productividad diaria al cliente
 */
export const obtenerHorasDiarias = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    const filtros = extraerFiltros(req.query);

    // Establecer período por defecto (últimos 30 días)
    const fechaFin = filtros.fecha_fin || new Date().toISOString().split('T')[0]!;
    const fechaInicio = filtros.fecha_inicio || (() => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - 30);
      return fecha.toISOString().split('T')[0]!;
    })();

    // Consulta optimizada con agregación por fecha
    const { data: horasDiarias, error } = await supabase
      .from('time_logs')
      .select('date, hours')
      .gte('date', fechaInicio)
      .lte('date', fechaFin)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Error en consulta de horas diarias: ${error.message}`);
    }

    // Agrupar por fecha y sumar horas
    const horasPorFecha = new Map<string, number>();
    const proyectosPorFecha = new Map<string, Set<string>>();

    horasDiarias?.forEach((log: any) => {
      const fecha = log.date;
      const horas = parseFloat(log.hours) || 0;

      horasPorFecha.set(fecha, (horasPorFecha.get(fecha) || 0) + horas);
    });

    // Obtener proyectos activos por fecha para contexto adicional
    const { data: tareasData, error: tareasError } = await supabase
      .from('tasks')
      .select('project_id, created_at')
      .gte('created_at', fechaInicio)
      .lte('created_at', fechaFin);

    if (!tareasError && tareasData) {
      tareasData.forEach((tarea: any) => {
        const fecha = tarea.created_at.split('T')[0];
        if (!proyectosPorFecha.has(fecha)) {
          proyectosPorFecha.set(fecha, new Set());
        }
        proyectosPorFecha.get(fecha)!.add(tarea.project_id);
      });
    }

    // Generar array completo de fechas (incluyendo días sin horas)
    const resultado: HorasDiarias[] = [];
    const fechaActual = new Date(fechaInicio);
    const fechaFinal = new Date(fechaFin);

    while (fechaActual <= fechaFinal) {
      const fechaStr = fechaActual.toISOString().split('T')[0]!;
      const horasDelDia = horasPorFecha.get(fechaStr) || 0;
      const proyectosActivos = proyectosPorFecha.get(fechaStr)?.size || 0;

      resultado.push({
        fecha: fechaStr,
        total_horas: Math.round(horasDelDia * 100) / 100,
        proyectos_activos: proyectosActivos
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log('📈 Horas diarias calculadas:', {
      periodo: `${fechaInicio} - ${fechaFin}`,
      total_dias: resultado.length,
      total_horas: resultado.reduce((sum, d) => sum + d.total_horas, 0),
      promedio_diario: resultado.length > 0 ? 
        Math.round((resultado.reduce((sum, d) => sum + d.total_horas, 0) / resultado.length) * 100) / 100 : 0
    });

    res.json(resultado);

  } catch (error) {
    console.error('❌ Error en obtenerHorasDiarias:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({
      error: 'Error al obtener horas diarias',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene reporte detallado de un proyecto específico
 * Para análisis profundo y presentación al cliente
 */
export const obtenerReporteProyecto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = supabaseService.getClient();

    // Obtener datos del proyecto
    const { data: proyecto, error: errorProyecto } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (errorProyecto || !proyecto) {
      res.status(404).json({ error: 'Proyecto no encontrado' });
      return;
    }

    // Obtener tareas del proyecto con campos expandidos
    const { data: tareas, error: errorTareas } = await supabase
      .from('tasks')
      .select(`
        *,
        tiempo_estimado_horas,
        tiempo_real_horas,
        porcentaje_completado
      `)
      .eq('project_id', id);

    if (errorTareas) {
      throw new Error(`Error obteniendo tareas: ${errorTareas.message}`);
    }

    // Calcular estadísticas del proyecto
    const totalTareas = tareas?.length || 0;
    const tareasCompletadas = tareas?.filter(t => 
      t.status === 'done' || 
      t.status === 'COMPLETADA' || 
      t.porcentaje_completado === 100
    ).length || 0;
    
    const tareasPendientes = totalTareas - tareasCompletadas;
    const horasEstimadas = tareas?.reduce((sum, t) => sum + (parseFloat(t.tiempo_estimado_horas) || 0), 0) || 0;
    const horasReales = tareas?.reduce((sum, t) => sum + (parseFloat(t.tiempo_real_horas) || 0), 0) || 0;
    const porcentajeCompletado = totalTareas > 0 ? (tareasCompletadas / totalTareas) * 100 : 0;
    const eficiencia = horasEstimadas > 0 ? (horasEstimadas / horasReales) * 100 : 0;

    // Calcular días restantes
    let diasRestantes = 0;
    if (proyecto.end_date) {
      const fechaFin = new Date(proyecto.end_date);
      const hoy = new Date();
      diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    }

    const estadisticas = {
      totalTareas,
      tareasCompletadas,
      tareasPendientes,
      horasEstimadas: Math.round(horasEstimadas * 100) / 100,
      horasReales: Math.round(horasReales * 100) / 100,
      porcentajeCompletado: Math.round(porcentajeCompletado * 100) / 100,
      diasRestantes,
      eficiencia: Math.round(eficiencia * 100) / 100
    };

    const reporte = {
      proyecto,
      estadisticas,
      tareas: tareas || [],
      generado_en: new Date().toISOString()
    };

    res.json(reporte);

  } catch (error) {
    console.error('❌ Error en obtenerReporteProyecto:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte del proyecto',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// ======================================
// FUNCIONES AUXILIARES
// ======================================

/**
 * Extrae filtros de los query parameters
 */
function extraerFiltros(query: any): FiltrosReporte {
  const filtros: FiltrosReporte = {};

  if (query.fecha_inicio) {
    filtros.fecha_inicio = query.fecha_inicio;
  }

  if (query.fecha_fin) {
    filtros.fecha_fin = query.fecha_fin;
  }

  if (query.proyectos) {
    filtros.proyectos = Array.isArray(query.proyectos) ? query.proyectos : [query.proyectos];
  }

  if (query.estados) {
    filtros.estados = Array.isArray(query.estados) ? query.estados : [query.estados];
  }

  if (query.incluye_archivados !== undefined) {
    filtros.incluye_archivados = query.incluye_archivados === 'true';
  }

  return filtros;
}

/**
 * Obtiene el inicio de la semana actual (lunes)
 */
function obtenerInicioSemana(): string {
  const hoy = new Date();
  const dia = hoy.getDay();
  const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
  const lunes = new Date(hoy.setDate(diff));
  return lunes.toISOString().split('T')[0]!;
}

/**
 * Obtiene el fin de la semana actual (domingo)
 */
function obtenerFinSemana(): string {
  const inicioSemana = new Date(obtenerInicioSemana());
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  return finSemana.toISOString().split('T')[0]!;
}
