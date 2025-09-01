import { Request, Response, NextFunction } from 'express';

// Interfaz para el log de request
interface RequestLog {
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip: string;
  timestamp: string;
}

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Función para obtener color según el status code
const getStatusColor = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) return colors.green;
  if (statusCode >= 300 && statusCode < 400) return colors.cyan;
  if (statusCode >= 400 && statusCode < 500) return colors.yellow;
  if (statusCode >= 500) return colors.red;
  return colors.reset;
};

// Función para obtener color según el método HTTP
const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'GET': return colors.green;
    case 'POST': return colors.blue;
    case 'PUT': return colors.yellow;
    case 'DELETE': return colors.red;
    case 'PATCH': return colors.magenta;
    default: return colors.gray;
  }
};

// Middleware de logging de requests optimizado
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Capturar información del request
  const requestInfo: Partial<RequestLog> = {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    timestamp: new Date().toISOString(),
  };

  // Interceptar el final de la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Completar la información del log
    const logInfo: RequestLog = {
      ...requestInfo,
      statusCode,
      responseTime,
    } as RequestLog;

    // Solo logear en desarrollo para requests importantes o errores
    if (process.env.NODE_ENV === 'development') {
      // Filtrar requests de health check y otros endpoints de sistema
      const isSystemRequest = logInfo.url.includes('/health') || 
                             logInfo.url.includes('/favicon') ||
                             logInfo.url.includes('/robots.txt');
      
      // Solo logear si no es un request del sistema o si es un error
      if (!isSystemRequest || statusCode >= 400) {
        const methodColor = getMethodColor(logInfo.method);
        const statusColor = getStatusColor(statusCode);
        
        console.log(
          `${colors.gray}[${logInfo.timestamp}]${colors.reset} ` +
          `${methodColor}${logInfo.method}${colors.reset} ` +
          `${colors.cyan}${logInfo.url}${colors.reset} ` +
          `${statusColor}${statusCode}${colors.reset} ` +
          `${colors.yellow}${responseTime}ms${colors.reset}`
        );
      }
    }

    // En producción, solo logear errores
    if (process.env.NODE_ENV === 'production' && statusCode >= 400) {
      console.error('Request Error:', {
        method: logInfo.method,
        url: logInfo.url,
        statusCode,
        responseTime,
        ip: logInfo.ip,
        userAgent: logInfo.userAgent,
        timestamp: logInfo.timestamp,
      });
    }

    return originalSend.call(this, data);
  };

  next();
};