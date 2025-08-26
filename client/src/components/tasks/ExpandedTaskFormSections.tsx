import React from 'react';
import { Control, UseFormRegister, FieldErrors, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { 
  CheckSquare,
  Code,
  Link,
  Paperclip,
  Repeat,
  Plus,
  X
} from 'lucide-react';

// Components
import Textarea from '../common/Textarea';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Accordion from '../common/Accordion';
import AcceptanceCriteria from './AcceptanceCriteria';
import FileAttachments from './FileAttachments';
import TaskDependencies from './TaskDependencies';

// Types
import { 
  CriterioAceptacion,
  ArchivoAdjunto
} from '../../types';

interface ExpandedTaskFormSectionsProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  projectId: string;
  currentTaskId?: string;
  esRecurrente: boolean;
}

export const ExpandedTaskFormSections: React.FC<ExpandedTaskFormSectionsProps> = ({
  register,
  errors,
  getValues,
  setValue,
  expandedSections,
  toggleSection,
  projectId,
  currentTaskId,
  esRecurrente
}) => {
  const frecuenciaOptions = [
    { value: 'diaria', label: 'Diaria' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
    { value: 'personalizada', label: 'Personalizada' },
  ];

  const addEnlaceReferencia = () => {
    const enlaces = getValues('enlaces_referencia') || [];
    setValue('enlaces_referencia', [...enlaces, '']);
  };

  const updateEnlaceReferencia = (index: number, value: string) => {
    const enlaces = getValues('enlaces_referencia') || [];
    enlaces[index] = value;
    setValue('enlaces_referencia', enlaces);
  };

  const removeEnlaceReferencia = (index: number) => {
    const enlaces = getValues('enlaces_referencia') || [];
    setValue('enlaces_referencia', enlaces.filter((_: string, i: number) => i !== index));
  };

  return (
    <>
      {/* SECCIÓN 3: CRITERIOS Y VALIDACIÓN */}
      <Accordion
        title="Criterios y Validación"
        icon={<CheckSquare size={20} />}
        isOpen={expandedSections.criteria}
        onToggle={() => toggleSection('criteria')}
      >
        <div className="space-y-4">
          {/* Criterios de Aceptación */}
          <div>
            <AcceptanceCriteria
              criterios={getValues('criterios_aceptacion') || []}
              onChange={(criterios: CriterioAceptacion[]) => setValue('criterios_aceptacion', criterios)}
            />
            {errors.criterios_aceptacion && (
              <p className="text-red-500 text-xs mt-1">{String(errors.criterios_aceptacion.message)}</p>
            )}
          </div>

          {/* Definición de Terminado */}
          <Textarea
            label="Definición de Terminado"
            {...register('definicion_terminado')}
            error={errors.definicion_terminado?.message ? String(errors.definicion_terminado.message) : undefined}
            placeholder="Define claramente cuándo se considera que la tarea está completa..."
            rows={3}
          />

          {/* Bloqueadores */}
          <Textarea
            label="Bloqueadores"
            {...register('bloqueadores')}
            error={errors.bloqueadores?.message ? String(errors.bloqueadores.message) : undefined}
            placeholder="Describe cualquier impedimento o bloqueador actual..."
            rows={2}
          />
        </div>
      </Accordion>

      {/* SECCIÓN 4: DESARROLLO Y TÉCNICO */}
      <Accordion
        title="Desarrollo y Técnico"
        icon={<Code size={20} />}
        isOpen={expandedSections.technical}
        onToggle={() => toggleSection('technical')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Branch de Git"
            {...register('branch_git')}
            error={errors.branch_git?.message ? String(errors.branch_git.message) : undefined}
            placeholder="feature/nueva-funcionalidad"
          />

          <Input
            label="Commit relacionado"
            {...register('commit_relacionado')}
            error={errors.commit_relacionado?.message ? String(errors.commit_relacionado.message) : undefined}
            placeholder="a1b2c3d4e5f6..."
          />

          <div className="md:col-span-2">
            <Input
              label="URL del Pull Request"
              type="url"
              {...register('url_pull_request')}
                              error={errors.url_pull_request?.message ? String(errors.url_pull_request.message) : undefined}
              placeholder="https://github.com/usuario/repo/pull/123"
            />
          </div>
        </div>
      </Accordion>

      {/* SECCIÓN 5: DEPENDENCIAS Y RELACIONES */}
      <Accordion
        title="Dependencias y Relaciones"
        icon={<Link size={20} />}
        isOpen={expandedSections.dependencies}
        onToggle={() => toggleSection('dependencies')}
      >
        <div className="space-y-4">
          {/* Dependencias */}
          <div>
            <TaskDependencies
              projectId={projectId}
              currentTaskId={currentTaskId}
              selectedDependencies={getValues('dependencias') || []}
              onChange={(dependencies: string[]) => setValue('dependencias', dependencies)}
            />
            {errors.dependencias && (
              <p className="text-red-500 text-xs mt-1">{String(errors.dependencias.message)}</p>
            )}
          </div>

          {/* Impacto en otras tareas */}
          <Textarea
            label="Impacto en otras tareas"
            {...register('impacto_otras_tareas')}
            error={errors.impacto_otras_tareas?.message ? String(errors.impacto_otras_tareas.message) : undefined}
            placeholder="Describe cómo esta tarea puede afectar a otras tareas del proyecto..."
            rows={3}
          />
        </div>
      </Accordion>

      {/* SECCIÓN 6: ARCHIVOS Y RECURSOS */}
      <Accordion
        title="Archivos y Recursos"
        icon={<Paperclip size={20} />}
        isOpen={expandedSections.files}
        onToggle={() => toggleSection('files')}
      >
        <div className="space-y-6">
          {/* Archivos Adjuntos */}
          <div>
            <FileAttachments
              archivos={getValues('archivos_adjuntos') || []}
              onChange={(archivos: ArchivoAdjunto[]) => setValue('archivos_adjuntos', archivos)}
            />
            {errors.archivos_adjuntos && (
              <p className="text-red-500 text-xs mt-1">{String(errors.archivos_adjuntos.message)}</p>
            )}
          </div>

          {/* Enlaces de Referencia */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enlaces de Referencia
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnlaceReferencia}
              >
                <Plus size={16} className="mr-1" />
                Añadir enlace
              </Button>
            </div>

            <div className="space-y-2">
              {(getValues('enlaces_referencia') || []).map((enlace: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={enlace}
                    onChange={(e) => updateEnlaceReferencia(index, e.target.value)}
                    placeholder="https://ejemplo.com/documentacion"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEnlaceReferencia(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>

            {(getValues('enlaces_referencia') || []).length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No hay enlaces de referencia. Haz clic en "Añadir enlace" para agregar uno.
              </p>
            )}

            {errors.enlaces_referencia && (
              <p className="text-red-500 text-xs mt-1">{String(errors.enlaces_referencia.message)}</p>
            )}
          </div>

          {/* ID de Carpeta OneDrive */}
          <Input
            label="ID de Carpeta OneDrive"
            {...register('onedrive_folder_id')}
            error={errors.onedrive_folder_id?.message ? String(errors.onedrive_folder_id.message) : undefined}
            placeholder="ID de la carpeta en OneDrive (opcional)"
          />
        </div>
      </Accordion>

      {/* SECCIÓN 7: AUTOMATIZACIÓN Y RECURRENCIA */}
      <Accordion
        title="Automatización y Recurrencia"
        icon={<Repeat size={20} />}
        isOpen={expandedSections.automation}
        onToggle={() => toggleSection('automation')}
      >
        <div className="space-y-4">
          {/* Tarea Recurrente */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              {...register('es_recurrente')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Esta es una tarea recurrente
            </label>
          </div>

          {/* Frecuencia de Recurrencia - Solo si es recurrente */}
          {esRecurrente && (
            <Select
              label="Frecuencia de Recurrencia *"
              {...register('notas_internas')}
              options={frecuenciaOptions}
                              error={errors.notas_internas?.message ? String(errors.notas_internas.message) : undefined}
            />
          )}

          {/* Información sobre recurrencia */}
          {esRecurrente && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Nota:</strong> Las tareas recurrentes actualmente se marcan solo como referencia. 
                La creación automática de nuevas instancias se implementará en futuras versiones.
              </p>
            </div>
          )}

          {/* Notas Internas */}
          <Textarea
            label="Notas Internas"
            {...register('notas_internas')}
            error={errors.notas_internas?.message ? String(errors.notas_internas.message) : undefined}
            placeholder="Notas internas, comentarios adicionales, recordatorios..."
            rows={4}
          />
        </div>
      </Accordion>
    </>
  );
};

export default ExpandedTaskFormSections;
