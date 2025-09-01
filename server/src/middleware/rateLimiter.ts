import { Request, Response, NextFunction } from 'express';

// Interfaz para el almacén de rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Almacén en memoria para rate limiting (en producción usar Redis)
const store: RateLimitStore = {};

// Configuración de rate limiting optimizada para desarrollo
const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos por defecto
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100000'), // Muy permisivo
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Limpiar entradas expiradas del store cada 10 minutos
const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
  });
};

// Ejecutar cleanup cada 10 minutos
setInterval(cleanupExpiredEntries, 10 * 60 * 1000);

// Middleware de rate limiting optimizado y simplificado
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // En desarrollo, saltar completamente el rate limiting para evitar problemas
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // En producción, usar rate limiting muy permisivo
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `ratelimit:${clientIp}`;
  const now = Date.now();

  // Obtener o crear entrada para esta IP
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    };
  }

  // Incrementar contador
  store[key].count++;

  // Configurar headers de rate limit
  if (RATE_LIMIT_CONFIG.standardHeaders) {
    res.setHeader('RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests);
    res.setHeader('RateLimit-Remaining', Math.max(0, RATE_LIMIT_CONFIG.maxRequests - store[key].count));
    res.setHeader('RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));
  }

  // Verificar si se excedió el límite (muy improbable con límites tan altos)
  if (store[key].count > RATE_LIMIT_CONFIG.maxRequests) {
    const timeUntilReset = Math.ceil((store[key].resetTime - now) / 1000);
    
    res.setHeader('Retry-After', timeUntilReset);
    
    console.warn(`🚨 Rate limit excedido para IP: ${clientIp}`, {
      count: store[key].count,
      limit: RATE_LIMIT_CONFIG.maxRequests,
      resetIn: timeUntilReset,
      url: req.originalUrl,
    });

    return res.status(429).json({
      error: 'Rate limit excedido',
      message: RATE_LIMIT_CONFIG.message,
      retryAfter: timeUntilReset,
    });
  }

  next();
};

// Función para obtener estadísticas de rate limiting
export const getRateLimitStats = (): { activeConnections: number; totalRequests: number } => {
  const now = Date.now();
  const activeEntries = Object.values(store).filter(entry => entry.resetTime > now);
  const totalRequests = activeEntries.reduce((sum, entry) => sum + entry.count, 0);

  return {
    activeConnections: activeEntries.length,
    totalRequests,
  };
};