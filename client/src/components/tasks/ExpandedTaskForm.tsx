import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Save, 
  X, 
  User,
  BarChart3,
  CheckSquare
} from 'lucide-react';

// Components
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Accordion from '../common/Accordion';
import ComplexitySelector from './ComplexitySelector';
import ExpandedTaskFormSections from './ExpandedTaskFormSections';

// Hooks
import { useProjects } from '@/hooks/useProjects';

// Types and Schemas
import { 
  CreateTaskForm, 
  UpdateTaskForm, 
  TaskStatus, 
  TaskPriority, 
  TipoTarea, 
  ComplejidadTarea,
  ProjectStatus,
  Task
} from '../../types';

import { 
  createTaskSchemaWithValidations, 
  updateTaskSchemaWithValidations
} from '../../schemas/taskSchemas';

interface ExpandedTaskFormProps {
  projectId?: string; // Hacer opcional para permitir selección desde /tasks/new
  task?: Task;
  onSubmit: (data: CreateTaskForm | UpdateTaskForm) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ExpandedTaskForm: React.FC<ExpandedTaskFormProps> = ({
  projectId,
  task,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const isEditMode = !!task;
  
  // Obtener proyectos en estados PLANNING, ACTIVE y ON_HOLD para el selector
  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useProjects(
    {
      status: [ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD],
      sort_by: 'name',
      sort_order: 'asc'
    },
    {
      enabled: !projectId // Solo cargar si no tenemos projectId
    }
  );


  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    management: false,
    progress: false,
    criteria: false,
    technical: false,
    dependencies: false,
    files: false,
    automation: false,
  });

  // Form setup con schema de validación
  const schema = isEditMode ? updateTaskSchemaWithValidations : createTaskSchemaWithValidations;
  const resolver = zodResolver(schema);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm({
    resolver,
    mode: 'onChange',
    defaultValues: {
      project_id: projectId || '', // Manejar caso cuando projectId es undefined
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || TaskStatus.NADA,
      priority: task?.priority || TaskPriority.MEDIUM,
      due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      estimated_hours: task?.estimated_hours || undefined,
      tags: task?.tags || [],
      position: task?.position || 0,
      
      // Campos expandidos
      tipo_tarea: (task?.tipo_tarea as TipoTarea) || 'desarrollo',
      asignado_a: task?.asignado_a || '',
      complejidad: (task?.complejidad as ComplejidadTarea) || 3,
      tarea_padre_id: task?.tarea_padre_id || '',
      porcentaje_completado: task?.porcentaje_completado || 0,
      tiempo_estimado_horas: task?.tiempo_estimado_horas || undefined,
      tiempo_real_horas: task?.tiempo_real_horas || undefined,
      fecha_inicio: task?.fecha_inicio ? new Date(task.fecha_inicio).toISOString().split('T')[0] : '',
      criterios_aceptacion: task?.criterios_aceptacion || [],
      definicion_terminado: task?.definicion_terminado || '',
      bloqueadores: task?.bloqueadores || '',
      branch_git: task?.branch_git || '',
      commit_relacionado: task?.commit_relacionado || '',
      url_pull_request: task?.url_pull_request || '',
      dependencias: task?.dependencias || [],
      impacto_otras_tareas: task?.impacto_otras_tareas || '',
      archivos_adjuntos: task?.archivos_adjuntos || [],
      enlaces_referencia: task?.enlaces_referencia || [],
      onedrive_folder_id: task?.onedrive_folder_id || '',
      es_recurrente: task?.es_recurrente || false,
      notas_internas: task?.notas_internas || '',
    }
  });

  // Watch para campos reactivos
  const esRecurrente = watch('es_recurrente') ?? false;
  const tags = watch('tags') || [];

  // Estado para gestión de tags
  const [newTag, setNewTag] = useState('');

  // Opciones para selects
  const statusOptions = [
    { value: TaskStatus.NADA, label: 'Sin Empezar' },
    { value: TaskStatus.TODO, label: 'Por Hacer' },
    { value: TaskStatus.IN_PROGRESS, label: 'En Proceso' },
    { value: TaskStatus.EN_PROGRESO, label: 'En Progreso' },
    { value: TaskStatus.DONE, label: 'Hecho' },
    { value: TaskStatus.COMPLETADA, label: 'Completada' },
  ];

  const priorityOptions = [
    { value: TaskPriority.LOW, label: 'Baja' },
    { value: TaskPriority.MEDIUM, label: 'Media' },
    { value: TaskPriority.HIGH, label: 'Alta' },
    { value: TaskPriority.URGENT, label: 'Urgente' },
  ];

  const tipoTareaOptions = [
    { value: 'desarrollo', label: 'Desarrollo' },
    { value: 'diseño', label: 'Diseño' },
    { value: 'testing', label: 'Testing' },
    { value: 'documentación', label: 'Documentación' },
    { value: 'reunión', label: 'Reunión' },
    { value: 'investigación', label: 'Investigación' },
    { value: 'revisión', label: 'Revisión' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'bug_fix', label: 'Corrección de Bug' },
    { value: 'feature', label: 'Nueva Funcionalidad' },
    { value: 'refactoring', label: 'Refactoring' },
  ];

  // Opciones de proyectos (solo si no viene projectId predefinido)
  const projectOptions = projects.map(project => ({
    value: project.id,
    label: project.name
  }));






  // Funciones de utilidad
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag: string) => tag !== tagToRemove));
  };

  // Función de envío
  const onFormSubmit = async (data: CreateTaskForm | UpdateTaskForm) => {
    try {
      console.log('🚀 Datos del formulario recibidos:', data);
      console.log('🔍 Tipo de datos:', typeof data);
      console.log('🔍 Claves del objeto:', Object.keys(data));
      
      // Limpiar enlaces vacíos
      const enlacesLimpios = (data.enlaces_referencia || []).filter(enlace => enlace.trim() !== '');
      
      // Función para limpiar campos vacíos
      const cleanEmptyFields = (obj: any) => {
        const cleaned: any = {};
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          
          // Solo incluir campos que tienen valores válidos
          if (value === '' || value === undefined || value === null) {
            // NO incluir campos vacíos - dejar que el backend use sus defaults
            return;
          } else if (Array.isArray(value)) {
            // Para arrays, incluir solo si no están vacíos
            if (value.length > 0) {
              cleaned[key] = value;
            }
          } else if (typeof value === 'string' && value.trim() === '') {
            // NO incluir strings vacíos
            return;
          } else if (typeof value === 'number' && isNaN(value)) {
            // NO incluir números NaN
            return;
          } else {
            // Mantener el valor original si es válido
            cleaned[key] = value;
          }
        });
        return cleaned;
      };
      
      // Lógica especial para campos de recurrencia
      let processedData = {
        ...data,
        enlaces_referencia: enlacesLimpios,
        // Asegurar que los arrays no sean undefined
        tags: data.tags || [],
        dependencias: data.dependencias || [],
        criterios_aceptacion: data.criterios_aceptacion || [],
        archivos_adjuntos: data.archivos_adjuntos || [],
      };



      const formData = cleanEmptyFields(processedData);

      console.log('📤 Datos procesados a enviar:', formData);
      console.log('📤 JSON stringified:', JSON.stringify(formData, null, 2));
      console.log('📤 Campos obligatorios:', {
        project_id: formData.project_id,
        title: formData.title
      });
      
      await onSubmit(formData);
      console.log('✅ Tarea enviada exitosamente');
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      console.error('❌ Detalles del error:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
    }
  };

  // Calcular progreso del formulario
  const calculateProgress = () => {
    const requiredFields = ['title', 'tipo_tarea', 'complejidad'];
    const filledRequired = requiredFields.filter(field => {
      const value = getValues(field as keyof (CreateTaskForm | UpdateTaskForm));
      return value !== undefined && value !== '';
    }).length;

    const optionalFields = [
      'description', 'asignado_a', 'fecha_inicio', 'tiempo_estimado_horas',
      'definicion_terminado', 'branch_git', 'impacto_otras_tareas'
    ];
    const filledOptional = optionalFields.filter(field => {
      const value = getValues(field as keyof (CreateTaskForm | UpdateTaskForm));
      return value !== undefined && value !== '';
    }).length;

    return Math.round(((filledRequired + filledOptional * 0.5) / (requiredFields.length + optionalFields.length * 0.5)) * 100);
  };

  const progress = calculateProgress();

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Header con progreso */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditMode ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completa la información de la tarea
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progreso: {progress}%
          </div>
          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN BÁSICA - Siempre visible */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-4">

          
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <CheckSquare size={20} />
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <Input
                label="Título de la tarea *"
                {...register('title')}
                error={errors.title?.message}
                placeholder="Ej: Implementar sistema de autenticación"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <Textarea
                label="Descripción"
                {...register('description')}
                error={errors.description?.message}
                placeholder="Describe los detalles de la tarea..."
                rows={3}
              />
            </div>

            {/* Proyecto (solo mostrar si no viene predefinido) */}
            {!projectId && (
              <div className="md:col-span-2">
                {projectsLoading ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proyecto *
                    </label>
                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Cargando proyectos...</span>
                      </div>
                    </div>
                  </div>
                ) : projectsError ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proyecto *
                    </label>
                    <div className="px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Error al cargar proyectos: {projectsError.message}
                      </span>
                    </div>
                  </div>
                ) : projects && projects.length > 0 ? (
                  <Select
                    label="Proyecto *"
                    {...register('project_id')}
                    options={projectOptions}
                    error={errors.project_id?.message}
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proyecto *
                    </label>
                    <div className="px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">
                        No hay proyectos disponibles. Crea un proyecto primero.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estado y Prioridad */}
            <Select
              label="Estado"
              {...register('status')}
              options={statusOptions}
              error={errors.status?.message}
            />

            <Select
              label="Prioridad"
              {...register('priority')}
              options={priorityOptions}
              error={errors.priority?.message}
            />

            {/* Fecha límite y Horas estimadas */}
            <Input
              label="Fecha límite"
              type="date"
              {...register('due_date')}
              error={errors.due_date?.message}
            />

            <Input
              label="Horas estimadas"
              type="number"
              step="0.5"
              min="0"
              {...register('estimated_hours', { valueAsNumber: true })}
              error={errors.estimated_hours?.message}
              placeholder="Ej: 8.5"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Añadir etiqueta..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                Añadir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: GESTIÓN Y ASIGNACIÓN */}
      <Accordion
        title="Gestión y Asignación"
        icon={<User size={20} />}
        isOpen={expandedSections.management}
        onToggle={() => toggleSection('management')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de tarea *"
            {...register('tipo_tarea')}
            options={tipoTareaOptions}
            error={errors.tipo_tarea?.message}
          />

          <Input
            label="Asignado a"
            {...register('asignado_a')}
            error={errors.asignado_a?.message}
            placeholder="Nombre de la persona responsable"
          />

          <div className="md:col-span-2">
            <Controller
              name="complejidad"
              control={control}
              render={({ field }) => (
                <ComplexitySelector
                  value={field.value || 1}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.complejidad && (
              <p className="text-red-500 text-xs mt-1">{errors.complejidad.message}</p>
            )}
          </div>

          <Input
            label="Tarea padre (ID)"
            {...register('tarea_padre_id')}
            error={errors.tarea_padre_id?.message}
            placeholder="ID de la tarea padre (opcional)"
          />
        </div>
      </Accordion>

      {/* SECCIÓN 2: SEGUIMIENTO Y PROGRESO */}
      <Accordion
        title="Seguimiento y Progreso"
        icon={<BarChart3 size={20} />}
        isOpen={expandedSections.progress}
        onToggle={() => toggleSection('progress')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Porcentaje completado (%)"
            type="number"
            min="0"
            max="100"
            {...register('porcentaje_completado', { valueAsNumber: true })}
            error={errors.porcentaje_completado?.message}
          />

          <Input
            label="Tiempo estimado (horas)"
            type="number"
            step="0.5"
            min="0"
            {...register('tiempo_estimado_horas', { valueAsNumber: true })}
            error={errors.tiempo_estimado_horas?.message}
          />

          <Input
            label="Tiempo real (horas)"
            type="number"
            step="0.5"
            min="0"
            {...register('tiempo_real_horas', { valueAsNumber: true })}
            error={errors.tiempo_real_horas?.message}
          />

          <Input
            label="Fecha de inicio"
            type="date"
            {...register('fecha_inicio')}
            error={errors.fecha_inicio?.message}
          />
        </div>
      </Accordion>

      {/* SECCIONES ADICIONALES */}
      <ExpandedTaskFormSections
        control={control}
        register={register}
        errors={errors}
        getValues={getValues}
        setValue={setValue}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        projectId={projectId || ''}
        currentTaskId={task?.id}
        esRecurrente={esRecurrente}
      />
      
      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X size={16} className="mr-2" />
          Cancelar
        </Button>
        {/* DEBUG: Mostrar errores de validación */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <h4 className="text-red-800 font-medium mb-2">Errores de validación:</h4>
            <ul className="text-xs text-red-600">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error?.message || 'Error de validación'}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button
          type="submit"
          disabled={isSubmitting || false} // Temporalmente forzar habilitado
          loading={isSubmitting}
        >
          <Save size={16} className="mr-2" />
          {isEditMode ? 'Actualizar' : 'Crear'} Tarea
        </Button>
      </div>
    </form>
  );
};

export default ExpandedTaskForm;
