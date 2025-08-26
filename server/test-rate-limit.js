#!/usr/bin/env node

// Script para probar el rate limiting
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/tasks',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

console.log('🧪 Probando rate limiting...');
console.log('📊 Enviando múltiples requests...');

let successCount = 0;
let errorCount = 0;
let rateLimitCount = 0;

const makeRequest = (requestNumber) => {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          successCount++;
          console.log(`✅ Request ${requestNumber}: OK`);
        } else if (res.statusCode === 429) {
          rateLimitCount++;
          console.log(`🚨 Request ${requestNumber}: Rate limit excedido`);
          try {
            const errorData = JSON.parse(data);
            console.log(`   Retry after: ${errorData.retryAfter}s`);
            console.log(`   Limit: ${errorData.limit}`);
          } catch (e) {
            console.log(`   Error parsing response: ${data}`);
          }
        } else {
          errorCount++;
          console.log(`❌ Request ${requestNumber}: Error ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      errorCount++;
      console.log(`❌ Request ${requestNumber}: Network error - ${error.message}`);
      resolve();
    });
    
    req.end();
  });
};

const runTest = async () => {
  const totalRequests = 150; // Más que el límite de 100
  const promises = [];
  
  for (let i = 1; i <= totalRequests; i++) {
    promises.push(makeRequest(i));
    
    // Pequeña pausa entre requests
    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  await Promise.all(promises);
  
  console.log('\n📊 Resultados del test:');
  console.log(`✅ Requests exitosos: ${successCount}`);
  console.log(`🚨 Rate limits: ${rateLimitCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📈 Total: ${totalRequests}`);
};

runTest().catch(console.error);
