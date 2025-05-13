// NavigationTiers.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigator } from "./context";
import { Choose, Otherwise, When } from "./cwo";
import type { NavigationLevelDefaults, NavTreeNode } from "./types";

type NavigationLevelType = "primary" | "secondary" | "tertiary";

interface NavigationTiersProps {
  navigationLevelDefaults?: NavigationLevelDefaults;
  className?: string;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

// Complete Navigation Level Defaults with sensible values
const completeNavigationLevelDefaults = (
  defaults?: NavigationLevelDefaults,
): Required<NavigationLevelDefaults> => {
  return {
    primary: {
      alwaysShow: true,
      userToggleable: false,
      ...(defaults?.primary || {}),
    },
    secondary: {
      alwaysShow: true,
      userToggleable: false,
      ...(defaults?.secondary || {}),
    },
    tertiary: {
      alwaysShow: false,
      userToggleable: true,
      ...(defaults?.tertiary || {}),
    },
  };
};

// Navigation Row Component (for tabs)
interface NavigationRowProps {
  items: NavTreeNode[];
  level: NavigationLevelType;
  className?: string;
}

const NavigationRow: React.FC<NavigationRowProps> = ({
  items,
  level,
  className = "",
}) => {
  const {
    router,
    darkMode,
    renderIcon,
  } = useNavigator();

  const { Link, useLocation } = router;
  const { pathname } = useLocation();

  // Check if a path is active
  const isActive = (path: string) => {
    if (!path) return false;
    if (path === "/" && pathname === "/") return true;

    if (path === pathname) return true;

    // Use matchPath for parameterized routes
    const match = router.matchPath(path, pathname);
    return match !== null;
  };

  return (
    <div
      className={`nav-row nav-row-${level} ${
        darkMode ? `nav-row-${level}-dark` : `nav-row-${level}-light`
      } ${className}`}
    >
      <div className="nav-row-inner">
        {items.length > 0
          ? (
            <nav
              className="nav-items"
              aria-label={`${
                level.charAt(0).toUpperCase() + level.slice(1)
              } Navigation`}
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-item nav-item-${level} ${
                    isActive(item.path)
                      ? darkMode
                        ? `nav-item-active-${level}-dark`
                        : `nav-item-active-${level}-light`
                      : darkMode
                      ? `nav-item-inactive-${level}-dark`
                      : `nav-item-inactive-${level}-light`
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  {item.iconName && (
                    <span className="nav-item-icon">
                      {renderIcon(item.iconName)}
                    </span>
                  )}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )
          : (
            <div
              className={`nav-row-empty ${
                darkMode ? "nav-row-empty-dark" : "nav-row-empty-light"
              }`}
            >
              <span className="text-sm">
                No {level} navigation items available
              </span>
            </div>
          )}
      </div>
    </div>
  );
};

// Breadcrumb Component
interface BreadcrumbProps {
  items: NavTreeNode[];
  className?: string;
}

const NavigationBreadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = "",
}) => {
  const {
    router,
    darkMode,
    renderIcon,
  } = useNavigator();

  const { Link } = router;

  return (
    <div
      className={`nav-breadcrumb ${
        darkMode ? "nav-breadcrumb-dark" : "nav-breadcrumb-light"
      } ${className}`}
    >
      <div className="nav-breadcrumb-inner">
        <nav className="nav-breadcrumb-items" aria-label="Breadcrumb">
          <Link to="/" className="nav-breadcrumb-home">
            <span className="mr-1">{renderIcon("Home")}</span>
            <span className="sr-only">Home</span>
          </Link>

          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <span className="nav-breadcrumb-separator">/</span>

              <Link
                to={item.path}
                className={`nav-breadcrumb-item ${
                  index === items.length - 1
                    ? darkMode
                      ? "nav-breadcrumb-item-active-dark"
                      : "nav-breadcrumb-item-active-light"
                    : darkMode
                    ? "nav-breadcrumb-item-inactive-dark"
                    : "nav-breadcrumb-item-inactive-light"
                }`}
                aria-current={index === items.length - 1 ? "page" : undefined}
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

// Mobile Navigation List Component
interface NavigationListProps {
  items: NavTreeNode[] | undefined;
  depth?: number;
}

const MobileNavigationList: React.FC<NavigationListProps> = ({
  items,
  depth = 0,
}) => {
  const {
    router,
    renderIcon,
    darkMode,
  } = useNavigator();

  const { Link, useLocation } = router;
  const { pathname } = useLocation();

  // Local state for expanded items
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {},
  );

  // Check if a path is active
  const isActive = (path: string) => {
    if (!path) return false;
    if (path === "/" && pathname === "/") return true;

    if (path === pathname) return true;

    // Use matchPath for parameterized routes
    const match = router.matchPath(path, pathname);
    return match !== null;
  };

  // Toggle expanded state
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul className="nav-mobile-list">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isItemActive = isActive(item.path);
        const isExpanded = expandedItems[item.id] || false;

        return (
          <li key={item.id} className="nav-mobile-item">
            <div className="flex items-center justify-between w-full">
              <Link
                to={item.path}
                className={`nav-mobile-link flex-1 ${
                  isItemActive
                    ? darkMode
                      ? "nav-mobile-link-active-dark"
                      : "nav-mobile-link-active-light"
                    : darkMode
                    ? "nav-mobile-link-inactive-dark"
                    : "nav-mobile-link-inactive-light"
                }`}
                aria-current={isItemActive ? "page" : undefined}
              >
                {item.iconName && (
                  <span className="mr-2">{renderIcon(item.iconName)}</span>
                )}
                <span>{item.label}</span>
              </Link>

              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={`nav-btn ${
                    darkMode ? "nav-btn-dark" : "nav-btn-light"
                  } ml-1 flex-shrink-0`}
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
              <div className="w-full">
                <ul
                  className={`nav-mobile-sublist ${
                    darkMode
                      ? "nav-mobile-sublist-dark"
                      : "nav-mobile-sublist-light"
                  }`}
                >
                  <MobileNavigationList
                    items={item.children}
                    depth={depth + 1}
                  />
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Mobile Menu component (formerly MobileNavigation)
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    navigationTree,
    section,
    renderIcon,
    darkMode,
  } = useNavigator();

  // Get navigation items for current section
  const navigationItems = navigationTree[section] || [];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile menu overlay */}
      <div
        className="nav-mobile-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile menu sidebar */}
      <div
        className={`nav-mobile-menu ${
          darkMode ? "nav-mobile-menu-dark" : "nav-mobile-menu-light"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        <div
          className={`nav-mobile-header ${
            darkMode ? "nav-mobile-header-dark" : "nav-mobile-header-light"
          }`}
        >
          <h2 className="nav-mobile-title">Navigation</h2>
          <button
            onClick={onClose}
            className={`nav-btn ${darkMode ? "nav-btn-dark" : "nav-btn-light"}`}
            aria-label="Close navigation"
          >
            {renderIcon("X")}
          </button>
        </div>

        <div className="nav-mobile-content">
          <MobileNavigationList items={navigationItems} />
        </div>
      </div>
    </>
  );
};

// Main Navigation Tiers Component (formerly NavigationSystem)
export const NavigationTiers: React.FC<NavigationTiersProps> = ({
  navigationLevelDefaults = {},
  className = "",
  onMobileMenuToggle,
}) => {
  const {
    navigationTree,
    section,
    router,
    displayMode,
    darkMode,
  } = useNavigator();

  // Get the router hooks
  const { useLocation } = router;
  const { pathname } = useLocation();

  // Complete the navigation level defaults with sensible values
  const levelDefaults = useMemo(
    () => completeNavigationLevelDefaults(navigationLevelDefaults),
    [navigationLevelDefaults],
  );

  // State for responsive behavior
  const [isMobile, setIsMobile] = useState(false);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<
    "tabs" | "breadcrumbs"
  >(
    displayMode === "breadcrumbs" ? "breadcrumbs" : "tabs",
  );

  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // User toggleable navigation level visibility
  const [userLevelVisibility, setUserLevelVisibility] = useState({
    tertiary: levelDefaults.tertiary.alwaysShow,
  });

  // Setup responsive detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      if (displayMode === "adaptive") {
        setCurrentDisplayMode(width < 1024 ? "breadcrumbs" : "tabs");
      } else {
        setCurrentDisplayMode(
          displayMode === "breadcrumbs" ? "breadcrumbs" : "tabs",
        );
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [displayMode]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    if (onMobileMenuToggle) {
      onMobileMenuToggle(newState);
    }
  };

  // Expose mobile menu state to parent via callback
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Expose toggleMobileMenu to the window for NavigationHeader to access
      (window as any).__toggleMobileMenu = toggleMobileMenu;
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__toggleMobileMenu;
      }
    };
  }, []);

  // Process navigation tree to find active items
  const {
    primaryItems,
    secondaryItems,
    tertiaryItems,
    breadcrumbs,
  } = useMemo(() => {
    // Get navigation items for the current section
    const sectionItems = navigationTree[section] || [];

    let activePrimary: NavTreeNode | null = null;
    let activeSecondary: NavTreeNode | null = null;
    let activeTertiary: NavTreeNode | null = null;
    const breadcrumbItems: NavTreeNode[] = [];

    // Helper to check if a path is active or a parent of active path
    const isPathActiveOrParent = (path: string) => {
      // Direct match
      if (path === pathname) return true;

      // Check if parent path
      if (path !== "/" && pathname.startsWith(path + "/")) return true;

      // Use matchPath
      const match = router.matchPath(path, pathname);
      return match !== null;
    };

    // Find active primary item
    for (const item of sectionItems) {
      if (isPathActiveOrParent(item.path)) {
        activePrimary = item;
        breadcrumbItems.push(item);
        break;
      }
    }

    // Get secondary items and find active one
    let secondaryChildren: NavTreeNode[] = [];
    if (activePrimary?.children?.length) {
      secondaryChildren = activePrimary.children;

      for (const item of secondaryChildren) {
        if (isPathActiveOrParent(item.path)) {
          activeSecondary = item;
          breadcrumbItems.push(item);
          break;
        }
      }
    }

    // Get tertiary items and find active one
    let tertiaryChildren: NavTreeNode[] = [];
    if (activeSecondary?.children?.length) {
      tertiaryChildren = activeSecondary.children;

      for (const item of tertiaryChildren) {
        if (isPathActiveOrParent(item.path)) {
          activeTertiary = item;
          breadcrumbItems.push(item);
          break;
        }
      }
    }

    return {
      primaryItems: sectionItems,
      secondaryItems: secondaryChildren,
      tertiaryItems: tertiaryChildren,
      breadcrumbs: breadcrumbItems,
    };
  }, [navigationTree, section, pathname, router]);

  // Determine if a navigation level should be shown
  const shouldShowLevel = (
    level: NavigationLevelType,
    items: NavTreeNode[],
  ) => {
    const hasItems = items.length > 0;
    const levelConfig = levelDefaults[level];

    // Primary is always shown per design
    if (level === "primary") return true;

    // For tertiary with user toggle option
    if (level === "tertiary" && levelConfig.userToggleable) {
      return hasItems && userLevelVisibility.tertiary;
    }

    // Default behavior
    return hasItems || levelConfig.alwaysShow;
  };

  // Toggle visibility for user toggleable levels
  const toggleLevelVisibility = (level: NavigationLevelType) => {
    if (level === "tertiary" && levelDefaults.tertiary.userToggleable) {
      setUserLevelVisibility((prev) => ({
        ...prev,
        tertiary: !prev.tertiary,
      }));
    }
  };

  return (
    <div className={`nav-tiers ${className}`}>
      <Choose>
        <When condition={currentDisplayMode === "tabs"}>
          {/* Primary Navigation */}
          {shouldShowLevel("primary", primaryItems) && (
            <NavigationRow
              items={primaryItems}
              level="primary"
            />
          )}

          {/* Secondary Navigation */}
          {shouldShowLevel("secondary", secondaryItems) && (
            <NavigationRow
              items={secondaryItems}
              level="secondary"
            />
          )}

          {/* Tertiary Navigation */}
          {shouldShowLevel("tertiary", tertiaryItems) && (
            <>
              <NavigationRow
                items={tertiaryItems}
                level="tertiary"
              />
              {levelDefaults.tertiary.userToggleable &&
                tertiaryItems.length > 0 && (
                <div className="container mx-auto px-4 flex justify-end">
                  <button
                    onClick={() => toggleLevelVisibility("tertiary")}
                    className={`nav-btn-secondary ${
                      darkMode
                        ? "nav-btn-secondary-dark"
                        : "nav-btn-secondary-light"
                    } my-1`}
                  >
                    {userLevelVisibility.tertiary
                      ? "Hide options"
                      : "Show options"}
                  </button>
                </div>
              )}
            </>
          )}
        </When>
        <Otherwise>
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <NavigationBreadcrumb items={breadcrumbs} />
          )}
        </Otherwise>
      </Choose>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => toggleMobileMenu()}
      />
    </div>
  );
};

export default NavigationTiers;
