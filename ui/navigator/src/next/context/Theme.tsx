// file: next/context/Theme.tsx
// Theme context provider

import React, { createContext, type ReactNode, useEffect } from "react";
import type { ThemeConfig } from "../types";
import { resolveTheme, themeToVariables } from "../theme/utils";

interface ThemeContextValue {
  theme: ThemeConfig;
}

interface ThemeProviderProps {
  children: ReactNode;
  theme?: string | ThemeConfig;
  themeOverrides?: Partial<ThemeConfig>;
}

// Create theme context
export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Provider component for theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme,
  themeOverrides,
}) => {
  // Resolve the theme
  const resolvedTheme = resolveTheme(theme, themeOverrides);

  // Apply theme variables to document root
  useEffect(() => {
    // Skip during SSR
    if (typeof document === "undefined") {
      return;
    }

    // Convert theme to CSS variables
    const variables = themeToVariables(resolvedTheme);

    // Apply variables to document root
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Clean up when component unmounts or theme changes
    return () => {
      Object.keys(variables).forEach((key) => {
        document.documentElement.style.removeProperty(key);
      });
    };
  }, [resolvedTheme]);

  // Theme context value
  const contextValue: ThemeContextValue = {
    theme: resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
