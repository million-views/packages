// file: next/components/Header.tsx
// Header component for Navigator

import React from "react";
import type { HeaderProps } from "../types";
import { useNavigator } from "../context/Navigator";

/**
 * Header component that renders at the top of the Navigator
 * Can contain Brand, Actions, and custom content through composition
 */
export function Header({ children, className = "" }: HeaderProps) {
  const { theme } = useNavigator();

  // Generate CSS custom properties for the header
  const headerStyle = {
    "--header-height": theme.spacing.headerHeight,
    "--header-padding": theme.spacing.navItemPadding,
  } as React.CSSProperties;

  return (
    <header className={`nav-header ${className}`} style={headerStyle}>
      <div className="nav-header-inner">
        {children}
      </div>
    </header>
  );
}
