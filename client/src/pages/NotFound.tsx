import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';
import Button from '@/components/common/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary">404</h1>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Página no encontrada
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            Volver atrás
          </Button>
          
          <Button
            variant="primary"
            icon={<HomeIcon className="w-4 h-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;