cd# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación Gestor de Proyectos en Vercel desde GitHub.

## 📋 Prerrequisitos

1. **Cuenta en GitHub** con el repositorio `Bazamus/gestor-proyectos`
2. **Cuenta en Vercel** (gratuita)
3. **Proyecto en Supabase** configurado
4. **Variables de entorno** preparadas

## 🔧 Paso 1: Preparar el Repositorio

### 1.1 Verificar la estructura del proyecto
```bash
# Asegúrate de estar en la raíz del proyecto
cd gestor_proyectos

# Verificar que todos los archivos estén presentes
ls -la
```

### 1.2 Commitear todos los cambios
```bash
# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Preparar proyecto para despliegue en Vercel"

# Subir a GitHub
git push origin main
```

## 🌐 Paso 2: Configurar Vercel

### 2.1 Conectar con GitHub
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"New Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona `Bazamus/gestor-proyectos`
5. Haz clic en **"Import"**

### 2.2 Configurar el proyecto
- **Project Name**: `gestor-proyectos` (o el que prefieras)
- **Framework Preset**: `Other`
- **Root Directory**: `./project-manager`
- **Build Command**: `npm run build`
- **Output Directory**: `client/dist`
- **Install Command**: `npm run install:all`

### 2.3 Variables de Entorno
Agrega las siguientes variables en la sección **"Environment Variables"**:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# Frontend Configuration
VITE_API_URL=https://tu-app.vercel.app/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Backend Configuration
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app

# Rate Limiting (Production)
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
```

### 2.4 Configuración Avanzada
En la sección **"Build & Development Settings"**:

- **Node.js Version**: `18.x`
- **Override**: `vercel.json`

## 🚀 Paso 3: Desplegar

### 3.1 Despliegue Inicial
1. Haz clic en **"Deploy"**
2. Espera a que se complete el build (puede tomar 2-5 minutos)
3. Verifica que no haya errores en los logs

### 3.2 Verificar el Despliegue
1. Visita la URL proporcionada por Vercel
2. Verifica que el frontend cargue correctamente
3. Prueba la API visitando: `https://tu-app.vercel.app/api/health`

## 🔍 Paso 4: Verificación y Testing

### 4.1 Health Check
```bash
curl https://tu-app.vercel.app/api/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### 4.2 Verificar Frontend
1. Visita la URL principal
2. Verifica que la aplicación React cargue
3. Prueba la navegación entre páginas
4. Verifica que las llamadas a la API funcionen

### 4.3 Verificar Backend
```bash
# Probar endpoint de proyectos
curl https://tu-app.vercel.app/api/projects

# Probar endpoint de autenticación
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 🛠️ Paso 5: Configuración de Dominio (Opcional)

### 5.1 Dominio Personalizado
1. Ve a **"Settings"** > **"Domains"**
2. Agrega tu dominio personalizado
3. Configura los registros DNS según las instrucciones de Vercel

### 5.2 Variables de Entorno Actualizadas
Si usas un dominio personalizado, actualiza:
```env
VITE_API_URL=https://tu-dominio.com/api
FRONTEND_URL=https://tu-dominio.com
```

## 🔄 Paso 6: Despliegues Automáticos

### 6.1 Configuración de Git
Vercel configurará automáticamente:
- **Deploy on Push**: Se despliega automáticamente al hacer push a `main`
- **Preview Deployments**: Se crean para cada Pull Request
- **Branch Deployments**: Se crean para otras ramas

### 6.2 Workflow Recomendado
```bash
# Desarrollo
git checkout -b feature/nueva-funcionalidad
# ... hacer cambios ...
git commit -m "Agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Vercel creará automáticamente un preview deployment

# Merge a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main
# Vercel desplegará automáticamente a producción
```

## 🐛 Solución de Problemas

### Problema 1: Error de Build
```bash
# Verificar logs en Vercel Dashboard
# Común: Variables de entorno faltantes
```

**Solución:**
1. Verificar que todas las variables de entorno estén configuradas
2. Revisar los logs de build en Vercel Dashboard
3. Probar localmente con `npm run build`

### Problema 2: Error de CORS
```bash
# Error: No permitido por la política de CORS
```

**Solución:**
1. Verificar que `FRONTEND_URL` esté configurada correctamente
2. Agregar el dominio de Vercel a `allowedOrigins` en `api/index.ts`

### Problema 3: Error de Supabase
```bash
# Error: Variables de entorno de Supabase faltantes
```

**Solución:**
1. Verificar que `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén configuradas
2. Verificar que las claves sean correctas
3. Probar la conexión a Supabase desde el dashboard

### Problema 4: Error de Rate Limiting
```bash
# Error: Demasiadas peticiones
```

**Solución:**
1. Aumentar `RATE_LIMIT_MAX_REQUESTS` en las variables de entorno
2. Verificar que el rate limiting esté configurado correctamente

## 📊 Monitoreo

### 7.1 Logs de Vercel
- Ve a **"Functions"** en el dashboard de Vercel
- Revisa los logs de las funciones serverless
- Monitorea el uso de recursos

### 7.2 Métricas
- **Function Invocations**: Número de llamadas a la API
- **Function Duration**: Tiempo de respuesta
- **Bandwidth**: Uso de ancho de banda
- **Build Time**: Tiempo de construcción

### 7.3 Alertas
Configura alertas para:
- Errores de función > 5%
- Tiempo de respuesta > 10 segundos
- Uso de ancho de banda > 80%

## 🔒 Seguridad

### 8.1 Variables de Entorno
- ✅ Nunca committear `.env` files
- ✅ Usar variables de entorno de Vercel
- ✅ Rotar claves regularmente

### 8.2 CORS
- ✅ Configurar orígenes permitidos
- ✅ Usar HTTPS en producción
- ✅ Validar headers de autorización

### 8.3 Rate Limiting
- ✅ Habilitar en producción
- ✅ Configurar límites apropiados
- ✅ Monitorear abusos

## 📈 Optimización

### 9.1 Performance
- **CDN**: Vercel proporciona CDN automáticamente
- **Edge Functions**: Considerar para endpoints críticos
- **Caching**: Implementar cache en Supabase

### 9.2 Costos
- **Plan Gratuito**: 100GB bandwidth, 100 function executions/día
- **Plan Pro**: $20/mes para más recursos
- **Monitoreo**: Revisar uso en dashboard de Vercel

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando. 

**URLs importantes:**
- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api`
- **Health Check**: `https://tu-app.vercel.app/api/health`

**Próximos pasos:**
1. Configurar dominio personalizado (opcional)
2. Configurar monitoreo y alertas
3. Implementar CI/CD avanzado
4. Optimizar performance según métricas

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Consulta la [documentación de Vercel](https://vercel.com/docs)
3. Abre un issue en el repositorio de GitHub
4. Contacta al equipo de Vercel si es necesario
