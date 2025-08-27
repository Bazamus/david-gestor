import React, { useState, useMemo } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  // CalendarIcon, DollarSignIcon, and TrendingUpIcon removed as they're not used
  EditIcon,
  TrashIcon,
  CheckCircleIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TimeEntryModal from '@/components/times/TimeEntryModal';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatHours = (hours: number) => {
    return `${hours}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

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
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Entrada
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
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Entradas de Tiempo
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Fecha
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 hidden sm:table-cell">
                  Tarea
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32 hidden md:table-cell">
                  Proyecto
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                  Horas
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Descripción
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20 hidden sm:table-cell">
                  Facturable
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24 hidden md:table-cell">
                  Monto
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <TimeEntryRow
                  key={entry.id}
                  entry={entry}
                  onEdit={() => setEditingEntry(entry)}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  formatDate={formatDate}
                  formatHours={formatHours}
                  formatCurrency={formatCurrency}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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

// Componente de resumen
interface TimeSummaryCardProps {
  summary: any;
}

const TimeSummaryCard: React.FC<TimeSummaryCardProps> = ({ summary }) => {

  // Valores por defecto y validación de datos con mejor manejo de errores
  const totalEntries = typeof summary?.total_entries === 'number' ? summary.total_entries : 0;
  const totalHours = typeof summary?.total_hours === 'number' ? summary.total_hours : 0;
  const billableHours = typeof summary?.billable_hours === 'number' ? summary.billable_hours : 0;
  const billableAmount = typeof summary?.billable_amount === 'number' ? summary.billable_amount : 0;

  // Validar que los valores sean números válidos
  const isValidNumber = (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  };

  const safeTotalEntries = isValidNumber(totalEntries) ? totalEntries : 0;
  const safeTotalHours = isValidNumber(totalHours) ? totalHours : 0;
  const safeBillableHours = isValidNumber(billableHours) ? billableHours : 0;
  const safeBillableAmount = isValidNumber(billableAmount) ? billableAmount : 0;

  // Formatear valores para mostrar
  const formatHours = (hours: number) => `${hours.toFixed(1)}h`;
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Resumen de Tiempo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{safeTotalEntries}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Entradas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatHours(safeTotalHours)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Horas Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatHours(safeBillableHours)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Horas Facturables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(safeBillableAmount)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Monto Facturable</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Componente de fila de entrada
interface TimeEntryRowProps {
  entry: TimeEntry;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  formatHours: (hours: number) => string;
  formatCurrency: (amount: number) => string;
}

const TimeEntryRow: React.FC<TimeEntryRowProps> = ({ 
  entry, 
  onEdit, 
  onDelete, 
  formatDate, 
  formatHours, 
  formatCurrency 
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        <div className="text-xs">
          {formatDate(entry.date)}
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
        <div className="truncate max-w-28" title={entry.task_title}>
          {entry.task_title}
        </div>
      </td>
      <td className="px-3 py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
        <div className="truncate max-w-28" title={entry.project_name}>
          {entry.project_name}
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
        {formatHours(entry.hours)}
      </td>
      <td className="px-3 py-4 text-sm text-gray-900 dark:text-white hidden lg:table-cell">
        <div className="truncate max-w-48" title={entry.description}>
          {entry.description || '-'}
        </div>
      </td>
      <td className="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
        {entry.billable ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Sí
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400">
            No
          </span>
        )}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium hidden md:table-cell">
        {formatCurrency(entry.billable_amount)}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={onEdit}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded transition-colors"
            title="Editar"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Times;
