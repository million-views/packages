// file: src/next/navigator/Navigator.tsx
import React, { useCallback, useMemo, useState } from "react";
import { DashboardTemplate } from "./templates/Dashboard";
import { DocsTemplate } from "./templates/Docs";
import { EcommerceTemplate } from "./templates/Ecommerce";
import { NewsTemplate } from "./templates/News";
import type { NavTreeNode, TemplateProps } from "./types";

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
  dashboard: DashboardTemplate,
  docs: DocsTemplate,
  ecommerce: EcommerceTemplate,
  news: NewsTemplate,
  default: DashboardTemplate, // Fallback
};

// Navigator component props
export interface NavigatorProps {
  navigationTree: Record<string, NavTreeNode[]>;
  section: string;
  secondarySection?: string;
  router: {
    Link: React.ComponentType<any>;
    useLocation: () => { pathname: string };
    matchPath: (pattern: string, pathname: string) => any | null;
  };
  renderIcon: (
    name: string | React.ReactNode,
    size?: number,
  ) => React.ReactNode;
  template?: string | React.ComponentType<TemplateProps>;
  appTitle?: string;
}

export function Navigator({
  navigationTree,
  section,
  secondarySection,
  router,
  renderIcon,
  template = "default",
  appTitle,
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
    Object.values(navigationTree).forEach((section) => {
      allItems.push(...section);
    });

    return findActiveItem(allItems);
  }, [navigationTree, findActiveItem]);

  // Navigation utilities
  const getItemsByGroup = useCallback((group: string): NavTreeNode[] => {
    const result: NavTreeNode[] = [];

    const processItems = (items: NavTreeNode[]) => {
      for (const item of items || []) {
        if (item.group === group) result.push(item);
        if (item.children) processItems(item.children);
      }
    };

    Object.values(navigationTree).forEach((sectionItems) => {
      processItems(sectionItems);
    });

    return result;
  }, [navigationTree]);

  const getItemsByDisplayType = useCallback(
    (displayType: string): NavTreeNode[] => {
      const result: NavTreeNode[] = [];

      const processItems = (items: NavTreeNode[]) => {
        for (const item of items || []) {
          if (item.displayType === displayType) result.push(item);
          if (item.children) processItems(item.children);
        }
      };

      Object.values(navigationTree).forEach((sectionItems) => {
        processItems(sectionItems);
      });

      return result;
    },
    [navigationTree],
  );

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

      Object.values(navigationTree).forEach((sectionItems) => {
        processItems(sectionItems);
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

    Object.values(navigationTree).forEach((sectionItems) => {
      findPath(sectionItems, activeItem.id);
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

  // Prepare template props
  const templateProps: TemplateProps = {
    navigationTree,
    activeSection: section,
    secondarySection,
    activeItem,
    isDrawerOpen,
    isMobile,
    toggleDrawer: () => setDrawerOpen((prev) => !prev),
    closeDrawer: () => setDrawerOpen(false),

    // Navigation utilities
    getItemsByGroup,
    getItemsByDisplayType,
    getRelatedItems,
    getBreadcrumbs,

    // Rendering utilities
    renderIcon,
    isItemActive,
    isItemParentOfActive,
    getItemUrl,

    // Router
    Link,

    // App identity
    appTitle,
  };

  // Render appropriate template
  const TemplateComponent = typeof template === "string"
    ? TEMPLATES[template] || TEMPLATES.default
    : template;

  return <TemplateComponent {...templateProps} />;
}
