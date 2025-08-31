import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  aspectRatio: number;
  shouldUseMobileView: boolean; // Combined logic for adaptive rendering
}

export function useDeviceAdaptive(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    isPortrait: true,
    isLandscape: false,
    aspectRatio: 1,
    shouldUseMobileView: false
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      const isTouchSupported = 'ontouchstart' in window ||
                              navigator.maxTouchPoints > 0;
      const isTouchAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Orientation detection based on aspect ratio
      const isPortrait = aspectRatio < 1;
      const isLandscape = aspectRatio >= 1;

      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isDesktop = width >= TABLET_BREAKPOINT;

      // Adaptive mobile view logic:
      // - Mobile devices: Always mobile view
      // - Tablets in Portrait: Mobile view
      // - Tablets in Landscape: Desktop view
      // - Desktop: Always desktop view
      const shouldUseMobileView = isMobile || (isTablet && isPortrait);

      const newDeviceInfo: DeviceInfo = {
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice: isTouchSupported || isTouchAgent,
        isPortrait,
        isLandscape,
        aspectRatio,
        shouldUseMobileView
      };

      setDeviceInfo(newDeviceInfo);
    };

    // Initial check
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);

    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return deviceInfo;
}

export function useIsMobile() {
  return useDeviceAdaptive().isMobile;
}

export function useIsTablet() {
  return useDeviceAdaptive().isTablet;
}

export function useIsDesktop() {
  return useDeviceAdaptive().isDesktop;
}

// Utility hook for responsive conditional rendering
export function useBreakpoint() {
  const { isMobile, isTablet, isDesktop } = useDeviceAdaptive();

  return {
    aboveMobile: !isMobile,
    aboveTablet: isDesktop,
    belowDesktop: !isDesktop,
    onlyMobile: isMobile,
    onlyTablet: isTablet && !isMobile,
    onlyDesktop: isDesktop
  };
}

// Legacy hook compatibility
export { useDeviceAdaptive as useAdaptive };
