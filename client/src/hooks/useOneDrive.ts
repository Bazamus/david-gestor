// ======================================
// HOOK ONEDRIVE - PREPARACIÓN FUTURA
// ======================================

import { useState, useCallback } from 'react';
import { onedriveService } from '@/services/onedriveService';
import { OneDriveFileInfo, OneDriveFolderInfo, OneDriveUploadOptions } from '@/types';

interface UseOneDriveState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

interface UseOneDriveActions {
  authenticate: () => Promise<boolean>;
  createProjectFolder: (projectName: string) => Promise<OneDriveFolderInfo | null>;
  uploadProjectImage: (options: OneDriveUploadOptions) => Promise<OneDriveFileInfo | null>;
  getSharedLink: (fileId: string) => Promise<string | null>;
  clearError: () => void;
  resetUploadProgress: () => void;
}

export const useOneDrive = (): UseOneDriveState & UseOneDriveActions => {
  const [state, setState] = useState<UseOneDriveState>({
    isAuthenticated: false,
    isLoading: false,
    error: null,
    uploadProgress: 0,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, uploadProgress: progress }));
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await onedriveService.authenticate();
      setState(prev => ({ ...prev, isAuthenticated: success }));
      return success;
    } catch (error) {
      setError(`Error de autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const createProjectFolder = useCallback(async (projectName: string): Promise<OneDriveFolderInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const folderInfo = await onedriveService.createProjectFolder(projectName);
      return folderInfo;
    } catch (error) {
      setError(`Error creando carpeta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const uploadProjectImage = useCallback(async (options: OneDriveUploadOptions): Promise<OneDriveFileInfo | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const uploadOptions: OneDriveUploadOptions = {
        ...options,
        onProgress: (progress) => {
          setProgress(progress);
          options.onProgress?.(progress);
        },
        onComplete: (fileInfo) => {
          setProgress(100);
          options.onComplete?.(fileInfo);
        },
        onError: (error) => {
          setError(error);
          options.onError?.(error);
        }
      };

      const fileInfo = await onedriveService.uploadProjectImage(uploadOptions);
      return fileInfo;
    } catch (error) {
      const errorMessage = `Error subiendo imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setProgress]);

  const getSharedLink = useCallback(async (fileId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const link = await onedriveService.getSharedLink(fileId);
      return link;
    } catch (error) {
      setError(`Error obteniendo enlace: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const resetUploadProgress = useCallback(() => {
    setProgress(0);
  }, [setProgress]);

  return {
    ...state,
    authenticate,
    createProjectFolder,
    uploadProjectImage,
    getSharedLink,
    clearError,
    resetUploadProgress,
  };
};