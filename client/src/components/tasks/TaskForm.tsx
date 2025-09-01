import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ClockIcon, 
  SaveIcon,
  XIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';

// Types
import { 
  CreateTaskForm, 
  TaskStatus, 
  TaskPriority, 
  Task 
} from '@/types';

// Simplified validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormInputs = z.infer<typeof taskSchema>;

interface TaskFormProps {
  projectId: string;
  task?: Task;
  onSubmit: (data: CreateTaskForm) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  projectId, 
  task, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  const isEditMode = !!task;
  

  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TaskFormInputs>({
    resolver: zodResolver(taskSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? TaskStatus.TODO,
      priority: task?.priority ?? TaskPriority.MEDIUM,
      due_date: task?.due_date ?? '',
      estimated_hours: task?.estimated_hours ?? undefined,
      tags: task?.tags ?? [],
    }
  });

  // Watch tags for dynamic management
  const tags = watch('tags') || [];
  const [newTag, setNewTag] = React.useState('');

  // Reset form when task changes (for edit mode)
  React.useEffect(() => {
    if (task) {
      // Formatear fecha para input date (YYYY-MM-DD)
      let formattedDate = '';
      if (task.due_date) {
        try {
          const date = new Date(task.due_date);
          formattedDate = date.toISOString().split('T')[0];
        } catch (e) {
          formattedDate = '';
        }
      }
      
      const formValues = {
        title: task.title || '',
        description: task.description || '',
        status: task.status || TaskStatus.TODO,
        priority: task.priority || TaskPriority.MEDIUM,
        due_date: formattedDate,
        estimated_hours: task.estimated_hours || undefined,
        tags: task.tags || [],
      };
      
      // Usar setValue para cada campo individualmente
      setValue('title', formValues.title, { shouldValidate: true, shouldDirty: true });
      setValue('description', formValues.description, { shouldValidate: true, shouldDirty: true });
      setValue('status', formValues.status, { shouldValidate: true, shouldDirty: true });
      setValue('priority', formValues.priority, { shouldValidate: true, shouldDirty: true });
      setValue('due_date', formValues.due_date, { shouldValidate: true, shouldDirty: true });
      setValue('estimated_hours', formValues.estimated_hours, { shouldValidate: true, shouldDirty: true });
      setValue('tags', formValues.tags, { shouldValidate: true, shouldDirty: true });
      
      // También hacer reset como respaldo
      setTimeout(() => {
        reset(formValues);
      }, 100);
    } else {
      reset({
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        due_date: '',
        estimated_hours: undefined,
        tags: [],
      });
    }
  }, [task, reset]);

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
  const handleFormSubmit = (data: TaskFormInputs) => {
    const formData = {
      project_id: projectId,
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date || undefined,
      estimated_hours: data.estimated_hours || undefined,
      tags: data.tags || [],
    };
    
    onSubmit(formData);
  };

  // Status options
  const statusOptions = [
    { value: TaskStatus.TODO, label: 'Por hacer', color: 'bg-gray-500' },
    { value: TaskStatus.IN_PROGRESS, label: 'En progreso', color: 'bg-blue-500' },
    { value: TaskStatus.DONE, label: 'Completado', color: 'bg-green-500' },
  ];

  // Priority options
  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Baja', color: 'bg-gray-400' },
    { value: TaskPriority.MEDIUM, label: 'Media', color: 'bg-blue-500' },
    { value: TaskPriority.HIGH, label: 'Alta', color: 'bg-orange-500' },
    { value: TaskPriority.URGENT, label: 'Urgente', color: 'bg-red-500' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título *
        </label>
        <Input
          id="title"
          type="text"
          placeholder="Título de la tarea"
          {...register('title')}
          error={errors.title?.message}
          key={`title-${task?.id || 'new'}`}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
                        <Textarea
                  id="description"
                  placeholder="Descripción detallada de la tarea"
                  rows={4}
                  {...register('description')}
                  error={errors.description?.message}
                  key={`description-${task?.id || 'new'}`}
                />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={statusOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
              />
            )}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Prioridad
          </label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                options={priorityOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.priority?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de Vencimiento
          </label>
          <Controller
            name="due_date"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Input
                type="date"
                value={value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                className="w-full"
              />
            )}
          />
        </div>

        {/* Estimated Hours */}
        <div>
          <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Horas Estimadas
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
                          <Input
                id="estimated_hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
                className="pl-10"
                {...register('estimated_hours', { 
                  valueAsNumber: true,
                  setValueAs: (value) => value === '' ? undefined : Number(value)
                })}
                error={errors.estimated_hours?.message}
                key={`estimated_hours-${task?.id || 'new'}`}
              />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Etiquetas
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag: string, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <span>{tag}</span>
              <button 
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-blue-200 rounded-full p-1 transition-colors"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={newTag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Nueva etiqueta"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleAddTag}
          >
            Agregar
          </Button>
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
          <XIcon className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditMode ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              {isEditMode ? 'Actualizar Tarea' : 'Crear Tarea'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
