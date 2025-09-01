import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, ArrowRightIcon } from 'lucide-react';
import Button from '@/components/common/Button';

interface Task {
  id: string;
  title: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  project_name?: string;
}

interface TaskListProps {
  tasks: Task[];
  title?: string;
  subtitle?: string;
  maxItems?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title = "Próximas Tareas",
  subtitle = "Tareas que vencen pronto",
  maxItems = 3,
  showViewAll = true,
  viewAllLink = "/tasks",
  className = ""
}) => {
  const navigate = useNavigate();
  const priorityColors = {
    urgent: 'priority-urgent',
    high: 'priority-high',
    medium: 'priority-medium',
    low: 'priority-low'
  };

  const priorityLabels = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const displayedTasks = tasks.slice(0, maxItems);
  const remainingCount = tasks.length - maxItems;

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title text-lg">{title}</h3>
        {subtitle && <p className="card-description">{subtitle}</p>}
      </div>
      <div className="card-content">
        {displayedTasks.length > 0 ? (
          <div className="space-y-3">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                onClick={() => navigate(`/tasks/${task.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/tasks/${task.id}`);
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vence: {formatDate(task.due_date)}
                    </p>
                    {task.project_name && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {task.project_name}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0 ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Y {remainingCount} más...
              </p>
            )}
            
            {showViewAll && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={<ArrowRightIcon className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => navigate(viewAllLink)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Ver todas las próximas tareas
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay tareas próximas a vencer</p>
            {showViewAll && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => navigate(viewAllLink)}
              >
                Ver próximas tareas
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
