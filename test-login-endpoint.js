// Script para probar el endpoint de login directamente
const fetch = require('node-fetch');

async function testLoginEndpoint() {
  try {
    console.log('🔍 Probando endpoint de login...');
    
    const response = await fetch('https://david-gestor-api.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    // Intentar leer el cuerpo de la respuesta
    const text = await response.text();
    console.log(`📄 Response body:`, text);

    // Intentar parsear como JSON si es posible
    try {
      const json = JSON.parse(text);
      console.log(`✅ JSON válido:`, json);
    } catch (e) {
      console.log(`❌ No es JSON válido:`, e.message);
    }

  } catch (error) {
    console.error('❌ Error en test de login:', error);
  }
}

testLoginEndpoint();
