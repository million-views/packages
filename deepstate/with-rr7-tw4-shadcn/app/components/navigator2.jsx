// @ts-ignore
import React, { useEffect, useState } from "react";
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

// Navigation component for different screen sizes
const NavigatorDemo = ({ navigationTree }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activePage, setActivePage] = useState("/dashboard/analytics");
  const [expandedItems, setExpandedItems] = useState({
    main: true,
    analytics: true,
  });
  const [viewportWidth, setViewportWidth] = useState(1024);

  // Toggle between desktop and mobile views for demo
  const toggleViewMode = () => {
    setIsMobile(!isMobile);
    setViewportWidth(isMobile ? 1024 : 480);
  };

  // Toggle expanded state for items with children
  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle navigation item click
  const handleNavClick = (path) => {
    setActivePage(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  // Is the path or one of its children active?
  const isActive = (item) => {
    if (item.path === activePage) return true;

    if (item.children) {
      return item.children.some((child) => isActive(child));
    }

    return false;
  };

  // Check if an item should be shown as active in the top-level navbar
  const isTopLevelActive = (item) => {
    // If this is the exact page
    if (item.path === activePage) return true;

    // If any child is active and this is a parent
    if (
      item.children &&
      item.children.some((child) =>
        child.path === activePage || (child.children && isTopLevelActive(child))
      )
    ) {
      return true;
    }

    return false;
  };

  // Find active section for secondary nav
  const getActiveSection = () => {
    for (const item of navigationTree.main) {
      if (item.children && isTopLevelActive(item)) {
        return item;
      }
    }
    return null;
  };

  // Find active subsection for tertiary nav
  const getActiveSubsection = () => {
    const activeSection = getActiveSection();
    if (!activeSection || !activeSection.children) return null;

    for (const item of activeSection.children) {
      if (item.children && isActive(item)) {
        return item;
      }
    }
    return null;
  };

  // Render navigation items recursively (for mobile sidebar)
  const renderNavItems = (items, depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isItemActive = isActive(item);
      const isExpanded = expandedItems[item.id];

      return (
        <div key={item.id} className={`${depth > 0 ? "ml-4" : ""}`}>
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
                  onClick={() => toggleExpanded(item.id)}
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
                <button
                  onClick={() => handleNavClick(item.path)}
                  className="w-full text-left"
                >
                  {item.label}
                </button>
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

  // Top level navigation bar component
  const TopLevelNav = () => {
    return (
      <div className="flex items-center space-x-1 overflow-x-auto px-2 py-1 border-b border-gray-200">
        {navigationTree.main.map((item) => {
          const isItemActive = isTopLevelActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`px-4 py-2 rounded-md flex items-center ${
                isItemActive ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              {item.iconName && (
                <span className="mr-2">{renderIcon(item.iconName)}</span>
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // Secondary level navigation (e.g., Dashboard > Overview, Analytics, Reports)
  const SecondaryNav = () => {
    const activeParent = getActiveSection();

    if (!activeParent || !activeParent.children) return null;

    return (
      <div className="border-b border-gray-200 py-1">
        <div className="flex items-center space-x-8 px-4 overflow-x-auto">
          {activeParent.children.map((item) => {
            const isItemActive = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`py-2 flex items-center ${
                  isItemActive
                    ? "border-b-2 border-blue-500 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.iconName && (
                  <span className="mr-2">{renderIcon(item.iconName)}</span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Tertiary level navigation (e.g., Overview > Summary, Performance, Metrics)
  const TertiaryNav = () => {
    const activeSubsection = getActiveSubsection();

    if (!activeSubsection || !activeSubsection.children) return null;

    return (
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-8 px-6 overflow-x-auto">
          {activeSubsection.children.map((item) => {
            const isItemActive = item.path === activePage;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`py-2 text-sm flex items-center ${
                  isItemActive
                    ? "font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.iconName && (
                  <span className="mr-2">
                    {renderIcon(item.iconName, "w-4 h-4")}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
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
            {renderNavItems(navigationTree.main)}
          </div>

          {/* Dashboard Views (if in dashboard section) */}
          {activePage.includes("/dashboard") && (
            <div className="mb-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">
                Dashboard Views
              </h3>
              {navigationTree.main.find((item) => item.id === "main")?.children
                .map((item) => (
                  <div key={item.id} className="mb-2">
                    <button
                      onClick={() => handleNavClick(item.path)}
                      className={`flex items-center py-2 px-3 rounded-md w-full text-left ${
                        isActive(item)
                          ? "bg-gray-100 font-medium"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {item.iconName && (
                        <span className="mr-3">
                          {renderIcon(item.iconName)}
                        </span>
                      )}
                      <span>{item.label}</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile breadcrumb
  const MobileBreadcrumb = () => {
    // Extract breadcrumb items from the active path
    const pathSegments = activePage.split("/").filter(Boolean);
    if (pathSegments.length === 0) return null;

    return (
      <div className="flex items-center py-2 px-4 text-sm text-gray-500 overflow-x-auto border-b border-gray-200">
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;

          // Format the segment for display
          const formattedSegment = segment.charAt(0).toUpperCase() +
            segment.slice(1);

          return (
            <React.Fragment key={index}>
              {index > 0 && <span className="mx-2">/</span>}
              <span className={isLast ? "font-medium text-gray-900" : ""}>
                {formattedSegment}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // App bar with title and toggle
  const AppBar = () => (
    <div className="flex justify-between items-center p-3 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 font-semibold">
          <Home size={20} />
          <span>App</span>
        </div>
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
              <button className="p-2 rounded-md hover:bg-gray-100">
                <MoreHorizontal size={20} />
              </button>
            </>
          )}
      </div>
    </div>
  );

  // Demo page content
  const PageContent = () => {
    // Find the currently active page
    const findActivePage = (items) => {
      for (const item of items) {
        if (item.path === activePage) {
          return item;
        }
        if (item.children) {
          const result = findActivePage(item.children);
          if (result) return result;
        }
      }
      return null;
    };

    const currentPage = findActivePage(navigationTree.main) || {
      label: "Page Not Found",
      iconName: "FileText",
    };

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">{currentPage.label}</h1>
        <p className="text-gray-600 mb-8">
          This is a demo of the Navigator component. The current page is:{" "}
          {activePage}
        </p>

        {activePage.includes("/analytics") && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Performance Metrics</h2>
            <p className="text-gray-500 mb-4">Key performance indicators</p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Page Views</span>
                <span className="flex items-center">
                  12,543{" "}
                  <TrendingUp className="ml-2 text-green-500" size={16} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Conversion Rate</span>
                <span className="flex items-center">
                  3.2% <TrendingUp className="ml-2 text-green-500" size={16} />
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Bounce Rate</span>
                <span className="flex items-center">
                  42.1%{" "}
                  <TrendingUp
                    className="ml-2 text-red-500 rotate-180"
                    size={16}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        {activePage.includes("/overview") && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Dashboard Overview</h2>
            <p className="text-gray-500 mb-4">
              Summary of your dashboard activity
            </p>
          </div>
        )}

        {activePage.includes("/reports") && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Reports</h2>
            <p className="text-gray-500 mb-4">Detailed reports and analysis</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Mode switcher for demo purposes */}
      <div className="fixed top-2 right-2 z-50 bg-white shadow-md rounded-md p-2">
        <button
          onClick={toggleViewMode}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
        >
          {isMobile ? "Switch to Desktop" : "Switch to Mobile"}
        </button>
      </div>

      <div
        className={`flex flex-col h-screen bg-white text-gray-900 ${
          isMobile ? "max-w-md mx-auto border-x border-gray-200" : "w-full"
        }`}
      >
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
            {activePage.includes("/dashboard") && <SecondaryNav />}
            {activePage.includes("/dashboard") && <TertiaryNav />}
          </>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <PageContent />
        </div>
      </div>
    </div>
  );
};

export default NavigatorDemo;
