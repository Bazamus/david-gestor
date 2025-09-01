import React, { useState } from 'react';
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
import { ProjectStatus } from '@/types';


const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  
  // Datos del dashboard
  const { stats, isLoading, isError } = useDashboardData();
  const { data: recentProjects, isLoading: projectsLoading } = useProjects({ limit: 3 });

  if (isLoading) {
    return <MobileDashboardSkeleton />;
  }

  if (isError || !stats?.data) {
    return <MobileDashboardError />;
  }

  const dashboardStats = stats.data;

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
                    {dashboardStats.active_projects || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tareas Completadas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats.completed_tasks || 0}
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
                    {dashboardStats.productivity_stats.total_actual_hours?.toFixed(1) || 0}h
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
                    {dashboardStats.productivity_stats.productivity_percentage?.toFixed(1) || 0}%
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
          {dashboardStats.overdue_tasks > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Tareas Vencidas
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Tienes {dashboardStats.overdue_tasks} tareas vencidas que requieren atención.
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
          {dashboardStats.pending_tasks > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Tareas Pendientes
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    {dashboardStats.pending_tasks} tareas están pendientes de completar.
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
              ) : recentProjects && recentProjects.length > 0 ? (
                <div className="space-y-3">
                  {recentProjects?.map((project) => (
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
                          project.status === ProjectStatus.ACTIVE ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          project.status === ProjectStatus.COMPLETED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {project.status === ProjectStatus.ACTIVE ? 'Activo' :
                           project.status === ProjectStatus.COMPLETED ? 'Completado' : 'Pendiente'}
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
      </div>
    </div>
  );
};

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

export default MobileDashboard;
