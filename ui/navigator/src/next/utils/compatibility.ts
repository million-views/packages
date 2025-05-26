// File: next/utils/compatibility.ts
// Utilities for backward compatibility with the old Navigator API

import type {
  NavigatorProps,
  BrandConfig,
  NavigationSection,
  NavigationItem,
  Action,
  ResponsiveConfig
} from '../types';
import { createIconRenderer } from "./icon";

/**
 * Interface for the legacy Navigator props
 */
interface LegacyNavigatorProps {
  navigationTree: Record<string, LegacyNavTreeNode[]>;
  router: any;
  section?: string;
  onSectionChange?: (section: string) => void;
  darkMode?: boolean;
  displayMode?: 'tabs' | 'breadcrumbs' | 'adaptive';
  logo?: React.ReactNode;
  appTitle?: string;
  search?: boolean | React.ReactNode;
  onSearch?: () => void;
  appSwitcher?: boolean | React.ReactNode;
  actions?: any[] | any;
  headerProps?: any;
  navigationLevelDefaults?: any;
  renderIcon?: (name: string) => React.ReactNode;
  theme?: string;
}

/**
 * Interface for the legacy navigation tree node
 */
interface LegacyNavTreeNode {
  id: string;
  path: string;
  label: string;
  iconName?: string;
  end?: boolean;
  children?: LegacyNavTreeNode[];
}

/**
 * Creates a compatibility adapter for legacy Navigator props
 */
export function createNavigatorAdapter(
  legacyProps: LegacyNavigatorProps
): NavigatorProps {
  // Extract props from legacy format
  const {
    navigationTree,
    router,
    darkMode = false,
    displayMode = 'adaptive',
    logo,
    appTitle = 'Application',
    search,
    onSearch,
    appSwitcher,
    actions,
    theme = ''
  } = legacyProps;

  // Transform brand configuration
  const brand: BrandConfig = {
    logo,
    title: appTitle,
    url: '/'
  };

  // Transform navigation tree
  const navigation: NavigationSection[] = adaptNavigationTree(navigationTree);

  // Transform actions
  const transformedActions: Action[] = adaptActions(actions, search, onSearch, appSwitcher);

  // Transform responsive configuration
  // Use tabs instead of breadcrumbs (for now)
  const responsive: ResponsiveConfig = {
    mobile: {
      breakpoint: 767,
      primaryNav: displayMode === 'breadcrumbs' ? 'drawer' : 'tabs',
      categoryNav: 'tabs'
    },
    desktop: {
      primaryNav: displayMode === 'breadcrumbs' ? 'drawer' : 'tabs',
      categoryNav: 'tabs'
    }
  };

  // Transform theme
  const newTheme = theme || (darkMode ? 'dark' : 'default');
  const renderIcon = createIconRenderer({});

  // Transformed props
  return {
    brand,
    navigation,
    router,
    actions: transformedActions,
    responsive,
    theme: newTheme,
    renderIcon
  };
}

/**
 * Adapts the legacy navigation tree to the new format
 */
function adaptNavigationTree(
  navigationTree: Record<string, LegacyNavTreeNode[]>
): NavigationSection[] {
  return Object.entries(navigationTree).map(([sectionId, items], index) => ({
    id: sectionId,
    label: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-/g, " "),
    separator: index > 0, // Add separator after first section
    items: items.map(adaptNavTreeNode)
  }));
}

/**
 * Adapts a legacy nav tree node to the new format
 */
function adaptNavTreeNode(node: LegacyNavTreeNode): NavigationItem {
  return {
    id: node.id,
    label: node.label,
    path: node.path,
    icon: node.iconName, // Now this will be properly rendered by the context
    exact: node.end,
    children: node.children?.map(adaptNavTreeNode)
  };
}

/**
 * Adapts legacy actions to the new format
 */
function adaptActions(
  actions: any[] | any,
  search?: boolean | React.ReactNode,
  onSearch?: () => void,
  appSwitcher?: boolean | React.ReactNode
): Action[] {
  const result: Action[] = [];

  // Add search if enabled
  if (search === true && onSearch) {
    result.push({
      id: 'search',
      label: 'Search',
      icon: 'Search', // String name will be rendered by the context
      type: 'icon',
      position: 'right',
      onClick: onSearch
    });
  }

  // Add app switcher if enabled
  if (appSwitcher === true) {
    result.push({
      id: 'appSwitcher',
      label: 'Apps',
      icon: 'Apps', // String name will be rendered by the context
      type: 'icon',
      position: 'right',
      children: []
    });
  }

  // Handle legacy actions array
  if (Array.isArray(actions)) {
    // It's UserAction[]
    actions.forEach((action, index) => {
      result.push({
        id: action.id || `action-${index}`,
        label: action.label,
        icon: action.iconName, // String name will be rendered by the context
        type: 'button',
        variant: 'default',
        position: 'right',
        onClick: action.onClick
      });
    });
  } else if (actions && typeof actions === 'object' && 'items' in actions) {
    // It's ActionGroup
    const actionGroup = actions;

    // Add dropdown action
    result.push({
      id: 'actionGroup',
      label: actionGroup.label || 'Actions',
      icon: actionGroup.iconName, // String name will be rendered by the context
      type: 'menu',
      position: 'right',
      children: actionGroup.items.map((item: any, index: number) => ({
        id: item.id || `action-${index}`,
        label: item.label,
        icon: item.iconName, // String name will be rendered by the context
        onClick: item.onClick
      }))
    });
  }

  return result;
}