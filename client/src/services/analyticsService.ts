// ======================================
// SERVICIO DE ANALYTICS AVANZADO
// Comparativas, tendencias y predicciones para Aclimar
// ======================================

import { apiClient } from './api';

// ======================================
// TIPOS E INTERFACES
// ======================================

export interface ComparativaPeriodos {
  periodoActual: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    kpis: {
      proyectosActivos: number;
      tareasCompletadas: number;
      horasTrabajadas: number;
      eficiencia: number;
    };
  };
  periodoAnterior: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    kpis: {
      proyectosActivos: number;
      tareasCompletadas: number;
      horasTrabajadas: number;
      eficiencia: number;
    };
  };
  variaciones: {
    proyectosActivos: { valor: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' };
    tareasCompletadas: { valor: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' };
    horasTrabajadas: { valor: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' };
    eficiencia: { valor: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' };
  };
}

export interface TendenciaProductividad {
  periodo: string;
  datos: Array<{
    fecha: string;
    horasTrabajadasDia: number;
    tareasCompletadasDia: number;
    eficienciaDia: number;
    proyectosActivosDia: number;
  }>;
  tendencias: {
    horasTrabajadasTendencia: 'creciente' | 'decreciente' | 'estable';
    tareasCompletadasTendencia: 'creciente' | 'decreciente' | 'estable';
    eficienciaTendencia: 'creciente' | 'decreciente' | 'estable';
  };
  predicciones: {
    horasProximaSemana: number;
    tareasProximaSemana: number;
    eficienciaProximaSemana: number;
  };
}

export interface MetricasAvanzadas {
  productividadPorDiaSemana: Array<{
    diaSemana: string;
    horasPromedio: number;
    tareasPromedio: number;
    eficienciaPromedio: number;
  }>;
  distribucionHorasPorProyecto: Array<{
    proyecto: string;
    horasInvertidas: number;
    porcentajeTotal: number;
    eficienciaProyecto: number;
    estadoProyecto: string;
  }>;
  rendimientoMensual: Array<{
    mes: string;
    horasTotales: number;
    proyectosCompletados: number;
    tareasCompletadas: number;
    ingresosPotenciales: number; // Basado en horas * tarifa
  }>;
  semanaConsultada?: {
    inicio: string;
    fin: string;
    totalHoras: number;
    totalTareas: number;
    eficienciaPromedio: number;
    esSemanaActual: boolean;
  };
}

export interface AlertasInteligentes {
  alertas: Array<{
    id: string;
    tipo: 'productividad' | 'proyecto' | 'tiempo' | 'eficiencia';
    severidad: 'baja' | 'media' | 'alta' | 'critica';
    titulo: string;
    descripcion: string;
    recomendacion: string;
    fechaDeteccion: string;
    metricas: Record<string, number>;
  }>;
  resumen: {
    totalAlertas: number;
    alertasCriticas: number;
    alertasMedias: number;
    alertasBajas: number;
  };
}

// ======================================
// FUNCIONES DE CÁLCULO
// ======================================

/**
 * Calcula la tendencia basada en dos valores
 */
const calcularTendencia = (valorActual: number, valorAnterior: number): 'up' | 'down' | 'stable' => {
  const diferencia = valorActual - valorAnterior;
  const porcentaje = valorAnterior > 0 ? (diferencia / valorAnterior) * 100 : 0;
  
  if (Math.abs(porcentaje) < 5) return 'stable';
  return porcentaje > 0 ? 'up' : 'down';
};

/**
 * Calcula el porcentaje de variación entre dos valores
 */
const calcularVariacion = (valorActual: number, valorAnterior: number): number => {
  if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};

/**
 * Predice valores futuros basado en tendencia lineal simple
 */
const predecirValor = (datos: number[]): number => {
  if (datos.length < 2) return datos[0] || 0;
  
  // Regresión lineal simple
  const n = datos.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = datos;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Predicción para el siguiente período
  return slope * n + intercept;
};

// ======================================
// FUNCIONES PRINCIPALES
// ======================================

/**
 * Obtiene comparativa entre dos períodos
 */
export const obtenerComparativaPeriodos = async (
  fechaInicioActual: string,
  fechaFinActual: string,
  fechaInicioAnterior: string,
  fechaFinAnterior: string
): Promise<ComparativaPeriodos> => {
  try {
    // Obtener datos del período actual
    const [estadisticasActuales, estadisticasAnteriores] = await Promise.all([
      apiClient.get('/reportes/estadisticas-generales', {
        params: { fechaInicio: fechaInicioActual, fechaFin: fechaFinActual }
      }),
      apiClient.get('/reportes/estadisticas-generales', {
        params: { fechaInicio: fechaInicioAnterior, fechaFin: fechaFinAnterior }
      })
    ]);

    const actual = (estadisticasActuales as any).data || estadisticasActuales;
    const anterior = (estadisticasAnteriores as any).data || estadisticasAnteriores;

    // Calcular variaciones
    const variaciones = {
      proyectosActivos: {
        valor: actual.proyectosActivos - anterior.proyectosActivos,
        porcentaje: calcularVariacion(actual.proyectosActivos, anterior.proyectosActivos),
        tendencia: calcularTendencia(actual.proyectosActivos, anterior.proyectosActivos)
      },
      tareasCompletadas: {
        valor: actual.tareasCompletadas - anterior.tareasCompletadas,
        porcentaje: calcularVariacion(actual.tareasCompletadas, anterior.tareasCompletadas),
        tendencia: calcularTendencia(actual.tareasCompletadas, anterior.tareasCompletadas)
      },
      horasTrabajadas: {
        valor: actual.totalHoras - anterior.totalHoras,
        porcentaje: calcularVariacion(actual.totalHoras, anterior.totalHoras),
        tendencia: calcularTendencia(actual.totalHoras, anterior.totalHoras)
      },
      eficiencia: {
        valor: actual.eficienciaPromedio - anterior.eficienciaPromedio,
        porcentaje: calcularVariacion(actual.eficienciaPromedio, anterior.eficienciaPromedio),
        tendencia: calcularTendencia(actual.eficienciaPromedio, anterior.eficienciaPromedio)
      }
    };

    return {
      periodoActual: {
        nombre: 'Período Actual',
        fechaInicio: fechaInicioActual,
        fechaFin: fechaFinActual,
        kpis: {
          proyectosActivos: actual.proyectosActivos,
          tareasCompletadas: actual.tareasCompletadas,
          horasTrabajadas: actual.totalHoras,
          eficiencia: actual.eficienciaPromedio
        }
      },
      periodoAnterior: {
        nombre: 'Período Anterior',
        fechaInicio: fechaInicioAnterior,
        fechaFin: fechaFinAnterior,
        kpis: {
          proyectosActivos: anterior.proyectosActivos,
          tareasCompletadas: anterior.tareasCompletadas,
          horasTrabajadas: anterior.totalHoras,
          eficiencia: anterior.eficienciaPromedio
        }
      },
      variaciones
    };

  } catch (error) {
    console.error('Error obteniendo comparativa de períodos:', error);
    throw new Error('No se pudo obtener la comparativa de períodos');
  }
};

/**
 * Obtiene tendencias de productividad y predicciones
 */
export const obtenerTendenciasProductividad = async (
  fechaInicio: string,
  fechaFin: string
): Promise<TendenciaProductividad> => {
  try {
    const response = await apiClient.get('/reportes/horas-diarias', {
      params: { fechaInicio, fechaFin }
    });

    const horasDiarias = (response as any).data || response || [];
    
    // Calcular tendencias (simplificado)
    const horasValues = horasDiarias.map((d: any) => d.valor);
    const horasTendencia = horasValues.length > 1 && horasValues[horasValues.length - 1] > horasValues[0] 
      ? 'creciente' : horasValues.length > 1 && horasValues[horasValues.length - 1] < horasValues[0] 
      ? 'decreciente' : 'estable';

    return {
      periodo: `${fechaInicio} - ${fechaFin}`,
      datos: horasDiarias.map((item: any) => ({
        fecha: item.fecha,
        horasTrabajadasDia: item.valor,
        tareasCompletadasDia: Math.floor(item.valor * 1.5), // Estimación
        eficienciaDia: Math.min(100, item.valor * 12), // Estimación
        proyectosActivosDia: Math.ceil(item.valor / 8) // Estimación
      })),
      tendencias: {
        horasTrabajadasTendencia: horasTendencia,
        tareasCompletadasTendencia: horasTendencia,
        eficienciaTendencia: horasTendencia
      },
      predicciones: {
        horasProximaSemana: predecirValor(horasValues) * 7,
        tareasProximaSemana: predecirValor(horasValues) * 10,
        eficienciaProximaSemana: Math.min(100, predecirValor(horasValues) * 15)
      }
    };

  } catch (error) {
    console.error('Error obteniendo tendencias:', error);
    throw new Error('No se pudieron obtener las tendencias de productividad');
  }
};

/**
 * Función de prueba para verificar conectividad del cliente
 */
export const testClientConnectivity = async (): Promise<any> => {
  try {
    console.log('🧪 Probando conectividad del cliente...');
    const data = await apiClient.get('/reportes/test');
    console.log('✅ Test exitoso:', data);
    return data;
  } catch (error) {
    console.error('❌ Test falló:', error);
    throw error;
  }
};

/**
 * Obtiene métricas avanzadas y análisis detallado
 */
export const obtenerMetricasAvanzadas = async (fechaInicio?: string, fechaFin?: string): Promise<MetricasAvanzadas> => {
  try {
    // Construir URL con parámetros de fecha si se proporcionan
    let url = '/reportes/metricas-avanzadas';
    const params = new URLSearchParams();
    
    if (fechaInicio) {
      params.append('fecha_inicio', fechaInicio);
    }
    
    if (fechaFin) {
      params.append('fecha_fin', fechaFin);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    console.log(`🔍 Consultando métricas avanzadas: ${url}`);
    
    // Usar el nuevo endpoint del backend que ya tiene el filtro de semana actual
    const data = await apiClient.get<any>(url);
    
    console.log('🔍 Data recibido directamente:', data);
    
    if (!data) {
      console.error('❌ Data es undefined');
      throw new Error('No se recibieron datos del servidor');
    }
    
    // Verificar que los campos necesarios existan
    if (!data.productividadPorDiaSemana) {
      console.error('❌ data.productividadPorDiaSemana es undefined');
      console.log('🔍 Data recibido:', data);
      throw new Error('Formato de datos incorrecto: falta productividadPorDiaSemana');
    }
    
    // Transformar los datos al formato esperado por el frontend
    const metricas: MetricasAvanzadas = {
      productividadPorDiaSemana: data.productividadPorDiaSemana || [],
      distribucionHorasPorProyecto: data.distribucionHorasPorProyecto || [],
      rendimientoMensual: [], // Mantener cálculo mensual en frontend por ahora
      semanaConsultada: data.semanaConsultada || undefined
    };
    
    // Calcular rendimiento mensual (últimos 6 meses) - mantener en frontend
    const timeEntries = await apiClient.get<any[]>('/time-entries');
    const timeEntriesData = Array.isArray(timeEntries) ? timeEntries : [];
    
    const rendimientoMensual = [];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
    const mesActual = new Date().getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const mesIndex = (mesActual - i + 12) % 12;
      const mesNombre = meses[mesIndex];
      
      // Filtrar entradas del mes
      const entradasMes = timeEntriesData.filter((entry: any) => {
        const fecha = new Date(entry.date);
        return fecha.getMonth() === mesIndex;
      });
      
      const horasTotales = entradasMes.reduce((total: number, entry: any) => total + entry.hours, 0);
      const tareasCompletadas = entradasMes.length;
      const proyectosCompletados = Math.floor(tareasCompletadas / 10); // Estimación
      const ingresosPotenciales = horasTotales * 30; // Tarifa estimada de 30€/hora
      
      rendimientoMensual.push({
        mes: mesNombre,
        horasTotales: Math.round(horasTotales * 10) / 10,
        proyectosCompletados,
        tareasCompletadas,
        ingresosPotenciales: Math.round(ingresosPotenciales)
      });
    }
    
    metricas.rendimientoMensual = rendimientoMensual;
    
    console.log('✅ Métricas avanzadas obtenidas correctamente:', metricas);
    return metricas;

  } catch (error) {
    console.error('❌ Error obteniendo métricas avanzadas:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw new Error('No se pudieron obtener las métricas avanzadas');
  }
};

/**
 * Genera alertas inteligentes basadas en patrones de datos
 */
export const generarAlertasInteligentes = async (): Promise<AlertasInteligentes> => {
  try {
    // Obtener datos reales para análisis
    const [timeEntriesResponse, proyectosResponse, tareasResponse] = await Promise.all([
      apiClient.get<any[]>('/time-entries'),
      apiClient.get<any[]>('/projects'),
      apiClient.get<any[]>('/tasks')
    ]);

    const timeEntries = Array.isArray(timeEntriesResponse) ? timeEntriesResponse : [];
    const proyectos = Array.isArray(proyectosResponse) ? proyectosResponse : [];
    const tareas = Array.isArray(tareasResponse) ? tareasResponse : [];

    const alertas: AlertasInteligentes['alertas'] = [];

    // 1. Análisis de productividad semanal
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
    
    const entradasEstaSemana = timeEntries.filter((entry: any) => {
      const fecha = new Date(entry.date);
      return fecha >= inicioSemana && fecha <= hoy;
    });
    
    const horasEstaSemana = entradasEstaSemana.reduce((total: number, entry: any) => total + entry.hours, 0);
    const promedioSemanal = 40; // Horas esperadas por semana
    
    if (horasEstaSemana < promedioSemanal * 0.8) {
      alertas.push({
        id: '1',
        tipo: 'productividad' as const,
        severidad: 'media' as const,
        titulo: 'Productividad por debajo del promedio',
        descripcion: `Las horas trabajadas esta semana (${horasEstaSemana}h) están ${Math.round(((promedioSemanal - horasEstaSemana) / promedioSemanal) * 100)}% por debajo del promedio semanal`,
        recomendacion: 'Considera revisar la planificación de tareas y eliminar distracciones',
        fechaDeteccion: new Date().toISOString(),
        metricas: { horasEsperadas: promedioSemanal, horasReales: horasEstaSemana, diferencia: horasEstaSemana - promedioSemanal }
      });
    }

    // 2. Análisis de proyectos sin actividad reciente
    const proyectosSinActividad = proyectos.filter((proyecto: any) => {
      const ultimaEntrada = timeEntries
        .filter((entry: any) => entry.project_id === proyecto.id)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!ultimaEntrada) return false;
      
      const diasSinActividad = Math.floor((hoy.getTime() - new Date(ultimaEntrada.date).getTime()) / (1000 * 60 * 60 * 24));
      return diasSinActividad > 14 && proyecto.status === 'active'; // Más de 2 semanas sin actividad
    });

    proyectosSinActividad.forEach((proyecto: any) => {
      alertas.push({
        id: `proyecto-${proyecto.id}`,
        tipo: 'proyecto' as const,
        severidad: 'alta' as const,
        titulo: `Proyecto "${proyecto.name}" sin actividad reciente`,
        descripcion: `El proyecto lleva más de 2 semanas sin actualizaciones de tiempo`,
        recomendacion: 'Revisar el estado del proyecto y reasignar recursos si es necesario',
        fechaDeteccion: new Date().toISOString(),
        metricas: { diasSinActividad: 14, proyectoId: proyecto.id }
      });
    });

    // 3. Análisis de eficiencia mejorada
    const ultimasDosSemanas = timeEntries.filter((entry: any) => {
      const fecha = new Date(entry.date);
      const dosSemanasAtras = new Date(hoy);
      dosSemanasAtras.setDate(hoy.getDate() - 14);
      return fecha >= dosSemanasAtras;
    });
    
    const horasUltimasDosSemanas = ultimasDosSemanas.reduce((total: number, entry: any) => total + entry.hours, 0);
    const eficienciaActual = Math.min(100, (horasUltimasDosSemanas / 80) * 100); // Basado en 80h/2 semanas
    
    if (eficienciaActual > 90) {
      alertas.push({
        id: '3',
        tipo: 'eficiencia' as const,
        severidad: 'baja' as const,
        titulo: 'Alta eficiencia detectada',
        descripcion: `La eficiencia ha sido del ${Math.round(eficienciaActual)}% en las últimas dos semanas`,
        recomendacion: 'Mantener las prácticas actuales que están generando esta mejora',
        fechaDeteccion: new Date().toISOString(),
        metricas: { eficienciaActual: Math.round(eficienciaActual) }
      });
    }

    // 4. Análisis de tareas pendientes
    const tareasPendientes = tareas.filter((tarea: any) => tarea.status === 'todo' || tarea.status === 'in_progress');
    const tareasVencidas = tareasPendientes.filter((tarea: any) => {
      if (!tarea.due_date) return false;
      return new Date(tarea.due_date) < hoy;
    });

    if (tareasVencidas.length > 0) {
      alertas.push({
        id: '4',
        tipo: 'tiempo' as const,
        severidad: 'alta' as const,
        titulo: 'Tareas vencidas detectadas',
        descripcion: `Hay ${tareasVencidas.length} tareas que han superado su fecha límite`,
        recomendacion: 'Revisar y priorizar las tareas vencidas inmediatamente',
        fechaDeteccion: new Date().toISOString(),
        metricas: { tareasVencidas: tareasVencidas.length, tareasPendientes: tareasPendientes.length }
      });
    }

    const resumen = {
      totalAlertas: alertas.length,
      alertasCriticas: alertas.filter(a => a.severidad === 'alta').length,
      alertasMedias: alertas.filter(a => a.severidad === 'media').length,
      alertasBajas: alertas.filter(a => a.severidad === 'baja').length
    };

    return { alertas, resumen };

  } catch (error) {
    console.error('Error generando alertas inteligentes:', error);
    throw new Error('No se pudieron generar las alertas inteligentes');
  }
};

/**
 * Obtiene información de semanas disponibles para el selector
 */
export const obtenerSemanasDisponibles = async (): Promise<{
  semanaActual: { inicio: string; fin: string; nombre: string };
  semanaAnterior: { inicio: string; fin: string };
  semanaSiguiente: { inicio: string; fin: string };
  semanasDisponibles: Array<{
    inicio: string;
    fin: string;
    nombre: string;
    esActual: boolean;
    esAnterior: boolean;
    esSiguiente: boolean;
  }>;
  totalSemanas: number;
}> => {
  try {
    const data = await apiClient.get<any>('/reportes/semanas-disponibles');
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo semanas disponibles:', error);
    throw new Error('No se pudieron obtener las semanas disponibles');
  }
};

// ======================================
// FUNCIONES DE UTILIDAD PARA EXPORTAR
// ======================================

/**
 * Formatea un número como porcentaje
 */
export const formatearPorcentaje = (valor: number): string => {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
};

/**
 * Obtiene el color de tendencia para UI
 */
export const obtenerColorTendencia = (tendencia: 'up' | 'down' | 'stable'): string => {
  switch (tendencia) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
    default: return 'text-gray-600';
  }
};

/**
 * Obtiene el ícono de tendencia para UI
 */
export const obtenerIconoTendencia = (tendencia: 'up' | 'down' | 'stable'): string => {
  switch (tendencia) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    case 'stable': return '➡️';
    default: return '➡️';
  }
};
