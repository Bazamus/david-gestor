// ======================================
// DASHBOARD DE ANALYTICS AVANZADO
// Comparativas, tendencias y alertas para Aclimar
// ======================================

import React, { useState, useEffect } from 'react';
import { 
  TrendingUpIcon, 
  AlertTriangleIcon,
  BarChart3Icon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon
} from 'lucide-react';

// Servicios
import {
  obtenerComparativaPeriodos,
  obtenerTendenciasProductividad,
  obtenerMetricasAvanzadas,
  obtenerSemanasDisponibles,
  generarAlertasInteligentes,
  formatearPorcentaje,
  ComparativaPeriodos,
  TendenciaProductividad,
  MetricasAvanzadas,
  AlertasInteligentes
} from '@/services/analyticsService';

// Utilidades
import { obtenerMesActual } from '@/services/reporteService';

// ======================================
// INTERFACES
// ======================================

interface AnalyticsDashboardProps {
  className?: string;
}

interface SemanaSeleccionada {
  inicio: string;
  fin: string;
  nombre: string;
}

// ======================================
// COMPONENTE PRINCIPAL
// ======================================

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  // Estados
  const [comparativa, setComparativa] = useState<ComparativaPeriodos | null>(null);
  const [tendencias, setTendencias] = useState<TendenciaProductividad | null>(null);
  const [metricas, setMetricas] = useState<MetricasAvanzadas | null>(null);
  const [alertas, setAlertas] = useState<AlertasInteligentes | null>(null);
  const [semanasDisponibles, setSemanasDisponibles] = useState<any>(null);
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<SemanaSeleccionada | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ======================================
  // EFECTOS
  // ======================================

  useEffect(() => {
    cargarSemanasDisponibles();
  }, []);

  useEffect(() => {
    if (semanasDisponibles) {
      // Establecer semana actual por defecto
      setSemanaSeleccionada({
        inicio: semanasDisponibles.semanaActual.inicio,
        fin: semanasDisponibles.semanaActual.fin,
        nombre: semanasDisponibles.semanaActual.nombre
      });
    }
  }, [semanasDisponibles]);

  useEffect(() => {
    if (semanaSeleccionada) {
      cargarDatosAnalytics();
    }
  }, [semanaSeleccionada]);

  // ======================================
  // FUNCIONES
  // ======================================

  const cargarSemanasDisponibles = async () => {
    try {
      const data = await obtenerSemanasDisponibles();
      setSemanasDisponibles(data);
    } catch (err) {
      console.error('Error cargando semanas disponibles:', err);
      setError('Error al cargar las semanas disponibles');
    }
  };

  const cargarDatosAnalytics = async () => {
    if (!semanaSeleccionada) return;

    try {
      setIsLoading(true);
      setError(null);

      // Cargar métricas avanzadas con la semana seleccionada
      const metricasData = await obtenerMetricasAvanzadas(
        semanaSeleccionada.inicio,
        semanaSeleccionada.fin
      );

      // Cargar otros datos (comparativa y tendencias) para la semana actual
      const rangoActual = obtenerMesActual();
      const fechaInicioAnterior = new Date(rangoActual.inicio);
      fechaInicioAnterior.setMonth(fechaInicioAnterior.getMonth() - 1);
      const fechaFinAnterior = new Date(rangoActual.fin);
      fechaFinAnterior.setMonth(fechaFinAnterior.getMonth() - 1);

      const [comparativaData, tendenciasData, alertasData] = await Promise.all([
        obtenerComparativaPeriodos(
          rangoActual.inicio,
          rangoActual.fin,
          fechaInicioAnterior.toISOString().split('T')[0],
          fechaFinAnterior.toISOString().split('T')[0]
        ),
        obtenerTendenciasProductividad(rangoActual.inicio, rangoActual.fin),
        generarAlertasInteligentes()
      ]);

      setComparativa(comparativaData);
      setTendencias(tendenciasData);
      setMetricas(metricasData);
      setAlertas(alertasData);

    } catch (err) {
      console.error('Error cargando datos del analytics:', err);
      setError('Error al cargar los datos de analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const cambiarSemana = (direccion: 'anterior' | 'siguiente' | 'actual') => {
    if (!semanasDisponibles) return;

    let nuevaSemana: SemanaSeleccionada;

    switch (direccion) {
      case 'anterior':
        nuevaSemana = {
          inicio: semanasDisponibles.semanaAnterior.inicio,
          fin: semanasDisponibles.semanaAnterior.fin,
          nombre: 'Semana Anterior'
        };
        break;
      case 'siguiente':
        nuevaSemana = {
          inicio: semanasDisponibles.semanaSiguiente.inicio,
          fin: semanasDisponibles.semanaSiguiente.fin,
          nombre: 'Semana Siguiente'
        };
        break;
      case 'actual':
        nuevaSemana = {
          inicio: semanasDisponibles.semanaActual.inicio,
          fin: semanasDisponibles.semanaActual.fin,
          nombre: semanasDisponibles.semanaActual.nombre
        };
        break;
      default:
        return;
    }

    setSemanaSeleccionada(nuevaSemana);
  };

  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // ======================================
  // COMPONENTES DE UI
  // ======================================

  const TarjetaComparativa: React.FC<{
    titulo: string;
    valorActual: number;
    valorAnterior: number;
    variacion: { valor: number; porcentaje: number; tendencia: 'up' | 'down' | 'stable' };
    unidad?: string;
  }> = ({ titulo, valorActual, valorAnterior, variacion, unidad = '' }) => {
    const IconoTendencia = variacion.tendencia === 'up' ? ArrowUpIcon : 
                          variacion.tendencia === 'down' ? ArrowDownIcon : MinusIcon;
    
    const colorTendencia = variacion.tendencia === 'up' ? 'text-green-600 dark:text-green-400' : 
                          variacion.tendencia === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{titulo}</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {valorActual.toFixed(1)}{unidad}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Anterior: {valorAnterior.toFixed(1)}{unidad}
            </p>
          </div>
          <div className={`flex items-center ${colorTendencia}`}>
            <IconoTendencia className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">
              {formatearPorcentaje(variacion.porcentaje)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const TarjetaAlerta: React.FC<{
    alerta: AlertasInteligentes['alertas'][0];
  }> = ({ alerta }) => {
    const colorSeveridad = {
      baja: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
      media: 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
      alta: 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20',
      critica: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
    };

    const iconoSeveridad = {
      baja: 'text-blue-600 dark:text-blue-400',
      media: 'text-yellow-600 dark:text-yellow-400',
      alta: 'text-orange-600 dark:text-orange-400',
      critica: 'text-red-600 dark:text-red-400'
    };

    return (
      <div className={`rounded-lg border p-4 ${colorSeveridad[alerta.severidad]}`}>
        <div className="flex items-start">
          <AlertTriangleIcon className={`w-5 h-5 mr-3 mt-0.5 ${iconoSeveridad[alerta.severidad]}`} />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {alerta.titulo}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {alerta.descripcion}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              💡 {alerta.recomendacion}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const SelectorSemana: React.FC = () => {
    if (!semanasDisponibles || !semanaSeleccionada) return null;

    const esSemanaActual = semanaSeleccionada.inicio === semanasDisponibles.semanaActual.inicio;
    const esSemanaAnterior = semanaSeleccionada.inicio === semanasDisponibles.semanaAnterior.inicio;
    const esSemanaSiguiente = semanaSeleccionada.inicio === semanasDisponibles.semanaSiguiente.inicio;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productividad por Día de la Semana
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarSemana('anterior')}
              disabled={esSemanaAnterior}
              className={`p-2 rounded-lg transition-colors ${
                esSemanaAnterior 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            
            <div className="text-center min-w-[200px]">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {semanaSeleccionada.nombre}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatearFecha(semanaSeleccionada.inicio)} - {formatearFecha(semanaSeleccionada.fin)}
              </div>
            </div>
            
            <button
              onClick={() => cambiarSemana('siguiente')}
              disabled={esSemanaSiguiente}
              className={`p-2 rounded-lg transition-colors ${
                esSemanaSiguiente 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => cambiarSemana('actual')}
            disabled={esSemanaActual}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              esSemanaActual
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Hoy
          </button>
        </div>
        
        {/* Información de la semana */}
        {metricas && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {metricas.semanaConsultada?.totalHoras || 0}h
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Total horas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <BarChart3Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-sm font-medium text-green-900 dark:text-green-100">
                  {metricas.semanaConsultada?.totalTareas || 0}
                </div>
                <div className="text-xs text-green-700 dark:text-green-300">Tareas completadas</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <TrendingUpIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  {metricas.semanaConsultada?.eficienciaPromedio || 0}%
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Eficiencia promedio</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ======================================
  // RENDER
  // ======================================

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangleIcon className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error al cargar Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={cargarDatosAnalytics}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Avanzado</h2>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-2" />
          Comparativa mensual
        </div>
      </div>

      {/* Comparativas de KPIs */}
      {comparativa && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Comparativa de Rendimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TarjetaComparativa
              titulo="Proyectos Activos"
              valorActual={comparativa.periodoActual.kpis.proyectosActivos}
              valorAnterior={comparativa.periodoAnterior.kpis.proyectosActivos}
              variacion={comparativa.variaciones.proyectosActivos}
            />
            <TarjetaComparativa
              titulo="Tareas Completadas"
              valorActual={comparativa.periodoActual.kpis.tareasCompletadas}
              valorAnterior={comparativa.periodoAnterior.kpis.tareasCompletadas}
              variacion={comparativa.variaciones.tareasCompletadas}
            />
            <TarjetaComparativa
              titulo="Horas Trabajadas"
              valorActual={comparativa.periodoActual.kpis.horasTrabajadas}
              valorAnterior={comparativa.periodoAnterior.kpis.horasTrabajadas}
              variacion={comparativa.variaciones.horasTrabajadas}
              unidad="h"
            />
            <TarjetaComparativa
              titulo="Eficiencia"
              valorActual={comparativa.periodoActual.kpis.eficiencia}
              valorAnterior={comparativa.periodoAnterior.kpis.eficiencia}
              variacion={comparativa.variaciones.eficiencia}
              unidad="%"
            />
          </div>
        </div>
      )}

      {/* Tendencias y Predicciones */}
      {tendencias && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tendencias y Predicciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUpIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Horas Próxima Semana</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tendencias.predicciones.horasProximaSemana.toFixed(1)}h
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tendencia: {tendencias.tendencias.horasTrabajadasTendencia}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tareas Próxima Semana</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tendencias.predicciones.tareasProximaSemana.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tendencia: {tendencias.tendencias.tareasCompletadasTendencia}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUpIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eficiencia Próxima Semana</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tendencias.predicciones.eficienciaProximaSemana.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tendencia: {tendencias.tendencias.eficienciaTendencia}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Semana y Productividad por Día */}
      <SelectorSemana />

      {/* Productividad por Día de la Semana */}
      {metricas && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {metricas.productividadPorDiaSemana.map((dia) => (
              <div key={dia.diaSemana} className="text-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {dia.diaSemana}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {dia.horasPromedio.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p>{dia.tareasPromedio} tareas</p>
                    <p className={`font-medium ${dia.eficienciaPromedio >= 80 ? 'text-green-600 dark:text-green-400' : dia.eficienciaPromedio >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {dia.eficienciaPromedio}% eficiencia
                    </p>
                  </div>
                  {/* Barra de progreso de eficiencia */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        dia.eficienciaPromedio >= 80 ? 'bg-green-500 dark:bg-green-400' : 
                        dia.eficienciaPromedio >= 60 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'
                      }`}
                      style={{ width: `${Math.min(dia.eficienciaPromedio, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            * Eficiencia calculada basada en 8 horas de trabajo diario
          </div>
        </div>
      )}

      {/* Alertas Inteligentes */}
      {alertas && alertas.alertas.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alertas Inteligentes
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-red-600 dark:text-red-400">
                {alertas.resumen.alertasCriticas} críticas
              </span>
              <span className="text-yellow-600 dark:text-yellow-400">
                {alertas.resumen.alertasMedias} medias
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {alertas.resumen.alertasBajas} bajas
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {alertas.alertas.map((alerta) => (
              <TarjetaAlerta key={alerta.id} alerta={alerta} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
