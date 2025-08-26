import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangleIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  UserIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
// PageHeader import removed as it's not used
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Hooks
import { useOverdueTasks } from '@/hooks/useTasks';

// Types
import { TaskStatus, TaskPriority } from '@/types';

const OverdueTasks: React.FC = () => {
  const navigate = useNavigate();
  const { data: tasks, isLoading, isError } = useOverdueTasks();

  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          label: 'Por hacer',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
      case TaskStatus.IN_PROGRESS:
        return {
          label: 'En progreso',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case TaskStatus.DONE:
        return {
          label: 'Completado',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
      case TaskStatus.NADA:
        return {
          label: 'Nada',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
      case TaskStatus.EN_PROGRESO:
        return {
          label: 'En progreso',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        };
      case TaskStatus.COMPLETADA:
        return {
          label: 'Completada',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        };
    }
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return {
          label: 'Baja',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
      case TaskPriority.MEDIUM:
        return {
          label: 'Media',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case TaskPriority.HIGH:
        return {
          label: 'Alta',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        };
      case TaskPriority.URGENT:
        return {
          label: 'Urgente',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
      default:
        return {
          label: 'Media',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDaysOverdue = (dueDate?: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Error</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudieron cargar las tareas vencidas</p>
        <Button onClick={() => navigate('/dashboard')} variant="primary">
          Volver al Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tareas Vencidas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tareas que han superado su fecha de vencimiento
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <AlertTriangleIcon className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {tasks?.length || 0} tareas vencidas
          </span>
        </div>
      </div>

      {/* Content */}
      {tasks && tasks.length > 0 ? (
        <div className="grid gap-4">
          {tasks.map((task) => {
            const statusInfo = getStatusInfo(task.status);
            const priorityInfo = getPriorityInfo(task.priority);
            const daysOverdue = calculateDaysOverdue(task.due_date);
            
            return (
              <Card
                key={task.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Vencía: {formatDate(task.due_date)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {daysOverdue} día{daysOverdue !== 1 ? 's' : ''} de retraso
                        </span>
                      </div>
                      
                      {task.asignado_a && (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="w-4 h-4" />
                          <span>{task.asignado_a}</span>
                        </div>
                      )}
                    </div>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        <TagIcon className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tasks/${task.id}/edit`);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertTriangleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            ¡Excelente trabajo!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tienes tareas vencidas. Mantén este ritmo.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/tasks')}
          >
            Ver todas las tareas
          </Button>
        </div>
      )}
    </div>
  );
};

export default OverdueTasks;
