// ======================================
// PÁGINA DE REPORTES CON DATOS DEMO
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3Icon,
  TrendingUpIcon,
  ClockIcon,
  CalendarIcon,
  FileTextIcon,
  DownloadIcon,
  FilterIcon,
  RefreshCwIcon,
  EyeIcon,
  // SettingsIcon and PlusIcon removed as they're not used
  ChevronRightIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { StatsCard } from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import GraficoBarras from '@/components/charts/GraficoBarras';
import GraficoLineas from '@/components/charts/GraficoLineas';
import GraficoPie from '@/components/charts/GraficoPie';

// ======================================
// DATOS DEMO
// ======================================

const datosDemo = {
  estadisticasGenerales: {
    proyectosActivos: 3,
    horasEstaSemana: 42,
    tareasCompletadas: 47,
    eficienciaPromedio: 87
  },
  horasPorProyecto: [
    { nombre: 'Desarrollo Web Corporativo', valor: 45, color: '#2563EB' },
    { nombre: 'App Móvil iOS', valor: 35, color: '#059669' },
    { nombre: 'Sistema de Inventario', valor: 28, color: '#EA580C' }
  ],
  horasDiarias: [
    { fecha: '2025-01-13', valor: 8 },
    { fecha: '2025-01-14', valor: 7 },
    { fecha: '2025-01-15', valor: 9 },
    { fecha: '2025-01-16', valor: 8 },
    { fecha: '2025-01-17', valor: 6 },
    { fecha: '2025-01-18', valor: 4 }
  ],
  distribucionTareas: [
    { nombre: 'Completadas', valor: 47, color: '#059669' },
    { nombre: 'En Progreso', valor: 12, color: '#2563EB' },
    { nombre: 'Por Hacer', valor: 23, color: '#6B7280' },
    { nombre: 'Bloqueadas', valor: 3, color: '#EF4444' }
  ]
};

const ReportesDemo: React.FC = () => {
  const navigate = useNavigate();
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<'semana' | 'mes'>('semana');
  const [isGenerandoPDF, setIsGenerandoPDF] = useState(false);
  
  // Estados locales
  // configuracion and setConfiguracion removed as they're not used
  const [/* configuracion, setConfiguracion */] = useState({
    titulo: 'Reporte Semanal de Productividad',
    periodo: {
      fechaInicio: '',
      fechaFin: '',
      tipo: 'semanal'
    },
    secciones: {
      resumenEjecutivo: true,
      kpisPrincipales: true,
      detalleProyectos: true,
      analisisHoras: true,
      graficosProductividad: true,
      tablasDetalladas: false
    },
    formato: {
      incluirGraficos: true,
      incluirTablas: true,
      incluirLogotipos: false,
      tema: 'aclimar'
    },
    destinatario: {
      empresa: 'Aclimar'
    }
  });

  // Handlers
  const handleGenerarReporteSemanal = async () => {
    setIsGenerandoPDF(true);
    // Simular generación de PDF
    setTimeout(() => {
      setIsGenerandoPDF(false);
      alert('Reporte semanal generado correctamente');
    }, 2000);
  };

  const handleGenerarReporteMensual = async () => {
    setIsGenerandoPDF(true);
    // Simular generación de PDF
    setTimeout(() => {
      setIsGenerandoPDF(false);
      alert('Reporte mensual generado correctamente');
    }, 2000);
  };

  const aplicarFiltro = (filtro: 'semana' | 'mes') => {
    setFiltroSeleccionado(filtro);
    // Aquí se actualizarían los datos según el filtro
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <PageHeader
        title="Reportes de Productividad"
        subtitle="Análisis detallado de proyectos y horas trabajadas"
        icon={BarChart3Icon}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerarReporteSemanal}
              disabled={isGenerandoPDF}
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              {isGenerandoPDF ? 'Generando...' : 'Reporte Semanal'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerarReporteMensual}
              disabled={isGenerandoPDF}
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              {isGenerandoPDF ? 'Generando...' : 'Reporte Mensual'}
            </Button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Reporte</h3>
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filtros activos</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant={filtroSeleccionado === 'semana' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => aplicarFiltro('semana')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Esta Semana
          </Button>
          <Button
            variant={filtroSeleccionado === 'mes' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => aplicarFiltro('mes')}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Este Mes
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Proyectos Activos"
          value={datosDemo.estadisticasGenerales.proyectosActivos}
          icon={<BarChart3Icon className="w-5 h-5" />}
          color="blue"
        />
        <StatsCard
          title="Horas Esta Semana"
          value={datosDemo.estadisticasGenerales.horasEstaSemana}
          icon={<ClockIcon className="w-5 h-5" />}
          color="green"
        />
        <StatsCard
          title="Tareas Completadas"
          value={datosDemo.estadisticasGenerales.tareasCompletadas}
          icon={<FileTextIcon className="w-5 h-5" />}
          color="purple"
        />
        <StatsCard
          title="Eficiencia Promedio"
          value={`${datosDemo.estadisticasGenerales.eficienciaPromedio}%`}
          icon={<TrendingUpIcon className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Horas por Proyecto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Horas por Proyecto</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="w-4 h-4" />
            </Button>
          </div>
                      <GraficoBarras
              datos={datosDemo.horasPorProyecto}
              // dataKey="valor"
              // nameKey="nombre"
              // colorKey="color"
              height={300}
            />
        </div>

        {/* Distribución de Tareas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Tareas</h3>
            <Button variant="ghost" size="sm">
              <EyeIcon className="w-4 h-4" />
            </Button>
          </div>
          <GraficoPie
            data={datosDemo.distribucionTareas}
            dataKey="valor"
            nameKey="nombre"
            colorKey="color"
            height={300}
          />
        </div>
      </div>

      {/* Gráfico de Líneas - Horas Diarias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Horas Trabajadas por Día</h3>
          <Button variant="ghost" size="sm">
            <EyeIcon className="w-4 h-4" />
          </Button>
        </div>
                  <GraficoLineas
            datos={datosDemo.horasDiarias}
            // dataKey="valor"
            // nameKey="fecha"
            height={300}
          />
      </div>

      {/* Información Adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BarChart3Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistema de Reportes Profesional
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Este dashboard muestra datos de demostración. En producción, se conectará 
                automáticamente con tus datos reales de Supabase para generar reportes 
                profesionales para Aclimar.
              </p>
            </div>
            <div className="mt-4">
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
    </div>
  );
};

export default ReportesDemo;
