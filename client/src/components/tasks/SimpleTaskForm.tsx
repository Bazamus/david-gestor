import React, { useState } from 'react';
import { TaskStatus, TaskPriority, CreateTaskForm } from '@/types';
import Button from '@/components/common/Button';

interface SimpleTaskFormProps {
  projectId: string;
  onSubmit: (data: CreateTaskForm) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const SimpleTaskForm: React.FC<SimpleTaskFormProps> = ({ 
  projectId, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    due_date: '',
    estimated_hours: '',
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (formData.title.length > 255) {
      newErrors.title = 'El título no puede exceder 255 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateTaskForm = {
      project_id: projectId,
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : undefined,
      tags: formData.tags,
    };

    console.log('SimpleTaskForm: Submitting:', submitData);
    console.log('SimpleTaskForm: Types check:', {
      project_id: typeof submitData.project_id,
      title: typeof submitData.title,
      status: typeof submitData.status,
      priority: typeof submitData.priority,
      estimated_hours: typeof submitData.estimated_hours,
      due_date: typeof submitData.due_date,
    });
    onSubmit(submitData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título *
        </label>
        <input
          id="title"
          type="text"
          placeholder="Título de la tarea"
          value={formData.title}
          onChange={handleInputChange('title')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          placeholder="Descripción detallada de la tarea"
          rows={4}
          value={formData.description}
          onChange={handleInputChange('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={handleInputChange('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TaskStatus.TODO}>Por hacer</option>
            <option value={TaskStatus.IN_PROGRESS}>En progreso</option>
            <option value={TaskStatus.DONE}>Completado</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <select
            value={formData.priority}
            onChange={handleInputChange('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={TaskPriority.LOW}>Baja</option>
            <option value={TaskPriority.MEDIUM}>Media</option>
            <option value={TaskPriority.HIGH}>Alta</option>
            <option value={TaskPriority.URGENT}>Urgente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Vencimiento
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={handleInputChange('due_date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Horas Estimadas
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            value={formData.estimated_hours}
            onChange={handleInputChange('estimated_hours')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
};

export default SimpleTaskForm;