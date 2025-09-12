import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = true,
  hover = false,
  onClick 
}) => {
  const classes = `
    card
    ${hover ? 'hover-glow cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div className={classes} onClick={onClick}>
      <div className={padding ? 'p-6' : ''}>
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}> = ({ children, className = '', as: Component = 'h3' }) => (
  <Component className={`card-title ${className}`}>
    {children}
  </Component>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`card-description ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>
    {children}
  </div>
);



// Card para proyectos
export const ProjectCard: React.FC<{
  project: {
    id: string;
    name: string;
    description?: string;
    color: string;
    status: string;
    completion_percentage: number;
    total_tasks: number;
    completed_tasks: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
  };
  onClick?: () => void;
  className?: string;
}> = ({ project, onClick, className = '' }) => {
  // Función para calcular la duración del proyecto
  const calculateProjectDuration = () => {
    const startDate = project.start_date ? new Date(project.start_date) : new Date(project.created_at);
    const endDate = project.end_date ? new Date(project.end_date) : new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 
        ? `${years}a ${remainingMonths}m`
        : `${years} ${years === 1 ? 'año' : 'años'}`;
    }
  };

  // Función para formatear fechas de manera compacta
  const formatDateCompact = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? '2-digit' : undefined
    });
  };

  return (
  <Card hover={!!onClick} className={className} onClick={onClick}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
        </div>
        
        {project.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {project.description}
          </p>
        )}

        {/* Información de fechas - Diseño minimalista */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 py-1 border-l-2 pl-2" style={{ borderColor: project.color }}>
          <div className="flex items-center space-x-3">
            {project.start_date && (
              <span className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                <span>{formatDateCompact(project.start_date)}</span>
              </span>
            )}
            {project.end_date && (
              <span className="flex items-center space-x-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                <span>{formatDateCompact(project.end_date)}</span>
              </span>
            )}
          </div>
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {calculateProjectDuration()}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {project.completed_tasks} de {project.total_tasks} tareas
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {project.completion_percentage}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${project.completion_percentage}%`,
              backgroundColor: project.color 
            }}
          />
        </div>
      </div>
      
      <span className={`
        ml-3 px-2 py-1 text-xs font-medium rounded-full
        ${project.status === 'active' ? 'project-active' :
          project.status === 'completed' ? 'project-completed' :
          project.status === 'on_hold' ? 'project-on-hold' :
          project.status === 'planning' ? 'project-planning' :
          'project-archived'}
      `}>
        {project.status === 'active' ? 'Activo' :
         project.status === 'completed' ? 'Completado' :
         project.status === 'on_hold' ? 'En pausa' :
         project.status === 'planning' ? 'Planificación' :
         'Archivado'}
      </span>
    </div>
  </Card>
  );
};

// Card para tareas
export const TaskCard: React.FC<{
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    tags?: string[];
  };
  onClick?: () => void;
  onViewClick?: () => void;
  showViewButton?: boolean;
  className?: string;
}> = ({ task, onClick, onViewClick, showViewButton = false, className = '' }) => {
  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const isDueSoon = task.due_date && !isOverdue && 
    new Date(task.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Card 
      hover={!!onClick} 
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`} 
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center space-x-1">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}
            `}>
              {task.priority === 'urgent' ? 'Urgente' :
               task.priority === 'high' ? 'Alta' :
               task.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-500">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className={`
            px-2 py-1 font-medium rounded-full
            ${statusColors[task.status as keyof typeof statusColors] || statusColors.todo}
          `}>
            {task.status === 'todo' ? 'Por hacer' :
             task.status === 'in_progress' ? 'En progreso' : 'Completado'}
          </span>
          
          {task.due_date && (
            <span className={`
              ${isOverdue ? 'text-red-600 dark:text-red-400' :
                isDueSoon ? 'text-yellow-600 dark:text-yellow-400' :
                'text-gray-500 dark:text-gray-400'}
            `}>
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Time tracking */}
        {(task.estimated_hours || task.actual_hours) && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {task.actual_hours || 0}h / {task.estimated_hours || 0}h
            </span>
            {task.estimated_hours && task.actual_hours && (
              <span className={`
                ${task.actual_hours > task.estimated_hours ? 'text-red-600' : 'text-green-600'}
              `}>
                {Math.round((task.actual_hours / task.estimated_hours) * 100)}%
              </span>
            )}
          </div>
        )}

        {/* View Button */}
        {showViewButton && onViewClick && (
          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewClick();
              }}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ...
// Card para estadísticas
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  className?: string;
  onClick?: () => void;
  showLink?: boolean;
  linkText?: string;
}> = ({ title, value, icon, color = 'blue', className = '', onClick, showLink = false, linkText = 'Ver más' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    red: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
    gray: 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800',
  };

  const hoverClasses = onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : '';

  return (
    <div 
      className={`p-6 rounded-lg border ${colorClasses[color]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        {icon && (
          <div className="text-gray-400 dark:text-gray-500 ml-4">
            {icon}
          </div>
        )}
      </div>
      
      {/* Link section */}
      {showLink && onClick && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            {linkText}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;