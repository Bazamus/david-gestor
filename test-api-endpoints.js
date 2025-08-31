#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://david-gestor-api.onrender.com';

const endpoints = [
  '/',
  '/health',
  '/api/auth',
  '/api/projects',
  '/api/tasks',
  '/api/dashboard',
  '/api/search',
  '/api/reportes',
  '/api/time-entries'
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    
    console.log(`🔍 Probando: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Respuesta: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`   Respuesta: ${data}`);
        }
        console.log('');
        resolve({ endpoint, status: res.statusCode, data });
      });
    }).on('error', (err) => {
      console.log(`❌ ${endpoint} - Error: ${err.message}`);
      console.log('');
      reject(err);
    });
  });
}

async function testAllEndpoints() {
  console.log('🚀 Probando endpoints de la API...\n');
  
  for (const endpoint of endpoints) {
    try {
      await testEndpoint(endpoint);
    } catch (error) {
      console.log(`❌ Error en ${endpoint}: ${error.message}\n`);
    }
  }
  
  console.log('✅ Pruebas completadas');
}

testAllEndpoints();
