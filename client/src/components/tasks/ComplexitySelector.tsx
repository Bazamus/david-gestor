import React from 'react';
import { Star } from 'lucide-react';
import { ComplejidadTarea } from '../../types';

interface ComplexitySelectorProps {
  value: ComplejidadTarea;
  onChange: (value: ComplejidadTarea) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export const ComplexitySelector: React.FC<ComplexitySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  showLabel = true
}) => {
  const complejidades = [
    { valor: 1 as ComplejidadTarea, label: 'Muy Fácil', color: 'text-green-500', description: 'Tarea simple, menos de 1 hora' },
    { valor: 2 as ComplejidadTarea, label: 'Fácil', color: 'text-green-400', description: 'Tarea básica, 1-2 horas' },
    { valor: 3 as ComplejidadTarea, label: 'Moderada', color: 'text-yellow-500', description: 'Tarea estándar, medio día' },
    { valor: 4 as ComplejidadTarea, label: 'Compleja', color: 'text-orange-500', description: 'Tarea avanzada, 1-2 días' },
    { valor: 5 as ComplejidadTarea, label: 'Muy Compleja', color: 'text-red-500', description: 'Tarea muy difícil, varios días' },
  ];

  const complejidadSeleccionada = complejidades.find(c => c.valor === value);

  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Complejidad
          </label>
          {complejidadSeleccionada && (
            <span className={`text-xs font-medium ${complejidadSeleccionada.color}`}>
              {complejidadSeleccionada.label}
            </span>
          )}
        </div>
      )}

      {/* Selector visual con estrellas */}
      <div className="flex items-center gap-1">
        {complejidades.map((complejidad) => (
          <button
            key={complejidad.valor}
            type="button"
            onClick={() => !disabled && onChange(complejidad.valor)}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all duration-200 group relative ${
              disabled 
                ? 'cursor-not-allowed opacity-50' 
                : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={`${complejidad.label}: ${complejidad.description}`}
          >
            <Star
              size={20}
              className={`transition-all duration-200 ${
                complejidad.valor <= value
                  ? `${complejidad.color} fill-current`
                  : 'text-gray-300 dark:text-gray-600'
              } ${
                !disabled && 'group-hover:scale-110'
              }`}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div className="font-medium">{complejidad.label}</div>
                <div className="text-gray-300">{complejidad.description}</div>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </button>
        ))}
      </div>

      {/* Descripción de la complejidad seleccionada */}
      {complejidadSeleccionada && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {Array.from({ length: value }, (_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${complejidadSeleccionada.color} fill-current`}
                />
              ))}
            </div>
            <span className={`text-sm font-medium ${complejidadSeleccionada.color}`}>
              {complejidadSeleccionada.label}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {complejidadSeleccionada.description}
          </p>
        </div>
      )}

      {/* Leyenda compacta */}
      <div className="grid grid-cols-5 gap-1 text-xs text-gray-500 dark:text-gray-400">
        {complejidades.map((comp) => (
          <div key={comp.valor} className="text-center">
            <div className={`font-medium ${comp.color}`}>{comp.valor}</div>
            <div className="truncate">{comp.label.split(' ')[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplexitySelector;
