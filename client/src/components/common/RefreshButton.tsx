import React from 'react';
import { RefreshCwIcon } from 'lucide-react';
import Button from './Button';
import { useAutoRefresh } from '@/contexts/AutoRefreshContext';

// ======================================
// COMPONENTE BOTÓN DE ACTUALIZACIÓN MANUAL
// ======================================

interface RefreshButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  refreshType?: 'all' | 'projects' | 'tasks' | 'timeEntries' | 'dashboard';
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  variant = 'outline',
  size = 'sm',
  showText = true,
  className = '',
  onClick,
  refreshType = 'all'
}) => {
  const { 
    isRefreshing, 
    refreshAll, 
    refreshProjects, 
    refreshTasks, 
    refreshTimeEntries, 
    refreshDashboard 
  } = useAutoRefresh();

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    try {
      switch (refreshType) {
        case 'all':
          await refreshAll();
          break;
        case 'projects':
          await refreshProjects();
          break;
        case 'tasks':
          await refreshTasks();
          break;
        case 'timeEntries':
          await refreshTimeEntries();
          break;
        case 'dashboard':
          await refreshDashboard();
          break;
        default:
          await refreshAll();
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const getButtonText = () => {
    if (!showText) return '';
    
    switch (refreshType) {
      case 'all':
        return 'Actualizar Todo';
      case 'projects':
        return 'Actualizar Proyectos';
      case 'tasks':
        return 'Actualizar Tareas';
      case 'timeEntries':
        return 'Actualizar Tiempos';
      case 'dashboard':
        return 'Actualizar Dashboard';
      default:
        return 'Actualizar';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isRefreshing}
      className={className}
      icon={
        <RefreshCwIcon 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
      }
    >
      {getButtonText()}
    </Button>
  );
};

export default RefreshButton;
