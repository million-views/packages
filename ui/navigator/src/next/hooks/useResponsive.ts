// file: next/hooks/useResponsive.ts
// Hook for responsive behavior management

import { useMemo } from "react";
import type { BreakpointConfig, ResponsiveConfig } from "../types";
import { useMediaQuery } from "./useMediaQuery";

// Default breakpoint values
const DEFAULT_BREAKPOINTS: ResponsiveConfig = {
  mobile: {
    breakpoint: 767,
    primaryNav: "drawer",
    categoryNav: "tabs",
    brand: {
      truncateTitle: true,
      useIcon: true,
    },
  },
  tablet: {
    breakpoint: 1023,
    primaryNav: "tabs",
    categoryNav: "tabs",
  },
  desktop: {
    primaryNav: "tabs",
    categoryNav: "tabs",
  },
};

export interface ResponsiveState {
  /**
   * Whether the current viewport is mobile
   */
  isMobile: boolean;

  /**
   * Whether the current viewport is tablet
   */
  isTablet: boolean;

  /**
   * Whether the current viewport is desktop
   */
  isDesktop: boolean;

  /**
   * The current breakpoint name
   */
  currentBreakpoint: "mobile" | "tablet" | "desktop";

  /**
   * The current breakpoint configuration
   */
  currentConfig: BreakpointConfig;
}

/**
 * Hook for handling responsive behavior based on breakpoints
 */
export function useResponsive(config?: ResponsiveConfig): ResponsiveState {
  // Get the merged configuration
  const responsiveConfig = useMemo<{
    mobile: BreakpointConfig;
    tablet: BreakpointConfig;
    desktop: BreakpointConfig;
  }>(() => {
    return {
      mobile: { ...DEFAULT_BREAKPOINTS.mobile, ...config?.mobile },
      tablet: { ...DEFAULT_BREAKPOINTS.tablet, ...config?.tablet },
      desktop: { ...DEFAULT_BREAKPOINTS.desktop, ...config?.desktop },
    };
  }, [config]);

  // Get breakpoint values
  const mobileBreakpoint = responsiveConfig.mobile?.breakpoint || 767;
  const tabletBreakpoint = responsiveConfig.tablet?.breakpoint || 1023;

  // Use media queries for each breakpoint
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${
      mobileBreakpoint + 1
    }px) and (max-width: ${tabletBreakpoint}px)`,
  );
  const isDesktop = useMediaQuery(`(min-width: ${tabletBreakpoint + 1}px)`);

  // Determine current breakpoint and config
  // Using SSR-safe logic that works even if media queries aren't available yet
  let currentBreakpoint: "mobile" | "tablet" | "desktop" = "desktop";
  let currentConfig = responsiveConfig.desktop;

  if (isMobile) {
    currentBreakpoint = "mobile";
    currentConfig = responsiveConfig.mobile;
  } else if (isTablet) {
    currentBreakpoint = "tablet";
    currentConfig = responsiveConfig.tablet;
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    currentConfig,
  };
}
