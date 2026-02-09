import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

// Importación condicional para evitar errores de TypeScript
let registerSW: any;
try {
  registerSW = require('virtual:pwa-register').registerSW;
} catch {
  // Fallback para desarrollo
  registerSW = () => () => {};
}

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  updateAvailable: boolean;
  installPrompt: any;
  showInstallPrompt: () => void;
  skipWaiting: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

interface PWAProviderProps {
  children: React.ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Ref para almacenar la función updateSW retornada por registerSW.
  // Esta es la forma CORRECTA de triggear la actualización con vite-plugin-pwa.
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  // Registrar Service Worker
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setUpdateAvailable(true);
      },
      onOfflineReady() {
        console.log('Aplicación lista para uso offline');
      },
      onRegistered(swRegistration: any) {
        console.log('Service Worker registrado:', swRegistration);
      },
      onRegisterError(error: any) {
        console.error('Error al registrar Service Worker:', error);
      },
    });

    // Guardar referencia para usarla en skipWaiting
    updateSWRef.current = updateSW;

    return () => {
      updateSW();
    };
  }, []);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar si la app está instalada
  useEffect(() => {
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  // Detectar prompt de instalación
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  const skipWaiting = async () => {
    // Usar la función updateSW de vite-plugin-pwa (forma correcta)
    // Esto envía SKIP_WAITING al SW en espera y recarga la página.
    if (updateSWRef.current) {
      try {
        setUpdateAvailable(false);
        await updateSWRef.current(true); // true = recargar página tras activar el nuevo SW
      } catch (error) {
        console.error('Error al actualizar SW:', error);
        // Fallback: recargar la página directamente
        window.location.reload();
      }
    } else {
      // Fallback manual si updateSW no está disponible
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        setUpdateAvailable(false);
        window.location.reload();
      }
    }
  };

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    canInstall,
    updateAvailable,
    installPrompt,
    showInstallPrompt,
    skipWaiting,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
    </PWAContext.Provider>
  );
};
