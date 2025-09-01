// ======================================
// SERVICIO DE GENERACIÓN DE PDF PROFESIONAL
// Sistema completo de reportes PDF para Aclimar
// ======================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ======================================
// TIPOS E INTERFACES
// ======================================

export interface DatosPDF {
  // Información de la empresa
  empresa: {
    nombre: string;
    periodo: string;
    fechaGeneracion: string;
  };
  
  // KPIs principales
  kpis: {
    totalProyectos: number;
    proyectosActivos: number;
    proyectosCompletados: number;
    totalTareas: number;
    tareasCompletadas: number;
    totalHoras: number;
    horasEstaSemana: number;
    eficienciaPromedio: number;
  };
  
  // Datos de gráficos
  horasPorProyecto?: Array<{ nombre: string; valor: number; color?: string }>;
  horasDiarias?: Array<{ fecha: string; valor: number }>;
  
  // Datos de tareas para tabla
  tareas?: Array<{
    id: string;
    titulo: string;
    descripcion?: string;
    proyecto: string;
    horasEstimadas: number;
    horasReales: number;
    porcentajeCompletado: number;
    estado: string;
  }>;
  
  // Filtros aplicados
  filtros?: {
    fechaInicio?: string;
    fechaFin?: string;
    proyectosSeleccionados?: string[];
    [key: string]: any;
  };
}

export interface ConfiguracionPDF {
  formato: 'A4' | 'letter';
  orientacion: 'portrait' | 'landscape';
  incluirGraficos: boolean;
  incluirDetalles: boolean;
  logoEmpresa?: string;
  colorPrimario: string;
  colorSecundario: string;
}

// ======================================
// CONFIGURACIÓN POR DEFECTO
// ======================================

const CONFIG_DEFAULT: ConfiguracionPDF = {
  formato: 'A4',
  orientacion: 'portrait',
  incluirGraficos: true,
  incluirDetalles: true,
  colorPrimario: '#2563EB',
  colorSecundario: '#64748B'
};

// ======================================
// FUNCIONES DE UTILIDAD
// ======================================

/**
 * Formatea una fecha para mostrar en el PDF
 */
const formatearFecha = (fecha: string | Date): string => {
  try {
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'Fecha no disponible';
  }
};

/**
 * Formatea números para mostrar en el PDF
 */
const formatearNumero = (numero: number, decimales: number = 1): string => {
  return numero.toFixed(decimales);
};

/**
 * Convierte un elemento HTML a imagen para incluir en PDF
 */
export const convertirElementoAImagen = async (elemento: HTMLElement): Promise<string> => {
  try {
    const canvas = await html2canvas(elemento, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    } as any); // Usar 'as any' para evitar problemas de tipos
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error convirtiendo elemento a imagen:', error);
    return '';
  }
};

// ======================================
// CLASE PRINCIPAL DE GENERACIÓN PDF
// ======================================

export class GeneradorPDF {
  private pdf: jsPDF;
  private config: ConfiguracionPDF;
  private yPosition: number = 20;
  private pageHeight: number;
  private pageWidth: number;

  constructor(config: Partial<ConfiguracionPDF> = {}) {
    this.config = { ...CONFIG_DEFAULT, ...config };
    
    // Configurar jsPDF con soporte para UTF-8
    this.pdf = new jsPDF({
      orientation: this.config.orientacion,
      unit: 'mm',
      format: this.config.formato,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    // Configurar fuente con soporte para caracteres especiales
    this.pdf.setFont('helvetica');
    
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
  }

  /**
   * Genera el encabezado del reporte
   */
  private generarEncabezado(datos: DatosPDF): void {
    const { empresa } = datos;
    
    // Validar que los datos de empresa existan
    if (!empresa || !empresa.nombre || !empresa.periodo || !empresa.fechaGeneracion) {
      console.error('Datos de empresa incompletos:', empresa);
      throw new Error('Datos de empresa incompletos para generar el encabezado');
    }
    
    // Logo y título principal
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(this.config.colorPrimario);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('REPORTE DE PRODUCTIVIDAD', 20, this.yPosition);
    
    this.yPosition += 10;
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(this.config.colorSecundario);
    this.pdf.text(empresa.nombre || 'Empresa', 20, this.yPosition);
    
    // Información del período
    this.yPosition += 8;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Período: ${empresa.periodo || 'No especificado'}`, 20, this.yPosition);
    
    this.yPosition += 5;
    this.pdf.text(`Fecha de generación: ${formatearFecha(empresa.fechaGeneracion)}`, 20, this.yPosition);
    
    // Línea separadora
    this.yPosition += 8;
    this.pdf.setDrawColor(this.config.colorPrimario);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(20, this.yPosition, this.pageWidth - 20, this.yPosition);
    
    this.yPosition += 10;
  }

  /**
   * Genera la sección de KPIs principales
   */
  private generarSeccionKPIs(datos: DatosPDF): void {
    const { kpis } = datos;
    
    // Validar que los KPIs existan
    if (!kpis) {
      console.error('KPIs no disponibles');
      throw new Error('KPIs no disponibles para generar la sección');
    }
    
    // Título de sección
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(this.config.colorPrimario);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('MÉTRICAS PRINCIPALES', 20, this.yPosition);
    
    this.yPosition += 10;
    
    // Grid de KPIs (2x4) con validaciones
    const kpiData = [
      { label: 'Total Proyectos', valor: (kpis.totalProyectos || 0).toString(), color: '#3B82F6' },
      { label: 'Proyectos Activos', valor: (kpis.proyectosActivos || 0).toString(), color: '#10B981' },
      { label: 'Proyectos Completados', valor: (kpis.proyectosCompletados || 0).toString(), color: '#8B5CF6' },
      { label: 'Eficiencia Promedio', valor: `${formatearNumero(kpis.eficienciaPromedio || 0)}%`, color: '#F59E0B' },
      { label: 'Total Tareas', valor: (kpis.totalTareas || 0).toString(), color: '#6366F1' },
      { label: 'Tareas Completadas', valor: (kpis.tareasCompletadas || 0).toString(), color: '#10B981' },
      { label: 'Horas Totales', valor: `${formatearNumero(kpis.totalHoras || 0)}h`, color: '#3B82F6' },
      { label: 'Horas Esta Semana', valor: `${formatearNumero(kpis.horasEstaSemana || 0)}h`, color: '#10B981' }
    ];
    
    const colWidth = (this.pageWidth - 40) / 2;
    const rowHeight = 15;
    
    kpiData.forEach((kpi, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 20 + (col * colWidth);
      const y = this.yPosition + (row * rowHeight);
      
      // Fondo del KPI
      this.pdf.setFillColor(245, 245, 245);
      this.pdf.rect(x, y - 3, colWidth - 5, 12, 'F');
      
      // Texto del KPI
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(60, 60, 60);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(kpi.label, x + 2, y + 2);
      
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(kpi.color);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(kpi.valor, x + 2, y + 7);
    });
    
    this.yPosition += (Math.ceil(kpiData.length / 2) * rowHeight) + 10;
  }

  /**
   * Genera la sección de resumen de horas por proyecto
   */
  private generarResumenHoras(datos: DatosPDF): void {
    if (!datos.horasPorProyecto || datos.horasPorProyecto.length === 0) {
      return;
    }
    
    this.verificarEspacioEnPagina(50);
    
    // Título de sección
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(this.config.colorPrimario);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('DISTRIBUCIÓN DE HORAS POR PROYECTO', 20, this.yPosition);
    
    this.yPosition += 10;
    
    // Tabla de horas por proyecto
    const tableData = datos.horasPorProyecto.map(item => [
      item.nombre,
      `${formatearNumero(item.valor)}h`,
      `${formatearNumero((item.valor / datos.kpis.totalHoras) * 100)}%`
    ]);
    
    // Encabezados de tabla
    const headers = ['Proyecto', 'Horas', 'Porcentaje'];
    const colWidths = [80, 30, 30];
    
    // Dibujar encabezados
    this.pdf.setFillColor(59, 130, 246); // Azul
    this.pdf.setDrawColor(59, 130, 246);
    this.pdf.setLineWidth(0.1);
    
    let xPos = 20;
    headers.forEach((header, index) => {
      this.pdf.rect(xPos, this.yPosition - 5, colWidths[index], 8, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(header, xPos + 2, this.yPosition + 1);
      xPos += colWidths[index];
    });
    
    this.yPosition += 8;
    
    // Dibujar datos
    tableData.forEach((row, _rowIndex) => {
      this.verificarEspacioEnPagina(10);
      
      xPos = 20;
      row.forEach((cell, colIndex) => {
        this.pdf.setFillColor(245, 245, 245);
        this.pdf.rect(xPos, this.yPosition - 3, colWidths[colIndex], 6, 'F');
        this.pdf.setTextColor(60, 60, 60);
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(cell, xPos + 2, this.yPosition + 1);
        xPos += colWidths[colIndex];
      });
      
      this.yPosition += 8;
    });
    
    this.yPosition += 5;
  }

  /**
   * Genera la tabla de tareas realizadas
   */
  private generarTablaTareas(datos: DatosPDF): void {
    if (!datos.tareas || datos.tareas.length === 0) {
      return;
    }
    
    this.verificarEspacioEnPagina(60);
    
    // Título de sección
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(this.config.colorPrimario);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TAREAS REALIZADAS', 20, this.yPosition);
    
    this.yPosition += 10;
    
    // Encabezados de tabla
    const headers = ['Tarea', 'Proyecto', 'Horas', '% Completado'];
    const colWidths = [60, 40, 25, 30];
    
    // Dibujar encabezados
    this.pdf.setFillColor(59, 130, 246); // Azul
    this.pdf.setDrawColor(59, 130, 246);
    this.pdf.setLineWidth(0.1);
    
    let xPos = 20;
    headers.forEach((header, index) => {
      this.pdf.rect(xPos, this.yPosition - 5, colWidths[index], 8, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(header, xPos + 2, this.yPosition + 1);
      xPos += colWidths[index];
    });
    
    this.yPosition += 8;
    
    // Dibujar datos de tareas
    datos.tareas.forEach((tarea, index) => {
      this.verificarEspacioEnPagina(12);
      
      // Fondo alternado para filas
      if (index % 2 === 0) {
        this.pdf.setFillColor(248, 249, 250);
        this.pdf.rect(20, this.yPosition - 3, this.pageWidth - 40, 10, 'F');
      }
      
      xPos = 20;
      
      // Tarea (truncar si es muy larga)
      const tituloCorto = tarea.titulo.length > 25 ? tarea.titulo.substring(0, 22) + '...' : tarea.titulo;
      this.pdf.setTextColor(60, 60, 60);
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(tituloCorto, xPos + 2, this.yPosition + 1);
      xPos += colWidths[0];
      
      // Proyecto
      const proyectoCorto = tarea.proyecto.length > 15 ? tarea.proyecto.substring(0, 12) + '...' : tarea.proyecto;
      this.pdf.text(proyectoCorto, xPos + 2, this.yPosition + 1);
      xPos += colWidths[1];
      
      // Horas
      this.pdf.text(`${formatearNumero(tarea.horasReales)}h`, xPos + 2, this.yPosition + 1);
      xPos += colWidths[2];
      
      // Porcentaje completado
      const porcentaje = `${formatearNumero(tarea.porcentajeCompletado)}%`;
      this.pdf.text(porcentaje, xPos + 2, this.yPosition + 1);
      
      this.yPosition += 10;
    });
    
    this.yPosition += 5;
  }

  /**
   * Genera la información de filtros aplicados
   */
  private generarInformacionFiltros(datos: DatosPDF): void {
    if (!datos.filtros) {
      return;
    }
    
    this.verificarEspacioEnPagina(20);
    
    // Título de sección
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('FILTROS APLICADOS', 20, this.yPosition);
    
    this.yPosition += 5;
    
    // Información de filtros
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    if (datos.filtros.fechaInicio && datos.filtros.fechaFin) {
      this.pdf.text(`Período: ${formatearFecha(datos.filtros.fechaInicio)} - ${formatearFecha(datos.filtros.fechaFin)}`, 20, this.yPosition);
    }
    
    this.yPosition += 5;
  }

  /**
   * Genera el pie de página del reporte
   */
  private generarPiePagina(): void {
    const footerY = this.pageHeight - 15;
    
    // Línea separadora
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(20, footerY - 5, this.pageWidth - 20, footerY - 5);
    
    // Información del pie de página
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFont('helvetica', 'normal');
    
    // Texto izquierdo
    this.pdf.text('Generado por Sistema de Reportes Aclimar', 20, footerY);
    
    // Información de página y timestamp
    const timestamp = new Date().toLocaleString('es-ES');
    const pageInfo = `Página 1 de 1`;
    const timestampText = `${timestamp}`;
    
    // Calcular posiciones para alineación derecha
    const pageInfoWidth = this.pdf.getTextWidth(pageInfo);
    const timestampWidth = this.pdf.getTextWidth(timestampText);
    
    this.pdf.text(pageInfo, this.pageWidth - 20 - pageInfoWidth, footerY);
    this.pdf.text(timestampText, this.pageWidth - 20 - timestampWidth, footerY - 3);
  }

  /**
   * Verifica si hay espacio suficiente en la página actual
   */
  private verificarEspacioEnPagina(espacioNecesario: number): void {
    if (this.yPosition + espacioNecesario > this.pageHeight - 30) {
      this.pdf.addPage();
      this.yPosition = 20;
    }
  }

  /**
   * Genera el PDF completo
   */
  public async generarPDF(datos: DatosPDF): Promise<Blob> {
    try {
      // Validar que los datos sean válidos
      if (!datos || !datos.empresa || !datos.kpis) {
        console.error('Datos PDF inválidos:', datos);
        throw new Error('Datos PDF incompletos o inválidos');
      }
      
      // Resetear posición
      this.yPosition = 20;
      
      // Generar secciones
      this.generarEncabezado(datos);
      this.generarSeccionKPIs(datos);
      this.generarResumenHoras(datos);
      this.generarTablaTareas(datos); // Agregar la llamada a generarTablaTareas
      this.generarInformacionFiltros(datos);
      
      // Generar pie de página
      this.generarPiePagina();
      
      // Retornar blob del PDF
      return new Blob([this.pdf.output('blob')], { type: 'application/pdf' });
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el reporte PDF');
    }
  }

  /**
   * Descarga el PDF directamente
   */
  public async descargarPDF(datos: DatosPDF, nombreArchivo: string = 'reporte-aclimar.pdf'): Promise<void> {
    try {
      await this.generarPDF(datos);
      this.pdf.save(nombreArchivo);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      throw error;
    }
  }
}

// ======================================
// FUNCIONES DE CONVENIENCIA
// ======================================

/**
 * Función de prueba para generar PDF con caracteres especiales
 */
export const testPDFGeneration = async (): Promise<void> => {
  try {
    console.log('🧪 Iniciando prueba de generación de PDF...');
    
    // Crear datos de prueba simples
    const datosPrueba: DatosPDF = {
      empresa: {
        nombre: 'Aclimar - Gestor de Proyectos',
        periodo: 'Semana del 11 al 17 de agosto 2025',
        fechaGeneracion: new Date().toISOString()
      },
      kpis: {
        totalProyectos: 11,
        proyectosActivos: 6,
        proyectosCompletados: 1,
        totalTareas: 45,
        tareasCompletadas: 32,
        totalHoras: 120.5,
        horasEstaSemana: 25.3,
        eficienciaPromedio: 97.1
      },
      horasPorProyecto: [
        { nombre: 'Proyecto A', valor: 25.5, color: '#3B82F6' },
        { nombre: 'Proyecto B', valor: 18.2, color: '#10B981' }
      ],
      horasDiarias: [
        { fecha: '2025-08-11', valor: 8.5 },
        { fecha: '2025-08-12', valor: 7.2 }
      ],
      filtros: {
        fechaInicio: '2025-08-11',
        fechaFin: '2025-08-17'
      }
    };
    
    // Generar PDF con los datos de prueba
    const generador = new GeneradorPDF();
    const pdfBlob = await generador.generarPDF(datosPrueba);
    
    // Descargar el PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test-pdf-simple.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ PDF de prueba generado correctamente');
    
  } catch (error) {
    console.error('❌ Error en prueba de PDF:', error);
    throw error;
  }
};

export const generarReporteSemanal = async (datos: DatosPDF): Promise<Blob> => {
  try {
    // Obtener datos de tareas para la semana actual
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay() + 1); // Lunes
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
    
    const response = await fetch(`http://localhost:5000/api/reportes/datos-tareas-pdf?fecha_inicio=${inicioSemana.toISOString().split('T')[0]}&fecha_fin=${finSemana.toISOString().split('T')[0]}`);
    const tareasData = await response.json();
    
    // Combinar datos existentes con datos de tareas
    const datosCompletos: DatosPDF = {
      ...datos,
      tareas: tareasData.tareas || []
    };
    
    const generador = new GeneradorPDF({
      formato: 'A4',
      orientacion: 'portrait',
      incluirGraficos: true,
      incluirDetalles: true,
      colorPrimario: '#2563EB',
      colorSecundario: '#64748B'
    });
    
    return await generador.generarPDF(datosCompletos);
  } catch (error) {
    console.error('Error generando reporte semanal:', error);
    throw new Error('No se pudo generar el reporte semanal');
  }
};

export const generarReporteMensual = async (datos: DatosPDF): Promise<Blob> => {
  try {
    // Obtener datos de tareas para el mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1); // Primer día del mes
    
    const finMes = new Date(inicioMes);
    finMes.setMonth(inicioMes.getMonth() + 1);
    finMes.setDate(0); // Último día del mes
    
    const response = await fetch(`http://localhost:5000/api/reportes/datos-tareas-pdf?fecha_inicio=${inicioMes.toISOString().split('T')[0]}&fecha_fin=${finMes.toISOString().split('T')[0]}`);
    const tareasData = await response.json();
    
    // Combinar datos existentes con datos de tareas
    const datosCompletos: DatosPDF = {
      ...datos,
      tareas: tareasData.tareas || []
    };
    
    const generador = new GeneradorPDF({
      formato: 'A4',
      orientacion: 'portrait',
      incluirGraficos: true,
      incluirDetalles: true,
      colorPrimario: '#2563EB',
      colorSecundario: '#64748B'
    });
    
    return await generador.generarPDF(datosCompletos);
  } catch (error) {
    console.error('Error generando reporte mensual:', error);
    throw new Error('No se pudo generar el reporte mensual');
  }
};

/**
 * Descarga un reporte directamente
 */
export const descargarReporte = async (
  datos: DatosPDF, 
  tipo: 'semanal' | 'mensual' = 'semanal'
): Promise<void> => {
  try {
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `reporte-${tipo}-aclimar-${fecha}.pdf`;
    
    const generador = new GeneradorPDF({
      colorPrimario: tipo === 'semanal' ? '#2563EB' : '#059669'
    });
    
    await generador.descargarPDF({
      ...datos,
      empresa: {
        ...datos.empresa,
        periodo: tipo === 'semanal' ? 'Reporte Semanal' : 'Reporte Mensual'
      }
    }, nombreArchivo);
    
  } catch (error) {
    console.error(`Error descargando reporte ${tipo}:`, error);
    throw error;
  }
};
