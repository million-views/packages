// Navigator.tsx
import { createContext, useContext, useMemo, useState } from "react";
import { NavigationHeader } from "./header";
import { NavigationTiers } from "./tiers";

// ========================================
// Type Definitions
// ========================================

export interface NavTreeNode {
  id: string;
  path: string;
  label: string;
  iconName?: string;
  end?: boolean;
  children?: NavTreeNode[];
}

// Router integration types
interface PathPattern {
  path: string;
  caseSensitive?: boolean;
  end?: boolean;
}

type Params<Key extends string = string> = {
  readonly [key in Key]: string | undefined;
};

interface PathMatch<ParamKey extends string = string> {
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

export type DisplayMode = "tabs" | "breadcrumbs" | "adaptive";

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

export interface UserAction {
  id: string;
  label: string;
  iconName?: string;
  onClick: () => void;
}

export interface ActionsProps {
  items: UserAction[];
  renderIcon: (name: string) => React.ReactNode;
  className?: string;
}

export interface HeaderProps {
  logo?: React.ReactNode;
  appTitle: string;
  search?: boolean | React.ReactNode;
  onSearch?: () => void;
  appSwitcher?: boolean | React.ReactNode;
  actions?: UserAction[] | React.ReactNode;
  className?: string;
  sticky?: boolean;
  darkMode?: boolean;
}

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
// Context Type Definition
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

// ========================================
// Context Creation
// ========================================

// Create context with null as default value for fail-fast pattern
const NavigatorContext = createContext<NavigatorContextType | null>(null);

// Custom hook for using navigator context with validation
export const useNavigator = () => {
  const context = useContext(NavigatorContext);
  if (context === null) {
    throw new Error("useNavigator must be used within a Navigator component");
  }
  return context;
};

// ========================================
// Navigator Props
// ========================================

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
  actions?: UserAction[] | React.ReactNode;

  // Customization
  headerProps?: Omit<
    HeaderProps,
    | "logo"
    | "appTitle"
    | "search"
    | "onSearch"
    | "appSwitcher"
    | "actions"
    | "darkMode"
  >;
  navigationLevelDefaults?: NavigationLevelDefaults;

  // Icons
  renderIcon?: (iconName: string) => React.ReactNode;

  // Theme
  theme?: string;
}

// ========================================
// Exported Components for Customization
// ========================================

export const NavigatorSearch: React.FC<SearchProps> = ({
  onSearch,
  renderIcon,
  className = "",
}) => {
  if (!onSearch) {
    throw new Error("NavigatorSearch: onSearch function is required");
  }

  if (!renderIcon) {
    throw new Error("NavigatorSearch: renderIcon function is required");
  }

  return (
    <button
      onClick={onSearch}
      className={`nav-btn nav-btn-light dark:nav-btn-dark mr-2 ${className}`}
      aria-label="Search"
    >
      {renderIcon("Search")}
    </button>
  );
};

export const NavigatorAppSwitcher: React.FC<AppSwitcherProps> = ({
  section,
  availableSections,
  onSectionChange,
  renderIcon,
  formatSectionName,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!onSectionChange) {
    throw new Error(
      "NavigatorAppSwitcher: onSectionChange function is required",
    );
  }

  if (!renderIcon) {
    throw new Error("NavigatorAppSwitcher: renderIcon function is required");
  }

  if (!formatSectionName) {
    throw new Error(
      "NavigatorAppSwitcher: formatSectionName function is required",
    );
  }

  if (availableSections.length <= 1) return null;

  return (
    <div className={`nav-app-switcher ${className}`}>
      <button
        className="nav-app-switcher-btn nav-app-switcher-btn-light dark:nav-app-switcher-btn-dark"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{formatSectionName(section)}</span>
        <span className="nav-app-switcher-icon">
          {renderIcon("ChevronDown")}
        </span>
      </button>

      {isOpen && (
        <div className="nav-dropdown nav-dropdown-light dark:nav-dropdown-dark">
          <div className="nav-dropdown-container">
            {availableSections.map((sectionName) => (
              <button
                key={sectionName}
                className={`nav-dropdown-item ${
                  section === sectionName
                    ? "nav-dropdown-item-active-light dark:nav-dropdown-item-active-dark"
                    : "nav-dropdown-item-light dark:nav-dropdown-item-dark"
                }`}
                onClick={() => {
                  onSectionChange(sectionName);
                  setIsOpen(false);
                }}
              >
                {formatSectionName(sectionName)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const NavigatorActions: React.FC<ActionsProps> = ({
  items,
  renderIcon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) return null;

  if (!renderIcon) {
    throw new Error("NavigatorActions: renderIcon function is required");
  }

  // Single action button
  if (items.length === 1) {
    const action = items[0];
    return (
      <button
        className={`nav-btn-primary nav-btn-primary-light dark:nav-btn-primary-dark ${className}`}
        onClick={action.onClick}
      >
        {action.iconName && (
          <span className="mr-1">{renderIcon(action.iconName)}</span>
        )}
        <span>{action.label}</span>
      </button>
    );
  }

  // Multiple actions dropdown
  return (
    <div className={`nav-actions-menu ${className}`}>
      <button
        className="nav-actions-btn nav-actions-btn-light dark:nav-actions-btn-dark"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="mr-1">{renderIcon("User")}</span>
        <span className="hidden sm:inline">Account</span>
        <span className="ml-1">{renderIcon("ChevronDown")}</span>
      </button>

      {isOpen && (
        <div className="nav-dropdown nav-dropdown-light dark:nav-dropdown-dark">
          <div className="nav-dropdown-container">
            {items.map((action) => (
              <button
                key={action.id}
                className="nav-dropdown-item nav-dropdown-item-light dark:nav-dropdown-item-dark"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.iconName && (
                  <span className="nav-dropdown-item-icon">
                    {renderIcon(action.iconName)}
                  </span>
                )}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================
// Main Navigator Component
// ========================================

export const Navigator: React.FC<NavigatorProps> = ({
  // Required props
  navigationTree,
  router,

  // Section management
  section = "main",
  onSectionChange,

  // Display configuration
  darkMode = false,
  displayMode = "adaptive",

  // Header elements
  logo,
  appTitle = "Application",
  search = false,
  onSearch,
  appSwitcher = true,
  actions = [],

  // Customization
  headerProps = {},
  navigationLevelDefaults = {},

  // Icons
  renderIcon = (name) => <span>{name}</span>,

  // Theme
  theme = "",
}) => {
  // Validate required props
  if (!navigationTree) {
    throw new Error("Navigator: navigationTree is required");
  }

  if (!router) {
    throw new Error("Navigator: router is required");
  }

  if (!router.Link) {
    throw new Error("Navigator: router.Link is required");
  }

  if (!router.matchPath) {
    throw new Error("Navigator: router.matchPath is required");
  }

  if (!router.useLocation) {
    throw new Error("Navigator: router.useLocation is required");
  }

  // Default section change handler
  const handleSectionChange = onSectionChange || ((newSection) => {
    console.warn(
      `Navigator: No onSectionChange handler provided for section change to "${newSection}"`,
    );
  });

  // Helper function to format section names
  const formatSectionName = (sectionKey: string) => {
    return sectionKey.charAt(0).toUpperCase() +
      sectionKey.slice(1).replace(/-/g, " ");
  };

  // Get available sections
  const availableSections = useMemo(() => Object.keys(navigationTree), [
    navigationTree,
  ]);

  // Create context value
  const contextValue = useMemo(
    () => ({
      navigationTree,
      section,
      availableSections,
      onSectionChange: handleSectionChange,
      router,
      darkMode,
      displayMode,
      renderIcon,
      formatSectionName,
    }),
    [
      navigationTree,
      section,
      availableSections,
      handleSectionChange,
      router,
      darkMode,
      displayMode,
      renderIcon,
    ],
  );

  // Get theme class
  const themeClass = theme ? `nav-theme-${theme}` : "";

  return (
    <NavigatorContext.Provider value={contextValue}>
      <div className={`nav-container ${darkMode ? "dark" : ""} ${themeClass}`}>
        <NavigationHeader
          logo={logo}
          appTitle={appTitle}
          search={search}
          onSearch={onSearch}
          appSwitcher={appSwitcher}
          actions={actions}
          darkMode={darkMode}
          {...headerProps}
        />
        <NavigationTiers
          navigationLevelDefaults={navigationLevelDefaults}
        />
      </div>
    </NavigatorContext.Provider>
  );
};

export default Navigator;
