// Función serverless simplificada para diagnóstico
exports.handler = async (event, context) => {
  console.log('Función serverless ejecutándose:', event.path, event.httpMethod);
  
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Manejar preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Obtener la ruta limpia
    let path = event.path.replace('/.netlify/functions/api-simple', '');
    if (path.startsWith('/api')) {
      path = path.replace('/api', '');
    }
    
    const method = event.httpMethod;
    console.log(`Procesando: ${method} ${path}`);

    // Health check básico
    if (path === '/health' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK - Función Simple',
          timestamp: new Date().toISOString(),
          path: path,
          method: method,
          message: 'Función serverless funcionando correctamente'
        })
      };
    }

    // Test endpoint
    if (path === '/test') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Test endpoint funcionando',
          timestamp: new Date().toISOString(),
          path: path,
          method: method
        })
      };
    }

    // Auth login básico
    if (path === '/auth/login' && method === 'POST') {
      try {
        const { username, password } = JSON.parse(event.body || '{}');
        
        if (username === 'David' && password === 'Alcorcon2023*+') {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Login exitoso',
              user: {
                id: 1,
                username: 'David',
                email: 'david@example.com',
                role: 'admin'
              },
              token: 'mock-jwt-token-' + Date.now()
            })
          };
        } else {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              error: 'Credenciales inválidas',
              success: false
            })
          };
        }
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Error al procesar login',
            success: false
          })
        };
      }
    }

    // Projects endpoint básico
    if (path === '/projects' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            title: 'Proyecto Demo',
            description: 'Proyecto de demostración',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ])
      };
    }

    // Tasks endpoint básico
    if (path === '/tasks' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            title: 'Tarea Demo 1',
            description: 'Primera tarea de demostración',
            status: 'pending',
            priority: 'high',
            project_id: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Tarea Demo 2',
            description: 'Segunda tarea de demostración',
            status: 'in_progress',
            priority: 'medium',
            project_id: 1,
            created_at: new Date().toISOString()
          }
        ])
      };
    }

    // Dashboard stats básico
    if (path === '/dashboard/stats' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalProjects: 1,
          activeProjects: 1,
          completedProjects: 0,
          totalTasks: 3,
          pendingTasks: 2,
          completedTasks: 1,
          highPriorityTasks: 1
        })
      };
    }

    // Dashboard productivity
    if (path === '/dashboard/productivity' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          weeklyProgress: [
            { day: 'Lun', completed: 8, planned: 10 },
            { day: 'Mar', completed: 12, planned: 15 },
            { day: 'Mié', completed: 10, planned: 12 },
            { day: 'Jue', completed: 15, planned: 18 },
            { day: 'Vie', completed: 9, planned: 11 },
            { day: 'Sáb', completed: 5, planned: 6 },
            { day: 'Dom', completed: 3, planned: 4 }
          ],
          monthlyStats: {
            tasksCompleted: 156,
            averageDaily: 5.2,
            efficiency: 87.3,
            trend: 'up'
          }
        })
      };
    }

    // Dashboard summary
    if (path === '/dashboard/summary' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          recentProjects: [
            {
              id: 1,
              title: 'Proyecto Demo',
              status: 'active',
              updated_at: new Date().toISOString()
            }
          ],
          recentTasks: [
            {
              id: 1,
              title: 'Tarea Demo 1',
              status: 'pending',
              priority: 'high',
              updated_at: new Date().toISOString()
            }
          ],
          quickStats: {
            projectsThisMonth: 1,
            tasksThisWeek: 2,
            completionRate: 85.2
          }
        })
      };
    }

    // Reportes básicos
    if (path === '/reportes/horas-por-proyecto' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          { proyecto: 'Proyecto Demo', horas: 25.5, porcentaje: 100 }
        ])
      };
    }

    if (path === '/reportes/estadisticas-generales' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          totalHoras: 25.5,
          proyectosActivos: 1,
          tareasCompletadas: 1,
          eficiencia: 85.2
        })
      };
    }

    if (path === '/reportes/horas-diarias' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          { fecha: '2025-08-11', horas: 8.5 },
          { fecha: '2025-08-12', horas: 7.0 },
          { fecha: '2025-08-13', horas: 8.0 },
          { fecha: '2025-08-14', horas: 6.5 },
          { fecha: '2025-08-15', horas: 9.0 },
          { fecha: '2025-08-16', horas: 7.5 },
          { fecha: '2025-08-17', horas: 8.0 }
        ])
      };
    }

    // Time entries básico
    if (path === '/time-entries' && method === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            description: 'Trabajo de prueba',
            hours: 2.5,
            date: new Date().toISOString().split('T')[0]
          }
        ])
      };
    }

    // Ruta no encontrada
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Ruta no encontrada',
        path: path,
        method: method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
          '/health', '/test', '/auth/login', '/projects', '/tasks',
          '/dashboard/stats', '/dashboard/productivity', '/dashboard/summary',
          '/reportes/horas-por-proyecto', '/reportes/horas-diarias', '/reportes/estadisticas-generales', 
          '/time-entries'
        ]
      })
    };

  } catch (error) {
    console.error('Error en función serverless:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
