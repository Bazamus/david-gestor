#!/usr/bin/env node

/**
 * Script para verificar la configuración PWA de David Gestor
 * Ejecutar antes del deploy para asegurar que todo está correcto
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN PWA - DAVID GESTOR');
console.log('==============================================\n');

// Verificar archivos PWA requeridos
const requiredFiles = [
  'public/pwa-192x192.png',
  'public/pwa-512x512.png',
  'public/apple-touch-icon.png',
  'public/favicon.ico',
  'public/masked-icon.svg'
];

console.log('📁 Verificando archivos PWA requeridos:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log('');

// Verificar configuración de Vite
console.log('⚙️ Verificando configuración de Vite:');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  if (viteConfig.includes('VitePWA')) {
    console.log('✅ Plugin PWA configurado en vite.config.ts');
  } else {
    console.log('❌ Plugin PWA NO configurado en vite.config.ts');
    allFilesExist = false;
  }
} else {
  console.log('❌ vite.config.ts no encontrado');
  allFilesExist = false;
}

console.log('');

// Verificar index.html
console.log('🌐 Verificando index.html:');
const indexHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  const requiredMetaTags = [
    'theme-color',
    'apple-mobile-web-app-capable',
    'apple-touch-icon',
    'viewport-fit=cover'
  ];
  
  let allMetaTagsPresent = true;
  requiredMetaTags.forEach(tag => {
    if (indexHtml.includes(tag)) {
      console.log(`✅ Meta tag "${tag}" presente`);
    } else {
      console.log(`❌ Meta tag "${tag}" NO presente`);
      allMetaTagsPresent = false;
    }
  });
  
  if (!allMetaTagsPresent) {
    allFilesExist = false;
  }
} else {
  console.log('❌ index.html no encontrado');
  allFilesExist = false;
}

console.log('');

// Verificar netlify.toml
console.log('🚀 Verificando configuración de Netlify:');
const netlifyConfigPath = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(netlifyConfigPath)) {
  const netlifyConfig = fs.readFileSync(netlifyConfigPath, 'utf8');
  if (netlifyConfig.includes('Service-Worker-Allowed')) {
    console.log('✅ Headers PWA configurados en netlify.toml');
  } else {
    console.log('❌ Headers PWA NO configurados en netlify.toml');
    allFilesExist = false;
  }
} else {
  console.log('❌ netlify.toml no encontrado');
  allFilesExist = false;
}

console.log('');

// Verificar componentes PWA
console.log('🧩 Verificando componentes PWA:');
const pwaComponents = [
  'src/pwa/PWAProvider.tsx',
  'src/pwa/OfflineBanner.tsx',
  'src/pwa/InstallPrompt.tsx',
  'src/pwa/UpdatePrompt.tsx',
  'src/pwa/index.ts'
];

pwaComponents.forEach(component => {
  const componentPath = path.join(__dirname, component);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${component}`);
  } else {
    console.log(`❌ ${component} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

console.log('');

// Verificar integración en App.tsx
console.log('🔗 Verificando integración PWA en App.tsx:');
const appTsxPath = path.join(__dirname, 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appTsx = fs.readFileSync(appTsxPath, 'utf8');
  if (appTsx.includes('OfflineBanner') && appTsx.includes('InstallPrompt')) {
    console.log('✅ Componentes PWA integrados en App.tsx');
  } else {
    console.log('❌ Componentes PWA NO integrados en App.tsx');
    allFilesExist = false;
  }
} else {
  console.log('❌ App.tsx no encontrado');
  allFilesExist = false;
}

console.log('');

// Verificar integración en main.tsx
console.log('🔗 Verificando integración PWA en main.tsx:');
const mainTsxPath = path.join(__dirname, 'src/main.tsx');
if (fs.existsSync(mainTsxPath)) {
  const mainTsx = fs.readFileSync(mainTsxPath, 'utf8');
  if (mainTsx.includes('PWAProvider')) {
    console.log('✅ PWAProvider integrado en main.tsx');
  } else {
    console.log('❌ PWAProvider NO integrado en main.tsx');
    allFilesExist = false;
  }
} else {
  console.log('❌ main.tsx no encontrado');
  allFilesExist = false;
}

console.log('');

// Verificar package.json
console.log('📦 Verificando dependencias PWA:');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const pwaDependencies = ['vite-plugin-pwa', 'workbox-window'];
  
  let allDependenciesPresent = true;
  pwaDependencies.forEach(dep => {
    if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep} instalado`);
    } else {
      console.log(`❌ ${dep} NO instalado`);
      allDependenciesPresent = false;
    }
  });
  
  if (!allDependenciesPresent) {
    allFilesExist = false;
  }
} else {
  console.log('❌ package.json no encontrado');
  allFilesExist = false;
}

console.log('');
console.log('==============================================');

if (allFilesExist) {
  console.log('✅ CONFIGURACIÓN PWA COMPLETA Y CORRECTA');
  console.log('🚀 Listo para deploy en Netlify');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS:');
  console.log('1. git add .');
  console.log('2. git commit -m "feat: implementar PWA completa"');
  console.log('3. git push origin main');
  console.log('4. Verificar deploy en https://david-gestor.netlify.app/');
  console.log('5. Probar instalación PWA en dispositivos');
} else {
  console.log('❌ CONFIGURACIÓN PWA INCOMPLETA');
  console.log('🔧 Revisar los errores anteriores antes del deploy');
  process.exit(1);
}

console.log('');
console.log('🔗 URL de producción: https://david-gestor.netlify.app/');
console.log('📱 La aplicación será instalable como PWA');
console.log('⚡ Funcionará offline con caché inteligente');
