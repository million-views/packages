"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

// React Router compatible types
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

interface NavigationLevel {
  alwaysShow: boolean;
  userToggleable?: boolean;
}

interface NavigationLevelDefaults {
  primary: NavigationLevel;
  secondary: NavigationLevel;
  tertiary: NavigationLevel;
}

type DisplayMode = "tabs" | "breadcrumbs" | "adaptive";
type NavigationLevelType = "primary" | "secondary" | "tertiary";

interface Breakpoints {
  mobile: number;
  adaptiveBreadcrumbs: number;
}

// ========================================
// Context Type Definition
// ========================================

interface NavigatorContextType {
  // Navigation data
  navigationTree: Record<string, NavTreeNode[]>;
  section: string;
  availableSections: string[];
  onSectionChange: (section: string) => void;

  // Current state
  navigationItems: NavTreeNode[];
  expandedItems: Record<string, boolean>;
  toggleExpanded: (itemId: string) => void;
  isActive: (path: string) => boolean;
  currentPath: string;

  // Active items & navigation levels
  activeItems: {
    primary: NavTreeNode | null;
    secondary: NavTreeNode | null;
    tertiary: NavTreeNode | null;
  };
  primaryItems: NavTreeNode[];
  secondaryItems: NavTreeNode[];
  tertiaryItems: NavTreeNode[];
  breadcrumbs: NavTreeNode[];

  // Display state
  isMobile: boolean;
  displayMode: DisplayMode;
  currentDisplayMode: "tabs" | "breadcrumbs";
  showAppSwitcher: boolean;
  userLevelVisibility: {
    tertiary: boolean;
  };
  toggleLevelVisibility: (level: NavigationLevelType) => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Theme and display
  darkMode: boolean;
  appTitle: string;

  // Utilities
  renderIcon: (iconName: string) => React.ReactNode;
  handleNavigation: (path: string) => void;
  shouldShowLevel: (level: NavigationLevelType, hasItems: boolean) => boolean;
  formatSectionName: (section: string) => string;
}

// ========================================
// Default Context Value
// ========================================

const defaultContext: NavigatorContextType = {
  navigationTree: {},
  section: "main",
  availableSections: [],
  onSectionChange: () => {},
  navigationItems: [],
  expandedItems: {},
  toggleExpanded: () => {},
  isActive: () => false,
  currentPath: "/",
  activeItems: {
    primary: null,
    secondary: null,
    tertiary: null,
  },
  primaryItems: [],
  secondaryItems: [],
  tertiaryItems: [],
  breadcrumbs: [],
  isMobile: false,
  displayMode: "adaptive",
  currentDisplayMode: "tabs",
  showAppSwitcher: false,
  userLevelVisibility: {
    tertiary: false,
  },
  toggleLevelVisibility: () => {},
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  closeMobileMenu: () => {},
  darkMode: false,
  appTitle: "App",
  renderIcon: () => null,
  handleNavigation: () => {},
  shouldShowLevel: () => true,
  formatSectionName: (section) => section,
};

// ========================================
// Context Creation
// ========================================

const NavigatorContext = createContext<NavigatorContextType>(defaultContext);

// Hook for using navigator context
const useNavigator = () => useContext(NavigatorContext);

// ========================================
// Helper Components - Choose/When/Otherwise
// ========================================

interface ChooseProps {
  children: React.ReactNode;
}

const Choose: React.FC<ChooseProps> = ({ children }) => {
  return <>{children}</>;
};

interface WhenProps {
  condition: boolean;
  children: React.ReactNode;
}

const When: React.FC<WhenProps> = ({ condition, children }) => {
  return condition ? <>{children}</> : null;
};

interface OtherwiseProps {
  children: React.ReactNode;
}

const Otherwise: React.FC<OtherwiseProps> = ({ children }) => {
  return <>{children}</>;
};

// ========================================
// AppSwitcher Component
// ========================================

interface AppSwitcherProps {
  className?: string;
}

const AppSwitcher: React.FC<AppSwitcherProps> = ({ className = "" }) => {
  const {
    availableSections,
    section,
    onSectionChange,
    renderIcon,
    formatSectionName,
    darkMode,
  } = useNavigator();

  const [isOpen, setIsOpen] = useState(false);

  if (availableSections.length <= 1) return null;

  return (
    <div className={`app-switcher relative ${className}`}>
      <button
        className={`app-switcher-btn flex items-center px-3 py-1 rounded-md text-sm font-medium ${
          darkMode
            ? "text-gray-200 hover:bg-gray-700"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{formatSectionName(section)}</span>
        <span className="ml-1">{renderIcon("ChevronDown")}</span>
      </button>

      {isOpen && (
        <div
          className={`app-switcher-dropdown absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <div className="py-1">
            {availableSections.map((sectionName) => (
              <button
                key={sectionName}
                className={`w-full text-left px-4 py-2 text-sm ${
                  section === sectionName
                    ? darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                    : darkMode
                    ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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

// ========================================
// Navigation List Component
// ========================================

interface NavigationListProps {
  items: NavTreeNode[];
  depth?: number;
  Link: React.ComponentType<any>;
}

const NavigationList: React.FC<NavigationListProps> = ({
  items,
  depth = 0,
  Link,
}) => {
  const {
    expandedItems,
    toggleExpanded,
    isActive,
    renderIcon,
    darkMode,
    handleNavigation,
  } = useNavigator();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul
      className={`space-y-1 ${
        depth > 0
          ? "ml-4 pl-1 border-l border-gray-200 dark:border-gray-700"
          : ""
      }`}
    >
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isItemActive = isActive(item.path);
        const isExpanded = expandedItems[item.id] || false;

        return (
          <li key={item.id}>
            <div className="flex items-center justify-between">
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  isItemActive
                    ? "bg-gray-200 dark:bg-gray-700 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                aria-current={isItemActive ? "page" : undefined}
                onClick={() => handleNavigation(item.path)}
              >
                {item.iconName && (
                  <span className="mr-2">{renderIcon(item.iconName)}</span>
                )}
                <span>{item.label}</span>
              </Link>

              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                >
                  {isExpanded
                    ? renderIcon("ChevronDown")
                    : renderIcon("ChevronRight")}
                </button>
              )}
            </div>

            {hasChildren && isExpanded && (
              <NavigationList
                items={item.children}
                depth={depth + 1}
                Link={Link}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

// ========================================
// Mobile Menu Component
// ========================================

interface MobileMenuProps {
  Link: React.ComponentType<any>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ Link }) => {
  const {
    navigationItems,
    isMobileMenuOpen,
    toggleMobileMenu,
    renderIcon,
    darkMode,
    appTitle,
  } = useNavigator();

  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={toggleMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile menu sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 overflow-y-auto shadow-lg ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className="text-lg font-semibold">{appTitle}</h2>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close navigation"
          >
            {renderIcon("X")}
          </button>
        </div>

        <div className="p-4">
          <NavigationList items={navigationItems} Link={Link} />
        </div>
      </div>
    </>
  );
};

// ========================================
// Navigation Row / Tab Bar Component
// ========================================

interface NavigationRowProps {
  items: NavTreeNode[];
  Link: React.ComponentType<any>;
  level: NavigationLevelType;
  variant?: "default" | "compact" | "pills";
  density?: "default" | "comfortable" | "compact";
  className?: string;
  ariaLabel?: string;
}

const NavigationRow: React.FC<NavigationRowProps> = ({
  items,
  Link,
  level,
  variant = "default",
  density = "default",
  className = "",
  ariaLabel,
}) => {
  const {
    isActive,
    handleNavigation,
    renderIcon,
    darkMode,
    isMobile,
    toggleMobileMenu,
    appTitle,
    shouldShowLevel,
    userLevelVisibility,
    toggleLevelVisibility,
  } = useNavigator();

  // Define styles based on navigation level
  const getLevelStyles = () => {
    switch (level) {
      case "primary":
        return {
          container: `border-b ${
            darkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`,
          height: "h-16",
          activeItem: darkMode
            ? "bg-gray-700 text-white"
            : "bg-gray-200 text-gray-900",
          inactiveItem: darkMode
            ? "text-gray-300 hover:bg-gray-800 hover:text-white"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          itemClass: "px-3 py-1 rounded-md flex items-center",
        };
      case "secondary":
        return {
          container: `border-b ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-100 border-gray-200"
          }`,
          height: "h-12",
          activeItem: `border-b-2 border-blue-500 font-medium ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`,
          inactiveItem: darkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-900",
          itemClass: "py-3 flex items-center",
        };
      case "tertiary":
        return {
          container: `border-b ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`,
          height: "h-12",
          activeItem: `border-b-2 border-blue-500 font-medium ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`,
          inactiveItem: darkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-900",
          itemClass: "py-3 flex items-center",
        };
      default:
        return {
          container: "",
          height: "",
          activeItem: "",
          inactiveItem: "",
          itemClass: "",
        };
    }
  };

  // Apply density variations
  const getDensityClass = () => {
    switch (density) {
      case "comfortable":
        return level === "primary" ? "h-14" : "h-10";
      case "compact":
        return level === "primary" ? "h-12" : "h-8";
      default:
        return getLevelStyles().height;
    }
  };

  // Apply variant-specific styles
  const getVariantItemClass = () => {
    switch (variant) {
      case "pills":
        return "rounded-full";
      case "compact":
        return "px-2";
      default:
        return "";
    }
  };

  const styles = getLevelStyles();
  const heightClass = getDensityClass();
  const variantClass = getVariantItemClass();

  // Toggle button for tertiary navigation
  const renderTertiaryToggle = () => {
    if (level !== "tertiary" || !shouldShowLevel(level, items.length > 0)) {
      return null;
    }

    return (
      <button
        onClick={() => toggleLevelVisibility("tertiary")}
        className={`ml-auto px-2 py-1 text-xs rounded-md ${
          darkMode
            ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
        }`}
      >
        {userLevelVisibility.tertiary ? "Hide options" : "Show options"}
      </button>
    );
  };

  // Check if we should render this level
  const shouldRender = level === "primary" ||
    shouldShowLevel(level, items.length > 0);
  if (!shouldRender) return null;

  return (
    <div className={`${styles.container} ${heightClass} ${className}`}>
      <div className="container mx-auto px-4 h-full flex items-center">
        <Choose>
          <When condition={level === "primary" && isMobile}>
            {/* Primary navigation in mobile view */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open navigation menu"
              >
                {renderIcon("Menu")}
              </button>
              <h1 className="text-lg font-semibold">{appTitle}</h1>
              <div className="w-10"></div> {/* Spacer to balance the layout */}
            </div>
          </When>
          <When
            condition={items.length > 0 && !(level === "primary" && isMobile)}
          >
            {/* Render navigation items */}
            <div className="flex items-center justify-between w-full">
              <nav
                className="flex items-center space-x-4 overflow-x-auto hide-scrollbar"
                aria-label={ariaLabel ||
                  `${
                    level.charAt(0).toUpperCase() + level.slice(1)
                  } Navigation`}
              >
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`${styles.itemClass} ${variantClass} ${
                      isActive(item.path)
                        ? styles.activeItem
                        : styles.inactiveItem
                    }`}
                    aria-current={isActive(item.path) ? "page" : undefined}
                  >
                    {item.iconName && (
                      <span className="mr-2">{renderIcon(item.iconName)}</span>
                    )}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {renderTertiaryToggle()}
            </div>
          </When>
          <When condition={items.length === 0 && level !== "primary"}>
            {/* Empty state for secondary/tertiary navigation */}
            <div className="h-full flex items-center text-gray-500 dark:text-gray-400">
              <span className="text-sm">
                No {level} navigation items available
              </span>
            </div>
          </When>
        </Choose>
      </div>
    </div>
  );
};

// ========================================
// Breadcrumb Component
// ========================================

interface BreadcrumbProps {
  Link: React.ComponentType<any>;
  className?: string;
}

const NavigatorBreadcrumb: React.FC<BreadcrumbProps> = ({
  Link,
  className = "",
}) => {
  const {
    breadcrumbs,
    darkMode,
    renderIcon,
    handleNavigation,
    secondaryItems,
    tertiaryItems,
  } = useNavigator();

  // Generate dropdown items for sibling navigation
  const getSiblingMenuItems = (index: number) => {
    if (index === 0) return [];

    // Get the appropriate sibling items based on level
    const siblingItems = index === 1 ? secondaryItems : tertiaryItems;

    // Filter out the current item
    return siblingItems.filter((item) => item.id !== breadcrumbs[index]?.id);
  };

  return (
    <div
      className={`h-12 flex items-center ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
      } border-b ${className}`}
    >
      <div className="container mx-auto px-4">
        <nav
          className="flex items-center space-x-2 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className={`flex items-center ${
              darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleNavigation("/")}
          >
            <span className="mr-1">{renderIcon("Home")}</span>
            <span className="sr-only">Home</span>
          </Link>

          {breadcrumbs.map((item, index) => {
            const siblingItems = getSiblingMenuItems(index);
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={item.id}>
                <span className={`text-gray-400 dark:text-gray-500`}>/</span>

                <div className="relative group">
                  <Link
                    to={item.path}
                    className={`text-sm ${
                      isLast
                        ? darkMode
                          ? "font-medium text-blue-400"
                          : "font-medium text-blue-600"
                        : darkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    aria-current={isLast ? "page" : undefined}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </Link>

                  {/* Sibling dropdown for breadcrumb items */}
                  {siblingItems.length > 0 && (
                    <div className="relative ml-1 inline-block">
                      <button
                        className={`p-1 rounded-md ${
                          darkMode
                            ? "hover:bg-gray-700 text-gray-400"
                            : "hover:bg-gray-200 text-gray-500"
                        }`}
                        aria-haspopup="true"
                      >
                        {renderIcon("ChevronDown")}
                      </button>

                      <div
                        className={`absolute left-0 mt-1 z-10 w-48 rounded-md shadow-lg hidden group-hover:block ${
                          darkMode
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="py-1">
                          {siblingItems.map((sibling) => (
                            <Link
                              key={sibling.id}
                              to={sibling.path}
                              className={`block px-4 py-2 text-sm ${
                                darkMode
                                  ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                              onClick={() => handleNavigation(sibling.path)}
                            >
                              {sibling.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// ========================================
// Main Navigator Props
// ========================================

export interface NavigatorProps {
  // Required props
  navigationTree: Record<string, NavTreeNode[]>;
  Link: React.ComponentType<any>;
  renderIcon: (iconName: string) => React.ReactNode;
  matchPath: <ParamKey extends string = string>(
    pattern: PathPattern | string,
    pathname: string,
  ) => PathMatch<ParamKey> | null;

  // Section management
  section?: string;
  onSectionChange?: (section: string) => void;
  showAppSwitcher?: boolean;

  // Optional router integration
  useLocation?: () => { pathname: string };

  // Display options
  appTitle?: string;
  logo?: React.ReactNode;
  darkMode?: boolean;

  // Display mode and breakpoints
  displayMode?: DisplayMode;
  breakpoints?: Partial<Breakpoints>;

  // Navigation level defaults
  navigationLevelDefaults?: Partial<NavigationLevelDefaults>;

  // Customization
  className?: string;

  // Behavior
  onSearch?: () => void;
  initialExpandedItems?: Record<string, boolean>;
}

// ========================================
// Main Navigator Component
// ========================================

export const Navigator: React.FC<NavigatorProps> = ({
  // Required props
  navigationTree,
  Link,
  renderIcon,
  matchPath,

  // Section management
  section = "main",
  onSectionChange,
  showAppSwitcher = true,

  // Optional router integration
  useLocation,

  // Display options
  appTitle = "Navigator Demo",
  logo,
  darkMode = false,

  // Display mode and breakpoints
  displayMode = "adaptive",
  breakpoints = {},

  // Navigation level defaults
  navigationLevelDefaults = {},

  // Customization
  className = "",

  // Behavior
  onSearch,
  initialExpandedItems = {},
}) => {
  // ----------------------------------------
  // State Management
  // ----------------------------------------

  // Merge default breakpoints with provided ones
  const mergedBreakpoints: Breakpoints = {
    mobile: breakpoints.mobile || 768,
    adaptiveBreadcrumbs: breakpoints.adaptiveBreadcrumbs || 1024,
  };

  // Merge default navigation level settings with provided ones
  const mergedNavigationLevelDefaults: NavigationLevelDefaults = {
    primary: {
      alwaysShow: true,
      ...(navigationLevelDefaults.primary || {}),
    },
    secondary: {
      alwaysShow: true,
      ...(navigationLevelDefaults.secondary || {}),
    },
    tertiary: {
      alwaysShow: false,
      userToggleable: true,
      ...(navigationLevelDefaults.tertiary || {}),
    },
  };

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<
    "tabs" | "breadcrumbs"
  >(
    displayMode === "breadcrumbs" ? "breadcrumbs" : "tabs",
  );

  // Navigation state
  const [expandedItems, setExpandedItems] = useState(initialExpandedItems);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userLevelVisibility, setUserLevelVisibility] = useState({
    tertiary: false,
  });
  const [currentSection, setCurrentSection] = useState(section);
  const [activePathState, setActivePathState] = useState<string | null>(null);

  // Element refs
  const containerRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------
  // Handle section changes
  // ----------------------------------------

  // Update section state when prop changes
  useEffect(() => {
    setCurrentSection(section);
  }, [section]);

  // Handle section changes
  const handleSectionChange = useCallback((newSection: string) => {
    setCurrentSection(newSection);
    if (onSectionChange) {
      onSectionChange(newSection);
    }
  }, [onSectionChange]);

  // ----------------------------------------
  // Router integration
  // ----------------------------------------

  // Get current path from location
  const location = useLocation ? useLocation() : { pathname: "/" };
  const pathname = location.pathname;

  // Set current path from pathname
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // ----------------------------------------
  // Responsive behavior
  // ----------------------------------------

  // Setup responsive detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < mergedBreakpoints.mobile);

      if (displayMode === "adaptive") {
        setCurrentDisplayMode(
          width < mergedBreakpoints.adaptiveBreadcrumbs
            ? "breadcrumbs"
            : "tabs",
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayMode, mergedBreakpoints]);

  // ----------------------------------------
  // Navigation helpers
  // ----------------------------------------

  // Toggle expanded state for mobile menu items
  const toggleExpanded = useCallback((itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Toggle visibility for navigation levels
  const toggleLevelVisibility = useCallback((level: NavigationLevelType) => {
    if (level === "tertiary") {
      setUserLevelVisibility((prev) => ({
        ...prev,
        tertiary: !prev.tertiary,
      }));
    }
  }, []);

  // Check if a path is active
  const isActive = useCallback(
    (path: string) => {
      if (!path) return false;
      if (path === "/" && currentPath === "/") return true;
      if (path === currentPath) return true;

      // Use the provided matchPath function for parameterized routes
      const match = matchPath(path, currentPath);
      return match !== null;
    },
    [currentPath, matchPath],
  );

  // Handle navigation
  const handleNavigation = useCallback(
    (path: string) => {
      // Store the active path to ensure proper navigation state
      setActivePathState(path);

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
    [isMobileMenuOpen],
  );

  // Format section name for display
  const formatSectionName = useCallback((sectionKey: string) => {
    return sectionKey.charAt(0).toUpperCase() +
      sectionKey.slice(1).replace(/-/g, " ");
  }, []);

  // Determine if a navigation level should be shown
  const shouldShowLevel = useCallback(
    (level: NavigationLevelType, hasItems: boolean) => {
      const levelDefaults = mergedNavigationLevelDefaults[level];

      if (level === "primary") return true;

      if (level === "tertiary" && levelDefaults.userToggleable) {
        return hasItems && userLevelVisibility.tertiary;
      }

      return hasItems || levelDefaults.alwaysShow;
    },
    [mergedNavigationLevelDefaults, userLevelVisibility],
  );

  // ----------------------------------------
  // Process navigation tree
  // ----------------------------------------

  // Get available sections
  const availableSections = useMemo(() => {
    return Object.keys(navigationTree);
  }, [navigationTree]);

  // Determine if app switcher should be shown
  const showAppSwitcherState = useMemo(() => {
    return showAppSwitcher && availableSections.length > 1;
  }, [showAppSwitcher, availableSections]);

  // Get navigation items for the selected section
  const navigationItems = useMemo(() => {
    return navigationTree[currentSection] || [];
  }, [navigationTree, currentSection]);

  // Find active items at each level
  const {
    activeItems,
    primaryItems,
    secondaryItems,
    tertiaryItems,
    breadcrumbs,
  } = useMemo(() => {
    let activePrimary: NavTreeNode | null = null;
    let activeSecondary: NavTreeNode | null = null;
    let activeTertiary: NavTreeNode | null = null;
    const breadcrumbs: NavTreeNode[] = [];

    // Get all primary items
    const primaryItems = navigationItems;

    // Helper function to find if a path is active or a parent of the active path
    const isPathActiveOrParent = (path: string) => {
      if (isActive(path)) return true;
      // Check if the current path starts with this path followed by a slash
      // This ensures we match parent paths correctly
      return path !== "/" && (currentPath + "/").startsWith(path + "/");
    };

    // Find active primary item
    for (const item of primaryItems) {
      if (isPathActiveOrParent(item.path)) {
        activePrimary = item;
        breadcrumbs.push(item);
        break;
      }
    }

    // Get secondary items and find active secondary item
    let secondaryItems: NavTreeNode[] = [];
    if (activePrimary?.children?.length) {
      secondaryItems = activePrimary.children;

      for (const item of secondaryItems) {
        if (isPathActiveOrParent(item.path)) {
          activeSecondary = item;
          breadcrumbs.push(item);
          break;
        }
      }
    }

    // Get tertiary items and find active tertiary item
    let tertiaryItems: NavTreeNode[] = [];
    if (activeSecondary?.children?.length) {
      tertiaryItems = activeSecondary.children;

      for (const item of tertiaryItems) {
        if (isActive(item.path)) {
          activeTertiary = item;
          breadcrumbs.push(item);
          break;
        }
      }
    }

    return {
      activeItems: {
        primary: activePrimary,
        secondary: activeSecondary,
        tertiary: activeTertiary,
      },
      primaryItems,
      secondaryItems,
      tertiaryItems,
      breadcrumbs,
    };
  }, [navigationItems, isActive, currentPath, activePathState]);

  // ----------------------------------------
  // Context value
  // ----------------------------------------

  // Build context value
  const contextValue = useMemo(
    () => ({
      // Navigation data
      navigationTree,
      section: currentSection,
      availableSections,
      onSectionChange: handleSectionChange,

      // Current state
      navigationItems,
      expandedItems,
      toggleExpanded,
      isActive,
      currentPath,

      // Active items & navigation levels
      activeItems,
      primaryItems,
      secondaryItems,
      tertiaryItems,
      breadcrumbs,

      // Display state
      isMobile,
      displayMode,
      currentDisplayMode,
      showAppSwitcher: showAppSwitcherState,
      userLevelVisibility,
      toggleLevelVisibility,

      // Mobile menu
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,

      // Theme and display
      darkMode,
      appTitle,

      // Utilities
      renderIcon,
      handleNavigation,
      shouldShowLevel,
      formatSectionName,
    }),
    [
      navigationTree,
      currentSection,
      availableSections,
      handleSectionChange,
      navigationItems,
      expandedItems,
      toggleExpanded,
      isActive,
      currentPath,
      activeItems,
      primaryItems,
      secondaryItems,
      tertiaryItems,
      breadcrumbs,
      isMobile,
      displayMode,
      currentDisplayMode,
      showAppSwitcherState,
      userLevelVisibility,
      toggleLevelVisibility,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      darkMode,
      appTitle,
      renderIcon,
      handleNavigation,
      shouldShowLevel,
      formatSectionName,
    ],
  );

  // ----------------------------------------
  // Render component
  // ----------------------------------------

  return (
    <NavigatorContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`navigator ${darkMode ? "dark" : ""} ${className}`}
      >
        {/* Primary Navigation with App Switcher */}
        <div className="primary-navigation-container">
          <NavigationRow
            items={primaryItems}
            Link={Link}
            level="primary"
            ariaLabel="Primary Navigation"
            className="flex items-center justify-between"
          />

          {/* Conditionally show app switcher in primary nav */}
          {!isMobile && showAppSwitcherState && (
            <div className="absolute top-0 right-4 h-16 flex items-center">
              <AppSwitcher />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <MobileMenu Link={Link} />}

        {/* Choose between tabs or breadcrumbs based on displayMode */}
        {currentDisplayMode === "tabs"
          ? (
            <>
              {/* Secondary Navigation (always visible when it has items) */}
              <NavigationRow
                items={secondaryItems}
                Link={Link}
                level="secondary"
                ariaLabel="Secondary Navigation"
              />

              {/* Tertiary Navigation (conditionally visible) */}
              <NavigationRow
                items={tertiaryItems}
                Link={Link}
                level="tertiary"
                ariaLabel="Tertiary Navigation"
              />
            </>
          )
          : (
            /* Breadcrumb Navigation */
            breadcrumbs.length > 0 && (
              <NavigatorBreadcrumb
                Link={Link}
                className={`border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              />
            )
          )}
      </div>
    </NavigatorContext.Provider>
  );
};

// ========================================
// Exports
// ========================================

export { Choose, Otherwise, useNavigator, When };
export default Navigator;
