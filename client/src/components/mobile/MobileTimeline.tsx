<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import React, { useState } from 'react';
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
import moment from 'moment';
import 'moment/locale/es';
import { 
  Calendar, 
<<<<<<< HEAD
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  CalendarIcon,
  BarChart3Icon,
  TrendingUpIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  MoreHorizontalIcon,
  PlayIcon,
  PauseIcon,
  CheckCircle2Icon
=======
  Target, 
  EyeIcon,
  EyeOffIcon
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import MobileTabs from './MobileTabs';
<<<<<<< HEAD
import { MobileCard } from './MobileCard';
import { MobileAccordion } from './MobileAccordion';
import SearchInput from '@/components/common/SearchInput';

// Hooks
import { useTimeline } from '@/hooks/useTimeline';
import { useIsMobile } from '@/hooks/useIsMobile';

// Types
import { TimelineItem, TimelineGroup } from '@/types/timeline';
import { ProjectWithStats, TaskWithProject, TaskStatus, ProjectStatus, TaskPriority } from '@/types';

// Services
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
=======
import SearchInput from '@/components/common/SearchInput';

// Types
import { TimelineItem } from '@/types/timeline';
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba

// Configurar moment para español
moment.locale('es');

<<<<<<< HEAD
// Función para obtener el nombre del mes en español
const getMonthName = (date: moment.Moment): string => {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  return months[date.month()];
};

// Función para obtener el nombre completo del mes en español
const getFullMonthName = (date: moment.Moment): string => {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[date.month()];
};

// Función para convertir proyecto a TimelineItem
const convertProjectToTimelineItem = (project: ProjectWithStats): TimelineItem => {
  const calculateProjectProgress = (completionPercentage: number | null, status: ProjectStatus): number => {
    if (completionPercentage !== null && completionPercentage !== undefined) {
      return Math.min(Math.max(completionPercentage, 0), 100);
    }
    
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 100;
      case ProjectStatus.ACTIVE:
        return 50;
      case ProjectStatus.PLANNING:
      case ProjectStatus.ON_HOLD:
      default:
        return 0;
    }
  };

  const progress = calculateProjectProgress(project.completion_percentage, project.status);

  return {
    id: project.id,
    title: project.name,
    start_time: moment(project.start_date),
    end_time: moment(project.end_date),
    group: project.id,
    color: project.color || '#3B82F6',
    priority: 'medium',
    status: project.status === ProjectStatus.COMPLETED ? 'completed' : 
            project.status === ProjectStatus.ACTIVE ? 'in_progress' : 'pending',
    progress: progress,
    description: project.description || '',
    type: 'project'
  };
};

// Función para convertir tarea a TimelineItem
const convertTaskToTimelineItem = (task: TaskWithProject): TimelineItem => {
  const getPriorityString = (priority: TaskPriority): 'low' | 'medium' | 'high' => {
    switch (priority) {
      case TaskPriority.LOW:
        return 'low';
      case TaskPriority.MEDIUM:
        return 'medium';
      case TaskPriority.HIGH:
      case TaskPriority.URGENT:
        return 'high';
      default:
        return 'medium';
    }
  };

  const calculateProgress = (status: TaskStatus): number => {
    switch (status) {
      case TaskStatus.DONE:
        return 100;
      case TaskStatus.IN_PROGRESS:
        return 50;
      case TaskStatus.TODO:
      default:
        return 0;
    }
  };

  const progress = calculateProgress(task.status);

  return {
    id: task.id,
    title: task.title,
    start_time: moment(task.created_at),
    end_time: task.due_date ? moment(task.due_date) : moment(task.created_at).add(7, 'days'),
    group: task.project_id || 'sin-proyecto',
    color: task.project?.color || '#6B7280',
    priority: getPriorityString(task.priority),
    status: task.status === TaskStatus.DONE ? 'completed' : 
            task.status === TaskStatus.IN_PROGRESS ? 'in_progress' : 'pending',
    progress: progress,
    description: task.description || '',
    type: 'task',
    projectId: task.project_id
  };
};

// Función para crear grupos de proyectos
const createProjectGroups = (projects: ProjectWithStats[]): TimelineGroup[] => {
  return projects.map(project => ({
    id: project.id,
    title: project.name,
    color: project.color || '#3B82F6'
  }));
};

// Función para crear grupos de tareas
const createTaskGroups = (tasks: TaskWithProject[]): TimelineGroup[] => {
  const projectIds = [...new Set(tasks.map(task => task.project_id).filter(Boolean))];
  
  return projectIds.map(projectId => {
    const project = tasks.find(task => task.project_id === projectId)?.project;
    return {
      id: projectId,
      title: project?.name || 'Sin proyecto',
      color: project?.color || '#6B7280'
    };
  });
};

=======
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
interface MobileTimelineProps {
  isGlobal?: boolean;
}

<<<<<<< HEAD
const MobileTimeline: React.FC<MobileTimelineProps> = ({ isGlobal = false }) => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'projects' | 'tasks' | 'kpis'>('projects');
  const [dateRange, setDateRange] = useState({
    start: moment().startOf('month'),
    end: moment().endOf('month')
  });

  const {
    calculateKPIs,
    openItemDetail,
    closeItemDetail
  } = useTimeline();

  // Cargar datos según la vista activa y el rango de fechas
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const startDate = dateRange.start.format('YYYY-MM-DD');
        const endDate = dateRange.end.format('YYYY-MM-DD');
        
        if (selectedView === 'projects') {
          const projects = await projectService.getProjectsByDateRange(startDate, endDate);
          const timelineItems = projects.map(convertProjectToTimelineItem);
          const timelineGroups = createProjectGroups(projects);
          
          setItems(timelineItems);
          setGroups(timelineGroups);
        } else if (selectedView === 'tasks') {
          const tasks = await taskService.getTasks({
            due_date_from: startDate,
            due_date_to: endDate
          });
          const timelineItems = tasks.map(convertTaskToTimelineItem);
          const timelineGroups = createTaskGroups(tasks);
          
          setItems(timelineItems);
          setGroups(timelineGroups);
        }
      } catch (err) {
        console.error('Error cargando datos del timeline:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedView !== 'kpis') {
      loadData();
    }
  }, [selectedView, dateRange.start, dateRange.end]);

  // Filtros rápidos de fecha
  const quickFilters = [
    { id: 'today', label: 'Hoy', start: moment().startOf('day'), end: moment().endOf('day') },
    { id: 'week', label: 'Esta semana', start: moment().startOf('week'), end: moment().endOf('week') },
    { id: 'month', label: 'Este mes', start: moment().startOf('month'), end: moment().endOf('month') },
    { id: 'quarter', label: 'Este trimestre', start: moment().startOf('quarter'), end: moment().endOf('quarter') },
  ];

  const applyQuickFilter = (filter: typeof quickFilters[0]) => {
    setDateRange({ start: filter.start, end: filter.end });
  };

  // Navegación temporal
  const navigateTime = (direction: 'prev' | 'next', unit: moment.unitOfTime.DurationConstructor = 'month') => {
    const newStart = direction === 'next' 
      ? dateRange.start.add(1, unit)
      : dateRange.start.subtract(1, unit);
    
    const newEnd = direction === 'next'
      ? dateRange.end.add(1, unit)
      : dateRange.end.subtract(1, unit);
    
    setDateRange({ start: newStart, end: newEnd });
  };

  // Filtrar items por búsqueda
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para manejar click en items del timeline
  const handleItemClick = (item: TimelineItem) => {
    setSelectedItem(item);
    openItemDetail(item);
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2Icon className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <PlayIcon className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <PauseIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-400';
      case 'medium':
        return 'bg-yellow-400';
      case 'low':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Configuración de pestañas
  const viewTabs = [
    { id: 'projects', label: 'Proyectos', icon: <Target className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tareas', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'kpis', label: 'Métricas', icon: <BarChart3Icon className="w-4 h-4" /> },
  ];

  if (loading) {
    return <MobileTimelineSkeleton />;
  }

  if (error) {
    return <MobileTimelineError onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-4">
      {/* Header móvil */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Timeline
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredItems.length} elementos
              </p>
            </div>
=======
const MobileTimeline: React.FC<MobileTimelineProps> = () => {
  const [items] = useState<TimelineItem[]>([]);
  const [loading] = useState(true);
  const [error] = useState<string | null>(null);
  const [compactView, setCompactView] = useState(false);
  const [viewType, setViewType] = useState<'projects' | 'tasks'>('projects');
  const [searchTerm, setSearchTerm] = useState('');

  // Configuración de tabs
  const viewTabs = [
    {
      id: 'projects',
      label: 'Proyectos',
      icon: <Calendar className="w-4 h-4" />,
      content: <div>Proyectos</div>
    },
    {
      id: 'tasks',
      label: 'Tareas',
      icon: <Target className="w-4 h-4" />,
      content: <div>Tareas</div>
    }
  ];

  // Función para manejar click en items del timeline
  const handleItemClick = (item: TimelineItem) => {
    console.log('Item clicked:', item);
  };

  // Filtrar items por búsqueda
  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Timeline
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vista temporal de proyectos y tareas
            </p>
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
<<<<<<< HEAD
              variant="ghost"
              size="sm"
              icon={compactView ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
              onClick={() => setCompactView(!compactView)}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<FilterIcon className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            />
          </div>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-3">
              <SearchInput
                placeholder="Buscar elementos..."
                onSearch={setSearchTerm}
                initialValue={searchTerm}
                minLength={2}
                debounceMs={300}
              />
            </div>
          </div>
        )}
      </div>

      {/* Pestañas de vista */}
      <div className="px-4">
        <MobileTabs
          tabs={viewTabs}
          activeTab={selectedView}
          onTabChange={(tabId) => setSelectedView(tabId as typeof selectedView)}
=======
              variant="outline"
              size="sm"
              onClick={() => setCompactView(!compactView)}
            >
              {compactView ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            placeholder="Buscar en timeline..."
            onSearch={setSearchTerm}
            initialValue={searchTerm}
          />
        </div>

        {/* Tabs */}
        <MobileTabs
          tabs={viewTabs}
          defaultActiveTab={viewType}
          onTabChange={(tabId) => setViewType(tabId as 'projects' | 'tasks')}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
          variant="pills"
        />
      </div>

<<<<<<< HEAD
      {/* Navegación temporal */}
      <div className="px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronLeftIcon className="w-4 h-4" />}
              onClick={() => navigateTime('prev')}
            />
            
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {getFullMonthName(dateRange.start)} {dateRange.start.format('YYYY')}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dateRange.start.format('DD/MM')} - {dateRange.end.format('DD/MM')}
              </p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRightIcon className="w-4 h-4" />}
              onClick={() => navigateTime('next')}
            />
          </div>

          {/* Filtros rápidos */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => applyQuickFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  dateRange.start.isSame(filter.start, 'day') && dateRange.end.isSame(filter.end, 'day')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido según vista */}
      <div className="px-4">
        {selectedView === 'kpis' ? (
          <MobileTimelineKPIs kpis={calculateKPIs()} />
        ) : (
          <MobileTimelineContent
            items={filteredItems}
            groups={groups}
            dateRange={dateRange}
            onItemClick={handleItemClick}
            compactView={compactView}
            viewType={selectedView}
          />
        )}
      </div>

      {/* Modal de detalles */}
      {selectedItem && (
        <MobileTimelineDetail
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            closeItemDetail();
          }}
        />
      )}
    </div>
  );
};

// Componente de contenido del timeline
interface MobileTimelineContentProps {
  items: TimelineItem[];
  groups: TimelineGroup[];
  dateRange: { start: moment.Moment; end: moment.Moment };
  onItemClick: (item: TimelineItem) => void;
  compactView: boolean;
  viewType: 'projects' | 'tasks';
}

const MobileTimelineContent: React.FC<MobileTimelineContentProps> = ({
  items,
  groups,
  dateRange,
  onItemClick,
  compactView,
  viewType
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay elementos para mostrar</h3>
          <p className="text-sm">
            No se encontraron {viewType === 'projects' ? 'proyectos' : 'tareas'} en el rango de fechas seleccionado.
          </p>
        </div>
      </div>
    );
  }

  if (compactView) {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <MobileTimelineItemCompact
            key={item.id}
            item={item}
            dateRange={dateRange}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    );
  }

  // Agrupar items por grupo
  const itemsByGroup = groups.map(group => ({
    ...group,
    items: items.filter(item => item.group === group.id)
  }));

  return (
    <div className="space-y-4">
      {itemsByGroup.map((group) => (
        <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: group.color || '#3B82F6' }}
              />
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {group.title}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {group.items.length}
              </span>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {group.items.map((item) => (
              <MobileTimelineItem
                key={item.id}
                item={item}
                dateRange={dateRange}
                onClick={() => onItemClick(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de item del timeline
interface MobileTimelineItemProps {
  item: TimelineItem;
  dateRange: { start: moment.Moment; end: moment.Moment };
  onClick: () => void;
}

const MobileTimelineItem: React.FC<MobileTimelineItemProps> = ({ item, dateRange, onClick }) => {
  const getItemPosition = (item: TimelineItem) => {
    const itemStart = item.start_time;
    const itemEnd = item.end_time;
    
    if (!itemStart.isValid() || !itemEnd.isValid()) {
      return { left: 0, width: 10 };
    }
    
    const totalDays = Math.max(dateRange.end.diff(dateRange.start, 'days'), 1);
    const startOffset = Math.max(0, itemStart.diff(dateRange.start, 'days'));
    const endOffset = Math.max(0, itemEnd.diff(dateRange.start, 'days'));
    
    const left = Math.min((startOffset / totalDays) * 100, 95);
    const width = Math.min(Math.max((endOffset - startOffset) / totalDays, 0.05), 0.95) * 100;
    
    return { 
      left: Math.max(0, Math.min(left, 95)), 
      width: Math.max(5, Math.min(width, 95)) 
    };
  };

  const { left, width } = getItemPosition(item);

  return (
    <div 
      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon(item.status)}
          <span className="font-medium text-sm text-gray-900 dark:text-white truncate" title={item.title}>
            {item.title}
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {item.progress}%
          </span>
        </div>
      </div>
      
      {/* Barra de progreso visual */}
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${item.progress}%`,
            backgroundColor: item.color || '#3B82F6'
          }}
        />
      </div>
      
      {/* Timeline visual */}
      <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        <div
          className="absolute top-1 h-4 rounded cursor-pointer transition-all duration-300 hover:shadow-lg"
          style={{
            left: `${left}%`,
            width: `${width}%`,
            backgroundColor: item.color || '#3B82F6',
            minWidth: '20px'
          }}
        />
      </div>
      
      {/* Fechas */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>Inicio: {item.start_time.format('DD/MM')}</span>
        <span>Fin: {item.end_time.format('DD/MM')}</span>
      </div>
    </div>
  );
};

// Componente de item compacto del timeline
const MobileTimelineItemCompact: React.FC<MobileTimelineItemProps> = ({ item, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getStatusIcon(item.status)}
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {item.start_time.format('DD/MM')} - {item.end_time.format('DD/MM')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color || '#3B82F6' }}
          />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {item.progress}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Componente de KPIs móviles
interface MobileTimelineKPIsProps {
  kpis: any;
}

const MobileTimelineKPIs: React.FC<MobileTimelineKPIsProps> = ({ kpis }) => {
  const kpiItems = [
    { label: 'Proyectos Activos', value: kpis.activeProjects || 0, icon: Target, color: 'blue' },
    { label: 'Tareas Pendientes', value: kpis.pendingTasks || 0, icon: Clock, color: 'yellow' },
    { label: 'Tareas Completadas', value: kpis.completedTasks || 0, icon: CheckCircle, color: 'green' },
    { label: 'Progreso Promedio', value: `${kpis.averageProgress || 0}%`, icon: TrendingUpIcon, color: 'purple' },
  ];

  return (
    <div className="space-y-3">
      {kpiItems.map((kpi, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg bg-${kpi.color}-100 dark:bg-${kpi.color}-900/20 flex items-center justify-center`}>
                <kpi.icon className={`w-5 h-5 text-${kpi.color}-600 dark:text-${kpi.color}-400`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{kpi.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Métrica actual</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente de detalle móvil
interface MobileTimelineDetailProps {
  item: TimelineItem;
  onClose: () => void;
}

const MobileTimelineDetail: React.FC<MobileTimelineDetailProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white dark:bg-gray-800 w-full max-h-[80vh] rounded-t-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detalles
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MoreHorizontalIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.start_time.format('DD/MM/YYYY')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fin</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.end_time.format('DD/MM/YYYY')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(item.status)}
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {item.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {item.priority}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Progreso</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${item.progress}%`,
                  backgroundColor: item.color || '#3B82F6'
                }}
              />
            </div>
          </div>
        </div>
=======
      {/* Content */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay elementos en el timeline
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.start_time.format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      </div>
    </div>
  );
};

<<<<<<< HEAD
// Componentes de estado de carga y error
const MobileTimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
    <div className="px-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ))}
    </div>
  </div>
);

const MobileTimelineError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="text-center py-12 px-4">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
      <span className="text-red-500 text-2xl">⚠️</span>
    </div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      Error al cargar el timeline
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      No se pudieron cargar los datos
    </p>
    <Button variant="primary" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
);

=======
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
export default MobileTimeline;
