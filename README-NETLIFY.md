# Deploy en Netlify - David Gestor

## Configuración del Proyecto

Este proyecto está configurado para ser desplegado en Netlify desde el repositorio de GitHub: https://github.com/Bazamus/david-gestor.git

### Archivos de Configuración Creados

1. **`client/netlify.toml`** - Configuración principal de Netlify
2. **`client/public/_redirects`** - Redirecciones para SPA
3. **`client/public/_headers`** - Headers de seguridad y caché
4. **`client/env.production.example`** - Variables de entorno de ejemplo

### Estructura del Proyecto

```
david-gestor/
├── client/                 # Frontend React
│   ├── src/               # Código fuente
│   ├── public/            # Archivos públicos
│   ├── netlify.toml       # Configuración Netlify
│   └── package.json       # Dependencias
└── server/                # Backend (separado)
```

## Pasos para Deploy en Netlify

### 1. Preparación del Repositorio

Asegúrate de que todos los archivos de configuración estén en el repositorio:

```bash
git add .
git commit -m "Configuración para deploy en Netlify"
git push origin main
```

### 2. Configuración en Netlify

#### Paso 1: Conectar con GitHub
1. Ve a [netlify.com](https://netlify.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New site from Git"
4. Selecciona "GitHub"
5. Autoriza Netlify para acceder a tu repositorio
6. Busca y selecciona el repositorio: `Bazamus/david-gestor`

#### Paso 2: Configurar Build Settings
En la sección de configuración del build, usa estos valores:

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### Paso 3: Configurar Variables de Entorno
En la sección "Environment variables", añade:

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

#### Paso 4: Configurar Dominio Personalizado (Opcional)
1. Ve a "Domain settings"
2. Haz clic en "Add custom domain"
3. Sigue las instrucciones para configurar tu dominio

### 3. Deploy Automático

Una vez configurado:
1. Netlify detectará automáticamente los cambios en tu repositorio
2. Cada push a la rama `main` activará un nuevo deploy
3. Puedes ver el progreso en la pestaña "Deploys"

### 4. Verificación del Deploy

Después del deploy:
1. Verifica que la aplicación cargue correctamente
2. Prueba la navegación entre páginas
3. Verifica que las llamadas a la API funcionen
4. Revisa la consola del navegador para errores

## Configuración del Backend

**Importante**: Este proyecto tiene un backend separado que debe estar desplegado independientemente. Asegúrate de:

1. Desplegar el backend en un servicio como Render, Railway, o Heroku
2. Actualizar la variable `VITE_API_URL` en Netlify con la URL de tu backend
3. Configurar CORS en el backend para permitir requests desde tu dominio de Netlify

## Troubleshooting

### Problemas Comunes

1. **Error 404 en rutas**: Verifica que el archivo `_redirects` esté en `client/public/`
2. **Errores de API**: Verifica que `VITE_API_URL` esté configurada correctamente
3. **Build falla**: Revisa los logs de build en Netlify para errores específicos

### Logs y Debugging

- Ve a la pestaña "Deploys" en Netlify para ver logs detallados
- Usa la consola del navegador para debuggear errores del frontend
- Verifica que todas las variables de entorno estén configuradas

## Comandos Útiles

```bash
# Construir localmente para probar
cd client
npm run build

# Verificar que el build funcione
npm run preview

# Verificar configuración de Netlify
netlify status
```

## Soporte

Si encuentras problemas:
1. Revisa los logs de deploy en Netlify
2. Verifica la configuración de variables de entorno
3. Asegúrate de que el backend esté funcionando correctamente
