// file: next/components/Drawer.tsx
// Unified Drawer component for Navigator (renamed from Sidebar)

import React from "react";
import type { DrawerProps } from "../types";
import { useNavigator } from "../context/Navigator";
import { NavigationItems } from "./NavigationItems";

/**
 * Drawer component that can function as either a persistent sidebar
 * or a temporary mobile overlay depending on the mode prop
 */
export function Drawer({
  mode: explicitMode = "temporary",
  isOpen,
  onClose,
  position = "left",
  width,
  collapsed = false,
  children,
  className = "",
  title = "Navigation",
}: DrawerProps) {
  const { theme, actions, isDrawerOpen, renderIcon, responsive } =
    useNavigator();

  // Force temporary mode on mobile regardless of provided mode
  const mode = responsive.isMobile ? "temporary" : explicitMode;

  // For temporary mode, use context state unless explicit prop provided
  const isVisible = mode === "temporary"
    ? (isOpen !== undefined ? isOpen : isDrawerOpen)
    : true;

  // Use context action handler unless explicit handler provided
  const handleClose = mode === "temporary"
    ? (onClose || actions.closeDrawer)
    : undefined;

  // Style for drawer
  const drawerStyle = {
    width: collapsed
      ? "64px"
      : (width || theme.spacing.sidebarWidth || "280px"),
  };

  if (mode === "persistent") {
    return (
      <aside
        className={`nav-drawer nav-drawer-persistent ${className}`}
        style={drawerStyle}
      >
        {children || <NavigationItems collapsed={collapsed} />}
      </aside>
    );
  }

  if (mode === "temporary" && isVisible) {
    return (
      <>
        <div className="nav-drawer-backdrop" onClick={handleClose} />
        <aside
          className={`nav-drawer nav-drawer-temporary nav-drawer-${position} ${className}`}
          style={drawerStyle}
        >
          <div className="nav-drawer-header">
            <h2 className="nav-drawer-title">{title}</h2>
            <button className="nav-drawer-close" onClick={handleClose}>
              {renderIcon("Close")}
            </button>
          </div>
          <div className="nav-drawer-content">
            {children || <NavigationItems />}
          </div>
        </aside>
      </>
    );
  }

  return null;
}
