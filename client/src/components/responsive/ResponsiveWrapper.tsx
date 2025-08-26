import React, { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface ResponsiveWrapperProps {
  children: ReactNode;
  mobileComponent?: ReactNode;
  tabletComponent?: ReactNode;
  desktopComponent?: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente wrapper que renderiza diferentes versiones según el dispositivo
 * Mantiene la funcionalidad desktop intacta mientras proporciona versiones móviles
 */
const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobileComponent,
  tabletComponent,
  desktopComponent,
  fallback,
}) => {
  const { isMobile, isTablet, isDesktop } = useIsMobile();

  // Si se proporcionan componentes específicos, usarlos
  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>;
  }

  if (isTablet && tabletComponent) {
    return <>{tabletComponent}</>;
  }

  if (isDesktop && desktopComponent) {
    return <>{desktopComponent}</>;
  }

  // Si no hay componentes específicos, usar el fallback o children
  if (fallback) {
    return <>{fallback}</>;
  }

  // Por defecto, renderizar children (versión desktop)
  return <>{children}</>;
};

/**
 * Hook para crear componentes responsivos de manera más simple
 */
export const useResponsiveComponent = (
  mobileComponent: ReactNode,
  desktopComponent: ReactNode
) => {
  const { isMobile } = useIsMobile();
  return isMobile ? mobileComponent : desktopComponent;
};

/**
 * Componente para renderizar contenido solo en móvil
 */
export const MobileOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isMobile } = useIsMobile();
  return isMobile ? <>{children}</> : null;
};

/**
 * Componente para renderizar contenido solo en desktop
 */
export const DesktopOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDesktop } = useIsMobile();
  return isDesktop ? <>{children}</> : null;
};

/**
 * Componente para renderizar contenido solo en tablet
 */
export const TabletOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isTablet } = useIsMobile();
  return isTablet ? <>{children}</> : null;
};

/**
 * Componente para renderizar contenido en móvil y tablet
 */
export const MobileAndTablet: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isMobile, isTablet } = useIsMobile();
  return (isMobile || isTablet) ? <>{children}</> : null;
};

/**
 * Componente para renderizar contenido en tablet y desktop
 */
export const TabletAndDesktop: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isTablet, isDesktop } = useIsMobile();
  return (isTablet || isDesktop) ? <>{children}</> : null;
};

export default ResponsiveWrapper;
