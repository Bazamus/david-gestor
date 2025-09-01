-- ================================================================
-- MIGRACIÓN: ACTUALIZAR RESTRICCIÓN CHECK DE STATUS EN TAREAS
-- Fecha: 2025-08-06
-- Descripción: Actualiza la restricción CHECK del campo status para incluir los nuevos estados
-- ================================================================

-- 1. ELIMINAR LA RESTRICCIÓN CHECK EXISTENTE
-- ================================================================
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;

-- 2. AÑADIR NUEVA RESTRICCIÓN CHECK CON TODOS LOS ESTADOS
-- ================================================================
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
    CHECK (status IN ('todo', 'in_progress', 'done', 'NADA', 'EN_PROGRESO', 'COMPLETADA'));

-- 3. VERIFICAR QUE LA RESTRICCIÓN SE APLICÓ CORRECTAMENTE
-- ================================================================
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'tasks_status_check';

-- 4. ACTUALIZAR VALORES POR DEFECTO SI ES NECESARIO
-- ================================================================
-- Cambiar el valor por defecto de 'todo' a 'NADA' para consistencia
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'NADA';

-- 5. VERIFICAR QUE TODO FUNCIONA
-- ================================================================
-- Probar insertar una tarea con el nuevo estado
INSERT INTO tasks (project_id, title, status, priority) 
VALUES (
    (SELECT id FROM projects LIMIT 1), 
    'Tarea de prueba con nuevo estado', 
    'NADA', 
    'medium'
) ON CONFLICT DO NOTHING;

-- Limpiar la tarea de prueba
DELETE FROM tasks WHERE title = 'Tarea de prueba con nuevo estado';

COMMENT ON COLUMN tasks.status IS 'Estado de la tarea: todo, in_progress, done, NADA, EN_PROGRESO, COMPLETADA';

-- ================================================================
-- FIN DE MIGRACIÓN
-- ================================================================
