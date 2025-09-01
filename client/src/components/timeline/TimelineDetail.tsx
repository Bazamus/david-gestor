import React from 'react';
import { X, Calendar, User, Tag, Target, Clock, CheckCircle, Eye } from 'lucide-react';
import { TimelineItem } from '../../types/timeline';
// moment import removed as it's not used
import { useNavigate } from 'react-router-dom';

interface TimelineDetailProps {
  item: TimelineItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const TimelineDetail: React.FC<TimelineDetailProps> = ({ item, isOpen, onClose }) => {
  const navigate = useNavigate();
  
  if (!item || !isOpen) return null;

  const handleViewDetails = () => {
    if (item.type === 'project') {
      navigate(`/projects/${item.id}`);
    } else if (item.type === 'task') {
      navigate(`/tasks/${item.id}`);
    }
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.color ? 'bg-blue-100' : 'bg-gray-100'} dark:bg-gray-700`}>
              {item.type === 'project' ? (
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.type === 'project' ? 'Proyecto' : 'Tarea'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </h3>
              <p className="text-gray-900 dark:text-white">{item.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de inicio
                </p>
                <p className="text-gray-900 dark:text-white">
                  {item.start_time.format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de fin
                </p>
                <p className="text-gray-900 dark:text-white">
                  {item.end_time.format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status === 'completed' && 'Completado'}
                  {item.status === 'in_progress' && 'En progreso'}
                  {item.status === 'pending' && 'Pendiente'}
                  {item.status === 'overdue' && 'Vencido'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prioridad
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                  {item.priority === 'high' && 'Alta'}
                  {item.priority === 'medium' && 'Media'}
                  {item.priority === 'low' && 'Baja'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso
              </p>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>

          {/* Assignee */}
          {item.assignee && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Asignado a
                </p>
                <p className="text-gray-900 dark:text-white">{item.assignee}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Etiquetas
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button 
            onClick={handleViewDetails}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineDetail; 