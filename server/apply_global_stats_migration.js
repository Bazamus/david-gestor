const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan las variables de entorno de Supabase (SUPABASE_URL, SUPABASE_SERVICE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Ruta al archivo de migración SQL
const migrationFilePath = path.join(__dirname, '..', 'database', 'migrations', 'create_global_project_stats_function.sql');

async function applyMigration() {
  try {
    console.log('Paso 1: Leyendo archivo de migración...');
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    if (!sql || sql.trim() === '') {
      console.error('Error: El archivo de migración está vacío o no se pudo leer.');
      process.exit(1);
    }
    console.log('Archivo SQL leído correctamente.');

    console.log('Paso 2: Aplicando migración a través de RPC exec_sql...');
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error detallado de Supabase al ejecutar RPC:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('Paso 3: La llamada RPC se completó sin errores.');
    console.log('Respuesta de Supabase (data):', data);
    console.log('¡Migración aplicada con éxito! La función get_global_project_stats debería estar disponible.');

  } catch (err) {
    console.error('Error catastrófico en el bloque try-catch:', err);
    process.exit(1);
  }
}

applyMigration();
