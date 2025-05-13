// NavigatorUtils.tsx
import React from "react";
import { type NavTreeNode } from "./main";

/**
 * Format a section key into a display-friendly name
 *
 * @param sectionKey The section key to format
 * @returns Formatted section name
 */
export function formatSectionName(sectionKey: string): string {
  return sectionKey.charAt(0).toUpperCase() +
    sectionKey.slice(1).replace(/-/g, " ");
}

/**
 * Create a default icon renderer that displays a fallback for missing icons
 *
 * @param icons Map of icon names to rendering functions
 * @returns A function that renders an icon by name
 */
export function createIconRenderer(
  icons: Record<string, (size: number) => React.ReactNode>,
) {
  return (name: string, size: number = 20) => {
    if (icons[name]) {
      return icons[name](size);
    }

    // Default letter icon when icon not found
    return <LetterIcon label={name} size={size} />;
  };
}

/**
 * Create a fallback letter icon
 */
export function LetterIcon(
  { label, size = 24 }: { label: string; size?: number },
) {
  // console.log("LetterIcon", label, size);
  const cp = label.codePointAt(0) || 0;
  const c = String.fromCodePoint(cp).toLocaleUpperCase();
  // const c = label?.[0]?.toUpperCase() || "";
  const s = +size;
  const h = s / 2;
  const r = h - 1;
  const fs = s * 0.6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={h} cy={h} r={r} fill="none" />
      <text
        x="50%"
        y="50%"
        dy=".35em"
        textAnchor="middle"
        fontWeight="100"
        fontFamily="system-ui"
        fontSize={fs}
      >
        {c}
      </text>
    </svg>
  );
}

/**
 * Find active items in a navigation tree based on the current path
 *
 * @param navigationItems The navigation items to search
 * @param pathname The current path
 * @param matchPathFn The matchPath function from router adapter
 * @returns Object containing active items and breadcrumbs
 */
export function findActiveItems(
  navigationItems: NavTreeNode[],
  pathname: string,
  matchPathFn: (pattern: any, pathname: string) => any | null,
) {
  let activePrimary: NavTreeNode | null = null;
  let activeSecondary: NavTreeNode | null = null;
  let activeTertiary: NavTreeNode | null = null;
  const breadcrumbs: NavTreeNode[] = [];

  // Helper to check if a path is active or a parent of active path
  const isPathActiveOrParent = (path: string) => {
    // Direct match
    if (path === pathname) return true;

    // Check if parent path
    if (path !== "/" && pathname.startsWith(path + "/")) return true;

    // Use matchPath
    const match = matchPathFn(path, pathname);
    return match !== null;
  };

  // Find active primary item
  for (const item of navigationItems) {
    if (isPathActiveOrParent(item.path)) {
      activePrimary = item;
      breadcrumbs.push(item);
      break;
    }
  }

  // Get secondary items and find active one
  let secondaryItems: NavTreeNode[] = [];
  if (activePrimary?.children?.length) {
    secondaryItems = activePrimary.children;

    for (const item of secondaryItems) {
      if (isPathActiveOrParent(item.path)) {
        activeSecondary = item;
        breadcrumbs.push(item);
        break;
      }
    }
  }

  // Get tertiary items and find active one
  let tertiaryItems: NavTreeNode[] = [];
  if (activeSecondary?.children?.length) {
    tertiaryItems = activeSecondary.children;

    for (const item of tertiaryItems) {
      if (isPathActiveOrParent(item.path)) {
        activeTertiary = item;
        breadcrumbs.push(item);
        break;
      }
    }
  }

  return {
    activeItems: {
      primary: activePrimary,
      secondary: activeSecondary,
      tertiary: activeTertiary,
    },
    primaryItems: navigationItems,
    secondaryItems,
    tertiaryItems,
    breadcrumbs,
  };
}

/**
 * Create a React Router compatible adapter from required functions
 *
 * @param Link Link component
 * @param useLocation useLocation hook
 * @param matchPath matchPath function
 * @param navigate optional navigate function
 * @returns A router adapter object
 */
export function createRouterAdapter(
  Link: React.ComponentType<any>,
  useLocation: () => { pathname: string },
  matchPath: (pattern: any, pathname: string) => any | null,
  navigate?: (to: string) => void,
) {
  return {
    Link,
    useLocation,
    matchPath,
    navigate,
  };
}
