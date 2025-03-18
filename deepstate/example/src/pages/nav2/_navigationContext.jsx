import { createContext } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";

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
  // Initialize state based on basic defaults
  // We'll update from URL in useEffect
  const [activeView, setActiveView] = useState(null);
  const [activeSubView, setActiveSubView] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);
  const initRef = useRef(false);

  // Parse URL on initial load to set navigation state
  useEffect(() => {
    // Skip if we've already initialized
    if (initRef.current) return;

    try {
      // Set initialization flag
      initRef.current = true;

      // Initial state setup from URL
      const url = new URL(window.location.href);
      const viewParam = url.searchParams.get("view");
      const subViewParam = url.searchParams.get("subview");
      const pathname = url.pathname;

      console.log("Initializing navigation state:", {
        pathname,
        viewParam,
        subViewParam,
      });

      setCurrentPage(pathname);

      // For dashboard page, set default view if not provided
      const isDashboard = pathname.includes("/dashboard");
      if (isDashboard && !viewParam) {
        setActiveView("overview");
      } else if (viewParam) {
        setActiveView(viewParam);
      }

      // For overview view, set default subview if not provided
      if (
        (isDashboard && !viewParam && !subViewParam) ||
        (viewParam === "overview" && !subViewParam)
      ) {
        setActiveSubView("summary");
      } else if (subViewParam) {
        setActiveSubView(subViewParam);
      }

      // Listen for initialization event from Astro layout
      const handleInitState = (event) => {
        if (!event || !event.detail) return;

        const { pathname, view, subview } = event.detail;
        console.log("Received init navigation state:", {
          pathname,
          view,
          subview,
        });

        if (pathname) {
          setCurrentPage(pathname);
        }

        if (view) {
          setActiveView(view);
        }

        if (subview) {
          setActiveSubView(subview);
        }
      };

      window.addEventListener("initNavigationState", handleInitState);

      return () => {
        window.removeEventListener("initNavigationState", handleInitState);
      };
    } catch (error) {
      console.error("Error initializing navigation state:", error);
    }
  }, []);

  // Update URL when navigation state changes
  useEffect(() => {
    try {
      if (!currentPage) return;

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

      console.log("Navigation state updated:", {
        activeView,
        activeSubView,
        currentPage,
      });
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  }, [activeView, activeSubView, currentPage]);

  // Navigate to a page - memoize to avoid recreating on every render
  const navigateTo = useCallback((href, viewId = null, subViewId = null) => {
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
  }, [currentPage, activeView]);

  // Handle view change - memoize to avoid recreating on every render
  const handleViewChange = useCallback((viewId, pageHref = null) => {
    console.log("Changing view to:", viewId);
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
  }, [navigateTo, currentPage, activeSubView]);

  // Handle subview change - memoize to avoid recreating on every render
  const handleSubViewChange = useCallback((subViewId) => {
    console.log("Changing subview to:", subViewId);
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
  }, [activeView, currentPage]);

  // Handle task action - memoize to avoid recreating on every render
  const handleTaskAction = useCallback((taskId, action) => {
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
  }, [activeView, activeSubView, currentPage]);

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
