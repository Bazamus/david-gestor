// Script para verificar si la tabla users existe
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
  try {
    console.log('🔍 Verificando tabla users...');
    
    // Intentar consultar la tabla
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error al consultar tabla users:', error);
      
      if (error.code === '42P01') {
        console.log('💡 La tabla "users" no existe');
        console.log('📝 Necesitas ejecutar la migración en Supabase');
      }
      return;
    }

    console.log('✅ Tabla users existe');
    console.log('📊 Datos encontrados:', data.length);
    
    if (data.length > 0) {
      console.log('👤 Primer usuario:', data[0]);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyTable();
