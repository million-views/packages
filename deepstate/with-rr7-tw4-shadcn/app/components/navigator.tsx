"use client";

import React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { NavTreeNode } from "@m5nv/rr-builder";
import { Choose, Otherwise, When } from "./cwo";

// React Router types
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

// Context type definition
interface NavigatorContextType {
  navigationItems: NavTreeNode[];
  expandedItems: Record<string, boolean>;
  toggleExpanded: (itemId: string) => void;
  isActive: (path: string) => boolean;
  currentPath: string;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  darkMode: boolean;
  renderIcon: (iconName: string) => React.ReactNode;
  activeItems: {
    primary: NavTreeNode | null;
    secondary: NavTreeNode | null;
    tertiary: NavTreeNode | null;
  };
  secondaryItems: NavTreeNode[];
  tertiaryItems: NavTreeNode[];
  breadcrumbs: NavTreeNode[];
  handleNavigation: (path: string) => void;
  appTitle: string;
}

// Default context values
const defaultContext: NavigatorContextType = {
  navigationItems: [],
  expandedItems: {},
  toggleExpanded: () => {},
  isActive: () => false,
  currentPath: "/",
  isMobile: false,
  isMobileMenuOpen: false,
  toggleMobileMenu: () => {},
  darkMode: false,
  renderIcon: () => null,
  activeItems: {
    primary: null,
    secondary: null,
    tertiary: null,
  },
  secondaryItems: [],
  tertiaryItems: [],
  breadcrumbs: [],
  handleNavigation: () => {},
  appTitle: "App",
};

// Create context
const NavigatorContext = createContext<NavigatorContextType>(defaultContext);

// Hook for using navigator context
const useNavigator = () => useContext(NavigatorContext);

// Navigation List Component
interface NavigationListProps {
  items: NavTreeNode[];
  depth?: number;
  Link: React.ComponentType<any>;
}

const NavigationList: React.FC<NavigationListProps> = (
  { items, depth = 0, Link },
) => {
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
        const isExpanded = expandedItems[item.id || ""] || false;

        return (
          <li key={item.id || item.path}>
            <div className="flex items-center justify-between">
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  isItemActive
                    ? "bg-gray-200 dark:bg-gray-700 font-medium"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                aria-current={isItemActive ? "page" : undefined}
                onClick={() => handleNavigation(item.path)} // Add this line to close the mobile menu
              >
                <When condition={!!item.iconName}>
                  {item.iconName && renderIcon(item.iconName)}
                </When>
                <span>{item.label}</span>
              </Link>

              <When condition={hasChildren}>
                <button
                  onClick={() => toggleExpanded(item.id || item.path)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
                >
                  {isExpanded
                    ? renderIcon("ChevronDown")
                    : renderIcon("ChevronRight")}
                </button>
              </When>
            </div>

            <When condition={hasChildren && isExpanded}>
              <NavigationList
                items={item.children || []}
                depth={depth + 1}
                Link={Link}
              />
            </When>
          </li>
        );
      })}
    </ul>
  );
};

// Mobile Menu Component
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
  } = useNavigator();

  if (!isMobileMenuOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile menu */}
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
          <h2 className="text-lg font-semibold">Navigation</h2>
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

// Unified Navigation Row Component
interface NavigationRowProps {
  items: NavTreeNode[];
  Link: React.ComponentType<any>;
  level: "primary" | "secondary" | "tertiary";
  className?: string;
  ariaLabel?: string;
}

const NavigationRow: React.FC<NavigationRowProps> = ({
  items,
  Link,
  level,
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
    currentPath,
    appTitle,
  } = useNavigator();

  // Define styles based on navigation level
  const getLevelStyles = () => {
    switch (level) {
      case "primary":
        return {
          container: `border-b h-16 flex items-center ${
            darkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          }`,
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
          container: `border-b h-12 flex items-center ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-100 border-gray-200"
          }`,
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
          container: `border-b h-12 flex items-center ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-200"
          }`,
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
          activeItem: "",
          inactiveItem: "",
          itemClass: "",
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="container mx-auto px-4">
        <Choose>
          <When condition={level === "primary" && isMobile}>
            {/* Render the primary navigation in mobile view */}
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
            <nav
              className="flex items-center space-x-6 overflow-x-auto"
              aria-label={ariaLabel ||
                `${level.charAt(0).toUpperCase() + level.slice(1)} Navigation`}
            >
              {items.map((item) => (
                <Link
                  key={item.id || item.path}
                  to={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`${styles.itemClass} ${
                    isActive(item.path)
                      ? styles.activeItem
                      : styles.inactiveItem
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  <When condition={!!item.iconName}>
                    {item.iconName && renderIcon(item.iconName)}
                  </When>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </When>
          <When condition={items.length === 0 && level !== "primary"}>
            {/* Render empty state */}
            <div className="h-full flex items-center text-gray-500 dark:text-gray-400">
            </div>
          </When>
        </Choose>
      </div>
    </div>
  );
};

// Breadcrumb Component
interface BreadcrumbProps {
  Link: React.ComponentType<any>;
  homeIcon: React.ReactNode;
  className?: string;
}

const NavigatorBreadcrumb: React.FC<BreadcrumbProps> = (
  { Link, homeIcon, className = "" },
) => {
  const { breadcrumbs, darkMode } = useNavigator();

  return (
    <div className={`h-12 flex items-center ${className}`}>
      <div className="container mx-auto px-4">
        <nav
          className="flex items-center space-x-2 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {homeIcon}
            <span>Home</span>
          </Link>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.id || item.path}>
              <span className="text-gray-400 dark:text-gray-500">/</span>
              <Link
                to={item.path}
                className={`text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${
                  index === breadcrumbs.length - 1 ? "font-medium" : ""
                }`}
                aria-current={index === breadcrumbs.length - 1
                  ? "page"
                  : undefined}
              >
                {item.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Navigator Props
export interface NavigatorProps {
  // Required props
  navigationTree: Record<string, NavTreeNode[]>;
  section?: string;
  Link: React.ComponentType<any>;
  renderIcon: (iconName: string) => React.ReactNode;
  matchPath: <ParamKey extends string = string>(
    pattern: PathPattern | string,
    pathname: string,
  ) => PathMatch<ParamKey> | null;

  // Optional router integration
  useLocation?: () => { pathname: string };

  // Display options
  appTitle?: string;
  logo?: React.ReactNode;
  darkMode?: boolean;
  mobileBreakpoint?: number;

  // Customization
  className?: string;

  // Behavior
  onSearch?: () => void;
  initialExpandedItems?: Record<string, boolean>;

  // New options
  alwaysShowSecondaryNav?: boolean;
  alwaysShowTertiaryNav?: boolean;
  showMobileBreadcrumbs?: boolean;
}

// Main Navigator Component
export const Navigator: React.FC<NavigatorProps> = ({
  navigationTree,
  section = "main",
  Link,
  renderIcon,
  matchPath,
  useLocation,
  appTitle = "Navigator Demo",
  logo,
  darkMode = false,
  mobileBreakpoint = 768,
  className = "",
  onSearch,
  initialExpandedItems = {},
  alwaysShowSecondaryNav = true,
  alwaysShowTertiaryNav = true,
  showMobileBreadcrumbs = true,
}) => {
  // State
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(initialExpandedItems);
  const [activePathState, setActivePathState] = useState<string | null>(null);

  // Get current path
  // Use the location hook unconditionally
  const location = useLocation ? useLocation() : { pathname: "/" };
  const pathname = location.pathname;

  // Moved inside the component to avoid conditional hook call
  // Use the location hook unconditionally
  const [currentPath, setCurrentPath] = useState(pathname);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Set up responsive behavior
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileBreakpoint]);

  // Get navigation items for the selected section
  const navigationItems = useMemo(() => {
    return navigationTree[section] || [];
  }, [navigationTree, section]);

  // Toggle expanded state
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

  // Check if a path is active
  const isActive = useCallback(
    (path: string) => {
      if (!path) return false;
      if (path === "/") return currentPath === "/";
      if (path === currentPath) return true;

      // Use the provided matchPath function for parameterized routes
      const match = matchPath<string>(path, currentPath);
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

  // Find active items at each level
  const { activeItems, secondaryItems, tertiaryItems, breadcrumbs } = useMemo(
    () => {
      let activePrimary: NavTreeNode | null = null;
      let activeSecondary: NavTreeNode | null = null;
      let activeTertiary: NavTreeNode | null = null;
      let secondaryItems: NavTreeNode[] = [];
      let tertiaryItems: NavTreeNode[] = [];
      const breadcrumbs: NavTreeNode[] = [];

      // Helper function to find if a path is active or a parent of the active path
      const isPathActiveOrParent = (path: string) => {
        if (isActive(path)) return true;
        // Check if the current path starts with this path followed by a slash
        // This ensures we match parent paths correctly
        return path !== "/" && (currentPath + "/").startsWith(path + "/");
      };

      // Find active primary item
      for (const item of navigationItems) {
        if (isPathActiveOrParent(item.path)) {
          activePrimary = item;
          breadcrumbs.push(item);
          break;
        }
      }

      // Get secondary items from active primary
      if (activePrimary?.children?.length) {
        secondaryItems = activePrimary.children;

        // Find active secondary item
        for (const item of secondaryItems) {
          if (isPathActiveOrParent(item.path)) {
            activeSecondary = item;
            breadcrumbs.push(item);
            break;
          }
        }

        // Get tertiary items from active secondary
        if (activeSecondary?.children?.length) {
          tertiaryItems = activeSecondary.children;

          // Find active tertiary item
          for (const item of tertiaryItems) {
            if (isActive(item.path)) {
              activeTertiary = item;
              breadcrumbs.push(item);
              break;
            }
          }
        }
      }

      return {
        activeItems: {
          primary: activePrimary,
          secondary: activeSecondary,
          tertiary: activeTertiary,
        },
        secondaryItems,
        tertiaryItems,
        breadcrumbs,
      };
    },
    [navigationItems, isActive, currentPath, activePathState],
  ); // Added activePathState to dependencies

  // Context value
  const contextValue = useMemo(
    () => ({
      navigationItems,
      expandedItems,
      toggleExpanded,
      isActive,
      currentPath,
      isMobile,
      isMobileMenuOpen,
      toggleMobileMenu,
      darkMode,
      renderIcon,
      handleNavigation,
      activeItems,
      secondaryItems,
      tertiaryItems,
      breadcrumbs,
      appTitle,
    }),
    [
      navigationItems,
      expandedItems,
      toggleExpanded,
      isActive,
      currentPath,
      isMobile,
      isMobileMenuOpen,
      toggleMobileMenu,
      darkMode,
      renderIcon,
      handleNavigation,
      activeItems,
      secondaryItems,
      tertiaryItems,
      breadcrumbs,
      appTitle,
    ],
  );

  return (
    <NavigatorContext.Provider value={contextValue}>
      <div className={`${darkMode ? "dark" : ""} ${className}`}>
        {/* Primary Navigation */}
        <NavigationRow
          items={navigationItems}
          Link={Link}
          level="primary"
          ariaLabel="Primary Navigation"
          className="flex items-center justify-between"
        />

        {/* Mobile Menu */}
        <When condition={isMobileMenuOpen}>
          <MobileMenu Link={Link} />
        </When>

        {/* Secondary Navigation - show in mobile and desktop */}
        <When condition={secondaryItems.length >= 0}>
          <NavigationRow
            items={secondaryItems}
            Link={Link}
            level="secondary"
            ariaLabel="Secondary Navigation"
          />
        </When>

        {/* Tertiary Navigation - only show in desktop */}
        <When condition={!isMobile && tertiaryItems.length > 0}>
          <NavigationRow
            items={tertiaryItems}
            Link={Link}
            level="tertiary"
            ariaLabel="Tertiary Navigation"
          />
        </When>

        {/* Breadcrumb Navigation - show in mobile only if showMobileBreadcrumbs is true */}
        <When
          condition={breadcrumbs.length > 0 &&
            (showMobileBreadcrumbs || isMobile)}
        >
          <NavigatorBreadcrumb
            Link={Link}
            homeIcon={renderIcon("Home")}
            className={`border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          />
        </When>
      </div>
    </NavigatorContext.Provider>
  );
};
