<<<<<<< HEAD
import React, { useState, useRef, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Scatter,
  ScatterChart,
} from 'recharts';
import {
  BarChart3Icon,
  TrendingUpIcon,
  PieChartIcon,
  ActivityIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
  MaximizeIcon,
  MinimizeIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import MobileTabs from './MobileTabs';

// Hooks
import { useIsMobile } from '@/hooks/useIsMobile';

// Types
interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}
=======
import React, { useState } from 'react';
import {
  BarChart3Icon,
  TrendingUpIcon,
  CheckCircleIcon
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboard';
import Button from '../common/Button';
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba

interface ChartConfig {
  id: string;
  title: string;
<<<<<<< HEAD
  type: 'bar' | 'line' | 'pie' | 'area' | 'composed' | 'scatter';
  data: ChartData[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  stacked?: boolean;
  horizontal?: boolean;
  animate?: boolean;
}

interface MobileChartsProps {
  charts: ChartConfig[];
  title?: string;
  subtitle?: string;
  showSummary?: boolean;
  showControls?: boolean;
  showExport?: boolean;
  className?: string;
}

const MobileCharts: React.FC<MobileChartsProps> = ({
  charts,
  title = 'Gráficos',
  subtitle,
  showSummary = true,
  showControls = true,
  showExport = true,
  className = ''
}) => {
  const { isMobile } = useIsMobile();
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const activeChart = charts[activeChartIndex];

  // Obtener icono según tipo de gráfico
  function getChartIcon(type: string) {
    switch (type) {
      case 'bar':
        return <BarChart3Icon className="w-4 h-4" />;
      case 'line':
        return <TrendingUpIcon className="w-4 h-4" />;
      case 'pie':
        return <PieChartIcon className="w-4 h-4" />;
      case 'area':
        return <ActivityIcon className="w-4 h-4" />;
      default:
        return <BarChart3Icon className="w-4 h-4" />;
    }
  }

  // Renderizar gráfico según tipo
  const renderChart = (chart: ChartConfig, index: number) => {
    const chartHeight = chart.height || (isFullscreen ? 400 : 300);
    const colors = chart.colors || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    const commonProps = {
      data: chart.data,
      height: chartHeight,
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    };

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              <Bar 
                dataKey="value" 
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
                animationDuration={chart.animate ? 1000 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                animationDuration={chart.animate ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={chart.data}
                cx="50%"
                cy="50%"
                outerRadius={chartHeight / 3}
                fill={colors[0]}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationDuration={chart.animate ? 1000 : 0}
              >
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                animationDuration={chart.animate ? 1000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ComposedChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[1]}
                strokeWidth={2}
                dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ScatterChart {...commonProps}>
              {chart.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="x" tick={{ fontSize: 12 }} />
              <YAxis dataKey="y" tick={{ fontSize: 12 }} />
              {chart.showTooltip && <Tooltip />}
              {chart.showLegend && <Legend />}
              <Scatter dataKey="y" fill={colors[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Tipo de gráfico no soportado</div>;
    }
  };

  // Calcular métricas de resumen
  const summaryMetrics = useMemo(() => {
    if (!charts.length) return [];
    
    return charts.map((chart, index) => {
      const total = chart.data.reduce((sum, item) => sum + (item.value || 0), 0);
      const average = total / chart.data.length;
      const max = Math.max(...chart.data.map(item => item.value || 0));
      const min = Math.min(...chart.data.map(item => item.value || 0));
      
      return {
        id: chart.id,
        title: chart.title,
        total,
        average: Math.round(average * 100) / 100,
        max,
        min,
        count: chart.data.length
      };
    });
  }, [charts]);

  // Controles de zoom y pan
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFullscreen) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Exportar gráfico
  const handleExport = () => {
    if (!chartContainerRef.current) return;
    
    // Aquí podrías implementar la exportación a PNG/SVG
    console.log('Exportando gráfico:', activeChart.title);
  };

  // Vista de resumen
  const renderSummary = () => {
    if (!showSummary || !summaryMetrics.length) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-blue-500" />
          Resumen de Métricas
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {summaryMetrics.map((metric) => (
            <div key={metric.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {metric.title}
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metric.total}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Promedio:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metric.average}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Máx:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{metric.max}</span>
                </div>
              </div>
            </div>
=======
  type: 'bar' | 'line' | 'pie';
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  icon: React.ReactNode;
}

interface MobileChartsProps {
  className?: string;
}

const MobileCharts: React.FC<MobileChartsProps> = ({ className = '' }) => {
  const [activeChart, setActiveChart] = useState<string>('projects');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Hooks para obtener datos
  const { stats } = useDashboardData();

  const dashboardStats = stats?.data;

  // Configuración de gráficos
  const charts: ChartConfig[] = [
    {
      id: 'projects',
      title: 'Proyectos por Estado',
      type: 'pie',
      data: [
        { label: 'Activos', value: dashboardStats?.active_projects || 0, color: '#10B981' },
        { label: 'Completados', value: (dashboardStats?.total_projects || 0) - (dashboardStats?.active_projects || 0), color: '#3B82F6' },
        { label: 'Planificación', value: 0, color: '#F59E0B' }
      ],
      icon: <BarChart3Icon className="w-5 h-5" />
    },
    {
      id: 'tasks',
      title: 'Tareas por Estado',
      type: 'bar',
      data: [
        { label: 'Pendientes', value: dashboardStats?.pending_tasks || 0, color: '#F59E0B' },
        { label: 'En Progreso', value: (dashboardStats?.total_tasks || 0) - (dashboardStats?.pending_tasks || 0) - (dashboardStats?.completed_tasks || 0), color: '#3B82F6' },
        { label: 'Completadas', value: dashboardStats?.completed_tasks || 0, color: '#10B981' },
        { label: 'Vencidas', value: dashboardStats?.overdue_tasks || 0, color: '#EF4444' }
      ],
      icon: <CheckCircleIcon className="w-5 h-5" />
    },
    {
      id: 'productivity',
      title: 'Productividad Semanal',
      type: 'line',
      data: [
        { label: 'Lun', value: 75 },
        { label: 'Mar', value: 82 },
        { label: 'Mié', value: 68 },
        { label: 'Jue', value: 90 },
        { label: 'Vie', value: 85 },
        { label: 'Sáb', value: 60 },
        { label: 'Dom', value: 45 }
      ],
      icon: <TrendingUpIcon className="w-5 h-5" />
    }
  ];

  // Renderizar gráfico de barras
  const renderBarChart = (data: ChartConfig['data']) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center space-x-3">
            <div className="w-16 text-sm text-gray-600">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || '#3B82F6'
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar gráfico de líneas
  const renderLineChart = (data: ChartConfig['data']) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const range = maxValue - minValue;
    
    return (
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 300 200">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = range > 0 ? 190 - ((item.value - minValue) / range) * 180 : 100;
              return `${x},${y}`;
            }).join(' ')}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 280 + 10;
            const y = range > 0 ? 190 - ((item.value - minValue) / range) * 180 : 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item) => (
            <span key={item.label}>{item.label}</span>
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
          ))}
        </div>
      </div>
    );
  };

<<<<<<< HEAD
  // Controles de gráfico
  const renderControls = () => {
    if (!showControls) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<ZoomInIcon className="w-4 h-4" />}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<ZoomOutIcon className="w-4 h-4" />}
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcwIcon className="w-4 h-4" />}
              onClick={handleReset}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={showLegend ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
              onClick={() => setShowLegend(!showLegend)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {showExport && (
              <Button
                variant="ghost"
                size="sm"
                icon={<DownloadIcon className="w-4 h-4" />}
                onClick={handleExport}
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
              onClick={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
        </div>
        
        {isFullscreen && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Zoom: {Math.round(zoomLevel * 100)}% • Arrastra para mover
            </p>
          </div>
        )}
=======
  // Renderizar gráfico de pastel
  const renderPieChart = (data: ChartConfig['data']) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: item.color || '#3B82F6' }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </div>
          </div>
        ))}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      </div>
    );
  };

<<<<<<< HEAD
  // Configuración de pestañas - MOVIDA AQUÍ DESPUÉS DE TODAS LAS FUNCIONES
  const chartTabs = charts.map((chart, index) => ({
    id: chart.id,
    label: chart.title,
    icon: getChartIcon(chart.type),
    content: renderChart(chart, index)
  }));

  if (!charts.length) {
    return (
      <div className="text-center py-12">
        <BarChart3Icon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay gráficos disponibles
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No se encontraron datos para mostrar en los gráficos
        </p>
      </div>
    );
  }
=======
  // Renderizar gráfico basado en el tipo
  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'bar':
        return renderBarChart(chart.data);
      case 'line':
        return renderLineChart(chart.data);
      case 'pie':
        return renderPieChart(chart.data);
      default:
        return null;
    }
  };
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
<<<<<<< HEAD
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              {activeChartIndex + 1} de {charts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Resumen */}
      {renderSummary()}

      {/* Controles */}
      {renderControls()}

      {/* Pestañas de gráficos */}
      <div className="px-4">
        <MobileTabs
          tabs={chartTabs}
          defaultActiveTab={activeChart.id}
          onTabChange={(tabId) => {
            const index = charts.findIndex(chart => chart.id === tabId);
            if (index !== -1) {
              setActiveChartIndex(index);
            }
          }}
          variant="pills"
        />
      </div>

      {/* Contenedor del gráfico */}
      <div className="px-4">
        <div 
          ref={chartContainerRef}
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${
            isFullscreen ? 'fixed inset-4 z-50 bg-white dark:bg-gray-800' : ''
          }`}
          style={{
            transform: isFullscreen ? `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)` : 'none',
            cursor: isFullscreen && isDragging ? 'grabbing' : isFullscreen ? 'grab' : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {activeChart.title}
            </h3>
          </div>
          
          {renderChart(activeChart, activeChartIndex)}
        </div>
      </div>

      {/* Navegación entre gráficos */}
      {charts.length > 1 && (
        <div className="px-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeftIcon className="w-4 h-4" />}
              onClick={() => setActiveChartIndex(prev => Math.max(0, prev - 1))}
              disabled={activeChartIndex === 0}
            />
            
            <div className="flex items-center space-x-1">
              {charts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === activeChartIndex 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRightIcon className="w-4 h-4" />}
              onClick={() => setActiveChartIndex(prev => Math.min(charts.length - 1, prev + 1))}
              disabled={activeChartIndex === charts.length - 1}
            />
          </div>
        </div>
      )}
=======
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Analíticas</h2>
        <div className="flex space-x-1">
          <Button
            variant={timeRange === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Semana
          </Button>
          <Button
            variant={timeRange === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Mes
          </Button>
          <Button
            variant={timeRange === 'year' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Año
          </Button>
        </div>
      </div>

      {/* Selector de gráficos */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeChart === chart.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {chart.icon}
            <span>{chart.title}</span>
          </button>
        ))}
      </div>

      {/* Gráfico activo */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        {charts.map((chart) => (
          <div key={chart.id} className={activeChart === chart.id ? 'block' : 'hidden'}>
            <h3 className="font-medium text-gray-900 mb-4">{chart.title}</h3>
            {renderChart(chart)}
          </div>
        ))}
      </div>
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
    </div>
  );
};

<<<<<<< HEAD
// Componente de gráfico de ejemplo para testing
export const MobileChartsExample: React.FC = () => {
  const sampleData = [
    { name: 'Ene', value: 400, x: 1, y: 400 },
    { name: 'Feb', value: 300, x: 2, y: 300 },
    { name: 'Mar', value: 600, x: 3, y: 600 },
    { name: 'Abr', value: 800, x: 4, y: 800 },
    { name: 'May', value: 500, x: 5, y: 500 },
    { name: 'Jun', value: 700, x: 6, y: 700 },
  ];

  const charts: ChartConfig[] = [
    {
      id: 'ventas',
      title: 'Ventas Mensuales',
      type: 'bar',
      data: sampleData,
      colors: ['#3B82F6'],
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    },
    {
      id: 'tendencias',
      title: 'Tendencias',
      type: 'line',
      data: sampleData,
      colors: ['#10B981'],
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    },
    {
      id: 'distribucion',
      title: 'Distribución',
      type: 'pie',
      data: sampleData.slice(0, 4),
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      height: 300,
      showLegend: true,
      showTooltip: true,
      animate: true
    },
    {
      id: 'area',
      title: 'Área de Progreso',
      type: 'area',
      data: sampleData,
      colors: ['#8B5CF6'],
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    }
  ];

  return (
    <MobileCharts
      charts={charts}
      title="Dashboard de Métricas"
      subtitle="Análisis de rendimiento y tendencias"
      showSummary={true}
      showControls={true}
      showExport={true}
    />
  );
};

=======
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
export default MobileCharts;
