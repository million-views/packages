import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigation } from "react-router";
import {
  Activity,
  BarChart,
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  Edit,
  Eye,
  FileText,
  Home,
  LayoutDashboard,
  Loader,
  Mail,
  Menu,
  MoreHorizontal,
  PieChart,
  Plus,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  UserMinus,
  Users,
  X,
} from "lucide-react";

// Import the generated navigation data and hooks
import { navigationTree, useHydratedMatches } from "@/lib/nav5";

// Icon mapping for easy icon rendering
const iconMap = {
  Home: Home,
  Settings: Settings,
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  FileText: FileText,
  Mail: Mail,
  BarChart: BarChart,
  Activity: Activity,
  PieChart: PieChart,
  Calendar: Calendar,
  CalendarDays: CalendarDays,
  CalendarRange: CalendarRange,
  Shield: Shield,
  ShieldAlert: ShieldAlert,
  Edit: Edit,
  Eye: Eye,
  UserCheck: UserCheck,
  UserMinus: UserMinus,
  Clock: Clock,
  CircleDot: CircleDot,
  TrendingUp: TrendingUp,
};

const renderIcon = (iconName, className = "w-5 h-5") => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};

// Custom hook to get breadcrumb data from current route matches
export function useBreadcrumbs() {
  const hydratedMatches = useHydratedMatches();

  // Transform the matches into breadcrumb items
  return hydratedMatches
    .filter((match) => match.handle?.label) // Only include routes with labels
    .map((match) => ({
      id: match.id,
      path: match.pathname,
      label: match.handle.label,
      icon: match.handle.iconName,
    }));
}

// Custom hook to determine active group
export function useActiveGroup() {
  const hydratedMatches = useHydratedMatches();
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  // First try to find a match with a group defined
  const groupMatch = [...hydratedMatches]
    .reverse()
    .find((match) => match.handle?.group);

  if (groupMatch?.handle?.group) {
    return groupMatch.handle.group;
  }

  // If no group found, try to find the top-level active item
  if (pathSegments.length > 0) {
    const firstSegment = `/${pathSegments[0]}`;

    // Find the top-level item that matches this path
    const topLevelItem = navigationTree.main?.find((item) =>
      item.path === firstSegment ||
      (item.path === "/" && firstSegment === "/") ||
      (item.id === "main" && firstSegment === "/dashboard")
    );

    return topLevelItem?.id || null;
  }

  return null;
}

// Utility function to find an active parent item
function findActiveParent(items, currentPath) {
  if (!items || !Array.isArray(items)) return null;

  for (const item of items) {
    // Check if this item is active based on path
    if (
      item.path && (
        item.path === currentPath ||
        (item.path !== "/" && currentPath.startsWith(item.path))
      )
    ) {
      return item;
    }

    // Check children recursively
    if (item.children && item.children.length > 0) {
      const foundInChildren = findActiveParent(item.children, currentPath);
      if (foundInChildren) return item; // Return the parent, not the child
    }
  }

  return null;
}

// Main Navigator component
const Navigator = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // React Router hooks
  const navigation = useNavigation();
  const location = useLocation();
  const matches = useHydratedMatches();
  const activePage = location.pathname;
  const activeGroup = useActiveGroup();

  // Show loading indicator during navigation
  const isNavigating = navigation.state !== "idle";

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-expand items for the current path
  useEffect(() => {
    // Helper function to recursively find and expand items for current path
    const expandItemsForPath = (items, path, expandedState = {}) => {
      for (const item of items) {
        // If this item or its children match the current path, expand it
        if (
          item.path && path.startsWith(item.path) && item.children?.length > 0
        ) {
          expandedState[item.id] = true;
        }

        // Recursively check children
        if (item.children?.length > 0) {
          expandItemsForPath(item.children, path, expandedState);
        }
      }
      return expandedState;
    };

    // Start with the main navigation items
    const newExpandedState = expandItemsForPath(
      navigationTree.main || [],
      activePage,
    );
    setExpandedItems((prev) => ({ ...prev, ...newExpandedState }));
  }, [activePage]);

  // Toggle expanded state for items with children
  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Close mobile menu when navigation occurs
  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Determine if a route is active
  const isActive = (path) => {
    if (!path || path === "/") {
      return activePage === "/";
    }

    if (path === activePage) return true;

    // Also check if this is a parent of the current path
    return activePage.startsWith(path + "/");
  };

  // Use the navigation tree directly - it already has the proper hierarchy
  const navigationItems = navigationTree.main || [];

  // Render navigation items recursively (for mobile sidebar)
  const renderNavItems = (items, depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isItemActive = item.path ? isActive(item.path) : false;
      const isExpanded = expandedItems[item.id] || isItemActive;

      return (
        <div
          key={item.id || item.path}
          className={`${depth > 0 ? "ml-4" : ""}`}
        >
          <div
            className={`flex items-center py-2 px-3 rounded-md ${
              isItemActive ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            {item.iconName && (
              <span className="mr-3 text-gray-500">
                {renderIcon(item.iconName)}
              </span>
            )}

            {hasChildren
              ? (
                <button
                  onClick={() => toggleExpanded(item.id || item.path)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span>{item.label}</span>
                  <span className="ml-2">
                    {isExpanded
                      ? <ChevronDown size={16} />
                      : <ChevronRight size={16} />}
                  </span>
                </button>
              )
              : (
                <NavLink
                  to={item.path || "#"}
                  end={item.end}
                  className={({ isActive }) =>
                    `w-full text-left flex ${isActive ? "font-medium" : ""}`}
                  onClick={isMobile ? handleMobileMenuClose : undefined}
                >
                  {item.label}
                </NavLink>
              )}
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-1 ml-1 border-l border-gray-200 pl-2">
              {renderNavItems(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  // Find items in the active parent's children for secondary nav
  const getGroupItems = () => {
    // Find the active parent item
    const activeParentItem = findActiveParent(navigationItems, activePage);

    // Return its children if found
    return activeParentItem?.children || [];
  };

  // Top level navigation bar component
  const TopLevelNav = () => {
    return (
      <div className="flex items-center space-x-1 overflow-x-auto px-2 py-1 border-b border-gray-200">
        {navigationItems.map((item) => {
          // Skip items without paths (they're just containers)
          if (!item.path) return null;

          const isItemActive = isActive(item.path);

          return (
            <NavLink
              key={item.id || item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md flex items-center ${
                  isActive ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
            >
              {item.iconName && (
                <span className="mr-2">{renderIcon(item.iconName)}</span>
              )}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    );
  };

  // Secondary level navigation
  const SecondaryNav = () => {
    const groupItems = getGroupItems();

    if (groupItems.length === 0) return null;

    return (
      <div className="border-b border-gray-200 py-1">
        <div className="flex items-center space-x-8 px-4 overflow-x-auto">
          {groupItems.map((item) => {
            // Skip items without paths
            if (!item.path) return null;

            return (
              <NavLink
                key={item.id || item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `py-2 flex items-center ${
                    isActive
                      ? "border-b-2 border-blue-500 font-medium"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {item.iconName && (
                  <span className="mr-2">{renderIcon(item.iconName)}</span>
                )}
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  };

  // Breadcrumb for mobile view
  const MobileBreadcrumb = () => {
    const breadcrumbs = useBreadcrumbs();

    if (breadcrumbs.length <= 1) return null;

    return (
      <div className="flex items-center py-2 px-4 text-sm text-gray-500 overflow-x-auto border-b border-gray-200">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={crumb.id}>
              {index > 0 && <span className="mx-2">/</span>}
              {isLast
                ? (
                  <span
                    className={`font-medium text-gray-900 ${
                      isNavigating ? "opacity-50" : ""
                    }`}
                  >
                    {crumb.label}
                  </span>
                )
                : (
                  <Link
                    to={crumb.path}
                    className={`hover:text-gray-900 ${
                      isNavigating ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {crumb.label}
                  </Link>
                )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Mobile sidebar navigation
  const MobileSidebar = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Navigation</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-screen">
          {/* Main Navigation */}
          <div className="mb-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">
              Main Navigation
            </h3>
            {renderNavItems(navigationItems)}
          </div>
        </div>
      </div>
    );
  };

  // App bar with title and toggle
  const AppBar = () => (
    <div className="flex justify-between items-center p-3 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <Link to="/" className="flex items-center space-x-2 font-semibold">
          <Home size={20} />
          <span>App</span>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        {isMobile
          ? (
            <>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
            </>
          )
          : (
            <>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Plus size={20} />
              </button>
              <button className="p-2 rounded-md hover:bg-gray-100">
                <Search size={20} />
              </button>
            </>
          )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Navigation loading indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      <AppBar />

      {/* Mobile View */}
      {isMobile && (
        <>
          <MobileBreadcrumb />
          <MobileSidebar />
        </>
      )}

      {/* Desktop Navigation Levels */}
      {!isMobile && (
        <>
          <TopLevelNav />
          <SecondaryNav />
        </>
      )}
    </div>
  );
};

export default Navigator;
