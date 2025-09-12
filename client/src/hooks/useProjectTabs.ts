// useState and useEffect imports removed as they're not used
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  FolderIcon, 
  CheckSquareIcon, 
  LayoutIcon,
  BarChart3Icon,
  ClockIcon
} from 'lucide-react';

export interface ProjectTab {
  id: string;
  label: string;
  icon: any;
}

export const PROJECT_TABS: ProjectTab[] = [
  { id: 'summary', label: 'Resumen', icon: FolderIcon },
  { id: 'tasks', label: 'Tareas', icon: CheckSquareIcon },
  { id: 'kanban', label: 'Kanban', icon: LayoutIcon },
  { id: 'time', label: 'Tiempo', icon: ClockIcon },
  { id: 'stats', label: 'Estadísticas', icon: BarChart3Icon },
];

export const useProjectTabs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Determinar si estamos en una página de detalle de proyecto
  const isProjectDetailPage = /^\/projects\/[^\/]+\/?$/.test(location.pathname);
  
  // Obtener pestaña activa de la URL o usar 'summary' por defecto
  const activeTab = searchParams.get('tab') || 'summary';
  
  const setActiveTab = (tabId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (tabId === 'summary') {
      // Remover el parámetro tab si es summary (por defecto)
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tabId);
    }
    setSearchParams(newSearchParams);
  };

  return {
    tabs: PROJECT_TABS,
    activeTab,
    setActiveTab,
    isProjectDetailPage
  };
};