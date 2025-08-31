#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando configuración para deploy en Netlify...\n');

const checks = [
  {
    name: 'netlify.toml',
    path: 'netlify.toml',
    required: true,
    description: 'Archivo de configuración principal de Netlify'
  },
  {
    name: 'package.json',
    path: 'package.json',
    required: true,
    description: 'Archivo de dependencias y scripts'
  },
  {
    name: 'public/_redirects',
    path: 'public/_redirects',
    required: true,
    description: 'Redirecciones para SPA'
  },
  {
    name: 'public/_headers',
    path: 'public/_headers',
    required: true,
    description: 'Headers de seguridad y caché'
  },
  {
    name: 'vite.config.ts',
    path: 'vite.config.ts',
    required: true,
    description: 'Configuración de Vite'
  },
  {
    name: 'env.production.example',
    path: 'env.production.example',
    required: false,
    description: 'Variables de entorno de ejemplo para producción'
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.path);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`✅ ${check.name} - ${check.description}`);
  } else if (check.required) {
    console.log(`❌ ${check.name} - ${check.description} (REQUERIDO)`);
    allPassed = false;
  } else {
    console.log(`⚠️  ${check.name} - ${check.description} (OPCIONAL)`);
  }
});

// Verificar package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  console.log('\n📦 Verificando package.json...');
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Script de build encontrado');
  } else {
    console.log('❌ Script de build no encontrado en package.json');
    allPassed = false;
  }
  
  if (packageJson.dependencies && packageJson.dependencies.react) {
    console.log('✅ React encontrado en dependencias');
  } else {
    console.log('❌ React no encontrado en dependencias');
    allPassed = false;
  }
  
} catch (error) {
  console.log('❌ Error al leer package.json:', error.message);
  allPassed = false;
}

// Verificar netlify.toml
try {
  const netlifyConfig = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
  
  console.log('\n⚙️  Verificando netlify.toml...');
  
  if (netlifyConfig.includes('base = "client"')) {
    console.log('✅ Base directory configurado correctamente');
  } else {
    console.log('⚠️  Base directory no configurado como "client"');
  }
  
  if (netlifyConfig.includes('command = "npm run build"')) {
    console.log('✅ Build command configurado correctamente');
  } else {
    console.log('⚠️  Build command no configurado como "npm run build"');
  }
  
  if (netlifyConfig.includes('publish = "dist"')) {
    console.log('✅ Publish directory configurado correctamente');
  } else {
    console.log('⚠️  Publish directory no configurado como "dist"');
  }
  
} catch (error) {
  console.log('❌ Error al leer netlify.toml:', error.message);
  allPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 ¡Configuración verificada exitosamente!');
  console.log('✅ Tu proyecto está listo para deploy en Netlify');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Haz commit y push de los cambios al repositorio');
  console.log('2. Ve a netlify.com y conecta tu repositorio de GitHub');
  console.log('3. Configura las variables de entorno en Netlify');
  console.log('4. ¡Deploy automático!');
} else {
  console.log('❌ Se encontraron problemas en la configuración');
  console.log('🔧 Por favor, corrige los errores antes de proceder');
}

console.log('\n📖 Para más información, consulta README-NETLIFY.md');
