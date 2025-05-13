// index.ts
// Types
export * from "./types";

// Core components
export { Navigator } from "./main";
export { useNavigator } from "./context";
export { NavigationHeader } from "./header";
export { NavigationTiers } from "./tiers";

// Customizable components
export { NavigatorSearch } from "./search";
export { NavigatorAppSwitcher } from "./switcher";
export { NavigatorActions } from "./actions";

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
