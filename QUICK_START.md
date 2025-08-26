# 🚀 Inicio Rápido - Despliegue en Vercel

## 📋 Resumen Ejecutivo

Tu aplicación **Gestor de Proyectos** está lista para ser desplegada en Vercel. Este documento contiene las instrucciones esenciales para el despliegue.

## ⚡ Pasos Rápidos

### 1. Preparar el Repositorio
```bash
# Navegar al directorio del proyecto
cd project-manager

# Ejecutar script de preparación (Windows)
.\prepare-deployment.ps1

# O manualmente:
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### 2. Configurar Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"New Project"**
3. Importa el repositorio `Bazamus/gestor-proyectos`
4. Configura las variables de entorno (ver abajo)
5. Haz clic en **"Deploy"**

### 3. Variables de Entorno Requeridas
```env
# Supabase (Obligatorio)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# Frontend (Obligatorio)
VITE_API_URL=https://tu-app.vercel.app/api

# Backend (Obligatorio)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app
```

## 🏗️ Arquitectura del Despliegue

### Frontend (React + Vite)
- **Build**: `client/dist/`
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Bundler**: Vite

### Backend (Node.js + Express)
- **Runtime**: Vercel Serverless Functions
- **Entry Point**: `api/index.ts`
- **Database**: Supabase (PostgreSQL)
- **API Routes**: `/api/*`

### Base de Datos
- **Provider**: Supabase
- **Type**: PostgreSQL
- **Features**: Row Level Security, Real-time

## 🔧 Configuración Técnica

### Archivos de Configuración
- `vercel.json` - Configuración de Vercel
- `api/index.ts` - Servidor Express para serverless
- `client/vite.config.ts` - Configuración de Vite
- `server/package.json` - Dependencias del backend

### Scripts Disponibles
```bash
# Desarrollo
npm run dev              # Frontend + Backend
npm run dev:client       # Solo frontend
npm run dev:server       # Solo backend

# Build
npm run build           # Build completo
npm run build:client    # Build frontend
npm run build:server    # Build backend

# Linting
npm run lint            # Lint completo
npm run lint:fix        # Fix automático
```

## 🌐 URLs del Despliegue

Una vez desplegado, tendrás acceso a:

- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api`
- **Health Check**: `https://tu-app.vercel.app/api/health`
- **Documentación API**: `https://tu-app.vercel.app/api`

## 🔍 Verificación del Despliegue

### 1. Health Check
```bash
curl https://tu-app.vercel.app/api/health
```

### 2. Frontend
- Visita la URL principal
- Verifica que la aplicación React cargue
- Prueba la navegación

### 3. Backend
```bash
# Probar API de proyectos
curl https://tu-app.vercel.app/api/projects

# Probar autenticación
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🐛 Solución de Problemas Comunes

### Error de Build
- Verificar variables de entorno
- Revisar logs en Vercel Dashboard
- Probar build local: `npm run build`

### Error de CORS
- Verificar `FRONTEND_URL` en variables de entorno
- Agregar dominio a `allowedOrigins` en `api/index.ts`

### Error de Supabase
- Verificar `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Probar conexión desde Supabase Dashboard

### Error de Rate Limiting
- Aumentar `RATE_LIMIT_MAX_REQUESTS`
- Verificar configuración en `api/index.ts`

## 📊 Monitoreo

### Métricas Importantes
- **Function Invocations**: Llamadas a la API
- **Function Duration**: Tiempo de respuesta
- **Bandwidth**: Uso de ancho de banda
- **Build Time**: Tiempo de construcción

### Logs
- Ve a **"Functions"** en Vercel Dashboard
- Revisa logs de funciones serverless
- Monitorea errores y performance

## 🔄 Despliegues Automáticos

Vercel configurará automáticamente:
- **Deploy on Push**: Despliegue automático al push a `main`
- **Preview Deployments**: Para cada Pull Request
- **Branch Deployments**: Para otras ramas

## 💰 Costos

### Plan Gratuito
- 100GB bandwidth/mes
- 100 serverless function executions/día
- 100GB-hours de compute time
- Dominios personalizados ilimitados

### Plan Pro ($20/mes)
- 1TB bandwidth/mes
- 1000 serverless function executions/día
- 1000GB-hours de compute time
- Analytics avanzadas

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado** (opcional)
2. **Implementar monitoreo y alertas**
3. **Configurar CI/CD avanzado**
4. **Optimizar performance**
5. **Implementar backup automático**

## 📚 Documentación Completa

Para instrucciones detalladas, consulta:
- `DEPLOYMENT.md` - Guía completa de despliegue
- `README.md` - Documentación del proyecto
- `docus/` - Documentación técnica

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Consulta la [documentación de Vercel](https://vercel.com/docs)
3. Abre un issue en el repositorio de GitHub
4. Contacta al equipo de Vercel

---

**¡Tu aplicación está lista para producción! 🚀**
