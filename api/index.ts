import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Obtener la ruta de la URL
    const { pathname } = new URL(req.url || '', `https://${req.headers.host}`);

    // Health check
    if (pathname === '/api/health' || pathname === '/health') {
      return res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        message: 'API funcionando correctamente',
        method: req.method,
        path: pathname
      });
    }

    // Ruta raíz de la API
    if (pathname === '/api' || pathname === '/api/') {
      return res.status(200).json({
        message: 'API de Gestor de Proyectos',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          health: '/api/health',
          test: '/api/test'
        },
        method: req.method,
        path: pathname
      });
    }

    // Ruta de prueba
    if (pathname === '/api/test') {
      return res.status(200).json({
        message: 'Ruta de prueba funcionando',
        timestamp: new Date().toISOString(),
        method: req.method,
        path: pathname
      });
    }

    // Ruta no encontrada
    return res.status(404).json({
      error: 'Ruta no encontrada',
      path: pathname,
      method: req.method,
      timestamp: new Date().toISOString(),
      availableEndpoints: ['/api/health', '/api/test']
    });

  } catch (error) {
    console.error('Error en la API:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: 'Algo salió mal',
      timestamp: new Date().toISOString()
    });
  }
}
