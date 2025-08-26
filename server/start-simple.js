#!/usr/bin/env node

/**
 * Script de inicio simplificado para el servidor
 * Elimina problemas de rate limit y timeouts
 */

// Configurar variables de entorno para optimización
process.env.NODE_ENV = 'development';
process.env.DISABLE_RATE_LIMIT = 'true';
process.env.SKIP_RATE_LIMIT = 'true';
process.env.RATE_LIMIT_MAX_REQUESTS = '100000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';

console.log('🚀 Iniciando servidor optimizado...');
console.log('📋 Configuración aplicada:');
console.log('   - Rate limiting: DESHABILITADO');
console.log('   - Timeouts: OPTIMIZADOS');
console.log('');

// Usar nodemon para ejecutar el servidor TypeScript
const { spawn } = require('child_process');

const child = spawn('npx', ['nodemon', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Servidor terminado con código: ${code}`);
  process.exit(code);
});
