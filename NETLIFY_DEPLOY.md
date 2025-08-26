# 🚀 Guía de Despliegue en Netlify

## 📋 Configuración Completada

El proyecto ya está configurado para Netlify con:
- ✅ `netlify.toml` - Configuración principal
- ✅ Función serverless en `netlify/functions/api.js`
- ✅ Scripts de build optimizados **[ACTUALIZADO]**
- ✅ Redirecciones configuradas
- ✅ Variables de entorno preparadas

### 🔧 Solución Implementada para Error de Vite
- **Problema resuelto:** Error `vite: not found` durante el build
- **Causa:** Netlify no instalaba automáticamente las dependencias del subdirectorio `client/`
- **Solución:** Script `build:netlify` actualizado para instalar dependencias antes del build

## 🌐 Pasos para Desplegar en Netlify

### Paso 1: Subir Cambios a GitHub

```bash
git add .
git commit -m "🚀 Configurar proyecto para despliegue en Netlify"
git push origin master
```

### Paso 2: Crear Proyecto en Netlify

1. **Ve a [Netlify](https://app.netlify.com/)**
2. **Haz clic en "New site from Git"**
3. **Selecciona "GitHub"**
4. **Busca y selecciona** `Bazamus/gestor-proyectos`
5. **Configura el despliegue:**

#### Configuración Básica:
- **Branch to deploy:** `master`
- **Base directory:** [DEJAR VACÍO]
- **Build command:** `npm run build:netlify`
- **Publish directory:** `client/dist`

### Paso 3: Variables de Entorno

Agrega estas variables en **Site settings > Environment variables**:

#### Variables de Supabase (Obligatorias):
```
SUPABASE_URL=https://tkqihnmpqjmyrjojmeyr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcWlobm1wcWpteXJqb2ptZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDA2NTYsImV4cCI6MjA2OTg3NjY1Nn0.O9vmP0uDHNFU84yHnGZNNWgat6P5-4D1LxG0NdyJmhA
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcWlobm1wcWpteXJqb2ptZXlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMwMDY1NiwiZXhwIjoyMDY5ODc2NjU2fQ.pLixc7c17p0YZ_FmzFgSAS4JLAdRj_ImgYCsXAFLOlM
```

#### Variables del Frontend:
```
VITE_API_URL=https://tu-app.netlify.app/api
VITE_SUPABASE_URL=https://tkqihnmpqjmyrjojmeyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcWlobm1wcWpteXJqb2ptZXlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDA2NTYsImV4cCI6MjA2OTg3NjY1Nn0.O9vmP0uDHNFU84yHnGZNNWgat6P5-4D1LxG0NdyJmhA
```

#### Variables del Backend:
```
JWT_SECRET=94a011011c07362f75fab997167d5277
NODE_ENV=production
```

### Paso 4: Configurar el Dominio

1. **Después del primer despliegue**, obtén la URL de Netlify
2. **Actualiza la variable** `VITE_API_URL` con la URL real
3. **Redeploy** el sitio

### Paso 5: Verificación

#### 1. Health Check:
```bash
curl https://tu-app.netlify.app/api/health
```

#### 2. Frontend:
```bash
curl https://tu-app.netlify.app/
```

#### 3. API Endpoints:
```bash
curl https://tu-app.netlify.app/api/projects
curl https://tu-app.netlify.app/api/tasks
```

## ⚡ Ventajas de Netlify

- ✅ **Deploy más rápido** (1-2 minutos)
- ✅ **Mejor soporte** para full-stack apps
- ✅ **Funciones serverless estables**
- ✅ **Debugging más fácil**
- ✅ **Configuración más simple**
- ✅ **Mejor manejo de redirecciones**

## 🎯 URLs Finales

Una vez desplegado:
- **Frontend:** `https://tu-app.netlify.app`
- **API:** `https://tu-app.netlify.app/api`
- **Health Check:** `https://tu-app.netlify.app/api/health`

## 🔧 Desarrollo Local con Netlify

Para probar localmente:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Ejecutar en modo desarrollo
npm run netlify-dev
```

¡El proyecto debería funcionar perfectamente en Netlify! 🎉
