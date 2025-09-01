// Script simple para probar el endpoint de login
const https = require('https');

function makeRequest() {
  const data = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: 'david-gestor-api.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response body:', responseData);
      
      if (responseData) {
        try {
          const json = JSON.parse(responseData);
          console.log('Parsed JSON:', json);
        } catch (e) {
          console.log('Not valid JSON:', e.message);
        }
      } else {
        console.log('Empty response');
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e);
  });

  req.write(data);
  req.end();
}

makeRequest();
