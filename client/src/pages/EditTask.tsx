import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Components
import ExpandedTaskForm from '@/components/tasks/ExpandedTaskForm';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Hooks
import { useTask, useUpdateTask } from '@/hooks/useTasks';

// Types
import { CreateTaskForm, UpdateTaskForm } from '@/types';

const EditTask: React.FC = () => {
  const { id: taskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Estado para el modal de confirmación
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
  }>({ title: '', message: '' });
  
  // Obtener datos de la tarea
  const { data: task, isLoading, isError, error } = useTask(taskId || '');
  

  
  // Mutación para actualizar tarea
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask({
    onSuccess: (data) => {
      // Invalidar las consultas relacionadas con tareas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Mostrar modal de confirmación
      setConfirmationData({
        title: '¡Tarea Actualizada Exitosamente!',
        message: `La tarea "${data.title}" ha sido actualizada correctamente.`
      });
      setShowConfirmation(true);
    },
    onError: (error) => {
      toast.error(`Error al actualizar la tarea: ${error.message}`);
    }
  });

  const handleSubmit = (data: CreateTaskForm | UpdateTaskForm) => {
    if (!taskId) return;
    
    // Para editar tarea, convertimos a UpdateTaskForm
    const updateData = { ...data };
    if ('project_id' in updateData) {
      delete (updateData as any).project_id; // Eliminar project_id ya que no se puede actualizar
    }
    
    updateTask({ id: taskId, data: updateData as UpdateTaskForm });
  };

  const handleCancel = () => {
    if (taskId) {
      navigate(`/tasks/${taskId}`);
    } else {
      navigate('/projects');
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    // Navegar al detalle de la tarea después de cerrar el modal
    navigate(`/tasks/${taskId}`);
  };

  // Manejo de estados de carga y error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Error</div>
        <p className="text-gray-600 dark:text-gray-400">{error?.message || 'Error al cargar la tarea'}</p>
        <button 
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium mb-2">Tarea no encontrada</div>
        <p className="text-gray-600 dark:text-gray-400">La tarea solicitada no existe</p>
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
        title={`Editar: ${task?.title || 'Tarea'}`}
        subtitle="Modifique todos los detalles de la tarea"
      />
      
      <div className="mt-6">
        <ExpandedTaskForm 
          projectId={task.project_id}
          task={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
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

export default EditTask;
