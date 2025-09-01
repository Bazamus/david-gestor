#!/usr/bin/env node

console.log('🔧 Verificación de Variables de Entorno para Netlify');
console.log('==================================================\n');

console.log('❌ PROBLEMA DETECTADO:');
console.log('La aplicación está intentando hacer requests a Netlify en lugar del backend de Render.\n');

console.log('🔧 SOLUCIÓN:');
console.log('Necesitas configurar las variables de entorno en Netlify correctamente.\n');

console.log('📋 PASOS PARA SOLUCIONAR:');
console.log('1. Ve a tu dashboard de Netlify');
console.log('2. Selecciona tu sitio: david-gestor');
console.log('3. Ve a "Site settings" → "Environment variables"');
console.log('4. Asegúrate de que tengas estas variables configuradas:\n');

console.log('VITE_API_URL=https://david-gestor-api.onrender.com/api');
console.log('VITE_SUPABASE_URL=https://tkqihnmpqjmyrjojmeyr.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui');
console.log('VITE_APP_NAME=Gestor de Proyectos');
console.log('VITE_APP_VERSION=1.0.0');
console.log('VITE_ENABLE_TIME_TRACKING=true');
console.log('VITE_ENABLE_NOTIFICATIONS=true');
console.log('VITE_ENABLE_EXPORT=true');
console.log('VITE_ENABLE_IMPORT=true\n');

console.log('⚠️  IMPORTANTE:');
console.log('- La variable VITE_API_URL DEBE ser: https://david-gestor-api.onrender.com/api');
console.log('- NO debe ser: https://david-gestor.netlify.app/api');
console.log('- Después de cambiar las variables, haz un nuevo deploy\n');

console.log('🔄 PARA HACER UN NUEVO DEPLOY:');
console.log('1. En Netlify, ve a la pestaña "Deploys"');
console.log('2. Haz clic en "Trigger deploy" → "Deploy site"');
console.log('3. Espera a que termine el deploy');
console.log('4. Prueba la aplicación nuevamente\n');

console.log('✅ DESPUÉS DEL FIX:');
console.log('- La aplicación debería hacer requests al backend correcto');
console.log('- El login debería funcionar sin errores');
console.log('- No debería haber errores de CORS');
