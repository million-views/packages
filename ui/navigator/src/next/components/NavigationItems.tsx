// file: next/components/NavigationItems.tsx
// Component for rendering navigation items - used by Sidebar

import React, { useState } from "react";
import { useNavigator } from "../context/Navigator";

interface NavigationItemsProps {
  sectionId?: string;
  collapsed?: boolean;
}

export function NavigationItems(
  { sectionId, collapsed = false }: NavigationItemsProps,
) {
  const { navigation, activeItem, activeSection, renderIcon, router } =
    useNavigator();

  // Filter sections if sectionId is provided
  const sections = sectionId
    ? navigation.filter((section) => section.id === sectionId)
    : navigation;

  return (
    <>
      {sections.map((section) => (
        <div
          key={section.id}
          className={`nav-sidebar-section ${
            section.separator ? "nav-sidebar-section-separator" : ""
          }`}
        >
          {section.label && !collapsed && (
            <h3 className="nav-sidebar-section-title">{section.label}</h3>
          )}

          <ul className="nav-sidebar-items">
            {section.items.map((item) => (
              <NavigationItem
                key={item.id}
                item={item}
                isActive={activeItem?.id === item.id}
                collapsed={collapsed}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

interface NavigationItemProps {
  item: any; // Using any type here since we're accessing NavigationItem properties
  isActive: boolean;
  depth?: number;
  collapsed?: boolean;
}

function NavigationItem({
  item,
  isActive,
  depth = 0,
  collapsed = false,
}: NavigationItemProps) {
  const { router, renderIcon, actions } = useNavigator();
  const { Link } = router;
  const [isExpanded, setIsExpanded] = useState(isActive);

  // Toggle expanded state
  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Check if item has children
  const hasChildren = item.children && item.children.length > 0;

  // Item classes
  const itemClasses = [
    "nav-sidebar-item",
    isActive ? "nav-sidebar-item-active" : "",
    `nav-sidebar-item-depth-${depth}`,
    collapsed ? "nav-sidebar-item-collapsed" : "",
  ].filter(Boolean).join(" ");

  // Title for collapsed mode
  const itemTitle = collapsed ? item.label : undefined;

  return (
    <li className={itemClasses} title={itemTitle}>
      <div className="nav-sidebar-item-container">
        <Link
          to={item.path}
          className="nav-sidebar-item-link"
          onClick={actions.closeDrawer}
          aria-current={isActive ? "page" : undefined}
        >
          {item.icon && (
            <span className="nav-sidebar-item-icon">
              {renderIcon(item.icon)}
            </span>
          )}
          {!collapsed && (
            <span className="nav-sidebar-item-label">{item.label}</span>
          )}
        </Link>

        {hasChildren && !collapsed && (
          <button
            className="nav-sidebar-item-toggle"
            onClick={toggleExpanded}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded
              ? renderIcon("ChevronDown")
              : renderIcon("ChevronRight")}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && !collapsed && (
        <ul className="nav-sidebar-subitems">
          {item.children?.map((child: any) => (
            <NavigationItem
              key={child.id}
              item={child}
              isActive={child.id === item.id}
              depth={depth + 1}
              collapsed={collapsed}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
