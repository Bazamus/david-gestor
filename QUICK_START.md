# 🚀 Inicio Rápido - Gestor de Proyectos

## 📋 Resumen Ejecutivo

Tu aplicación **Gestor de Proyectos** está lista para desarrollo local. Este documento contiene las instrucciones esenciales para comenzar.

## ⚡ Pasos Rápidos

### 1. Configurar el Entorno
```bash
# Navegar al directorio del proyecto
cd david-gestor

# Instalar todas las dependencias
npm run install:all
```

### 2. Configurar Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script de base de datos:
   ```sql
   -- Ejecutar database/schema.sql en el editor SQL de Supabase
   -- Opcional: Ejecutar database/seed.sql para datos de ejemplo
   ```

### 3. Configurar Variables de Entorno

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

### 4. Ejecutar en Desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`

## 🔧 Variables de Entorno Requeridas

### Backend (.env)
```env
# Configuración del servidor
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Rate Limiting (Development)
DISABLE_RATE_LIMIT=true
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration (if needed for direct client access)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Configuration
VITE_APP_NAME=Gestor de Proyectos
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_TIME_TRACKING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_IMPORT=true
```

## 🏗️ Arquitectura del Proyecto

### Frontend (React + Vite)
- **Build**: `client/dist/`
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Vite
- **Estado**: React Query

### Backend (Node.js + Express)
- **Runtime**: Node.js con TypeScript
- **Entry Point**: `server/src/index.ts`
- **Database**: Supabase (PostgreSQL)
- **API Routes**: `/api/*`

### Base de Datos
- **Provider**: Supabase
- **Type**: PostgreSQL
- **Features**: Row Level Security, Real-time

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend + Backend
npm run dev:client       # Solo frontend
npm run dev:server       # Solo backend

# Build
npm run build           # Build del frontend
npm run build:server    # Build del backend

# Linting
npm run lint            # Lint de todo el proyecto
npm run lint:fix        # Lint y auto-fix

# Utilidades
npm run clean           # Limpiar node_modules y dist
npm run setup           # Instalar dependencias y build
```

## 🚀 Próximos Pasos

Una vez que la aplicación esté funcionando correctamente en local:

1. **Probar todas las funcionalidades**
2. **Verificar la comunicación entre frontend y backend**
3. **Revisar la base de datos en Supabase**
4. **Preparar para despliegue en producción**

## 🆘 Solución de Problemas

### Error de Conexión a la Base de Datos
- Verificar que las variables de entorno de Supabase estén correctas
- Comprobar que el proyecto de Supabase esté activo
- Verificar que el schema de la base de datos esté aplicado

### Error de CORS
- Verificar que `CORS_ORIGIN` en el backend apunte al frontend
- En desarrollo: `http://localhost:3000`

### Error de Build
- Limpiar node_modules: `npm run clean`
- Reinstalar dependencias: `npm run install:all`

### Error de Puerto en Uso
- El servidor automáticamente buscará un puerto disponible
- Verificar que no haya otros procesos usando los puertos 3000 o 5000

## 📞 Soporte

Si encuentras problemas:
1. Revisar los logs del servidor en la consola
2. Verificar las variables de entorno
3. Comprobar la conexión a Supabase
4. Revisar la documentación en `docus/`
