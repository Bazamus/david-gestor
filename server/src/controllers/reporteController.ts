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
  valor: number;
}

interface TendenciaProductividad {
  periodo: string;
  horas_trabajadas: number;
  tareas_completadas: number;
  eficiencia: number;
}

interface ProjectStats {
  total_proyectos: number;
  proyectos_activos: number;
  proyectos_completados: number;
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
    // CÁLCULOS DE ESTADÍSTICAS DE PROYECTOS (CON FALLBACK)
    // ======================================
    let statsProyectos: ProjectStats | null = null;

    // Intento 1: Usar la nueva función RPC optimizada
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_global_project_stats')
      .single<ProjectStats>();

    if (rpcError) {
      console.warn(`RPC 'get_global_project_stats' falló: ${rpcError.message}. Intentando fallback manual.`);
      
      // Fallback: Consulta manual si la función RPC no existe o falla
      const { data: proyectos, error: fallbackError } = await supabase
        .from('projects')
        .select('status')
        .neq('status', 'archived');

      if (fallbackError) {
        throw new Error(`Error en la consulta de fallback de proyectos: ${fallbackError.message}`);
      }
      
      // Calcular estadísticas manualmente
      statsProyectos = {
        total_proyectos: proyectos?.length || 0,
        proyectos_activos: proyectos?.filter(p => p.status === 'active').length || 0,
        proyectos_completados: proyectos?.filter(p => p.status === 'completed').length || 0
      };

    } else {
      statsProyectos = rpcData;
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

    // Estadísticas de proyectos (ya calculadas con fallback)
    const totalProyectos = statsProyectos?.total_proyectos || 0;
    const proyectosActivos = statsProyectos?.proyectos_activos || 0;
    const proyectosCompletados = statsProyectos?.proyectos_completados || 0;

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
        nombre: proyecto.nombre_proyecto,
        valor: Math.round(proyecto.total_horas * 100) / 100,
        color: proyecto.color
      }))
      .sort((a, b) => b.valor - a.valor);

    console.log('📊 Horas por proyecto calculadas:', {
      total_proyectos: resultado.length,
      total_horas: resultado.reduce((sum, p) => sum + p.valor, 0),
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
        valor: Math.round(horasDelDia * 100) / 100
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log('📈 Horas diarias calculadas:', {
      periodo: `${fechaInicio} - ${fechaFin}`,
      total_dias: resultado.length,
      total_horas: resultado.reduce((sum, d) => sum + d.valor, 0),
      promedio_diario: resultado.length > 0 ? 
        Math.round((resultado.reduce((sum, d) => sum + d.valor, 0) / resultado.length) * 100) / 100 : 0
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

/**
 * Endpoint de prueba para verificar la conectividad
 */
export const testEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Endpoint de prueba funcionando',
      timestamp: new Date().toISOString(),
      data: {
        test: 'datos de prueba',
        numeros: [1, 2, 3, 4, 5]
      }
    });
  } catch (error) {
    console.error('❌ Error en testEndpoint:', error);
    res.status(500).json({ 
      error: 'Error en endpoint de prueba',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Endpoint de prueba para generar PDF con caracteres especiales
 */
export const testPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    // Crear datos de prueba
    const datosPrueba = {
      empresa: {
        nombre: 'Aclimar - Gestor de Proyectos',
        periodo: 'Reporte de Prueba',
        fechaGeneracion: new Date().toISOString()
      },
      kpis: {
        totalProyectos: 11,
        proyectosActivos: 6,
        proyectosCompletados: 1,
        totalTareas: 35,
        tareasCompletadas: 13,
        totalHoras: 47.5,
        horasEstaSemana: 19.5,
        eficienciaPromedio: 97.08
      },
      horasPorProyecto: [
        { nombre: 'Rediseño Portfolio', valor: 9.0, color: '#10B981' },
        { nombre: 'Proyecto Reportes', valor: 7.5, color: '#8B5CF6' },
        { nombre: 'Aprendizaje TypeScript', valor: 3.0, color: '#F59E0B' }
      ],
      filtros: {
        fechaInicio: '2025-08-04',
        fechaFin: '2025-08-10'
      }
    };
    
    res.json({
      success: true,
      message: 'Datos de prueba para PDF',
      datos: datosPrueba
    });
    
  } catch (error) {
    console.error('❌ Error en testPDF:', error);
    res.status(500).json({ 
      error: 'Error en endpoint de prueba PDF',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene datos de tareas con horas para reportes PDF
 */
export const obtenerDatosTareasPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    
    // Obtener filtros de fecha
    const { fecha_inicio, fecha_fin } = req.query;
    const inicioFecha = fecha_inicio as string || obtenerInicioSemana();
    const finFecha = fecha_fin as string || obtenerFinSemana();
    
    // Obtener tareas con información de proyecto y horas
    const { data: tareas, error: errorTareas } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        porcentaje_completado,
        tiempo_estimado_horas,
        tiempo_real_horas,
        project_id,
        projects!inner(name)
      `)
      .gte('created_at', inicioFecha)
      .lte('created_at', finFecha);
    
    if (errorTareas) {
      throw new Error(`Error obteniendo tareas: ${errorTareas.message}`);
    }
    
    // Obtener time entries para calcular horas reales trabajadas
    const { data: timeEntries, error: errorTimeEntries } = await supabase
      .from('time_logs')
      .select('*')
      .gte('date', inicioFecha)
      .lte('date', finFecha);
    
    if (errorTimeEntries) {
      throw new Error(`Error obteniendo time entries: ${errorTimeEntries.message}`);
    }
    
    // Procesar datos para el PDF
    const tareasConHoras = tareas?.map(tarea => {
      // Calcular horas reales trabajadas en esta tarea
      const horasTarea = timeEntries
        ?.filter(entry => entry.task_id === tarea.id)
        .reduce((total, entry) => total + (parseFloat(entry.hours) || 0), 0) || 0;
      
      // Calcular porcentaje completado
      const porcentajeCompletado = tarea.porcentaje_completado || 
        (tarea.status === 'done' || tarea.status === 'COMPLETADA' ? 100 : 0);
      
      return {
        id: tarea.id,
        titulo: tarea.title,
        descripcion: tarea.description,
        proyecto: (tarea.projects as any)?.name || 'Sin proyecto',
        horasEstimadas: parseFloat(tarea.tiempo_estimado_horas) || 0,
        horasReales: horasTarea,
        porcentajeCompletado: porcentajeCompletado,
        estado: tarea.status
      };
    }).filter(tarea => tarea.horasReales > 0) || [];
    
    // Ordenar por horas reales (descendente)
    tareasConHoras.sort((a, b) => b.horasReales - a.horasReales);
    
    const datos = {
      tareas: tareasConHoras,
      periodo: {
        inicio: inicioFecha,
        fin: finFecha
      },
      totalHoras: tareasConHoras.reduce((total, tarea) => total + tarea.horasReales, 0),
      totalTareas: tareasConHoras.length
    };
    
    res.json(datos);
    
  } catch (error) {
    console.error('❌ Error en obtenerDatosTareasPDF:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos de tareas para PDF',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene métricas avanzadas con filtro de semana actual
 */
export const obtenerMetricasAvanzadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    
    // Extraer parámetros de fecha de la query
    const { fecha_inicio, fecha_fin } = req.query;
    
    // Determinar fechas de inicio y fin
    let inicioSemana: string;
    let finSemana: string;
    
    if (fecha_inicio && fecha_fin) {
      // Usar fechas proporcionadas por el usuario
      inicioSemana = fecha_inicio as string;
      finSemana = fecha_fin as string;
    } else {
      // Usar semana actual por defecto
      inicioSemana = obtenerInicioSemana();
      finSemana = obtenerFinSemana();
    }
    
    console.log(`📅 Consultando métricas para semana: ${inicioSemana} - ${finSemana}`);
    
    // Obtener time entries de la semana especificada
    const { data: timeEntries, error: errorTimeEntries } = await supabase
      .from('time_logs')
      .select('*')
      .gte('date', inicioSemana)
      .lte('date', finSemana);
    
    if (errorTimeEntries) {
      throw new Error(`Error obteniendo time entries: ${errorTimeEntries.message}`);
    }
    
    // Obtener proyectos
    const { data: proyectos, error: errorProyectos } = await supabase
      .from('projects')
      .select('id, name, status');
    
    if (errorProyectos) {
      throw new Error(`Error obteniendo proyectos: ${errorProyectos.message}`);
    }
    
    // Calcular productividad por día de la semana
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const productividadPorDiaSemana = diasSemana.map(dia => ({
      diaSemana: dia,
      horasPromedio: 0,
      tareasPromedio: 0,
      eficienciaPromedio: 0
    }));
    
    // Agrupar entradas por día de la semana
    timeEntries?.forEach((entry: any) => {
      const fecha = new Date(entry.date);
      const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const indice = diaSemana === 0 ? 6 : diaSemana - 1; // Convertir a índice 0-6 (Lunes-Domingo)
      
      if (productividadPorDiaSemana[indice]) {
        productividadPorDiaSemana[indice].horasPromedio += parseFloat(entry.hours) || 0;
        productividadPorDiaSemana[indice].tareasPromedio += 1;
      }
    });
    
    // Calcular promedios y eficiencia
    productividadPorDiaSemana.forEach(dia => {
      if (dia.tareasPromedio > 0) {
        dia.horasPromedio = Math.round(dia.horasPromedio * 10) / 10; // Redondear a 1 decimal
        dia.eficienciaPromedio = Math.min(100, Math.round((dia.horasPromedio / 8) * 100)); // Eficiencia basada en 8h/día
      }
    });
    
    // Calcular distribución de horas por proyecto
    const distribucionHorasPorProyecto = proyectos?.map((proyecto: any) => {
      const horasProyecto = timeEntries
        ?.filter((entry: any) => entry.project_id === proyecto.id)
        .reduce((total: number, entry: any) => total + (parseFloat(entry.hours) || 0), 0) || 0;
      
      const totalHoras = timeEntries?.reduce((total: number, entry: any) => total + (parseFloat(entry.hours) || 0), 0) || 0;
      const porcentajeTotal = totalHoras > 0 ? Math.round((horasProyecto / totalHoras) * 100) : 0;
      
      return {
        proyecto: proyecto.name,
        horasInvertidas: Math.round(horasProyecto * 10) / 10,
        porcentajeTotal,
        eficienciaProyecto: Math.min(100, Math.round((horasProyecto / 40) * 100)), // Eficiencia basada en 40h/semana
        estadoProyecto: proyecto.status
      };
    }).filter(proyecto => proyecto.horasInvertidas > 0) || [];
    
    // Calcular totales de la semana
    const totalHorasSemana = timeEntries?.reduce((total: number, entry: any) => total + (parseFloat(entry.hours) || 0), 0) || 0;
    const totalTareasSemana = timeEntries?.length || 0;
    const eficienciaPromedioSemana = totalHorasSemana > 0 ? Math.min(100, Math.round((totalHorasSemana / (8 * 7)) * 100)) : 0; // Eficiencia basada en 8h/día * 7 días
    
    const metricas = {
      productividadPorDiaSemana,
      distribucionHorasPorProyecto,
      semanaConsultada: {
        inicio: inicioSemana,
        fin: finSemana,
        totalHoras: Math.round(totalHorasSemana * 10) / 10,
        totalTareas: totalTareasSemana,
        eficienciaPromedio: eficienciaPromedioSemana,
        esSemanaActual: !fecha_inicio && !fecha_fin // Indica si es la semana actual
      }
    };
    
    console.log(`✅ Métricas calculadas para semana ${inicioSemana} - ${finSemana}:`, {
      totalHoras: metricas.semanaConsultada.totalHoras,
      totalTareas: metricas.semanaConsultada.totalTareas,
      eficienciaPromedio: metricas.semanaConsultada.eficienciaPromedio
    });
    
    res.json(metricas);
    
  } catch (error) {
    console.error('❌ Error en obtenerMetricasAvanzadas:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas avanzadas',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Obtiene información de semanas disponibles para el selector
 */
export const obtenerSemanasDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = supabaseService.getClient();
    
    // Obtener todas las fechas únicas de time_logs
    const { data: timeEntries, error } = await supabase
      .from('time_logs')
      .select('date')
      .order('date', { ascending: false });
    
    if (error) {
      throw new Error(`Error obteniendo fechas: ${error.message}`);
    }
    
    // Obtener fechas únicas y agrupar por semana
    const fechasUnicas = [...new Set(timeEntries?.map(entry => entry.date))];
    const semanas = new Set<string>();
    
    fechasUnicas.forEach(fecha => {
      const inicioSemana = obtenerInicioSemanaPorFecha(new Date(fecha));
      semanas.add(inicioSemana);
    });
    
    // Convertir a array y ordenar
    const semanasArray = Array.from(semanas).sort().reverse();
    
    // Obtener información de la semana actual
    const semanaActual = {
      inicio: obtenerInicioSemana(),
      fin: obtenerFinSemana(),
      nombre: 'Semana Actual'
    };
    
    // Obtener información de la semana anterior
    const semanaAnterior = obtenerSemanaAnterior();
    
    // Obtener información de la semana siguiente
    const semanaSiguiente = obtenerSemanaSiguiente();
    
    // Formatear semanas disponibles
    const semanasFormateadas = semanasArray.slice(0, 12).map(inicio => {
      const fin = obtenerFinSemanaPorFecha(new Date(inicio));
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);
      
      return {
        inicio,
        fin,
        nombre: `${formatearFecha(inicio).split(',')[0]} - ${fechaFin.getDate()} ${fechaFin.toLocaleDateString('es-ES', { month: 'short' })}`,
        esActual: inicio === semanaActual.inicio,
        esAnterior: inicio === semanaAnterior.inicio,
        esSiguiente: inicio === semanaSiguiente.inicio
      };
    });
    
    const resultado = {
      semanaActual,
      semanaAnterior,
      semanaSiguiente,
      semanasDisponibles: semanasFormateadas,
      totalSemanas: semanasArray.length
    };
    
    res.json(resultado);
    
  } catch (error) {
    console.error('❌ Error en obtenerSemanasDisponibles:', error);
    res.status(500).json({ 
      error: 'Error al obtener semanas disponibles',
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

/**
 * Obtiene el inicio de una semana específica (lunes)
 */
function obtenerInicioSemanaPorFecha(fecha: Date): string {
  const dia = fecha.getDay();
  const diff = fecha.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
  const lunes = new Date(fecha.setDate(diff));
  return lunes.toISOString().split('T')[0]!;
}

/**
 * Obtiene el fin de una semana específica (domingo)
 */
function obtenerFinSemanaPorFecha(fecha: Date): string {
  const inicioSemana = new Date(obtenerInicioSemanaPorFecha(fecha));
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  return finSemana.toISOString().split('T')[0]!;
}

/**
 * Obtiene las fechas de inicio y fin de la semana anterior
 */
function obtenerSemanaAnterior(): { inicio: string; fin: string } {
  const hoy = new Date();
  const semanaAnterior = new Date(hoy);
  semanaAnterior.setDate(hoy.getDate() - 7);
  
  const inicio = obtenerInicioSemanaPorFecha(semanaAnterior);
  const fin = obtenerFinSemanaPorFecha(semanaAnterior);
  
  return { inicio, fin };
}

/**
 * Obtiene las fechas de inicio y fin de la semana siguiente
 */
function obtenerSemanaSiguiente(): { inicio: string; fin: string } {
  const hoy = new Date();
  const semanaSiguiente = new Date(hoy);
  semanaSiguiente.setDate(hoy.getDate() + 7);
  
  const inicio = obtenerInicioSemanaPorFecha(semanaSiguiente);
  const fin = obtenerFinSemanaPorFecha(semanaSiguiente);
  
  return { inicio, fin };
}

/**
 * Formatea una fecha para mostrar en formato legible
 */
function formatearFecha(fecha: string): string {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
