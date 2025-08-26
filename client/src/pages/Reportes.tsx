// ======================================
// PÁGINA DE REPORTES PROFESIONAL - ACLIMAR
// Sistema completo de reportes para facturación
// ======================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileCharts } from '@/components/mobile';
import {
  BarChart3Icon,
  TrendingUpIcon,
  ClockIcon,
  FileTextIcon,
  DownloadIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  DollarSignIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { StatsCard } from '@/components/common/Card';
import GraficoBarras from '@/components/charts/GraficoBarras';
import GraficoLineas from '@/components/charts/GraficoLineas';
import GraficoPie from '@/components/charts/GraficoPie';
import ChartContainer from '@/components/charts/ChartContainer';

// Hooks
import { 
  useEstadisticasGenerales, 
  useHorasPorProyecto, 
  useHorasDiarias,
<<<<<<< HEAD
  useFiltrosAvanzados,
  useProjectList
=======
  useFiltrosAvanzados
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
} from '@/hooks/useReportes';

// Componentes de Reportes
import FiltrosAvanzados from '@/components/reportes/FiltrosAvanzados';
import { useNotificacionPDF } from '@/components/reportes/NotificacionPDF';
import AnalyticsDashboard from '@/components/reportes/AnalyticsDashboard';

// Servicios de PDF
import { descargarReporte, DatosPDF } from '@/services/pdfService';
import { testClientConnectivity } from '../services/analyticsService';
import { testPDFGeneration } from '../services/pdfService';

const Reportes: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
  // Hook de notificaciones PDF
  const {
    mostrarExito,
    mostrarError,
    mostrarCargando,
    mostrarAdvertencia,
    NotificacionComponent
  } = useNotificacionPDF();
  
  // Estados y hooks para datos reales
  const { data: estadisticasGenerales, isLoading: loadingStats, isError: errorStats, refetch: refetchStats } = useEstadisticasGenerales();
  
  // Hook de filtros avanzados
  const { 
    filtros, 
    aplicarFiltros, 
    limpiarFiltros, 
    obtenerFiltrosParaAPI
  } = useFiltrosAvanzados();
  
  // Hooks para gráficos con filtros
  const filtrosAPI = obtenerFiltrosParaAPI();
  const { data: horasPorProyecto, isLoading: loadingHorasProyecto, refetch: refetchHorasProyecto } = useHorasPorProyecto(filtrosAPI);
  const { data: horasDiarias, isLoading: loadingHorasDiarias, refetch: refetchHorasDiarias } = useHorasDiarias(filtrosAPI);
<<<<<<< HEAD
  const { data: projectList, isLoading: loadingProjects } = useProjectList();

=======
  
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  // Refetch cuando cambien los filtros
  useEffect(() => {
    if (filtrosAPI.fechaInicio || filtrosAPI.fechaFin) {
      refetchHorasProyecto();
      refetchHorasDiarias();
    }
  }, [filtrosAPI, refetchHorasProyecto, refetchHorasDiarias]);
  
  // Estados de carga y error consolidados
<<<<<<< HEAD
  const isLoading = loadingStats || loadingHorasProyecto || loadingHorasDiarias || loadingProjects;
=======
  const isLoading = loadingStats || loadingHorasProyecto || loadingHorasDiarias;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  const isError = errorStats;

  // Estado para controlar qué vista mostrar
  const [vistaActual, setVistaActual] = useState<'reportes' | 'analytics'>('reportes');

  // Preparar datos para PDF
  const prepararDatosPDF = (): DatosPDF | null => {
    if (!estadisticasGenerales) {
      mostrarAdvertencia(
        'No hay datos disponibles',
        'Espera a que se carguen los datos o actualiza la página'
      );
      return null;
    }

    // Determinar el período basado en los filtros
    const periodo = filtros.fechaInicio && filtros.fechaFin 
      ? `${filtros.fechaInicio} - ${filtros.fechaFin}`
      : 'Período actual';

    return {
      empresa: {
        nombre: 'Aclimar - Gestor de Proyectos',
        periodo: periodo,
        fechaGeneracion: new Date().toISOString()
      },
      kpis: {
        totalProyectos: estadisticasGenerales.totalProyectos,
        proyectosActivos: estadisticasGenerales.proyectosActivos,
        proyectosCompletados: estadisticasGenerales.proyectosCompletados,
        totalTareas: estadisticasGenerales.totalTareas,
        tareasCompletadas: estadisticasGenerales.tareasCompletadas,
        totalHoras: estadisticasGenerales.totalHoras,
        horasEstaSemana: estadisticasGenerales.horasEstaSemana,
        eficienciaPromedio: estadisticasGenerales.eficienciaPromedio
      },
      horasPorProyecto: horasPorProyecto || [],
      horasDiarias: horasDiarias || [],
      filtros: filtros
    };
  };

  // Handlers para reportes
  const handleGenerarReporteSemanal = async () => {
    const datosPDF = prepararDatosPDF();
    if (!datosPDF) return;

    mostrarCargando('Generando reporte semanal...');
    
    try {
      await descargarReporte(datosPDF, 'semanal');
      mostrarExito(
        'Reporte descargado',
        'El reporte semanal se ha descargado correctamente'
      );
    } catch (error) {
      console.error('Error generando reporte semanal:', error);
      mostrarError(
        'Error al generar reporte',
        'No se pudo generar el reporte semanal. Intenta de nuevo.'
      );
    }
  };

  const handleGenerarReporteMensual = async () => {
    const datosPDF = prepararDatosPDF();
    if (!datosPDF) return;

    mostrarCargando('Generando reporte mensual...');
    
    try {
      await descargarReporte(datosPDF, 'mensual');
      mostrarExito(
        'Reporte descargado',
        'El reporte mensual se ha descargado correctamente'
      );
    } catch (error) {
      console.error('Error generando reporte mensual:', error);
      mostrarError(
        'Error al generar reporte',
        'No se pudo generar el reporte mensual. Intenta de nuevo.'
      );
    }
  };

  const handleTestPDF = async () => {
    try {
      await testPDFGeneration();
      mostrarExito('Test PDF exitoso', 'La generación de PDF funciona correctamente');
    } catch (error) {
      mostrarError('Error en test PDF', 'No se pudo generar el PDF de prueba');
    }
  };

  const handleTestConnectivity = async () => {
    try {
      await testClientConnectivity();
      mostrarExito('Conexión exitosa', 'La conectividad con el servidor está funcionando');
    } catch (error) {
      mostrarError('Error de conectividad', 'No se pudo conectar con el servidor');
    }
  };

  const refrescarDatos = () => {
    refetchStats();
    refetchHorasProyecto();
    refetchHorasDiarias();
  };

<<<<<<< HEAD
=======
  const handleAplicarFiltros = () => {
    aplicarFiltros(filtros);
    console.log('✅ Filtros aplicados');
  };

>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  const handleLimpiarFiltros = () => {
    limpiarFiltros();
    console.log('🗑️ Filtros limpiados');
  };

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileTextIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error al cargar reportes
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>No se pudieron cargar los datos de reportes. Verifica la conexión con la base de datos.</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refrescarDatos}
                >
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BarChart3Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Reportes de Productividad
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Análisis detallado de proyectos y horas trabajadas</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refrescarDatos}
                disabled={isLoading}
              >
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                {isLoading ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerarReporteSemanal}
                disabled={isLoading}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Reporte Semanal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerarReporteMensual}
                disabled={isLoading}
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Reporte Mensual
              </Button>
              {/* Botón de prueba temporal */}
              <Button
                onClick={handleTestConnectivity}
                variant="outline"
                className="flex items-center bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
              >
                🧪 Test
              </Button>
              {/* Botón de prueba PDF */}
              <Button
                onClick={handleTestPDF}
                variant="outline"
                className="flex items-center bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/30"
              >
                📄 Test PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de Navegación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant={vistaActual === 'reportes' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setVistaActual('reportes')}
            >
              <BarChart3Icon className="w-4 h-4 mr-2" />
              Reportes
            </Button>
            <Button
              variant={vistaActual === 'analytics' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setVistaActual('analytics')}
            >
              <TrendingUpIcon className="w-4 h-4 mr-2" />
              Analytics Avanzado
            </Button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8">
          {vistaActual === 'reportes' ? (
            <>
              {/* Filtros Avanzados */}
              <div className="mb-8">
                <FiltrosAvanzados
                  filtros={filtros}
                  onFiltrosChange={aplicarFiltros}
<<<<<<< HEAD
                  onLimpiarFiltros={handleLimpiarFiltros}
                  isLoading={isLoading}
                  proyectosDisponibles={projectList || []}
=======
                  onAplicarFiltros={handleAplicarFiltros}
                  onLimpiarFiltros={handleLimpiarFiltros}
                  isLoading={isLoading}
                  proyectosDisponibles={[]} // TODO: Obtener de la API
                  etiquetasDisponibles={[]} // TODO: Obtener de la API
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
                />
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
                    <span className="text-blue-800 dark:text-blue-200">Cargando datos de reportes...</span>
                  </div>
                </div>
              )}

              {/* KPIs Principales - Métricas Profesionales para Facturación */}
              {estadisticasGenerales && (
                <div className="space-y-8">
                  {/* Primera fila - Métricas de proyectos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                      title="Total Proyectos"
                      value={estadisticasGenerales.totalProyectos}
                      icon={<BarChart3Icon className="w-5 h-5" />}
                      color="blue"
                      onClick={() => navigate('/projects')}
                      showLink
                      linkText="Ver todos"
                    />
                    <StatsCard
                      title="Proyectos Activos"
                      value={estadisticasGenerales.proyectosActivos}
                      icon={<CheckCircleIcon className="w-5 h-5" />}
                      color="green"
                      onClick={() => navigate('/projects?status=active')}
                      showLink
                      linkText="Ver activos"
                    />
                    <StatsCard
                      title="Proyectos Completados"
                      value={estadisticasGenerales.proyectosCompletados}
                      icon={<CheckCircleIcon className="w-5 h-5" />}
                      color="purple"
                      onClick={() => navigate('/projects?status=completed')}
                      showLink
                      linkText="Ver completados"
                    />
                    <StatsCard
                      title="Eficiencia Promedio"
                      value={`${estadisticasGenerales.eficienciaPromedio?.toFixed(1) || 0}%`}
                      icon={<TrendingUpIcon className="w-5 h-5" />}
                      color="yellow"
                    />
                  </div>

                  {/* Segunda fila - Métricas de tareas y horas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                      title="Total Tareas"
                      value={estadisticasGenerales.totalTareas}
                      icon={<FileTextIcon className="w-5 h-5" />}
                      color="purple"
                      onClick={() => navigate('/tasks')}
                      showLink
                      linkText="Ver todas"
                    />
                    <StatsCard
                      title="Tareas Completadas"
                      value={estadisticasGenerales.tareasCompletadas}
                      icon={<CheckCircleIcon className="w-5 h-5" />}
                      color="green"
                      onClick={() => navigate('/tasks?status=completed')}
                      showLink
                      linkText="Ver completadas"
                    />
                    <StatsCard
                      title="Horas Totales"
                      value={`${estadisticasGenerales.totalHoras?.toFixed(1) || 0}h`}
                      icon={<ClockIcon className="w-5 h-5" />}
                      color="blue"
                      onClick={() => navigate('/times')}
                      showLink
                      linkText="Ver entradas"
                    />
                    <StatsCard
                      title="Horas Esta Semana"
                      value={`${estadisticasGenerales.horasEstaSemana?.toFixed(1) || 0}h`}
                      icon={<ClockIcon className="w-5 h-5" />}
                      color="green"
                      onClick={() => navigate('/times')}
                      showLink
                      linkText="Ver entradas"
                    />
                  </div>
                </div>
              )}

              {/* Gráficos Integrados con Datos Reales */}
              {isMobile ? (
                <div className="mt-8">
<<<<<<< HEAD
                  <MobileCharts
                    charts={[
                      {
                        id: 'horas-proyecto',
                        title: 'Horas por Proyecto',
                        type: 'bar',
                        data: horasPorProyecto?.map(proyecto => ({
                          name: proyecto.nombre,
                          value: proyecto.valor
                        })) || [],
                        colors: ['#3B82F6'],
                        height: 300,
                        showLegend: true,
                        showGrid: true,
                        showTooltip: true,
                        animate: true
                      },
                      {
                        id: 'productividad-diaria',
                        title: 'Productividad Diaria',
                        type: 'line',
                        data: horasDiarias?.map(dia => ({
                          name: dia.fecha,
                          value: dia.valor
                        })) || [],
                        colors: ['#10B981'],
                        height: 300,
                        showLegend: true,
                        showGrid: true,
                        showTooltip: true,
                        animate: true
                      }
                    ]}
                    title="Gráficos de Productividad"
                    subtitle="Análisis de horas y proyectos"
                    showSummary={true}
                    showControls={true}
                    showExport={true}
                  />
=======
                  <MobileCharts />
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {/* Gráfico de Horas por Proyecto */}
                  <ChartContainer
                    title="Horas por Proyecto"
                    subtitle="Distribución de tiempo dedicado"
                    isLoading={loadingHorasProyecto}
                  >
                    {horasPorProyecto && horasPorProyecto.length > 0 ? (
                      <GraficoBarras
                        datos={horasPorProyecto.map(proyecto => ({
                          nombre: proyecto.nombre,
                          valor: proyecto.valor,
                          color: proyecto.color || '#3B82F6'
                        }))}
                        titulo="Horas Trabajadas"
                        colorPrimario="#3B82F6"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <BarChart3Icon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <p>No hay datos de horas por proyecto</p>
                          <p className="text-sm mt-1">Ajusta los filtros o registra tiempo en proyectos</p>
                        </div>
                      </div>
                    )}
                  </ChartContainer>

                  {/* Gráfico de Horas Diarias */}
                  <ChartContainer
                    title="Productividad Diaria"
                    subtitle="Horas trabajadas por día"
                    isLoading={loadingHorasDiarias}
                  >
                    {horasDiarias && horasDiarias.length > 0 ? (
                      <GraficoLineas
                        datos={horasDiarias.map(dia => ({
                          fecha: dia.fecha,
                          valor: dia.valor
                        }))}
                        titulo="Horas Diarias"
                        colorPrimario="#10B981"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <TrendingUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                          <p>No hay datos de productividad diaria</p>
                          <p className="text-sm mt-1">Registra tiempo en tareas para ver la tendencia</p>
                        </div>
                      </div>
                    )}
                  </ChartContainer>
                </div>
              )}

              {/* Gráfico de Estado de Proyectos */}
              {estadisticasGenerales && (
                <div className="mt-12 mb-16">
                  <ChartContainer
                    title="Estado de Proyectos"
                    subtitle="Distribución por estado de avance"
                    isLoading={loadingStats}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors"
                          onClick={() => navigate('/projects')}
                          title="Haz clic para ver todos los proyectos"
                        >
                          <GraficoPie
                            data={[
                              {
                                nombre: 'Activos',
                                valor: estadisticasGenerales.proyectosActivos,
                                color: '#10B981'
                              },
                              {
                                nombre: 'Completados',
                                valor: estadisticasGenerales.proyectosCompletados,
                                color: '#8B5CF6'
                              },
                              {
                                nombre: 'Otros',
                                valor: Math.max(0, estadisticasGenerales.totalProyectos - estadisticasGenerales.proyectosActivos - estadisticasGenerales.proyectosCompletados),
                                color: '#6B7280'
                              }
                            ].filter(item => item.valor > 0)}
                            titulo="Proyectos por Estado"
                          />
                        </div>
                      </div>
                      <div>
                        <div 
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors"
                          onClick={() => navigate('/tasks')}
                          title="Haz clic para ver todas las tareas"
                        >
                          <GraficoPie
                            data={[
                              {
                                nombre: 'Completadas',
                                valor: estadisticasGenerales.tareasCompletadas,
                                color: '#10B981'
                              },
                              {
                                nombre: 'Pendientes',
                                valor: Math.max(0, estadisticasGenerales.totalTareas - estadisticasGenerales.tareasCompletadas),
                                color: '#F59E0B'
                              }
                            ].filter(item => item.valor > 0)}
                            titulo="Tareas por Estado"
                          />
                        </div>
                      </div>
                    </div>
                  </ChartContainer>
                </div>
              )}
            </>
          ) : (
            <div className="mt-8">
              <AnalyticsDashboard />
            </div>
          )}
        </div>

        {/* Sistema Profesional de Reportes - Aclimar */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 relative z-10">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <DollarSignIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                📊 Sistema de Reportes Profesional - Aclimar
              </h3>
              <div className="mt-3 text-sm text-blue-800 dark:text-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">✅ Métricas para Facturación:</h4>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Horas totales y semanales</li>
                      <li>• Progreso de proyectos</li>
                      <li>• Eficiencia y productividad</li>
                      <li>• Distribución de tiempo</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🎯 Datos en Tiempo Real:</h4>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Conectado con Supabase</li>
                      <li>• Gráficos interactivos</li>
                      <li>• Filtros avanzados</li>
                      <li>• Exportación PDF completa</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleGenerarReporteSemanal}
                  disabled={isLoading}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Generar Reporte Cliente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <ChevronRightIcon className="w-4 h-4 mr-2" />
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Componente de Notificaciones PDF */}
        <NotificacionComponent />
      </div>
    </div>
  );
};

export default Reportes;
