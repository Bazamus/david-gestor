import React, { useState, useMemo } from 'react';
import { 
  ClockIcon, 
  PlusIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TimeEntryModal from '@/components/times/TimeEntryModal';
import TimeSummaryCard from '@/components/times/TimeSummaryCard';
import TimeEntriesTable from '@/components/times/TimeEntriesTable';
import { useNotifications } from '@/contexts/NotificationContext';

// Hooks
import { 
  useTimeEntries, 
  useCreateTimeEntry, 
  useUpdateTimeEntry, 
  useDeleteTimeEntry,
  useTimeSummary 
} from '@/hooks/useTimeEntries';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';

// Types
import { TimeEntry, TimeEntryFilters, CreateTimeEntryRequest, UpdateTimeEntryRequest } from '@/types';

const Times: React.FC = () => {
  const { addNotification } = useNotifications();
  const [filters, setFilters] = useState<TimeEntryFilters>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  // Queries
  const { data: timeEntries, isLoading, isError } = useTimeEntries(filters);
  const { data: summary } = useTimeSummary(filters);
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks({});

  // Mutations
  const createTimeEntry = useCreateTimeEntry();
  const updateTimeEntry = useUpdateTimeEntry();
  const deleteTimeEntry = useDeleteTimeEntry();

  // Handlers
  const handleFilterChange = (newFilters: Partial<TimeEntryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleCreateEntry = async (data: CreateTimeEntryRequest | UpdateTimeEntryRequest) => {
    try {
      await createTimeEntry.mutateAsync(data as CreateTimeEntryRequest);
      addNotification({
        type: 'success',
        title: 'Entrada creada',
        message: 'La entrada de tiempo ha sido creada correctamente'
      });
      setShowCreateModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al crear entrada',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleUpdateEntry = async (id: string, data: Partial<CreateTimeEntryRequest>) => {
    try {
      await updateTimeEntry.mutateAsync({ id, data });
      addNotification({
        type: 'success',
        title: 'Entrada actualizada',
        message: 'La entrada de tiempo ha sido actualizada correctamente'
      });
      setEditingEntry(null);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error al actualizar entrada',
        message: error instanceof Error ? error.message : 'Error inesperado'
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada de tiempo?')) {
      try {
        await deleteTimeEntry.mutateAsync(id);
        addNotification({
          type: 'success',
          title: 'Entrada eliminada',
          message: 'La entrada de tiempo ha sido eliminada correctamente'
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Error al eliminar entrada',
          message: error instanceof Error ? error.message : 'Error inesperado'
        });
      }
    }
  };

  // Computed values
  const filteredEntries = useMemo(() => {
    if (!timeEntries) return [];
    return timeEntries;
  }, [timeEntries]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudieron cargar las entradas de tiempo</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestión de Tiempos"
        subtitle="Registra y gestiona el tiempo dedicado a cada tarea"
        icon={ClockIcon}
        actions={
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="text-sm px-3 py-2 md:px-4 md:py-2"
          >
            <PlusIcon className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Nueva Entrada</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        }
      />

      {/* Filtros */}
      <TimeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        projects={projects || []}
        tasks={tasks || []}
      />

      {/* Resumen */}
      <TimeSummaryCard summary={summary || {
        total_entries: 0,
        total_hours: 0,
        billable_hours: 0,
        billable_amount: 0,
        average_hours_per_day: 0,
        recent_entries: []
      }} />

      {/* Tabla de entradas */}
      <TimeEntriesTable 
        entries={filteredEntries}
        onEdit={setEditingEntry}
        onDelete={handleDeleteEntry}
        showActions={true}
      />

      {/* Modal de creación/edición */}
      {(showCreateModal || editingEntry) && (
        <TimeEntryModal
          isOpen={showCreateModal || !!editingEntry}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEntry(null);
          }}
          onSubmit={editingEntry ? 
            (data) => handleUpdateEntry(editingEntry.id, data) : 
            handleCreateEntry
          }
          entry={editingEntry}
          projects={projects || []}
          tasks={tasks || []}
          isLoading={createTimeEntry.isPending || updateTimeEntry.isPending}
        />
      )}
    </div>
  );
};

// Componente de filtros
interface TimeFiltersProps {
  filters: TimeEntryFilters;
  onFilterChange: (filters: Partial<TimeEntryFilters>) => void;
  projects: any[];
  tasks: any[];
}

const TimeFilters: React.FC<TimeFiltersProps> = ({ filters, onFilterChange, projects, tasks }) => {
  return (
    <Card>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <SearchInput
              placeholder="Buscar en descripciones..."
              onSearch={(value) => onFilterChange({ search: value })}
              initialValue={filters.search || ''}
            />
          </div>

          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proyecto
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={filters.project_id || ''}
              onChange={(e) => onFilterChange({ project_id: e.target.value || undefined })}
            >
              <option value="">Todos los proyectos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tarea
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={filters.task_id || ''}
              onChange={(e) => onFilterChange({ task_id: e.target.value || undefined })}
            >
              <option value="">Todas las tareas</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {/* Facturable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Facturable
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={filters.billable === undefined ? '' : filters.billable.toString()}
              onChange={(e) => onFilterChange({ 
                billable: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
            >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={filters.date_from || ''}
                onChange={(e) => onFilterChange({ date_from: e.target.value || undefined })}
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={filters.date_to || ''}
                onChange={(e) => onFilterChange({ date_to: e.target.value || undefined })}
              />
            </div>

            {/* Botón limpiar filtros de fecha */}
            <div className="flex items-end">
              <button
                onClick={() => onFilterChange({ date_from: undefined, date_to: undefined })}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Limpiar fechas
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};


export default Times;
