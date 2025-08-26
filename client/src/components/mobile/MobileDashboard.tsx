import React, { useState } from 'react';
<<<<<<< HEAD
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  FolderOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import MobileTabs from './MobileTabs';
import Button from '../common/Button';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalHours: number;
  productivity: number;
}

const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  
  // Datos del dashboard
  const { stats, productivity, isLoading, isError } = useDashboardData();
  const { data: recentProjects, isLoading: projectsLoading } = useProjects({ limit: 3 });

  if (isLoading) {
    return <MobileDashboardSkeleton />;
  }

  if (isError || !stats.data) {
    return <MobileDashboardError />;
  }

  const dashboardStats = stats.data;
  const productivityData = productivity.data;

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Tabs para las métricas principales
  const metricTabs = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          {/* Cards de métricas principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.activeProjects || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
=======
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  BarChart3Icon
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import Button from '../common/Button';

interface MobileDashboardProps {
  className?: string;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Hooks para obtener datos
  const { stats } = useDashboardData();
  const { data: recentProjects, isLoading: projectsLoading } = useProjects({ limit: 5 });

  const dashboardStats = stats?.data;

  // Tabs disponibles
  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3Icon className="w-4 h-4" /> },
    { id: 'projects', label: 'Proyectos', icon: <FolderIcon className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tareas', icon: <CheckCircleIcon className="w-4 h-4" /> }
  ];

  // Renderizar contenido basado en el tab activo
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Proyectos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.active_projects || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tareas Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats?.completed_tasks || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Horas Totales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      0h
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Productividad</p>
                    <p className="text-2xl font-bold text-gray-900">
                      0%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUpIcon className="w-5 h-5 text-purple-600" />
                  </div>
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
                </div>
              </div>
            </div>

<<<<<<< HEAD
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tareas Completadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.completedTasks || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Horas Totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.totalHours || 0}h
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Productividad</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.productivity || 0}%
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: <AlertTriangle className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          {/* Tareas vencidas */}
          {dashboardStats.overdueTasks > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Tareas Vencidas
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Tienes {dashboardStats.overdueTasks} tareas vencidas que requieren atención.
                  </p>
                  <button
                    onClick={() => navigate('/tasks?filter=overdue')}
                    className="mt-2 text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
                  >
                    Ver tareas vencidas →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tareas pendientes */}
          {dashboardStats.pendingTasks > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Tareas Pendientes
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {dashboardStats.pendingTasks} tareas están pendientes de completar.
                  </p>
                  <button
                    onClick={() => navigate('/tasks?filter=pending')}
                    className="mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
                  >
                    Ver tareas pendientes →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ¡Bienvenido de vuelta!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Resumen de tu progreso y actividad reciente.
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          icon={<FolderOpen className="w-4 h-4" />}
          onClick={() => navigate('/projects')}
          className="flex-1"
        >
          Ver Proyectos
        </Button>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/projects/new')}
          className="flex-1"
        >
          Nuevo Proyecto
        </Button>
      </div>

      {/* Métricas principales con tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <MobileTabs
          tabs={metricTabs}
          defaultActiveTab="overview"
          variant="pills"
        />
      </div>

      {/* Secciones colapsables */}
      <div className="space-y-4">
        {/* Proyectos recientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('recent-projects')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Proyectos Recientes
            </h3>
            {expandedSections.has('recent-projects') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('recent-projects') && (
            <div className="px-4 pb-4">
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentProjects?.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {project.status === 'active' ? 'Activo' :
                           project.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No hay proyectos recientes
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection('recent-activity')}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Actividad Reciente
            </h3>
            {expandedSections.has('recent-activity') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('recent-activity') && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Tarea "Implementar login" completada
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hace 2 horas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Proyecto "Dashboard móvil" creado
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hace 1 día
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      Tiempo registrado: 4 horas
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hace 2 días
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
=======
            {/* Alertas */}
            <div className="space-y-3">
              {dashboardStats && dashboardStats.overdue_tasks > 0 && (
                <div className="p-4 border-l-4 border-l-red-500 bg-red-50">
                  <div className="flex items-center space-x-3">
                    <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Tareas Vencidas</h4>
                      <p className="text-sm text-red-600">
                        Tienes {dashboardStats.overdue_tasks} tareas vencidas que requieren atención.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {dashboardStats && dashboardStats.pending_tasks > 0 && (
                <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-800">Tareas Pendientes</h4>
                      <p className="text-sm text-yellow-600">
                        {dashboardStats.pending_tasks} tareas están pendientes de completar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-3">Acciones Rápidas</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/projects/new')}
                  className="w-full"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nuevo Proyecto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/tasks/new')}
                  className="w-full"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {projectsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentProjects?.length === 0 ? (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No hay proyectos</h3>
                  <p className="text-gray-500 mb-4">
                    Comienza creando tu primer proyecto.
                  </p>
                  <Button onClick={() => navigate('/projects/new')}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Crear Proyecto
                  </Button>
                </div>
              ) : (
                recentProjects?.map((project) => (
                  <div key={project.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status === 'active' ? 'Activo' :
                             project.status === 'completed' ? 'Completado' : 'Planificación'}
                          </span>
                          <span className="text-xs text-gray-500">
                            0 tareas
                          </span>
                        </div>
                      </div>
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
              <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Vista de Tareas</h3>
              <p className="text-gray-500 mb-4">
                Aquí podrás ver todas tus tareas.
              </p>
              <Button onClick={() => navigate('/tasks')}>
                Ver Tareas
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      <div className="min-h-[400px]">
        {renderTabContent()}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      </div>
    </div>
  );
};

<<<<<<< HEAD
// Componentes de skeleton y error
const MobileDashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
    </div>
    
    <div className="flex space-x-3">
      <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  </div>
);

const MobileDashboardError: React.FC = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar el dashboard
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      No se pudieron cargar los datos del dashboard. Intenta recargar la página.
    </p>
    <Button
      variant="primary"
      onClick={() => window.location.reload()}
    >
      Recargar página
    </Button>
  </div>
);

=======
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
export default MobileDashboard;
