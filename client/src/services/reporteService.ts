// ======================================
// SERVICIO DE REPORTES SIMPLIFICADO
// ======================================

import { apiClient } from './api';

// ======================================
// TIPOS BÁSICOS
// ======================================

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
  nombre: string;
  valor: number;
  color: string;
}

interface HorasDiarias {
  fecha: string;
  valor: number;
}

interface SemanaDisponible {
  year: number;
  week: number;
  inicio: string;
  fin: string;
  start_date: string;
  end_date: string;
}

// ======================================
// FUNCIONES PRINCIPALES
// ======================================

/**
 * Obtiene estadísticas generales
 */
export const obtenerEstadisticasGenerales = async (): Promise<EstadisticasGenerales> => {
  const response = await apiClient.get<EstadisticasGenerales>('/reportes/estadisticas-generales');
  return response;
};

/**
 * Obtiene horas por proyecto
 */
export const obtenerHorasPorProyecto = async (filtros?: { fechaInicio?: string; fechaFin?: string }): Promise<HorasPorProyecto[]> => {
  const params = new URLSearchParams();
  
  if (filtros?.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fecha_fin', filtros.fechaFin);

  const response = await apiClient.get<HorasPorProyecto[]>(`/reportes/horas-por-proyecto${params.toString() ? '?' + params.toString() : ''}`);
  return response;
};

/**
 * Obtiene horas diarias
 */
export const obtenerHorasDiarias = async (filtros?: { fechaInicio?: string; fechaFin?: string }): Promise<HorasDiarias[]> => {
  const params = new URLSearchParams();
  
  if (filtros?.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fecha_fin', filtros.fechaFin);

  const response = await apiClient.get<HorasDiarias[]>(`/reportes/horas-diarias${params.toString() ? '?' + params.toString() : ''}`);
  return response;
};

/**
 * Obtiene semanas disponibles para Analytics Avanzado
 */
export const obtenerSemanasDisponibles = async (): Promise<SemanaDisponible[]> => {
  const response = await apiClient.get<SemanaDisponible[]>('/reportes/semanas-disponibles');
  return response;
};

// ======================================
// FUNCIONES UTILITARIAS
// ======================================

/**
 * Obtiene las fechas de la semana actual
 */
export const obtenerSemanaActual = () => {
  const hoy = new Date();
  const primerDiaSemana = new Date(hoy);
  primerDiaSemana.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1)); // Lunes
  
  const ultimoDiaSemana = new Date(primerDiaSemana);
  ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6); // Domingo

  return {
    inicio: primerDiaSemana.toISOString().split('T')[0],
    fin: ultimoDiaSemana.toISOString().split('T')[0]
  };
};

/**
 * Obtiene las fechas del mes actual
 */
export const obtenerMesActual = () => {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  return {
    inicio: inicio.toISOString().split('T')[0],
    fin: fin.toISOString().split('T')[0]
  };
};
