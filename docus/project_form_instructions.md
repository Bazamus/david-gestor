# Instrucciones para Expandir el Formulario de Creación de Proyectos

## Objetivo
Expandir el formulario actual de creación de proyectos añadiendo campos adicionales para mejorar la gestión y seguimiento de proyectos de desarrollo web.

## Campos Actuales Existentes
- nombre_proyecto (string, required)
- descripcion (text)
- estado (string, default: "Planificación")
- fecha_inicio (date)
- fecha_fin (date)
- color_proyecto (string)

## Nuevos Campos a Implementar

### 1. Esquema de Base de Datos en Supabase

Ejecuta las siguientes consultas SQL en Supabase para añadir los nuevos campos a la tabla `proyectos`:

```sql
-- Información del Cliente/Negocio
ALTER TABLE proyectos ADD COLUMN cliente_empresa VARCHAR(255);
ALTER TABLE proyectos ADD COLUMN contacto_principal VARCHAR(255);
ALTER TABLE proyectos ADD COLUMN email_contacto VARCHAR(255);
ALTER TABLE proyectos ADD COLUMN telefono_contacto VARCHAR(20);
ALTER TABLE proyectos ADD COLUMN tipo_proyecto VARCHAR(100);
ALTER TABLE proyectos ADD COLUMN prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Alta', 'Media', 'Baja'));

-- Aspectos Técnicos
ALTER TABLE proyectos ADD COLUMN stack_tecnologico TEXT[]; -- Array de strings
ALTER TABLE proyectos ADD COLUMN repositorio_url VARCHAR(500);
ALTER TABLE proyectos ADD COLUMN url_staging VARCHAR(500);
ALTER TABLE proyectos ADD COLUMN url_produccion VARCHAR(500);

-- Gestión y Presupuesto
ALTER TABLE proyectos ADD COLUMN presupuesto_estimado DECIMAL(10,2);
ALTER TABLE proyectos ADD COLUMN moneda VARCHAR(10) DEFAULT 'EUR';
ALTER TABLE proyectos ADD COLUMN horas_estimadas INTEGER;
ALTER TABLE proyectos ADD COLUMN metodo_facturacion VARCHAR(50) CHECK (metodo_facturacion IN ('Por horas', 'Precio fijo', 'Por hitos'));
ALTER TABLE proyectos ADD COLUMN estado_pago VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_pago IN ('Pendiente', 'Parcial', 'Pagado'));

-- Organización
ALTER TABLE proyectos ADD COLUMN etiquetas TEXT[]; -- Array de strings para tags
ALTER TABLE proyectos ADD COLUMN carpeta_archivos VARCHAR(500); -- Ruta relativa en OneDrive
ALTER TABLE proyectos ADD COLUMN onedrive_folder_id VARCHAR(255); -- ID de la carpeta en OneDrive
ALTER TABLE proyectos ADD COLUMN imagen_proyecto VARCHAR(500); -- URL de la imagen del proyecto
ALTER TABLE proyectos ADD COLUMN notas_adicionales TEXT;

-- Seguimiento (campos automáticos)
ALTER TABLE proyectos ADD COLUMN ultima_actividad TIMESTAMP DEFAULT NOW();
ALTER TABLE proyectos ADD COLUMN proxima_tarea TEXT;

-- Añadir trigger para actualizar ultima_actividad automáticamente
CREATE OR REPLACE FUNCTION update_ultima_actividad()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actividad = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ultima_actividad
    BEFORE UPDATE ON proyectos
    FOR EACH ROW
    EXECUTE FUNCTION update_ultima_actividad();
```

### 2. Actualización del Componente de Formulario React

Modifica el componente de formulario para incluir estos nuevos campos:

#### Estructura de Secciones:
1. **Información Básica** (existente)
2. **Información del Cliente** (nueva)
3. **Configuración Técnica** (nueva)
4. **Presupuesto y Facturación** (nueva)
5. **Organización** (nueva)
6. **Configuración del Proyecto** (existente - estado, fechas, color)

#### Tipos de Campos a Implementar:

**Campos de Texto:**
- cliente_empresa, contacto_principal, email_contacto, telefono_contacto
- repositorio_url, url_staging, url_produccion, carpeta_archivos
- proxima_tarea, notas_adicionales

**Campo de Imagen:**
- imagen_proyecto: Subida de archivo con preview, tipos permitidos: jpg, jpeg, png, webp (máximo 5MB)

**Campos Select/Dropdown:**
- tipo_proyecto: opciones ["Página Web", "Aplicación React", "E-commerce", "Dashboard", "API", "App Mobile", "Landing Page", "Blog", "Sistema Administrativo", "Otro"]
- prioridad: opciones ["Alta", "Media", "Baja"]
- metodo_facturacion: opciones ["Por horas", "Precio fijo", "Por hitos"]
- estado_pago: opciones ["Pendiente", "Parcial", "Pagado"]
- moneda: opciones ["EUR", "USD", "MXN", "COP", "ARS"]

**Campos Multi-select/Tags:**
- stack_tecnologico: opciones ["React", "Vite", "Next.js", "TypeScript", "JavaScript", "Node.js", "Express", "Supabase", "MongoDB", "PostgreSQL", "Tailwind CSS", "Material UI", "Bootstrap", "SASS", "GraphQL", "REST API", "Firebase", "Vercel", "Netlify"]
- etiquetas: campo libre para crear tags personalizados

**Campos Numéricos:**
- presupuesto_estimado (decimal con 2 decimales)
- horas_estimadas (integer)

### 3. Validaciones a Implementar

```javascript
// Validaciones con Yup o similar
const validationSchema = {
  // ... validaciones existentes
  cliente_empresa: Yup.string().max(255, 'Máximo 255 caracteres'),
  email_contacto: Yup.string().email('Email inválido').nullable(),
  telefono_contacto: Yup.string().max(20, 'Máximo 20 caracteres').nullable(),
  tipo_proyecto: Yup.string().required('Selecciona un tipo de proyecto'),
  repositorio_url: Yup.string().url('URL inválida').nullable(),
  url_staging: Yup.string().url('URL inválida').nullable(),
  url_produccion: Yup.string().url('URL inválida').nullable(),
  presupuesto_estimado: Yup.number().positive('Debe ser mayor a 0').nullable(),
  horas_estimadas: Yup.number().integer('Debe ser un número entero').positive('Debe ser mayor a 0').nullable(),
  imagen_proyecto: Yup.mixed()
    .nullable()
    .test('fileSize', 'El archivo debe ser menor a 5MB', (value) => {
      return !value || (value && value.size <= 5242880)
    })
    .test('fileType', 'Solo se permiten archivos JPG, JPEG, PNG y WEBP', (value) => {
      return !value || (value && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type))
    })
}
```

### 4. Estado Inicial del Formulario

```javascript
const initialFormState = {
  // ... campos existentes
  cliente_empresa: '',
  contacto_principal: '',
  email_contacto: '',
  telefono_contacto: '',
  tipo_proyecto: '',
  prioridad: 'Media',
  stack_tecnologico: [],
  repositorio_url: '',
  url_staging: '',
  url_produccion: '',
  presupuesto_estimado: '',
  moneda: 'EUR',
  horas_estimadas: '',
  metodo_facturacion: '',
  estado_pago: 'Pendiente',
  etiquetas: [],
  carpeta_archivos: '',
  onedrive_folder_id: null,
  imagen_proyecto: null,
  notas_adicionales: '',
  proxima_tarea: ''
}
```

### 5. Mejoras de UX a Implementar

- **Pestañas o Acordeón**: Organizar los campos en secciones colapsables
- **Autocompletado**: Para campos como cliente_empresa (basado en proyectos anteriores)
- **Validación en Tiempo Real**: Mostrar errores mientras el usuario escribe
- **Campos Condicionales**: Mostrar ciertos campos solo si otros están completos
- **Guardado como Borrador**: Permitir guardar el formulario sin completar todos los campos

### 6. Consideraciones Técnicas

- Mantener la funcionalidad existente del formulario
- Asegurar que todos los campos nuevos sean opcionales excepto `tipo_proyecto`
- Implementar manejo de errores robusto para la inserción en base de datos
- Añadir loading states para mejor UX
- Considerar paginación o lazy loading si el formulario se vuelve muy largo

### 7. Integración con OneDrive

#### 7.1 Configuración de OneDrive API

Registrar la aplicación en Azure Active Directory para obtener las credenciales necesarias:

```javascript
// Variables de entorno necesarias (.env)
VITE_ONEDRIVE_CLIENT_ID=tu_client_id
VITE_ONEDRIVE_TENANT_ID=tu_tenant_id
VITE_ONEDRIVE_CLIENT_SECRET=tu_client_secret // Solo para backend
VITE_ONEDRIVE_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### 7.2 Instalación de Dependencias

```bash
npm install @azure/msal-browser @microsoft/microsoft-graph-client
```

#### 7.3 Configuración del Cliente OneDrive

```javascript
// utils/onedriveClient.js
import { Client } from '@microsoft/microsoft-graph-client';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ONEDRIVE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ONEDRIVE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_ONEDRIVE_REDIRECT_URI,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest = {
  scopes: ['Files.ReadWrite', 'Files.ReadWrite.All']
};

export const authenticateOneDrive = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    return loginResponse.accessToken;
  } catch (error) {
    console.error('Error de autenticación OneDrive:', error);
    throw error;
  }
};

export const getGraphServiceClient = (accessToken) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
};
```

#### 7.4 Funciones para Manejo de Carpetas y Archivos

```javascript
// utils/onedriveService.js
import { getGraphServiceClient, authenticateOneDrive } from './onedriveClient';

export const createProjectFolder = async (projectName) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const folderName = `Proyecto_${projectName}_${Date.now()}`;
    
    const driveItem = {
      name: folderName,
      folder: {},
      '@microsoft.graph.conflictBehavior': 'rename'
    };
    
    const folder = await graphClient
      .me
      .drive
      .root
      .children
      .post(driveItem);
    
    return {
      folderId: folder.id,
      folderPath: folder.name,
      webUrl: folder.webUrl
    };
  } catch (error) {
    console.error('Error creando carpeta OneDrive:', error);
    throw error;
  }
};

export const uploadImageToProject = async (file, folderId, projectName) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const fileName = `${projectName}_image_${Date.now()}.${file.name.split('.').pop()}`;
    
    const uploadedFile = await graphClient
      .me
      .drive
      .items(folderId)
      .children(fileName)
      .content
      .put(file);
    
    return {
      fileId: uploadedFile.id,
      fileName: uploadedFile.name,
      downloadUrl: uploadedFile['@microsoft.graph.downloadUrl'],
      webUrl: uploadedFile.webUrl
    };
  } catch (error) {
    console.error('Error subiendo imagen a OneDrive:', error);
    throw error;
  }
};

export const getSharedLink = async (fileId) => {
  try {
    const accessToken = await authenticateOneDrive();
    const graphClient = getGraphServiceClient(accessToken);
    
    const permission = await graphClient
      .me
      .drive
      .items(fileId)
      .createLink({
        type: 'view',
        scope: 'anonymous'
      })
      .post();
    
    return permission.link.webUrl;
  } catch (error) {
    console.error('Error obteniendo enlace compartido:', error);
    throw error;
  }
};
```

#### 7.5 Componente de Subida de Imagen

```jsx
// components/ImageUpload.jsx
import { useState } from 'react';
import { uploadImageToProject, createProjectFolder } from '../utils/onedriveService';

const ImageUpload = ({ onImageUploaded, projectName, onFolderCreated }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    
    try {
      // Crear carpeta del proyecto si no existe
      const folderInfo = await createProjectFolder(projectName);
      onFolderCreated(folderInfo);
      
      // Subir imagen
      const imageInfo = await uploadImageToProject(file, folderInfo.folderId, projectName);
      onImageUploaded(imageInfo);
      
    } catch (error) {
      console.error('Error en la subida:', error);
      alert('Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagen del Proyecto
      </label>
      
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        
        <label
          htmlFor="image-upload"
          className={`cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
        </label>
        
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-lg border"
          />
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Formatos: JPG, JPEG, PNG, WEBP. Tamaño máximo: 5MB
      </p>
    </div>
  );
};

export default ImageUpload;
```

### 8. Testing

- Probar inserción de proyectos con campos vacíos y llenos
- Validar que los triggers de base de datos funcionen correctamente
- Testear validaciones del formulario
- Verificar que la actualización automática de `ultima_actividad` funcione
- **Probar autenticación con OneDrive y permisos necesarios**
- **Testear creación automática de carpetas de proyecto**
- **Validar subida de imágenes y generación de enlaces compartidos**
- **Verificar que las imágenes se muestren correctamente en el preview**