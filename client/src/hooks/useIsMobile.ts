import { useState, useEffect } from 'react';

// Breakpoints configurables
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
  width: number;
}

export const useIsMobile = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    currentBreakpoint: 'desktop',
    width: 0,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      
      let currentBreakpoint: Breakpoint = 'desktop';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = false;

      if (width <= BREAKPOINTS.mobile) {
        currentBreakpoint = 'mobile';
        isMobile = true;
      } else if (width <= BREAKPOINTS.tablet) {
        currentBreakpoint = 'tablet';
        isTablet = true;
      } else {
        currentBreakpoint = 'desktop';
        isDesktop = true;
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        currentBreakpoint,
        width,
      });
    };

    // Verificación inicial
    checkDevice();

    // Event listener para cambios de tamaño
    window.addEventListener('resize', checkDevice);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return deviceInfo;
};

// Hook simplificado que solo retorna si es móvil
export const useIsMobileSimple = (): boolean => {
  const { isMobile } = useIsMobile();
  return isMobile;
};

// Hook para detectar orientación
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  return orientation;
};
