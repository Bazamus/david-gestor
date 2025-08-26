import React from 'react';
import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Components
import Button from '@/components/common/Button';
import { TaskCard } from '@/components/common/Card';

// Types
import { Task } from '@/types';

interface ProjectTasksProps {
  projectId: string;
  tasks?: Task[];
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ projectId, tasks }) => {
  const navigate = useNavigate();

  if (!tasks) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Cargando tareas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tareas del Proyecto
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {tasks.length} tarea(s) en total
          </p>
        </div>
        
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
        >
          Nueva Tarea
        </Button>
      </div>

      {/* Tasks List */}
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <PlusIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay tareas
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crea tu primera tarea para comenzar a trabajar en este proyecto.
          </p>
          <Button
            variant="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
          >
            Crear Primera Tarea
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks; 