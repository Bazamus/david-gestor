import React from 'react';
import { RefreshCwIcon, XIcon } from 'lucide-react';
import { usePWA } from './PWAProvider';

const UpdatePrompt: React.FC = () => {
  const { updateAvailable, skipWaiting } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <RefreshCwIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">
            🔄 Nueva versión disponible
          </h3>
          <p className="text-xs text-green-100 mb-3">
            Hay una nueva versión de David Gestor disponible
          </p>
          <div className="flex space-x-2">
            <button
              onClick={skipWaiting}
              className="bg-white text-green-600 px-3 py-1 rounded text-xs font-medium hover:bg-green-50 transition-colors"
            >
              Actualizar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-green-100 hover:text-white text-xs transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
