-- ================================================================
-- MIGRACIÓN: ACTUALIZAR DATOS EXISTENTES EN TIME_LOGS
-- Fecha: 2025-08-11
-- Descripción: Actualiza las entradas existentes en time_logs para
--              que tengan valores por defecto en los nuevos campos
-- ================================================================

-- Actualizar entradas existentes que no tengan billable configurado
UPDATE time_logs 
SET billable = true 
WHERE billable IS NULL;

-- Actualizar entradas existentes que no tengan rate_per_hour configurado
-- Establecer una tarifa por defecto de 50€/hora para entradas existentes
UPDATE time_logs 
SET rate_per_hour = 50.00 
WHERE rate_per_hour IS NULL;

-- Verificar que todas las entradas tengan los campos necesarios
SELECT 
    COUNT(*) as total_entries,
    COUNT(CASE WHEN billable IS NOT NULL THEN 1 END) as entries_with_billable,
    COUNT(CASE WHEN rate_per_hour IS NOT NULL THEN 1 END) as entries_with_rate,
    COUNT(CASE WHEN billable = true THEN 1 END) as billable_entries,
    SUM(CASE WHEN billable = true THEN hours * rate_per_hour ELSE 0 END) as total_billable_amount
FROM time_logs;
