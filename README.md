# 🚀 Gestor de Proyectos Personal

Aplicación web completa para gestión de proyectos personales desarrollada con **React**, **Node.js**, **TypeScript** y **Supabase**.

## 📋 Características

- ✅ **Gestión completa de proyectos** con estados y seguimiento
- ✅ **Tablero Kanban** con drag & drop para tareas
- ✅ **Dashboard** con métricas y gráficos interactivos
- ✅ **Sistema de etiquetas** y prioridades para tareas
- ✅ **Time tracking** opcional para productividad
- ✅ **Búsqueda global** en proyectos y tareas
- ✅ **Modo oscuro/claro** para mejor experiencia
- ✅ **Diseño responsivo** optimizado para móviles
- ✅ **Exportación de datos** en JSON/CSV
- ✅ **Sistema de reportes** con gráficos y estadísticas

## 🏗️ Arquitectura

### **Frontend**
- **React 18+** con TypeScript
- **Tailwind CSS** para diseño
- **React Query** para gestión de estado
- **React Router** para navegación
- **Framer Motion** para animaciones
- **Vite** como bundler

### **Backend**
- **Node.js + Express** con TypeScript
- **Supabase** como base de datos PostgreSQL
- **Express Validator** para validaciones
- **CORS & Helmet** para seguridad

### **Base de Datos**
- **PostgreSQL** gestionado por Supabase
- **Row Level Security** simplificado
- **Índices** optimizados para performance

## 🚀 Instalación y Desarrollo

### **Prerrequisitos**
- Node.js 18+
- Cuenta en Supabase
- Git

### **1. Clonar el repositorio**
```bash
git clone https://github.com/Bazamus/david-gestor.git
cd david-gestor
```

### **2. Configurar Supabase**

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script de base de datos:
   ```sql
   -- Ejecutar database/schema.sql en el editor SQL de Supabase
   -- Opcional: Ejecutar database/seed.sql para datos de ejemplo
   ```

### **3. Configurar variables de entorno**

**Backend:**
```bash
cd server
cp env.example .env
# Editar .env con tus credenciales de Supabase
```

**Frontend:**
```bash
cd client
cp env.example .env
# Editar .env con tus credenciales de Supabase
```

### **4. Instalar dependencias**
```bash
# Instalar todas las dependencias
npm run install:all
```

### **5. Ejecutar en desarrollo**
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

El frontend estará disponible en `http://localhost:3000` y el backend en `http://localhost:5000`.

## 🚀 Deploy en Render

### **Configuración Automática**

El proyecto está configurado para deploy automático en Render. Solo necesitas:

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Conecta tu cuenta de GitHub

2. **Importar el repositorio**
   - Selecciona `Bazamus/david-gestor`
   - Render detectará automáticamente la configuración

3. **Configurar variables de entorno**
   - **Backend:**
     ```env
     NODE_ENV=production
     SUPABASE_URL=tu_url_supabase
     SUPABASE_ANON_KEY=tu_anon_key
     SUPABASE_SERVICE_KEY=tu_service_key
     JWT_SECRET=tu_jwt_secret
     FRONTEND_URL=https://tu-app.onrender.com
     ```
   - **Frontend:**
     ```env
     VITE_API_URL=https://tu-api.onrender.com/api
     VITE_SUPABASE_URL=tu_url_supabase
     VITE_SUPABASE_ANON_KEY=tu_anon_key
     ```

4. **Deploy automático**
   - Cada push a `main` hará deploy automático

### **URLs del Deploy**
- **Frontend:** `https://david-gestor.onrender.com`
- **Backend:** `https://david-gestor-api.onrender.com`

## 📁 Estructura del Proyecto

```
david-gestor/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Servicios de API
│   │   ├── types/         # Tipos TypeScript
│   │   ├── utils/         # Utilidades
│   │   └── contexts/      # Contextos de React
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── controllers/   # Controladores
│   │   ├── middleware/    # Middleware personalizado
│   │   ├── services/      # Servicios de negocio
│   │   └── types/         # Tipos TypeScript
│   ├── package.json
│   └── .env
├── database/              # Scripts SQL de Supabase
│   ├── schema.sql
│   └── seed.sql
├── render.yaml            # Configuración de Render
└── docus/                 # Documentación
    ├── README.md
    └── project_management_prompt.md
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend + Backend
npm run dev:client       # Solo frontend
npm run dev:server       # Solo backend

# Build
npm run build           # Build del frontend
npm run build:server    # Build del backend
npm run build:render    # Build completo para Render

# Linting
npm run lint            # Lint de todo el proyecto
npm run lint:fix        # Lint y auto-fix

# Utilidades
npm run clean           # Limpiar node_modules y dist
npm run setup           # Instalar dependencias y build
```

## 🌐 API Endpoints

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### **Proyectos**
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### **Tareas**
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `PATCH /api/tasks/:id/position` - Actualizar posición (Kanban)

### **Dashboard**
- `GET /api/dashboard/stats` - Estadísticas del dashboard

### **Búsqueda**
- `GET /api/search` - Búsqueda global

### **Time Tracking**
- `GET /api/time-entries` - Listar entradas de tiempo
- `POST /api/time-entries` - Crear entrada de tiempo
- `PUT /api/time-entries/:id` - Actualizar entrada de tiempo
- `DELETE /api/time-entries/:id` - Eliminar entrada de tiempo

### **Reportes**
- `GET /api/reportes` - Generar reportes

## 🎨 Características de UI/UX

- **Diseño responsivo** optimizado para móviles y desktop
- **Modo oscuro/claro** con persistencia
- **Animaciones suaves** con Framer Motion
- **Componentes reutilizables** con Tailwind CSS
- **Feedback visual** con notificaciones toast
- **Loading states** elegantes
- **Empty states** informativos

## 🔒 Seguridad

- **Autenticación JWT** con tokens seguros
- **Validación de datos** con Express Validator
- **CORS configurado** para desarrollo y producción
- **Helmet** para headers de seguridad
- **Rate limiting** para prevenir abuso
- **Sanitización de inputs** automática

## 📊 Base de Datos

### **Tablas Principales**
- `projects` - Proyectos
- `tasks` - Tareas
- `time_entries` - Entradas de tiempo
- `users` - Usuarios (simplificado)

### **Características**
- **Row Level Security** para aislamiento de datos
- **Índices optimizados** para consultas rápidas
- **Relaciones bien definidas** entre tablas
- **Triggers** para estadísticas automáticas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**David Rey** - [Bazamus](https://github.com/Bazamus)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por la infraestructura de base de datos
- [Tailwind CSS](https://tailwindcss.com) por el framework de CSS
- [React Query](https://tanstack.com/query) por la gestión de estado
- [Vite](https://vitejs.dev) por el bundler rápido
