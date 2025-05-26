// file: next/theme/utils.ts
// Theme utility functions

import type { ThemeConfig } from '../types';
import { THEME_PRESETS, DEFAULT_THEME } from './constants';

/**
 * Deeply merges two objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof T])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof T] });
        } else {
          output[key as keyof T] = deepMerge(
            target[key as keyof T],
            source[key as keyof T] as any
          );
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof T] });
      }
    });
  }

  return output;
}

/**
 * Checks if a value is an object
 */
export function isObject(item: any): item is Record<string, any> {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Converts a theme config to CSS variables
 */
export function themeToVariables(theme: ThemeConfig): Record<string, string> {
  const variables: Record<string, string> = {};

  // Process colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (value) {
      variables[`--nav-color-${key}`] = value;
    }
  });

  // Process typography
  Object.entries(theme.typography).forEach(([key, value]) => {
    variables[`--nav-typography-${key}`] = value.toString();
  });

  // Process spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables[`--nav-spacing-${key}`] = value;
  });

  // Process borders
  Object.entries(theme.borders).forEach(([key, value]) => {
    variables[`--nav-border-${key}`] = value;
  });

  // Process transitions
  Object.entries(theme.transitions).forEach(([key, value]) => {
    variables[`--nav-transition-${key}`] = value;
  });

  return variables;
}

/**
 * Resolves a theme from name, config, and overrides
 */
export function resolveTheme(
  theme?: string | ThemeConfig,
  overrides?: Partial<ThemeConfig>
): ThemeConfig {
  // Start with default theme
  let baseTheme = DEFAULT_THEME;

  // If theme is a string, look up the preset
  if (typeof theme === 'string') {
    baseTheme = THEME_PRESETS[theme] || DEFAULT_THEME;
  }
  // If theme is an object, use it as the base
  else if (typeof theme === 'object') {
    baseTheme = deepMerge(DEFAULT_THEME, theme);
  }

  // Apply overrides if provided
  if (overrides) {
    return deepMerge(baseTheme, overrides);
  }

  return baseTheme;
}