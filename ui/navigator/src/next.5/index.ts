// file: src/next/navigator/index.ts
// Main package exports

// Core
export { Navigator } from './Navigator';
export { useNavigator } from './Navigator';
export type { NavigatorProps, NavTreeNode, ContextAction, TemplateProps } from './types';

// Standard components
export {
  Header,
  Brand,
  Drawer,
  Tabs,
  Item,
  Group,
  Search,
  Actions,
  Breadcrumbs,
  MegaMenu
} from './components';

// Templates
export { Dashboard } from "./templates/Dashboard";
export { Docs } from "./templates/Docs"
export { Ecommerce } from "./templates/Ecommerce";
export { News } from "./templates/News";

// Utilities
export { createIconRenderer } from './utils/icon';