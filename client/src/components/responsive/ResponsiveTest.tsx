import React, { useState } from 'react';
import { useIsMobile, useOrientation } from '@/hooks/useIsMobile';
import { isTouchDevice, getViewportSize } from '@/utils/responsive';
import { DeviceInfoPanel } from './DeviceDetector';
import { MobileOnly, DesktopOnly, TabletOnly } from './ResponsiveWrapper';
import MobileModal from '../mobile/MobileModal';
import MobileDrawer from '../mobile/MobileDrawer';
import MobileTabs from '../mobile/MobileTabs';

const ResponsiveTest: React.FC = () => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint, width } = useIsMobile();
  const orientation = useOrientation();
  const touchDevice = isTouchDevice();
  const viewport = getViewportSize();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const testTabs = [
    {
      id: 'tab1',
      label: 'Información',
      content: (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Información del Dispositivo</h3>
          <DeviceInfoPanel />
        </div>
      ),
    },
    {
      id: 'tab2',
      label: 'Componentes',
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Componentes Móviles</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary w-full"
            >
              Abrir Modal Móvil
            </button>
            
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="btn btn-secondary w-full"
            >
              Abrir Drawer Móvil
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'tab3',
      label: 'Responsive',
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Renderizado Responsivo</h3>
          
          <MobileOnly>
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                Este contenido solo se muestra en dispositivos móviles
              </p>
            </div>
          </MobileOnly>
          
          <TabletOnly>
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                Este contenido solo se muestra en tablets
              </p>
            </div>
          </TabletOnly>
          
          <DesktopOnly>
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                Este contenido solo se muestra en desktop
              </p>
            </div>
          </DesktopOnly>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Prueba de Responsive Design</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verificando que la detección de dispositivos y componentes móviles funcionen correctamente
        </p>
      </div>

      {/* Información del dispositivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Detección de Dispositivo</h3>
          </div>
          <div className="card-content space-y-2">
            <div className="flex justify-between">
              <span>Breakpoint actual:</span>
              <span className="font-medium text-blue-600">{currentBreakpoint}</span>
            </div>
            <div className="flex justify-between">
              <span>Ancho de pantalla:</span>
              <span className="font-medium">{width}px</span>
            </div>
            <div className="flex justify-between">
              <span>Orientación:</span>
              <span className="font-medium text-green-600">{orientation}</span>
            </div>
            <div className="flex justify-between">
              <span>Dispositivo táctil:</span>
              <span className="font-medium text-purple-600">{touchDevice ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Estado del Dispositivo</h3>
          </div>
          <div className="card-content">
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isMobile ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                Móvil
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isTablet ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}>
                Tablet
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDesktop ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                Desktop
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Viewport</h3>
          </div>
          <div className="card-content space-y-2">
            <div className="flex justify-between">
              <span>Ancho:</span>
              <span className="font-medium">{viewport.width}px</span>
            </div>
            <div className="flex justify-between">
              <span>Alto:</span>
              <span className="font-medium">{viewport.height}px</span>
            </div>
            <div className="flex justify-between">
              <span>Aspect ratio:</span>
              <span className="font-medium">{(viewport.width / viewport.height).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de prueba */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Componentes Móviles de Prueba</h3>
        </div>
        <div className="card-content">
          <MobileTabs tabs={testTabs} variant="pills" />
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Instrucciones de Prueba</h3>
        </div>
        <div className="card-content space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Para probar la responsividad:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Redimensiona la ventana del navegador</li>
              <li>Usa las herramientas de desarrollador (F12) y cambia el tamaño</li>
              <li>Prueba en diferentes dispositivos reales</li>
              <li>Verifica que los componentes se adapten correctamente</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Breakpoints configurados:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li><strong>Móvil:</strong> ≤ 480px</li>
              <li><strong>Tablet:</strong> 481px - 768px</li>
              <li><strong>Desktop:</strong> ≥ 769px</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modales y Drawers */}
      <MobileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal de Prueba"
        size="md"
      >
        <div className="space-y-4">
          <p>Este es un modal optimizado para dispositivos móviles.</p>
          <p>Se adapta automáticamente al tamaño de la pantalla y previene el scroll del body.</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn btn-primary w-full"
          >
            Cerrar Modal
          </button>
        </div>
      </MobileModal>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Drawer de Prueba"
        position="left"
        size="md"
      >
        <div className="space-y-4 p-4">
          <p>Este es un drawer lateral optimizado para dispositivos móviles.</p>
          <p>Se desliza desde el lado izquierdo y incluye un overlay.</p>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="btn btn-primary w-full"
          >
            Cerrar Drawer
          </button>
        </div>
      </MobileDrawer>
    </div>
  );
};

export default ResponsiveTest;
