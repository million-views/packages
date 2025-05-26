// file: next/context/Navigator.tsx
// Navigator context provider with enhanced functionality

import React, {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  NavigationItem,
  NavigationSection,
  RouterAdapter,
  ThemeConfig,
} from "../types";
import { type ResponsiveState, useResponsive } from "../hooks/useResponsive";
import { resolveTheme } from "../theme/utils";

export interface NavigatorContextValue {
  // Navigation state
  navigation: NavigationSection[];
  activeSection: string | null;
  activeItem: NavigationItem | null;

  // Mobile menu state
  isDrawerOpen: boolean;

  // Actions
  actions: {
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    openAppSwitcher: () => void;
    closeAppSwitcher: () => void;
    toggleAppSwitcher: () => void;
  };

  // Search state
  isSearchOpen: boolean;

  // App switcher state
  isAppSwitcherOpen: boolean;

  // Router
  router: RouterAdapter;

  // Responsive state
  responsive: ResponsiveState;

  // Icon rendering
  renderIcon: (
    nameOrIcon: React.ReactNode,
    size?: number,
  ) => React.ReactNode;

  // Theme
  theme: ThemeConfig;
}

interface NavigatorProviderProps {
  children: ReactNode;
  navigation: NavigationSection[];
  router: RouterAdapter;
  responsiveConfig?: any;
  renderIcon: (nameOrIcon: React.ReactNode, size?: number) => React.ReactNode;
  theme?: string | ThemeConfig;
  themeOverrides?: Partial<ThemeConfig>;
}

export const NavigatorContext = createContext<NavigatorContextValue | null>(
  null,
);

export function NavigatorProvider({
  children,
  navigation,
  router,
  responsiveConfig,
  renderIcon,
  theme,
  themeOverrides,
}: NavigatorProviderProps) {
  // State for mobile menu
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);

  // Actions object for better encapsulation
  const actions = useMemo(() => ({
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    toggleDrawer: () => setIsDrawerOpen((prev) => !prev),
    openSearch: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false),
    toggleSearch: () => setIsSearchOpen((prev) => !prev),
    openAppSwitcher: () => setIsAppSwitcherOpen(true),
    closeAppSwitcher: () => setIsAppSwitcherOpen(false),
    toggleAppSwitcher: () => setIsAppSwitcherOpen((prev) => !prev),
  }), []);

  // Get responsive state
  const responsive = useResponsive(responsiveConfig);

  // Get theme
  const resolvedTheme = useMemo(() => resolveTheme(theme, themeOverrides), [
    theme,
    themeOverrides,
  ]);

  // Get current location
  const { pathname } = router.useLocation();

  // Find active section and item
  const { activeSection, activeItem } = useMemo(() => {
    let currentSection: string | null = null;
    let currentItem: NavigationItem | null = null;

    // Helper to check if a path is active
    const isPathActive = (path: string) => {
      if (path === pathname) return true;

      // Use matchPath for more complex path matching
      if (router.matchPath) {
        const match = router.matchPath(path, pathname);
        return match !== null;
      }

      // Simple prefix matching if matchPath not available
      return path !== "/" && pathname.startsWith(path);
    };

    // Find active section and item
    for (const section of navigation) {
      for (const item of section.items) {
        if (isPathActive(item.path)) {
          currentSection = section.id;
          currentItem = item;
          break;
        }

        // Check children if any
        if (item.children) {
          for (const child of item.children) {
            if (isPathActive(child.path)) {
              currentSection = section.id;
              currentItem = child;
              break;
            }
          }
        }
      }

      if (currentItem) break;
    }

    return {
      activeSection: currentSection,
      activeItem: currentItem,
    };
  }, [navigation, pathname, router]);

  // Close drawer when pathname changes
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Context value
  const contextValue = useMemo<NavigatorContextValue>(() => ({
    navigation,
    activeSection,
    activeItem,
    isDrawerOpen,
    isSearchOpen,
    isAppSwitcherOpen,
    actions,
    router,
    responsive,
    renderIcon,
    theme: resolvedTheme,
  }), [
    navigation,
    activeSection,
    activeItem,
    isDrawerOpen,
    isSearchOpen,
    isAppSwitcherOpen,
    actions,
    router,
    responsive,
    renderIcon,
    resolvedTheme,
  ]);

  return (
    <NavigatorContext.Provider value={contextValue}>
      {children}
    </NavigatorContext.Provider>
  );
}

/**
 * Hook for using Navigator context
 */
export function useNavigator(): NavigatorContextValue {
  const context = useContext(NavigatorContext);

  if (!context) {
    throw new Error("useNavigator must be used within a NavigatorProvider");
  }

  return context;
}
