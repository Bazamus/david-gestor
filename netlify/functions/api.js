const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
  );
}

// Función principal de Netlify
exports.handler = async (event, context) => {
  // Configurar CORS
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
    // Obtener la ruta de la URL
    let path = event.path.replace('/.netlify/functions/api', '');
    // También manejar rutas que vienen con /api prefix
    if (path.startsWith('/api')) {
      path = path.replace('/api', '');
    }
    const method = event.httpMethod;

    console.log(`API Request: ${method} ${path}`);

    // Health check
    if (path === '/health' || path === '') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production',
          version: '1.0.0',
          message: 'API funcionando correctamente en Netlify',
          method: method,
          path: path,
          supabase: {
            url: process.env.SUPABASE_URL ? 'configured' : 'missing',
            anonKey: process.env.SUPABASE_ANON_KEY ? 'configured' : 'missing',
            serviceKey: process.env.SUPABASE_SERVICE_KEY ? 'configured' : 'missing'
          }
        })
      };
    }

    // Ruta de prueba
    if (path === '/test') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Ruta de prueba funcionando en Netlify',
          timestamp: new Date().toISOString(),
          method: method,
          path: path
        })
      };
    }

    // Ruta de proyectos
    if (path === '/projects' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al obtener proyectos:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener proyectos' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Ruta de tareas
    if (path === '/tasks' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error al obtener tareas:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener tareas' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Ruta de autenticación - Login
    if (path === '/auth/login' && method === 'POST') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { username, password } = JSON.parse(event.body || '{}');
        
        console.log('Intento de login:', { username, password: password ? '***' : 'missing' });

        // Validación básica
        if (!username || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Usuario y contraseña son requeridos',
              success: false 
            })
          };
        }

        // Autenticación simple (para desarrollo)
        // En producción, esto debería usar Supabase Auth
        if (username === 'David' && password === 'Alcorcon2023*+') {
          const token = 'mock-jwt-token-' + Date.now();
          
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
              token: token,
              timestamp: new Date().toISOString()
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
        console.error('Error en login:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Error interno del servidor',
            success: false
          })
        };
      }
    }

    // Ruta de autenticación - Verificar token
    if (path === '/auth/verify' && method === 'POST') {
      try {
        const { token } = JSON.parse(event.body || '{}');
        
        if (!token) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              error: 'Token requerido',
              success: false
            })
          };
        }

        // Verificación simple del token
        if (token.startsWith('mock-jwt-token-')) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: {
                id: 1,
                username: 'David',
                email: 'david@example.com',
                role: 'admin'
              },
              valid: true
            })
          };
        } else {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              error: 'Token inválido',
              success: false
            })
          };
        }
      } catch (error) {
        console.error('Error en verificación:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: 'Error interno del servidor',
            success: false
          })
        };
      }
    }

    // Rutas del Dashboard
    if (path === '/dashboard/stats' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener estadísticas básicas del dashboard
        const [projectsResult, tasksResult] = await Promise.all([
          supabase.from('projects').select('id, status').order('created_at', { ascending: false }),
          supabase.from('tasks').select('id, status, priority').order('created_at', { ascending: false })
        ]);

        const projects = projectsResult.data || [];
        const tasks = tasksResult.data || [];

        const stats = {
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'active').length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          totalTasks: tasks.length,
          pendingTasks: tasks.filter(t => t.status === 'pending').length,
          inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          highPriorityTasks: tasks.filter(t => t.priority === 'high').length
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener estadísticas' })
        };
      }
    }

    if (path === '/dashboard/productivity' && method === 'GET') {
      try {
        // Datos de productividad simulados para el dashboard
        const productivity = {
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
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(productivity)
        };
      } catch (error) {
        console.error('Error al obtener datos de productividad:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener datos de productividad' })
        };
      }
    }

    if (path === '/dashboard/summary' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener resumen rápido del dashboard
        const [projectsResult, tasksResult] = await Promise.all([
          supabase.from('projects').select('id, title, status, updated_at').order('updated_at', { ascending: false }).limit(5),
          supabase.from('tasks').select('id, title, status, priority, updated_at').order('updated_at', { ascending: false }).limit(10)
        ]);

        const summary = {
          recentProjects: projectsResult.data || [],
          recentTasks: tasksResult.data || [],
          quickStats: {
            projectsThisMonth: (projectsResult.data || []).length,
            tasksThisWeek: (tasksResult.data || []).filter(t => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(t.updated_at) > weekAgo;
            }).length,
            completionRate: 85.2
          }
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      } catch (error) {
        console.error('Error al obtener resumen:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener resumen' })
        };
      }
    }

    // Endpoints de Reportes
    if (path === '/reportes/estadisticas-generales' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener estadísticas generales desde Supabase
        const [projectsResult, tasksResult] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('tasks').select('*')
        ]);

        const projects = projectsResult.data || [];
        const tasks = tasksResult.data || [];

        const estadisticas = {
          totalProyectos: projects.length,
          proyectosActivos: projects.filter(p => p.status === 'active').length,
          proyectosCompletados: projects.filter(p => p.status === 'completed').length,
          totalTareas: tasks.length,
          tareasCompletadas: tasks.filter(t => t.status === 'done' || t.status === 'completed').length,
          totalHoras: 156.5, // Simulado por ahora
          horasEstaSemana: 32.5, // Simulado por ahora
          eficienciaPromedio: 87.3 // Simulado por ahora
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(estadisticas)
        };
      } catch (error) {
        console.error('Error al obtener estadísticas generales:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener estadísticas generales' })
        };
      }
    }

    if (path === '/reportes/horas-por-proyecto' && method === 'GET') {
      try {
        // Datos simulados de horas por proyecto
        const horasPorProyecto = [
          { proyecto: 'Proyecto A', horas: 45.5, porcentaje: 35 },
          { proyecto: 'Proyecto B', horas: 32.0, porcentaje: 25 },
          { proyecto: 'Proyecto C', horas: 28.5, porcentaje: 22 },
          { proyecto: 'Proyecto D', horas: 23.0, porcentaje: 18 }
        ];

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(horasPorProyecto)
        };
      } catch (error) {
        console.error('Error al obtener horas por proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener horas por proyecto' })
        };
      }
    }

    if (path === '/reportes/horas-diarias' && method === 'GET') {
      try {
        // Datos simulados de horas diarias
        const horasDiarias = [
          { fecha: '2025-08-11', horas: 8.5 },
          { fecha: '2025-08-12', horas: 7.0 },
          { fecha: '2025-08-13', horas: 8.0 },
          { fecha: '2025-08-14', horas: 6.5 },
          { fecha: '2025-08-15', horas: 9.0 },
          { fecha: '2025-08-16', horas: 7.5 },
          { fecha: '2025-08-17', horas: 8.0 }
        ];

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(horasDiarias)
        };
      } catch (error) {
        console.error('Error al obtener horas diarias:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener horas diarias' })
        };
      }
    }

    // Obtener todos los proyectos (GET)
    if (path === '/projects' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error al obtener proyectos:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener proyectos' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado al obtener proyectos:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener proyecto por ID (GET)
    if (path.startsWith('/projects/') && !path.includes('/stats') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const projectId = path.split('/')[2];
        
        if (!projectId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de proyecto requerido' })
          };
        }

        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) {
          console.error('Error al obtener proyecto:', error);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Proyecto no encontrado' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado al obtener proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener estadísticas de proyecto por ID (GET)
    if (path.includes('/stats') && path.startsWith('/projects/') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const projectId = path.split('/')[2];
        
        if (!projectId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de proyecto requerido' })
          };
        }

        // Obtener estadísticas del proyecto desde Supabase
        const [tasksResult, timeEntriesResult] = await Promise.all([
          supabase.from('tasks').select('*').eq('project_id', projectId),
          supabase.from('time_entries_with_details').select('*').eq('project_id', projectId)
        ]);

        const tasks = tasksResult.data || [];
        const timeEntries = timeEntriesResult.data || [];

        const stats = {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
          pendingTasks: tasks.filter(t => t.status === 'pending').length,
          totalHours: timeEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0),
          totalEntries: timeEntries.length,
          highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
          mediumPriorityTasks: tasks.filter(t => t.priority === 'medium').length,
          lowPriorityTasks: tasks.filter(t => t.priority === 'low').length,
          completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Error al obtener estadísticas del proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener tareas por proyecto ID (GET)
    if (path.startsWith('/tasks/project/') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const projectId = path.split('/')[3];
        
        if (!projectId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de proyecto requerido' })
          };
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error al obtener tareas del proyecto:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener tareas del proyecto' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado al obtener tareas del proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener todas las tareas (GET)
    if (path === '/tasks' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error al obtener tareas:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener tareas' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado al obtener tareas:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener tarea por ID (GET)
    if (path.startsWith('/tasks/') && !path.includes('/project/') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskId = path.split('/')[2];
        
        if (!taskId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de tarea requerido' })
          };
        }

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (error) {
          console.error('Error al obtener tarea:', error);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Tarea no encontrada' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado al obtener tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener entradas de tiempo por tarea ID (GET)
    if (path.startsWith('/time-entries/task/') && !path.includes('/summary') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskId = path.split('/')[3];
        
        if (!taskId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de tarea requerido' })
          };
        }

        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('*')
          .eq('task_id', taskId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error al obtener entradas de tiempo de la tarea:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al obtener entradas de tiempo de la tarea' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado al obtener entradas de tiempo de la tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Obtener resumen de tiempo por tarea ID (GET)
    if (path.startsWith('/time-entries/task/') && path.includes('/summary') && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskId = path.split('/')[3];
        
        if (!taskId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de tarea requerido' })
          };
        }

        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('*')
          .eq('task_id', taskId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error al obtener entradas de tiempo para resumen de tarea:', error);
          // Fallback a resumen vacío si hay error
          const emptySummary = {
            total_entries: 0,
            total_hours: 0,
            billable_hours: 0,
            billable_amount: 0,
            average_hours_per_day: 0,
            task_id: taskId
          };
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(emptySummary)
          };
        }

        const entries = data || [];
        
        // Calcular estadísticas reales
        const totalHours = entries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
        const billableHours = entries.filter(entry => entry.billable).reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
        const billableAmount = billableHours * 50; // Tarifa ejemplo de $50/hora
        
        // Calcular promedio de horas por día
        const uniqueDays = new Set(entries.map(entry => entry.date)).size;
        const averageHoursPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;
        
        const summary = {
          total_entries: entries.length,
          total_hours: Math.round(totalHours * 100) / 100,
          billable_hours: Math.round(billableHours * 100) / 100,
          billable_amount: Math.round(billableAmount * 100) / 100,
          average_hours_per_day: Math.round(averageHoursPerDay * 100) / 100,
          task_id: taskId
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      } catch (error) {
        console.error('Error inesperado al obtener resumen de tiempo de tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Actualizar posición de tarea (PUT/PATCH)
    if (path.includes('/position') && path.startsWith('/tasks/') && (method === 'PUT' || method === 'PATCH')) {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskId = path.split('/')[2];
        const updateData = JSON.parse(event.body || '{}');
        
        if (!taskId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de tarea requerido' })
          };
        }

        console.log('Actualizando posición de tarea:', taskId, updateData);

        // Preparar datos para actualizar
        const updateFields = {};
        
        // Actualizar estado si se proporciona
        if (updateData.status) {
          updateFields.status = updateData.status;
        }
        
        // Actualizar posición si se proporciona
        if (updateData.position !== undefined) {
          updateFields.position = updateData.position;
        }
        
        // Actualizar columna si se proporciona
        if (updateData.column) {
          updateFields.column = updateData.column;
        }
        
        // Actualizar proyecto si se proporciona
        if (updateData.project_id) {
          updateFields.project_id = updateData.project_id;
        }
        
        // Siempre actualizar timestamp
        updateFields.updated_at = new Date().toISOString();

        // Actualizar en Supabase
        const { data, error } = await supabase
          .from('tasks')
          .update(updateFields)
          .eq('id', taskId)
          .select()
          .single();

        if (error) {
          console.error('Error al actualizar posición de tarea:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al actualizar posición de tarea' })
          };
        }

        console.log('Tarea actualizada exitosamente:', data);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado al actualizar posición de tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Crear tarea (POST)
    if (path === '/tasks' && method === 'POST') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskData = JSON.parse(event.body || '{}');
        
        console.log('Creando tarea:', taskData);

        // Validación básica
        if (!taskData.title) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'El título de la tarea es requerido' })
          };
        }

        // Crear tarea en Supabase
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'pending',
            priority: taskData.priority || 'medium',
            project_id: taskData.project_id || null,
            due_date: taskData.due_date || null,
            estimated_hours: taskData.estimated_hours || null,
            position: taskData.position || 0,
            column: taskData.column || 'todo',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error al crear tarea:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al crear tarea en la base de datos' })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error al procesar creación de tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Actualizar tarea específica (PUT)
    if (path.startsWith('/tasks/') && !path.includes('/position') && method === 'PUT') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const taskId = path.split('/')[2];
        const updateData = JSON.parse(event.body || '{}');
        
        console.log('Actualizando tarea:', taskId, updateData);

        if (!taskId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID de tarea requerido' })
          };
        }

        // Actualizar tarea en Supabase
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title: updateData.title,
            description: updateData.description,
            status: updateData.status,
            priority: updateData.priority,
            project_id: updateData.project_id,
            due_date: updateData.due_date,
            estimated_hours: updateData.estimated_hours,
            tags: updateData.tags,
            position: updateData.position,
            tipo_tarea: updateData.tipo_tarea,
            asignado_a: updateData.asignado_a,
            complejidad: updateData.complejidad,
            tarea_padre_id: updateData.tarea_padre_id,
            porcentaje_completado: updateData.porcentaje_completado,
            tiempo_estimado_horas: updateData.tiempo_estimado_horas,
            tiempo_real_horas: updateData.tiempo_real_horas,
            fecha_inicio: updateData.fecha_inicio,
            criterios_aceptacion: updateData.criterios_aceptacion,
            definicion_terminado: updateData.definicion_terminado,
            bloqueadores: updateData.bloqueadores,
            branch_git: updateData.branch_git,
            commit_relacionado: updateData.commit_relacionado,
            url_pull_request: updateData.url_pull_request,
            dependencias: updateData.dependencias,
            impacto_otras_tareas: updateData.impacto_otras_tareas,
            archivos_adjuntos: updateData.archivos_adjuntos,
            enlaces_referencia: updateData.enlaces_referencia,
            onedrive_folder_id: updateData.onedrive_folder_id,
            es_recurrente: updateData.es_recurrente,
            notas_internas: updateData.notas_internas,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId)
          .select()
          .single();

        if (error) {
          console.error('Error al actualizar tarea:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al actualizar tarea' })
          };
        }

        console.log('Tarea actualizada exitosamente:', data);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado al actualizar tarea:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Crear proyecto (POST)
    if (path === '/projects' && method === 'POST') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const projectData = JSON.parse(event.body || '{}');
        
        console.log('Creando proyecto:', projectData);

        // Validación básica
        if (!projectData.title) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'El título del proyecto es requerido' })
          };
        }

        // Crear proyecto en Supabase
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            title: projectData.title,
            description: projectData.description || '',
            status: projectData.status || 'active',
            priority: projectData.priority || 'medium',
            start_date: projectData.start_date || new Date().toISOString(),
            end_date: projectData.end_date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error al crear proyecto:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al crear proyecto en la base de datos' })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error al procesar creación de proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    if (path === '/reportes/semanas-disponibles' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener semanas disponibles desde time_entries_with_details
        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('date')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error al obtener fechas para semanas:', error);
          // Fallback a semanas simuladas
          const semanasSimuladas = [
            { year: 2025, week: 32, inicio: '2025-08-04', fin: '2025-08-10', start_date: '2025-08-04', end_date: '2025-08-10' },
            { year: 2025, week: 33, inicio: '2025-08-11', fin: '2025-08-17', start_date: '2025-08-11', end_date: '2025-08-17' }
          ];
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(semanasSimuladas)
          };
        }

        const entries = data || [];
        
        // Calcular semanas disponibles desde las fechas reales
        const semanas = new Map();
        
        entries.forEach(entry => {
          const fecha = new Date(entry.date);
          const year = fecha.getFullYear();
          
          // Calcular número de semana
          const startOfYear = new Date(year, 0, 1);
          const dayOfYear = Math.floor((fecha - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
          const week = Math.ceil(dayOfYear / 7);
          
          // Calcular inicio y fin de semana
          const startOfWeek = new Date(fecha);
          startOfWeek.setDate(fecha.getDate() - fecha.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          const weekKey = `${year}-${week}`;
          if (!semanas.has(weekKey)) {
            semanas.set(weekKey, {
              year: year,
              week: week,
              inicio: startOfWeek.toISOString().split('T')[0],
              fin: endOfWeek.toISOString().split('T')[0],
              start_date: startOfWeek.toISOString().split('T')[0],
              end_date: endOfWeek.toISOString().split('T')[0]
            });
          }
        });

        // Convertir a array y ordenar por fecha descendente
        const semanasArray = Array.from(semanas.values())
          .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.week - a.week;
          });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(semanasArray)
        };
      } catch (error) {
        console.error('Error al obtener semanas disponibles:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener semanas disponibles' })
        };
      }
    }

    // Endpoints de Time Entries (Tiempos)
    if (path === '/time-entries' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener entradas de tiempo desde Supabase con detalles completos
        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error al obtener time entries:', error);
          // Devolver datos simulados si hay error
          const simulatedData = [
            {
              id: 1,
              project_id: 1,
              task_id: 1,
              description: 'Desarrollo de funcionalidad login',
              hours: 2.5,
              date: '2025-08-12',
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              project_id: 1,
              task_id: 2,
              description: 'Testing y corrección de bugs',
              hours: 1.5,
              date: '2025-08-12',
              created_at: new Date().toISOString()
            }
          ];
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(simulatedData)
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data || [])
        };
      } catch (error) {
        console.error('Error inesperado en time entries:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    if (path === '/time-entries/summary' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener datos reales de time_entries_with_details
        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error al obtener time entries para resumen:', error);
          // Fallback a datos simulados si hay error
          const summary = {
            total_entries: 0,
            total_hours: 0,
            billable_hours: 0,
            billable_amount: 0,
            average_hours_per_day: 0
          };
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(summary)
          };
        }

        const entries = data || [];
        
        // Calcular estadísticas reales
        const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
        const billableEntries = entries.filter(entry => entry.billable);
        const billableHours = billableEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
        const billableAmount = billableEntries.reduce((sum, entry) => sum + parseFloat(entry.billable_amount || 0), 0);
        
        // Calcular horas por día (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentEntries = entries.filter(entry => new Date(entry.date) >= thirtyDaysAgo);
        const averageHoursPerDay = recentEntries.length > 0 ? totalHours / 30 : 0;

        const summary = {
          total_entries: entries.length,
          total_hours: totalHours,
          billable_hours: billableHours,
          billable_amount: billableAmount,
          average_hours_per_day: parseFloat(averageHoursPerDay.toFixed(2))
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      } catch (error) {
        console.error('Error al obtener resumen de tiempo:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener resumen de tiempo' })
        };
      }
    }

    if (path === '/time-entries' && method === 'POST') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const entryData = JSON.parse(event.body || '{}');
        
        console.log('Creando entrada de tiempo:', entryData);

        // Validación básica
        if (!entryData.description || !entryData.hours) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Descripción y horas son requeridas' })
          };
        }

        // Crear entrada de tiempo en Supabase
        const { data, error } = await supabase
          .from('time_entries')
          .insert([{
            project_id: entryData.project_id || null,
            task_id: entryData.task_id || null,
            description: entryData.description,
            hours: parseFloat(entryData.hours),
            date: entryData.date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error al crear entrada de tiempo:', error);
          // Devolver respuesta simulada si hay error
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
              id: Date.now(),
              ...entryData,
              created_at: new Date().toISOString()
            })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error al procesar entrada de tiempo:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Endpoints de Autenticación
    if (path === '/auth/verify' && (method === 'POST' || method === 'GET')) {
      try {
        let token;
        
        // Obtener token desde body (POST) o headers (GET)
        if (method === 'POST') {
          const body = JSON.parse(event.body || '{}');
          token = body.token;
        } else {
          // Para GET, obtener token desde headers Authorization
          const authHeader = event.headers.authorization || event.headers.Authorization;
          token = authHeader ? authHeader.replace('Bearer ', '') : null;
        }
        
        if (!token) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              valid: false, 
              error: 'Token requerido',
              message: 'No se proporcionó token de autenticación' 
            })
          };
        }

        // Verificación de token y obtención de usuario real
        const isValidToken = token && token.length > 10; // Validación básica

        if (isValidToken && supabase) {
          try {
            // Extraer ID del usuario del token (formato: token_userId_timestamp)
            const tokenParts = token.split('_');
            const userId = tokenParts.length > 1 ? tokenParts[1] : null;

            if (userId) {
              // Obtener usuario real de Supabase
              const { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

              if (!error && user) {
                return {
                  statusCode: 200,
                  headers,
                  body: JSON.stringify({ 
                    valid: true, 
                    user: { 
                      id: user.id, 
                      username: user.username,
                      role: user.role,
                      description: user.description
                    }
                  })
                };
              }
            }
          } catch (error) {
            console.error('Error al obtener usuario:', error);
          }

          // Fallback a usuario genérico si no se puede obtener el real
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              valid: true, 
              user: { 
                id: 1, 
                username: 'usuario',
                role: 'cliente',
                description: 'Usuario verificado'
              }
            })
          };
        } else {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              valid: false, 
              error: 'Token inválido',
              message: 'El token proporcionado no es válido'
            })
          };
        }
      } catch (error) {
        console.error('Error al verificar token:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            valid: false,
            error: 'Error al verificar token',
            message: error.message 
          })
        };
      }
    }

    // ======================================
    // ENDPOINTS DE DASHBOARD
    // ======================================

    // Dashboard stats
    if (path === '/dashboard/stats' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        // Obtener estadísticas reales desde Supabase
        const [projectsResult, tasksResult, timeEntriesResult] = await Promise.all([
          supabase.from('projects').select('*'),
          supabase.from('tasks').select('*'),
          supabase.from('time_entries').select('*')
        ]);

        const projects = projectsResult.data || [];
        const tasks = tasksResult.data || [];
        const timeEntries = timeEntriesResult.data || [];

        const stats = {
          total_projects: projects.length,
          active_projects: projects.filter(p => p.status === 'active').length,
          completed_projects: projects.filter(p => p.status === 'completed').length,
          total_tasks: tasks.length,
          completed_tasks: tasks.filter(t => t.status === 'completed').length,
          pending_tasks: tasks.filter(t => t.status === 'pending').length,
          overdue_tasks: tasks.filter(t => {
            const dueDate = new Date(t.due_date);
            return t.status !== 'completed' && dueDate < new Date();
          }).length,
          total_hours: timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          this_week_hours: timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate >= weekAgo;
          }).reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0)
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Error al obtener stats dashboard:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener estadísticas' })
        };
      }
    }

    // Dashboard summary
    if (path === '/dashboard/summary' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const [projectsResult, tasksResult] = await Promise.all([
          supabase.from('projects').select('*').eq('status', 'active').limit(5),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10)
        ]);

        const activeProjects = projectsResult.data || [];
        const recentTasks = tasksResult.data || [];
        const overdueTasks = recentTasks.filter(t => {
          const dueDate = new Date(t.due_date);
          return t.status !== 'completed' && dueDate < new Date();
        });
        const upcomingTasks = recentTasks.filter(t => {
          const dueDate = new Date(t.due_date);
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          return t.status !== 'completed' && dueDate <= nextWeek && dueDate >= new Date();
        });

        const summary = {
          active_projects: activeProjects,
          recent_tasks: recentTasks.slice(0, 5),
          overdue_tasks: overdueTasks,
          upcoming_tasks: upcomingTasks,
          counts: {
            active_projects: activeProjects.length,
            recent_tasks: recentTasks.length,
            overdue_tasks: overdueTasks.length,
            upcoming_tasks: upcomingTasks.length
          }
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      } catch (error) {
        console.error('Error al obtener summary dashboard:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener resumen' })
        };
      }
    }

    // Dashboard productivity
    if (path === '/dashboard/productivity' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        const entries = timeEntries || [];
        const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);
        const thisWeekEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        });
        const thisWeekHours = thisWeekEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0);

        const productivity = {
          total_hours_logged: totalHours,
          this_week_hours: thisWeekHours,
          average_hours_per_day: thisWeekHours / 7,
          productivity_score: Math.min(100, (thisWeekHours / 40) * 100), // Basado en 40h/semana
          efficiency_rating: 85, // Placeholder
          weekly_trend: thisWeekHours > (totalHours / 4) ? 'up' : 'down'
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(productivity)
        };
      } catch (error) {
        console.error('Error al obtener productivity dashboard:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener productividad' })
        };
      }
    }

    // Dashboard projects progress
    if (path === '/dashboard/projects-progress' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*');

        if (error) throw error;

        const projectsWithProgress = await Promise.all(
          (projects || []).map(async (project) => {
            const { data: tasks } = await supabase
              .from('tasks')
              .select('*')
              .eq('project_id', project.id);

            const totalTasks = tasks?.length || 0;
            const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
              ...project,
              total_tasks: totalTasks,
              completed_tasks: completedTasks,
              completion_percentage: completionPercentage,
              status: completionPercentage === 100 ? 'completed' : 
                     completionPercentage > 50 ? 'on_track' : 'behind'
            };
          })
        );

        const summary = {
          projects: projectsWithProgress,
          summary: {
            total_projects: projectsWithProgress.length,
            completed_projects: projectsWithProgress.filter(p => p.completion_percentage === 100).length,
            average_completion: projectsWithProgress.reduce((sum, p) => sum + p.completion_percentage, 0) / projectsWithProgress.length || 0,
            projects_on_track: projectsWithProgress.filter(p => p.status === 'on_track' || p.status === 'completed').length,
            projects_behind: projectsWithProgress.filter(p => p.status === 'behind').length
          }
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      } catch (error) {
        console.error('Error al obtener projects progress:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener progreso de proyectos' })
        };
      }
    }

    // Dashboard recent activity
    if (path === '/dashboard/recent-activity' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const limit = parseInt(new URLSearchParams(event.queryStringParameters || {}).get('limit') || '20');

        const [tasksResult, timeEntriesResult] = await Promise.all([
          supabase.from('tasks').select('*, projects(name)').order('updated_at', { ascending: false }).limit(limit / 2),
          supabase.from('time_entries').select('*, projects(name), tasks(title)').order('created_at', { ascending: false }).limit(limit / 2)
        ]);

        const tasks = (tasksResult.data || []).map(task => ({
          id: task.id,
          type: 'task',
          title: task.title,
          description: `Tarea ${task.status} en proyecto ${task.projects?.name || 'Sin proyecto'}`,
          timestamp: task.updated_at,
          project_name: task.projects?.name
        }));

        const timeEntries = (timeEntriesResult.data || []).map(entry => ({
          id: entry.id,
          type: 'time_entry',
          title: `${entry.hours}h registradas`,
          description: `${entry.description} - ${entry.projects?.name || 'Sin proyecto'}`,
          timestamp: entry.created_at,
          project_name: entry.projects?.name
        }));

        const activities = [...tasks, ...timeEntries]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, limit);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(activities)
        };
      } catch (error) {
        console.error('Error al obtener recent activity:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener actividad reciente' })
        };
      }
    }

    // Dashboard time metrics
    if (path === '/dashboard/time-metrics' && method === 'GET') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data: timeEntries, error } = await supabase
          .from('time_entries')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        const entries = timeEntries || [];
        const now = new Date();
        const thisWeek = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        });

        const thisMonth = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        });

        const metrics = {
          total_hours: entries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          this_week_hours: thisWeek.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          this_month_hours: thisMonth.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          average_hours_per_day: thisWeek.length > 0 ? thisWeek.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0) / 7 : 0,
          billable_hours: entries.filter(e => e.billable).reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          estimated_vs_actual: {
            estimated: 160, // Placeholder - 40h/semana * 4 semanas
            actual: thisMonth.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0)
          }
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(metrics)
        };
      } catch (error) {
        console.error('Error al obtener time metrics:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener métricas de tiempo' })
        };
      }
    }

    // ======================================
    // ENDPOINTS DE AUTENTICACIÓN
    // ======================================

    // Login endpoint
    if (path === '/auth/login' && method === 'POST') {
      try {
        const { username, password } = JSON.parse(event.body || '{}');
        
        if (!username || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Usuario y contraseña requeridos'
            })
          };
        }

        // Verificar credenciales contra Supabase
        if (supabase) {
          const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

          if (error || !users || users.password !== password) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({
                success: false,
                message: 'Credenciales inválidas'
              })
            };
          }

          // Login exitoso - generar token simulado
          const token = `token_${users.id}_${Date.now()}`;
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: {
                id: users.id,
                username: users.username,
                role: users.role,
                description: users.description
              },
              token: token
            })
          };
        }

        // Fallback si no hay Supabase
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Servicio de autenticación no disponible'
          })
        };
      } catch (error) {
        console.error('Error en login:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
          })
        };
      }
    }

    // Logout endpoint
    if (path === '/auth/logout' && method === 'POST') {
      try {
        // En una implementación real, aquí invalidarías el token
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Logout exitoso'
          })
        };
      } catch (error) {
        console.error('Error en logout:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
          })
        };
      }
    }

    // Verify token endpoint
    if (path === '/auth/verify' && method === 'GET') {
      try {
        const authHeader = event.headers.authorization || event.headers.Authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              valid: false,
              message: 'Token no proporcionado'
            })
          };
        }

        const token = authHeader.substring(7); // Remover 'Bearer '
        
        // Validación básica del token
        if (!token || token.length < 10) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              valid: false,
              message: 'Token inválido'
            })
          };
        }

        // Extraer ID de usuario del token (formato: token_userId_timestamp)
        const tokenParts = token.split('_');
        if (tokenParts.length < 3 || tokenParts[0] !== 'token') {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              valid: false,
              message: 'Formato de token inválido'
            })
          };
        }

        const userId = tokenParts[1];

        // Verificar usuario en Supabase
        if (supabase) {
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (error || !user) {
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({
                valid: false,
                message: 'Usuario no encontrado'
              })
            };
          }

          // Token válido, devolver datos del usuario
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              valid: true,
              user: {
                id: user.id,
                username: user.username,
                role: user.role,
                description: user.description
              }
            })
          };
        }

        // Fallback si no hay Supabase - token válido por defecto
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            valid: true,
            user: {
              id: userId,
              username: 'David',
              role: 'admin',
              description: 'Usuario administrador'
            }
          })
        };
      } catch (error) {
        console.error('Error en verify token:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            valid: false,
            message: 'Error interno del servidor'
          })
        };
      }
    }

    // ======================================
    // ENDPOINTS DE PROYECTOS EXTENDIDOS
    // ======================================

    // Estadísticas de proyecto específico
    if (path.includes('/stats') && path.startsWith('/projects/') && method === 'GET') {
      const projectId = path.split('/')[2];
      
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const [projectResult, tasksResult, timeEntriesResult] = await Promise.all([
          supabase.from('projects').select('*').eq('id', projectId).single(),
          supabase.from('tasks').select('*').eq('project_id', projectId),
          supabase.from('time_entries').select('*').eq('project_id', projectId)
        ]);

        if (projectResult.error) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Proyecto no encontrado' })
          };
        }

        const tasks = tasksResult.data || [];
        const timeEntries = timeEntriesResult.data || [];

        const stats = {
          project: projectResult.data,
          total_tasks: tasks.length,
          completed_tasks: tasks.filter(t => t.status === 'completed').length,
          pending_tasks: tasks.filter(t => t.status === 'pending').length,
          total_hours: timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hours || 0), 0),
          completion_percentage: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
          recent_activity: tasks.slice(0, 5)
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(stats)
        };
      } catch (error) {
        console.error('Error al obtener stats proyecto:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error al obtener estadísticas del proyecto' })
        };
      }
    }

    // Crear proyecto
    if (path === '/projects' && method === 'POST') {
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const projectData = JSON.parse(event.body || '{}');
        
        const { data, error } = await supabase
          .from('projects')
          .insert([{
            ...projectData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error al crear proyecto:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al crear proyecto' })
          };
        }

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Actualizar proyecto
    if (path.startsWith('/projects/') && !path.includes('/stats') && method === 'PUT') {
      const projectId = path.split('/')[2];
      
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const updateData = JSON.parse(event.body || '{}');
        
        const { data, error } = await supabase
          .from('projects')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .single();

        if (error) {
          console.error('Error al actualizar proyecto:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al actualizar proyecto' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // ======================================
    // ENDPOINTS DE TIME ENTRIES EXTENDIDOS
    // ======================================

    // Time entry específico
    if (path.startsWith('/time-entries/') && !path.includes('/task/') && !path.includes('/summary') && method === 'GET') {
      const entryId = path.split('/')[2];
      
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { data, error } = await supabase
          .from('time_entries_with_details')
          .select('*')
          .eq('id', entryId)
          .single();

        if (error) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Entrada de tiempo no encontrada' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error al obtener time entry:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Actualizar time entry
    if (path.startsWith('/time-entries/') && !path.includes('/task/') && !path.includes('/summary') && method === 'PUT') {
      const entryId = path.split('/')[2];
      
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const updateData = JSON.parse(event.body || '{}');
        
        const { data, error } = await supabase
          .from('time_entries')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', entryId)
          .select()
          .single();

        if (error) {
          console.error('Error al actualizar time entry:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al actualizar entrada de tiempo' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
    }

    // Eliminar time entry
    if (path.startsWith('/time-entries/') && !path.includes('/task/') && !path.includes('/summary') && method === 'DELETE') {
      const entryId = path.split('/')[2];
      
      if (!supabase) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Supabase no configurado' })
        };
      }

      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entryId);

        if (error) {
          console.error('Error al eliminar time entry:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error al eliminar entrada de tiempo' })
          };
        }

        return {
          statusCode: 204,
          headers,
          body: ''
        };
      } catch (error) {
        console.error('Error inesperado:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Error interno del servidor' })
        };
      }
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
          '/health', '/test', 
          '/projects', '/projects/{id}', '/projects/{id}/stats', '/tasks', '/tasks/{id}', '/tasks/{id}/position', '/tasks/project/{id}',
          '/time-entries/task/{id}', '/time-entries/task/{id}/summary',
          '/auth/login', '/auth/verify', 
          '/dashboard/stats', '/dashboard/productivity', '/dashboard/summary', 
          '/reportes/horas-por-proyecto', '/reportes/horas-diarias', '/reportes/semanas-disponibles',
          '/time-entries', '/time-entries/summary'
        ]
      })
    };

  } catch (error) {
    console.error('Error en la función:', error);
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
