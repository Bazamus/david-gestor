import React, { useState, useEffect, useMemo } from 'react';
import { 
  XIcon, 
  CalendarIcon, 
  ClockIcon, 
  DollarSignIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
// Input import removed as it's not used
import Textarea from '@/components/common/Textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Types
import { 
  TimeEntry, 
  CreateTimeEntryRequest, 
  UpdateTimeEntryRequest,
  Project,
  Task
} from '@/types';

// ======================================
// INTERFACES
// ======================================

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTimeEntryRequest | UpdateTimeEntryRequest) => Promise<void>;
  entry?: TimeEntry | null;
  projects: Project[];
  tasks: Task[];
  isLoading?: boolean;
}

interface FormData {
  project_id: string;
  task_id: string;
  date: string;
  hours: string;
  start_time: string;
  end_time: string;
  description: string;
  comments: string;
  billable: boolean;
  rate_per_hour: string;
}

interface ValidationErrors {
  project_id?: string;
  task_id?: string;
  date?: string;
  hours?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  rate_per_hour?: string;
}

// ======================================
// COMPONENTE PRINCIPAL
// ======================================

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  entry,
  projects,
  tasks,
  isLoading = false
}) => {
  // Estados
  const [formData, setFormData] = useState<FormData>({
    project_id: '',
    task_id: '',
    date: '',
    hours: '',
    start_time: '',
    end_time: '',
    description: '',
    comments: '',
    billable: true,
    rate_per_hour: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const filteredTasks = useMemo(() => {
    if (!formData.project_id) return [];
    return tasks.filter(task => task.project_id === formData.project_id);
  }, [tasks, formData.project_id]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === formData.project_id);
  }, [projects, formData.project_id]);

  const selectedTask = useMemo(() => {
    return tasks.find(t => t.id === formData.task_id);
  }, [tasks, formData.task_id]);

  const effectiveRate = useMemo(() => {
    // Prioridad: rate_per_hour > task_rate > project_rate
    if (formData.rate_per_hour && parseFloat(formData.rate_per_hour) > 0) {
      return parseFloat(formData.rate_per_hour);
    }
    if (selectedTask?.hourly_rate && selectedTask.hourly_rate > 0) {
      return selectedTask.hourly_rate;
    }
    if (selectedProject?.default_hourly_rate && selectedProject.default_hourly_rate > 0) {
      return selectedProject.default_hourly_rate;
    }
    return 0;
  }, [formData.rate_per_hour, selectedTask, selectedProject]);

  const totalBillable = useMemo(() => {
    const hours = parseFloat(formData.hours) || 0;
    return hours * effectiveRate;
  }, [formData.hours, effectiveRate]);

  // Effects
  useEffect(() => {
    if (entry) {
      // Modo edición
      setFormData({
        project_id: entry.project_id || '',
        task_id: entry.task_id || '',
        date: entry.date || '',
        hours: entry.hours?.toString() || '',
        start_time: entry.start_time || '',
        end_time: entry.end_time || '',
        description: entry.description || '',
        comments: entry.comments || '',
        billable: entry.billable ?? true,
        rate_per_hour: entry.rate_per_hour?.toString() || ''
      });
    } else {
      // Modo creación
      setFormData({
        project_id: '',
        task_id: '',
        date: new Date().toISOString().split('T')[0], // Hoy por defecto
        hours: '',
        start_time: '',
        end_time: '',
        description: '',
        comments: '',
        billable: true,
        rate_per_hour: ''
      });
    }
    setErrors({});
  }, [entry, isOpen]);

  // Handlers
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Cascada: si cambia el proyecto, resetear tarea
    if (field === 'project_id') {
      setFormData(prev => ({ ...prev, task_id: '', rate_per_hour: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validaciones requeridas
    if (!formData.project_id) {
      newErrors.project_id = 'Selecciona un proyecto';
    }

    if (!formData.task_id) {
      newErrors.task_id = 'Selecciona una tarea';
    }

    if (!formData.date) {
      newErrors.date = 'Selecciona una fecha';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'La fecha no puede ser futura';
      }
    }

    if (!formData.hours) {
      newErrors.hours = 'Ingresa las horas dedicadas';
    } else {
      const hours = parseFloat(formData.hours);
      if (isNaN(hours) || hours <= 0) {
        newErrors.hours = 'Las horas deben ser un número positivo';
      } else if (hours > 24) {
        newErrors.hours = 'Las horas no pueden exceder 24';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ingresa una descripción';
    }

    // Validaciones de tiempo (si se proporcionan)
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      
      if (start >= end) {
        newErrors.end_time = 'La hora de fin debe ser posterior a la de inicio';
      }
    }

    // Validación de tarifa personalizada
    if (formData.rate_per_hour) {
      const rate = parseFloat(formData.rate_per_hour);
      if (isNaN(rate) || rate < 0) {
        newErrors.rate_per_hour = 'La tarifa debe ser un número positivo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        project_id: formData.project_id,
        task_id: formData.task_id,
        date: formData.date,
        hours: parseFloat(formData.hours),
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        description: formData.description.trim(),
        comments: formData.comments.trim() || undefined,
        billable: formData.billable,
        rate_per_hour: formData.rate_per_hour ? parseFloat(formData.rate_per_hour) : undefined
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error al guardar entrada:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Render
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {entry ? 'Editar Entrada de Tiempo' : 'Nueva Entrada de Tiempo'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registra el tiempo dedicado a una tarea específica
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Proyecto y Tarea - Cascada */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proyecto *
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                  errors.project_id ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.project_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tarea *
              </label>
              <select
                value={formData.task_id}
                onChange={(e) => handleInputChange('task_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                  errors.task_id ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting || !formData.project_id}
              >
                <option value="">
                  {formData.project_id ? 'Selecciona una tarea' : 'Primero selecciona un proyecto'}
                </option>
                {filteredTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
              {errors.task_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.task_id}
                </p>
              )}
            </div>
          </div>

          {/* Fecha y Horas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                    errors.date ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Horas Dedicadas *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => handleInputChange('hours', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                    errors.hours ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.hours}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => handleInputChange('billable', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700"
                  disabled={isSubmitting}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facturable</span>
              </label>
            </div>
          </div>

          {/* Horas de Inicio/Fin - Opcional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora de Inicio (Opcional)
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora de Fin (Opcional)
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                  errors.end_time ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              />
              {errors.end_time && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.end_time}
                </p>
              )}
            </div>
          </div>

          {/* Descripción y Comentarios */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el trabajo realizado..."
                rows={3}
                className={errors.description ? 'border-red-500 dark:border-red-400' : ''}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios (Opcional)
              </label>
              <Textarea
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Comentarios adicionales..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Configuración de Facturación */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-2" />
              Configuración de Facturación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarifa por Hora (€)
                </label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate_per_hour}
                    onChange={(e) => handleInputChange('rate_per_hour', e.target.value)}
                    placeholder="Tarifa personalizada"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white ${
                      errors.rate_per_hour ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.rate_per_hour && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircleIcon className="w-4 h-4 mr-1" />
                    {errors.rate_per_hour}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {effectiveRate > 0 ? (
                    <>
                      Tarifa efectiva: <span className="font-medium">{effectiveRate.toFixed(2)}€/h</span>
                      {selectedTask?.hourly_rate && (
                        <span className="ml-2">(Tarea: {selectedTask.hourly_rate}€/h)</span>
                      )}
                      {selectedProject?.default_hourly_rate && !selectedTask?.hourly_rate && (
                        <span className="ml-2">(Proyecto: {selectedProject.default_hourly_rate}€/h)</span>
                      )}
                    </>
                  ) : (
                    'No hay tarifa configurada'
                  )}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Facturable
                </label>
                <div className="bg-white dark:bg-gray-600 p-3 border border-gray-300 dark:border-gray-500 rounded-md">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalBillable.toFixed(2)}€
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formData.hours ? `${formData.hours}h × ${effectiveRate.toFixed(2)}€/h` : 'Calculando...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="min-w-[120px]"
            >
              {isSubmitting || isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {entry ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryModal;
