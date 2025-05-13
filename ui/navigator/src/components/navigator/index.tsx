// index.ts
// Core components
export { Navigator, useNavigator } from "./main";
export { NavigationHeader } from "./header";
export { NavigationTiers } from "./tiers";

// Customizable components
export {
  NavigatorActions,
  NavigatorAppSwitcher,
  NavigatorSearch,
} from "./main";

// Utility functions
export {
  createIconRenderer,
  createRouterAdapter,
  findActiveItems,
  formatSectionName,
  LetterIcon,
} from "./utils";

// Helper components for conditional rendering
export { Choose, Otherwise, When } from "./cwo";

// Types
export type {
  ActionsProps,
  AppSwitcherProps,
  DisplayMode,
  HeaderProps,
  NavigationLevelDefaults,
  NavigatorContextType,
  NavigatorProps,
  NavTreeNode,
  RouterAdapter,
  SearchProps,
  UserAction,
} from "./main";
