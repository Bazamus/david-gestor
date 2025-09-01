import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FolderIcon, 
  EditIcon, 
  TrashIcon,
  PlusIcon,
  BarChart3Icon,
  CheckSquareIcon,
  BuildingIcon,
  CodeIcon,
  DollarSignIcon,
  TagIcon,
  GlobeIcon,
  LinkIcon,
  ChevronLeftIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { StatsCard } from '@/components/common/Card';

// Hooks
import { useProject, useProjectStats, useDeleteProject } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { useProjectTabs } from '@/hooks/useProjectTabs';

// Types
import { ProjectStatus } from '@/types';

// Tab Components
// ProjectSummary import removed as it's not used
import ProjectTasks from '@/components/project/ProjectTasks';
import ProjectKanban from '@/components/project/ProjectKanban';
import ProjectStats from '@/components/project/ProjectStats';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Hooks
  const { data: project, isLoading, isError } = useProject(id!);
  const { data: stats } = useProjectStats(id!);
  const { data: tasks } = useProjectTasks(id!);
  const deleteProject = useDeleteProject();
  const { activeTab, tabs, setActiveTab } = useProjectTabs();

  const handleDeleteProject = async () => {
    if (!project) return;
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteProject.mutateAsync(project.id);
        navigate('/projects');
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
      }
    }
  };

  const handleEditProject = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleCreateTask = () => {
    navigate(`/projects/${id}/tasks/new`);
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (isError || !project) {
    return <ProjectDetailError onRetry={() => window.location.reload()} />;
  }

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case ProjectStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case ProjectStatus.ON_HOLD:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case ProjectStatus.PLANNING:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return 'Activo';
      case ProjectStatus.COMPLETED:
        return 'Completado';
      case ProjectStatus.ON_HOLD:
        return 'En Pausa';
      case ProjectStatus.PLANNING:
        return 'Planificación';
      default:
        return 'Desconocido';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Media':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Baja':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'Pagado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Parcial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Pendiente':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            {/* Información del Proyecto */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                icon={<ChevronLeftIcon className="w-4 h-4" />}
                onClick={handleBackToProjects}
                size="sm"
              >
                Volver
              </Button>
              
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: project.color }}
              >
                <FolderIcon className="w-5 h-5 text-white" />
              </div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                    {project.description}
                  </p>
                )}
              </div>
              
              {/* Badges de Estado */}
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
                {project.prioridad && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.prioridad)}`}>
                    {project.prioridad}
                  </span>
                )}
                {stats && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {stats.completed_tasks || 0}/{stats.total_tasks || 0}
                  </span>
                )}
              </div>
            </div>
            
            {/* Acciones Desktop */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreateTask}
                size="sm"
              >
                Nueva Tarea
              </Button>
              <Button
                variant="outline"
                icon={<EditIcon className="w-4 h-4" />}
                onClick={handleEditProject}
                size="sm"
              >
                Editar
              </Button>
              <Button
                variant="outline"
                icon={<TrashIcon className="w-4 h-4" />}
                onClick={handleDeleteProject}
                size="sm"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Eliminar
              </Button>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Header Mobile - Primera fila */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="outline"
                icon={<ChevronLeftIcon className="w-4 h-4" />}
                onClick={handleBackToProjects}
                size="sm"
              >
                Volver
              </Button>
              
              {/* Acciones Mobile - Botones más pequeños */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleCreateTask}
                  size="sm"
                  className="px-2 py-1 text-xs"
                >
                  <span className="hidden sm:inline">Nueva</span>
                  <span className="sm:hidden">+</span>
                </Button>
                <Button
                  variant="outline"
                  icon={<EditIcon className="w-4 h-4" />}
                  onClick={handleEditProject}
                  size="sm"
                  className="px-2 py-1 text-xs"
                >
                  <span className="hidden sm:inline">Editar</span>
                  <span className="sm:hidden">✏️</span>
                </Button>
                <Button
                  variant="outline"
                  icon={<TrashIcon className="w-4 h-4" />}
                  onClick={handleDeleteProject}
                  size="sm"
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <span className="hidden sm:inline">Eliminar</span>
                  <span className="sm:hidden">🗑️</span>
                </Button>
              </div>
            </div>

            {/* Información del Proyecto Mobile - Segunda fila */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.color }}
              >
                <FolderIcon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Badges de Estado Mobile - Tercera fila */}
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
              {project.prioridad && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.prioridad)}`}>
                  {project.prioridad}
                </span>
              )}
              {stats && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.completed_tasks || 0}/{stats.total_tasks || 0}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Tabs */}
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Tabs */}
          <nav className="md:hidden flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center space-y-1 py-3 px-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats - Solo en Resumen */}
        {activeTab === 'summary' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Total Tareas"
              value={stats.total_tasks || 0}
              icon={<CheckSquareIcon className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Completadas"
              value={stats.completed_tasks || 0}
              icon={<CheckSquareIcon className="w-6 h-6" />}
              color="green"
            />
            <StatsCard
              title="Pendientes"
              value={stats.pending_tasks || 0}
              icon={<CheckSquareIcon className="w-6 h-6" />}
              color="yellow"
            />
            <StatsCard
              title="Progreso"
              value={`${stats.completion_percentage || 0}%`}
              icon={<BarChart3Icon className="w-6 h-6" />}
              color="purple"
            />
          </div>
        )}

        {/* Contenido de Pestañas */}
        <div className="min-h-[600px]">
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Project Details */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FolderIcon className="w-5 h-5 mr-2" />
                    Información Básica
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fecha de Inicio:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(project.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fecha de Finalización:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(project.end_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Creado:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BuildingIcon className="w-5 h-5 mr-2" />
                    Información del Cliente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Empresa:</span>
                      <span className="text-gray-900 dark:text-white">{project.cliente_empresa || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Contacto Principal:</span>
                      <span className="text-gray-900 dark:text-white">{project.contacto_principal || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="text-gray-900 dark:text-white">{project.email_contacto || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Teléfono:</span>
                      <span className="text-gray-900 dark:text-white">{project.telefono_contacto || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tipo de Proyecto:</span>
                      <span className="text-gray-900 dark:text-white">{project.tipo_proyecto || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Prioridad:</span>
                      <span className={`px-2 py-1 text-sm rounded-full ${getPriorityColor(project.prioridad)}`}>
                        {project.prioridad || 'No especificada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CodeIcon className="w-5 h-5 mr-2" />
                    Aspectos Técnicos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">Stack Tecnológico:</span>
                      {project.stack_tecnologico?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {project.stack_tecnologico.map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-sm rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No especificado</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Repositorio:</span>
                      {project.repositorio_url ? (
                        <a href={project.repositorio_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                          <LinkIcon className="w-4 h-4 mr-1" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No especificado</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Staging:</span>
                      {project.url_staging ? (
                        <a href={project.url_staging} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                          <GlobeIcon className="w-4 h-4 mr-1" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No especificado</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Producción:</span>
                      {project.url_produccion ? (
                        <a href={project.url_produccion} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                          <GlobeIcon className="w-4 h-4 mr-1" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No especificado</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Documentos:</span>
                      {project.url_documentos ? (
                        <a href={project.url_documentos} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
                          <GlobeIcon className="w-4 h-4 mr-1" />
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No especificado</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Budget & Organization */}
              <div className="space-y-6">
                {/* Budget Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <DollarSignIcon className="w-5 h-5 mr-2" />
                    Gestión y Presupuesto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Presupuesto Estimado:</span>
                      <span className="text-gray-900 dark:text-white">
                        {project.presupuesto_estimado ? formatCurrency(project.presupuesto_estimado, project.moneda) : 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Moneda:</span>
                      <span className="text-gray-900 dark:text-white">{project.moneda || 'No especificada'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Horas Estimadas:</span>
                      <span className="text-gray-900 dark:text-white">
                        {project.horas_estimadas ? `${project.horas_estimadas}h` : 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Método de Facturación:</span>
                      <span className="text-gray-900 dark:text-white">{project.metodo_facturacion || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado del Pago:</span>
                      <span className={`px-2 py-1 text-sm rounded-full ${getPaymentStatusColor(project.estado_pago)}`}>
                        {project.estado_pago || 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Organización
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-2">Etiquetas:</span>
                      {project.etiquetas?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {project.etiquetas.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 text-sm rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">No especificadas</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Carpeta de Archivos:</span>
                      <span className="text-gray-900 dark:text-white">{project.carpeta_archivos || 'No especificada'}</span>
                    </div>
                    {project.notas_adicionales && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block mb-2">Notas Adicionales:</span>
                        <p className="text-gray-900 dark:text-white text-sm">{project.notas_adicionales}</p>
                      </div>
                    )}
                    {project.proxima_tarea && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400 block mb-2">Próxima Tarea:</span>
                        <p className="text-gray-900 dark:text-white text-sm">{project.proxima_tarea}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Statistics */}
                {stats && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <BarChart3Icon className="w-5 h-5 mr-2" />
                      Estadísticas Rápidas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Progreso:</span>
                        <span className="text-gray-900 dark:text-white">{stats.completion_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.completion_percentage || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{stats.total_tasks || 0} Total Tareas</span>
                        <span>{stats.completed_tasks || 0} Completadas</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'tasks' && (
            <ProjectTasks projectId={project.id} tasks={tasks} />
          )}
          
          {activeTab === 'kanban' && (
            <ProjectKanban projectId={project.id} />
          )}
          
          {activeTab === 'stats' && (
            <ProjectStats project={project} stats={stats} tasks={tasks} />
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes de estado
const ProjectDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProjectDetailError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
        <span className="text-red-500 text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Error al cargar proyecto
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        No se pudo cargar la información del proyecto
      </p>
      <Button variant="primary" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  </div>
);

export default ProjectDetail;