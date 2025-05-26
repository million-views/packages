// file: next/types/index.ts
// Core type definitions for the new Navigator API

import type { ReactNode, ComponentType } from 'react';

// =========================================
// Brand Types
// =========================================

export interface BrandConfig {
  /**
   * Logo element to display in the header
   */
  logo?: ReactNode;

  /**
   * Application title
   */
  title: string;

  /**
   * URL to navigate to when logo/title is clicked
   */
  url?: string;

  /**
   * Additional content to display in the brand area
   */
  extra?: ReactNode;
}

// =========================================
// Navigation Types
// =========================================

export interface NavigationSection {
  /**
   * Unique identifier for the section
   */
  id: string;

  /**
   * Optional display label for the section (used in mobile menus)
   */
  label?: string;

  /**
   * Whether to show a visual separator before this section
   */
  separator?: boolean;

  /**
   * Navigation items in this section
   */
  items: NavigationItem[];
}

export interface NavigationItem {
  /**
   * Unique identifier for the item
   */
  id: string;

  /**
   * Display label for the item
   */
  label: string;

  /**
   * Route path for the item
   */
  path: string;

  /**
   * Icon name or element for this item
   */
  icon?: string | ReactNode;

  /**
   * Whether to match the path exactly
   */
  exact?: boolean;

  /**
   * Whether to show this item on mobile
   */
  mobileVisible?: boolean;

  /**
   * Whether to show this item on desktop
   */
  desktopVisible?: boolean;

  /**
   * Actions to show when this item is active
   */
  contextActions?: Action[];

  /**
   * Child navigation items (for nested navigation)
   */
  children?: NavigationItem[];
}

// =========================================
// Action Types
// =========================================

export interface Action {
  /**
   * Unique identifier for the action
   */
  id: string;

  /**
   * Icon name or element for this action
   */
  icon?: string | ReactNode;

  /**
   * Display label for the action
   */
  label?: string;

  /**
   * Position of the action in the header
   */
  position?: 'left' | 'right' | 'center';

  /**
   * Type of action display
   */
  type?: 'icon' | 'button' | 'text' | 'menu';

  /**
   * Visual variant for button types
   */
  variant?: 'default' | 'primary' | 'secondary' | 'text';

  /**
   * Click handler for the action
   */
  onClick?: () => void;

  /**
   * URL for the action (alternative to onClick)
   */
  href?: string;

  /**
   * Child actions for menu types
   */
  children?: Action[];
}

// =========================================
// Responsive Types
// =========================================

export interface ResponsiveConfig {
  /**
   * Mobile configuration
   */
  mobile?: BreakpointConfig;

  /**
   * Tablet configuration
   */
  tablet?: BreakpointConfig;

  /**
   * Desktop configuration
   */
  desktop?: BreakpointConfig;
}

export interface BreakpointConfig {
  /**
   * Maximum width for this breakpoint in pixels
   */
  breakpoint?: number;

  /**
   * How to display primary navigation
   */
  primaryNav?: 'drawer' | 'tabs' | 'hidden';

  /**
   * How to display category navigation
   */
  categoryNav?: 'tabs' | 'dropdown' | 'hidden';

  /**
   * Brand area configuration for this breakpoint
   */
  brand?: BrandBreakpointConfig;

  /**
   * Actions configuration for this breakpoint
   */
  actions?: ActionsBreakpointConfig;
}

export interface BrandBreakpointConfig {
  /**
   * Whether to truncate the title
   */
  truncateTitle?: boolean;

  /**
   * Whether to show a menu icon
   */
  useIcon?: boolean;

  /**
   * Whether to center the brand
   */
  centered?: boolean;

  /**
   * Whether the brand area takes full width
   */
  fullWidth?: boolean;
}

export interface ActionsBreakpointConfig {
  /**
   * Which action IDs to show
   */
  visible?: string[];

  /**
   * Which action IDs to combine into a menu
   */
  overflowMenu?: string[];
}

// =========================================
// Theme Types
// =========================================

export interface ThemeConfig {
  /**
   * Color values
   */
  colors: {
    primary: string;
    surface: string;
    navSeparator: string;
    activeTabIndicator: string;
    activeTabBackground: string;
    text: string;
    textMuted: string;
    buttonPrimary?: string;
    buttonPrimaryText?: string;
    [key: string]: string | undefined;
  };

  /**
   * Typography configuration
   */
  typography: {
    fontFamily: string;
    headerSize: string;
    navSize: string;
    fontWeightNormal: number;
    fontWeightBold: number;
    [key: string]: string | number;
  };

  /**
   * Spacing values
   */
  spacing: {
    headerHeight: string;
    navItemPadding: string;
    sectionSpacing: string;
    sidebarWidth?: string;
    [key: string]: string | undefined;
  };

  /**
   * Border styles
   */
  borders: {
    navSeparator: string;
    radius: string;
    [key: string]: string;
  };

  /**
   * Transition styles
   */
  transitions: {
    navHover: string;
    menuExpand: string;
    [key: string]: string;
  };
}

// =========================================
// Router Types
// =========================================

export interface RouterAdapter {
  /**
   * Link component from the router
   */
  Link: ComponentType<any>;

  /**
   * Function to match a path against the current location
   */
  matchPath: (pattern: any, pathname: string) => any | null;

  /**
   * Hook to get the current location
   */
  useLocation: () => { pathname: string };

  /**
   * Optional function to navigate programmatically
   */
  navigate?: (to: string) => void;
}

// =========================================
// Component Props Types
// =========================================

export interface NavigatorProps {
  /**
   * Brand configuration
   */
  brand: BrandConfig;

  /**
   * Navigation structure
   */
  navigation: NavigationSection[];

  /**
   * Global actions
   */
  actions?: Action[];

  /**
   * Responsive configuration
   */
  responsive?: ResponsiveConfig;

  /**
   * Theme name or configuration
   */
  theme?: string | ThemeConfig;

  /**
   * Theme override values
   */
  themeOverrides?: Partial<ThemeConfig>;

  /**
   * Router adapter
   */
  router: RouterAdapter;

  /**
   * Icon renderer function (required)
   * Takes a string name or ReactNode and returns a ReactNode
   */
  renderIcon: (nameOrIcon: ReactNode, size?: number) => ReactNode;

  /**
   * Children for component composition
   */
  children?: ReactNode;
}

export interface HeaderProps {
  /**
   * Content to render inside the header
   */
  children?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;
}

export interface BrandProps {
  /**
   * Brand configuration object
   */
  brand?: BrandConfig;

  /**
   * Logo element to display
   */
  logo?: ReactNode;

  /**
   * Title text
   */
  title?: string;

  /**
   * URL to navigate to when clicked
   */
  url?: string;

  /**
   * Additional content
   */
  extra?: ReactNode;

  /**
   * Whether to truncate the title
   */
  truncate?: boolean;

  /**
   * Additional CSS class names
   */
  className?: string;
}

export interface DrawerProps {
  /** 
   * Mode of operation: "temporary" (overlay) or "persistent" (fixed) 
   */
  mode?: "temporary" | "persistent";

  /** 
   * Whether the drawer is open (only used in temporary mode) 
   */
  isOpen?: boolean;

  /** 
   * Close handler (only used in temporary mode) 
   */
  onClose?: () => void;

  /** 
   * Position of the drawer 
   */
  position?: "left" | "right";

  /** 
   * Width of the drawer 
   */
  width?: string;

  /** 
   * Whether to collapse to icons only (persistent mode) 
   */
  collapsed?: boolean;

  /** 
   * Content 
   */
  children?: ReactNode;

  /** 
   * Additional classes 
   */
  className?: string;

  /**
   * Header title for drawer
   */
  title?: string;
}

export interface ActionsProps {
  /**
   * Array of action items
   */
  actions?: Action[];

  /**
   * Custom button/icon rendering
   */
  children?: ReactNode;

  /**
   * Display mode
   */
  mode?: 'default' | 'overflow' | 'expanded';

  /**
   * Which action IDs to show
   */
  visibleActions?: string[];

  /**
   * Which action IDs to combine into menu
   */
  overflowActions?: string[];

  /**
   * Additional CSS class names
   */
  className?: string;
}

export interface ContentProps {
  /**
   * Content to render
   */
  children?: ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;

  /**
   * Whether content should be padded
   */
  padded?: boolean;
}