# Solución al Problema de Rate Limit - Gestor de Proyectos

## Problema Identificado

El servidor estaba experimentando desconexiones automáticas debido a que se excedía el límite de rate limiting:
- **Límite original**: 100 requests por 15 minutos
- **Problema**: El cliente hacía refetch automático cada 3-5 minutos
- **Resultado**: Se excedía rápidamente el límite causando errores 429

## Soluciones Implementadas

### 1. **Ajuste del Rate Limiter (Servidor)**

**Archivo**: `server/src/middleware/rateLimiter.ts`

- ✅ Aumentado el límite por defecto de 100 a 1000 requests
- ✅ Agregada opción `DISABLE_RATE_LIMIT=true` para desarrollo
- ✅ Mejorado el manejo de variables de entorno

```typescript
// Configuración actualizada
const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Aumentado
  // ...
};

// Nuevas opciones de bypass
if (process.env.DISABLE_RATE_LIMIT === 'true') {
  return next();
}
```

### 2. **Optimización de React Query (Cliente)**

**Archivo**: `client/src/main.tsx`

- ✅ Aumentado `staleTime` de 5 a 10 minutos
- ✅ Aumentado `gcTime` de 10 a 15 minutos
- ✅ Deshabilitado `refetchOnMount` automático
- ✅ Agregado `refetchOnReconnect: true`

### 3. **Reducción de Frecuencia de Refetch**

**Archivo**: `client/src/hooks/useDashboard.ts`

- ✅ `useDashboardStats`: Refetch cada 15 minutos (antes 5)
- ✅ `useQuickSummary`: Refetch cada 10 minutos (antes 3)
- ✅ Aumentados los `staleTime` correspondientes

### 4. **Manejo de Errores de Rate Limit**

**Archivo**: `client/src/services/api.ts`

- ✅ Agregado manejo específico para errores 429
- ✅ Incluye información de `Retry-After` en el mensaje
- ✅ Mejor experiencia de usuario con mensajes claros

### 5. **Scripts de Desarrollo**

**Archivo**: `server/start-dev.js`

- ✅ Script para iniciar servidor con rate limiting deshabilitado
- ✅ Configuración automática de variables de entorno
- ✅ Manejo de señales de cierre

**Archivo**: `server/package.json`

- ✅ Nuevo script: `npm run dev:no-limit`
- ✅ Nuevo script: `npm run start-dev`

## Cómo Usar las Soluciones

### Opción 1: Deshabilitar Rate Limiting (Recomendado para desarrollo)

```bash
# En el directorio del servidor
cd project-manager/server

# Usar el script optimizado
npm run start-dev

# O usar el script directo
npm run dev:no-limit
```

### Opción 2: Ajustar Límites (Para producción)

```bash
# Configurar variables de entorno
export RATE_LIMIT_MAX_REQUESTS=2000
export RATE_LIMIT_WINDOW_MS=900000

# Iniciar servidor
npm run dev
```

### Opción 3: Variables de Entorno en Archivo .env

```env
# Para desarrollo
NODE_ENV=development
DISABLE_RATE_LIMIT=true

# Para producción
RATE_LIMIT_MAX_REQUESTS=2000
RATE_LIMIT_WINDOW_MS=900000
```

## Beneficios de las Soluciones

1. **✅ Eliminación de desconexiones automáticas**
2. **✅ Mejor experiencia de desarrollo**
3. **✅ Configuración flexible para diferentes entornos**
4. **✅ Manejo robusto de errores**
5. **✅ Optimización del rendimiento del cliente**

## Monitoreo

Para verificar que el problema está resuelto:

1. **Revisar logs del servidor**: No deberían aparecer errores de rate limit
2. **Verificar conectividad**: El cliente debería mantener conexión estable
3. **Comprobar rendimiento**: Las peticiones deberían ser más eficientes

## Próximos Pasos

- [ ] Implementar Redis para rate limiting en producción
- [ ] Agregar métricas de uso de API
- [ ] Configurar alertas para rate limiting
- [ ] Optimizar queries de base de datos

---

**Estado**: ✅ **RESUELTO**
**Fecha**: $(date)
**Versión**: 1.0.0
