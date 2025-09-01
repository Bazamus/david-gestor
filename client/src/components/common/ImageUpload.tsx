// ======================================
// COMPONENTE IMAGE UPLOAD - PREPARACIÓN FUTURA
// ======================================

import React, { useState, useRef } from 'react';
import { UploadIcon, ImageIcon, XIcon } from 'lucide-react';
import { useOneDrive } from '@/hooks/useOneDrive';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageUploaded?: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  showRemoveButton?: boolean;
  onRemove?: () => void;
  currentImage?: string | null;
  folderName?: string;
  projectId?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  className = '',
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    isLoading, 
    error, 
    uploadProgress, 
    clearError 
  } = useOneDrive();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, JPEG, PNG y WEBP');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo debe ser menor a 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    
    clearError();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // TODO: Implementar subida real cuando OneDrive esté configurado
      console.log('🚧 Upload to OneDrive - Pending implementation');
      
      // Simular subida para demostración
      const mockUpload = new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 200);
      });

      await mockUpload;
      
      // TODO: Reemplazar con URL real de OneDrive
      const mockImageUrl = URL.createObjectURL(selectedFile);
      onImageUploaded?.(mockImageUrl);
      
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    clearError();
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Imagen del Proyecto
        </label>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            disabled={disabled || isLoading}
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isLoading}
      />

      {/* Área de drop/click */}
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
          ${disabled || isLoading 
            ? 'border-gray-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
          }
        `}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {disabled ? 'Imagen deshabilitada' : 'Haz clic para seleccionar una imagen'}
            </p>
            <p className="text-xs text-gray-500">
              JPG, JPEG, PNG, WEBP. Máximo 5MB
            </p>
          </div>
        )}
      </div>

      {/* Botón de subida (futuro) */}
      {selectedFile && !isLoading && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={disabled}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UploadIcon className="w-4 h-4" />
          Subir a OneDrive (Próximamente)
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {/* Nota sobre OneDrive */}
      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
        📋 <strong>Nota:</strong> La integración con OneDrive está preparada para futura implementación. 
        Actualmente el componente funciona localmente.
      </div>
    </div>
  );
};

export default ImageUpload;