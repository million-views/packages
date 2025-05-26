// file: src/next/navigator/types.ts

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

  /** Array of categorization tags */
  tags?: string[];

  /** Parent item ID for relationships */
  parent?: string;

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
 * Type for UI component override nodes
 * Can be a React node or a nested record of overrides
 */
export type ComponentOverride = React.ReactNode;

/**
 * Recursive component tree type - allows for arbitrary nesting
 * Each node in the tree represents a customizable "slot" in the template
 */
export interface ComponentTree {
  [key: string]: ComponentOverride | ComponentTree;
}

/**
 * Template props with configurable component structure, defines what a template
 * receives. Defaults to flexible ComponentTree if no specific type is provided.
 * 
 * NOTE: 
 * 
 * 1. Navigator Template designers should utilize `useNavigator` hook to access
 *    state and model transforming utility functions.
 * 
 * 2. Templates define their own component tree structure, with each node
 *    representing a customizable UI element slot.
 * 
 * 3. We provide 4 built-in templates ("dashboard" | "docs" | "ecommerce" | "news")
 *    for specialized navigation patterns that can be extended or customized by
 *    using this prop.
 */
export interface TemplateProps<TComponents = ComponentTree> {
  /** 
   * Component overrides - a tree structure of UI elements
   * that can replace standard components at various levels.
   * 
   * Each template defines its own structure for this tree,
   * creating a contract between the template and its consumers.
   */
  components?: TComponents;
}

// Navigator context
export interface NavigatorContextType {
  navigationTree: Record<string, NavTreeNode[]>;
  activeSection: string;
  secondarySection?: string;
  activeItem: NavTreeNode | null;
  isDrawerOpen: boolean;
  isMobile: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  getItemsByTags: (tag: string) => NavTreeNode[];
  getRelatedItems: (parentItem: NavTreeNode) => NavTreeNode[];
  getBreadcrumbs: () => NavTreeNode[];
  renderIcon: (
    name: string | React.ReactNode,
    size?: number,
  ) => React.ReactNode;
  isItemActive: (item: NavTreeNode) => boolean;
  isItemParentOfActive: (item: NavTreeNode) => boolean;
  getItemUrl: (item: NavTreeNode) => string;
  Link: React.ComponentType<any>;
  appTitle?: string;
  logo?: React.ReactNode | string;
}

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
  logo?: React.ReactNode | string;
}
