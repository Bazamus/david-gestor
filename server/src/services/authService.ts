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

      console.log('🔍 Intentando login para usuario:', username);

      // Verificar que las variables de entorno estén configuradas
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.error('❌ Variables de entorno de Supabase no configuradas');
        return {
          success: false,
          message: 'Error de configuración del servidor'
        };
      }

      // Buscar usuario en la base de datos
      const { data: users, error } = await supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        console.error('❌ Error al buscar usuario:', error);
        
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'Tabla de usuarios no existe. Contacta al administrador.'
          };
        }
        
        if (error.code === 'PGRST116') {
          return {
            success: false,
            message: 'Usuario no encontrado'
          };
        }
        
        return {
          success: false,
          message: 'Error al buscar usuario en la base de datos'
        };
      }

      if (!users) {
        console.log('❌ Usuario no encontrado:', username);
        return {
          success: false,
          message: 'Usuario no encontrado'
        };
      }

      console.log('✅ Usuario encontrado:', users.username);

      // Verificar contraseña
      console.log('  [AuthService] Iniciando comparación de contraseña...');
      const isValidPassword = await bcrypt.compare(password, users.password_hash);
      console.log('  [AuthService] Comparación de contraseña finalizada. Es válida:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('❌ Contraseña incorrecta para usuario:', username);
        return {
          success: false,
          message: 'Contraseña incorrecta'
        };
      }

      console.log('✅ Contraseña válida para usuario:', username);

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

      console.log('✅ Token JWT generado para usuario:', username);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('❌ Error en login:', error);
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
      console.error('Error en verifyToken:', error);
      return {
        success: false,
        message: 'Token inválido'
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
