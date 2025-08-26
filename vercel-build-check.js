#!/usr/bin/env node

/**
 * Script de verificación para el build de Vercel
 * Este script verifica que todos los archivos necesarios estén presentes
 * y que la configuración sea correcta antes del despliegue
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para Vercel...');

// Archivos requeridos
const requiredFiles = [
  'package.json',
  'vercel.json',
  'api/index.ts',
  'client/package.json',
  'client/vite.config.ts',
  'client/index.html',
  'client/src/main.tsx'
];

// Verificar archivos
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar package.json principal
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts['vercel-build']) {
    console.log('⚠️  Script vercel-build no encontrado en package.json');
  } else {
    console.log('✅ Script vercel-build encontrado');
  }
}

// Verificar vercel.json
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json válido');
  
  // Verificar configuración de builds
  if (vercelConfig.builds && vercelConfig.builds.length > 0) {
    console.log('✅ Configuración de builds presente');
  } else {
    console.log('⚠️  Configuración de builds faltante');
  }
}

// Verificar estructura de directorios
const requiredDirs = ['client', 'server', 'api'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Directorio ${dir}/`);
  } else {
    console.log(`❌ Directorio ${dir}/ - FALTANTE`);
    allFilesExist = false;
  }
});

// Verificar variables de entorno
const envVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'JWT_SECRET'
];

console.log('\n📋 Variables de entorno requeridas:');
envVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - configurada`);
  } else {
    console.log(`⚠️  ${envVar} - no configurada`);
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Configuración verificada correctamente');
  console.log('✅ El proyecto está listo para el despliegue en Vercel');
} else {
  console.log('❌ Se encontraron problemas en la configuración');
  console.log('🔧 Por favor, corrige los archivos faltantes antes del despliegue');
  process.exit(1);
}

console.log('\n📝 Próximos pasos:');
console.log('1. Asegúrate de que todas las variables de entorno estén configuradas en Vercel');
console.log('2. Haz commit y push de los cambios a GitHub');
console.log('3. Vercel desplegará automáticamente');
console.log('4. Verifica el despliegue en el dashboard de Vercel');
