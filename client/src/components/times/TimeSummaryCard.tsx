import React from 'react';
import Card from '@/components/common/Card';

interface TimeSummaryCardProps {
  summary: {
    total_entries?: number;
    total_hours?: number;
    billable_hours?: number;
    billable_amount?: number;
  };
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center p-2 md:p-0">
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">{safeTotalEntries}</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Entradas</div>
          </div>
          <div className="text-center p-2 md:p-0">
            <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">{formatHours(safeTotalHours)}</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Horas Totales</div>
          </div>
          <div className="text-center p-2 md:p-0">
            <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">{formatHours(safeBillableHours)}</div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Horas Facturables</div>
          </div>
          <div className="text-center p-2 md:p-0">
            <div className="text-lg md:text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(safeBillableAmount)}
            </div>
            <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Monto Facturable</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TimeSummaryCard;
