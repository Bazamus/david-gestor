// Script para probar autenticación
const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase (usa las mismas variables que el servidor)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  try {
    console.log('🔍 Verificando conexión a Supabase...');
    
    // Verificar si la tabla users existe y tiene datos
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error al consultar usuarios:', error);
      return;
    }

    console.log('✅ Conexión a Supabase exitosa');
    console.log(`📊 Usuarios encontrados: ${users.length}`);
    
    if (users.length > 0) {
      console.log('👥 Usuarios disponibles:');
      users.forEach(user => {
        console.log(`  - Username: ${user.username}, Role: ${user.role}`);
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
      console.log('💡 Necesitas crear al menos un usuario para poder hacer login');
    }

  } catch (error) {
    console.error('❌ Error en test de autenticación:', error);
  }
}

testAuth();
