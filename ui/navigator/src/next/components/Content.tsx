// file: next/components/Content.tsx
// Content component for Navigator

import React from "react";
import type { ContentProps } from "../types";
import { useNavigator } from "../context/Navigator";

/**
 * Content component for Navigator
 * Provides a standardized container for page content
 */
export function Content({
  children,
  className = "",
  padded = true,
}: ContentProps) {
  const { theme } = useNavigator();

  // Default padding from theme or reasonable value
  const padding = padded ? "24px" : "0";

  return (
    <main className={`nav-content ${className}`} style={{ padding }}>
      {children}
    </main>
  );
}
