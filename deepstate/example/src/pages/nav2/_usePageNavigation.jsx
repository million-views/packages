import { useEffect, useState } from "preact/hooks";
import { useNavigation } from "./_navigationContext";

/**
 * Custom hook to synchronize page content with navigation state
 *
 * @param {Object} options
 * @param {string} options.pageId - Identifier for the current page
 * @param {Object} options.viewComponents - Map of view components to render
 * @param {Function} options.onViewChange - Callback when view changes
 * @returns {Object} The current view component and state
 */
export function usePageNavigation({
  pageId,
  viewComponents = {},
  onViewChange,
}) {
  // Initialize with safe defaults
  const [currentViewComponent, setCurrentViewComponent] = useState(null);

  // Safely use the navigation context, handling potential errors
  let navigationContext = { activeView: null, activeSubView: null };

  try {
    navigationContext = useNavigation();
  } catch (error) {
    console.error("Navigation context error:", error);
    // Continue with default values
  }

  const { activeView, activeSubView } = navigationContext;

  useEffect(() => {
    // Listen for navigation state changes
    const handleViewChange = (event) => {
      if (!event || !event.detail) return;

      const { viewId, subViewId, pageHref } = event.detail;

      // Only process events for this page
      if (pageHref && !pageHref.includes(pageId)) {
        return;
      }

      // Update component based on the active view
      if (viewId && viewComponents[viewId]) {
        setCurrentViewComponent(viewComponents[viewId]);

        // Call the onViewChange callback if provided
        if (onViewChange) {
          onViewChange(viewId, subViewId);
        }
      }
    };

    window.addEventListener("viewChange", handleViewChange);
    window.addEventListener("subViewChange", handleViewChange);

    // Initial setup - find component for current view
    if (activeView && viewComponents[activeView]) {
      setCurrentViewComponent(viewComponents[activeView]);
    } else if (Object.keys(viewComponents).length > 0) {
      // Default to first view if none specified
      const defaultView = Object.keys(viewComponents)[0];
      setCurrentViewComponent(viewComponents[defaultView]);
    }

    return () => {
      window.removeEventListener("viewChange", handleViewChange);
      window.removeEventListener("subViewChange", handleViewChange);
    };
  }, [pageId, activeView, activeSubView, viewComponents, onViewChange]);

  return {
    ViewComponent: currentViewComponent,
    activeView,
    activeSubView,
  };
}
