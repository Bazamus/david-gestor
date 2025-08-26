#!/usr/bin/env node

/**
 * Script final para iniciar el servidor sin problemas
 */

// Configurar variables de entorno
process.env.NODE_ENV = 'development';
process.env.DISABLE_RATE_LIMIT = 'true';
process.env.SKIP_RATE_LIMIT = 'true';

console.log('🚀 Iniciando servidor...');
console.log('📋 Configuración:');
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - DISABLE_RATE_LIMIT:', process.env.DISABLE_RATE_LIMIT);
console.log('');

// Ejecutar nodemon directamente
const { spawn } = require('child_process');

const child = spawn('npx', ['nodemon', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Servidor terminado con código: ${code}`);
  process.exit(code);
});
