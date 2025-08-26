import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BellIcon, SearchIcon, SunIcon, MoonIcon, UserIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useProjectTabs } from '@/hooks/useProjectTabs';
import { useCommandPaletteContext } from '@/contexts/CommandPaletteContext';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/contexts/NotificationContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();
  const { tabs, activeTab, setActiveTab, isProjectDetailPage } = useProjectTabs();
  const { openPalette } = useCommandPaletteContext();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Obtener título de la página basado en la ruta
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/projects')) return 'Proyectos';
    if (path.includes('/tasks')) return 'Tareas';
    if (path.includes('/kanban')) return 'Tablero Kanban';
    if (path.includes('/search')) return 'Búsqueda';
    if (path.includes('/settings')) return 'Configuración';
    return 'Gestor de Proyectos';
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <SunIcon className="w-5 h-5" />;
    if (theme === 'dark') return <MoonIcon className="w-5 h-5" />;
    return actualTheme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />;
  };

  const handleLogout = () => {
    logout();
            addNotification({ 
              title: 'Sesión cerrada',
              message: 'Sesión cerrada correctamente', 
              type: 'success' 
            });
    navigate('/login');
  };

  const getUserRoleLabel = () => {
    if (!user) return '';
    return user.role === 'admin' ? 'Administrador' : 'Cliente';
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
      <div className="flex items-center justify-between">
        {/* Page Title & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
          
          {/* Quick Stats - Solo mostrar en dashboard */}
          {location.pathname === '/dashboard' && (
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>•</span>
              <span>Actualizado hace unos momentos</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <button
            onClick={openPalette}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Búsqueda rápida (⌘+K)"
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <BellIcon className="w-5 h-5" />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={`Tema actual: ${theme === 'system' ? 'automático' : theme}`}
          >
            {getThemeIcon()}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.username || 'Usuario'}
              </span>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getUserRoleLabel()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Configuración</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Navigation - Solo en páginas de detalle de proyecto */}
      {isProjectDetailPage && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 text-sm font-medium pb-2 border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;