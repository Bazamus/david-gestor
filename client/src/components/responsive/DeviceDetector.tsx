import React from 'react';
import { useIsMobile, useOrientation } from '@/hooks/useIsMobile';
import { isTouchDevice, getViewportSize } from '@/utils/responsive';

interface DeviceDetectorProps {
  showInfo?: boolean;
  children?: React.ReactNode;
}

/**
 * Componente para detectar y mostrar información del dispositivo
 * Útil para debugging y desarrollo
 */
const DeviceDetector: React.FC<DeviceDetectorProps> = ({ 
  showInfo = false, 
  children 
}) => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint, width } = useIsMobile();
  const orientation = useOrientation();
  const touchDevice = isTouchDevice();
  const viewport = getViewportSize();

  // Solo mostrar información en desarrollo
  if (!showInfo || process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  return (
    <div className="device-detector">
      {children}
      
      {/* Panel de información del dispositivo */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs z-50 max-w-xs">
        <div className="font-bold mb-2">Device Info</div>
        <div className="space-y-1">
          <div>Breakpoint: <span className="text-yellow-400">{currentBreakpoint}</span></div>
          <div>Width: <span className="text-green-400">{width}px</span></div>
          <div>Height: <span className="text-green-400">{viewport.height}px</span></div>
          <div>Orientation: <span className="text-blue-400">{orientation}</span></div>
          <div>Touch: <span className="text-purple-400">{touchDevice ? 'Yes' : 'No'}</span></div>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs ${isMobile ? 'bg-red-500' : 'bg-gray-500'}`}>
              Mobile
            </span>
            <span className={`px-2 py-1 rounded text-xs ${isTablet ? 'bg-yellow-500' : 'bg-gray-500'}`}>
              Tablet
            </span>
            <span className={`px-2 py-1 rounded text-xs ${isDesktop ? 'bg-green-500' : 'bg-gray-500'}`}>
              Desktop
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para obtener información del dispositivo
 */
export const useDeviceInfo = () => {
  const deviceInfo = useIsMobile();
  const orientation = useOrientation();
  const touchDevice = isTouchDevice();
  const viewport = getViewportSize();

  return {
    ...deviceInfo,
    orientation,
    touchDevice,
    viewport,
  };
};

/**
 * Componente para mostrar información del dispositivo en tiempo real
 */
export const DeviceInfoPanel: React.FC = () => {
  const deviceInfo = useDeviceInfo();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      <h3 className="text-lg font-semibold mb-3">Device Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Current Breakpoint:</span>
          <span className="font-medium text-blue-600">{deviceInfo.currentBreakpoint}</span>
        </div>
        <div className="flex justify-between">
          <span>Screen Width:</span>
          <span className="font-medium">{deviceInfo.width}px</span>
        </div>
        <div className="flex justify-between">
          <span>Screen Height:</span>
          <span className="font-medium">{deviceInfo.viewport.height}px</span>
        </div>
        <div className="flex justify-between">
          <span>Orientation:</span>
          <span className="font-medium text-green-600">{deviceInfo.orientation}</span>
        </div>
        <div className="flex justify-between">
          <span>Touch Device:</span>
          <span className="font-medium text-purple-600">{deviceInfo.touchDevice ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span>Device Type:</span>
          <span className="font-medium">
            {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs ${deviceInfo.isMobile ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
            Mobile
          </span>
          <span className={`px-2 py-1 rounded text-xs ${deviceInfo.isTablet ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            Tablet
          </span>
          <span className={`px-2 py-1 rounded text-xs ${deviceInfo.isDesktop ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            Desktop
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetector;
