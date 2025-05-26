// file: next/components/Sidebar.tsx
// Unified Sidebar/Drawer component for Navigator

import React from "react";
import type { SidebarProps } from "../types";
import { useNavigator } from "../context/Navigator";
import { NavigationItems } from "./NavigationItems";
import { useResponsive } from "../hooks/useResponsive";

/**
 * Sidebar component that can function as either a persistent sidebar
 * or a mobile drawer depending on the mode prop
 */
export function Sidebar({
  mode: explicitMode,
  isOpen,
  onClose,
  position = "left",
  width,
  collapsed = false,
  children,
  className = "",
  title = "Navigation",
}: SidebarProps) {
  const { theme, actions, isDrawerOpen, renderIcon, responsive } =
    useNavigator();

  // Determine actual mode based on responsive state
  const mode = responsive.isMobile ? "drawer" : (explicitMode || "sidebar");

  // For drawer mode, use context state unless explicit prop provided
  const isVisible = mode === "drawer"
    ? (isOpen !== undefined ? isOpen : isDrawerOpen)
    : true;

  // Use context action handler unless explicit handler provided
  const handleClose = mode === "drawer"
    ? (onClose || actions.closeDrawer)
    : undefined;

  // Simplify by using a single Sidebar/Drawer instance
  if (mode === "sidebar") {
    return (
      <aside className={`nav-sidebar ${className}`} style={{ width }}>
        {children || <NavigationItems collapsed={collapsed} />}
      </aside>
    );
  }

  // For drawer mode, show only when open
  if (mode === "drawer" && isVisible) {
    return (
      <>
        <div className="nav-drawer-backdrop" onClick={handleClose} />
        <aside className={`nav-drawer ${className}`}>
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
