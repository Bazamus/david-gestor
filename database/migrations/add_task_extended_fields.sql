-- ================================================================
-- MIGRACIÓN: CAMPOS EXPANDIDOS PARA TAREAS
-- Fecha: 2025-08-06
-- Descripción: Añade 22 nuevos campos organizados en 7 secciones
--              Incluye sistema de CheckPoints automático para jerarquías
-- ================================================================

-- 1. AÑADIR NUEVOS CAMPOS A LA TABLA TASKS
-- ================================================================

-- SECCIÓN 1: GESTIÓN Y ASIGNACIÓN (4 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tipo_tarea VARCHAR(50) DEFAULT 'desarrollo';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS asignado_a VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS complejidad INTEGER CHECK (complejidad >= 1 AND complejidad <= 5) DEFAULT 3;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tarea_padre_id UUID REFERENCES tasks(id) ON DELETE CASCADE;

-- SECCIÓN 2: SEGUIMIENTO Y PROGRESO (4 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS porcentaje_completado INTEGER CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tiempo_estimado_horas DECIMAL(5,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tiempo_real_horas DECIMAL(5,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS fecha_inicio DATE;

-- SECCIÓN 3: CRITERIOS Y VALIDACIÓN (3 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS criterios_aceptacion JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS definicion_terminado TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS bloqueadores TEXT;

-- SECCIÓN 4: DESARROLLO Y TÉCNICO (3 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS branch_git VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS commit_relacionado VARCHAR(100);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS url_pull_request TEXT;

-- SECCIÓN 5: DEPENDENCIAS Y RELACIONES (2 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependencias UUID[] DEFAULT '{}';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS impacto_otras_tareas TEXT;

-- SECCIÓN 6: ARCHIVOS Y RECURSOS (3 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archivos_adjuntos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS enlaces_referencia TEXT[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS onedrive_folder_id VARCHAR(100);

-- SECCIÓN 7: AUTOMATIZACIÓN Y RECURRENCIA (3 campos)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS es_recurrente BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS frecuencia_recurrencia VARCHAR(50);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notas_internas TEXT;

-- 2. COMENTARIOS DE DOCUMENTACIÓN
-- ================================================================
COMMENT ON COLUMN tasks.tipo_tarea IS 'Tipo de tarea: desarrollo, diseño, testing, documentación, reunión, investigación';
COMMENT ON COLUMN tasks.asignado_a IS 'Persona responsable de la tarea';
COMMENT ON COLUMN tasks.complejidad IS 'Nivel de complejidad de 1 (muy fácil) a 5 (muy complejo)';
COMMENT ON COLUMN tasks.tarea_padre_id IS 'ID de la tarea padre para crear jerarquías';
COMMENT ON COLUMN tasks.porcentaje_completado IS 'Porcentaje de completado de 0 a 100';
COMMENT ON COLUMN tasks.tiempo_estimado_horas IS 'Tiempo estimado en horas para completar la tarea';
COMMENT ON COLUMN tasks.tiempo_real_horas IS 'Tiempo real invertido en horas';
COMMENT ON COLUMN tasks.fecha_inicio IS 'Fecha de inicio real de la tarea';
COMMENT ON COLUMN tasks.criterios_aceptacion IS 'Array JSON de criterios que debe cumplir la tarea';
COMMENT ON COLUMN tasks.definicion_terminado IS 'Definición clara de cuándo se considera terminada';
COMMENT ON COLUMN tasks.bloqueadores IS 'Impedimentos o bloqueadores actuales';
COMMENT ON COLUMN tasks.branch_git IS 'Nombre del branch de Git asociado';
COMMENT ON COLUMN tasks.commit_relacionado IS 'Hash del commit relacionado';
COMMENT ON COLUMN tasks.url_pull_request IS 'URL del Pull Request asociado';
COMMENT ON COLUMN tasks.dependencias IS 'Array de IDs de tareas de las que depende';
COMMENT ON COLUMN tasks.impacto_otras_tareas IS 'Descripción del impacto en otras tareas';
COMMENT ON COLUMN tasks.archivos_adjuntos IS 'Array JSON de archivos adjuntos con metadatos';
COMMENT ON COLUMN tasks.enlaces_referencia IS 'Array de URLs de referencia';
COMMENT ON COLUMN tasks.onedrive_folder_id IS 'ID de la carpeta en OneDrive para archivos';
COMMENT ON COLUMN tasks.es_recurrente IS 'Indica si la tarea es recurrente';
COMMENT ON COLUMN tasks.frecuencia_recurrencia IS 'Frecuencia de recurrencia: diaria, semanal, mensual, etc.';
COMMENT ON COLUMN tasks.notas_internas IS 'Notas internas adicionales';

-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_tipo_tarea ON tasks(tipo_tarea);
CREATE INDEX IF NOT EXISTS idx_tasks_asignado_a ON tasks(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tasks_complejidad ON tasks(complejidad);
CREATE INDEX IF NOT EXISTS idx_tasks_tarea_padre_id ON tasks(tarea_padre_id);
CREATE INDEX IF NOT EXISTS idx_tasks_porcentaje_completado ON tasks(porcentaje_completado);
CREATE INDEX IF NOT EXISTS idx_tasks_fecha_inicio ON tasks(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_tasks_es_recurrente ON tasks(es_recurrente);
CREATE INDEX IF NOT EXISTS idx_tasks_dependencias ON tasks USING GIN(dependencias);
CREATE INDEX IF NOT EXISTS idx_tasks_criterios_aceptacion ON tasks USING GIN(criterios_aceptacion);
CREATE INDEX IF NOT EXISTS idx_tasks_archivos_adjuntos ON tasks USING GIN(archivos_adjuntos);

-- 4. FUNCIÓN PARA ACTUALIZAR ESTADO DE TAREA PADRE
-- ================================================================
CREATE OR REPLACE FUNCTION update_parent_task_status()
RETURNS TRIGGER AS $$
DECLARE
    parent_id UUID;
    total_subtasks INTEGER;
    completed_subtasks INTEGER;
    completion_percentage DECIMAL;
    new_status VARCHAR(20);
BEGIN
    -- Obtener el ID de la tarea padre
    parent_id := COALESCE(NEW.tarea_padre_id, OLD.tarea_padre_id);
    
    -- Si no hay tarea padre, no hacer nada
    IF parent_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Contar subtareas totales y completadas
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETADA') as completed
    INTO total_subtasks, completed_subtasks
    FROM tasks 
    WHERE tarea_padre_id = parent_id;
    
    -- Calcular porcentaje de completado
    IF total_subtasks > 0 THEN
        completion_percentage := (completed_subtasks::DECIMAL / total_subtasks::DECIMAL) * 100;
        
        -- Determinar nuevo estado basado en porcentaje
        IF completion_percentage = 0 THEN
            new_status := 'NADA';
        ELSIF completion_percentage = 100 THEN
            new_status := 'COMPLETADA';
        ELSE
            new_status := 'EN_PROGRESO';
        END IF;
        
        -- Actualizar la tarea padre
        UPDATE tasks 
        SET 
            status = new_status,
            porcentaje_completado = ROUND(completion_percentage),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = parent_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGERS PARA CHECKPOINT AUTOMÁTICO
-- ================================================================
DROP TRIGGER IF EXISTS trigger_update_parent_task_status ON tasks;

CREATE TRIGGER trigger_update_parent_task_status
    AFTER INSERT OR UPDATE OF status OR DELETE
    ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_task_status();

-- 6. FUNCIÓN PARA OBTENER JERARQUÍA DE TAREAS
-- ================================================================
CREATE OR REPLACE FUNCTION get_task_hierarchy(task_id UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    status VARCHAR,
    level INTEGER,
    parent_id UUID,
    subtask_count INTEGER,
    completed_subtasks INTEGER
) AS $$
WITH RECURSIVE task_tree AS (
    -- Caso base: tarea raíz
    SELECT 
        t.id,
        t.title,
        t.status,
        0 as level,
        t.tarea_padre_id as parent_id
    FROM tasks t
    WHERE t.id = task_id
    
    UNION ALL
    
    -- Caso recursivo: subtareas
    SELECT 
        t.id,
        t.title,
        t.status,
        tt.level + 1,
        t.tarea_padre_id as parent_id
    FROM tasks t
    INNER JOIN task_tree tt ON t.tarea_padre_id = tt.id
)
SELECT 
    tt.id,
    tt.title,
    tt.status,
    tt.level,
    tt.parent_id,
    COALESCE(subtask_counts.total, 0) as subtask_count,
    COALESCE(subtask_counts.completed, 0) as completed_subtasks
FROM task_tree tt
LEFT JOIN (
    SELECT 
        tarea_padre_id,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETADA') as completed
    FROM tasks
    WHERE tarea_padre_id IS NOT NULL
    GROUP BY tarea_padre_id
) subtask_counts ON tt.id = subtask_counts.tarea_padre_id
ORDER BY tt.level, tt.title;
$$ LANGUAGE sql;

-- 7. ACTUALIZAR TRIGGER DE UPDATED_AT PARA NUEVOS CAMPOS
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurar que el trigger existe
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. DATOS DE EJEMPLO PARA TESTING
-- ================================================================
-- Insertar tipos de tarea comunes
INSERT INTO tasks (id, project_id, title, description, tipo_tarea, complejidad, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), (SELECT id FROM projects LIMIT 1), 'Ejemplo: Tarea Padre', 'Tarea de ejemplo con subtareas', 'desarrollo', 4, 'NADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ================================================================
-- FIN DE MIGRACIÓN
-- ================================================================

-- Verificar que todo se creó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND column_name IN (
        'tipo_tarea', 'asignado_a', 'complejidad', 'tarea_padre_id',
        'porcentaje_completado', 'tiempo_estimado_horas', 'tiempo_real_horas', 'fecha_inicio',
        'criterios_aceptacion', 'definicion_terminado', 'bloqueadores',
        'branch_git', 'commit_relacionado', 'url_pull_request',
        'dependencias', 'impacto_otras_tareas',
        'archivos_adjuntos', 'enlaces_referencia', 'onedrive_folder_id',
        'es_recurrente', 'frecuencia_recurrencia', 'notas_internas'
    )
ORDER BY column_name;

COMMENT ON TABLE tasks IS 'Tabla de tareas expandida con 22 campos adicionales y sistema de CheckPoints automático';
