// file: src/next/navigator/Navigator.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  ContextAction,
  NavigatorContextType,
  NavigatorProps,
  NavTreeNode,
  TemplateProps,
} from "./types";

// Import templates
import { Dashboard } from "./templates/Dashboard";
import { Docs } from "./templates/Docs";
import { Ecommerce } from "./templates/Ecommerce";
import { News } from "./templates/News";

// Media query hook
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [query]);

  return matches;
};

// Templates registry
const TEMPLATES: Record<string, React.ComponentType<TemplateProps>> = {
  dashboard: Dashboard,
  docs: Docs,
  ecommerce: Ecommerce,
  news: News,
  default: Dashboard, // Fallback
};

const NavigatorContext = createContext<NavigatorContextType | null>(null);

// Custom hook to use Navigator context
export const useNavigator = () => {
  const context = useContext(NavigatorContext);
  if (!context) {
    throw new Error("useNavigator must be used within a Navigator component");
  }
  return context;
};

export function Navigator({
  navigationTree,
  section,
  secondarySection,
  router,
  renderIcon,
  template = "default",
  appTitle,
  logo,
  actionHandlers = {},
}: NavigatorProps) {
  const { Link, useLocation, matchPath } = router;
  const { pathname } = useLocation();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Find active item in tree
  const findActiveItem = useCallback(
    (items: NavTreeNode[]): NavTreeNode | null => {
      for (const item of items || []) {
        // Check if this item matches the current path
        const isActive = item.path && matchPath(item.path, pathname);
        if (isActive) return item;

        // If not, check its children
        if (item.children && item.children.length > 0) {
          const activeChild = findActiveItem(item.children);
          if (activeChild) return activeChild;
        }
      }
      return null;
    },
    [pathname, matchPath],
  );

  const activeItem = useMemo(() => {
    // Flatten all sections to find the active item
    const allItems: NavTreeNode[] = [];
    Object.entries(navigationTree).forEach(([key, items]) => {
      // Only process actual navigation sections (skip 'actions')
      if (key !== "actions") {
        allItems.push(...items);
      }
    });

    return findActiveItem(allItems);
  }, [navigationTree, findActiveItem]);

  // Get a flattened array of all navigation items (excluding actions)
  const getAllItems = useCallback((): NavTreeNode[] => {
    const allItems: NavTreeNode[] = [];

    const processItems = (items: NavTreeNode[]) => {
      for (const item of items || []) {
        allItems.push(item);
        if (item.children) processItems(item.children);
      }
    };

    Object.entries(navigationTree).forEach(([key, items]) => {
      // Only process actual navigation sections (skip 'actions')
      if (key !== "actions") {
        processItems(items);
      }
    });

    return allItems;
  }, [navigationTree]);

  // Find an item by ID
  const findItemById = useCallback(
    (id: string): NavTreeNode | null => {
      const allItems = getAllItems();
      return allItems.find((item) => item.id === id) || null;
    },
    [getAllItems],
  );

  // Navigation utilities
  const getItemsByTags = useCallback((tag: string): NavTreeNode[] => {
    const result: NavTreeNode[] = [];

    const processItems = (items: NavTreeNode[]) => {
      for (const item of items || []) {
        if (item.tags?.includes(tag)) result.push(item);
        if (item.children) processItems(item.children);
      }
    };

    Object.entries(navigationTree).forEach(([key, items]) => {
      // Include global actions with matching tags
      if (key === "actions") {
        items.forEach((item) => {
          if (item.tags?.includes(tag)) {
            result.push(item);
          }
        });
      } else {
        // Process regular navigation items
        processItems(items);
      }
    });

    return result;
  }, [navigationTree]);

  const getRelatedItems = useCallback(
    (parentItem: NavTreeNode): NavTreeNode[] => {
      // Get items with this parent's ID as their parent property
      const result: NavTreeNode[] = [];

      const processItems = (items: NavTreeNode[]) => {
        for (const item of items || []) {
          if (item.parent === parentItem.id) result.push(item);
          if (item.children) processItems(item.children);
        }
      };

      Object.entries(navigationTree).forEach(([key, items]) => {
        // Skip 'actions' section
        if (key !== "actions") {
          processItems(items);
        }
      });

      return result;
    },
    [navigationTree],
  );

  const getBreadcrumbs = useCallback((): NavTreeNode[] => {
    if (!activeItem) return [];

    const breadcrumbs: NavTreeNode[] = [];

    const findPath = (
      items: NavTreeNode[],
      targetId: string,
      currentPath: NavTreeNode[] = [],
    ): boolean => {
      for (const item of items || []) {
        const newPath = [...currentPath, item];

        if (item.id === targetId) {
          breadcrumbs.push(...newPath);
          return true;
        }

        if (item.children && findPath(item.children, targetId, newPath)) {
          return true;
        }
      }

      return false;
    };

    Object.entries(navigationTree).forEach(([key, items]) => {
      // Skip 'actions' section
      if (key !== "actions") {
        findPath(items, activeItem.id);
      }
    });

    return breadcrumbs;
  }, [navigationTree, activeItem]);

  // Template utilities
  const isItemActive = useCallback((item: NavTreeNode): boolean => {
    if (!item || !item.path) return false;

    // Check for exact match
    const isExactMatch = matchPath(item.path, pathname);
    if (isExactMatch) return true;

    // For items with end: true, only return true for exact matches
    if (item.end) return false;

    // Otherwise check if it's a parent of active item
    return isItemParentOfActive(item);
  }, [pathname, matchPath]);

  const isItemParentOfActive = useCallback((item: NavTreeNode): boolean => {
    if (!activeItem || !item) return false;

    const breadcrumbs = getBreadcrumbs();
    return breadcrumbs.some((crumb) => crumb.id === item.id);
  }, [activeItem, getBreadcrumbs]);

  const getItemUrl = useCallback((item: NavTreeNode): string => {
    return item.path || "";
  }, []);

  // Action handling
  const handleAction = useCallback((actionId: string, params?: any) => {
    // Special case: If actionId equals path of an item, treat as navigation
    const item = findItemById(actionId);

    // If we found a matching item with a path, use it for navigation
    if (item?.path) {
      // Navigate to the path (using router.navigate or similar)
      console.log(`Navigating to: ${item.path}`);
      // In a real implementation, we'd use the router's navigate function
      window.location.href = item.path;
      return;
    }

    // If we have a handler for this action, call it
    if (actionHandlers[actionId]) {
      actionHandlers[actionId](params);
      return;
    }

    // If no handler found, log a warning
    console.warn(`No handler found for action: ${actionId}`);
  }, [findItemById, actionHandlers]);

  // Get global actions from the navigationTree
  const getGlobalActions = useCallback((): NavTreeNode[] => {
    // Global actions are in navigationTree.actions with tags including "global"
    return navigationTree.actions?.filter((action) =>
      action.tags?.includes("global") && action.tags?.includes("action")
    ) || [];
  }, [navigationTree]);

  // Get context actions for the active item
  const getContextActions = useCallback((): ContextAction[] => {
    if (!activeItem) return [];
    return activeItem.actions || [];
  }, [activeItem]);

  // Create context value
  const contextValue: NavigatorContextType = {
    navigationTree,
    activeSection: section,
    secondarySection,
    activeItem,
    isDrawerOpen,
    isMobile,
    toggleDrawer: () => setDrawerOpen((prev) => !prev),
    closeDrawer: () => setDrawerOpen(false),
    getItemsByTags,
    getRelatedItems,
    getBreadcrumbs,
    renderIcon,
    isItemActive,
    isItemParentOfActive,
    getItemUrl,
    Link,
    appTitle,
    logo,
    // Action handling
    handleAction,
    getGlobalActions,
    getContextActions,
  };

  // Determine which template to use and pass appropriate props
  const TemplateComponent = typeof template === "string"
    ? TEMPLATES[template] || TEMPLATES.default
    : template;

  return (
    <NavigatorContext.Provider value={contextValue}>
      <TemplateComponent />
    </NavigatorContext.Provider>
  );
}
