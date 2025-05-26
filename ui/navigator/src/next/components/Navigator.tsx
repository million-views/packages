// file: next/components/Navigator.tsx
// Main Navigator component with composition-based API

import React from "react";
import type { NavigatorProps } from "../types";
import { NavigatorProvider } from "../context/Navigator";
import { ThemeProvider } from "../context/Theme";
import "../navigator.css"; // Import base styles

/**
 * Main Navigator component
 * Serves as the composition root for building navigation UIs
 */
export function Navigator({
  // Required props
  brand,
  navigation,
  router,
  renderIcon,

  // Optional props
  actions = [],
  responsive,
  theme = "default",
  themeOverrides,

  // Children for composition
  children,
}: NavigatorProps) {
  // Validate required props
  if (!renderIcon) {
    throw new Error("Navigator: renderIcon function is required");
  }

  return (
    <ThemeProvider theme={theme} themeOverrides={themeOverrides}>
      <NavigatorProvider
        navigation={navigation}
        router={router}
        responsiveConfig={responsive}
        renderIcon={renderIcon}
        theme={theme}
        themeOverrides={themeOverrides}
      >
        <div className="nav-container">
          {children}
        </div>
      </NavigatorProvider>
    </ThemeProvider>
  );
}
