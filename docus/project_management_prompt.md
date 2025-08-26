# 🚀 Prompt para Asistente de Código: Aplicación de Gestión de Proyectos

## 🎯 Objetivo Principal
Desarrolla una **aplicación web completa de gestión de proyectos** optimizada para **un solo usuario**, utilizando **React (frontend)**, **Node.js con Express (backend)** y **Supabase como base de datos**. La aplicación debe ser moderna, responsiva y enfocada en productividad personal.

## 🏗️ Arquitectura Técnica

### **Frontend (React)**
- **React 18+** con hooks y componentes funcionales
- **TypeScript** para tipado estático
- **Tailwind CSS** para diseño responsivo y moderno
- **React Query/TanStack Query** para gestión de estado del servidor
- **React Router** para navegación
- **React Hook Form** para manejo de formularios
- **Framer Motion** para animaciones suaves (opcional)

### **Backend (Node.js + Express)**
- **Node.js 18+** con **Express.js**
- **TypeScript** para consistencia con el frontend
- **Supabase JS Client** para interacción con la base de datos
- **Express-validator** para validación de datos
- **CORS** configurado para desarrollo y producción
- **Helmet** para seguridad básica

### **Base de Datos (Supabase)**
- **PostgreSQL** gestionado por Supabase
- **Row Level Security (RLS)** simplificado para usuario único
- **Supabase Auth** opcional (o autenticación local simple)
- **Real-time subscriptions** para actualizaciones en vivo

## 📊 Estructura de Datos

### **Tabla: projects**
```sql
- id: UUID (primary key)
- name: VARCHAR(255) NOT NULL
- description: TEXT
- color: VARCHAR(7) (hex color)
- status: ENUM('planning', 'active', 'on_hold', 'completed', 'archived')
- start_date: DATE
- end_date: DATE
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Tabla: tasks**
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key)
- title: VARCHAR(255) NOT NULL
- description: TEXT
- status: ENUM('todo', 'in_progress', 'done')
- priority: ENUM('low', 'medium', 'high', 'urgent')
- due_date: TIMESTAMP
- estimated_hours: INTEGER
- actual_hours: INTEGER
- tags: TEXT[] (array de strings)
- position: INTEGER (para ordenamiento)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Tabla: time_logs** (opcional para tracking)
```sql
- id: UUID (primary key)
- task_id: UUID (foreign key)
- description: TEXT
- hours: DECIMAL(5,2)
- date: DATE
- created_at: TIMESTAMP
```

## 🛠️ Funcionalidades Requeridas

### **1. Gestión de Proyectos**
- ✅ CRUD completo de proyectos
- ✅ Vista de tarjetas con estadísticas (total tareas, completadas, pendientes)
- ✅ Filtros por estado y fechas
- ✅ Códigos de color personalizables
- ✅ Archivado de proyectos completados

### **2. Gestión de Tareas**
- ✅ CRUD completo de tareas dentro de proyectos
- ✅ Tablero Kanban con drag & drop (usar `@dnd-kit/core`)
- ✅ Vista de lista con filtros avanzados
- ✅ Prioridades visuales con colores
- ✅ Sistema de etiquetas/tags
- ✅ Fechas límite con alertas visuales
- ✅ Estimación vs tiempo real

### **3. Dashboard Principal**
- ✅ Resumen de métricas clave
- ✅ Tareas vencidas y próximas a vencer
- ✅ Gráficos de progreso (usar `recharts`)
- ✅ Actividad reciente
- ✅ Accesos rápidos a proyectos activos

### **4. Funcionalidades Avanzadas**
- ✅ Búsqueda global (proyectos y tareas)
- ✅ Exportar datos (JSON/CSV)
- ✅ Importar tareas desde CSV
- ✅ Modo oscuro/claro
- ✅ Atajos de teclado
- ✅ Notificaciones en navegador (opcional)

## 🔧 Especificaciones Técnicas

### **API REST Endpoints**
```
GET    /api/projects           # Listar proyectos
POST   /api/projects           # Crear proyecto
GET    /api/projects/:id       # Obtener proyecto
PUT    /api/projects/:id       # Actualizar proyecto
DELETE /api/projects/:id       # Eliminar proyecto

GET    /api/projects/:id/tasks # Listar tareas del proyecto
POST   /api/tasks              # Crear tarea
GET    /api/tasks/:id          # Obtener tarea
PUT    /api/tasks/:id          # Actualizar tarea
DELETE /api/tasks/:id          # Eliminar tarea
PATCH  /api/tasks/:id/position # Actualizar posición (Kanban)

GET    /api/dashboard/stats    # Estadísticas del dashboard
GET    /api/search             # Búsqueda global
```

### **Configuración de Supabase**
- Crear proyecto en Supabase
- Configurar variables de entorno:
  ```env
  SUPABASE_URL=your_supabase_url
  SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_KEY=your_service_key
  ```
- Políticas RLS simplificadas (usuario único)

### **Estructura del Proyecto**
```
project-manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── .env
└── database/              # Scripts SQL de Supabase
    ├── schema.sql
    └── seed.sql
```

## 🎨 Diseño UI/UX

### **Paleta de Colores Sugerida**
- Primario: Azul (#3B82F6)
- Secundario: Gris (#6B7280)
- Éxito: Verde (#10B981)
- Advertencia: Amarillo (#F59E0B)
- Error: Rojo (#EF4444)

### **Componentes Clave**
- Sidebar navegación colapsible
- Cards responsivas para proyectos
- Tablero Kanban fluido
- Modales para CRUD operations
- Tooltips informativos
- Loading states elegantes
- Empty states con ilustraciones

## 🚀 Instrucciones para el Asistente

### **Fase 1: Configuración Base**
1. Crear estructura de carpetas
2. Configurar package.json con dependencias
3. Setup de Supabase y variables de entorno
4. Configuración de TypeScript y Tailwind

### **Fase 2: Backend Development**
1. Configurar Express server con middleware
2. Crear rutas y controladores
3. Implementar servicios de Supabase
4. Validaciones y manejo de errores

### **Fase 3: Frontend Core**
1. Setup de React Router y layout principal
2. Servicios API con React Query
3. Componentes base y sistema de diseño
4. Estado global con Context API (si necesario)

### **Fase 4: Funcionalidades Principales**
1. CRUD de proyectos con UI completa
2. CRUD de tareas con tablero Kanban
3. Dashboard con métricas
4. Sistema de búsqueda y filtros

### **Fase 5: Polish y Optimización**
1. Responsive design refinado
2. Animaciones y microinteracciones
3. Manejo de errores y loading states
4. Testing básico (opcional)

## 📋 Entregables Esperados

- ✅ Código fuente completo y comentado
- ✅ README detallado con instrucciones
- ✅ Scripts SQL para Supabase
- ✅ Archivo .env.example
- ✅ Screenshots de la aplicación
- ✅ Scripts de desarrollo y build
- ✅ Guía de despliegue (Vercel + Supabase)

## 🎯 Criterios de Calidad

- **Código limpio** con TypeScript
- **Responsivo** en todos los dispositivos
- **Performance** optimizada (lazy loading, etc.)
- **Accesibilidad** básica (ARIA labels)
- **UX intuitiva** para usuario único
- **Escalable** para futuras funcionalidades

---

**Nota para el asistente:** Prioriza la **usabilidad** y **simplicidad** sobre la complejidad. Esta es una herramienta de productividad personal, no una aplicación empresarial. Mantén el foco en la experiencia del usuario único.