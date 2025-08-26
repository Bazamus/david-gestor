import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  EditIcon, 
  TrashIcon, 
  CalendarIcon, 
  ClockIcon, 
  TagIcon,
  UserIcon,
  FolderIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CircleIcon,
  PlayCircleIcon,
  CodeIcon,
  GitBranchIcon,
  LinkIcon,
  FileTextIcon,
  TargetIcon,
  BarChart3Icon,
  SettingsIcon,
  RepeatIcon,
  StickyNoteIcon,
  LayersIcon,
  // ZapIcon and ShieldIcon removed as they're not used
  ExternalLinkIcon,
  DownloadIcon,
  // BookOpenIcon removed as it's not used
  UsersIcon,
  HashIcon,
  PercentIcon,
  TimerIcon,
  CalendarDaysIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  FileIcon,
  FolderOpenIcon,
  Link2Icon,
  // AlertCircleIcon removed as it's not used
  CheckSquareIcon,
  SquareIcon,
  XIcon,
  // MoreVerticalIcon removed as it's not used
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
// PageHeader import removed as it's not used
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TimeEntryModal from '@/components/times/TimeEntryModal';

// Hooks
import { useTask, useDeleteTask } from '@/hooks/useTasks';
import { useProject } from '@/hooks/useProjects';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTimeEntriesByTask, useTaskTimeSummary, useCreateTimeEntry, useUpdateTimeEntry, useDeleteTimeEntry } from '@/hooks/useTimeEntries';

// Types
import { TaskStatus, TaskPriority, CreateTimeEntryRequest, UpdateTimeEntryRequest, TimeEntry } from '@/types';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  // Estados para modales
  const [showCreateTimeModal, setShowCreateTimeModal] = useState(false);
  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [showAllTimesModal, setShowAllTimesModal] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);

  // Hooks
  const { data: task, isLoading, isError } = useTask(id!);
  const { data: project } = useProject(task?.project_id || '');
  const deleteTask = useDeleteTask();
  const { data: timeEntries, isLoading: timeEntriesLoading } = useTimeEntriesByTask(id!);
  const { data: timeSummary, isLoading: timeSummaryLoading } = useTaskTimeSummary(id!);
  const createTimeEntry = useCreateTimeEntry();
  const updateTimeEntry = useUpdateTimeEntry();
  const deleteTimeEntry = useDeleteTimeEntry();

  // Debug logs
  console.log('TaskDetail Debug:', {
    id,
    taskId: id,
    timeEntries: timeEntries?.length || 0,
    timeSummary: timeSummary ? 'loaded' : 'not loaded',
    timeEntriesLoading,
    timeSummaryLoading
  });

  // Handlers
  const handleEdit = () => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!task) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteTask.mutateAsync(task.id);
        addNotification({
          type: 'success',
          title: 'Tarea eliminada',
          message: 'La tarea ha sido eliminada correctamente'
        });
        navigate('/tasks');
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error al eliminar tarea',
          message: 'Error inesperado al eliminar la tarea'
        });
      }
    }
  };

  const handleCreateTimeEntry = async (data: CreateTimeEntryRequest | UpdateTimeEntryRequest) => {
    try {
      // Asociar automáticamente con la tarea actual
      const timeEntryData = {
        ...data,
        task_id: id!,
        project_id: task?.project_id || ''
      };
      
      await createTimeEntry.mutateAsync(timeEntryData as CreateTimeEntryRequest);
      addNotification({
        type: 'success',
        title: 'Entrada creada',
        message: 'La entrada de tiempo ha sido creada correctamente'
      });
      setShowCreateTimeModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al crear entrada',
        message: 'Error inesperado al crear la entrada de tiempo'
      });
    }
  };

  const handleUpdateTimeEntry = async (data: CreateTimeEntryRequest | UpdateTimeEntryRequest) => {
    if (!selectedTimeEntry) return;
    
    try {
      await updateTimeEntry.mutateAsync({
        id: selectedTimeEntry.id,
        data: data as UpdateTimeEntryRequest
      });
      addNotification({
        type: 'success',
        title: 'Entrada actualizada',
        message: 'La entrada de tiempo ha sido actualizada correctamente'
      });
      setShowEditTimeModal(false);
      setSelectedTimeEntry(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al actualizar entrada',
        message: 'Error inesperado al actualizar la entrada de tiempo'
      });
    }
  };

  const handleDeleteTimeEntry = async (entryId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada de tiempo? Esta acción no se puede deshacer.')) {
      try {
        await deleteTimeEntry.mutateAsync(entryId);
        addNotification({
          type: 'success',
          title: 'Entrada eliminada',
          message: 'La entrada de tiempo ha sido eliminada correctamente'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error al eliminar entrada',
          message: 'Error inesperado al eliminar la entrada de tiempo'
        });
      }
    }
  };

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setSelectedTimeEntry(entry);
    setShowEditTimeModal(true);
  };

  const handleBackToProject = () => {
    if (project) {
      navigate(`/projects/${project.id}`);
    } else {
      navigate('/projects');
    }
  };

  // Utility functions
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return {
          label: 'Por hacer',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: CircleIcon
        };
      case TaskStatus.IN_PROGRESS:
        return {
          label: 'En progreso',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: PlayCircleIcon
        };
      case TaskStatus.DONE:
        return {
          label: 'Completado',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircleIcon
        };
      case TaskStatus.NADA:
        return {
          label: 'Nada',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: CircleIcon
        };
      case TaskStatus.EN_PROGRESO:
        return {
          label: 'En progreso',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: PlayCircleIcon
        };
      case TaskStatus.COMPLETADA:
        return {
          label: 'Completada',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: CheckCircleIcon
        };
      default:
        return {
          label: 'Desconocido',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
          icon: CircleIcon
        };
    }
  };

  const getPriorityInfo = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW:
        return {
          label: 'Baja',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        };
      case TaskPriority.MEDIUM:
        return {
          label: 'Media',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
      case TaskPriority.HIGH:
        return {
          label: 'Alta',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        };
      case TaskPriority.URGENT:
        return {
          label: 'Urgente',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
      default:
        return {
          label: 'Media',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (hours?: number) => {
    if (!hours) return 'No especificadas';
    return `${hours}h`;
  };

  const formatPercentage = (percentage?: number) => {
    if (percentage === undefined || percentage === null) return 'No especificado';
    return `${percentage}%`;
  };

  const formatComplexity = (complexity?: number) => {
    if (!complexity) return 'No especificada';
    const levels = ['', 'Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
    return `${levels[complexity]} (${complexity}/5)`;
  };

  const formatTaskType = (type?: string) => {
    if (!type) return 'No especificado';
    const typeMap: Record<string, string> = {
      'desarrollo': 'Desarrollo',
      'diseño': 'Diseño',
      'testing': 'Testing',
      'documentación': 'Documentación',
      'reunión': 'Reunión',
      'investigación': 'Investigación',
      'revisión': 'Revisión',
      'deployment': 'Deployment',
      'mantenimiento': 'Mantenimiento',
      'bug_fix': 'Bug Fix',
      'feature': 'Feature',
      'refactoring': 'Refactoring'
    };
    return typeMap[type] || type;
  };

  const hasFieldData = (field: any): boolean => {
    if (field === null || field === undefined) return false;
    if (typeof field === 'string') return field.trim().length > 0;
    if (Array.isArray(field)) return field.length > 0;
    if (typeof field === 'number') return field > 0;
    if (typeof field === 'boolean') return true;
    return true;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError || !task) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Tarea no encontrada</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">La tarea solicitada no existe o no se pudo cargar</p>
        <Button onClick={() => navigate('/tasks')} variant="primary">
          Volver a Tareas
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(task.status);
  const priorityInfo = getPriorityInfo(task.priority);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={handleBackToProject}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detalle completo de la tarea
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mb-6">
        <Button
          variant="secondary"
          icon={<EditIcon className="w-4 h-4" />}
          onClick={handleEdit}
        >
          Editar
        </Button>
        <Button
          variant="destructive"
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={handleDelete}
          disabled={deleteTask.isPending}
        >
          {deleteTask.isPending ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content - 3 columns */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <FileTextIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Información Básica
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-5 h-5" />
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                  {priorityInfo.label}
                </span>
              </div>

              {/* Description */}
              {hasFieldData(task.description) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </h4>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {hasFieldData(task.tags) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* SECCIÓN 2: GESTIÓN Y ASIGNACIÓN */}
          {(hasFieldData(task.tipo_tarea) || hasFieldData(task.asignado_a) || hasFieldData(task.complejidad) || hasFieldData(task.tarea_padre_id)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <UsersIcon className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gestión y Asignación
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasFieldData(task.tipo_tarea) && (
                  <div className="flex items-center space-x-3">
                    <CodeIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tipo de tarea</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTaskType(task.tipo_tarea)}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.asignado_a) && (
                  <div className="flex items-center space-x-3">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Asignado a</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.asignado_a}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.complejidad) && (
                  <div className="flex items-center space-x-3">
                    <BarChart3Icon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Complejidad</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatComplexity(task.complejidad)}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.tarea_padre_id) && (
                  <div className="flex items-center space-x-3">
                    <LayersIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tarea padre</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {task.tarea_padre_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 3: SEGUIMIENTO Y PROGRESO */}
          {(hasFieldData(task.porcentaje_completado) || hasFieldData(task.tiempo_estimado_horas) || hasFieldData(task.tiempo_real_horas) || hasFieldData(task.fecha_inicio)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <TargetIcon className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Seguimiento y Progreso
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasFieldData(task.porcentaje_completado) && (
                  <div className="flex items-center space-x-3">
                    <PercentIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Porcentaje completado</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPercentage(task.porcentaje_completado)}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.tiempo_estimado_horas) && (
                  <div className="flex items-center space-x-3">
                    <TimerIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tiempo estimado</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(task.tiempo_estimado_horas)}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.tiempo_real_horas) && (
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tiempo real</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(task.tiempo_real_horas)}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.fecha_inicio) && (
                  <div className="flex items-center space-x-3">
                    <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Fecha de inicio</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(task.fecha_inicio)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 4: CRITERIOS Y VALIDACIÓN */}
          {(hasFieldData(task.criterios_aceptacion) || hasFieldData(task.definicion_terminado) || hasFieldData(task.bloqueadores)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <CheckSquareIcon className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Criterios y Validación
                </h3>
              </div>
              
              <div className="space-y-4">
                {hasFieldData(task.criterios_aceptacion) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Criterios de aceptación
                    </h4>
                    <div className="space-y-2">
                      {task.criterios_aceptacion?.map((criterio, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          {criterio.completado ? (
                            <CheckSquareIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <SquareIcon className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${criterio.completado ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                            {criterio.descripcion}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasFieldData(task.definicion_terminado) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Definición de terminado
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {task.definicion_terminado}
                    </p>
                  </div>
                )}

                {hasFieldData(task.bloqueadores) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bloqueadores
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {task.bloqueadores}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 5: DESARROLLO Y TÉCNICO */}
          {(hasFieldData(task.branch_git) || hasFieldData(task.commit_relacionado) || hasFieldData(task.url_pull_request)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <GitBranchIcon className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Desarrollo y Técnico
                </h3>
              </div>
              
              <div className="space-y-4">
                {hasFieldData(task.branch_git) && (
                  <div className="flex items-center space-x-3">
                    <GitBranchIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Branch Git</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {task.branch_git}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.commit_relacionado) && (
                  <div className="flex items-center space-x-3">
                    <GitCommitIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Commit relacionado</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {task.commit_relacionado}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.url_pull_request) && (
                  <div className="flex items-center space-x-3">
                    <GitPullRequestIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Pull Request</p>
                      <a 
                        href={task.url_pull_request} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Ver PR</span>
                        <ExternalLinkIcon className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 6: DEPENDENCIAS Y RELACIONES */}
          {(hasFieldData(task.dependencias) || hasFieldData(task.impacto_otras_tareas)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <LinkIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dependencias y Relaciones
                </h3>
              </div>
              
              <div className="space-y-4">
                {hasFieldData(task.dependencias) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dependencias
                    </h4>
                    <div className="space-y-1">
                      {task.dependencias?.map((dependencia, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <LinkIcon className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            {dependencia}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasFieldData(task.impacto_otras_tareas) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Impacto en otras tareas
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {task.impacto_otras_tareas}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 7: ARCHIVOS Y RECURSOS */}
          {(hasFieldData(task.archivos_adjuntos) || hasFieldData(task.enlaces_referencia) || hasFieldData(task.onedrive_folder_id)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <FolderOpenIcon className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Archivos y Recursos
                </h3>
              </div>
              
              <div className="space-y-4">
                {hasFieldData(task.archivos_adjuntos) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Archivos adjuntos
                    </h4>
                    <div className="space-y-2">
                      {task.archivos_adjuntos?.map((archivo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex items-center space-x-2">
                            <FileIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {archivo.nombre}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {(archivo.tamaño / 1024).toFixed(1)} KB
                            </span>
                            <DownloadIcon className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasFieldData(task.enlaces_referencia) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enlaces de referencia
                    </h4>
                    <div className="space-y-1">
                      {task.enlaces_referencia?.map((enlace, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Link2Icon className="w-3 h-3 text-gray-400" />
                          <a 
                            href={enlace} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {enlace}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasFieldData(task.onedrive_folder_id) && (
                  <div className="flex items-center space-x-3">
                    <FolderIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Carpeta OneDrive</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {task.onedrive_folder_id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 8: AUTOMATIZACIÓN Y RECURRENCIA */}
          {(hasFieldData(task.es_recurrente) || hasFieldData(task.notas_internas)) && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <SettingsIcon className="w-5 h-5 text-teal-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Automatización y Recurrencia
                </h3>
              </div>
              
              <div className="space-y-4">
                {hasFieldData(task.es_recurrente) && (
                  <div className="flex items-center space-x-3">
                    <RepeatIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Es recurrente</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {task.es_recurrente ? 'Sí' : 'No'}
                      </p>
                    </div>
                  </div>
                )}

                {hasFieldData(task.notas_internas) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notas internas
                    </h4>
                    <div className="flex items-start space-x-2">
                      <StickyNoteIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {task.notas_internas}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* SECCIÓN 9: REGISTRO DE TIEMPOS - CENTRAL */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Registro de Tiempos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Seguimiento del tiempo dedicado a esta tarea
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateTimeModal(true)}
                >
                  Registrar Tiempo
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowAllTimesModal(true)}
                >
                  Ver Todas las Entradas
                </Button>
              </div>
            </div>
            
            {/* Time Summary - Enhanced Design */}
            {timeSummaryLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-sm text-blue-600">Cargando resumen de tiempo...</span>
              </div>
            ) : timeSummary ? (
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {timeSummary.total_entries || 0}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Entradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {timeSummary.total_hours || 0}h
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Horas Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {timeSummary.billable_hours || 0}h
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Horas Facturables</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      €{timeSummary.billable_amount?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Monto Facturable</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Última actualización: {timeEntries && timeEntries.length > 0 ? formatDate(timeEntries[0].date) : 'N/A'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Time Entries List - Enhanced Design */}
            {timeEntriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-sm text-gray-600">Cargando entradas de tiempo...</span>
              </div>
            ) : timeEntries && timeEntries.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Entradas de Tiempo ({timeEntries.length})
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Mostrando las últimas 5 entradas
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {timeEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleEditTimeEntry(entry)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(entry.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {entry.hours}h
                            </span>
                          </div>
                          {entry.billable && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Facturable
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            €{entry.billable_amount?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.rate_per_hour ? `@€${entry.rate_per_hour}/h` : 'Sin tarifa'}
                          </div>
                        </div>
                      </div>
                      
                      {entry.description && (
                        <div className="mb-2">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descripción
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.description}
                          </p>
                        </div>
                      )}
                      
                      {entry.comments && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Comentarios
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {entry.comments}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end mt-3 space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTimeEntry(entry)}
                        >
                          <EditIcon className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTimeEntry(entry.id)}
                          disabled={deleteTimeEntry.isPending}
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          {deleteTimeEntry.isPending ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {timeEntries.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllTimesModal(true)}
                      className="px-6"
                    >
                      Ver todas las entradas ({timeEntries.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay entradas de tiempo
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Aún no se han registrado entradas de tiempo para esta tarea. 
                  Comienza a registrar el tiempo dedicado para hacer seguimiento del progreso.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateTimeModal(true)}
                  className="px-6"
                >
                  Registrar Primera Entrada
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4">
          
          {/* Project Info - Compact */}
          {project && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Proyecto
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  Ver
                </Button>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {project.name}
                </p>
                {project.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Task Details - Compact */}
          <Card>
            <div className="flex items-center space-x-2 mb-3">
              <HashIcon className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Detalles
              </h3>
            </div>
            
            <div className="space-y-3">
              {/* Due Date */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-3 h-3 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Vencimiento</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDate(task.due_date)}
                  </p>
                </div>
              </div>

              {/* Estimated Hours */}
              {hasFieldData(task.estimated_hours) && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Estimadas</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTime(task.estimated_hours)}
                    </p>
                  </div>
                </div>
              )}

              {/* Actual Hours */}
              {hasFieldData(task.actual_hours) && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Reales</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTime(task.actual_hours)}
                    </p>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-3 h-3 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Creado</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateTime(task.created_at)}
                  </p>
                </div>
              </div>

              {/* Updated Date */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-3 h-3 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">Actualizado</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDateTime(task.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Task ID - Compact */}
          <Card>
            <div className="flex items-center space-x-2 mb-3">
              <HashIcon className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Información técnica
              </h3>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">ID de la tarea</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all mt-1">
                {task.id}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal para crear nueva entrada de tiempo */}
      {showCreateTimeModal && (
        <TimeEntryModal
          isOpen={showCreateTimeModal}
          onClose={() => setShowCreateTimeModal(false)}
          onSubmit={handleCreateTimeEntry}
          projects={project ? [project] : []}
          tasks={task ? [task] : []}
          isLoading={createTimeEntry.isPending}
        />
      )}

      {/* Modal para ver todas las entradas de tiempo */}
      {showAllTimesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Todas las Entradas de Tiempo
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tarea: {task?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllTimesModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {timeEntries && timeEntries.length > 0 ? (
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleEditTimeEntry(entry)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.hours}h
                          </div>
                          {entry.billable && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Facturable
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {entry.description}
                        </div>
                        {entry.comments && (
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.comments}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            €{entry.billable_amount?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.rate_per_hour ? `@€${entry.rate_per_hour}/h` : 'Sin tarifa'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTimeEntry(entry)}
                          >
                            <EditIcon className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTimeEntry(entry.id)}
                            disabled={deleteTimeEntry.isPending}
                          >
                            <TrashIcon className="w-4 h-4 mr-1" />
                            {deleteTimeEntry.isPending ? 'Eliminando...' : 'Eliminar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No hay entradas de tiempo registradas para esta tarea
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowAllTimesModal(false);
                      setShowCreateTimeModal(true);
                    }}
                  >
                    Registrar Tiempo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar entrada de tiempo */}
      {showEditTimeModal && selectedTimeEntry && (
        <TimeEntryModal
          isOpen={showEditTimeModal}
          onClose={() => setShowEditTimeModal(false)}
          onSubmit={handleUpdateTimeEntry}
          entry={selectedTimeEntry}
          projects={project ? [project] : []}
          tasks={task ? [task] : []}
          isLoading={updateTimeEntry.isPending}
        />
      )}
    </div>
  );
};

export default TaskDetail;