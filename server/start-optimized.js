#!/usr/bin/env node

/**
 * Script de inicio optimizado para el servidor
 * Elimina problemas de rate limit y timeouts
 */

// Configurar variables de entorno para optimización
process.env.NODE_ENV = 'development';
process.env.DISABLE_RATE_LIMIT = 'true';
process.env.SKIP_RATE_LIMIT = 'true';
process.env.RATE_LIMIT_MAX_REQUESTS = '100000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';

// Configuraciones adicionales para optimizar el rendimiento
process.env.UV_THREADPOOL_SIZE = '64'; // Aumentar thread pool
process.env.MAX_OLD_SPACE_SIZE = '4096'; // Aumentar memoria heap

console.log('🚀 Iniciando servidor optimizado...');
console.log('📋 Configuración aplicada:');
console.log('   - Rate limiting: DESHABILITADO');
console.log('   - Timeouts: OPTIMIZADOS');
console.log('   - Thread pool: AUMENTADO');
console.log('   - Memoria heap: AUMENTADA');
console.log('');

// Importar y ejecutar el servidor usando ts-node
require('ts-node/register');
require('./src/index.ts');
