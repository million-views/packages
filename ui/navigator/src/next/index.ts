// file: next/index.ts
// Main entry point for the Navigator component

// Export main component and subcomponents
export { Navigator } from './components/Navigator';
export { Header } from './components/Header';
export { Brand } from './components/Brand';
export { Drawer } from './components/Drawer';
export { Actions } from './components/Actions';
export { Tabs } from './components/Tabs';
export { Content } from './components/Content';
export { NavigationItems } from './components/NavigationItems';

// Export hooks and context
export { NavigatorProvider, useNavigator } from './context/Navigator';
export { ThemeContext, ThemeProvider } from './context/Theme';
export { useTheme } from './hooks/useTheme';
export { useResponsive } from './hooks/useResponsive';
export { useMediaQuery } from './hooks/useMediaQuery';

// Export icon utilities
export { createIconRenderer, LetterIcon } from './utils/icon';

// Export theme utilities and constants
export {
  resolveTheme,
  themeToVariables,
  deepMerge
} from './theme/utils';

export {
  THEME_PRESETS,
  DEFAULT_THEME,
  GOOGLE_NEWS_THEME
} from './theme/constants';

// Export types
export type {
  NavigatorProps,
  BrandProps,
  HeaderProps,
  DrawerProps,
  ActionsProps,
  ContentProps,
  NavigationSection,
  NavigationItem,
  Action,
  ResponsiveConfig,
  ThemeConfig,
  RouterAdapter
} from './types';