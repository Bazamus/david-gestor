// Script para crear usuario de prueba
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    console.log('🔍 Verificando si existe usuario de prueba...');
    
    // Verificar si ya existe el usuario
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar usuario existente:', checkError);
      return;
    }

    if (existingUser) {
      console.log('✅ Usuario admin ya existe');
      console.log(`👤 Username: ${existingUser.username}, Role: ${existingUser.role}`);
      return;
    }

    console.log('📝 Creando usuario de prueba...');
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          password_hash: passwordHash,
          role: 'admin',
          description: 'Usuario administrador de prueba'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error al crear usuario:', createError);
      return;
    }

    console.log('✅ Usuario de prueba creado exitosamente');
    console.log(`👤 Username: admin`);
    console.log(`🔑 Password: admin123`);
    console.log(`👑 Role: ${newUser.role}`);

  } catch (error) {
    console.error('❌ Error en creación de usuario:', error);
  }
}

createTestUser();
