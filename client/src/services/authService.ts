import { User } from '../contexts/AuthContext';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export class AuthService {
  /**
   * Realizar login
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Realizar logout
   */
  static async logout(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      // Adaptar respuesta del backend a estructura esperada por frontend
      return {
        success: data.valid || false,
        user: data.user,
        message: data.message || (data.valid ? 'Token válido' : 'Token inválido')
      };
    } catch (error) {
      console.error('Error verificando token:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Obtener información del usuario actual
   */
  static async getCurrentUser(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Verificar si el usuario tiene permisos de administrador
   */
  static isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
  }

  /**
   * Verificar si el usuario tiene permisos de cliente
   */
  static isCliente(user: User | null): boolean {
    return user?.role === 'cliente';
  }

  /**
   * Obtener token del localStorage
   */
  static getStoredToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Guardar token en localStorage
   */
  static storeToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Eliminar token del localStorage
   */
  static removeStoredToken(): void {
    localStorage.removeItem('authToken');
  }
}
