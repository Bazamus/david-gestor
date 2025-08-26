-- ================================================================
-- MIGRACIÓN: FUNCIÓN DE ESTADÍSTICAS GLOBALES DE PROYECTOS
-- Fecha: 2025-08-12
-- Descripción: Crea una función RPC para obtener estadísticas
--              agregadas de todos los proyectos, optimizando
--              los KPIs del dashboard de reportes.
-- ================================================================

CREATE OR REPLACE FUNCTION get_global_project_stats()
RETURNS TABLE (
    total_proyectos BIGINT,
    proyectos_activos BIGINT,
    proyectos_completados BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_proyectos,
        COUNT(*) FILTER (WHERE status = 'active') AS proyectos_activos,
        COUNT(*) FILTER (WHERE status = 'completed') AS proyectos_completados
    FROM
        projects
    WHERE
        status <> 'archived';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_global_project_stats() IS 'Calcula estadísticas globales de proyectos para el dashboard de reportes, excluyendo los archivados.';
