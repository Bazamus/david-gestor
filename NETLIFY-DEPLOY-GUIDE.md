# 🚀 Guía Completa de Deploy en Netlify - David Gestor

## ✅ Configuración Verificada

Tu proyecto está **completamente configurado** para deploy en Netlify. Se han creado todos los archivos necesarios:

### 📁 Archivos de Configuración Creados

1. **`client/netlify.toml`** - Configuración principal de Netlify
2. **`client/public/_redirects`** - Redirecciones para SPA
3. **`client/public/_headers`** - Headers de seguridad y caché
4. **`client/env.production.example`** - Variables de entorno de ejemplo
5. **`client/.nvmrc`** - Versión de Node.js (18)
6. **`client/verify-netlify-setup.js`** - Script de verificación
7. **`README-NETLIFY.md`** - Documentación detallada

## 🎯 Pasos para Deploy en Netlify

### Paso 1: Preparar el Repositorio

```bash
# Asegúrate de estar en el directorio raíz del proyecto
cd /c/Users/David/Desktop/david_gestor/david-gestor

# Agregar todos los archivos nuevos
git add .

# Hacer commit de los cambios
git commit -m "Configuración completa para deploy en Netlify"

# Subir al repositorio de GitHub
git push origin main
```

### Paso 2: Configurar Netlify

#### 2.1 Crear Cuenta en Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Haz clic en "Sign up" y crea una cuenta (puedes usar tu cuenta de GitHub)

#### 2.2 Conectar con GitHub
1. En el dashboard de Netlify, haz clic en **"New site from Git"**
2. Selecciona **"GitHub"** como proveedor
3. Autoriza Netlify para acceder a tu repositorio
4. Busca y selecciona el repositorio: **`Bazamus/david-gestor`**

#### 2.3 Configurar Build Settings
En la sección de configuración, usa estos valores exactos:

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### 2.4 Configurar Variables de Entorno
En la sección **"Environment variables"**, añade estas variables:

```
VITE_API_URL=https://tu-backend-url.com/api
VITE_SUPABASE_URL=tu_supabase_url_produccion
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_produccion
VITE_APP_NAME=Gestor de Proyectos
VITE_APP_VERSION=1.0.0
VITE_ENABLE_TIME_TRACKING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_IMPORT=true
```

**⚠️ IMPORTANTE**: Reemplaza `https://tu-backend-url.com/api` con la URL real de tu backend desplegado.

### Paso 3: Realizar el Deploy

1. Haz clic en **"Deploy site"**
2. Netlify comenzará el proceso de build automáticamente
3. Puedes ver el progreso en tiempo real
4. El deploy tomará aproximadamente 2-5 minutos

### Paso 4: Verificar el Deploy

Una vez completado el deploy:

1. **Verifica la URL**: Netlify te dará una URL como `https://random-name.netlify.app`
2. **Prueba la aplicación**: Abre la URL y verifica que:
   - La página principal cargue correctamente
   - La navegación entre páginas funcione
   - No haya errores en la consola del navegador

## 🔧 Configuración del Backend

**CRÍTICO**: Tu proyecto necesita un backend funcionando. Si aún no lo tienes desplegado:

### Opciones para el Backend:
1. **Render** (Recomendado): [render.com](https://render.com)
2. **Railway**: [railway.app](https://railway.app)
3. **Heroku**: [heroku.com](https://heroku.com)

### Configuración CORS en el Backend:
Asegúrate de que tu backend permita requests desde tu dominio de Netlify:

```javascript
// En tu servidor backend
app.use(cors({
  origin: [
    'https://tu-app.netlify.app',
    'http://localhost:3000' // Para desarrollo local
  ],
  credentials: true
}));
```

## 🚨 Troubleshooting

### Problemas Comunes:

#### 1. Error 404 en rutas
**Solución**: Verifica que el archivo `client/public/_redirects` contenga:
```
/*    /index.html   200
```

#### 2. Errores de API
**Solución**: 
- Verifica que `VITE_API_URL` esté configurada correctamente
- Asegúrate de que el backend esté funcionando
- Revisa la configuración CORS del backend

#### 3. Build falla
**Solución**:
- Revisa los logs de build en Netlify
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el script `npm run build` funcione localmente

#### 4. Variables de entorno no funcionan
**Solución**:
- Verifica que las variables empiecen con `VITE_`
- Reinicia el deploy después de cambiar variables
- Usa el formato correcto: `VITE_NOMBRE_VARIABLE=valor`

## 📊 Monitoreo y Logs

### Ver Logs de Deploy:
1. Ve a tu sitio en Netlify
2. Haz clic en la pestaña **"Deploys"**
3. Selecciona cualquier deploy para ver logs detallados

### Ver Logs en Tiempo Real:
1. En la pestaña **"Deploys"**
2. Haz clic en **"Trigger deploy"** → **"Deploy site"**
3. Verás los logs en tiempo real

## 🔄 Deploy Automático

Una vez configurado:
- Cada push a la rama `main` activará un nuevo deploy automáticamente
- Puedes configurar ramas específicas en **"Site settings"** → **"Build & deploy"**
- Los deploys de preview se crean automáticamente para pull requests

## 🌐 Dominio Personalizado

Para usar tu propio dominio:

1. Ve a **"Domain settings"**
2. Haz clic en **"Add custom domain"**
3. Sigue las instrucciones para configurar DNS
4. Netlify te guiará paso a paso

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en la pestaña "Deploys"
2. **Verifica la configuración** con el script: `node verify-netlify-setup.js`
3. **Consulta la documentación** en `README-NETLIFY.md`
4. **Revisa la consola del navegador** para errores del frontend

## ✅ Checklist Final

- [ ] Repositorio sincronizado con GitHub
- [ ] Archivos de configuración creados
- [ ] Backend desplegado y funcionando
- [ ] Variables de entorno configuradas en Netlify
- [ ] Deploy exitoso
- [ ] Aplicación funcionando correctamente
- [ ] Navegación entre páginas funcionando
- [ ] Llamadas a API funcionando

¡Tu aplicación estará lista para producción! 🎉
