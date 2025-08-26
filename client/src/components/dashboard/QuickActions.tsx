import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  CheckSquareIcon, 
  FolderIcon,
  BarChart3Icon,
  ClockIcon

} from 'lucide-react';
import Button from '@/components/common/Button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  title?: string;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions,
  title = "Acciones Rápidas",
  className = ""
}) => {
  const navigate = useNavigate();

  const defaultActions: QuickAction[] = [
    {
      id: 'new-project',
      label: 'Nuevo Proyecto',
      icon: <PlusIcon className="w-4 h-4" />,
      onClick: () => navigate('/projects/new'),
      variant: 'outline',
      color: 'blue'
    },
    {
      id: 'new-task',
      label: 'Nueva Tarea',
      icon: <CheckSquareIcon className="w-4 h-4" />,
      onClick: () => navigate('/tasks/new'),
      variant: 'outline',
      color: 'green'
    },
    {
      id: 'view-kanban',
      label: 'Ver Kanban',
      icon: <FolderIcon className="w-4 h-4" />,
      onClick: () => navigate('/kanban'),
      variant: 'outline',
      color: 'purple'
    },
    {
      id: 'view-reports',
      label: 'Ver Reportes',
      icon: <BarChart3Icon className="w-4 h-4" />,
      onClick: () => navigate('/reportes'),
      variant: 'outline',
      color: 'yellow'
    },
    {
      id: 'view-times',
      label: 'Ver Tiempos',
      icon: <ClockIcon className="w-4 h-4" />,
      onClick: () => navigate('/times'),
      variant: 'outline',
      color: 'gray'
    }
  ];

  const actionsToShow = actions || defaultActions;

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title text-lg">{title}</h3>
      </div>
      <div className="card-content space-y-3">
        {actionsToShow.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            fullWidth
            icon={action.icon}
            onClick={action.onClick}
            className={`justify-start ${
              action.color === 'blue' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' :
              action.color === 'green' ? 'hover:bg-green-50 dark:hover:bg-green-900/20' :
              action.color === 'purple' ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20' :
              action.color === 'red' ? 'hover:bg-red-50 dark:hover:bg-red-900/20' :
              action.color === 'yellow' ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20' :
              'hover:bg-gray-50 dark:hover:bg-gray-900/20'
            }`}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
