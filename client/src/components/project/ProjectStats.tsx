import React from 'react';
import { 
  ClockIcon,
  CheckSquareIcon,
  AlertTriangleIcon
} from 'lucide-react';

// Types
import { Project, Task } from '@/types';
import type { ProjectStats } from '@/services/projectService';

interface ProjectStatsProps {
  project: Project;
  stats?: ProjectStats;
  tasks?: Task[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ project, stats, tasks }) => {
  // const completedTasks = tasks?.filter(task => task.status === 'done') || [];
  // const pendingTasks = tasks?.filter(task => task.status !== 'done') || [];
  const overdueTasks = tasks?.filter(task => 
    task.due_date && new Date(task.due_date) < new Date()
  ) || [];

  const getPriorityStats = () => {
    if (!tasks) return {};
    
    return tasks.reduce((acc, task) => {
      const priority = task.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const priorityStats = getPriorityStats();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckSquareIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tareas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_tasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckSquareIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completadas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completed_tasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pendientes
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.pending_tasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Vencidas
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overdueTasks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Progreso del Proyecto
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Progreso General</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.completion_percentage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.completion_percentage}%`,
                  backgroundColor: project.color 
                }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_tasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed_tasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending_tasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Distribution */}
      {Object.keys(priorityStats).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución por Prioridad
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(priorityStats).map(([priority, count]) => (
              <div key={priority} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {count}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {priority === 'urgent' ? 'Urgente' :
                   priority === 'high' ? 'Alta' :
                   priority === 'medium' ? 'Media' : 'Baja'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {tasks && tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actividad Reciente
          </h3>
          
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckSquareIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {task.priority === 'urgent' ? 'Urgente' :
                     task.priority === 'high' ? 'Alta' :
                     task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {task.status === 'done' ? 'Completada' :
                     task.status === 'in_progress' ? 'En progreso' : 'Por hacer'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStats; 