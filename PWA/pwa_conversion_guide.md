# Guía para Convertir una Aplicación React + Vite en PWA

Esta guía proporciona las instrucciones paso a paso para convertir tu aplicación React creada con Vite en una Progressive Web App (PWA) completamente funcional.

## 📋 Requisitos Previos

- Aplicación React funcionando con Vite
- Node.js y npm instalados
- Certificado SSL/HTTPS configurado (requerido para PWA)

---

## 🚀 Configuración Básica de PWA

### 1. Instalar el Plugin de Vite para PWA

```bash
npm install -D vite-plugin-pwa
```

### 2. Configurar vite.config.js

Actualiza tu archivo `vite.config.js` para incluir el plugin PWA:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})
```

### 3. Crear el Manifest.json

El plugin generará automáticamente el manifest, pero puedes personalizarlo:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'Mi Aplicación PWA',
    short_name: 'MiApp',
    description: 'Descripción de mi aplicación PWA',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})
```

### 4. Generar Iconos

Crea iconos en la carpeta `public/` con los siguientes tamaños:
- **192x192px** (requerido)
- **512x512px** (requerido)
- 72x72px, 96x96px, 128x128px, 144x144px, 152x152px, 384x384px (opcionales)

Nombra los archivos como:
- `pwa-192x192.png`
- `pwa-512x512.png`
- etc.

---

## ⚡ Funcionalidades Avanzadas

### 5. Implementar Estrategias de Caché

Configura diferentes estrategias de caché según el tipo de contenido:

```javascript
VitePWA({
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.miapp\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 días
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
})
```

### 6. Añadir Funcionalidad Offline

Crea una página de fallback para contenido offline:

```javascript
// En tu componente principal
import { useState, useEffect } from 'react'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="App">
      {!isOnline && (
        <div className="offline-banner">
          📶 Estás offline. Algunas funciones pueden no estar disponibles.
        </div>
      )}
      {/* Resto de tu aplicación */}
    </div>
  )
}
```

### 7. Implementar Notificaciones Push (Opcional)

Para añadir notificaciones push:

```javascript
// Solicitar permisos
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Enviar notificación local
const showNotification = (title, options) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options)
    })
  }
}
```

### 8. Añadir Prompt de Instalación

Implementa un botón personalizado de instalación:

```javascript
import { useState, useEffect } from 'react'

function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallButton(false)
      }
      setInstallPrompt(null)
    }
  }

  return showInstallButton ? (
    <button onClick={handleInstallClick}>
      📱 Instalar App
    </button>
  ) : null
}
```

---

## 🔧 Optimizaciones

### 9. Configurar Headers de Seguridad

Asegúrate de que tu servidor tenga configurados:

```
# .htaccess o configuración de servidor
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### 10. Testing y Validación

#### Herramientas de Testing:
- **Lighthouse**: Audita tu PWA desde Chrome DevTools
- **PWA Builder**: Herramienta de Microsoft para validar PWAs
- **Chrome DevTools**: Pestaña "Application" para inspeccionar Service Workers y caché

#### Checklist de Validación:
- [ ] La app funciona offline
- [ ] Service Worker está registrado correctamente
- [ ] Manifest.json es válido
- [ ] Iconos están en los tamaños correctos
- [ ] HTTPS está configurado
- [ ] Puntuación de Lighthouse PWA > 90

---

## 🎯 Comandos de Build y Deploy

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Vite PWA](https://vite-pwa-org.netlify.app/)
- [Guía de PWA de Google](https://web.dev/progressive-web-apps/)
- [MDN Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

## 🚨 Notas Importantes

1. **HTTPS es obligatorio** para que funcionen las PWAs
2. **Testa en múltiples dispositivos** y navegadores
3. **Considera el tamaño de caché** para no ocupar demasiado espacio
4. **Actualiza el Service Worker** cuando cambies funcionalidades críticas
5. **Monitorea el rendimiento** después del deploy

---

*Fecha de creación: Agosto 2025*
*Versión: 1.0*