import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const skipWaiting = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setUpdateAvailable(false);
          window.location.reload();
        }
      });
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
