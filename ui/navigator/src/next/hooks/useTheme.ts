// file: next/hooks/useTheme.ts
// Enhanced theme hook for use within and outside ThemeProvider

import { useContext } from "react";
import { ThemeContext } from "../context/Theme";
import type { ThemeConfig } from "../types";
import { resolveTheme } from "../theme/utils";

/**
 * Hook for accessing the current theme
 * Can be used both within a ThemeProvider or standalone
 */
export function useTheme(
  theme?: string | ThemeConfig,
  themeOverrides?: Partial<ThemeConfig>
): ThemeConfig {
  const context = useContext(ThemeContext);

  // If we're within a ThemeProvider, use its theme
  if (context) {
    return context.theme;
  }

  // Otherwise, resolve theme from props
  return resolveTheme(theme, themeOverrides);
}