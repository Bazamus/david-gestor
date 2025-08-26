import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FolderIcon, 
  PaletteIcon,
  SaveIcon,
  XIcon,
  BuildingIcon,
  CodeIcon,
  DollarSignIcon,
  TagIcon,
  // SettingsIcon removed as it's not used
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Textarea from '@/components/common/Textarea';
import Select from '@/components/common/Select';
import Card from '@/components/common/Card';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Accordion from '@/components/common/Accordion';
// import MultiSelect from '@/components/common/MultiSelect';

// Hooks
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useNotifications } from '@/contexts/NotificationContext';

// Types
import { UpdateProjectForm, ProjectStatus } from '@/types';

// Validación con Zod
const projectSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  color: z.string().min(1, 'Selecciona un color'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  // Información del Cliente
  cliente_empresa: z.string().optional(),
  contacto_principal: z.string().optional(),
  email_contacto: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_contacto: z.string().optional(),
  tipo_proyecto: z.string().optional(),
  prioridad: z.enum(['Alta', 'Media', 'Baja']).optional(),
  // Aspectos Técnicos
  stack_tecnologico: z.array(z.string()).optional(),
  repositorio_url: z.string().url('URL inválida').optional().or(z.literal('')),
  url_staging: z.string().url('URL inválida').optional().or(z.literal('')),
  url_produccion: z.string().url('URL inválida').optional().or(z.literal('')),
  // Gestión y Presupuesto
  presupuesto_estimado: z.number().min(0, 'El presupuesto debe ser positivo').optional(),
  moneda: z.enum(['EUR', 'USD', 'MXN', 'COP', 'ARS']).optional(),
  horas_estimadas: z.number().min(0, 'Las horas deben ser positivas').optional(),
  metodo_facturacion: z.enum(['Por horas', 'Precio fijo', 'Por hitos']).optional(),
  estado_pago: z.enum(['Pendiente', 'Parcial', 'Pagado']).optional(),
  // Organización
  etiquetas: z.array(z.string()).optional(),
  carpeta_archivos: z.string().optional(),
  onedrive_folder_id: z.string().optional(),
  imagen_proyecto: z.any().optional(),
  notas_adicionales: z.string().optional(),
  // Seguimiento
  proxima_tarea: z.string().optional(),
});

type ProjectFormInputs = z.infer<typeof projectSchema>;

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Obtener datos del proyecto
  const { data: project, isLoading, isError, error } = useProject(id!);
  
  // Mutación para actualizar proyecto
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject({
    onSuccess: (updatedProject) => {
      console.log('EditProject: Project updated successfully:', updatedProject);
      addNotification({
        type: 'success',
        title: 'Proyecto actualizado',
        message: 'Los datos del proyecto se han actualizado correctamente',
      });
      navigate(`/projects/${id}`);
    },
    onError: (error) => {
      console.error('EditProject: Update failed:', error);
      addNotification({
        type: 'error',
        title: 'Error al actualizar',
        message: error instanceof Error ? error.message : 'Error inesperado',
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ProjectFormInputs>({
    resolver: zodResolver(projectSchema),
    mode: 'onSubmit',
  });

  // Reset form when project data loads
  React.useEffect(() => {
    if (project) {
      console.log('Loading project data into form:', project);
      
      // Formatear fechas para input date (YYYY-MM-DD)
      const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
          return new Date(dateString).toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      // Establecer estados para MultiSelect
      setSelectedColor(project.color || '#3B82F6');
      setSelectedTech(project.stack_tecnologico || []);
      setSelectedTags(project.etiquetas || []);

      const formValues = {
        name: project.name || '',
        description: project.description || '',
        status: project.status || ProjectStatus.PLANNING,
        color: project.color || '#3B82F6',
        start_date: formatDate(project.start_date),
        end_date: formatDate(project.end_date),
        // Información del Cliente
        cliente_empresa: project.cliente_empresa || '',
        contacto_principal: project.contacto_principal || '',
        email_contacto: project.email_contacto || '',
        telefono_contacto: project.telefono_contacto || '',
        tipo_proyecto: project.tipo_proyecto || '',
        prioridad: project.prioridad || 'Media',
        // Aspectos Técnicos
        stack_tecnologico: project.stack_tecnologico || [],
        repositorio_url: project.repositorio_url || '',
        url_staging: project.url_staging || '',
        url_produccion: project.url_produccion || '',
        // Gestión y Presupuesto
        presupuesto_estimado: project.presupuesto_estimado || undefined,
        moneda: project.moneda || 'EUR',
        horas_estimadas: project.horas_estimadas || undefined,
        metodo_facturacion: project.metodo_facturacion || undefined,
        estado_pago: project.estado_pago || 'Pendiente',
        // Organización
        etiquetas: project.etiquetas || [],
        carpeta_archivos: project.carpeta_archivos || '',
        onedrive_folder_id: project.onedrive_folder_id || '',
        imagen_proyecto: project.imagen_proyecto || null,
        notas_adicionales: project.notas_adicionales || '',
        // Seguimiento
        proxima_tarea: project.proxima_tarea || '',
      };

      console.log('Form values to set:', formValues);
      
      // Usar reset para establecer todos los valores de una vez
      reset(formValues as any);
      
      // Log para debug
      console.log('Selected tech:', project.stack_tecnologico);
      console.log('Selected tags:', project.etiquetas);
    }
  }, [project, reset, setValue]);

  const watchedColor = watch('color');

  // Actualizar color seleccionado cuando cambia en el formulario
  React.useEffect(() => {
    if (watchedColor) {
      setSelectedColor(watchedColor);
    }
  }, [watchedColor]);

  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  const statusOptions = [
    { value: ProjectStatus.PLANNING, label: 'Planificación' },
    { value: ProjectStatus.ACTIVE, label: 'Activo' },
    { value: ProjectStatus.ON_HOLD, label: 'En pausa' },
    { value: ProjectStatus.COMPLETED, label: 'Completado' },
    { value: ProjectStatus.ARCHIVED, label: 'Archivado' },
  ];

  const tipoProyectoOptions = [
    { value: 'Página Web', label: 'Página Web' },
    { value: 'Aplicación React', label: 'Aplicación React' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Dashboard', label: 'Dashboard' },
    { value: 'API', label: 'API' },
    { value: 'App Mobile', label: 'App Mobile' },
    { value: 'Landing Page', label: 'Landing Page' },
    { value: 'Blog', label: 'Blog' },
    { value: 'Sistema Administrativo', label: 'Sistema Administrativo' },
    { value: 'Otro', label: 'Otro' },
  ];

  const prioridadOptions = [
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' },
  ];

  // const stackTecnologicoOptions = [
  //   { value: 'React', label: 'React' },
  //   { value: 'Vite', label: 'Vite' },
  //   { value: 'Next.js', label: 'Next.js' },
  //   { value: 'TypeScript', label: 'TypeScript' },
  //   { value: 'JavaScript', label: 'JavaScript' },
  //   { value: 'Node.js', label: 'Node.js' },
  //   { value: 'Express', label: 'Express' },
  //   { value: 'Supabase', label: 'Supabase' },
  //   { value: 'MongoDB', label: 'MongoDB' },
  //   { value: 'PostgreSQL', label: 'PostgreSQL' },
  //   { value: 'Tailwind CSS', label: 'Tailwind CSS' },
  //   { value: 'Material UI', label: 'Material UI' },
  //   { value: 'Bootstrap', label: 'Bootstrap' },
  //   { value: 'SASS', label: 'SASS' },
  //   { value: 'GraphQL', label: 'GraphQL' },
  //   { value: 'REST API', label: 'REST API' },
  //   { value: 'Firebase', label: 'Firebase' },
  //   { value: 'Vercel', label: 'Vercel' },
  //   { value: 'Netlify', label: 'Netlify' },
  // ];

  const monedaOptions = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'MXN', label: 'MXN ($)' },
    { value: 'COP', label: 'COP ($)' },
    { value: 'ARS', label: 'ARS ($)' },
  ];

  const metodoFacturacionOptions = [
    { value: 'Por horas', label: 'Por horas' },
    { value: 'Precio fijo', label: 'Precio fijo' },
    { value: 'Por hitos', label: 'Por hitos' },
  ];

  const estadoPagoOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Parcial', label: 'Parcial' },
    { value: 'Pagado', label: 'Pagado' },
  ];

  const handleFormSubmit = (data: ProjectFormInputs) => {
    if (!id) return;

    console.log('EditProject: Form submitted with data:', data);

    const updateData: UpdateProjectForm = {
      name: data.name,
      description: data.description || undefined,
      status: data.status,
      color: data.color,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
      // Información del Cliente
      cliente_empresa: data.cliente_empresa || undefined,
      contacto_principal: data.contacto_principal || undefined,
      email_contacto: data.email_contacto || undefined,
      telefono_contacto: data.telefono_contacto || undefined,
      tipo_proyecto: data.tipo_proyecto || undefined,
      prioridad: data.prioridad || undefined,
      // Aspectos Técnicos
      stack_tecnologico: selectedTech,
      repositorio_url: data.repositorio_url || undefined,
      url_staging: data.url_staging || undefined,
      url_produccion: data.url_produccion || undefined,
      // Gestión y Presupuesto
      presupuesto_estimado: data.presupuesto_estimado || undefined,
      moneda: data.moneda || undefined,
      horas_estimadas: data.horas_estimadas || undefined,
      metodo_facturacion: data.metodo_facturacion || undefined,
      estado_pago: data.estado_pago || undefined,
      // Organización
      etiquetas: selectedTags,
      carpeta_archivos: data.carpeta_archivos || undefined,
      onedrive_folder_id: data.onedrive_folder_id || undefined,
      imagen_proyecto: data.imagen_proyecto || undefined,
      notas_adicionales: data.notas_adicionales || undefined,
      // Seguimiento
      proxima_tarea: data.proxima_tarea || undefined,
    };

    console.log('EditProject: Sending update data:', updateData);
    console.log('EditProject: Project ID:', id);

    updateProject({ id, data: updateData });
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  };

  // Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Error al cargar el proyecto</div>
        <p className="text-gray-600 dark:text-gray-400">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Proyecto no encontrado</div>
        <p className="text-gray-600 dark:text-gray-400">El proyecto solicitado no existe</p>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title={`Editar: ${project.name}`}
        subtitle="Modifica los detalles del proyecto"
        // onBack={() => navigate(`/projects/${id}`)}
      />

      <Card className="mt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información Básica */}
          <Accordion title="Información Básica" icon={<FolderIcon className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre del Proyecto *"
                  {...register('name')}
                  error={errors.name?.message}
                  placeholder="Ej: Mi nuevo proyecto"
                  key={`name-${project.id}`}
                />

                <Select
                  label="Estado"
                  options={statusOptions}
                  {...register('status')}
                  error={errors.status?.message}
                  key={`status-${project.id}`}
                />
              </div>

              <Textarea
                label="Descripción"
                {...register('description')}
                error={errors.description?.message}
                placeholder="Describe brevemente tu proyecto..."
                rows={3}
                key={`description-${project.id}`}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fecha de Inicio"
                  type="date"
                  {...register('start_date')}
                  error={errors.start_date?.message}
                  key={`start_date-${project.id}`}
                />

                <Input
                  label="Fecha de Finalización"
                  type="date"
                  {...register('end_date')}
                  error={errors.end_date?.message}
                  key={`end_date-${project.id}`}
                />
              </div>
            </div>
          </Accordion>

          {/* Color del Proyecto */}
          <Accordion title="Color del Proyecto" icon={<PaletteIcon className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105
                      ${selectedColor === color 
                        ? 'border-gray-900 dark:border-white shadow-lg scale-105' 
                        : 'border-gray-300 dark:border-gray-600'
                      }
                    `}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              <input type="hidden" {...register('color')} />
              {errors.color && (
                <p className="text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>
          </Accordion>

          {/* Información del Cliente */}
          <Accordion title="Información del Cliente" icon={<BuildingIcon className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Empresa Cliente"
                  {...register('cliente_empresa')}
                  error={errors.cliente_empresa?.message}
                  placeholder="Nombre de la empresa"
                  key={`cliente_empresa-${project.id}`}
                />

                <Input
                  label="Contacto Principal"
                  {...register('contacto_principal')}
                  error={errors.contacto_principal?.message}
                  placeholder="Nombre del contacto"
                  key={`contacto_principal-${project.id}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email de Contacto"
                  type="email"
                  {...register('email_contacto')}
                  error={errors.email_contacto?.message}
                  placeholder="email@empresa.com"
                  key={`email_contacto-${project.id}`}
                />

                <Input
                  label="Teléfono de Contacto"
                  {...register('telefono_contacto')}
                  error={errors.telefono_contacto?.message}
                  placeholder="+34 600 000 000"
                  key={`telefono_contacto-${project.id}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Tipo de Proyecto"
                  options={tipoProyectoOptions}
                  {...register('tipo_proyecto')}
                  error={errors.tipo_proyecto?.message}
                  key={`tipo_proyecto-${project.id}`}
                />

                <Select
                  label="Prioridad"
                  options={prioridadOptions}
                  {...register('prioridad')}
                  error={errors.prioridad?.message}
                  key={`prioridad-${project.id}`}
                />
              </div>
            </div>
          </Accordion>

          {/* Aspectos Técnicos */}
          <Accordion title="Aspectos Técnicos" icon={<CodeIcon className="w-5 h-5" />}>
            <div className="space-y-4">
                              {/* <MultiSelect
                  // label="Stack Tecnológico"
                  options={stackTecnologicoOptions}
                  // selectedValues={selectedTech}
                  // onSelectionChange={setSelectedTech}
                  placeholder="Selecciona tecnologías..."
                /> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="URL del Repositorio"
                  type="url"
                  {...register('repositorio_url')}
                  error={errors.repositorio_url?.message}
                  placeholder="https://github.com/usuario/repo"
                  key={`repositorio_url-${project.id}`}
                />

                <Input
                  label="URL de Staging"
                  type="url"
                  {...register('url_staging')}
                  error={errors.url_staging?.message}
                  placeholder="https://staging.miproyecto.com"
                  key={`url_staging-${project.id}`}
                />
              </div>

              <Input
                label="URL de Producción"
                type="url"
                {...register('url_produccion')}
                error={errors.url_produccion?.message}
                placeholder="https://miproyecto.com"
                key={`url_produccion-${project.id}`}
              />
            </div>
          </Accordion>

          {/* Gestión y Presupuesto */}
          <Accordion title="Gestión y Presupuesto" icon={<DollarSignIcon className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Presupuesto Estimado"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('presupuesto_estimado', { valueAsNumber: true })}
                  error={errors.presupuesto_estimado?.message}
                  placeholder="0.00"
                  key={`presupuesto_estimado-${project.id}`}
                />

                <Select
                  label="Moneda"
                  options={monedaOptions}
                  {...register('moneda')}
                  error={errors.moneda?.message}
                  key={`moneda-${project.id}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Horas Estimadas"
                  type="number"
                  min="0"
                  {...register('horas_estimadas', { valueAsNumber: true })}
                  error={errors.horas_estimadas?.message}
                  placeholder="0"
                  key={`horas_estimadas-${project.id}`}
                />

                <Select
                  label="Método de Facturación"
                  options={metodoFacturacionOptions}
                  {...register('metodo_facturacion')}
                  error={errors.metodo_facturacion?.message}
                  key={`metodo_facturacion-${project.id}`}
                />
              </div>

              <Select
                label="Estado del Pago"
                options={estadoPagoOptions}
                {...register('estado_pago')}
                error={errors.estado_pago?.message}
                key={`estado_pago-${project.id}`}
              />
            </div>
          </Accordion>

          {/* Organización */}
          <Accordion title="Organización" icon={<TagIcon className="w-5 h-5" />}>
            <div className="space-y-4">
                              {/* <MultiSelect
                  // label="Etiquetas"
                  options={[]}
                  // selectedValues={selectedTags}
                  // onSelectionChange={setSelectedTags}
                  placeholder="Añade etiquetas personalizadas..."
                  allowCustomValues={true}
                /> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Carpeta de Archivos"
                  {...register('carpeta_archivos')}
                  error={errors.carpeta_archivos?.message}
                  placeholder="Ruta de la carpeta"
                  key={`carpeta_archivos-${project.id}`}
                />

                <Input
                  label="ID Carpeta OneDrive"
                  {...register('onedrive_folder_id')}
                  error={errors.onedrive_folder_id?.message}
                  placeholder="ID de la carpeta en OneDrive"
                  key={`onedrive_folder_id-${project.id}`}
                />
              </div>

              <Input
                label="Imagen del Proyecto"
                type="file"
                accept="image/*"
                {...register('imagen_proyecto')}
                error={errors.imagen_proyecto?.message as string}
                key={`imagen_proyecto-${project.id}`}
              />

              <Textarea
                label="Notas Adicionales"
                {...register('notas_adicionales')}
                error={errors.notas_adicionales?.message}
                placeholder="Notas adicionales sobre el proyecto..."
                rows={3}
                key={`notas_adicionales-${project.id}`}
              />

              <Textarea
                label="Próxima Tarea"
                {...register('proxima_tarea')}
                error={errors.proxima_tarea?.message}
                placeholder="Descripción de la próxima tarea a realizar..."
                rows={2}
                key={`proxima_tarea-${project.id}`}
              />
            </div>
          </Accordion>

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              icon={<XIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              icon={<SaveIcon className="w-4 h-4" />}
              disabled={isUpdating}
            >
              {isUpdating ? 'Actualizando...' : 'Actualizar Proyecto'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditProject;