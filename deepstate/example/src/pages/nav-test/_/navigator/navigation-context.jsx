// navigation-context.jsx
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";

// context for navigation state
const NavigationContext = createContext(null);

export function NavigationProvider({
  children,
  routes = [],
  initialPath = typeof window !== "undefined" ? window.location.pathname : "/",
}) {
  // Create the active path signal
  const activePath = useSignal(initialPath);

  // Check if we're in the browser environment
  const isBrowser = typeof window !== "undefined";

  // Update active path based on URL changes using useSignalEffect
  useSignalEffect(() => {
    if (!isBrowser) return;

    // Set initial path on mount
    activePath.value = window.location.pathname;

    // Listen for URL changes
    const handleLocationChange = () => {
      activePath.value = window.location.pathname;
    };

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  });

  /**
   * Checks if a route is currently active
   * @param {Object} route - The route object to check
   * @returns {boolean} - True if the route is active
   */
  const isRouteActive = (route) => {
    if (!route) return false;

    // Create this as a computed value that updates when activePath changes
    const checkActive = useComputed(() => {
      if (route.href) {
        // Exact match
        if (route.href === activePath.value) return true;

        // Match with trailing slash variations
        const normalizedHref = route.href.endsWith("/")
          ? route.href.slice(0, -1)
          : route.href;
        const normalizedActive = activePath.value.endsWith("/")
          ? activePath.value.slice(0, -1)
          : activePath.value;

        if (normalizedHref === normalizedActive) return true;

        // Special case for home page
        if (route.href === "/" && activePath.value === "") return true;

        // Check if it's a parent path (for highlighting parent when on child page)
        if (route.href !== "/" && normalizedActive.startsWith(normalizedHref)) {
          return true;
        }
      }

      // For component routes without href, we would need some additional identifier
      if (route.path && route.path === activePath.value) return true;

      return false;
    });

    return checkActive.value;
  };

  /**
   * Check if any child routes are active (for parent highlighting)
   * @param {Object} route - The parent route object
   * @returns {boolean} - True if any children are active
   */
  const hasActiveChild = (route) => {
    if (!route.children) return false;

    // Return a computed that checks all children when activePath changes
    const checkChildren = useComputed(() => {
      return route.children.some((child) =>
        isRouteActive(child) || hasActiveChild(child)
      );
    });

    return checkChildren.value;
  };

  /**
   * Navigate to a route
   * @param {Object} route - The route to navigate to
   */
  const navigateTo = (route) => {
    if (!route) return;

    if (route.href) {
      // For routes with href, perform a full page navigation
      window.location.href = route.href;
    } else if (route.path) {
      // For component routes, just update the active path
      activePath.value = route.path;

      // Optionally update browser history
      if (isBrowser && window.history) {
        window.history.pushState(null, "", route.path);
      }
    }
  };

  /**
   * Get the active route object
   * @returns {Object|null} - The active route object or null
   */
  const getActiveRoute = useComputed(() => {
    // Recursive function to find active route
    const findActive = (routeList) => {
      for (const route of routeList) {
        if (isRouteActive(route)) return route;

        if (route.children) {
          const childActive = findActive(route.children);
          if (childActive) return childActive;
        }
      }
      return null;
    };

    return findActive(routes);
  });

  // Create context value
  const navigationContext = {
    routes,
    activePath,
    isRouteActive,
    hasActiveChild,
    navigateTo,
    getActiveRoute,
  };

  return (
    <NavigationContext.Provider value={navigationContext}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook to use the navigator context
export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
}
