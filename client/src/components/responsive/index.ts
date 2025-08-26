// Componentes responsivos
export { default as ResponsiveWrapper } from './ResponsiveWrapper';
export { default as DeviceDetector } from './DeviceDetector';
export { DeviceInfoPanel, useDeviceInfo } from './DeviceDetector';

// Componentes de renderizado condicional
export { 
  MobileOnly, 
  DesktopOnly, 
  TabletOnly, 
  MobileAndTablet, 
  TabletAndDesktop,
  useResponsiveComponent 
} from './ResponsiveWrapper';

// Hooks responsivos
export { 
  useIsMobile, 
  useIsMobileSimple, 
  useOrientation,
  BREAKPOINTS,
  type Breakpoint 
} from '@/hooks/useIsMobile';

// Utilidades responsivas
export {
  getBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
  getResponsiveClasses,
  isTouchDevice,
  getSafeAreaInsets,
  getViewportSize,
  enableSmoothScroll,
  disableSmoothScroll,
  createSwipeHandler,
  debounce,
  throttle
} from '@/utils/responsive';
