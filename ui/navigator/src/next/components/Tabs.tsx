// file: next/components/Tabs.tsx
// Tabs component for Navigator

import React from "react";
import { useNavigator } from "../context/Navigator";

interface TabsProps {
  /**
   * The ID of the section to display as tabs
   */
  sectionId?: string;

  /**
   * Custom content
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Tabs component for horizontal navigation
 * Can render a specific navigation section as tabs
 */
export function Tabs({ sectionId, children, className = "" }: TabsProps) {
  const { navigation, activeItem, router, renderIcon } = useNavigator();
  const { Link } = router;

  // If children are provided, render them directly
  if (children) {
    return (
      <div className={`nav-tabs ${className}`}>
        {children}
      </div>
    );
  }

  // Find section to render
  const section = sectionId
    ? navigation.find((s) => s.id === sectionId)
    : navigation[0]; // Default to first section

  if (!section) return null;

  return (
    <div className="nav-primary">
      <nav className={`nav-primary-inner ${className}`}>
        {section.items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${
              activeItem?.id === item.id ? "nav-item-active" : ""
            }`}
            aria-current={activeItem?.id === item.id ? "page" : undefined}
          >
            {item.icon && (
              <span className="nav-item-icon">{renderIcon(item.icon)}</span>
            )}
            <span className="nav-item-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
