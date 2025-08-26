import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/es';
import { Calendar, Clock, Target, CheckCircle, AlertTriangle } from 'lucide-react';

import { useTimeline } from '../../hooks/useTimeline';
import { TimelineItem, TimelineGroup } from '../../types/timeline';
import DateRangePicker from '../common/DateRangePicker';
import TimelineTabs from './TimelineTabs';
import TimelineKPIs from './TimelineKPIs';
import TimelineDetail from './TimelineDetail';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { ProjectWithStats, TaskWithProject, TaskStatus, ProjectStatus, TaskPriority } from '../../types';

// Configurar moment para español
moment.locale('es');

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

// Componente personalizado para el Timeline
const CustomTimeline: React.FC<{
  items: TimelineItem[];
  groups: TimelineGroup[];
  dateRange: { start: moment.Moment; end: moment.Moment };
  onItemClick: (item: TimelineItem) => void;
}> = ({ items, groups, dateRange, onItemClick }) => {
  const validStart = dateRange.start.isValid() ? dateRange.start : moment();
  const validEnd = dateRange.end.isValid() ? dateRange.end : moment().add(1, 'day');
  const totalDays = Math.max(validEnd.diff(validStart, 'days'), 1);
  const timelineWidth = 100;

  const validateAndFixProgress = (item: TimelineItem): TimelineItem => {
    let correctedProgress = item.progress;
    
    if (typeof correctedProgress !== 'number' || isNaN(correctedProgress)) {
      correctedProgress = 0;
    } else {
      correctedProgress = Math.min(Math.max(correctedProgress, 0), 100);
    }
    
    return {
      ...item,
      progress: correctedProgress
    };
  };

  const validatedItems = items.map(validateAndFixProgress);

  if (validatedItems.length > 0) {
    console.log('Timeline Items Debug:', validatedItems.map(item => ({
      id: item.id,
      title: item.title,
      progress: item.progress,
      status: item.status,
      type: item.type
    })));
  }

  const getItemPosition = (item: TimelineItem) => {
    const itemStart = item.start_time;
    const itemEnd = item.end_time;
    
    if (!itemStart.isValid() || !itemEnd.isValid()) {
      return { left: 0, width: 10 };
    }
    
    const startOffset = Math.max(0, itemStart.diff(validStart, 'days'));
    const endOffset = Math.max(0, itemEnd.diff(validStart, 'days'));
    
    if (totalDays <= 0) {
      return { left: 0, width: 10 };
    }
    
    const left = Math.min((startOffset / totalDays) * timelineWidth, 95);
    const width = Math.min(Math.max((endOffset - startOffset) / totalDays, 0.05), 0.95) * timelineWidth;
    
    return { 
      left: Math.max(0, Math.min(left, 95)), 
      width: Math.max(5, Math.min(width, 95)) 
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

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

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const groupItems = validatedItems.filter(item => item.group === group.id);
        
        return (
          <div key={group.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: group.color || '#3B82F6' }}
              />
              <h4 className="font-semibold text-gray-900 dark:text-white">{group.title}</h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {groupItems.length} {groupItems.length === 1 ? 'elemento' : 'elementos'}
              </span>
            </div>

            <div className="space-y-3">
              {groupItems.map((item) => {
                const { left, width } = getItemPosition(item);
                
                return (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(item.status)}
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {item.progress}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${item.progress}%`,
                          backgroundColor: item.color || '#3B82F6'
                        }}
                      />
                    </div>
                    
                    <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="absolute top-1 h-6 rounded cursor-pointer transition-all duration-300 hover:shadow-lg"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: item.color || '#3B82F6',
                          minWidth: '20px'
                        }}
                        onClick={() => onItemClick(item)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>Inicio: {dateRange.start.format('DD/MM/YYYY')}</span>
                <span>Fin: {dateRange.end.format('DD/MM/YYYY')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Progreso promedio:</span>
                <span className="font-semibold">
                  {Math.round(groupItems.reduce((sum, item) => sum + item.progress, 0) / groupItems.length)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TimelineDashboard: React.FC = () => {
  const {
    filters,
    selectedItem,
    isDetailOpen,
    applyQuickFilter,
    updateDateRange,
    changeView,
    openItemDetail,
    closeItemDetail,
    calculateKPIs
  } = useTimeline();

  const [items, setItems] = useState<TimelineItem[]>([]);
  const [groups, setGroups] = useState<TimelineGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const startDate = filters.dateRange.start.format('YYYY-MM-DD');
        const endDate = filters.dateRange.end.format('YYYY-MM-DD');
        
        if (filters.view === 'projects') {
          const projects = await projectService.getProjectsByDateRange(startDate, endDate);
          const timelineItems = projects.map(convertProjectToTimelineItem);
          const timelineGroups = createProjectGroups(projects);
          
          setItems(timelineItems);
          setGroups(timelineGroups);
        } else if (filters.view === 'tasks') {
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

    loadData();
  }, [filters.view, filters.dateRange.start, filters.dateRange.end]);

  const handleItemClick = (item: TimelineItem) => {
    openItemDetail(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Dashboard Project Timeline
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Visualiza y gestiona tus proyectos y tareas en una línea temporal interactiva
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getFullMonthName(moment())} {moment().format('YYYY')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {moment().format('dddd')}, {moment().format('D')} de {getFullMonthName(moment())}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Filtros de Fecha
            </h2>
          </div>
          <DateRangePicker
            dateRange={filters.dateRange}
            quickFilter={filters.quickFilter}
            onQuickFilterChange={applyQuickFilter}
            onDateRangeChange={updateDateRange}
          />
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-4">
          <TimelineTabs
            activeView={filters.view}
            onViewChange={changeView}
          />
        </div>

        {filters.view === 'kpis' && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Métricas y Estadísticas
            </h2>
            <TimelineKPIs kpis={calculateKPIs()} />
          </div>
        )}

        {(filters.view === 'projects' || filters.view === 'tasks') && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              {filters.view === 'projects' ? 'Timeline de Proyectos' : 'Timeline de Tareas'}
            </h2>
            
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando datos...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 dark:text-red-300">{error}</span>
                </div>
              </div>
            )}
            
            {!loading && !error && items.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No hay elementos para mostrar</h3>
                  <p className="text-sm">
                    No se encontraron {filters.view === 'projects' ? 'proyectos' : 'tareas'} en el rango de fechas seleccionado.
                  </p>
                </div>
              </div>
            )}
            
            {!loading && !error && items.length > 0 && (
              <div className="relative">
                <div className="timeline-date-bar">
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-4 my-2">
                    <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                  </div>

                  <div className="relative h-12 px-4">
                    {(() => {
                      const validStart = filters.dateRange.start.isValid() ? filters.dateRange.start : moment();
                      const validEnd = filters.dateRange.end.isValid() ? filters.dateRange.end : moment().add(1, 'day');
                      const totalDays = Math.max(validEnd.diff(validStart, 'days'), 1);
                      const timelineWidth = 100;
                      
                      const generateTimeMarkers = () => {
                        const markers = [];
                        const isYearly = totalDays > 300;
                        
                        if (isYearly) {
                          for (let i = 0; i <= 12; i++) {
                            const date = moment(filters.dateRange.start).add(i, 'months');
                            const position = (i / 12) * timelineWidth;
                            
                            markers.push({
                              date,
                              position,
                              label: getMonthName(date),
                              isMonth: true
                            });
                          }
                        } else {
                          const interval = Math.max(30, Math.ceil(totalDays / 10));
                          for (let i = 0; i <= totalDays; i += interval) {
                            const date = moment(filters.dateRange.start).add(i, 'days');
                            const position = (i / totalDays) * timelineWidth;
                            
                            markers.push({
                              date,
                              position,
                              label: `${date.format('DD')} ${getMonthName(date)}`,
                              isMonth: false
                            });
                          }
                        }
                        
                        return markers;
                      };

                      const timeMarkers = generateTimeMarkers();
                      
                      return timeMarkers.map((marker, index) => (
                        <div
                          key={index}
                          className="absolute top-0 transform -translate-x-1/2"
                          style={{ left: `${marker.position}%` }}
                        >
                          <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600" />
                          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap ${
                            marker.isMonth ? 'font-semibold' : ''
                          }`}>
                            {marker.label}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="timeline-container max-h-[70vh] overflow-y-auto mt-4">
                  <CustomTimeline
                    items={items}
                    groups={groups}
                    dateRange={filters.dateRange}
                    onItemClick={handleItemClick}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <TimelineDetail
          item={selectedItem}
          isOpen={isDetailOpen}
          onClose={closeItemDetail}
        />
      </div>
    </div>
  );
};

export default TimelineDashboard; 