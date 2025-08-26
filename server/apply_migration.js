const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Aplicando migración de restricción CHECK...');
    
    // 1. Eliminar la restricción CHECK existente
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;'
    });
    
    if (dropError) {
      console.error('Error eliminando restricción:', dropError);
    } else {
      console.log('Restricción anterior eliminada');
    }
    
    // 2. Añadir nueva restricción CHECK con todos los estados
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
            CHECK (status IN ('todo', 'in_progress', 'done', 'NADA', 'EN_PROGRESO', 'COMPLETADA'));`
    });
    
    if (addError) {
      console.error('Error añadiendo nueva restricción:', addError);
    } else {
      console.log('Nueva restricción añadida');
    }
    
    // 3. Actualizar valor por defecto
    const { error: defaultError } = await supabase.rpc('exec_sql', {
      sql: "ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'NADA';"
    });
    
    if (defaultError) {
      console.error('Error actualizando valor por defecto:', defaultError);
    } else {
      console.log('Valor por defecto actualizado');
    }
    
    console.log('Migración aplicada exitosamente');
    
  } catch (error) {
    console.error('Error aplicando migración:', error);
  }
}

applyMigration();
