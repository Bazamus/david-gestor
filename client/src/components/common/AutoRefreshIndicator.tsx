import React from 'react';
import { RefreshCwIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { useAutoRefresh } from '@/contexts/AutoRefreshContext';

// ======================================
// COMPONENTE INDICADOR DE ACTUALIZACIÓN AUTOMÁTICA
// ======================================

interface AutoRefreshIndicatorProps {
  showLastRefreshTime?: boolean;
  className?: string;
}

const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({ 
  showLastRefreshTime = true,
  className = ''
}) => {
  const { isRefreshing, lastRefreshTime, autoRefreshInterval } = useAutoRefresh();

  // Formatear el tiempo desde la última actualización
  const formatTimeSinceLastRefresh = () => {
    if (!lastRefreshTime) return 'Nunca';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    }
  };

  // Formatear el intervalo de actualización automática
  const formatAutoRefreshInterval = () => {
    if (!autoRefreshInterval) return 'Deshabilitado';
    
    const minutes = Math.floor(autoRefreshInterval / (1000 * 60));
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}h`;
    }
  };

  return (
    <div className={`flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      {/* Icono de estado */}
      <div className="flex items-center">
        {isRefreshing ? (
          <RefreshCwIcon className="w-3 h-3 animate-spin text-blue-500" />
        ) : lastRefreshTime ? (
          <CheckCircleIcon className="w-3 h-3 text-green-500" />
        ) : (
          <AlertCircleIcon className="w-3 h-3 text-yellow-500" />
        )}
      </div>

      {/* Texto de estado */}
      <span className="font-medium">
        {isRefreshing ? 'Actualizando...' : 'Actualizado'}
      </span>

      {/* Tiempo desde la última actualización */}
      {showLastRefreshTime && lastRefreshTime && (
        <span>
          hace {formatTimeSinceLastRefresh()}
        </span>
      )}

      {/* Intervalo de actualización automática */}
      {autoRefreshInterval && (
        <span className="text-gray-400">
          • Auto: {formatAutoRefreshInterval()}
        </span>
      )}
    </div>
  );
};

export default AutoRefreshIndicator;
