import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon, FolderIcon, SearchIcon, FilterIcon } from 'lucide-react';

// Components
import Button from '@/components/common/Button';
import { ProjectCard } from '@/components/common/Card';
import { CardSkeleton } from '@/components/common/Loading';
import SearchInput from '@/components/common/SearchInput';

// Hooks
import { useProjects, useProjectClients } from '@/hooks/useProjects';

// Types
import { ProjectStatus } from '@/types';
import type { ProjectFilters } from '@/services/projectService';

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProjectFilters>({});
  
  // Ref para evitar actualizaciones innecesarias
  const isInitialized = useRef(false);
  const lastUrlParams = useRef<string>('');
  
  const { data: projects, isLoading, isError, error } = useProjects(filters);

  // Leer parámetros de URL al cargar la página
  useEffect(() => {
    const currentUrlParams = searchParams.toString();
    
    // Evitar actualizaciones innecesarias si los parámetros no han cambiado
    if (isInitialized.current && currentUrlParams === lastUrlParams.current) {
      return;
    }
    
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const clienteParam = searchParams.get('cliente');
    
    const initialFilters: ProjectFilters = {};
    
    if (statusParam) {
      // Mapear 'active' a ProjectStatus.ACTIVE
      if (statusParam === 'active') {
        initialFilters.status = [ProjectStatus.ACTIVE];
      } else {
        // Para otros estados, usar el valor directamente
        initialFilters.status = [statusParam as ProjectStatus];
      }
    }
    
    if (searchParam) {
      initialFilters.search = searchParam;
    }
    
    if (clienteParam) {
      initialFilters.cliente = clienteParam;
    }
    
    // Solo actualizar si hay cambios reales
    const filtersChanged = JSON.stringify(initialFilters) !== JSON.stringify(filters);
    if (filtersChanged) {
      setFilters(initialFilters);
    }
    
    isInitialized.current = true;
    lastUrlParams.current = currentUrlParams;
  }, [searchParams, filters]);

  // Handler para cambios de filtros
  const handleFilterChange = (newFilters: Partial<ProjectFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Actualizar URL con los nuevos filtros
    const newSearchParams = new URLSearchParams();
    
    if (updatedFilters.status && updatedFilters.status.length > 0) {
      const status = updatedFilters.status[0];
      // Mapear ProjectStatus.ACTIVE a 'active' para la URL
      if (status === ProjectStatus.ACTIVE) {
        newSearchParams.set('status', 'active');
      } else {
        newSearchParams.set('status', status);
      }
    }
    
    if (updatedFilters.search) {
      newSearchParams.set('search', updatedFilters.search);
    }
    
    if (updatedFilters.cliente) {
      newSearchParams.set('cliente', updatedFilters.cliente);
    }
    
    // Solo actualizar URL si realmente ha cambiado
    const newUrlParams = newSearchParams.toString();
    if (newUrlParams !== lastUrlParams.current) {
      setSearchParams(newSearchParams);
      lastUrlParams.current = newUrlParams;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ProjectsHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <ProjectsHeader />
        <div className="text-center py-12">
          <FolderIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar proyectos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'}
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectsHeader />
      
      {/* Filtros */}
      <ProjectFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState onCreateProject={() => navigate('/projects/new')} />
      )}
    </div>
  );
};

const ProjectsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mis Proyectos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona todos tus proyectos desde aquí
        </p>
      </div>
      
      <div className="flex space-x-3">
        <Button
          variant="outline"
          icon={<SearchIcon className="w-4 h-4" />}
          onClick={() => navigate('/search?type=project')}
        >
          Buscar
        </Button>
        <Button
          variant="primary"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => navigate('/projects/new')}
        >
          Nuevo Proyecto
        </Button>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ onCreateProject: () => void }> = ({ onCreateProject }) => (
  <div className="text-center py-12">
    <FolderIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      No tienes proyectos aún
    </h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
      Crea tu primer proyecto para comenzar a organizar tus tareas y alcanzar tus objetivos.
    </p>
    <Button
      variant="primary"
      icon={<PlusIcon className="w-4 h-4" />}
      onClick={onCreateProject}
    >
      Crear mi primer proyecto
    </Button>
  </div>
);

// Componente de filtros para Proyectos
interface ProjectFiltersProps {
  filters: ProjectFilters;
  onFilterChange: (filters: Partial<ProjectFilters>) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({ filters, onFilterChange }) => {
  const { data: clients = [] } = useProjectClients();

  const projectStatuses = [
    { value: ProjectStatus.PLANNING, label: 'Planificación', color: 'bg-gray-100 text-gray-800' },
    { value: ProjectStatus.ACTIVE, label: 'Activo', color: 'bg-blue-100 text-blue-800' },
    { value: ProjectStatus.ON_HOLD, label: 'En pausa', color: 'bg-yellow-100 text-yellow-800' },
    { value: ProjectStatus.COMPLETED, label: 'Completado', color: 'bg-green-100 text-green-800' },
    { value: ProjectStatus.ARCHIVED, label: 'Archivado', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FilterIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar
          </label>
          <SearchInput
            placeholder="Buscar proyectos..."
            onSearch={(searchTerm) => onFilterChange({ search: searchTerm || undefined })}
            initialValue={filters.search || ''}
            minLength={2}
            debounceMs={300}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estado
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.status?.[0] || ''}
            onChange={(e) => onFilterChange({ status: e.target.value ? [e.target.value as ProjectStatus] : undefined })}
          >
            <option value="">Todos los estados</option>
            {projectStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cliente
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.cliente || ''}
            onChange={(e) => onFilterChange({ cliente: e.target.value || undefined })}
          >
            <option value="">Todos los clientes</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fecha de inicio
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={filters.start_date || ''}
            onChange={(e) => onFilterChange({ start_date: e.target.value || undefined })}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ordenar por
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={`${filters.sort_by || 'updated_at'}-${filters.sort_order || 'desc'}`}
            onChange={(e) => {
              const [sort_by, sort_order] = e.target.value.split('-');
              onFilterChange({ 
                sort_by: sort_by as any,
                sort_order: sort_order as 'asc' | 'desc'
              });
            }}
          >
            <option value="updated_at-desc">Actualizados recientemente</option>
            <option value="updated_at-asc">Actualizados hace tiempo</option>
            <option value="created_at-desc">Creados recientemente</option>
            <option value="created_at-asc">Creados hace tiempo</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="status-asc">Estado</option>
          </select>
        </div>
      </div>

      {/* Clear filters button */}
      {(filters.search || filters.status || filters.start_date || filters.cliente || filters.sort_by !== 'updated_at' || filters.sort_order !== 'desc') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ search: undefined, status: undefined, start_date: undefined, cliente: undefined, sort_by: 'updated_at', sort_order: 'desc' })}
            className="text-gray-600 dark:text-gray-400"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default Projects;