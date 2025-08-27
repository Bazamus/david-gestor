import React from 'react';
import { TrendingUpIcon, CalendarIcon, ClockIcon } from 'lucide-react';

interface ProgressData {
  completion_rate: number;
  tasks_completed_today: number;
  tasks_completed_this_week: number;
  tasks_completed_this_month?: number;
  total_tasks: number;
  active_projects: number;
  total_projects: number;
}

interface ProgressSummaryProps {
  data: ProgressData;
  title?: string;
  className?: string;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  data,
  title = "Resumen de Progreso",
  className = ""
}) => {
  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (rate >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCompletionIcon = (rate: number) => {
    if (rate >= 80) return '🎉';
    if (rate >= 60) return '📈';
    if (rate >= 40) return '📊';
    return '📉';
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title text-lg">{title}</h3>
      </div>
      <div className="card-content space-y-4">
        {/* Completion Rate */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">{getCompletionIcon(data.completion_rate)}</span>
            <div className={`text-3xl font-bold ${getCompletionColor(data.completion_rate)}`}>
              {data.completion_rate}%
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tasa de completitud
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              data.completion_rate >= 80 ? 'bg-green-500' :
              data.completion_rate >= 60 ? 'bg-blue-500' :
              data.completion_rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${data.completion_rate}%` }}
          />
        </div>
        
        {/* Task Statistics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Hoy</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.tasks_completed_today} tareas
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Esta semana</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.tasks_completed_this_week} tareas
            </span>
          </div>
          
          {data.tasks_completed_this_month !== undefined && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Este mes</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.tasks_completed_this_month} tareas
              </span>
            </div>
          )}
        </div>
        
        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {data.total_tasks}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Tareas
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {data.active_projects}/{data.total_projects}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Proyectos Activos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;
