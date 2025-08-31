-- ======================================
-- MIGRACIÓN: Añadir campo URL Documentos
-- ======================================
-- Fecha: 2024-12-19
-- Descripción: Añadir campo url_documentos a la tabla projects
-- ======================================

-- Añadir el nuevo campo url_documentos a la tabla projects
ALTER TABLE projects 
ADD COLUMN url_documentos VARCHAR(500);

-- Añadir comentario al campo para documentación
COMMENT ON COLUMN projects.url_documentos IS 'URL de la documentación del proyecto';

-- Verificar que el campo se añadió correctamente
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'url_documentos';
