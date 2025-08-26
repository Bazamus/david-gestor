import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderIcon, ArrowRightIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import Button from '@/components/common/Button';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
  team_size?: number;
}

interface ProjectListProps {
  projects: Project[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  viewAllLink?: string;
  className?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  title = "Proyectos Recientes",
  maxItems = 4,
  showViewAll = true,
  viewAllLink = "/projects",
  className = ""
}) => {
  const navigate = useNavigate();
  const statusColors = {
    planning: 'project-planning',
    active: 'project-active',
    'on-hold': 'project-on-hold',
    completed: 'project-completed',
    archived: 'project-archived'
  };

  const statusLabels = {
    planning: 'Planificación',
    active: 'Activo',
    'on-hold': 'En Pausa',
    completed: 'Completado',
    archived: 'Archivado'
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const displayedProjects = projects.slice(0, maxItems);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {showViewAll && (
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowRightIcon className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => navigate(viewAllLink)}
          >
            Ver todos
          </Button>
        )}
      </div>
      
      {displayedProjects.length > 0 ? (
        <div className="grid gap-4">
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-colors duration-200 hover:shadow-sm"
              onClick={() => navigate(`/projects/${project.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/projects/${project.id}`);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    {project.created_at && (
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Creado: {formatDate(project.created_at)}</span>
                      </div>
                    )}
                    {project.team_size && project.team_size > 0 && (
                      <div className="flex items-center space-x-1">
                        <UsersIcon className="w-3 h-3" />
                        <span>{project.team_size} miembros</span>
                      </div>
                    )}
                  </div>
                  
                  {project.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progreso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FolderIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay proyectos recientes</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate('/projects/new')}
          >
            Crear tu primer proyecto
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
