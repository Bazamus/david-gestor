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
git clone <repository-url>
cd project-manager
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
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

**Frontend:**
```bash
cd client
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### **4. Instalar dependencias**

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### **5. Ejecutar en desarrollo**

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
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
│   └── package.json
└── database/              # Scripts SQL
    ├── schema.sql         # Esquema de la base de datos
    └── seed.sql           # Datos de ejemplo
```

## 🎨 Paleta de Colores

- **Primario:** `#3B82F6` (Azul)
- **Secundario:** `#6B7280` (Gris)
- **Éxito:** `#10B981` (Verde)
- **Advertencia:** `#F59E0B` (Amarillo)
- **Error:** `#EF4444` (Rojo)

## 📊 API Endpoints

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

GET    /api/dashboard/stats    # Estadísticas del dashboard
GET    /api/search             # Búsqueda global
```

## 🚀 Despliegue

### **Frontend (Vercel)**
1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Deploy automático

### **Backend (Railway/Render)**
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### **Base de Datos**
Supabase se encarga automáticamente del hosting de PostgreSQL.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**David Rey**
- GitHub: [@david-rey](https://github.com/david-rey)

---

⭐ ¡No olvides darle una estrella al proyecto si te fue útil!