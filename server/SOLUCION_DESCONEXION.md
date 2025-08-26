# Solución para Desconexiones Automáticas del Servidor

## Problema
El servidor se desconecta automáticamente mientras la aplicación está en uso.

## Causas Comunes

### 1. Rate Limiting Agresivo
- **Síntoma**: El servidor rechaza requests con error 429
- **Solución**: Rate limiting deshabilitado en desarrollo

### 2. Timeouts de Conexión
- **Síntoma**: Conexiones que se cierran después de un tiempo
- **Solución**: Timeouts aumentados a 2 minutos

### 3. Memoria Insuficiente
- **Síntoma**: El servidor se cierra sin error aparente
- **Solución**: Límite de memoria aumentado a 4GB

### 4. Reinicios Automáticos de Nodemon
- **Síntoma**: El servidor se reinicia frecuentemente
- **Solución**: Configuración optimizada de nodemon

## Soluciones Implementadas

### 1. Configuración del Servidor (`src/index.ts`)
```typescript
// Timeouts optimizados
server.keepAliveTimeout = 65000; // 65 segundos
server.headersTimeout = 66000;   // 66 segundos
server.timeout = 120000;         // 2 minutos
server.maxConnections = 1000;    // Más conexiones simultáneas

// Keep-alive para conexiones
socket.setKeepAlive(true, 60000); // 1 minuto
```

### 2. Rate Limiting Optimizado (`src/middleware/rateLimiter.ts`)
```typescript
// Límites muy permisivos en desarrollo
const effectiveMaxRequests = isDevelopment ? 50000 : RATE_LIMIT_CONFIG.maxRequests;
```

### 3. Script de Inicio Mejorado (`start-dev.js`)
```javascript
// Configuraciones adicionales
process.env.RATE_LIMIT_MAX_REQUESTS = '50000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
```

### 4. Configuración de Nodemon (`nodemon.json`)
```json
{
  "delay": "1000",
  "legacyWatch": true,
  "ignore": ["src/**/*.test.ts", "dist/**/*"]
}
```

## Comandos para Iniciar el Servidor

### Opción 1: Servidor Básico
```bash
npm run start-dev
```

### Opción 2: Con Monitoreo
```bash
npm run dev:monitor
```

### Opción 3: Solo Monitoreo
```bash
npm run monitor
```

## Variables de Entorno Recomendadas

Crear o actualizar el archivo `.env`:
```env
NODE_ENV=development
DISABLE_RATE_LIMIT=true
RATE_LIMIT_MAX_REQUESTS=50000
RATE_LIMIT_WINDOW_MS=900000
PORT=5000
```

## Diagnóstico de Problemas

### 1. Verificar Logs del Servidor
```bash
# Buscar errores de rate limit
grep "Rate limit excedido" logs/server.log

# Buscar timeouts
grep "timeout" logs/server.log
```

### 2. Monitorear Conexiones
```bash
# Usar el script de monitoreo
npm run monitor
```

### 3. Verificar Uso de Memoria
```bash
# En Windows
tasklist /FI "IMAGENAME eq node.exe"

# En Linux/Mac
ps aux | grep node
```

## Soluciones Adicionales

### 1. Si el Problema Persiste
- Aumentar `RATE_LIMIT_MAX_REQUESTS` a 100000
- Aumentar `server.timeout` a 300000 (5 minutos)
- Verificar que no haya otros procesos usando el puerto 5000

### 2. Para Entornos de Producción
- Usar PM2 para gestión de procesos
- Configurar logs rotativos
- Implementar health checks automáticos

### 3. Configuración de Firewall/Antivirus
- Verificar que el antivirus no esté bloqueando Node.js
- Añadir excepciones para el puerto 5000
- Deshabilitar temporalmente el firewall para pruebas

## Comandos de Emergencia

### Reiniciar Servidor Forzadamente
```bash
# En Windows
taskkill /F /IM node.exe
npm run start-dev

# En Linux/Mac
pkill -f node
npm run start-dev
```

### Limpiar Cache de NPM
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Verificar Puerto Disponible
```bash
# En Windows
netstat -ano | findstr :5000

# En Linux/Mac
lsof -i :5000
```

## Contacto
Si el problema persiste después de aplicar estas soluciones, revisar:
1. Logs del servidor para errores específicos
2. Configuración del sistema operativo
3. Antivirus y firewall
4. Versión de Node.js (recomendado: 18.x o superior)
