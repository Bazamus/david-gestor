import React from 'react';
import { SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <SettingsIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Esta página está en desarrollo. Pronto podrás personalizar tu experiencia.
        </p>
      </div>
    </div>
  );
};

export default Settings;