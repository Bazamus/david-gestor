import { apiClient, buildQueryParams } from './api';
import { 
  SearchResult,
  SearchSuggestion,
  SearchFilters,
  Project,
  Task,
  ApiResponse 
} from '@/types';

// ======================================
// INTERFACES ADICIONALES
// ======================================

export interface SearchHistory {
  query: string;
  type: 'all' | 'project' | 'task';
  timestamp: string;
  results_count: number;
}

export interface SearchStats {
  totals: {
    projects: number;
    tasks: number;
    unique_tags: number;
  };
  distributions: {
    project_status: Record<string, number>;
    task_status: Record<string, number>;
    task_priority: Record<string, number>;
  };
  popular_tags: Array<{ tag: string; count: number }>;
  search_tips: string[];
}

export interface TagSearchResult {
  matching_tags: string[];
  relevance_score: number;
  [key: string]: any; // Para incluir propiedades de Task
}

// ======================================
// SERVICIO DE BÚSQUEDA
// ======================================

class SearchService {
  private readonly basePath = '/search';

  /**
   * Búsqueda global en proyectos y tareas
   */
  async globalSearch(
    query: string, 
    type: 'all' | 'project' | 'task' = 'all',
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult[]> {
    const params = buildQueryParams({ q: query, type, limit, offset });
    const response = await apiClient.get<ApiResponse<SearchResult[]>>(`${this.basePath}?${params}`);
    
    return response.data || [];
  }

  /**
   * Búsqueda avanzada de proyectos
   */
  async searchProjects(filters: SearchFilters): Promise<Project[]> {
    const params = buildQueryParams(filters);
    const response = await apiClient.get<ApiResponse<Project[]>>(`${this.basePath}/projects?${params}`);
    
    return response.data || [];
  }

  /**
   * Búsqueda avanzada de tareas
   */
  async searchTasks(filters: SearchFilters): Promise<Task[]> {
    const params = buildQueryParams(filters);
    const response = await apiClient.get<ApiResponse<Task[]>>(`${this.basePath}/tasks?${params}`);
    
    return response.data || [];
  }

  /**
   * Obtener sugerencias de búsqueda en tiempo real
   */
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (query.trim().length < 2) {
      return [];
    }

    const params = buildQueryParams({ q: query });
    const response = await apiClient.get<ApiResponse<SearchSuggestion[]>>(`${this.basePath}/suggestions?${params}`);
    
    return response.data || [];
  }

  /**
   * Buscar tareas por etiquetas específicas
   */
  async searchByTags(tags: string[]): Promise<TagSearchResult[]> {
    const params = buildQueryParams({ tags: tags.join(',') });
    const response = await apiClient.get<ApiResponse<TagSearchResult[]>>(`${this.basePath}/tags?${params}`);
    
    return response.data || [];
  }

  /**
   * Obtener historial de búsquedas
   */
  async getSearchHistory(): Promise<SearchHistory[]> {
    const response = await apiClient.get<ApiResponse<SearchHistory[]>>(`${this.basePath}/history`);
    
    return response.data || [];
  }

  /**
   * Obtener estadísticas de búsqueda
   */
  async getSearchStats(): Promise<SearchStats> {
    const response = await apiClient.get<ApiResponse<SearchStats>>(`${this.basePath}/stats`);
    
    if (!response.data) {
      throw new Error('Error al obtener estadísticas de búsqueda');
    }
    
    return response.data;
  }

  // ======================================
  // MÉTODOS DE UTILIDAD LOCAL
  // ======================================

  /**
   * Filtrar resultados por relevancia
   */
  filterByRelevance(results: SearchResult[], minScore: number = 5): SearchResult[] {
    return results.filter(result => result.match_score >= minScore);
  }

  /**
   * Agrupar resultados por tipo
   */
  groupResultsByType(results: SearchResult[]): {
    projects: SearchResult[];
    tasks: SearchResult[];
  } {
    return {
      projects: results.filter(r => r.type === 'project'),
      tasks: results.filter(r => r.type === 'task')
    };
  }

  /**
   * Resaltar texto en resultados de búsqueda
   */
  highlightSearchTerms(text: string, query: string): string {
    if (!query.trim()) return text;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return highlightedText;
  }

  /**
   * Generar consultas de búsqueda relacionadas
   */
  generateRelatedQueries(originalQuery: string): string[] {
    const queries: string[] = [];
    const words = originalQuery.toLowerCase().split(' ').filter(w => w.length > 2);
    
    // Búsquedas con palabras individuales
    words.forEach(word => {
      if (word !== originalQuery.toLowerCase()) {
        queries.push(word);
      }
    });
    
    // Búsquedas relacionadas comunes
    const relatedTerms: Record<string, string[]> = {
      'frontend': ['react', 'ui', 'component', 'interface'],
      'backend': ['api', 'server', 'database', 'endpoint'],
      'diseño': ['ui', 'ux', 'mockup', 'prototipo'],
      'testing': ['test', 'qa', 'bug', 'prueba'],
      'documentation': ['docs', 'readme', 'manual', 'guía']
    };
    
    words.forEach(word => {
      if (relatedTerms[word]) {
        queries.push(...relatedTerms[word]);
      }
    });
    
    return [...new Set(queries)].slice(0, 5);
  }

  /**
   * Validar consulta de búsqueda
   */
  validateSearchQuery(query: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (!query || query.trim().length === 0) {
      errors.push('La consulta de búsqueda no puede estar vacía');
      return { isValid: false, errors, suggestions };
    }
    
    if (query.trim().length < 2) {
      errors.push('La consulta debe tener al menos 2 caracteres');
      suggestions.push('Intenta con una búsqueda más específica');
    }
    
    if (query.length > 100) {
      errors.push('La consulta es demasiado larga (máximo 100 caracteres)');
      suggestions.push('Intenta reducir el texto de búsqueda');
    }
    
    // Detectar búsquedas que podrían ser demasiado amplias
    const veryCommonWords = ['a', 'el', 'la', 'de', 'en', 'y', 'o', 'que', 'es', 'se'];
    const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 0);
    const commonWordsUsed = queryWords.filter(w => veryCommonWords.includes(w));
    
    if (commonWordsUsed.length === queryWords.length && queryWords.length > 0) {
      suggestions.push('Intenta usar palabras más específicas para mejores resultados');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Formatear resultados para mostrar
   */
  formatResultsForDisplay(results: SearchResult[]): Array<{
    id: string;
    type: 'project' | 'task';
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    icon: string;
    href: string;
  }> {
    return results.map(result => ({
      id: result.id,
      type: result.type,
      title: result.title,
      subtitle: result.type === 'task' && result.project_name 
        ? `Proyecto: ${result.project_name}`
        : result.type === 'project' ? 'Proyecto' : 'Tarea',
      description: result.description || 'Sin descripción',
      badge: result.type === 'project' ? 'Proyecto' : 'Tarea',
      icon: result.type === 'project' ? 'folder' : 'check-square',
      href: result.type === 'project' 
        ? `/projects/${result.id}`
        : `/tasks/${result.id}`
    }));
  }

  /**
   * Crear filtros de búsqueda desde formulario
   */
  createFiltersFromForm(formData: any): SearchFilters {
    const filters: SearchFilters = {
      query: formData.query || '',
    };

    if (formData.type && formData.type !== 'all') {
      filters.type = formData.type;
    }

    if (formData.project_id) {
      filters.project_id = formData.project_id;
    }

    if (formData.status && formData.status.length > 0) {
      filters.status = formData.status;
    }

    if (formData.priority && formData.priority.length > 0) {
      filters.priority = formData.priority;
    }

    if (formData.tags && formData.tags.length > 0) {
      filters.tags = formData.tags;
    }

    if (formData.due_date_from) {
      filters.due_date_from = formData.due_date_from;
    }

    if (formData.due_date_to) {
      filters.due_date_to = formData.due_date_to;
    }

    if (formData.sort_by) {
      filters.sort_by = formData.sort_by;
    }

    if (formData.sort_order) {
      filters.sort_order = formData.sort_order;
    }

    return filters;
  }

  /**
   * Obtener historial local de búsquedas (localStorage)
   */
  getLocalSearchHistory(): SearchHistory[] {
    try {
      const history = localStorage.getItem('search_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guardar búsqueda en historial local
   */
  saveToLocalHistory(query: string, type: 'all' | 'project' | 'task', resultsCount: number): void {
    try {
      const history = this.getLocalSearchHistory();
      const newEntry: SearchHistory = {
        query,
        type,
        timestamp: new Date().toISOString(),
        results_count: resultsCount
      };

      // Evitar duplicados recientes
      const filteredHistory = history.filter(
        entry => entry.query.toLowerCase() !== query.toLowerCase() || 
                 entry.type !== type
      );

      const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10); // Máximo 10 entradas
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.warn('No se pudo guardar en el historial de búsqueda:', error);
    }
  }

  /**
   * Limpiar historial local
   */
  clearLocalHistory(): void {
    try {
      localStorage.removeItem('search_history');
    } catch (error) {
      console.warn('No se pudo limpiar el historial de búsqueda:', error);
    }
  }
}

// ======================================
// INSTANCIA SINGLETON
// ======================================

export const searchService = new SearchService();
export default searchService;