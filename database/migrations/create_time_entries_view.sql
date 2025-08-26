-- ================================================================
-- MIGRACIÓN: VISTA TIME_ENTRIES_WITH_DETAILS
-- Fecha: 2025-08-11
-- Descripción: Crea la vista time_entries_with_details que combina
--              time_logs con información de tareas y proyectos
-- ================================================================

-- Crear la vista time_entries_with_details
CREATE OR REPLACE VIEW time_entries_with_details AS
SELECT 
    tl.id,
    tl.task_id,
    tl.description,
    tl.hours,
    tl.date,
    tl.created_at,
    tl.start_time,
    tl.end_time,
    tl.comments,
    tl.billable,
    tl.rate_per_hour,
    -- Calcular monto facturable
    CASE 
        WHEN tl.billable = true AND tl.rate_per_hour IS NOT NULL 
        THEN tl.hours * tl.rate_per_hour
        ELSE 0
    END as billable_amount,
    -- Información de la tarea
    t.title as task_title,
    t.status as task_status,
    t.priority as task_priority,
    -- Información del proyecto
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    p.status as project_status
FROM time_logs tl
LEFT JOIN tasks t ON tl.task_id = t.id
LEFT JOIN projects p ON t.project_id = p.id
ORDER BY tl.date DESC, tl.created_at DESC;

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_time_logs_billable ON time_logs(billable);
CREATE INDEX IF NOT EXISTS idx_time_logs_rate_per_hour ON time_logs(rate_per_hour);
CREATE INDEX IF NOT EXISTS idx_time_logs_start_time ON time_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_end_time ON time_logs(end_time);

-- Comentarios de documentación
COMMENT ON VIEW time_entries_with_details IS 'Vista que combina time_logs con información de tareas y proyectos para el sistema de gestión de tiempo';
COMMENT ON COLUMN time_entries_with_details.billable_amount IS 'Monto facturable calculado como hours * rate_per_hour cuando billable es true';
