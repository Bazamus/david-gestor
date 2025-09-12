import React from 'react';
import { EditIcon, TrashIcon, CheckCircleIcon } from 'lucide-react';
import Card from '@/components/common/Card';
import { TimeEntry } from '@/types';

interface TimeEntriesTableProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const TimeEntriesTable: React.FC<TimeEntriesTableProps> = ({ 
  entries, 
  onEdit, 
  onDelete, 
  showActions = true 
}) => {
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

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Entradas de Tiempo
        </h3>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs sm:text-sm min-w-full">
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
              {showActions && (
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {entries.map((entry) => (
              <TimeEntryRow
                key={entry.id}
                entry={entry}
                onEdit={onEdit ? () => onEdit(entry) : undefined}
                onDelete={onDelete ? () => onDelete(entry.id) : undefined}
                formatDate={formatDate}
                formatHours={formatHours}
                formatCurrency={formatCurrency}
                showActions={showActions}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Componente de fila de entrada
interface TimeEntryRowProps {
  entry: TimeEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  formatDate: (date: string) => string;
  formatHours: (hours: number) => string;
  formatCurrency: (amount: number) => string;
  showActions?: boolean;
}

const TimeEntryRow: React.FC<TimeEntryRowProps> = ({ 
  entry, 
  onEdit, 
  onDelete, 
  formatDate, 
  formatHours, 
  formatCurrency,
  showActions = true
}) => {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <td className="px-2 md:px-3 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        <div className="text-xs">
          {formatDate(entry.date)}
        </div>
      </td>
      <td className="px-2 md:px-3 py-3 md:py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
        <div className="truncate max-w-28" title={entry.task_title}>
          {entry.task_title}
        </div>
      </td>
      <td className="px-2 md:px-3 py-3 md:py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
        <div className="truncate max-w-28" title={entry.project_name}>
          {entry.project_name}
        </div>
      </td>
      <td className="px-2 md:px-3 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
        {formatHours(entry.hours)}
      </td>
      <td className="px-2 md:px-3 py-3 md:py-4 text-sm text-gray-900 dark:text-white hidden lg:table-cell">
        <div className="truncate max-w-48" title={entry.description}>
          {entry.description || '-'}
        </div>
      </td>
      <td className="px-2 md:px-3 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
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
      <td className="px-2 md:px-3 py-3 md:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium hidden md:table-cell">
        {formatCurrency(entry.billable_amount)}
      </td>
      {showActions && (
        <td className="px-2 md:px-3 py-3 md:py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1 rounded transition-colors"
                title="Editar"
              >
                <EditIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded transition-colors"
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};

export default TimeEntriesTable;
