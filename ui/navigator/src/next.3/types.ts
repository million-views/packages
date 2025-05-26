// file: src/next/navigator/types.ts
import { type ReactNode } from 'react';

/**
 * Navigation tree node definition
 */
export interface NavTreeNode {
  /** Unique identifier for the item */
  id: string;

  /** Display label */
  label: string;

  /** Route path */
  path: string;

  /** Icon name for rendering */
  iconName?: string;

  /** Grouping identifier for related items */
  group?: string;

  /** Parent item ID for relationships */
  parent?: string;

  /** Section membership */
  section?: string;

  /** Display type for specialized rendering */
  displayType?: "default" | "megamenu" | "dropdown" | "tab";

  /** Whether to match exactly (active only when path matches exactly) */
  end?: boolean;

  /** Actions shown when this item is active */
  contextActions?: ContextAction[];

  /** Child navigation items */
  children?: NavTreeNode[];
}

/**
 * Context action definition
 */
export interface ContextAction {
  id: string;
  label: string;
  iconName?: string;
  onClick?: () => void;
}

/**
 * Template API props - contract between Navigator and templates
 */
export interface TemplateProps {
  /** Navigation data across all sections */
  navigationTree: Record<string, NavTreeNode[]>;

  /** Current active section */
  activeSection: string;

  /** Optional secondary section (for multi-section layouts) */
  secondarySection?: string;

  /** Currently active navigation item */
  activeItem: NavTreeNode | null;

  /** UI state - drawer visibility */
  isDrawerOpen: boolean;

  /** Responsive state */
  isMobile: boolean;

  /** Toggle drawer visibility */
  toggleDrawer: () => void;

  /** Close drawer */
  closeDrawer: () => void;

  /** Get navigation items by group attribute */
  getItemsByGroup: (group: string) => NavTreeNode[];

  /** Get navigation items by display type */
  getItemsByDisplayType: (type: string) => NavTreeNode[];

  /** Get items related to a parent item */
  getRelatedItems: (parentItem: NavTreeNode) => NavTreeNode[];

  /** Get breadcrumb trail to active item */
  getBreadcrumbs: () => NavTreeNode[];

  /** Render an icon by name */
  renderIcon: (name: string | ReactNode, size?: number) => ReactNode;

  /** Check if item is active */
  isItemActive: (item: NavTreeNode) => boolean;

  /** Check if item is parent of active item */
  isItemParentOfActive: (item: NavTreeNode) => boolean;

  /** Get URL for navigation item */
  getItemUrl: (item: NavTreeNode) => string;

  /** Router Link component */
  Link: React.ComponentType<any>;

  /** Application title */
  appTitle?: string;
}