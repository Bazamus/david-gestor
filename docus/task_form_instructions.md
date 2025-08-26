# Instrucciones para Expandir el Formulario de Creación de Tareas

## Objetivo
Expandir el formulario actual de creación de tareas añadiendo campos adicionales para mejorar la gestión y seguimiento de tareas dentro de los proyectos.

## Campos Actuales Existentes
- titulo (string, required)
- descripcion (text)
- estado (string, default: "Por hacer")
- prioridad (string, default: "Media")
- fecha_vencimiento (date)
- horas_estimadas (integer)
- etiquetas (text[])
- proyecto_id (uuid, foreign key, required)

## Nuevos Campos a Implementar

### 1. Esquema de Base de Datos en Supabase

Ejecuta las siguientes consultas SQL en Supabase para añadir los nuevos campos a la tabla `tareas`:

```sql
-- Gestión y Asignación
ALTER TABLE tareas ADD COLUMN asignado_a VARCHAR(255);
ALTER TABLE tareas ADD COLUMN tipo_tarea VARCHAR(100) CHECK (tipo_tarea IN ('Desarrollo', 'Diseño', 'Testing', 'Documentación', 'Reunión', 'Research', 'Bug Fix', 'Deploy', 'Review'));
ALTER TABLE tareas ADD COLUMN complejidad VARCHAR(20) DEFAULT 'Media' CHECK (complejidad IN ('Baja', 'Media', 'Alta'));

-- Dependencias y Relaciones
ALTER TABLE tareas ADD COLUMN tarea_padre_id UUID REFERENCES tareas(id);
ALTER TABLE tareas ADD COLUMN tareas_dependientes UUID[]; -- Array de IDs de tareas
ALTER TABLE tareas ADD COLUMN milestone VARCHAR(255);

-- Seguimiento y Progreso
ALTER TABLE tareas ADD COLUMN porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100);
ALTER TABLE tareas ADD COLUMN tiempo_trabajado INTEGER DEFAULT 0; -- En minutos
ALTER TABLE tareas ADD COLUMN fecha_inicio DATE;
ALTER TABLE tareas ADD COLUMN ultima_actualizacion TIMESTAMP DEFAULT NOW();

-- Información Técnica
ALTER TABLE tareas ADD COLUMN branch_git VARCHAR(255);
ALTER TABLE tareas ADD COLUMN url_referencia VARCHAR(500);
ALTER TABLE tareas ADD COLUMN onedrive_folder_id VARCHAR(255); -- ID de subcarpeta en OneDrive
ALTER TABLE tareas ADD COLUMN archivos_adjuntos TEXT[]; -- Array de URLs/nombres de archivos

-- Comunicación y Seguimiento
ALTER TABLE tareas ADD COLUMN comentarios TEXT;
ALTER TABLE tareas ADD COLUMN bloqueada_por TEXT;
ALTER TABLE tareas ADD COLUMN criterios_aceptacion JSONB; -- Array de objetos {criterio: string, completado: boolean}

-- Automatización y Métricas
ALTER TABLE tareas ADD COLUMN es_recurrente BOOLEAN DEFAULT FALSE;
ALTER TABLE tareas ADD COLUMN frecuencia_recurrencia VARCHAR(50); -- 'diario', 'semanal', 'mensual'
ALTER TABLE tareas ADD COLUMN fecha_revision DATE;

-- Integración con el Proyecto
ALTER TABLE tareas ADD COLUMN fase_proyecto VARCHAR(100) CHECK (fase_proyecto IN ('Análisis', 'Desarrollo', 'Testing', 'Despliegue', 'Mantenimiento'));
ALTER TABLE tareas ADD COLUMN impacto VARCHAR(20) DEFAULT 'Medio' CHECK (impacto IN ('Bajo', 'Medio', 'Alto', 'Crítico'));

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tareas_proyecto_id ON tareas(proyecto_id);
CREATE INDEX idx_tareas_asignado_a ON tareas(asignado_a);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_tareas_tarea_padre ON tareas(tarea_padre_id);

-- Añadir trigger para actualizar ultima_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_tarea_ultima_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tarea_ultima_actualizacion
    BEFORE UPDATE ON tareas
    FOR EACH ROW
    EXECUTE FUNCTION update_tarea_ultima_actualizacion();

-- Vista para obtener jerarquía de tareas
CREATE OR REPLACE VIEW tareas_con_jerarquia AS
SELECT 
    t.*,
    tp.titulo as titulo_padre,
    p.nombre_proyecto,
    p.cliente_empresa
FROM tareas t
LEFT JOIN tareas tp ON t.tarea_padre_id = tp.id
LEFT JOIN proyectos p ON t.proyecto_id = p.id;
```

### 2. Actualización del Componente de Formulario React

Modifica el componente de formulario para incluir estos nuevos campos:

#### Estructura de Secciones:
1. **Información Básica** (existente + tipo_tarea)
2. **Asignación y Gestión** (nueva)
3. **Dependencias** (nueva)
4. **Seguimiento y Progreso** (nueva)
5. **Información Técnica** (nueva)
6. **Criterios y Comunicación** (nueva)
7. **Configuración Avanzada** (nueva)

#### Tipos de Campos a Implementar:

**Campos de Texto:**
- asignado_a, milestone, branch_git, url_referencia, comentarios, bloqueada_por

**Campos Select/Dropdown:**
- tipo_tarea: opciones ["Desarrollo", "Diseño", "Testing", "Documentación", "Reunión", "Research", "Bug Fix", "Deploy", "Review"]
- complejidad: opciones ["Baja", "Media", "Alta"]
- fase_proyecto: opciones ["Análisis", "Desarrollo", "Testing", "Despliegue", "Mantenimiento"]
- impacto: opciones ["Bajo", "Medio", "Alto", "Crítico"]
- frecuencia_recurrencia: opciones ["Diario", "Semanal", "Mensual"] (solo visible si es_recurrente es true)

**Campos Multi-select:**
- tareas_dependientes: Multi-select de tareas existentes en el proyecto
- tarea_padre_id: Select de tareas existentes (excluyendo la tarea actual)

**Campos Numéricos:**
- porcentaje_completado: Slider de 0 a 100 con input numérico
- tiempo_trabajado: Input numérico (se convertirá a minutos internamente)

**Campos de Fecha:**
- fecha_inicio, fecha_revision

**Campos Especiales:**
- criterios_aceptacion: Lista dinámica donde se pueden añadir/quitar criterios
- es_recurrente: Checkbox que habilita campo de frecuencia
- archivos_adjuntos: Componente de subida múltiple de archivos

### 3. Validaciones a Implementar

```javascript
// Validaciones con Yup o similar
const taskValidationSchema = {
  // ... validaciones existentes
  titulo: Yup.string().required('El título es obligatorio').max(255, 'Máximo 255 caracteres'),
  tipo_tarea: Yup.string().required('Selecciona un tipo de tarea'),
  asignado_a: Yup.string().max(255, 'Máximo 255 caracteres'),
  complejidad: Yup.string().oneOf(['Baja', 'Media', 'Alta']),
  porcentaje_completado: Yup.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  tiempo_trabajado: Yup.number().min(0, 'Debe ser mayor o igual a 0'),
  url_referencia: Yup.string().url('URL inválida').nullable(),
  fecha_inicio: Yup.date().nullable(),
  fecha_revision: Yup.date().nullable(),
  criterios_aceptacion: Yup.array().of(
    Yup.object().shape({
      criterio: Yup.string().required('El criterio es obligatorio'),
      completado: Yup.boolean().default(false)
    })
  ),
  // Validación condicional para frecuencia_recurrencia
  frecuencia_recurrencia: Yup.string().when('es_recurrente', {
    is: true,
    then: Yup.string().required('Selecciona la frecuencia de recurrencia'),
    otherwise: Yup.string().nullable()
  })
}
```

### 4. Estado Inicial del Formulario

```javascript
const initialTaskFormState = {
  // ... campos existentes
  titulo: '',
  descripcion: '',
  estado: 'Por hacer',
  prioridad: 'Media',
  fecha_vencimiento: '',
  horas_estimadas: '',
  etiquetas: [],
  proyecto_id: '', // Se pasará como prop
  
  // Nuevos campos
  asignado_a: '',
  tipo_tarea: '',
  complejidad: 'Media',
  tarea_padre_id: null,
  tareas_dependientes: [],
  milestone: '',
  porcentaje_completado: 0,
  tiempo_trabajado: 0,
  fecha_inicio: '',
  branch_git: '',
  url_referencia: '',
  onedrive_folder_id: null,
  archivos_adjuntos: [],
  comentarios: '',
  bloqueada_por: '',
  criterios_aceptacion: [],
  es_recurrente: false,
  frecuencia_recurrencia: '',
  fecha_revision: '',
  fase_proyecto: 'Desarrollo',
  impacto: 'Medio'
}
```

### 5. Integración con OneDrive para Tareas

#### 5.1 Funciones para Manejo de Subcarpetas de Tareas

```javascript
// utils/onedriveTaskService.js
import { getGraphServiceClient, authenticateOneDrive } from './onedriveClient';

export const createTaskFolder = async (projectFolderId, taskTitle) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const sanitizedTaskTitle = taskTitle.replace(/[<>:"/\\|?*]/g, '-');
    const folderName = `Tarea_${sanitizedTaskTitle}_${Date.now()}`;
    
    const driveItem = {
      name: folderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };
    
    const folder = await graphClient
      .me
      .drive
      .items(projectFolderId)
      .children
      .post(driveItem);
    
    return {
      folderId: folder.id,
      folderPath: folder.name,
      webUrl: folder.webUrl
    };
  } catch (error) {
    console.error('Error creando carpeta de tarea OneDrive:', error);
    throw error;
  }
};

export const uploadTaskFiles = async (files, taskFolderId, taskTitle) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const uploadedFiles = [];
    
    for (const file of files) {
      const fileName = `${taskTitle}_${Date.now()}_${file.name}`;
      
      const uploadedFile = await graphClient
        .me
        .drive
        .items(taskFolderId)
        .children(fileName)
        .content
        .put(file);
      
      uploadedFiles.push({
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        downloadUrl: uploadedFile['@microsoft.graph.downloadUrl'],
        webUrl: uploadedFile.webUrl
      });
    }
    
    return uploadedFiles;
  } catch (error) {
    console.error('Error subiendo archivos de tarea a OneDrive:', error);
    throw error;
  }
};

export const getTaskFiles = async (taskFolderId) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const files = await graphClient
      .me
      .drive
      .items(taskFolderId)
      .children
      .get();
    
    return files.value.filter(item => !item.folder);
  } catch (error) {
    console.error('Error obteniendo archivos de tarea:', error);
    throw error;
  }
};
```

#### 5.2 Componente de Subida de Archivos para Tareas

```jsx
// components/TaskFileUpload.jsx
import { useState } from 'react';
import { createTaskFolder, uploadTaskFiles } from '../utils/onedriveTaskService';

const TaskFileUpload = ({ projectFolderId, taskTitle, onFolderCreated, onFilesUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    try {
      // Crear carpeta de la tarea
      const taskFolderInfo = await createTaskFolder(projectFolderId, taskTitle);
      onFolderCreated(taskFolderInfo);
      
      // Subir archivos
      const uploadedFiles = await uploadTaskFiles(selectedFiles, taskFolderInfo.folderId, taskTitle);
      onFilesUploaded(uploadedFiles);
      
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error en la subida:', error);
      alert('Error al subir los archivos. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Archivos de la Tarea
      </label>
      
      <div className="flex items-center space-x-4">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivos'}
          </button>
        )}
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="text-sm text-gray-500">
          {selectedFiles.length} archivo(s) seleccionado(s)
        </div>
      )}
    </div>
  );
};

export default TaskFileUpload;
```

### 6. Componentes Especiales

#### 6.1 Componente de Criterios de Aceptación

```jsx
// components/AcceptanceCriteria.jsx
import { useState } from 'react';

const AcceptanceCriteria = ({ criteria, onChange }) => {
  const [newCriterio, setNewCriterio] = useState('');

  const addCriterio = () => {
    if (newCriterio.trim()) {
      const updatedCriteria = [...criteria, { criterio: newCriterio, completado: false }];
      onChange(updatedCriteria);
      setNewCriterio('');
    }
  };

  const removeCriterio = (index) => {
    const updatedCriteria = criteria.filter((_, i) => i !== index);
    onChange(updatedCriteria);
  };

  const toggleCriterio = (index) => {
    const updatedCriteria = criteria.map((item, i) => 
      i === index ? { ...item, completado: !item.completado } : item
    );
    onChange(updatedCriteria);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Criterios de Aceptación
      </label>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newCriterio}
          onChange={(e) => setNewCriterio(e.target.value)}
          placeholder="Nuevo criterio..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addCriterio}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Añadir
        </button>
      </div>
      
      <div className="space-y-2">
        {criteria.map((item, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 border rounded-md">
            <input
              type="checkbox"
              checked={item.completado}
              onChange={() => toggleCriterio(index)}
              className="h-4 w-4 text-blue-600"
            />
            <span className={`flex-1 ${item.completado ? 'line-through text-gray-500' : ''}`}>
              {item.criterio}
            </span>
            <button
              type="button"
              onClick={() => removeCriterio(index)}
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcceptanceCriteria;
```

### 7. Mejoras de UX a Implementar

- **Formulario por Pasos**: Dividir el formulario en pasos/pestañas para no abrumar al usuario
- **Autocompletado**: Para campos como asignado_a basado en colaboradores anteriores
- **Dependencias Visuales**: Mostrar gráficamente las dependencias entre tareas
- **Cálculo Automático**: Actualizar automáticamente porcentaje del proyecto basado en tareas completadas
- **Plantillas de Tareas**: Crear plantillas para tipos de tareas comunes
- **Drag & Drop**: Para archivos adjuntos
- **Progress Indicators**: Mostrar progreso visual del porcentaje completado
- **Time Tracking**: Botón para iniciar/parar contador de tiempo trabajado

### 7.1 Consideraciones Técnicas

- Implementar lazy loading para la lista de tareas dependientes
- Cachear la estructura de carpetas OneDrive para mejor rendimiento
- Validar permisos antes de crear subcarpetas en OneDrive
- Implementar sincronización offline para el tiempo trabajado
- Añadir índices de base de datos para consultas frecuentes
- Implementar paginación para proyectos con muchas tareas
- Manejar conflictos cuando múltiples usuarios editan la misma tarea

### 8. Funcionalidades Adicionales

#### 8.1 Vista Kanban Mejorada
- Mostrar avatares de asignados
- Indicadores visuales de complejidad e impacto
- Filtros por tipo de tarea, asignado, estado

#### 8.2 Reportes y Métricas
- Tiempo estimado vs tiempo real por tarea
- Productividad por persona asignada
- Análisis de bloqueos más frecuentes
- Burndown charts por proyecto

### 9. Testing

- Probar creación de tareas con todos los campos
- Validar jerarquías de tareas (padre-hijo)
- Testear dependencias circulares y prevenirlas
- Verificar sincronización con OneDrive
- Probar subida múltiple de archivos
- Testear triggers de base de datos
- Validar cálculos automáticos de progreso
- Probar formularios largos en dispositivos móviles
### 1. Sistema de Comentarios en Tareas
**Descripción:** Permitir agregar comentarios a las tareas para un mejor seguimiento y colaboración.

**Características:**
- Agregar comentarios a tareas individuales
- Edición y eliminación de comentarios