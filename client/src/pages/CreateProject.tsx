import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeftIcon, 
  FolderIcon, 
  SaveIcon,
  XIcon,
  UserIcon,
  CodeIcon,
  DollarSignIcon,
  TagIcon,
  SettingsIcon
} from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import Accordion from '@/components/common/Accordion';
import MultiSelect from '@/components/common/MultiSelect';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';

// Hooks
import { useCreateProject } from '@/hooks/useProjects';

// Types
import { 
  CreateProjectForm, 
  ProjectStatus
} from '@/types';

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    // watch and setValue removed as they're not used
  } = useForm<CreateProjectForm>({
    mode: 'onChange',
    defaultValues: {
      // Información Básica
      name: '',
      description: '',
      status: ProjectStatus.PLANNING,
      color: '#3B82F6',
      start_date: '',
      end_date: '',
      
      // Información del Cliente
      cliente_empresa: '',
      contacto_principal: '',
      email_contacto: '',
      telefono_contacto: '',
      tipo_proyecto: '',
      prioridad: 'Media',
      
      // Aspectos Técnicos
      stack_tecnologico: [],
      repositorio_url: '',
      url_staging: '',
      url_produccion: '',
      url_documentos: '',
      
      // Gestión y Presupuesto
      presupuesto_estimado: undefined,
      moneda: 'EUR',
      horas_estimadas: undefined,
      metodo_facturacion: undefined,
      estado_pago: 'Pendiente',
      
      // Organización
      etiquetas: [],
      carpeta_archivos: '',
      imagen_proyecto: null,
      notas_adicionales: '',
      proxima_tarea: ''
    }
  });

  const createProject = useCreateProject();

  // Opciones para los selectores
  const colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
  ];

  const statusOptions = [
    { value: ProjectStatus.PLANNING, label: 'Planificación', color: 'text-purple-600' },
    { value: ProjectStatus.ACTIVE, label: 'Activo', color: 'text-green-600' },
    { value: ProjectStatus.ON_HOLD, label: 'En pausa', color: 'text-yellow-600' },
    { value: ProjectStatus.COMPLETED, label: 'Completado', color: 'text-blue-600' },
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

  const stackTecnologicoOptions = [
    { value: 'React', label: 'React' },
    { value: 'Vite', label: 'Vite' },
    { value: 'Next.js', label: 'Next.js' },
    { value: 'TypeScript', label: 'TypeScript' },
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Express', label: 'Express' },
    { value: 'Supabase', label: 'Supabase' },
    { value: 'MongoDB', label: 'MongoDB' },
    { value: 'PostgreSQL', label: 'PostgreSQL' },
    { value: 'Tailwind CSS', label: 'Tailwind CSS' },
    { value: 'Material UI', label: 'Material UI' },
    { value: 'Bootstrap', label: 'Bootstrap' },
    { value: 'SASS', label: 'SASS' },
    { value: 'GraphQL', label: 'GraphQL' },
    { value: 'REST API', label: 'REST API' },
    { value: 'Firebase', label: 'Firebase' },
    { value: 'Vercel', label: 'Vercel' },
    { value: 'Netlify', label: 'Netlify' },
  ];

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

  const onSubmit = async (data: CreateProjectForm) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const projectData = {
        ...data,
        color: selectedColor,
        stack_tecnologico: selectedTech,
        etiquetas: selectedTags,
        // Limpiar datos antes de enviar
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
        presupuesto_estimado: isNaN(Number(data.presupuesto_estimado)) ? undefined : Number(data.presupuesto_estimado),
        horas_estimadas: isNaN(Number(data.horas_estimadas)) ? undefined : Number(data.horas_estimadas),
      };
      
      const newProject = await createProject.mutateAsync(projectData);
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que quieres cancelar? Los cambios se perderán.')) {
      navigate('/projects');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate('/projects')}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crear Nuevo Proyecto
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Completa la información para crear tu nuevo proyecto
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-6">
          {/* 1. Información Básica */}
          <Accordion
            title="Información Básica"
            icon={<FolderIcon className="w-5 h-5" />}
            isOpen={true}
            required={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Nombre del Proyecto"
                  {...register('name', { 
                    required: 'El nombre del proyecto es requerido',
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 255, message: 'El nombre no puede exceder 255 caracteres' }
                  })}
                  error={errors.name?.message}
                  placeholder="Ej: Aplicación Web Personal"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Descripción"
                  {...register('description', {
                    maxLength: { value: 1000, message: 'La descripción no puede exceder 1000 caracteres' }
                  })}
                  error={errors.description?.message}
                  placeholder="Describe tu proyecto..."
                  rows={4}
                />
              </div>
            </div>
          </Accordion>

          {/* 2. Información del Cliente */}
          <Accordion
            title="Información del Cliente"
            icon={<UserIcon className="w-5 h-5" />}
            isOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Empresa/Cliente"
                {...register('cliente_empresa')}
                error={errors.cliente_empresa?.message}
                placeholder="Nombre de la empresa cliente"
              />
              
              <Input
                label="Contacto Principal"
                {...register('contacto_principal')}
                error={errors.contacto_principal?.message}
                placeholder="Nombre del contacto"
              />
              
              <Input
                label="Email de Contacto"
                type="email"
                {...register('email_contacto')}
                error={errors.email_contacto?.message}
                placeholder="contacto@empresa.com"
              />
              
              <Input
                label="Teléfono de Contacto"
                {...register('telefono_contacto')}
                error={errors.telefono_contacto?.message}
                placeholder="+34 600 000 000"
              />
              
              <Select
                label="Tipo de Proyecto"
                options={[{ value: '', label: 'Seleccionar tipo...' }, ...tipoProyectoOptions]}
                {...register('tipo_proyecto', { required: 'El tipo de proyecto es requerido' })}
                error={errors.tipo_proyecto?.message}
                required
              />
              
              <Select
                label="Prioridad"
                options={prioridadOptions}
                {...register('prioridad')}
                error={errors.prioridad?.message}
              />
            </div>
          </Accordion>

          {/* 3. Configuración Técnica */}
          <Accordion
            title="Configuración Técnica"
            icon={<CodeIcon className="w-5 h-5" />}
            isOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stack Tecnológico
                </label>
                <MultiSelect
                  options={stackTecnologicoOptions}
                  value={selectedTech}
                  onChange={setSelectedTech}
                  placeholder="Seleccionar tecnologías..."
                  allowCustom={true}
                />
              </div>
              
              <Input
                label="Repositorio URL"
                type="url"
                {...register('repositorio_url')}
                error={errors.repositorio_url?.message}
                placeholder="https://github.com/usuario/proyecto"
              />
              
              <Input
                label="URL Staging"
                type="url"
                {...register('url_staging')}
                error={errors.url_staging?.message}
                placeholder="https://staging.proyecto.com"
              />
              
              <div className="md:col-span-2">
                <Input
                  label="URL Producción"
                  type="url"
                  {...register('url_produccion')}
                  error={errors.url_produccion?.message}
                  placeholder="https://proyecto.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="URL Documentos"
                  type="url"
                  {...register('url_documentos')}
                  error={errors.url_documentos?.message}
                  placeholder="https://docs.proyecto.com"
                />
              </div>
            </div>
          </Accordion>

          {/* 4. Presupuesto y Facturación */}
          <Accordion
            title="Presupuesto y Facturación"
            icon={<DollarSignIcon className="w-5 h-5" />}
            isOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Presupuesto Estimado"
                type="number"
                step="0.01"
                {...register('presupuesto_estimado', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'El presupuesto debe ser mayor a 0' }
                })}
                error={errors.presupuesto_estimado?.message}
                placeholder="0.00"
              />
              
              <Select
                label="Moneda"
                options={monedaOptions}
                {...register('moneda')}
                error={errors.moneda?.message}
              />
              
              <Input
                label="Horas Estimadas"
                type="number"
                {...register('horas_estimadas', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Las horas deben ser mayor a 0' }
                })}
                error={errors.horas_estimadas?.message}
                placeholder="0"
              />
              
              <Select
                label="Método de Facturación"
                options={[{ value: '', label: 'Seleccionar método...' }, ...metodoFacturacionOptions]}
                {...register('metodo_facturacion')}
                error={errors.metodo_facturacion?.message}
              />
              
              <div className="md:col-span-2">
                <Select
                  label="Estado de Pago"
                  options={estadoPagoOptions}
                  {...register('estado_pago')}
                  error={errors.estado_pago?.message}
                />
              </div>
            </div>
          </Accordion>

          {/* 5. Organización */}
          <Accordion
            title="Organización"
            icon={<TagIcon className="w-5 h-5" />}
            isOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Etiquetas
                </label>
                <MultiSelect
                  options={[]}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Agregar etiquetas..."
                  allowCustom={true}
                  customPlaceholder="Nueva etiqueta..."
                />
              </div>
              
              <Input
                label="Carpeta de Archivos"
                {...register('carpeta_archivos')}
                error={errors.carpeta_archivos?.message}
                placeholder="Ruta/a/carpeta/proyecto"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Imagen del Proyecto
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, JPEG, PNG, WEBP. Máximo 5MB
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Notas Adicionales"
                  {...register('notas_adicionales')}
                  error={errors.notas_adicionales?.message}
                  placeholder="Notas adicionales sobre el proyecto..."
                  rows={3}
                />
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Próxima Tarea"
                  {...register('proxima_tarea')}
                  error={errors.proxima_tarea?.message}
                  placeholder="Describe la próxima tarea a realizar..."
                />
              </div>
            </div>
          </Accordion>

          {/* 6. Configuración del Proyecto */}
          <Accordion
            title="Configuración del Proyecto"
            icon={<SettingsIcon className="w-5 h-5" />}
            isOpen={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Estado"
                options={statusOptions}
                {...register('status', { required: 'El estado es requerido' })}
                error={errors.status?.message}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color del Proyecto
                </label>
                <div className="flex space-x-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-gray-900 dark:border-white scale-110' 
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <Input
                label="Fecha de Inicio"
                type="date"
                {...register('start_date')}
                error={errors.start_date?.message}
              />
              
              <Input
                label="Fecha de Finalización"
                type="date"
                {...register('end_date')}
                error={errors.end_date?.message}
              />
            </div>
          </Accordion>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              icon={<XIcon className="w-4 h-4" />}
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={isSubmitting ? <Loading className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject; 