import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/pwa/PWAProvider';

export const PWAUpdatePrompt: React.FC = () => {
  const { updateAvailable, skipWaiting } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  const handleUpdate = () => {
    skipWaiting();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <RefreshCw className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">
              Actualización Disponible
            </h3>
          </div>
          <p className="text-sm text-blue-100 mb-3">
            Una nueva versión de la aplicación está disponible. Actualiza para obtener las últimas mejoras.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Actualizar
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-blue-100 hover:text-white text-sm font-medium transition-colors"
            >
              Después
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-blue-200 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
