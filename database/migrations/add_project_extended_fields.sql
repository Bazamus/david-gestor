-- ======================================
-- MIGRACIÓN: Campos Extendidos para Proyectos
-- Fecha: 2025
-- Descripción: Añade campos adicionales al formulario de creación de proyectos
-- ======================================

-- Información del Cliente/Negocio
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cliente_empresa VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS email_contacto VARCHAR(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(20);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tipo_proyecto VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja'));

-- Aspectos Técnicos
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stack_tecnologico TEXT[]; -- Array de strings
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repositorio_url VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS url_staging VARCHAR(500);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS url_produccion VARCHAR(500);

-- Gestión y Presupuesto
ALTER TABLE projects ADD COLUMN IF NOT EXISTS presupuesto_estimado DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS moneda VARCHAR(10) DEFAULT 'EUR';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS horas_estimadas INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS metodo_facturacion VARCHAR(50) CHECK (metodo_facturacion IN ('Por horas', 'Precio fijo', 'Por hitos'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_pago IN ('Pendiente', 'Parcial', 'Pagado'));

-- Organización
ALTER TABLE projects ADD COLUMN IF NOT EXISTS etiquetas TEXT[]; -- Array de strings para tags
ALTER TABLE projects ADD COLUMN IF NOT EXISTS carpeta_archivos VARCHAR(500); -- Ruta relativa en OneDrive
ALTER TABLE projects ADD COLUMN IF NOT EXISTS onedrive_folder_id VARCHAR(255); -- ID de la carpeta en OneDrive
ALTER TABLE projects ADD COLUMN IF NOT EXISTS imagen_proyecto VARCHAR(500); -- URL de la imagen del proyecto
ALTER TABLE projects ADD COLUMN IF NOT EXISTS notas_adicionales TEXT;

-- Seguimiento (campos automáticos)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT NOW();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS proxima_tarea TEXT;

-- ======================================
-- TRIGGER PARA ACTUALIZAR ULTIMA_ACTIVIDAD
-- ======================================

-- Función para actualizar ultima_actividad automáticamente
CREATE OR REPLACE FUNCTION update_ultima_actividad()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actividad = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar ultima_actividad en cada update
DROP TRIGGER IF EXISTS trigger_update_ultima_actividad ON projects;
CREATE TRIGGER trigger_update_ultima_actividad
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_ultima_actividad();

-- ======================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ======================================

CREATE INDEX IF NOT EXISTS idx_projects_tipo_proyecto ON projects(tipo_proyecto);
CREATE INDEX IF NOT EXISTS idx_projects_prioridad ON projects(prioridad);
CREATE INDEX IF NOT EXISTS idx_projects_cliente_empresa ON projects(cliente_empresa);
CREATE INDEX IF NOT EXISTS idx_projects_estado_pago ON projects(estado_pago);
CREATE INDEX IF NOT EXISTS idx_projects_ultima_actividad ON projects(ultima_actividad DESC);

-- ======================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ======================================

COMMENT ON COLUMN projects.cliente_empresa IS 'Nombre de la empresa cliente';
COMMENT ON COLUMN projects.contacto_principal IS 'Persona de contacto principal del cliente';
COMMENT ON COLUMN projects.email_contacto IS 'Email de contacto del cliente';
COMMENT ON COLUMN projects.telefono_contacto IS 'Teléfono de contacto del cliente';
COMMENT ON COLUMN projects.tipo_proyecto IS 'Tipo de proyecto (Página Web, App React, etc.)';
COMMENT ON COLUMN projects.prioridad IS 'Prioridad del proyecto (Alta, Media, Baja)';
COMMENT ON COLUMN projects.stack_tecnologico IS 'Array de tecnologías utilizadas';
COMMENT ON COLUMN projects.repositorio_url IS 'URL del repositorio de código';
COMMENT ON COLUMN projects.url_staging IS 'URL del entorno de staging';
COMMENT ON COLUMN projects.url_produccion IS 'URL del entorno de producción';
COMMENT ON COLUMN projects.presupuesto_estimado IS 'Presupuesto estimado del proyecto';
COMMENT ON COLUMN projects.moneda IS 'Moneda del presupuesto (EUR, USD, etc.)';
COMMENT ON COLUMN projects.horas_estimadas IS 'Horas estimadas para completar el proyecto';
COMMENT ON COLUMN projects.metodo_facturacion IS 'Método de facturación (Por horas, Precio fijo, Por hitos)';
COMMENT ON COLUMN projects.estado_pago IS 'Estado del pago (Pendiente, Parcial, Pagado)';
COMMENT ON COLUMN projects.etiquetas IS 'Array de etiquetas personalizadas';
COMMENT ON COLUMN projects.carpeta_archivos IS 'Ruta de la carpeta de archivos del proyecto';
COMMENT ON COLUMN projects.onedrive_folder_id IS 'ID de la carpeta en OneDrive';
COMMENT ON COLUMN projects.imagen_proyecto IS 'URL de la imagen del proyecto';
COMMENT ON COLUMN projects.notas_adicionales IS 'Notas adicionales del proyecto';
COMMENT ON COLUMN projects.ultima_actividad IS 'Timestamp de la última actividad del proyecto';
COMMENT ON COLUMN projects.proxima_tarea IS 'Descripción de la próxima tarea a realizar';