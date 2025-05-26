// file: next/theme/constants.ts
// Theme constant values and presets

import type { ThemeConfig } from '../types';

// Google News theme preset
export const GOOGLE_NEWS_THEME: ThemeConfig = {
  colors: {
    primary: '#4285F4',
    surface: '#FFFFFF',
    navSeparator: '#DADCE0',
    activeTabIndicator: '#4285F4',
    activeTabBackground: '#E8F0FE',
    text: '#202124',
    textMuted: '#5F6368',
    buttonPrimary: '#1a73e8',
    buttonPrimaryText: '#FFFFFF'
  },
  typography: {
    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
    headerSize: '20px',
    navSize: '14px',
    fontWeightNormal: 400,
    fontWeightBold: 500
  },
  spacing: {
    headerHeight: '64px',
    navItemPadding: '0 16px',
    sectionSpacing: '24px'
  },
  borders: {
    navSeparator: '1px solid var(--nav-color-separator)',
    radius: '4px'
  },
  transitions: {
    navHover: 'background-color 0.2s ease',
    menuExpand: 'all 0.3s ease'
  }
};

// Default theme
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#0066FF',
    surface: '#FFFFFF',
    navSeparator: '#EAEAEA',
    activeTabIndicator: '#0066FF',
    activeTabBackground: '#F5F8FF',
    text: '#2D3748',
    textMuted: '#718096'
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    headerSize: '18px',
    navSize: '14px',
    fontWeightNormal: 400,
    fontWeightBold: 600
  },
  spacing: {
    headerHeight: '60px',
    navItemPadding: '0 16px',
    sectionSpacing: '20px'
  },
  borders: {
    navSeparator: '1px solid var(--nav-color-separator)',
    radius: '4px'
  },
  transitions: {
    navHover: 'background-color 0.15s ease',
    menuExpand: 'all 0.25s ease'
  }
};

// Available theme presets
export const THEME_PRESETS: Record<string, ThemeConfig> = {
  'default': DEFAULT_THEME,
  'google-news': GOOGLE_NEWS_THEME
};