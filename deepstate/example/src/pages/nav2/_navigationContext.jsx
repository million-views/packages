import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";

// Safe check for browser environment
const isBrowser = typeof window !== "undefined";

// Create a context for navigation state
export const NavigationContext = createContext({
  activeView: null,
  activeSubView: null,
  currentPage: null,
  navigateTo: () => {},
  handleViewChange: () => {},
  handleSubViewChange: () => {},
  handleTaskAction: () => {},
});

// Custom hook to access the navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    console.error("useNavigation must be used within a NavigationProvider");
    // Return default values instead of throwing
    return {
      activeView: null,
      activeSubView: null,
      currentPage: null,
      navigateTo: () => {},
      handleViewChange: () => {},
      handleSubViewChange: () => {},
      handleTaskAction: () => {},
    };
  }
  return context;
}

export function NavigationProvider({ children }) {
  // Initialize state based on URL parameters
  const [activeView, setActiveView] = useState(null);
  const [activeSubView, setActiveSubView] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse URL on initial load to set navigation state
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (!isBrowser) return;

    try {
      // Initial state setup from URL
      const url = new URL(window.location.href);
      const viewParam = url.searchParams.get("view");
      const subViewParam = url.searchParams.get("subview");
      const pathname = url.pathname;

      setCurrentPage(pathname);

      if (viewParam) {
        setActiveView(viewParam);
      }

      if (subViewParam) {
        setActiveSubView(subViewParam);
      }

      // Listen for initialization event from Astro layout
      const handleInitState = (event) => {
        if (!event || !event.detail) return;

        const { pathname, view, subview } = event.detail;

        if (pathname) {
          setCurrentPage(pathname);
        }

        if (view) {
          setActiveView(view);
        }

        if (subview) {
          setActiveSubView(subview);
        }

        setIsInitialized(true);
      };

      window.addEventListener("initNavigationState", handleInitState);

      // If we didn't get an initialization event within a short time,
      // mark as initialized anyway to allow default behavior
      const timeoutId = setTimeout(() => {
        setIsInitialized(true);
      }, 500);

      return () => {
        window.removeEventListener("initNavigationState", handleInitState);
        clearTimeout(timeoutId);
      };
    } catch (error) {
      console.error("Error initializing navigation state:", error);
      setIsInitialized(true); // Ensure we don't block rendering on error
    }
  }, []);

  // Update URL when navigation state changes
  useEffect(() => {
    // Skip this effect during server-side rendering or before initialization
    if (!isBrowser || !isInitialized || !currentPage) return;

    try {
      const url = new URL(window.location.href);

      if (activeView) {
        url.searchParams.set("view", activeView);
      } else {
        url.searchParams.delete("view");
      }

      if (activeSubView) {
        url.searchParams.set("subview", activeSubView);
      } else {
        url.searchParams.delete("subview");
      }

      // Update URL without causing a page reload
      window.history.replaceState({}, "", url.toString());

      // Dispatch custom events to notify components
      if (activeView) {
        const viewEvent = new CustomEvent("viewChange", {
          detail: {
            viewId: activeView,
            subViewId: activeSubView,
            pageHref: currentPage,
          },
        });
        window.dispatchEvent(viewEvent);
      }

      if (activeSubView) {
        const subViewEvent = new CustomEvent("subViewChange", {
          detail: {
            viewId: activeView,
            subViewId: activeSubView,
            pageHref: currentPage,
          },
        });
        window.dispatchEvent(subViewEvent);
      }

      // General state change event
      const stateEvent = new CustomEvent("navigationStateChange", {
        detail: { activeView, activeSubView, currentPage },
      });
      window.dispatchEvent(stateEvent);
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  }, [activeView, activeSubView, currentPage, isInitialized]);

  // Navigate to a page
  const navigateTo = (href, viewId = null, subViewId = null) => {
    // Skip this function during server-side rendering
    if (!isBrowser) return;

    try {
      // If it's the same page, just update the view states
      if (href === currentPage) {
        if (viewId !== undefined) {
          setActiveView(viewId);

          // Dispatch view change event
          const viewEvent = new CustomEvent("viewChange", {
            detail: {
              viewId: viewId,
              subViewId: subViewId,
              pageHref: href,
            },
          });
          window.dispatchEvent(viewEvent);
        }

        if (subViewId !== undefined) {
          setActiveSubView(subViewId);

          // Dispatch subview change event
          const subViewEvent = new CustomEvent("subViewChange", {
            detail: {
              viewId: viewId || activeView,
              subViewId: subViewId,
              pageHref: href,
            },
          });
          window.dispatchEvent(subViewEvent);
        }
        return;
      }

      // For different page, update URL with new params
      const url = new URL(window.location.origin + href);

      if (viewId) {
        url.searchParams.set("view", viewId);
      }

      if (subViewId) {
        url.searchParams.set("subview", subViewId);
      }

      // Navigate to the new URL
      window.location.href = url.toString();
    } catch (error) {
      console.error("Error navigating:", error);
    }
  };

  // Handle view change
  const handleViewChange = (viewId, pageHref = null) => {
    // Skip this function during server-side rendering
    if (!isBrowser) return;

    setActiveView(viewId);

    // If changing to a different page
    if (pageHref && pageHref !== currentPage) {
      navigateTo(pageHref, viewId);
      return;
    }

    // Dispatch view change event
    const viewEvent = new CustomEvent("viewChange", {
      detail: {
        viewId: viewId,
        subViewId: activeSubView,
        pageHref: pageHref || currentPage,
      },
    });
    window.dispatchEvent(viewEvent);
  };

  // Handle subview change
  const handleSubViewChange = (subViewId) => {
    // Skip this function during server-side rendering
    if (!isBrowser) return;

    setActiveSubView(subViewId);

    // Dispatch subview change event
    const subViewEvent = new CustomEvent("subViewChange", {
      detail: {
        viewId: activeView,
        subViewId: subViewId,
        pageHref: currentPage,
      },
    });
    window.dispatchEvent(subViewEvent);
  };

  // Handle task action
  const handleTaskAction = (taskId, action) => {
    // Skip this function during server-side rendering
    if (!isBrowser) return;

    if (action) {
      try {
        action();
      } catch (error) {
        console.error("Error executing task action:", error);
      }
    }

    // Dispatch a custom event
    try {
      const event = new CustomEvent("taskAction", {
        detail: { taskId, activeView, activeSubView, currentPage },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error dispatching task action event:", error);
    }
  };

  // Value to be provided by the context
  const value = {
    activeView,
    activeSubView,
    currentPage,
    navigateTo,
    handleViewChange,
    handleSubViewChange,
    handleTaskAction,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}
