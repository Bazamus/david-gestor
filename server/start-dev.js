#!/usr/bin/env node

// Script para iniciar el servidor en modo desarrollo
// con configuraciones optimizadas para evitar desconexiones

const { spawn } = require('child_process');
const path = require('path');

// Configurar variables de entorno para desarrollo
process.env.NODE_ENV = 'development';
process.env.DISABLE_RATE_LIMIT = 'true';
process.env.PORT = '5000';

// Configuraciones adicionales para evitar desconexiones
process.env.RATE_LIMIT_MAX_REQUESTS = '50000';
process.env.RATE_LIMIT_WINDOW_MS = '900000';

console.log('🚀 Iniciando servidor en modo desarrollo...');
console.log('📊 Rate limiting deshabilitado para desarrollo');
console.log('🔧 Variables de entorno configuradas:');
console.log('   - NODE_ENV: development');
console.log('   - DISABLE_RATE_LIMIT: true');
console.log('   - PORT: 5000');
console.log('   - RATE_LIMIT_MAX_REQUESTS: 50000');
console.log('   - RATE_LIMIT_WINDOW_MS: 900000');
console.log('');

// Configurar opciones de nodemon para evitar reinicios innecesarios
const nodemonOptions = [
  '--watch', 'src',
  '--ext', 'ts,js,json',
  '--ignore', 'src/**/*.test.ts',
  '--ignore', 'src/**/*.spec.ts',
  '--delay', '1000', // Delay de 1 segundo para evitar reinicios rápidos
  '--legacy-watch', // Usar legacy watch en Windows
  '--no-colours', // Evitar problemas de colores en algunos terminales
];

// Iniciar el servidor con nodemon
const server = spawn('npx', ['nodemon', ...nodemonOptions, 'src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
  env: {
    ...process.env,
    // Configuraciones adicionales para Node.js
    NODE_OPTIONS: '--max-old-space-size=4096 --no-warnings',
  }
});

// Manejar señales de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.kill('SIGTERM');
  process.exit(0);
});

// Manejar errores
server.on('error', (error) => {
  console.error('❌ Error iniciando servidor:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n✅ Servidor cerrado con código: ${code}`);
  process.exit(code);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  server.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  console.error('Promesa:', promise);
  server.kill('SIGTERM');
  process.exit(1);
});
