#!/usr/bin/env node

// Script para monitorear las conexiones y requests del servidor
// Ayuda a diagnosticar problemas de desconexión

const http = require('http');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const MONITOR_INTERVAL = parseInt(process.env.MONITOR_INTERVAL || '30000'); // 30 segundos

let requestCount = 0;
let errorCount = 0;
let lastCheck = Date.now();

console.log('🔍 Iniciando monitor de servidor...');
console.log(`📡 Monitoreando: ${SERVER_URL}`);
console.log(`⏱️  Intervalo: ${MONITOR_INTERVAL / 1000} segundos`);
console.log('');

// Función para hacer health check
const healthCheck = () => {
  const startTime = Date.now();
  
  http.get(`${SERVER_URL}/health`, (res) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    requestCount++;
    
    if (res.statusCode === 200) {
      console.log(`✅ Health check #${requestCount} - Status: ${res.statusCode} - Response time: ${responseTime}ms`);
    } else {
      errorCount++;
      console.log(`⚠️  Health check #${requestCount} - Status: ${res.statusCode} - Response time: ${responseTime}ms`);
    }
    
    // Mostrar estadísticas cada 10 requests
    if (requestCount % 10 === 0) {
      const uptime = Math.floor((Date.now() - lastCheck) / 1000);
      const successRate = ((requestCount - errorCount) / requestCount * 100).toFixed(2);
      
      console.log('');
      console.log('📊 Estadísticas del monitor:');
      console.log(`   - Total requests: ${requestCount}`);
      console.log(`   - Errores: ${errorCount}`);
      console.log(`   - Tasa de éxito: ${successRate}%`);
      console.log(`   - Tiempo activo: ${uptime}s`);
      console.log('');
    }
  }).on('error', (err) => {
    errorCount++;
    requestCount++;
    
    console.log(`❌ Error en health check #${requestCount}: ${err.message}`);
    
    // Si hay muchos errores consecutivos, mostrar advertencia
    if (errorCount >= 3) {
      console.log('');
      console.log('🚨 ADVERTENCIA: Múltiples errores consecutivos detectados');
      console.log('   - El servidor podría estar desconectado');
      console.log('   - Verifica que el servidor esté ejecutándose');
      console.log('');
    }
  });
};

// Iniciar monitoreo
const monitor = setInterval(healthCheck, MONITOR_INTERVAL);

// Manejar cierre del monitor
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo monitor...');
  clearInterval(monitor);
  
  const uptime = Math.floor((Date.now() - lastCheck) / 1000);
  const successRate = requestCount > 0 ? ((requestCount - errorCount) / requestCount * 100).toFixed(2) : '0';
  
  console.log('');
  console.log('📊 Resumen final:');
  console.log(`   - Total requests: ${requestCount}`);
  console.log(`   - Errores: ${errorCount}`);
  console.log(`   - Tasa de éxito: ${successRate}%`);
  console.log(`   - Tiempo total: ${uptime}s`);
  console.log('');
  
  process.exit(0);
});

// Primer health check inmediato
healthCheck();
