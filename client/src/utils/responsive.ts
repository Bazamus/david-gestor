import { BREAKPOINTS, Breakpoint } from '@/hooks/useIsMobile';

// Utilidades para breakpoints
export const getBreakpoint = (width: number): Breakpoint => {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

export const isMobile = (width: number): boolean => {
  return width <= BREAKPOINTS.mobile;
};

export const isTablet = (width: number): boolean => {
  return width > BREAKPOINTS.mobile && width <= BREAKPOINTS.tablet;
};

export const isDesktop = (width: number): boolean => {
  return width > BREAKPOINTS.tablet;
};

// Utilidades para CSS classes
export const getResponsiveClasses = (baseClass: string, mobileClass?: string, tabletClass?: string, desktopClass?: string): string => {
  const classes = [baseClass];
  
  if (mobileClass) classes.push(`md:hidden ${mobileClass}`);
  if (tabletClass) classes.push(`hidden md:block lg:hidden ${tabletClass}`);
  if (desktopClass) classes.push(`hidden lg:block ${desktopClass}`);
  
  return classes.join(' ');
};

// Utilidades para touch
export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Utilidades para safe areas (notch, etc.)
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
};

// Utilidades para viewport
export const getViewportSize = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

// Utilidades para scroll
export const enableSmoothScroll = () => {
  document.documentElement.style.scrollBehavior = 'smooth';
};

export const disableSmoothScroll = () => {
  document.documentElement.style.scrollBehavior = 'auto';
};

// Utilidades para gestos táctiles
export const createSwipeHandler = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe horizontal
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Swipe vertical
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

// Utilidades para performance móvil
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
