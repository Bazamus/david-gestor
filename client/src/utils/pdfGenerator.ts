// ======================================
// GENERADOR DE PDF PARA REPORTES
// ======================================

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { 
  ConfiguracionReporte
} from '@/types/reportes';

// ======================================
// CONFIGURACIÓN GENERAL
// ======================================

const PDF_CONFIG = {
  formato: 'a4' as const,
  orientacion: 'portrait' as const,
  unidad: 'mm' as const,
  margenes: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  colores: {
    primario: '#2563EB',
    secundario: '#059669',
    acento: '#EA580C',
    texto: '#1F2937',
    textoSecundario: '#6B7280',
    fondo: '#F9FAFB',
    border: '#E5E7EB'
  },
  fuentes: {
    principal: 'helvetica',
    tamaños: {
      titulo: 24,
      subtitulo: 18,
      encabezado: 16,
      normal: 12,
      pequeño: 10
    }
  }
};

// ======================================
// CLASE PRINCIPAL PARA GENERACIÓN DE PDF
// ======================================

export class GeneradorPDF {
  private pdf: jsPDF;
  private paginaActual: number = 1;
  private yPosition: number = PDF_CONFIG.margenes.top;
  private configuracion: ConfiguracionReporte;

  constructor(configuracion: ConfiguracionReporte) {
    this.configuracion = configuracion;
    this.pdf = new jsPDF({
      orientation: PDF_CONFIG.orientacion,
      unit: PDF_CONFIG.unidad,
      format: PDF_CONFIG.formato
    });
    
    // Configurar metadatos del PDF
    this.pdf.setProperties({
      title: configuracion.titulo,
      subject: 'Reporte de Productividad - Aclimar',
      author: 'Aclimar',
      creator: 'Sistema de Gestión de Proyectos'
    });
  }

  // ======================================
  // MÉTODOS PRINCIPALES
  // ======================================

  public async generarReporte(): Promise<Blob> {
    try {
      // Portada
      await this.crearPortada();
      
      // Resumen ejecutivo
      if (this.configuracion.secciones.resumenEjecutivo) {
        this.nuevaPagina();
        await this.crearResumenEjecutivo();
      }

      // KPIs principales
      if (this.configuracion.secciones.kpisPrincipales) {
        this.nuevaPagina();
        await this.crearSeccionKPIs();
      }

      // Análisis de horas
      if (this.configuracion.secciones.analisisHoras) {
        this.nuevaPagina();
        await this.crearAnalisisHoras();
      }

      // Detalle de proyectos
      if (this.configuracion.secciones.detalleProyectos) {
        this.nuevaPagina();
        await this.crearDetalleProyectos();
      }

      // Pie de página en todas las páginas
      this.agregarPiesPagina();

      // Convertir a blob y retornar
      const pdfBlob = this.pdf.output('blob');
      return pdfBlob;

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el reporte PDF');
    }
  }

  // ======================================
  // MÉTODOS PARA CREAR SECCIONES
  // ======================================

  private async crearPortada(): Promise<void> {
    const { pdf } = this;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Fondo de la portada
    pdf.setFillColor(PDF_CONFIG.colores.primario);
    pdf.rect(0, 0, pageWidth, 80, 'F');

    // Título principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.titulo);
    pdf.setFont(PDF_CONFIG.fuentes.principal, 'bold');
    pdf.text(this.configuracion.titulo, centerX, 40, { align: 'center' });

    // Empresa
    pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.encabezado);
    pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
    pdf.text(this.configuracion.destinatario.empresa, centerX, 55, { align: 'center' });

    // Período
    pdf.setTextColor(PDF_CONFIG.colores.texto);
    pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.normal);
    const periodo = `${this.formatearFecha(this.configuracion.periodo.fechaInicio)} - ${this.formatearFecha(this.configuracion.periodo.fechaFin)}`;
    pdf.text(`Período: ${periodo}`, centerX, 100, { align: 'center' });

    // Fecha de generación
    const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Generado el: ${fechaGeneracion}`, centerX, 115, { align: 'center' });

    // Logo placeholder (si está habilitado)
    if (this.configuracion.formato.incluirLogotipos) {
      pdf.setDrawColor(PDF_CONFIG.colores.border);
      pdf.setLineWidth(1);
      pdf.rect(centerX - 25, 140, 50, 20);
      pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.pequeño);
      pdf.text('LOGO', centerX, 152, { align: 'center' });
    }

    this.yPosition = 200;
  }

  private async crearResumenEjecutivo(): Promise<void> {
    this.agregarTitulo('Resumen Ejecutivo');
    
    // Texto de resumen
    const resumen = [
      'Este reporte presenta un análisis detallado de la productividad y progreso de los proyectos',
      `durante el período del ${this.formatearFecha(this.configuracion.periodo.fechaInicio)}`,
      `al ${this.formatearFecha(this.configuracion.periodo.fechaFin)}.`,
      '',
      'Los indicadores clave muestran el rendimiento del equipo, la distribución de horas trabajadas',
      'y el avance en los diferentes proyectos en curso.'
    ];

    this.agregarParrafo(resumen.join(' '));
    
    // KPIs destacados
    this.yPosition += 10;
    this.agregarSubtitulo('Métricas Principales');
    
    // Aquí podrías agregar KPIs específicos
    this.agregarTexto('• Proyectos activos: En desarrollo', PDF_CONFIG.fuentes.tamaños.normal);
    this.agregarTexto('• Horas trabajadas: Total del período', PDF_CONFIG.fuentes.tamaños.normal);
    this.agregarTexto('• Tareas completadas: Progreso general', PDF_CONFIG.fuentes.tamaños.normal);
    this.agregarTexto('• Eficiencia: Relación tiempo estimado vs real', PDF_CONFIG.fuentes.tamaños.normal);
  }

  private async crearSeccionKPIs(): Promise<void> {
    this.agregarTitulo('Indicadores Clave de Rendimiento');
    
    // Grid de KPIs (simulado con texto por ahora)
    const kpis = [
      { titulo: 'Proyectos Activos', valor: '3', descripcion: 'Proyectos en desarrollo' },
      { titulo: 'Horas Trabajadas', valor: '120h', descripcion: 'Total del período' },
      { titulo: 'Tareas Completadas', valor: '45', descripcion: 'Tareas finalizadas' },
      { titulo: 'Eficiencia', valor: '85%', descripcion: 'Tiempo estimado vs real' }
    ];

    let col = 0;
    const colWidth = 85;
    const startX = PDF_CONFIG.margenes.left;

    for (const kpi of kpis) {
      const x = startX + (col * colWidth);
      
      // Marco del KPI
      this.pdf.setDrawColor(PDF_CONFIG.colores.border);
      this.pdf.setLineWidth(0.5);
      this.pdf.rect(x, this.yPosition, 80, 30);
      
      // Título del KPI
      this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.pequeño);
      this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
      this.pdf.setTextColor(PDF_CONFIG.colores.textoSecundario);
      this.pdf.text(kpi.titulo, x + 5, this.yPosition + 8);
      
      // Valor del KPI
      this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.encabezado);
      this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'bold');
      this.pdf.setTextColor(PDF_CONFIG.colores.primario);
      this.pdf.text(kpi.valor, x + 5, this.yPosition + 18);
      
      // Descripción
      this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.pequeño);
      this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
      this.pdf.setTextColor(PDF_CONFIG.colores.textoSecundario);
      this.pdf.text(kpi.descripcion, x + 5, this.yPosition + 26);
      
      col++;
      if (col >= 2) {
        col = 0;
        this.yPosition += 40;
      }
    }

    if (col > 0) {
      this.yPosition += 40;
    }
  }

  private async crearAnalisisHoras(): Promise<void> {
    this.agregarTitulo('Análisis de Horas Trabajadas');
    
    this.agregarSubtitulo('Distribución por Proyecto');
    
    // Tabla de horas por proyecto (simulada)
    const proyectos = [
      { nombre: 'Proyecto A', horas: 45, porcentaje: 37.5 },
      { nombre: 'Proyecto B', horas: 35, porcentaje: 29.2 },
      { nombre: 'Proyecto C', horas: 40, porcentaje: 33.3 }
    ];

    this.crearTablaHoras(proyectos);
    
    this.yPosition += 20;
    this.agregarSubtitulo('Tendencia Semanal');
    this.agregarParrafo('Las horas trabajadas muestran una tendencia consistente con picos en días de entrega de hitos importantes.');
  }

  private async crearDetalleProyectos(): Promise<void> {
    this.agregarTitulo('Detalle por Proyecto');
    
    // Lista de proyectos (simulada)
    const proyectos = [
      {
        nombre: 'Desarrollo Web Corporativo',
        estado: 'En Progreso',
        progreso: 75,
        tareas: 12,
        horasUsadas: 45
      },
      {
        nombre: 'App Móvil iOS',
        estado: 'En Progreso', 
        progreso: 60,
        tareas: 8,
        horasUsadas: 35
      }
    ];

    for (const proyecto of proyectos) {
      this.agregarSubtitulo(proyecto.nombre);
      
      this.agregarTexto(`Estado: ${proyecto.estado}`, PDF_CONFIG.fuentes.tamaños.normal);
      this.agregarTexto(`Progreso: ${proyecto.progreso}%`, PDF_CONFIG.fuentes.tamaños.normal);
      this.agregarTexto(`Tareas: ${proyecto.tareas}`, PDF_CONFIG.fuentes.tamaños.normal);
      this.agregarTexto(`Horas trabajadas: ${proyecto.horasUsadas}h`, PDF_CONFIG.fuentes.tamaños.normal);
      
      this.yPosition += 10;
    }
  }

  // ======================================
  // MÉTODOS AUXILIARES
  // ======================================

  private agregarTitulo(texto: string): void {
    this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.subtitulo);
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'bold');
    this.pdf.setTextColor(PDF_CONFIG.colores.primario);
    this.pdf.text(texto, PDF_CONFIG.margenes.left, this.yPosition);
    this.yPosition += 15;
  }

  private agregarSubtitulo(texto: string): void {
    this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.encabezado);
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'bold');
    this.pdf.setTextColor(PDF_CONFIG.colores.texto);
    this.pdf.text(texto, PDF_CONFIG.margenes.left, this.yPosition);
    this.yPosition += 10;
  }

  private agregarParrafo(texto: string): void {
    this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.normal);
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
    this.pdf.setTextColor(PDF_CONFIG.colores.texto);
    
    const maxWidth = this.pdf.internal.pageSize.getWidth() - (PDF_CONFIG.margenes.left + PDF_CONFIG.margenes.right);
    const lineas = this.pdf.splitTextToSize(texto, maxWidth);
    
    this.pdf.text(lineas, PDF_CONFIG.margenes.left, this.yPosition);
    this.yPosition += lineas.length * 5 + 5;
  }

  private agregarTexto(texto: string, fontSize: number): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
    this.pdf.setTextColor(PDF_CONFIG.colores.texto);
    this.pdf.text(texto, PDF_CONFIG.margenes.left, this.yPosition);
    this.yPosition += fontSize * 0.5 + 2;
  }

  private crearTablaHoras(proyectos: Array<{ nombre: string; horas: number; porcentaje: number }>): void {
    const startY = this.yPosition;
    const rowHeight = 8;
    const colWidths = [80, 30, 30];
    const headers = ['Proyecto', 'Horas', '%'];

    // Encabezados
    this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.pequeño);
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'bold');
    this.pdf.setTextColor(PDF_CONFIG.colores.texto);

    let x = PDF_CONFIG.margenes.left;
    headers.forEach((header, i) => {
      this.pdf.text(header, x, startY);
      x += colWidths[i];
    });

    this.yPosition = startY + rowHeight;

    // Datos
    this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
    proyectos.forEach((proyecto) => {
      x = PDF_CONFIG.margenes.left;
      this.pdf.text(proyecto.nombre, x, this.yPosition);
      x += colWidths[0];
      this.pdf.text(`${proyecto.horas}h`, x, this.yPosition);
      x += colWidths[1];
      this.pdf.text(`${proyecto.porcentaje.toFixed(1)}%`, x, this.yPosition);
      this.yPosition += rowHeight;
    });
  }

  private nuevaPagina(): void {
    this.pdf.addPage();
    this.paginaActual++;
    this.yPosition = PDF_CONFIG.margenes.top;
  }

  private agregarPiesPagina(): void {
    const totalPages = (this.pdf as any).getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // Línea separadora
      const pageWidth = this.pdf.internal.pageSize.getWidth();
      const pageHeight = this.pdf.internal.pageSize.getHeight();
      const footerY = pageHeight - 15;
      
      this.pdf.setDrawColor(PDF_CONFIG.colores.border);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(PDF_CONFIG.margenes.left, footerY - 5, pageWidth - PDF_CONFIG.margenes.right, footerY - 5);
      
      // Texto del pie
      this.pdf.setFontSize(PDF_CONFIG.fuentes.tamaños.pequeño);
      this.pdf.setFont(PDF_CONFIG.fuentes.principal, 'normal');
      this.pdf.setTextColor(PDF_CONFIG.colores.textoSecundario);
      
      // Empresa a la izquierda
      this.pdf.text(this.configuracion.destinatario.empresa, PDF_CONFIG.margenes.left, footerY);
      
      // Número de página a la derecha
      this.pdf.text(`Página ${i} de ${totalPages}`, pageWidth - PDF_CONFIG.margenes.right, footerY, { align: 'right' });
    }
  }

  private formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// ======================================
// FUNCIÓN PRINCIPAL PARA GENERAR PDF
// ======================================

export const generarReportePDF = async (configuracion: ConfiguracionReporte): Promise<Blob> => {
  const generador = new GeneradorPDF(configuracion);
  return await generador.generarReporte();
};

// ======================================
// FUNCIÓN PARA CAPTURAR GRÁFICOS
// ======================================

export const capturarGraficoComoImagen = async (elementId: string): Promise<string> => {
  const elemento = document.getElementById(elementId);
  if (!elemento) {
    throw new Error(`No se encontró el elemento con ID: ${elementId}`);
  }

  try {
    const canvas = await html2canvas(elemento, {
      background: '#ffffff',
      // scale: 2, // Comentado temporalmente
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    return canvas.toDataURL('image/png', 0.9);
  } catch (error) {
    console.error('Error capturando gráfico:', error);
    throw new Error('Error al capturar el gráfico como imagen');
  }
};

// ======================================
// UTILIDADES ADICIONALES
// ======================================

export const validarConfiguracionPDF = (configuracion: ConfiguracionReporte): boolean => {
  const errores: string[] = [];

  if (!configuracion.titulo?.trim()) {
    errores.push('El título es requerido');
  }

  if (!configuracion.periodo.fechaInicio || !configuracion.periodo.fechaFin) {
    errores.push('Las fechas de inicio y fin son requeridas');
  }

  if (new Date(configuracion.periodo.fechaInicio) > new Date(configuracion.periodo.fechaFin)) {
    errores.push('La fecha de inicio debe ser anterior a la fecha de fin');
  }

  const seccionesSeleccionadas = Object.values(configuracion.secciones).some(Boolean);
  if (!seccionesSeleccionadas) {
    errores.push('Debe seleccionar al menos una sección');
  }

  if (errores.length > 0) {
    console.error('Errores de validación:', errores);
    return false;
  }

  return true;
};
