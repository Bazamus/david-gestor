import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseService } from './supabaseService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'cliente';
  description: string;
}

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
   * Autenticar usuario con username y password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { username, password } = credentials;

      // Buscar usuario en la base de datos
      const { data: users, error } = await supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !users) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, users.password_hash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Contraseña incorrecta'
        };
      }

      // Crear token JWT
      const user: User = {
        id: users.id,
        username: users.username,
        role: users.role,
        description: users.description
      };

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar token JWT y obtener información del usuario
   */
  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Buscar usuario en la base de datos para verificar que aún existe
      const { data: user, error } = await supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          description: user.description
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token inválido o expirado'
      };
    }
  }

  /**
   * Verificar si un usuario tiene permisos de administrador
   */
  static async isAdmin(token: string): Promise<boolean> {
    try {
      const authResponse = await this.verifyToken(token);
      return authResponse.success && authResponse.user?.role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar si un usuario tiene permisos de cliente
   */
  static async isCliente(token: string): Promise<boolean> {
    try {
      const authResponse = await this.verifyToken(token);
      return authResponse.success && authResponse.user?.role === 'cliente';
    } catch (error) {
      return false;
    }
  }
}
