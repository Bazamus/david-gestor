import React from 'react';
import { WifiOffIcon } from 'lucide-react';
import { usePWA } from './PWAProvider';

const OfflineBanner: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <WifiOffIcon className="w-4 h-4" />
        <span>
          📶 Estás offline. Algunas funciones pueden no estar disponibles.
        </span>
      </div>
    </div>
  );
};

export default OfflineBanner;
