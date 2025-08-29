-- ======================================
-- SCHEMA PRINCIPAL - GESTOR DE PROYECTOS
-- ======================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- TABLA: users (autenticación)
-- ======================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL CHECK (length(username) > 0),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('admin', 'cliente')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT valid_username_length CHECK (length(trim(username)) BETWEEN 1 AND 50)
);

-- ======================================
-- TABLA: projects
-- ======================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL CHECK (length(name) > 0),
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_name_length CHECK (length(trim(name)) BETWEEN 1 AND 255)
);

-- ======================================
-- TABLA: tasks
-- ======================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL CHECK (length(title) > 0),
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER CHECK (estimated_hours >= 0),
    actual_hours INTEGER CHECK (actual_hours >= 0),
    tags TEXT[] DEFAULT '{}',
    position INTEGER DEFAULT 0 CHECK (position >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT valid_title_length CHECK (length(trim(title)) BETWEEN 1 AND 255),
    CONSTRAINT valid_hours CHECK (estimated_hours IS NULL OR estimated_hours >= 0),
    CONSTRAINT valid_actual_hours CHECK (actual_hours IS NULL OR actual_hours >= 0)
);

-- ======================================
-- TABLA: time_logs (tracking opcional)
-- ======================================
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    description TEXT,
    hours DECIMAL(5,2) NOT NULL CHECK (hours > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones
    CONSTRAINT valid_hours_logged CHECK (hours > 0 AND hours <= 24),
    CONSTRAINT valid_log_date CHECK (date <= CURRENT_DATE)
);

-- ======================================
-- ÍNDICES PARA PERFORMANCE
-- ======================================

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Proyectos
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(start_date, end_date);

-- Tareas
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(project_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Time logs
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(date DESC);

-- ======================================
-- TRIGGERS PARA UPDATED_AT
-- ======================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================
-- POLÍTICAS RLS (Row Level Security)
-- Simplificadas para usuario único
-- ======================================

-- Habilitar RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para usuario único (todas las operaciones permitidas)
CREATE POLICY "Permitir todas las operaciones en projects" ON projects
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en tasks" ON tasks
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir todas las operaciones en time_logs" ON time_logs
    FOR ALL USING (true) WITH CHECK (true);

-- ======================================
-- FUNCIONES ÚTILES
-- ======================================

-- Función para obtener estadísticas de proyecto
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE (
    total_tasks INTEGER,
    completed_tasks INTEGER,
    pending_tasks INTEGER,
    total_estimated_hours INTEGER,
    total_actual_hours INTEGER,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END)::INTEGER as completed_tasks,
        COUNT(CASE WHEN status != 'done' THEN 1 END)::INTEGER as pending_tasks,
        COALESCE(SUM(estimated_hours), 0)::INTEGER as total_estimated_hours,
        COALESCE(SUM(actual_hours), 0)::INTEGER as total_actual_hours,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END as completion_percentage
    FROM tasks 
    WHERE project_id = project_uuid;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tareas próximas a vencer
CREATE OR REPLACE FUNCTION get_upcoming_tasks(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
    task_id UUID,
    title VARCHAR(255),
    project_name VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(10),
    days_until_due INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as task_id,
        t.title,
        p.name as project_name,
        t.due_date,
        t.priority,
        EXTRACT(days FROM (t.due_date - CURRENT_TIMESTAMP))::INTEGER as days_until_due
    FROM tasks t
    INNER JOIN projects p ON t.project_id = p.id
    WHERE t.status != 'done'
      AND t.due_date IS NOT NULL
      AND t.due_date <= CURRENT_TIMESTAMP + INTERVAL '%s days'
    ORDER BY t.due_date ASC, t.priority DESC;
END;
$$ LANGUAGE plpgsql;