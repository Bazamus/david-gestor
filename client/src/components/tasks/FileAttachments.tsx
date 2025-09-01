import React, { useState, useRef } from 'react';
import { Upload, File, X, Eye, AlertCircle } from 'lucide-react';
import { ArchivoAdjunto } from '../../types';

interface FileAttachmentsProps {
  archivos: ArchivoAdjunto[];
  onChange: (archivos: ArchivoAdjunto[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // en MB
}

export const FileAttachments: React.FC<FileAttachmentsProps> = ({
  archivos,
  onChange,
  disabled = false,
  maxFiles = 10,
  maxFileSize = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;

    const nuevosArchivos: ArchivoAdjunto[] = [];
    const errores: string[] = [];

    // Verificar límite de archivos
    if (archivos.length + files.length > maxFiles) {
      setError(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    Array.from(files).forEach((file) => {
      // Verificar tamaño
      if (file.size > maxFileSize * 1024 * 1024) {
        errores.push(`${file.name} excede el tamaño máximo de ${maxFileSize}MB`);
        return;
      }

      // Verificar que no esté duplicado
      if (archivos.some(a => a.nombre === file.name)) {
        errores.push(`${file.name} ya está adjunto`);
        return;
      }

      // Crear URL temporal para preview
      const urlTemporal = URL.createObjectURL(file);

      const nuevoArchivo: ArchivoAdjunto = {
        id: crypto.randomUUID(),
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamaño: file.size,
        url_temporal: urlTemporal,
        fecha_subida: new Date().toISOString(),
        subido_por: 'usuario', // En el futuro se puede obtener del contexto de auth
      };

      nuevosArchivos.push(nuevoArchivo);
    });

    if (errores.length > 0) {
      setError(errores.join(', '));
    } else {
      setError(null);
    }

    if (nuevosArchivos.length > 0) {
      onChange([...archivos, ...nuevosArchivos]);
    }
  };

  const eliminarArchivo = (id: string) => {
    const archivo = archivos.find(a => a.id === id);
    if (archivo?.url_temporal) {
      URL.revokeObjectURL(archivo.url_temporal);
    }
    onChange(archivos.filter(a => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.startsWith('image/')) return '🖼️';
    if (tipo.startsWith('video/')) return '🎥';
    if (tipo.startsWith('audio/')) return '🎵';
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word')) return '📝';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return '📽️';
    if (tipo.includes('zip') || tipo.includes('rar')) return '🗜️';
    return '📁';
  };

  const abrirArchivo = (archivo: ArchivoAdjunto) => {
    if (archivo.url_temporal) {
      window.open(archivo.url_temporal, '_blank');
    } else if (archivo.onedrive_url) {
      window.open(archivo.onedrive_url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Archivos Adjuntos
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {archivos.length}/{maxFiles} archivos
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={16} className="text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!disabled && archivos.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Arrastra archivos aquí o{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              selecciona archivos
            </button>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Máximo {maxFileSize}MB por archivo
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            accept="*/*"
          />
        </div>
      )}

      {/* Lista de archivos */}
      {archivos.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group"
            >
              {/* Icono del archivo */}
              <div className="text-2xl">
                {getFileIcon(archivo.tipo)}
              </div>

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {archivo.nombre}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(archivo.tamaño)}</span>
                  <span>•</span>
                  <span>{new Date(archivo.fecha_subida).toLocaleDateString('es-ES')}</span>
                  {archivo.onedrive_id && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400">OneDrive</span>
                    </>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Ver/Descargar */}
                <button
                  type="button"
                  onClick={() => abrirArchivo(archivo)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Ver archivo"
                >
                  <Eye size={16} />
                </button>

                {/* Eliminar */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => eliminarArchivo(archivo.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar archivo"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {archivos.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <File className="mx-auto h-8 w-8 mb-2" />
          <p className="text-sm">No hay archivos adjuntos</p>
          {!disabled && (
            <p className="text-xs mt-1">Arrastra archivos o haz clic para seleccionar</p>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Los archivos se almacenarán temporalmente hasta la integración con OneDrive</p>
        <p>• Formatos soportados: todos los tipos de archivo</p>
        <p>• Tamaño máximo por archivo: {maxFileSize}MB</p>
      </div>
    </div>
  );
};

export default FileAttachments;
