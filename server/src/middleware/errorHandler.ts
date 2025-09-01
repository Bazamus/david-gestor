import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Crear error personalizado
export const createError = (message: string, statusCode: number = 500): CustomError => {
  const error: CustomError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Middleware de manejo de errores
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log del error para debugging
  console.error('🚨 Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determinar el código de estado
  const statusCode = err.statusCode || 500;

  // Determinar el mensaje de error
  let message = err.message;
  
  // En producción, ocultar detalles de errores internos
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Error interno del servidor';
  }

  // Crear respuesta de error
  const errorResponse: any = {
    error: true,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // En desarrollo, incluir el stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.url = req.originalUrl;
    errorResponse.method = req.method;
  }

  // Enviar respuesta de error
  res.status(statusCode).json(errorResponse);
};

// Middleware para capturar errores asíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para rutas no encontradas
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = createError(`Ruta ${req.originalUrl} no encontrada`, 404);
  next(error);
};