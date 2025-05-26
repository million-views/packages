// file: src/next/navigator/templates/DocsTemplate.tsx
import { useState } from "react";
import type { TemplateProps } from "../types";
import "./styles/docs.css";

export function DocsTemplate({
  navigationTree,
  activeSection,
  isDrawerOpen,
  isMobile,
  toggleDrawer,
  closeDrawer,
  renderIcon,
  isItemActive,
  isItemParentOfActive,
  getItemUrl,
  Link,
  appTitle = "Documentation",
}: TemplateProps) {
  const navItems = navigationTree[activeSection] || [];
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Recursive function to render nav items with proper nesting
  const renderNavItems = (items: any[] = []) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = isItemActive(item);
      const isParentActive = isItemParentOfActive(item);
      const isExpanded = expandedSections[item.id] || isParentActive;

      return (
        <div key={item.id} className="docs-nav-item-container">
          <div className="docs-nav-item-row">
            <Link
              to={getItemUrl(item)}
              className={`docs-nav-item ${isActive ? "active" : ""}`}
            >
              {item.iconName && (
                <span className="docs-nav-item-icon">
                  {renderIcon(item.iconName, 20)}
                </span>
              )}
              <span className="docs-nav-item-label">{item.label}</span>
            </Link>

            {hasChildren && (
              <button
                className="docs-nav-item-expander"
                onClick={() => toggleSection(item.id)}
                aria-label={isExpanded ? "Collapse section" : "Expand section"}
              >
                {renderIcon(isExpanded ? "ChevronDown" : "ChevronRight", 16)}
              </button>
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="docs-nav-item-children">
              {renderNavItems(item.children)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="docs-nav-container">
      <div className="docs-nav-header">
        <div className="docs-nav-header-inner">
          <button
            className="docs-nav-menu-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle menu"
          >
            {renderIcon("Menu", 24)}
          </button>

          <div className="docs-nav-brand">
            <div className="docs-logo">D</div>
            <span className="docs-brand-title">{appTitle}</span>
          </div>

          <div className="docs-nav-controls">
            <div className="docs-version-switcher">
              <span>v2.0</span>
              {renderIcon("ChevronDown", 16)}
            </div>

            <div className="docs-search">
              <input
                type="text"
                placeholder="Search documentation..."
                className="docs-search-input"
              />
              <button className="docs-search-button" aria-label="Search">
                {renderIcon("Search", 20)}
              </button>
            </div>
          </div>

          <div className="docs-nav-actions">
            <button className="docs-nav-action-button" aria-label="GitHub">
              {renderIcon("Github", 24)}
            </button>
            <button
              className="docs-nav-action-button"
              aria-label="Toggle theme"
            >
              {renderIcon("Moon", 24)}
            </button>
          </div>
        </div>
      </div>

      <div className={`docs-nav-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="docs-nav-drawer-content">
          {navItems.map((section) => (
            <div key={section.id} className="docs-nav-section">
              {section.label && (
                <div className="docs-nav-section-title">{section.label}</div>
              )}

              <div className="docs-nav-section-items">
                {renderNavItems(section.children || [])}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isDrawerOpen && (
        <div className="docs-nav-backdrop" onClick={closeDrawer} />
      )}
    </div>
  );
}
