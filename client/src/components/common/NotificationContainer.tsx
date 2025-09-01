import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationState } from '@/types';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationIcon = (type: NotificationState['type']) => {
    const iconClass = "w-6 h-6";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-400`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-400`} />;
      case 'info':
      default:
        return <Info className={`${iconClass} text-blue-400`} />;
    }
  };

  const getNotificationStyles = (type: NotificationState['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          getIcon={getNotificationIcon}
          getStyles={getNotificationStyles}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: NotificationState;
  onRemove: (id: string) => void;
  getIcon: (type: NotificationState['type']) => React.ReactNode;
  getStyles: (type: NotificationState['type']) => string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  getIcon,
  getStyles,
}) => {
  useEffect(() => {
    // Auto-remove after duration (si no es 0)
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  return (
    <div
      className={`
        border rounded-lg p-4 shadow-lg animate-slide-in-right
        ${getStyles(notification.type)}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        
        <div className="ml-3 w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {notification.title}
          </h3>
          
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {notification.message}
          </p>
          
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className="text-sm font-medium text-primary hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => onRemove(notification.id)}
            className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <span className="sr-only">Cerrar</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Progress bar para mostrar tiempo restante */}
      {notification.duration && notification.duration > 0 && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div 
              className="bg-current h-1 rounded-full transition-all duration-1000 opacity-50"
              style={{
                animation: `shrink ${notification.duration}ms linear forwards`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;