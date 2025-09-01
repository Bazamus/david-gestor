import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Components
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Types
import { CreateTaskForm, TaskStatus, TaskPriority, Project } from '@/types';

// Validation schema
const universalTaskSchema = z.object({
  project_id: z.string().min(1, 'Debe seleccionar un proyecto'),
  title: z.string().min(1, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().min(0, 'Las horas deben ser positivas').optional().nullable(),
  tags: z.array(z.string()).optional(),
});

type UniversalTaskFormInputs = z.infer<typeof universalTaskSchema>;

interface UniversalTaskFormProps {
  projects: Project[] | undefined;
  projectsLoading: boolean;
  onSubmit: (data: CreateTaskForm) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const UniversalTaskForm: React.FC<UniversalTaskFormProps> = ({
  projects,
  projectsLoading,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UniversalTaskFormInputs>({
    resolver: zodResolver(universalTaskSchema),
    mode: 'onSubmit',
    defaultValues: {
      project_id: '',
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      due_date: '',
      estimated_hours: undefined,
      tags: [],
    }
  });

  // Watch tags for dynamic management
  const tags = watch('tags') || [];

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag: string) => tag !== tagToRemove);
    setValue('tags', updatedTags);
  };

  // Handle form submission
  const handleFormSubmit = (data: UniversalTaskFormInputs) => {
    const formData: CreateTaskForm = {
      project_id: data.project_id,
      title: data.title,
      description: data.description || undefined,
      status: data.status || TaskStatus.TODO,
      priority: data.priority || TaskPriority.MEDIUM,
      due_date: data.due_date || undefined,
      estimated_hours: data.estimated_hours || undefined,
      tags: data.tags || [],
    };
    
    onSubmit(formData);
  };

  // Status options
  const statusOptions = [
    { value: TaskStatus.TODO, label: 'Por hacer' },
    { value: TaskStatus.IN_PROGRESS, label: 'En progreso' },
    { value: TaskStatus.DONE, label: 'Completado' },
  ];

  // Priority options
  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Baja' },
    { value: TaskPriority.MEDIUM, label: 'Media' },
    { value: TaskPriority.HIGH, label: 'Alta' },
    { value: TaskPriority.URGENT, label: 'Urgente' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Proyecto <span className="text-red-500">*</span>
        </label>
        {projectsLoading ? (
          <div className="flex items-center space-x-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-500">Cargando proyectos...</span>
          </div>
        ) : (
          <Select
            {...register('project_id')}
            error={errors.project_id?.message}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar proyecto</option>
            {Array.isArray(projects) && projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Título <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('title')}
          placeholder="Ingrese el título de la tarea"
          error={errors.title?.message}
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <Textarea
          {...register('description')}
          placeholder="Descripción detallada de la tarea (opcional)"
          rows={4}
          error={errors.description?.message}
          disabled={isSubmitting}
        />
      </div>

      {/* Status and Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <Select
            {...register('status')}
            error={errors.status?.message}
            disabled={isSubmitting}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioridad
          </label>
          <Select
            {...register('priority')}
            error={errors.priority?.message}
            disabled={isSubmitting}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Due Date and Estimated Hours Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de vencimiento
          </label>
          <Input
            {...register('due_date')}
            type="date"
            error={errors.due_date?.message}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Horas estimadas
          </label>
          <Input
            {...register('estimated_hours', {
              setValueAs: (value) => value === '' ? undefined : Number(value)
            })}
            type="number"
            min="0"
            step="0.5"
            placeholder="Ej: 2.5"
            error={errors.estimated_hours?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Etiquetas
        </label>
        
        {/* Tag Input */}
        <div className="flex space-x-2 mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Agregar etiqueta"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            disabled={!newTag.trim() || isSubmitting}
          >
            Agregar
          </Button>
        </div>

        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  disabled={isSubmitting}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
};

export default UniversalTaskForm;