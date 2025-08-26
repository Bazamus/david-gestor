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
<<<<<<< HEAD
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
=======
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
<<<<<<< HEAD
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
=======
      res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
      return;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
    }

    const authResponse = await AuthService.verifyToken(token);

    if (!authResponse.success) {
<<<<<<< HEAD
      return res.status(401).json({
        success: false,
        message: authResponse.message || 'Token inválido'
      });
=======
      res.status(401).json({
        success: false,
        message: authResponse.message || 'Token inválido'
      });
      return;
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
    }

    // Agregar información del usuario a la request
    req.user = authResponse.user;
    next();
  } catch (error) {
    console.error('Error en authenticateToken middleware:', error);
<<<<<<< HEAD
    return res.status(500).json({
=======
    res.status(500).json({
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos de administrador
 */
<<<<<<< HEAD
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador'
      });
=======
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
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
    }

    next();
  } catch (error) {
    console.error('Error en requireAdmin middleware:', error);
<<<<<<< HEAD
    return res.status(500).json({
=======
    res.status(500).json({
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar permisos de cliente
 */
<<<<<<< HEAD
export const requireCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (req.user.role !== 'cliente') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de cliente'
      });
=======
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
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
    }

    next();
  } catch (error) {
    console.error('Error en requireCliente middleware:', error);
<<<<<<< HEAD
    return res.status(500).json({
=======
    res.status(500).json({
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware opcional para autenticación (no falla si no hay token)
 */
<<<<<<< HEAD
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
=======
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
>>>>>>> fe79550a8794a062e787dd7640a6ead6fd5228ba
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
