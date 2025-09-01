import React from 'react';
import { DownloadIcon, XIcon } from 'lucide-react';
import { usePWA } from './PWAProvider';

const InstallPrompt: React.FC = () => {
  const { canInstall, isInstalled, showInstallPrompt } = usePWA();

  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <DownloadIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">
            📱 Instalar David Gestor
          </h3>
          <p className="text-xs text-blue-100 mb-3">
            Instala la aplicación para acceder más rápido y usar sin conexión
          </p>
          <div className="flex space-x-2">
            <button
              onClick={showInstallPrompt}
              className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              Instalar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-100 hover:text-white text-xs transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
