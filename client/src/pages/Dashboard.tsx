import React from 'react';
import { CardSkeleton } from '@/components/common/Loading';
import Button from '@/components/common/Button';
import { 
  FolderIcon, 
  TrendingUpIcon,
  CheckSquareIcon,
  AlertTriangleIcon,
  PlusIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboard';
import { useProjects } from '@/hooks/useProjects';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileDashboard } from '@/components/mobile';
import { 
  StatsCard, 
  QuickActions, 
  TaskList, 
  ProjectList, 
  ProgressSummary 
} from '@/components/dashboard';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
  // Datos del dashboard
  const { stats, productivity, isLoading, isError } = useDashboardData();
  const insights: any[] = [];
  const { data: recentProjects, isLoading: projectsLoading } = useProjects({ limit: 4 });

  // Si es móvil, usar el componente móvil
  if (isMobile) {
    return <MobileDashboard />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !stats.data) {
    return <DashboardError />;
  }

  const dashboardStats = stats.data;
  const productivityData = productivity.data;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido de vuelta!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Aquí tienes un resumen de tu progreso y actividad reciente.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={<FolderIcon className="w-4 h-4" />}
            onClick={() => navigate('/projects')}
          >
            Ver Proyectos
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => navigate('/projects/new')}
          >
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Insights/Alerts */}
      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                insight.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
                insight.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {insight.type === 'error' && <div className="w-5 h-5 text-red-500">⚠️</div>}
                  {insight.type === 'warning' && <div className="w-5 h-5 text-yellow-500">⚠️</div>}
                  {insight.type === 'success' && <div className="w-5 h-5 text-green-500">✓</div>}
                  {insight.type === 'info' && <div className="w-5 h-5 text-blue-500">ℹ️</div>}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Proyectos"
          value={dashboardStats.total_projects || 0}
          icon={<FolderIcon className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/projects')}
          showLink={true}
          linkText="Ver proyectos"
        />
        <StatsCard
          title="Proyectos Activos"
          value={dashboardStats.active_projects || 0}
          icon={<TrendingUpIcon className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/projects?status=active')}
          showLink={true}
          linkText="Ver activos"
        />
        <StatsCard
          title="Tareas Completadas"
          value={dashboardStats.completed_tasks || 0}
          icon={<CheckSquareIcon className="w-5 h-5" />}
          color="purple"
          onClick={() => navigate('/tasks?status=completed')}
          showLink={true}
          linkText="Ver completadas"
        />
        <StatsCard
          title="Tareas Vencidas"
          value={dashboardStats.overdue_tasks || 0}
          icon={<AlertTriangleIcon className="w-5 h-5" />}
          color="red"
          onClick={() => navigate('/tasks?status=overdue')}
          showLink={true}
          linkText="Ver vencidas"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          {projectsLoading ? (
            <CardSkeleton count={2} />
          ) : (
            <ProjectList
              projects={recentProjects || []}
              title="Proyectos Recientes"
              maxItems={4}
              showViewAll={true}
              viewAllLink="/projects"
            />
          )}
        </div>

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Upcoming Tasks */}
          <TaskList
            tasks={dashboardStats.upcoming_tasks || []}
            title="Próximas Tareas"
            subtitle="Tareas que vencen pronto"
            maxItems={3}
            showViewAll={true}
            viewAllLink="/tasks"
          />

          {/* Progress Summary */}
          {productivityData && (
            <ProgressSummary
              data={{
                completion_rate: productivityData.completion_rate || 0,
                tasks_completed_today: productivityData.tasks_completed_today || 0,
                tasks_completed_this_week: productivityData.tasks_completed_this_week || 0,
                tasks_completed_this_month: productivityData.tasks_completed_this_month || 0,
                total_tasks: dashboardStats.total_tasks || 0,
                active_projects: dashboardStats.active_projects || 0,
                total_projects: dashboardStats.total_projects || 0
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Component
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="loading-skeleton h-8 w-64 rounded" />
        <div className="loading-skeleton h-4 w-96 rounded" />
      </div>
      <div className="flex space-x-3">
        <div className="loading-skeleton h-10 w-32 rounded" />
        <div className="loading-skeleton h-10 w-36 rounded" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card">
          <div className="loading-skeleton h-20 rounded" />
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton count={2} />
      </div>
      <div className="space-y-6">
        <CardSkeleton count={3} />
      </div>
    </div>
  </div>
);

// Error Component
const DashboardError: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-12 h-12 mx-auto mb-4 text-red-500 text-4xl">⚠️</div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar el dashboard
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Ha ocurrido un error al cargar los datos. Por favor, intenta de nuevo.
    </p>
    <Button
      variant="primary"
      onClick={() => window.location.reload()}
    >
      Recargar página
    </Button>
  </div>
);

export default Dashboard;