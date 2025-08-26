// Cargar variables de entorno PRIMERO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import net from 'net';

// Importar rutas
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import searchRoutes from './routes/search';
import reporteRoutes from './routes/reportes';
import timeEntriesRoutes from './routes/timeEntries';
import authRoutes from './routes/auth';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';

// Configuración de la aplicación
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Verificar variables de entorno requeridas
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:', missingEnvVars.join(', '));
  console.error('💡 Asegúrate de configurar el archivo .env correctamente');
  process.exit(1);
}

// Inicializar cliente de Supabase
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!
);

// ======================================
// MIDDLEWARE GLOBAL
// ======================================

// Seguridad básica
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como Postman o apps móviles) y orígenes en la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por la política de CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parsing de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Logging de requests
app.use(requestLogger);

// ======================================
// RUTAS
// ======================================

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/time-entries', timeEntriesRoutes);

// Ruta 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`,
  });
});

// Ruta principal para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API del Gestor de Proyectos funcionando correctamente',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
  });
});

// ======================================
// MANEJO DE ERRORES
// ======================================

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// ======================================
// INICIAR SERVIDOR
// ======================================

// Función para encontrar un puerto disponible
const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Puerto ${startPort} en uso, probando con el siguiente...`);
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
    server.listen({ port: startPort }, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => {
        resolve(port);
      });
    });
  });
};

// Iniciar el servidor de forma asíncrona
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT);

    const server = app.listen(availablePort, () => {
      console.log('==================================================');
      console.log(`🚀 Servidor listo y escuchando en http://localhost:${availablePort}`);
      console.log(`🌿 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('==================================================');
    });

    // Configuración optimizada de timeouts para evitar desconexiones
    server.keepAliveTimeout = 30000; // 30 segundos (reducido)
    server.headersTimeout = 31000; // 31 segundos (debe ser mayor que keepAliveTimeout)
    
    // Configurar límites de conexiones más permisivos
    server.maxConnections = 2000; // Aumentado significativamente
    
    // Manejo de errores del servidor
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('❌ Error del servidor:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Puerto ${availablePort} ya está en uso`);
      }
    });

    // Manejo simplificado de conexiones (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      server.on('connection', (socket) => {
        // Configuración mínima de timeouts
        socket.setTimeout(60000); // 1 minuto
        socket.setKeepAlive(true, 30000); // 30 segundos
        
        socket.on('timeout', () => {
          socket.destroy();
        });
        
        socket.on('error', (error) => {
          // Solo log en caso de errores críticos
          const errorCode = (error as any).code;
          if (errorCode !== 'ECONNRESET' && errorCode !== 'EPIPE') {
            console.error(`❌ Error de conexión:`, errorCode);
          }
        });
      });
    }

    // Manejo de cierre ordenado (graceful shutdown)
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} recibido, cerrando servidor...`);
      
      // Detener nuevas conexiones
      server.close((err) => {
        if (err) {
          console.error('❌ Error al cerrar servidor:', err);
          process.exit(1);
        }
        
        console.log('✅ Servidor cerrado correctamente.');
        process.exit(0);
      });
      
      // Forzar cierre después de 5 segundos si no se cierra correctamente
      setTimeout(() => {
        console.error('❌ Forzando cierre del servidor...');
        process.exit(1);
      }, 5000);
    };

    // Manejar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('❌ Error no capturado:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Promesa rechazada no manejada:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;