import React from 'react';
import { 
  CheckSquareIcon,
  AlertTriangleIcon
} from 'lucide-react';

// Types
import { Project, Task } from '@/types';
import type { ProjectStats } from '@/services/projectService';

interface ProjectSummaryProps {
  project: Project;
  stats?: ProjectStats;
  tasks?: Task[];
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ project, stats, tasks }) => {
  const recentTasks = tasks?.slice(0, 5) || [];
  const overdueTasks = tasks?.filter(task => 
    task.due_date && new Date(task.due_date) < new Date()
  ) || [];

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalles del Proyecto
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {project.status === 'active' ? 'Activo' :
                 project.status === 'completed' ? 'Completado' :
                 project.status === 'on_hold' ? 'En pausa' : 'Planificación'}
              </p>
            </div>
            
            {project.start_date && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fecha de Inicio
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {project.end_date && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Fecha de Finalización
                </label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(project.end_date).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Creado
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estadísticas Rápidas
          </h3>
          
          {stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Progreso</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.completion_percentage}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.completion_percentage}%`,
                    backgroundColor: project.color 
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_tasks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tareas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.completed_tasks}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No hay estadísticas disponibles
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Tareas Recientes
        </h3>
        
        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckSquareIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {task.title}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                }`}>
                  {task.status === 'done' ? 'Completada' :
                   task.status === 'in_progress' ? 'En progreso' : 'Por hacer'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No hay tareas recientes
          </p>
        )}
      </div>

      {/* Alerts */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangleIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-red-900 dark:text-red-100">
              Tareas Vencidas
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-1">
            Tienes {overdueTasks.length} tarea(s) vencida(s) que requieren atención.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectSummary; 