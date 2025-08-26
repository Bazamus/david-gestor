import React, { useState, useEffect } from 'react';
import { Search, X, Link, AlertTriangle, CheckCircle } from 'lucide-react';
import { Task } from '../../types';

interface TaskDependenciesProps {
  projectId: string;
  currentTaskId?: string; // Para evitar dependencias circulares
  selectedDependencies: string[];
  onChange: (dependencies: string[]) => void;
  disabled?: boolean;
}

export const TaskDependencies: React.FC<TaskDependenciesProps> = ({
  projectId,
  currentTaskId,
  selectedDependencies,
  onChange,
  disabled = false
}) => {
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Simular carga de tareas del proyecto (en el futuro se conectará con la API)
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        // TODO: Reemplazar con llamada real a la API
        // const tasks = await taskService.getTasksByProject(projectId);
        
        // Simulación temporal
        const mockTasks: Task[] = [
          {
            id: '1',
            project_id: projectId,
            title: 'Configurar base de datos',
            description: 'Configurar la estructura inicial de la base de datos',
            status: 'COMPLETADA' as any,
            priority: 'HIGH' as any,
            tags: ['backend', 'database'],
            position: 1,
            created_at: '2025-08-01T10:00:00Z',
            updated_at: '2025-08-01T10:00:00Z',
          },
          {
            id: '2',
            project_id: projectId,
            title: 'Crear modelos de datos',
            description: 'Definir los modelos para usuarios y proyectos',
            status: 'EN_PROGRESO' as any,
            priority: 'MEDIUM' as any,
            tags: ['backend', 'models'],
            position: 2,
            created_at: '2025-08-02T10:00:00Z',
            updated_at: '2025-08-02T10:00:00Z',
          },
          {
            id: '3',
            project_id: projectId,
            title: 'Implementar autenticación',
            description: 'Sistema de login y registro de usuarios',
            status: 'NADA' as any,
            priority: 'HIGH' as any,
            tags: ['backend', 'auth'],
            position: 3,
            created_at: '2025-08-03T10:00:00Z',
            updated_at: '2025-08-03T10:00:00Z',
          },
        ];

        // Filtrar la tarea actual para evitar dependencias circulares
        const filteredTasks = mockTasks.filter(task => task.id !== currentTaskId);
        setAvailableTasks(filteredTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadTasks();
    }
  }, [projectId, currentTaskId]);

  const filteredTasks = availableTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedTasks = availableTasks.filter(task => 
    selectedDependencies.includes(task.id)
  );

  const addDependency = (taskId: string) => {
    if (!selectedDependencies.includes(taskId)) {
      onChange([...selectedDependencies, taskId]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeDependency = (taskId: string) => {
    onChange(selectedDependencies.filter(id => id !== taskId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETADA':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'EN_PROGRESO':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'NADA':
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADA':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'EN_PROGRESO':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'NADA':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Dependencias
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {selectedDependencies.length} dependencias
        </span>
      </div>

      {/* Información sobre dependencias */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <AlertTriangle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Sobre las dependencias:</p>
          <ul className="space-y-1">
            <li>• Esta tarea no puede comenzar hasta que se completen las dependencias</li>
            <li>• Las dependencias circulares no están permitidas</li>
            <li>• Se recomienda mantener las dependencias al mínimo</li>
          </ul>
        </div>
      </div>

      {/* Buscador de tareas */}
      {!disabled && (
        <div className="relative">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar tareas para añadir como dependencia..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Dropdown de resultados */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Cargando tareas...
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron tareas' : 'No hay tareas disponibles'}
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => addDependency(task.id)}
                    disabled={selectedDependencies.includes(task.id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                      selectedDependencies.includes(task.id) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          {task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {task.tags.length > 2 && (
                                <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Overlay para cerrar dropdown */}
          {showDropdown && (
            <div
              className="fixed inset-0 z-5"
              onClick={() => setShowDropdown(false)}
            />
          )}
        </div>
      )}

      {/* Lista de dependencias seleccionadas */}
      {selectedTasks.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tareas requeridas ({selectedTasks.length})
          </h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group"
              >
                <Link size={16} className="text-gray-400 flex-shrink-0" />
                {getStatusIcon(task.status)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {task.tags.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removeDependency(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar dependencia"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {selectedTasks.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <Link className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">No hay dependencias definidas</p>
          {!disabled && (
            <p className="text-xs mt-1">Busca y selecciona tareas que deben completarse antes</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskDependencies;
