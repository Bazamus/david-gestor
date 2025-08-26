import React from 'react';
import { ChevronRight, Home, Search, Bell, User, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/useIsMobile';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface MobileHeaderProps {
  onMenuToggle?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  // Solo mostrar en móvil
  if (!isMobile) {
    return null;
  }

  // Generar breadcrumbs basados en la ruta actual
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Inicio',
        path: '/dashboard',
        icon: <Home className="w-4 h-4" />
      }
    ];

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Mapear segmentos a labels legibles
      let label = segment;
      let icon: React.ReactNode | undefined;

      switch (segment) {
        case 'dashboard':
          label = 'Dashboard';
          icon = <Home className="w-4 h-4" />;
          break;
        case 'projects':
          label = 'Proyectos';
          break;
        case 'tasks':
          label = 'Tareas';
          break;
        case 'kanban':
          label = 'Kanban';
          break;
        case 'timeline':
          label = 'Timeline';
          break;
        case 'times':
          label = 'Tiempos';
          break;
        case 'reportes':
          label = 'Reportes';
          break;
        case 'settings':
          label = 'Configuración';
          break;
        case 'new':
          label = 'Nuevo';
          break;
        case 'edit':
          label = 'Editar';
          break;
        default:
          // Si es un ID, mostrar un label más genérico
          if (/^[0-9a-f-]+$/.test(segment)) {
            label = 'Detalle';
          } else {
            // Capitalizar primera letra
            label = segment.charAt(0).toUpperCase() + segment.slice(1);
          }
      }

      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : currentPath,
        icon
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  return (
    <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="px-4 py-3">
        {/* Primera fila: Breadcrumbs y Botón hamburguesa */}
        <div className="flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm flex-1 min-w-0">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                )}
                <button
                  onClick={() => item.path && handleBreadcrumbClick(item.path)}
                  disabled={!item.path}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded-md transition-colors flex-shrink-0
                    ${item.path
                      ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-900 dark:text-white font-medium'
                    }
                  `}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="truncate max-w-[100px] sm:max-w-[120px]">{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Botón hamburguesa - Posicionado a la derecha */}
          <button
            onClick={onMenuToggle}
            className="ml-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Segunda fila: Acciones rápidas */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {/* Botón de búsqueda */}
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Botón de notificaciones */}
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {/* Badge de notificaciones */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
          </div>

          {/* Perfil de usuario */}
          <button
            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Perfil de usuario"
          >
            <User className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:block">Usuario</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
