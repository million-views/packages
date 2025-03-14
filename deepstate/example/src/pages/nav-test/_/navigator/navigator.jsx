// navigator.jsx
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import {
  Bars3Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
} from "@heroicons/preact/24/outline";
import { useNavigation } from "./navigation-context";

/**
 * Icon component for rendering SVG icons
 */
function Icon({ icon }) {
  // This is a placeholder component that would be populated with
  // actual icons based on the icon name passed in
  return (
    <span className="mr-2">
      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </span>
  );
}

/**
 * Brand/Logo component
 */
function NavBrand({ logo }) {
  return (
    <a href="/" className="btn btn-ghost normal-case text-xl">
      <img src={logo} alt="Logo" className="h-8 w-auto" />
    </a>
  );
}

/**
 * Search input component
 */
function SearchInput({ searchQuery, onSearchChange }) {
  return (
    <div className="form-control">
      <input
        type="text"
        placeholder="Search"
        className="input input-bordered w-24 md:w-auto"
        value={searchQuery.value}
        onInput={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Component for rendering action buttons/links
 */
function ActionItem({ action, index }) {
  return (
    <div key={index} className="ml-2">
      {action.type === "button"
        ? (
          <button
            onClick={() => action.onClick && action.onClick()}
            className={`btn ${action.primary ? "btn-primary" : "btn-ghost"}`}
          >
            {action.label}
          </button>
        )
        : (
          <a
            href={action.href}
            className="btn btn-ghost"
          >
            {action.label}
          </a>
        )}
    </div>
  );
}

/**
 * Mobile menu hamburger button
 */
function MobileMenuButton({ isOpen, onToggle }) {
  return (
    <div className="dropdown dropdown-end lg:hidden">
      <label
        tabIndex={0}
        className="btn btn-ghost"
        onClick={onToggle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </label>
    </div>
  );
}

/**
 * Individual navigation item rendering
 */
function NavItem({ route, isActive, onNavigate }) {
  return (
    <li key={route.path || route.href || route.label}>
      <a
        href={route.href || "#"}
        className={isActive ? "active" : ""}
        onClick={(e) => {
          if (!route.href) {
            e.preventDefault();
          }
          onNavigate(route);
        }}
      >
        {route.icon && <Icon icon={route.icon} />}
        {route.label}
      </a>
    </li>
  );
}

/**
 * Component for a dropdown/submenu item
 */
function NavDropdown(
  {
    route,
    isActive,
    hasActiveChildren,
    openDropdownId,
    onToggleDropdown,
    onNavigateChild,
  },
) {
  return (
    <li key={route.path || route.href || route.label}>
      <details
        open={openDropdownId === route.label || isActive || hasActiveChildren}
      >
        <summary
          className={`${isActive || hasActiveChildren ? "active" : ""}`}
          onClick={() => onToggleDropdown(route.label)}
        >
          {route.icon && <Icon icon={route.icon} />}
          {route.label}
        </summary>
        <ul className="p-2 bg-base-100 rounded-t-none">
          {route.children.map((child) => (
            <NavItem
              key={child.path || child.href || child.label}
              route={child}
              isActive={isActive(child)}
              onNavigate={(route) => {
                onNavigateChild(route);
                onToggleDropdown(null);
              }}
            />
          ))}
        </ul>
      </details>
    </li>
  );
}

/**
 * Desktop horizontal menu component
 */
function DesktopMenu(
  {
    routes,
    isRouteActive,
    hasActiveChild,
    navigateTo,
    openDropdown,
    setOpenDropdown,
  },
) {
  return (
    <div className="hidden lg:flex">
      <ul className="menu menu-horizontal px-1">
        {routes.map((route) =>
          route.children
            ? (
              <NavDropdown
                key={route.path || route.href || route.label}
                route={route}
                isActive={isRouteActive(route)}
                hasActiveChildren={hasActiveChild(route)}
                openDropdownId={openDropdown.value}
                onToggleDropdown={(id) =>
                  setOpenDropdown(id === openDropdown.value ? null : id)}
                onNavigateChild={navigateTo}
              />
            )
            : (
              <NavItem
                key={route.path || route.href || route.label}
                route={route}
                isActive={isRouteActive(route)}
                onNavigate={navigateTo}
              />
            )
        )}
      </ul>
    </div>
  );
}

/**
 * Mobile dropdown menu
 */
function MobileMenu(
  { isOpen, routes, isRouteActive, hasActiveChild, navigateTo, onClose },
) {
  if (!isOpen) return null;

  return (
    <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
      {routes.map((route) =>
        route.children
          ? (
            <li key={route.path || route.href || route.label}>
              <details>
                <summary
                  className={isRouteActive(route) || hasActiveChild(route)
                    ? "active"
                    : ""}
                >
                  {route.label}
                </summary>
                <ul className="p-2">
                  {route.children.map((child) => (
                    <NavItem
                      key={child.path || child.href || child.label}
                      route={child}
                      isActive={isRouteActive(child)}
                      onNavigate={(route) => {
                        navigateTo(route);
                        onClose();
                      }}
                    />
                  ))}
                </ul>
              </details>
            </li>
          )
          : (
            <NavItem
              key={route.path || route.href || route.label}
              route={route}
              isActive={isRouteActive(route)}
              onNavigate={(route) => {
                navigateTo(route);
                onClose();
              }}
            />
          )
      )}
    </ul>
  );
}

/**
 * Vertical sidebar menu component
 */
function SidebarMenu(
  {
    routes,
    isRouteActive,
    hasActiveChild,
    navigateTo,
    mobileMenuOpen,
    setMobileMenuOpen,
    openDropdown,
    setOpenDropdown,
  },
) {
  return (
    <ul className="menu p-4 w-64 h-full bg-base-200 text-base-content">
      {routes.map((route) =>
        route.children
          ? (
            <NavDropdown
              key={route.path || route.href || route.label}
              route={route}
              isActive={isRouteActive(route)}
              hasActiveChildren={hasActiveChild(route)}
              openDropdownId={openDropdown.value}
              onToggleDropdown={setOpenDropdown}
              onNavigateChild={(route) => {
                navigateTo(route);
                setMobileMenuOpen(false);
              }}
            />
          )
          : (
            <NavItem
              key={route.path || route.href || route.label}
              route={route}
              isActive={isRouteActive(route)}
              onNavigate={(route) => {
                navigateTo(route);
                setMobileMenuOpen(false);
              }}
            />
          )
      )}
    </ul>
  );
}

/**
 * Horizontal navigation bar layout
 */
function HorizontalNavbar({
  logo,
  routes,
  showSearch,
  rightActions,
  isMobile,
  mobileMenuOpen,
  searchQuery,
  openDropdown,
  isRouteActive,
  hasActiveChild,
  navigateTo,
  setMobileMenuOpen,
  setSearchQuery,
  setOpenDropdown,
}) {
  return (
    <>
      <div className="navbar-start">
        {/* Logo */}
        <NavBrand logo={logo} />

        {/* Desktop Navigation - only show on desktop */}
        {!isMobile.value && (
          <DesktopMenu
            routes={routes}
            isRouteActive={isRouteActive}
            hasActiveChild={hasActiveChild}
            navigateTo={navigateTo}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
          />
        )}
      </div>

      <div className="navbar-center">
        {/* Search - show based on prop */}
        {showSearch && (
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>

      <div className="navbar-end">
        {/* Right actions like login buttons */}
        {rightActions.map((action, index) => (
          <ActionItem
            key={index}
            action={action}
            index={index}
          />
        ))}

        {/* Mobile menu button */}
        <MobileMenuButton
          isOpen={mobileMenuOpen.value}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen.value)}
        />

        {/* Mobile menu dropdown */}
        {isMobile.value && (
          <MobileMenu
            isOpen={mobileMenuOpen.value}
            routes={routes}
            isRouteActive={isRouteActive}
            hasActiveChild={hasActiveChild}
            navigateTo={navigateTo}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
}

/**
 * Vertical sidebar layout
 */
function VerticalSidebar({
  logo,
  routes,
  mobileMenuOpen,
  openDropdown,
  isRouteActive,
  hasActiveChild,
  navigateTo,
  setMobileMenuOpen,
  setOpenDropdown,
}) {
  return (
    <div className="drawer lg:drawer-open">
      <input
        id="nav-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={mobileMenuOpen.value}
        onChange={() => setMobileMenuOpen(!mobileMenuOpen.value)}
      />
      <div className="drawer-content flex flex-col">
        {/* Page content here */}
        <div className="navbar lg:hidden">
          <div className="flex-none">
            <label
              htmlFor="nav-drawer"
              className="btn btn-square btn-ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen.value)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                >
                </path>
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <NavBrand logo={logo} />
          </div>
        </div>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="nav-drawer"
          className="drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
        </label>

        {/* Logo at top */}
        <div className="flex items-center justify-center mt-4 mb-8">
          <img className="h-10 w-auto" src={logo} alt="Logo" />
        </div>

        {/* Sidebar items */}
        <SidebarMenu
          routes={routes}
          isRouteActive={isRouteActive}
          hasActiveChild={hasActiveChild}
          navigateTo={navigateTo}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          openDropdown={openDropdown}
          setOpenDropdown={setOpenDropdown}
        />
      </div>
    </div>
  );
}

/**
 * Main Navigator component
 * @param {Object} props - Component props
 * @param {string} props.logo - URL to the logo image
 * @param {string} props.variant - Navigation variant ('horizontal' or 'vertical')
 * @param {boolean} props.showSearch - Whether to show the search input
 * @param {Array} props.rightActions - Actions to display on the right side
 * @param {number} props.mobileBreakpoint - Breakpoint for mobile view
 */
export function Navigator({
  logo,
  variant = "horizontal",
  showSearch = false,
  rightActions = [],
  mobileBreakpoint = 768,
}) {
  // Use signals for reactive state
  const isMobile = useSignal(false);
  const mobileMenuOpen = useSignal(false);
  const searchQuery = useSignal("");
  const openDropdown = useSignal(null);

  // Get navigation context
  const { routes, isRouteActive, hasActiveChild, navigateTo } = useNavigation();

  // Track window size for responsive behavior using signals
  useSignalEffect(() => {
    // Skip in SSR environment
    if (typeof window === "undefined") return;

    const handleResize = () => {
      isMobile.value = window.innerWidth < mobileBreakpoint;
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  // Filter routes with computed signal
  const filteredRoutes = useComputed(() => {
    return routes.filter((route) => isMobile.value ? true : !route.mobileOnly);
  });

  // Set search query handler
  const setSearchQuery = (value) => {
    searchQuery.value = value;
  };

  // Set mobile menu open handler
  const setMobileMenuOpen = (value) => {
    mobileMenuOpen.value = value;
  };

  // Set open dropdown handler
  const setOpenDropdown = (value) => {
    openDropdown.value = value;
  };

  return (
    <div className="navbar bg-base-100">
      {variant === "horizontal"
        ? (
          <HorizontalNavbar
            logo={logo}
            routes={filteredRoutes.value}
            showSearch={showSearch}
            rightActions={rightActions}
            isMobile={isMobile}
            mobileMenuOpen={mobileMenuOpen}
            searchQuery={searchQuery}
            openDropdown={openDropdown}
            isRouteActive={isRouteActive}
            hasActiveChild={hasActiveChild}
            navigateTo={navigateTo}
            setMobileMenuOpen={setMobileMenuOpen}
            setSearchQuery={setSearchQuery}
            setOpenDropdown={setOpenDropdown}
          />
        )
        : (
          <VerticalSidebar
            logo={logo}
            routes={routes}
            mobileMenuOpen={mobileMenuOpen}
            openDropdown={openDropdown}
            isRouteActive={isRouteActive}
            hasActiveChild={hasActiveChild}
            navigateTo={navigateTo}
            setMobileMenuOpen={setMobileMenuOpen}
            setOpenDropdown={setOpenDropdown}
          />
        )}
    </div>
  );
}
