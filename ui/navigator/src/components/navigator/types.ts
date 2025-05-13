// types.ts
import React from "react";

// ========================================
// Navigation Structure Types
// ========================================

export interface NavTreeNode {
  id: string;
  path: string;
  label: string;
  iconName?: string;
  end?: boolean;
  children?: NavTreeNode[];
}

// ========================================
// Router Integration Types
// ========================================

export interface PathPattern {
  path: string;
  caseSensitive?: boolean;
  end?: boolean;
}

export type Params<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

export interface PathMatch<ParamKey extends string = string> {
  params: Params<ParamKey>;
  pathname: string;
  pattern: PathPattern;
}

export interface RouterAdapter {
  Link: React.ComponentType<any>;
  matchPath: <ParamKey extends string = string>(
    pattern: PathPattern | string,
    pathname: string,
  ) => PathMatch<ParamKey> | null;
  useLocation: () => { pathname: string };
  navigate?: (to: string) => void;
}

// ========================================
// Display & Configuration Types
// ========================================

export type DisplayMode = "tabs" | "breadcrumbs" | "adaptive";

export interface NavigationLevelDefaults {
  primary?: {
    alwaysShow?: boolean;
    userToggleable?: boolean;
  };
  secondary?: {
    alwaysShow?: boolean;
    userToggleable?: boolean;
  };
  tertiary?: {
    alwaysShow?: boolean;
    userToggleable?: boolean;
  };
}

// ========================================
// Action Types
// ========================================

export interface UserAction {
  id: string;
  label: string;
  iconName?: string;
  onClick: () => void;
}

export interface ActionGroup {
  label: string;
  iconName?: string;
  items: UserAction[];
}

// ========================================
// Component Props Types
// ========================================

export interface SearchProps {
  onSearch: () => void;
  renderIcon: (name: string) => React.ReactNode;
  className?: string;
}

export interface AppSwitcherProps {
  section: string;
  availableSections: string[];
  onSectionChange: (section: string) => void;
  renderIcon: (name: string) => React.ReactNode;
  formatSectionName: (section: string) => string;
  className?: string;
}

export interface ActionsProps {
  items: UserAction[] | ActionGroup;
  renderIcon: (name: string) => React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  logo?: React.ReactNode;
  appTitle: string;
  search?: boolean | React.ReactNode;
  onSearch?: () => void;
  appSwitcher?: boolean | React.ReactNode;
  actions?: UserAction[] | ActionGroup | React.ReactNode;
  className?: string;
  sticky?: boolean;
  darkMode?: boolean;
}

export interface NavigatorProps {
  // Required props
  navigationTree: Record<string, NavTreeNode[]>;
  router: RouterAdapter;

  // Section management
  section?: string;
  onSectionChange?: (section: string) => void;

  // Display configuration
  darkMode?: boolean;
  displayMode?: DisplayMode;

  // Header elements
  logo?: React.ReactNode;
  appTitle?: string;
  search?: boolean | React.ReactNode;
  onSearch?: () => void;
  appSwitcher?: boolean | React.ReactNode;
  actions?: UserAction[] | ActionGroup | React.ReactNode;

  // Customization
  headerProps?: Omit<HeaderProps, 'logo' | 'appTitle' | 'search' | 'onSearch' | 'appSwitcher' | 'actions' | 'darkMode'>;
  navigationLevelDefaults?: NavigationLevelDefaults;

  // Icons
  renderIcon?: (name: string) => React.ReactNode;

  // Theme
  theme?: string;
}

// ========================================
// Context Type
// ========================================

export interface NavigatorContextType {
  // Navigation data
  navigationTree: Record<string, NavTreeNode[]>;
  section: string;
  availableSections: string[];
  onSectionChange: (section: string) => void;

  // Routing
  router: RouterAdapter;

  // Theme and display
  darkMode: boolean;
  displayMode: DisplayMode;

  // Utilities
  renderIcon: (iconName: string) => React.ReactNode;
  formatSectionName: (section: string) => string;
}