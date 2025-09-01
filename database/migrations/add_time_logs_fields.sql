-- ================================================================
-- MIGRACIÓN: CAMPOS ADICIONALES PARA TIME_LOGS
-- Fecha: 2025-08-11
-- Descripción: Añade campos faltantes a la tabla time_logs para
--              soportar el sistema completo de time entries
-- ================================================================

-- Agregar campos faltantes a time_logs
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS comments TEXT;
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT true;
ALTER TABLE time_logs ADD COLUMN IF NOT EXISTS rate_per_hour DECIMAL(8,2) CHECK (rate_per_hour >= 0);

-- Comentarios de documentación
COMMENT ON COLUMN time_logs.start_time IS 'Hora de inicio del trabajo (opcional)';
COMMENT ON COLUMN time_logs.end_time IS 'Hora de fin del trabajo (opcional)';
COMMENT ON COLUMN time_logs.comments IS 'Comentarios adicionales sobre el trabajo realizado';
COMMENT ON COLUMN time_logs.billable IS 'Indica si el tiempo es facturable al cliente';
COMMENT ON COLUMN time_logs.rate_per_hour IS 'Tarifa por hora en euros para cálculo de facturación';

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_time_logs_start_time ON time_logs(start_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_end_time ON time_logs(end_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_billable ON time_logs(billable);
CREATE INDEX IF NOT EXISTS idx_time_logs_rate_per_hour ON time_logs(rate_per_hour);
