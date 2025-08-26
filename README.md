# 🚀 Gestor de Proyectos Personal

<!-- Deploy timestamp: 2025-01-11 19:21 -->

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
- ✅ **Reportes avanzados** con filtros y gráficos
- ✅ **Timeline visual** de proyectos y tareas

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
git clone https://github.com/Bazamus/gestor-proyectos.git
cd gestor-proyectos
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
cd project-manager/server
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

**Frontend:**
```bash
cd project-manager/client
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### **4. Instalar dependencias**

**Backend:**
```bash
cd project-manager/server
npm install
```

**Frontend:**
```bash
cd project-manager/client
npm install
```

### **5. Ejecutar en desarrollo**

**Terminal 1 - Backend:**
```bash
cd project-manager/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd project-manager/client
npm run dev
```

La aplicación estará disponible en:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 📦 Comandos Disponibles

### **Backend**
```bash
npm run dev        # Ejecutar en desarrollo
npm run build      # Compilar TypeScript
npm run start      # Ejecutar en producción
npm run lint       # Linting con ESLint
npm run lint:fix   # Arreglar problemas de linting
```

### **Frontend**
```bash
npm run dev        # Ejecutar en desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linting con ESLint
npm run lint:fix   # Arreglar problemas de linting
```

## 🚀 Despliegue en Vercel

### **1. Preparar el repositorio**
```bash
# Asegúrate de que todos los cambios estén commitados
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### **2. Conectar con Vercel**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "New Project"
3. Importa el repositorio `Bazamus/gestor-proyectos`
4. Configura las variables de entorno:

### **3. Variables de Entorno en Vercel**

```env
# Supabase
SUPABASE_URL=tu_url_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key

# Frontend
VITE_API_URL=https://tu-app.vercel.app/api

# Backend
JWT_SECRET=tu_jwt_secret
NODE_ENV=production
```

### **4. Configuración de Build**

Vercel detectará automáticamente la configuración desde `vercel.json`:
- **Frontend**: Se construirá desde `client/`
- **Backend**: Se ejecutará desde `server/src/index.ts`
- **Rutas**: Las rutas `/api/*` irán al backend, el resto al frontend

### **5. Desplegar**

Vercel desplegará automáticamente cuando hagas push a la rama `main`.

## 🗂️ Estructura del Proyecto

```
project-manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # APIs y servicios
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Rutas de la API
│   │   ├── controllers/    # Lógica de controladores
│   │   ├── middleware/     # Middleware personalizado
│   │   ├── services/       # Servicios de negocio
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── .env
├── database/              # Scripts SQL de Supabase
│   ├── schema.sql
│   └── seed.sql
├── docus/                 # Documentación
├── vercel.json           # Configuración de Vercel
└── README.md
```

## 🔧 Configuración de Desarrollo

### **Variables de Entorno de Desarrollo**

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
SUPABASE_URL=tu_url_supabase
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_KEY=tu_service_key
JWT_SECRET=tu_jwt_secret
DISABLE_RATE_LIMIT=true
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18** con TypeScript
- **React Router DOM** para navegación
- **React Query** para gestión de estado
- **React Hook Form** para formularios
- **@dnd-kit** para drag & drop
- **Lucide React** para iconos
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Recharts** para gráficos

### **Backend**
- **Node.js** con Express
- **TypeScript** para tipado estático
- **Supabase** como base de datos
- **Express Validator** para validaciones
- **Helmet** para seguridad
- **CORS** para comunicación cross-origin

### **Base de Datos**
- **PostgreSQL** gestionado por Supabase
- **Row Level Security (RLS)**
- **Real-time subscriptions**

## 📊 Funcionalidades Principales

### **Gestión de Proyectos**
- Crear, editar y eliminar proyectos
- Estados: planning, active, on_hold, completed, archived
- Fechas de inicio y fin
- Colores personalizados
- Estadísticas de progreso

### **Gestión de Tareas**
- Crear, editar y eliminar tareas
- Estados: todo, in_progress, done
- Prioridades: low, medium, high, urgent
- Fechas de vencimiento
- Dependencias entre tareas
- Adjuntar archivos

### **Tablero Kanban**
- Drag & drop para mover tareas
- Columnas por estado
- Filtros por proyecto
- Búsqueda en tiempo real

### **Dashboard**
- Estadísticas generales
- Gráficos de progreso
- Tareas pendientes
- Proyectos activos
- Métricas de productividad

### **Reportes**
- Filtros avanzados
- Exportación a PDF
- Gráficos interactivos
- Análisis de tiempo

### **Timeline**
- Vista cronológica de proyectos
- Línea de tiempo de tareas
- KPIs visuales
- Filtros por fecha

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**David Rey** - [Bazamus](https://github.com/Bazamus)

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por la excelente plataforma de base de datos
- [Vercel](https://vercel.com) por el hosting y despliegue
- [Tailwind CSS](https://tailwindcss.com) por el framework de CSS
- [React](https://reactjs.org) por el framework de JavaScript
