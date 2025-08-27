// ======================================
// FILTROS AVANZADOS PARA REPORTES PROFESIONALES
// Sistema completo de filtros para Aclimar
// ======================================

import React, { useState } from 'react';
import {
  CalendarIcon,
  FilterIcon,
  CheckIcon,
  ChevronDownIcon,
  RotateCcwIcon,
  FolderIcon,
  TagIcon,
  ClockIcon
} from 'lucide-react';
import Button from '@/components/common/Button';

// ======================================
// TIPOS E INTERFACES
// ======================================

export interface FiltrosAvanzadosState {
  // Filtros de fecha
  fechaInicio?: string;
  fechaFin?: string;
  periodoPreset?: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado';
  
  // Filtros de proyecto
  proyectosSeleccionados?: string[];
  estadosProyecto?: ('active' | 'completed' | 'on-hold' | 'cancelled')[];
  prioridadesProyecto?: ('low' | 'medium' | 'high' | 'urgent')[];
  
  // Filtros de tareas
  estadosTarea?: ('pending' | 'in-progress' | 'completed' | 'cancelled')[];
  prioridadesTarea?: ('low' | 'medium' | 'high' | 'urgent')[];
  etiquetas?: string[];
  
  // Filtros de horas
  horasMinimas?: number;
  horasMaximas?: number;
  soloConHoras?: boolean;
  
  // Filtros de usuario (para futuro)
  usuariosAsignados?: string[];
}

interface FiltrosAvanzadosProps {
  filtros: FiltrosAvanzadosState;
  onFiltrosChange: (filtros: FiltrosAvanzadosState) => void;
  onAplicarFiltros: () => void;
  onLimpiarFiltros: () => void;
  isLoading?: boolean;
  proyectosDisponibles?: Array<{ id: string; name: string; status?: string; priority?: string }>;
  etiquetasDisponibles?: string[];
}

// ======================================
// COMPONENTE PRINCIPAL
// ======================================

const FiltrosAvanzados: React.FC<FiltrosAvanzadosProps> = ({
  filtros,
  onFiltrosChange,
  onAplicarFiltros,
  onLimpiarFiltros,
  isLoading = false,
  proyectosDisponibles = []
}) => {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState<'fecha' | 'proyecto' | 'tarea' | 'horas'>('fecha');

  // ======================================
  // HANDLERS DE FILTROS
  // ======================================

  const handlePeriodoPresetChange = (preset: FiltrosAvanzadosState['periodoPreset']) => {
    const hoy = new Date();
    let fechaInicio: string;
    let fechaFin: string;

    switch (preset) {
      case 'hoy':
        fechaInicio = fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        fechaInicio = inicioSemana.toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'trimestre':
        const trimestre = Math.floor(hoy.getMonth() / 3);
        fechaInicio = new Date(hoy.getFullYear(), trimestre * 3, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      case 'año':
        fechaInicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        fechaFin = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onFiltrosChange({
      ...filtros,
      fechaInicio,
      fechaFin,
      periodoPreset: preset
    });
  };

  const handleProyectoToggle = (proyectoId: string) => {
    const proyectosActuales = filtros.proyectosSeleccionados || [];
    const nuevosProyectos = proyectosActuales.includes(proyectoId)
      ? proyectosActuales.filter(id => id !== proyectoId)
      : [...proyectosActuales, proyectoId];

    onFiltrosChange({
      ...filtros,
      proyectosSeleccionados: nuevosProyectos
    });
  };

  const handleEstadoProyectoToggle = (estado: string) => {
    const estadosActuales = filtros.estadosProyecto || [];
    const nuevosEstados = estadosActuales.includes(estado as any)
      ? estadosActuales.filter(e => e !== estado)
      : [...estadosActuales, estado as any];

    onFiltrosChange({
      ...filtros,
      estadosProyecto: nuevosEstados
    });
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.fechaInicio || filtros.fechaFin) count++;
    if (filtros.proyectosSeleccionados?.length) count++;
    if (filtros.estadosProyecto?.length) count++;
    if (filtros.prioridadesProyecto?.length) count++;
    if (filtros.estadosTarea?.length) count++;
    if (filtros.prioridadesTarea?.length) count++;
    if (filtros.etiquetas?.length) count++;
    if (filtros.horasMinimas || filtros.horasMaximas) count++;
    if (filtros.soloConHoras) count++;
    return count;
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Header de Filtros */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros Avanzados</h3>
          {contarFiltrosActivos() > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {contarFiltrosActivos()} activos
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onLimpiarFiltros}
            disabled={isLoading || contarFiltrosActivos() === 0}
          >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <ChevronDownIcon className={`w-4 h-4 mr-2 transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
            {mostrarFiltros ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAplicarFiltros}
            disabled={isLoading}
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Aplicar
          </Button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
        {(['hoy', 'semana', 'mes', 'trimestre', 'año'] as const).map((preset) => (
          <Button
            key={preset}
            variant={filtros.periodoPreset === preset ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handlePeriodoPresetChange(preset)}
            disabled={isLoading}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </Button>
        ))}
      </div>

      {/* Panel de Filtros Expandido */}
      {mostrarFiltros && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {/* Navegación de Secciones */}
          <div className="flex items-center gap-1 mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'fecha', label: 'Fechas', icon: CalendarIcon },
              { key: 'proyecto', label: 'Proyectos', icon: FolderIcon },
              { key: 'tarea', label: 'Tareas', icon: TagIcon },
              { key: 'horas', label: 'Horas', icon: ClockIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSeccionActiva(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  seccionActiva === key
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Contenido de Secciones */}
          <div className="min-h-[200px]">
            {/* Sección de Fechas */}
            {seccionActiva === 'fecha' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaInicio || ''}
                    onChange={(e) => onFiltrosChange({ ...filtros, fechaInicio: e.target.value, periodoPreset: 'personalizado' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={filtros.fechaFin || ''}
                    onChange={(e) => onFiltrosChange({ ...filtros, fechaFin: e.target.value, periodoPreset: 'personalizado' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Sección de Proyectos */}
            {seccionActiva === 'proyecto' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Proyectos Específicos
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {proyectosDisponibles.map((proyecto) => (
                      <label key={proyecto.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.proyectosSeleccionados?.includes(proyecto.id) || false}
                          onChange={() => handleProyectoToggle(proyecto.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{proyecto.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          proyecto.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {proyecto.status}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Estados de Proyecto
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['active', 'completed', 'on-hold', 'cancelled'].map((estado) => (
                      <label key={estado} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.estadosProyecto?.includes(estado as any) || false}
                          onChange={() => handleEstadoProyectoToggle(estado)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{estado}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Tareas */}
            {seccionActiva === 'tarea' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Estados de Tarea
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['pending', 'in-progress', 'completed', 'cancelled'].map((estado) => (
                      <label key={estado} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.estadosTarea?.includes(estado as any) || false}
                          onChange={() => {
                            const estadosActuales = filtros.estadosTarea || [];
                            const nuevosEstados = estadosActuales.includes(estado as any)
                              ? estadosActuales.filter(e => e !== estado)
                              : [...estadosActuales, estado as any];
                            onFiltrosChange({ ...filtros, estadosTarea: nuevosEstados });
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{estado.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Prioridades de Tarea
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'urgent'].map((prioridad) => (
                      <label key={prioridad} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filtros.prioridadesTarea?.includes(prioridad as any) || false}
                          onChange={() => {
                            const prioridadesActuales = filtros.prioridadesTarea || [];
                            const nuevasPrioridades = prioridadesActuales.includes(prioridad as any)
                              ? prioridadesActuales.filter(p => p !== prioridad)
                              : [...prioridadesActuales, prioridad as any];
                            onFiltrosChange({ ...filtros, prioridadesTarea: nuevasPrioridades });
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{prioridad}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sección de Horas */}
            {seccionActiva === 'horas' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horas Mínimas
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={filtros.horasMinimas || ''}
                      onChange={(e) => onFiltrosChange({ ...filtros, horasMinimas: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horas Máximas
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={filtros.horasMaximas || ''}
                      onChange={(e) => onFiltrosChange({ ...filtros, horasMaximas: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Sin límite"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filtros.soloConHoras || false}
                      onChange={(e) => onFiltrosChange({ ...filtros, soloConHoras: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Solo elementos con horas registradas</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltrosAvanzados;
