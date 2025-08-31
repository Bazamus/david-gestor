#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://david-gestor-api.onrender.com';

// Función para hacer una petición con headers de CORS
function testCORS(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    
    console.log(`🔍 Probando CORS en: ${url}`);
    
    const options = {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://david-gestor.netlify.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };
    
    const req = https.request(url, options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers de respuesta:`);
      console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
      console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods']}`);
      console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers']}`);
      console.log('');
      
      resolve({ status: res.statusCode, headers: res.headers });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log('');
      reject(err);
    });
    
    req.end();
  });
}

// Función para probar una petición GET real
function testGET(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    
    console.log(`🔍 Probando GET en: ${url}`);
    
    const options = {
      method: 'GET',
      headers: {
        'Origin': 'https://david-gestor.netlify.app',
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📋 Headers de respuesta:`);
        console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin']}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log('');
        
        resolve({ status: res.statusCode, headers: res.headers, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log('');
      reject(err);
    });
    
    req.end();
  });
}

async function testCORSFix() {
  console.log('🚀 Verificando fix de CORS...\n');
  
  const endpoints = ['/api/projects', '/api/tasks', '/api/auth'];
  
  for (const endpoint of endpoints) {
    try {
      await testCORS(endpoint);
      await testGET(endpoint);
    } catch (error) {
      console.log(`❌ Error en ${endpoint}: ${error.message}\n`);
    }
  }
  
  console.log('✅ Verificación de CORS completada');
  console.log('🌐 Ahora puedes probar la aplicación en: https://david-gestor.netlify.app');
}

testCORSFix();
