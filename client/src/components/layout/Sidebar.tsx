import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  FolderIcon, 
  CheckSquareIcon, 
  LayoutIcon,
  Calendar,
  BarChart3Icon,
  ClockIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LockIcon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'Proyectos',
      href: '/projects',
      icon: FolderIcon,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'Tareas',
      href: '/tasks',
      icon: CheckSquareIcon,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'Kanban',
      href: '/kanban', // Tablero Kanban global
      icon: LayoutIcon,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'Timeline',
      href: '/timeline', // Dashboard Timeline
      icon: Calendar,
      badge: null,
      adminOnly: true,
    },
    {
      name: 'Reportes',
      href: '/reportes',
      icon: BarChart3Icon,
      badge: null,
      adminOnly: false, // Disponible para todos
    },
    {
      name: 'Tiempos',
      href: '/times',
      icon: ClockIcon,
      badge: null,
      adminOnly: true,
    },
  ];

  const bottomNavigationItems = [
    {
      name: 'Configuración',
      href: '/settings',
      icon: SettingsIcon,
      badge: null,
      adminOnly: true,
    },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Gestor
              </h1>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isDisabled = item.adminOnly && user?.role !== 'admin';
            
            return (
              <li key={item.name}>
                {isDisabled ? (
                  <button
                    onClick={() => addNotification({ 
                      title: 'Acceso restringido',
                      message: 'Acceso restringido. Solo administradores pueden acceder a esta sección.', 
                      type: 'warning' 
                    })}
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                    title="Acceso restringido"
                  >
                    <LockIcon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <>
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ul className="space-y-2">
          {bottomNavigationItems.map((item) => {
            const isDisabled = item.adminOnly && user?.role !== 'admin';
            
            return (
              <li key={item.name}>
                {isDisabled ? (
                  <button
                    onClick={() => addNotification({ 
                      title: 'Acceso restringido',
                      message: 'Acceso restringido. Solo administradores pueden acceder a esta sección.', 
                      type: 'warning' 
                    })}
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
                    title="Acceso restringido"
                  >
                    <LockIcon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </button>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;