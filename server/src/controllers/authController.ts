import { Request, Response } from 'express';
import { AuthService, LoginCredentials } from '../services/authService';

export class AuthController {
  /**
   * POST /auth/login
   * Autenticar usuario
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password }: LoginCredentials = req.body;

      // Validar campos requeridos
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username y password son requeridos'
        });
      }

      // Intentar autenticar
      const authResponse = await AuthService.login({ username, password });

      if (!authResponse.success) {
        return res.status(401).json({
          success: false,
          message: authResponse.message || 'Credenciales inválidas'
        });
      }

      // Respuesta exitosa
      return res.status(200).json({
        success: true,
        user: authResponse.user,
        token: authResponse.token,
        message: 'Login exitoso'
      });
    } catch (error) {
      console.error('Error en login controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /auth/logout
   * Cerrar sesión (el token se invalida en el cliente)
   */
  static async logout(req: Request, res: Response) {
    try {
      // En una implementación más avanzada, aquí se podría invalidar el token
      // Por ahora, solo devolvemos una respuesta exitosa
      return res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      console.error('Error en logout controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /auth/verify
   * Verificar token y obtener información del usuario
   */
  static async verify(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const authResponse = await AuthService.verifyToken(token);

      if (!authResponse.success) {
        return res.status(401).json({
          success: false,
          message: authResponse.message || 'Token inválido'
        });
      }

      return res.status(200).json({
        success: true,
        user: authResponse.user
      });
    } catch (error) {
      console.error('Error en verify controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /auth/me
   * Obtener información del usuario actual
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const authResponse = await AuthService.verifyToken(token);

      if (!authResponse.success) {
        return res.status(401).json({
          success: false,
          message: authResponse.message || 'Token inválido'
        });
      }

      return res.status(200).json({
        success: true,
        user: authResponse.user
      });
    } catch (error) {
      console.error('Error en getCurrentUser controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
