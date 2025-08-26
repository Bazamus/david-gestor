// ======================================
// TIPOS PARA SISTEMA DE REPORTES
// ======================================

import { Project, Task, ProjectStatus, TaskStatus } from './index';

// ======================================
// INTERFACES PARA REPORTES Y KPIs
// ======================================

export interface ReporteKPI {
  id: string;
  titulo: string;
  valor: number | string;
  valorAnterior?: number | string;
  unidad: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentajeCambio?: number;
  icono: string;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray';
  descripcion?: string;
}

export interface DashboardKPIs {
  // KPIs de Productividad General
  productividad: {
    proyectosActivos: ReporteKPI;
    proyectosCompletados: ReporteKPI;
    tareasCompletas: ReporteKPI;
    horasTrabajadas: ReporteKPI;
    eficienciaTemporal: ReporteKPI;
    velocidadEquipo: ReporteKPI;
  };
  
  // KPIs de Tiempo y Rendimiento
  tiempo: {
    horasSemanales: ReporteKPI;
    tiempoPromedioTarea: ReporteKPI;
    cumplimientoPlazos: ReporteKPI;
    desviacionEstimaciones: ReporteKPI;
  };
  
  // KPIs de Distribución
  distribucion: {
    tareasPorEstado: ReporteKPI[];
    tareasPorPrioridad: ReporteKPI[];
    horasPorProyecto: ReporteKPI[];
  };
}

// ======================================
// INTERFACES PARA DATOS DE REPORTES
// ======================================

export interface DatosReporteProyecto {
  proyecto: Project;
  estadisticas: {
    totalTareas: number;
    tareasCompletadas: number;
    tareasPendientes: number;
    horasEstimadas: number;
    horasReales: number;
    porcentajeCompletado: number;
    diasRestantes: number;
    eficiencia: number; // horasReales / horasEstimadas
  };
  progresoPorSemana: {
    semana: string;
    tareasCompletadas: number;
    horasTrabajadas: number;
  }[];
  distribucionTareas: {
    estado: TaskStatus;
    cantidad: number;
    porcentaje: number;
  }[];
  timelineTareas: {
    fecha: string;
    tareasCreadas: number;
    tareasCompletadas: number;
    horasTrabajadas: number;
  }[];
}

export interface DatosReporteTiempo {
  periodo: {
    fechaInicio: string;
    fechaFin: string;
    totalDias: number;
  };
  resumen: {
    totalHoras: number;
    horasPromedioDiarias: number;
    diasTrabajados: number;
    proyectosActivos: number;
  };
  desgloseDiario: {
    fecha: string;
    horas: number;
    tareas: number;
    proyectos: string[];
  }[];
  desglosePorProyecto: {
    proyecto: Pick<Project, 'id' | 'name' | 'color'>;
    horas: number;
    porcentaje: number;
    tareas: number;
  }[];
  desglosePorTarea: {
    tarea: Pick<Task, 'id' | 'title' | 'project_id'>;
    proyecto: string;
    horas: number;
    fechas: string[];
  }[];
}

export interface DatosReporteProductividad {
  velocidadEquipo: {
    tareasCompletadasSemana: number;
    horasTrabajadasSemana: number;
    tiempoPromedioTarea: number;
    eficienciaGeneral: number;
  };
  tendencias: {
    fecha: string;
    tareasCompletadas: number;
    horasTrabajadas: number;
    proyectosActivos: number;
  }[];
  comparacionPeriodos: {
    periodoActual: {
      fechaInicio: string;
      fechaFin: string;
      totalHoras: number;
      tareasCompletadas: number;
      proyectosFinalizados: number;
    };
    periodoAnterior: {
      fechaInicio: string;
      fechaFin: string;
      totalHoras: number;
      tareasCompletadas: number;
      proyectosFinalizados: number;
    };
    mejoras: {
      horas: number;
      tareas: number;
      proyectos: number;
    };
  };
}

// ======================================
// FILTROS Y CONFIGURACIÓN DE REPORTES
// ======================================

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
  proyectosIds?: string[];
  estados?: ProjectStatus[];
  incluyeArchivados?: boolean;
}

export interface ConfiguracionReporte {
  titulo: string;
  subtitulo?: string;
  periodo: {
    fechaInicio: string;
    fechaFin: string;
    tipo: 'semanal' | 'mensual' | 'trimestral' | 'personalizado';
  };
  secciones: {
    resumenEjecutivo: boolean;
    kpisPrincipales: boolean;
    detalleProyectos: boolean;
    analisisHoras: boolean;
    graficosProductividad: boolean;
    tablasDetalladas: boolean;
  };
  formato: {
    incluirGraficos: boolean;
    incluirTablas: boolean;
    incluirLogotipos: boolean;
    tema: 'claro' | 'oscuro' | 'aclimar';
  };
  destinatario: {
    empresa: string;
    contacto?: string;
    email?: string;
  };
}

// ======================================
// TIPOS PARA GENERACIÓN DE PDF
// ======================================

export interface ElementoPDF {
  tipo: 'titulo' | 'subtitulo' | 'parrafo' | 'tabla' | 'grafico' | 'kpi' | 'espaciado';
  contenido: any;
  estilo?: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    align?: 'left' | 'center' | 'right';
    marginTop?: number;
    marginBottom?: number;
  };
}

export interface PlantillaPDF {
  encabezado: {
    titulo: string;
    subtitulo?: string;
    empresa: string;
    fecha: string;
    logo?: string;
  };
  configuracion: {
    orientacion: 'portrait' | 'landscape';
    formato: 'A4' | 'Letter';
    margenes: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  elementos: ElementoPDF[];
  piePagina: {
    texto: string;
    mostrarNumeroPagina: boolean;
  };
}

// ======================================
// INTERFACES PARA ANÁLISIS AVANZADO
// ======================================

export interface AnalisisProyecto {
  proyecto: Project;
  metricas: {
    duracionPlanificada: number; // días
    duracionReal: number; // días
    horasEstimadas: number;
    horasReales: number;
    tareasPlanificadas: number;
    tareasCompletadas: number;
    eficienciaTemporal: number; // 0-1
    cumplimientoPlazos: number; // 0-1
  };
  riesgos: {
    retrasoPotencial: boolean;
    sobreHoras: boolean;
    tareasBloqueadas: number;
    dependenciasCriticas: number;
  };
  recomendaciones: string[];
}

export interface AnalisisTendencias {
  tendenciaGeneral: 'positiva' | 'negativa' | 'estable';
  metricas: {
    productividadSemanal: number[];
    horasSemanales: number[];
    tareasCompletadasSemanal: number[];
    eficienciaTemporalSemanal: number[];
  };
  predicciones: {
    horasProximaSemana: number;
    tareasProximaSemana: number;
    proyectosFinalizarMes: number;
  };
  alertas: {
    nivel: 'info' | 'warning' | 'error';
    mensaje: string;
    recomendacion: string;
  }[];
}

// ======================================
// TIPOS PARA DATOS TEMPORALES Y AGREGACIONES
// ======================================

export interface DatoTemporal {
  fecha: string;
  valor: number;
  metadata?: Record<string, any>;
}

export interface SerieTemporalKPI {
  label: string;
  datos: DatoTemporal[];
  color: string;
  tipo: 'line' | 'bar' | 'area';
}

export interface AgregacionTemporal {
  periodo: 'dia' | 'semana' | 'mes' | 'trimestre';
  datos: {
    [fecha: string]: {
      horasTrabajadas: number;
      tareasCompletadas: number;
      proyectosActivos: number;
      eficiencia: number;
    };
  };
}

// ======================================
// INTERFACES PARA COMPONENTES DE UI
// ======================================

export interface PropiedadesGrafico {
  datos: any[];
  titulo: string;
  subtitulo?: string;
  tipo: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'gantt';
  colores?: string[];
  configuracion?: Record<string, any>;
  responsive?: boolean;
  altura?: number;
}

export interface PropiedadesTabla {
  datos: any[];
  columnas: {
    key: string;
    titulo: string;
    tipo: 'texto' | 'numero' | 'fecha' | 'porcentaje' | 'badge';
    ancho?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  titulo?: string;
  paginacion?: boolean;
  ordenamiento?: boolean;
  filtrable?: boolean;
}

// ======================================
// UTILIDADES Y HELPERS
// ======================================

export type PeriodoTiempo = '7d' | '30d' | '90d' | '1y' | 'personalizado';

export interface RangoFechas {
  inicio: Date;
  fin: Date;
}

export interface EstadisticasGenerales {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosCompletados: number;
  totalTareas: number;
  tareasCompletadas: number;
  totalHoras: number;
  horasEstaSemana: number;
  eficienciaPromedio: number;
}

// ======================================
// EXPORTACIÓN DE TIPOS
// ======================================

export type TipoReporte = 'ejecutivo' | 'operacional' | 'analitico' | 'personalizado';

export type EstadoGeneracionPDF = 'idle' | 'generando' | 'completado' | 'error';

export type VistaReporte = 'dashboard' | 'detalle' | 'configuracion' | 'preview';
