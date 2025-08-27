-- ====================================================================
-- FUNCIÓN: get_global_stats
-- DESCRIPCIÓN: Calcula estadísticas globales para todo el sistema.
-- RETORNA: Una única fila con métricas clave del dashboard.
-- ====================================================================

CREATE OR REPLACE FUNCTION get_global_stats()
RETURNS TABLE (
    total_projects BIGINT,
    active_projects BIGINT,
    completed_projects BIGINT,
    total_tasks BIGINT,
    completed_tasks BIGINT,
    pending_tasks BIGINT,
    overdue_tasks BIGINT,
    total_actual_hours NUMERIC,
    productivity_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH project_stats AS (
        SELECT
            COUNT(*) AS total_projects,
            COUNT(*) FILTER (WHERE status = 'active') AS active_projects,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_projects
        FROM projects
        WHERE status <> 'archived'
    ),
    task_stats AS (
        SELECT
            COUNT(*) AS total_tasks,
            COUNT(*) FILTER (WHERE status = 'done') AS completed_tasks,
            COUNT(*) FILTER (WHERE status != 'done') AS pending_tasks,
            COUNT(*) FILTER (WHERE status != 'done' AND due_date < CURRENT_TIMESTAMP) AS overdue_tasks,
            COALESCE(SUM(actual_hours), 0)::NUMERIC AS total_time_logged -- Cast a NUMERIC
        FROM tasks
    )
    SELECT
        p.total_projects,
        p.active_projects,
        p.completed_projects,
        t.total_tasks,
        t.completed_tasks,
        t.pending_tasks,
        t.overdue_tasks,
        t.total_time_logged AS total_actual_hours, -- Renombrar para coincidir
        CASE
            WHEN t.total_tasks > 0 THEN ROUND((t.completed_tasks::NUMERIC / t.total_tasks::NUMERIC) * 100, 2)
            ELSE 0
        END AS productivity_percentage
    FROM project_stats p, task_stats t;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_global_stats() IS 'Calcula y agrega estadísticas clave de proyectos y tareas para el dashboard principal.';

