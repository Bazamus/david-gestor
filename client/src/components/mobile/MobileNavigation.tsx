import React, { useState, useEffect } from 'react';
import { 
  X, 
  Home, 
  FolderOpen, 
  CheckSquare, 
  BarChart3, 
  Clock, 
  Settings,
  Plus,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCommandPaletteContext } from '@/contexts/CommandPaletteContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { openPalette } = useCommandPaletteContext();

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard'
    },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: <FolderOpen className="w-5 h-5" />,
      path: '/projects'
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: <CheckSquare className="w-5 h-5" />,
      path: '/tasks'
    },
    {
      id: 'kanban',
      label: 'Kanban',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/kanban'
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/timeline'
    },
    {
      id: 'times',
      label: 'Tiempos',
      icon: <Clock className="w-5 h-5" />,
      path: '/times'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/reportes'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings'
    }
  ];

  const quickActions = [
    {
      id: 'new-project',
      label: 'Nuevo Proyecto',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        setIsAnimating(true);
        setTimeout(() => {
          navigate('/projects/new');
          onClose();
          setIsAnimating(false);
        }, 150);
      }
    },
    {
      id: 'new-task',
      label: 'Nueva Tarea',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        setIsAnimating(true);
        setTimeout(() => {
          navigate('/tasks/new');
          onClose();
          setIsAnimating(false);
        }, 150);
      }
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: <Search className="w-5 h-5" />,
      action: () => {
        // Abrir el command palette para búsqueda universal
        onClose();
        // Pequeño delay para que el menú se cierre antes de abrir el palette
        setTimeout(() => {
          openPalette();
        }, 200);
      }
    }
  ];

  const handleNavigation = (path: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate(path);
      onClose();
      setIsAnimating(false);
    }, 150);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Menú lateral */}
      <div className={`
        fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isAnimating ? 'pointer-events-none' : ''}
      `}>
        {/* Header del menú */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Menú Principal
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Contenido del menú */}
        <div className="flex flex-col h-full">
          {/* Navegación principal */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navegación
              </h3>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Acciones Rápidas
              </h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center px-3 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <span className="mr-3">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer del menú */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Usuario
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    usuario@ejemplo.com
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
