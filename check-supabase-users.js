// Script para verificar usuarios en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
  console.log('💡 Asegúrate de tener un archivo .env con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en Supabase...');
    console.log(`📡 URL: ${supabaseUrl}`);
    
    // Verificar si la tabla users existe
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('❌ Error al consultar usuarios:', error);
      
      // Verificar si la tabla existe
      if (error.code === '42P01') {
        console.log('💡 La tabla "users" no existe. Necesitas crear la tabla primero.');
      }
      return;
    }

    console.log('✅ Conexión a Supabase exitosa');
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('👥 Usuarios disponibles:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    Username: ${user.username}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Description: ${user.description}`);
        console.log(`    Password hash: ${user.password_hash ? '✅' : '❌'}`);
        console.log('---');
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('💡 Ejecuta el script create-test-user.js para crear un usuario');
    }

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  }
}

checkUsers();
