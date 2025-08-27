import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: 'admin' | 'cliente';
        description: string;
      };
    }
  }
}

/**
 * Middleware para verificar token de autenticación
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
      return;
    }

    const authResponse = await AuthService.verifyToken(token);

    if (!authResponse.success) {
      res.status(401).json({
        success: false,
        message: authResponse.message || 'Token inválido'
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = authResponse.user;
    next();
  } catch (error) {
    console.error('Error en authenticateToken middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos de administrador
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error en requireAdmin middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos de cliente
 */
export const requireCliente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
      return;
    }

    if (req.user.role !== 'cliente') {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de cliente'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error en requireCliente middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional para autenticación (no falla si no hay token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const authResponse = await AuthService.verifyToken(token);
      if (authResponse.success) {
        req.user = authResponse.user;
      }
    }

    next();
  } catch (error) {
    // En este caso, no fallamos si hay error, solo continuamos
    next();
  }
};
