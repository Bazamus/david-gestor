import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import ExpandedTaskForm from '@/components/tasks/ExpandedTaskForm';
import PageHeader from '@/components/common/PageHeader';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Hooks
import { useCreateTask } from '@/hooks/useTasks';

// Types
import { CreateTaskForm, UpdateTaskForm } from '@/types';

const CreateTask: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  

  
  // Estado para el modal de confirmación
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
  }>({ title: '', message: '' });
  
  // No necesitamos cargar proyectos ya que el formulario expandido maneja esto internamente
  
  const { mutate: createTask, isPending: isCreating } = useCreateTask({
    onSuccess: (data) => {
      // Invalidar las consultas relacionadas con tareas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Mostrar modal de confirmación
      setConfirmationData({
        title: '¡Tarea Creada Exitosamente!',
        message: `La tarea "${data.title}" ha sido creada correctamente.`
      });
      setShowConfirmation(true);
    },
    onError: (error) => {
      toast.error(`Error al crear la tarea: ${error.message}`);
    }
  });

  const handleCreateTask = (data: CreateTaskForm) => {
    // Validar que tengamos project_id (del URL o del formulario)
    if (!data.project_id) {
      toast.error('Debe seleccionar un proyecto');
      return;
    }
    
    createTask(data);
  };

  const handleSubmit = (data: CreateTaskForm | UpdateTaskForm) => {
    // Para crear tarea, aseguramos que sea CreateTaskForm
    if ('project_id' in data && data.project_id) {
      handleCreateTask(data as CreateTaskForm);
    } else {
      toast.error('Debe seleccionar un proyecto');
    }
  };

  const handleCancel = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/tasks');
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    // Navegar después de cerrar el modal
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title="Crear Nueva Tarea" 
        subtitle="Complete todos los detalles de la nueva tarea"
      />
      
      <div className="mt-6">
        <ExpandedTaskForm 
          projectId={projectId} // Ahora es opcional
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isCreating}
        />
      </div>
      
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title={confirmationData.title}
        message={confirmationData.message}
        type="success"
      />
    </div>
  );
};

export default CreateTask;
