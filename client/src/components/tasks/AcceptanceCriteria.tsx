import React, { useState } from 'react';
import { Plus, X, Check, Edit2 } from 'lucide-react';
import { CriterioAceptacion } from '../../types';

interface AcceptanceCriteriaProps {
  criterios: CriterioAceptacion[];
  onChange: (criterios: CriterioAceptacion[]) => void;
  disabled?: boolean;
}

export const AcceptanceCriteria: React.FC<AcceptanceCriteriaProps> = ({
  criterios,
  onChange,
  disabled = false
}) => {
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const agregarCriterio = () => {
    if (nuevoTexto.trim()) {
      const nuevoCriterio: CriterioAceptacion = {
        id: crypto.randomUUID(),
        descripcion: nuevoTexto.trim(),
        completado: false,
      };
      onChange([...criterios, nuevoCriterio]);
      setNuevoTexto('');
    }
  };

  const eliminarCriterio = (id: string) => {
    onChange(criterios.filter(c => c.id !== id));
  };

  const toggleCompletado = (id: string) => {
    onChange(criterios.map(c => 
      c.id === id 
        ? { 
            ...c, 
            completado: !c.completado,
            fecha_completado: !c.completado ? new Date().toISOString() : undefined
          }
        : c
    ));
  };

  const iniciarEdicion = (criterio: CriterioAceptacion) => {
    setEditandoId(criterio.id);
    setTextoEdicion(criterio.descripcion);
  };

  const guardarEdicion = () => {
    if (editandoId && textoEdicion.trim()) {
      onChange(criterios.map(c => 
        c.id === editandoId 
          ? { ...c, descripcion: textoEdicion.trim() }
          : c
      ));
      setEditandoId(null);
      setTextoEdicion('');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEdicion('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') {
        agregarCriterio();
      } else {
        guardarEdicion();
      }
    }
    if (e.key === 'Escape' && action === 'edit') {
      cancelarEdicion();
    }
  };

  const criteriosCompletados = criterios.filter(c => c.completado).length;
  const totalCriterios = criterios.length;

  return (
    <div className="space-y-3">
      {/* Header con progreso */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Criterios de Aceptación
        </h4>
        {totalCriterios > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {criteriosCompletados}/{totalCriterios} completados
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      {totalCriterios > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${totalCriterios > 0 ? (criteriosCompletados / totalCriterios) * 100 : 0}%` 
            }}
          />
        </div>
      )}

      {/* Lista de criterios */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {criterios.map((criterio) => (
          <div
            key={criterio.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
              criterio.completado
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Checkbox */}
            <button
              type="button"
              onClick={() => toggleCompletado(criterio.id)}
              disabled={disabled}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                criterio.completado
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {criterio.completado && <Check size={12} />}
            </button>

            {/* Contenido del criterio */}
            <div className="flex-1 min-w-0">
              {editandoId === criterio.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textoEdicion}
                    onChange={(e) => setTextoEdicion(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, 'edit')}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={guardarEdicion}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between group">
                  <p className={`text-sm flex-1 ${
                    criterio.completado
                      ? 'text-green-700 dark:text-green-300 line-through'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {criterio.descripcion}
                  </p>
                  {!disabled && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => iniciarEdicion(criterio)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarCriterio(criterio.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Fecha de completado */}
              {criterio.completado && criterio.fecha_completado && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Completado el {new Date(criterio.fecha_completado).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input para nuevo criterio */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'add')}
            placeholder="Añadir nuevo criterio..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={agregarCriterio}
            disabled={!nuevoTexto.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
      )}

      {/* Estado vacío */}
      {criterios.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No hay criterios de aceptación definidos</p>
          {!disabled && (
            <p className="text-xs mt-1">Añade criterios para definir cuándo se considera completa la tarea</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AcceptanceCriteria;
