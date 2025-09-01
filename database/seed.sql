-- ======================================
-- DATOS DE EJEMPLO - GESTOR DE PROYECTOS
-- ======================================

-- Limpieza inicial (opcional para desarrollo)
-- DELETE FROM time_logs;
-- DELETE FROM tasks;
-- DELETE FROM projects;

-- ======================================
-- PROYECTOS DE EJEMPLO
-- ======================================

INSERT INTO projects (id, name, description, color, status, start_date, end_date) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Aplicación Web Personal',
    'Desarrollo de una aplicación web para gestión de proyectos personales usando React y Node.js',
    '#3B82F6',
    'active',
    '2024-01-01',
    '2024-03-31'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Aprendizaje TypeScript',
    'Curso completo de TypeScript para mejorar las habilidades de desarrollo',
    '#10B981',
    'active',
    '2024-01-15',
    '2024-02-28'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Rediseño Portfolio',
    'Actualización completa del portfolio personal con nuevos proyectos',
    '#F59E0B',
    'planning',
    '2024-02-01',
    '2024-04-15'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Blog Técnico',
    'Creación de un blog para compartir conocimientos de programación',
    '#EF4444',
    'on_hold',
    '2024-01-10',
    NULL
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Proyecto Demo Completed',
    'Proyecto de ejemplo completado para mostrar funcionalidades',
    '#6B7280',
    'completed',
    '2023-12-01',
    '2023-12-31'
);

-- ======================================
-- TAREAS DE EJEMPLO
-- ======================================

-- Tareas para "Aplicación Web Personal"
INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, tags, position) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Configurar entorno de desarrollo',
    'Instalar Node.js, configurar TypeScript, ESLint y Prettier',
    'done',
    'high',
    '2024-01-02 17:00:00+00',
    4,
    3,
    ARRAY['setup', 'config'],
    1
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Diseñar esquema de base de datos',
    'Crear el esquema SQL para proyectos, tareas y time tracking',
    'done',
    'high',
    '2024-01-05 17:00:00+00',
    6,
    8,
    ARRAY['database', 'design'],
    2
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Implementar API REST',
    'Desarrollar endpoints para CRUD de proyectos y tareas',
    'in_progress',
    'high',
    '2024-01-12 17:00:00+00',
    12,
    8,
    ARRAY['backend', 'api'],
    3
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'Crear componentes de UI',
    'Desarrollar componentes React reutilizables con Tailwind CSS',
    'todo',
    'medium',
    '2024-01-20 17:00:00+00',
    16,
    0,
    ARRAY['frontend', 'react', 'ui'],
    4
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    'Implementar tablero Kanban',
    'Funcionalidad drag & drop para gestión visual de tareas',
    'todo',
    'medium',
    '2024-01-25 17:00:00+00',
    10,
    0,
    ARRAY['frontend', 'kanban', 'dnd'],
    5
),
(
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    'Dashboard con métricas',
    'Crear dashboard principal con gráficos y estadísticas',
    'todo',
    'low',
    '2024-02-01 17:00:00+00',
    8,
    0,
    ARRAY['frontend', 'dashboard', 'charts'],
    6
);

-- Tareas para "Aprendizaje TypeScript"
INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, tags, position) VALUES
(
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440002',
    'Fundamentos de TypeScript',
    'Aprender tipos básicos, interfaces y funciones',
    'done',
    'high',
    '2024-01-18 17:00:00+00',
    8,
    10,
    ARRAY['learning', 'typescript'],
    1
),
(
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440002',
    'TypeScript avanzado',
    'Generics, decoradores y tipos condicionales',
    'in_progress',
    'medium',
    '2024-01-25 17:00:00+00',
    12,
    6,
    ARRAY['learning', 'typescript', 'advanced'],
    2
),
(
    '660e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440002',
    'Proyecto práctico',
    'Desarrollar una pequeña aplicación para practicar conceptos',
    'todo',
    'medium',
    '2024-02-15 17:00:00+00',
    16,
    0,
    ARRAY['learning', 'practice', 'project'],
    3
);

-- Tareas para "Rediseño Portfolio"
INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, tags, position) VALUES
(
    '660e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440003',
    'Investigación de diseño',
    'Analizar portfolios modernos y tendencias de diseño',
    'todo',
    'medium',
    '2024-02-05 17:00:00+00',
    6,
    0,
    ARRAY['design', 'research'],
    1
),
(
    '660e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440003',
    'Wireframes y mockups',
    'Crear diseños detallados antes de la implementación',
    'todo',
    'high',
    '2024-02-12 17:00:00+00',
    8,
    0,
    ARRAY['design', 'wireframes'],
    2
);

-- Tareas para "Blog Técnico"
INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, tags, position) VALUES
(
    '660e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440004',
    'Elegir plataforma',
    'Decidir entre Gatsby, Next.js o WordPress para el blog',
    'todo',
    'high',
    NULL,
    4,
    0,
    ARRAY['blog', 'platform'],
    1
),
(
    '660e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440004',
    'Primer artículo',
    'Escribir artículo sobre mejores prácticas en React',
    'todo',
    'medium',
    NULL,
    6,
    0,
    ARRAY['blog', 'writing', 'react'],
    2
);

-- ======================================
-- TIME LOGS DE EJEMPLO
-- ======================================

INSERT INTO time_logs (task_id, description, hours, date) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Instalación de Node.js y configuración inicial',
    2.0,
    '2024-01-02'
),
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Configuración de TypeScript y ESLint',
    1.0,
    '2024-01-02'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Diseño inicial del esquema',
    4.0,
    '2024-01-04'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Refinamiento y validaciones',
    2.0,
    '2024-01-05'
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Documentación del esquema',
    2.0,
    '2024-01-05'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Setup del servidor Express',
    3.0,
    '2024-01-08'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Implementación de rutas básicas',
    3.0,
    '2024-01-09'
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Validaciones y manejo de errores',
    2.0,
    '2024-01-10'
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    'Estudio de tipos básicos',
    4.0,
    '2024-01-16'
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    'Práctica con interfaces',
    3.0,
    '2024-01-17'
),
(
    '660e8400-e29b-41d4-a716-446655440007',
    'Ejercicios de funciones tipadas',
    3.0,
    '2024-01-18'
),
(
    '660e8400-e29b-41d4-a716-446655440008',
    'Estudio de generics',
    3.0,
    '2024-01-22'
),
(
    '660e8400-e29b-41d4-a716-446655440008',
    'Práctica con tipos condicionales',
    3.0,
    '2024-01-23'
);

-- ======================================
-- VERIFICACIÓN DE DATOS
-- ======================================

-- Mostrar resumen de datos insertados
DO $$
BEGIN
    RAISE NOTICE 'Datos de ejemplo insertados correctamente:';
    RAISE NOTICE '- Proyectos: %', (SELECT COUNT(*) FROM projects);
    RAISE NOTICE '- Tareas: %', (SELECT COUNT(*) FROM tasks);
    RAISE NOTICE '- Time logs: %', (SELECT COUNT(*) FROM time_logs);
END $$;