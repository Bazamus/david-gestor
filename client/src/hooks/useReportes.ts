// ======================================
// HOOKS PARA REPORTES SIMPLIFICADOS
// ======================================

import { useQuery } from '@tanstack/react-query';
import { 
  obtenerEstadisticasGenerales, 
  obtenerHorasPorProyecto, 
  obtenerHorasDiarias 
} from '@/services/reporteService';
import { getProjectList } from '@/services/projectService';
import React from 'react';
import {
  obtenerSemanaActual,
  obtenerMesActual
} from '@/services/reporteService';

// ======================================
// HOOKS PRINCIPALES
// ======================================

/**
 * Hook para obtener estadísticas generales
 */
export const useEstadisticasGenerales = () => {
  return useQuery({
    queryKey: ['estadisticas-generales'],
    queryFn: obtenerEstadisticasGenerales,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};

/**
 * Hook para obtener horas por proyecto
 */
export const useHorasPorProyecto = (filtros?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['horas-por-proyecto', filtros],
    queryFn: () => obtenerHorasPorProyecto(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: !!filtros
  });
};

/**
 * Hook para obtener horas diarias
 */
export const useHorasDiarias = (filtros?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['horas-diarias', filtros],
    queryFn: () => obtenerHorasDiarias(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    enabled: !!filtros
  });
};

/**
 * Hook para obtener la lista de proyectos para filtros
 */
export const useProjectList = () => {
  return useQuery({
    queryKey: ['project-list'],
    queryFn: getProjectList,
    staleTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener productividad por día de la semana
 */
export const useProductividadPorDia = () => {
  return useQuery({
    queryKey: ['productividad-por-dia'],
    queryFn: async () => {
      // Obtener datos de la página de Tiempos
      const response = await fetch('/api/time-entries');
      const timeEntries = await response.json();
      
      // Agrupar por día de la semana
      const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
      const productividadPorDia = diasSemana.map(dia => ({
        diaSemana: dia,
        horasPromedio: 0,
        tareasPromedio: 0,
        eficienciaPromedio: 0
      }));
      
      // Calcular promedios por día
      timeEntries.forEach((entry: any) => {
        const fecha = new Date(entry.date);
        const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        const indice = diaSemana === 0 ? 6 : diaSemana - 1; // Convertir a índice 0-6 (Lunes-Domingo)
        
        if (productividadPorDia[indice]) {
          productividadPorDia[indice].horasPromedio += entry.hours;
          productividadPorDia[indice].tareasPromedio += 1;
        }
      });
      
      // Calcular promedios
      productividadPorDia.forEach(dia => {
        if (dia.tareasPromedio > 0) {
          dia.horasPromedio = dia.horasPromedio / 4; // Promedio de 4 semanas
          dia.eficienciaPromedio = Math.min(100, (dia.horasPromedio / 8) * 100); // Eficiencia basada en 8h/día
        }
      });
      
      return productividadPorDia;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false
  });
};

// ======================================
// TIPOS PARA FILTROS AVANZADOS
// ======================================

export interface FiltrosAvanzados {
  // Filtros de fecha
  fechaInicio?: string;
  fechaFin?: string;
  periodoPreset?: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado';
  
  // Filtros de proyecto
  proyectosSeleccionados?: string[];
  estadosProyecto?: ('active' | 'completed' | 'on-hold' | 'cancelled')[];
  prioridadesProyecto?: ('low' | 'medium' | 'high' | 'urgent')[];
  
  // Filtros de tareas
  estadosTarea?: ('pending' | 'in-progress' | 'completed' | 'cancelled')[];
  prioridadesTarea?: ('low' | 'medium' | 'high' | 'urgent')[];
  etiquetas?: string[];
  
  // Filtros de horas
  horasMinimas?: number;
  horasMaximas?: number;
  soloConHoras?: boolean;
  
  // Filtros de usuario (para futuro)
  usuariosAsignados?: string[];
}

// ======================================
// HOOKS COMPUESTOS
// ======================================

/**
 * Hook para obtener dashboard de reportes
 */
export const useDashboardReportes = () => {
  const estadisticasGenerales = useEstadisticasGenerales();
  
  return {
    dashboardKPIs: estadisticasGenerales.data,
    estadisticasGenerales: estadisticasGenerales.data,
    isLoading: estadisticasGenerales.isLoading,
    isError: estadisticasGenerales.isError,
    error: estadisticasGenerales.error,
    refrescarDatos: estadisticasGenerales.refetch
  };
};

/**
 * Hook para filtros de reportes básicos
 */
export const useFiltrosReporte = () => {
  const [filtros, setFiltros] = React.useState({
    fechaInicio: obtenerSemanaActual().inicio,
    fechaFin: obtenerSemanaActual().fin
  });

  const aplicarPeriodo = (fechaInicio: string, fechaFin: string) => {
    setFiltros({ fechaInicio, fechaFin });
  };

  const aplicarSemanaActual = () => {
    const semana = obtenerSemanaActual();
    setFiltros({ fechaInicio: semana.inicio, fechaFin: semana.fin });
  };

  const aplicarMesActual = () => {
    const mes = obtenerMesActual();
    setFiltros({ fechaInicio: mes.inicio, fechaFin: mes.fin });
  };

  return {
    filtros,
    aplicarPeriodo,
    aplicarSemanaActual,
    aplicarMesActual
  };
};

/**
 * Hook para filtros avanzados de reportes
 */
export const useFiltrosAvanzados = () => {
  const [filtros, setFiltros] = React.useState<FiltrosAvanzados>({
    fechaInicio: obtenerSemanaActual().inicio,
    fechaFin: obtenerSemanaActual().fin,
    periodoPreset: 'semana'
  });

  const aplicarFiltros = (nuevosFiltros: FiltrosAvanzados) => {
    setFiltros(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const semana = obtenerSemanaActual();
    setFiltros({
      fechaInicio: semana.inicio,
      fechaFin: semana.fin,
      periodoPreset: 'semana'
    });
  };

  const aplicarPeriodoPreset = (preset: FiltrosAvanzados['periodoPreset']) => {
    const hoy = new Date();
    let fechaInicio: string;
    let fechaFin: string;

    switch (preset) {
      case 'hoy':
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const semana = obtenerSemanaActual();
        fechaInicio = semana.inicio;
        fechaFin = semana.fin;
        break;
      case 'mes':
        const mes = obtenerMesActual();
        fechaInicio = mes.inicio;
        fechaFin = mes.fin;
        break;
      case 'trimestre':
        const trimestre = Math.floor(hoy.getMonth() / 3);
        fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFiltros(prev => ({
      ...prev,
      periodoPreset: preset,
      fechaInicio,
      fechaFin
    }));
  };

  // Convertir filtros avanzados a formato de API
  const obtenerFiltrosParaAPI = () => {
    const filtrosAPI: any = {};
    
    if (filtros.fechaInicio) filtrosAPI.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) filtrosAPI.fechaFin = filtros.fechaFin;
    if (filtros.proyectosSeleccionados?.length) filtrosAPI.proyectos = filtros.proyectosSeleccionados.join(',');
    if (filtros.estadosProyecto?.length) filtrosAPI.estadosProyecto = filtros.estadosProyecto.join(',');
    if (filtros.estadosTarea?.length) filtrosAPI.estadosTarea = filtros.estadosTarea.join(',');
    if (filtros.etiquetas?.length) filtrosAPI.etiquetas = filtros.etiquetas.join(',');
    if (filtros.horasMinimas) filtrosAPI.horasMinimas = filtros.horasMinimas;
    if (filtros.horasMaximas) filtrosAPI.horasMaximas = filtros.horasMaximas;
    if (filtros.soloConHoras) filtrosAPI.soloConHoras = 'true';
    
    return filtrosAPI;
  };

  return {
    filtros,
    aplicarFiltros,
    limpiarFiltros,
    aplicarPeriodoPreset,
    obtenerFiltrosParaAPI,
    // Mantener compatibilidad con hooks anteriores
    aplicarSemanaActual: () => aplicarPeriodoPreset('semana'),
    aplicarMesActual: () => aplicarPeriodoPreset('mes')
  };
};
