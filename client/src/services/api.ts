import { ApiResponse, ApiError } from '@/types';

// ======================================
// CONFIGURACIÓN BASE DE LA API
// ======================================

// Declaración de tipos para Vite env
// Declaración de tipos para Vite env
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly DEV: boolean;
    readonly MODE: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('[DEBUG] API_BASE_URL utilizada:', API_BASE_URL);

// ======================================
// CLIENTE HTTP PERSONALIZADO
// ======================================

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Método privado para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const finalHeaders = new Headers(this.defaultHeaders);

    // Añadir token de autenticación si existe en localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }

    // Añadir las cabeceras de las opciones específicas de la petición
    if (options.headers) {
      const optionsHeaders = new Headers(options.headers);
      optionsHeaders.forEach((value, key) => {
        finalHeaders.set(key, value);
      });
    }

    const config: RequestInit = {
      ...options,
      headers: finalHeaders,
    };

    try {
      const response = await fetch(url, config);
      
      // Log para desarrollo
      if (import.meta.env.DEV) {
        console.log(`🌐 ${config.method || 'GET'} ${url}`, {
          status: response.status,
          ok: response.ok
        });
      }

      if (!response.ok) {
        // Intentar parsear error del servidor
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          // Si no puede parsear, crear error genérico
          errorData = {
            error: true,
            message: `Error HTTP ${response.status}: ${response.statusText}`,
            statusCode: response.status,
            timestamp: new Date().toISOString(),
          };
        }
        
        // Manejo específico para rate limit
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const message = retryAfter 
            ? `Demasiadas peticiones. Intenta de nuevo en ${retryAfter} segundos.`
            : 'Demasiadas peticiones. Intenta de nuevo más tarde.';
          
          throw new ApiException(message, 429, {
            ...errorData,
            retryAfter: retryAfter ? parseInt(retryAfter) : undefined
          });
        }
        
        throw new ApiException(errorData.message, response.status, errorData);
      }

      // Parsear respuesta JSON
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Error de red o parsing
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiException(
          'Error de conexión. Verifica tu conexión a internet o el estado del servidor.',
          0
        );
      }

      throw new ApiException(
        'Error inesperado al procesar la solicitud.',
        500,
        undefined,
        error
      );
    }
  }

  // Métodos HTTP públicos
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Métodos para manejar headers
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}

// ======================================
// CLASE DE EXCEPCIÓN PERSONALIZADA
// ======================================

export class ApiException extends Error {
  public statusCode: number;
  public data?: ApiError;
  public originalError?: any;

  constructor(
    message: string, 
    statusCode: number = 500, 
    data?: ApiError,
    originalError?: any
  ) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.data = data;
    this.originalError = originalError;
  }

  // Métodos de conveniencia para verificar el tipo de error
  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isValidationError(): boolean {
    return this.statusCode === 422;
  }

  get isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  get isUnauthorizedError(): boolean {
    return this.statusCode === 401;
  }

  get isForbiddenError(): boolean {
    return this.statusCode === 403;
  }

  get isRateLimitError(): boolean {
    return this.statusCode === 429;
  }
}

// ======================================
// INSTANCIA GLOBAL DEL CLIENTE
// ======================================

export const apiClient = new ApiClient(API_BASE_URL);

// ======================================
// FUNCIONES UTILITARIAS
// ======================================

export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const transformApiError = (error: any): string => {
  if (error instanceof ApiException) {
    return error.message;
  }
  
  if (error?.data?.message) {
    return error.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Error desconocido';
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// ======================================
// TIPOS DE RESPUESTA
// ======================================

export type ApiSuccessResponse<T> = ApiResponse<T> & { success: true };
export type ApiErrorResponse = ApiResponse & { success: false; errors: string[] };

// ======================================
// INTERCEPTORES (PLACEHOLDER)
// ======================================

export const addRequestInterceptor = (): void => {
  // Implementación futura
};

export const addResponseInterceptor = (): void => {
  // Implementación futura
};

// ======================================
// CONFIGURACIÓN DE DESARROLLO
// ======================================

if (import.meta.env.DEV) {
  console.log('🔧 API Client configurado en modo desarrollo');
  console.log('📡 API URL:', API_BASE_URL);
  console.log('🌍 Environment:', import.meta.env.MODE);
}