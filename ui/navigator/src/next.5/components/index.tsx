import React, { useEffect, useRef, useState } from "react";
import { useNavigator } from "../Navigator";
import type { ContextAction, NavTreeNode } from "../types";

// file: src/next/navigator/components/Header.tsx
export interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function Header({ className = "", children }: HeaderProps) {
  const { isMobile, toggleDrawer, renderIcon } = useNavigator();

  return (
    <header className={`mv-nav-header ${className}`}>
      <div className="mv-nav-header-inner">
        {isMobile && (
          <button
            className="mv-nav-menu-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle menu"
          >
            {renderIcon("Menu", 24)}
          </button>
        )}

        {children}
      </div>
    </header>
  );
}

// file: src/next/navigator/components/Brand.tsx
export interface BrandProps {
  title: string;
  logo?: React.ReactNode;
  url?: string;
  className?: string;
}

export function Brand({ title, logo, url = "/", className = "" }: BrandProps) {
  const { Link } = useNavigator();

  return (
    <div className={`mv-nav-brand ${className}`}>
      <Link to={url} className="mv-nav-brand-link">
        {logo && <div className="mv-nav-brand-logo">{logo}</div>}
        <span className="mv-nav-brand-title">{title}</span>
      </Link>
    </div>
  );
}

// file: src/next/navigator/components/Drawer.tsx
export interface DrawerProps {
  section?: string;
  mode?: "temporary" | "persistent";
  className?: string;
  children?: React.ReactNode;
  items?: NavTreeNode[]; // New prop to receive navigation items
}

export function Drawer({
  section,
  mode = "temporary",
  className = "",
  children,
  items, // Accept items as prop
}: DrawerProps) {
  const {
    activeSection,
    isDrawerOpen,
    isMobile,
    closeDrawer,
  } = useNavigator();

  // Use provided section or fall back to activeSection
  const sectionId = section || activeSection;

  // Force temporary mode on mobile
  const effectiveMode = isMobile ? "temporary" : mode;
  const isOpen = effectiveMode === "persistent" || isDrawerOpen;

  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && effectiveMode === "temporary") {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, closeDrawer, effectiveMode]);

  // Handle body scroll lock for temporary mode
  useEffect(() => {
    if (isOpen && effectiveMode === "temporary") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, effectiveMode]);

  return (
    <>
      <nav
        className={`mv-nav-drawer ${isOpen ? "open" : ""} ${
          effectiveMode === "persistent" ? "persistent" : "temporary"
        } ${className}`}
        aria-hidden={!isOpen}
      >
        <div className="mv-nav-drawer-content">
          {children}
        </div>
      </nav>

      {/* Backdrop for temporary drawer */}
      {isOpen && effectiveMode === "temporary" && (
        <div
          className="mv-nav-backdrop"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// file: src/next/navigator/components/Tabs.tsx
export interface TabsProps {
  section?: string;
  variant?: "primary" | "secondary";
  overflow?: "scroll" | "dropdown";
  className?: string;
  items?: NavTreeNode[]; // New prop to receive navigation items
}

export function Tabs({
  section,
  variant = "primary",
  overflow = "scroll",
  className = "",
  items, // Accept items as prop
}: TabsProps) {
  const {
    activeSection,
    isItemActive,
    getItemUrl,
    Link,
    renderIcon,
  } = useNavigator();

  // State for overflow handling
  const [showOverflow, setShowOverflow] = useState(false);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Use provided items directly - no navigation tree access
  const navItems = items || [];

  // Check if tabs container needs overflow handling
  useEffect(() => {
    const checkOverflow = () => {
      if (tabsRef.current) {
        const container = tabsRef.current;
        setShowOverflow(container.scrollWidth > container.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [navItems]);

  // Render a single tab
  const renderTab = (item: NavTreeNode) => {
    const isActive = isItemActive(item);

    return (
      <Link
        key={item.id}
        to={getItemUrl(item)}
        className={`mv-nav-tab-item ${isActive ? "active" : ""} ${variant}`}
        aria-current={isActive ? "page" : undefined}
      >
        {item.iconName && (
          <span className="mv-nav-tab-icon">
            {renderIcon(item.iconName, 20)}
          </span>
        )}
        <span className="mv-nav-tab-label">{item.label}</span>
      </Link>
    );
  };

  // Render overflow menu
  const renderOverflowMenu = () => {
    if (!showOverflow || overflow !== "dropdown") return null;

    return (
      <div className="mv-nav-tab-overflow">
        <button
          className="mv-nav-tab-overflow-button"
          onClick={() => setOverflowMenuOpen(!overflowMenuOpen)}
          aria-label="More tabs"
          aria-haspopup="true"
          aria-expanded={overflowMenuOpen}
        >
          {renderIcon("MoreHorizontal", 20)}
        </button>

        {overflowMenuOpen && (
          <div className="mv-nav-tab-overflow-menu">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={getItemUrl(item)}
                className={`mv-nav-tab-overflow-item ${
                  isItemActive(item) ? "active" : ""
                }`}
                onClick={() => setOverflowMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`mv-nav-tabs ${variant} ${className}`}>
      <div
        ref={tabsRef}
        className={`mv-nav-tabs-inner ${
          overflow === "scroll" ? "scrollable" : ""
        }`}
      >
        {navItems.map(renderTab)}
      </div>

      {renderOverflowMenu()}
    </div>
  );
}

// file: src/next/navigator/components/Item.tsx
export interface ItemProps {
  item: NavTreeNode;
  depth?: number;
  onClick?: (item: NavTreeNode) => void;
  className?: string;
}

export function Item({
  item,
  depth = 0,
  onClick,
  className = "",
}: ItemProps) {
  const { isItemActive, isItemParentOfActive, getItemUrl, Link, renderIcon } =
    useNavigator();

  const active = isItemActive(item);
  const parentOfActive = isItemParentOfActive(item);
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(item);
    }
  };

  // If this is a parent with children, render as a Group
  if (hasChildren) {
    return (
      <Group
        title={item.label}
        icon={item.iconName}
        to={getItemUrl(item)}
        active={active}
        expanded={parentOfActive}
        depth={depth}
        className={className}
      >
        {item.children?.map((child) => (
          <Item
            key={child.id}
            item={child}
            depth={depth + 1}
            onClick={onClick}
          />
        ))}
      </Group>
    );
  }

  // Otherwise render as a single item
  return (
    <Link
      to={getItemUrl(item)}
      className={`mv-nav-item depth-${depth} ${
        active ? "active" : ""
      } ${className}`}
      onClick={onClick ? handleClick : undefined}
      aria-current={active ? "page" : undefined}
    >
      {item.iconName && (
        <span className="mv-nav-item-icon">
          {renderIcon(item.iconName, 20)}
        </span>
      )}
      <span className="mv-nav-item-label">{item.label}</span>
    </Link>
  );
}

// file: src/next/navigator/components/Group.tsx
export interface GroupProps {
  title: string;
  icon?: string;
  to?: string;
  active?: boolean;
  expanded?: boolean;
  collapsible?: boolean;
  depth?: number;
  className?: string;
  children: React.ReactNode;
}

export function Group({
  title,
  icon,
  to,
  active = false,
  expanded: initialExpanded = false,
  collapsible = true,
  depth = 0,
  className = "",
  children,
}: GroupProps) {
  const { renderIcon, Link } = useNavigator();
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpanded = (e: React.MouseEvent) => {
    if (collapsible) {
      e.preventDefault();
      e.stopPropagation();
      setExpanded(!expanded);
    }
  };

  const isExpanded = collapsible ? expanded : true;

  // Render the group header
  const renderHeader = () => {
    const inner = (
      <>
        {icon && (
          <span className="mv-nav-group-icon">
            {renderIcon(icon, 20)}
          </span>
        )}
        <span className="mv-nav-group-title">{title}</span>
        {collapsible && (
          <button
            className="mv-nav-group-toggle"
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
          >
            {renderIcon(isExpanded ? "ChevronDown" : "ChevronRight", 16)}
          </button>
        )}
      </>
    );

    return to
      ? (
        <Link
          to={to}
          className={`mv-nav-group-header ${active ? "active" : ""}`}
          aria-current={active ? "page" : undefined}
        >
          {inner}
        </Link>
      )
      : (
        <div
          className="mv-nav-group-header"
          onClick={toggleExpanded}
        >
          {inner}
        </div>
      );
  };

  return (
    <div className={`mv-nav-group depth-${depth} ${className}`}>
      {renderHeader()}

      {isExpanded && (
        <div className="mv-nav-group-children">
          {children}
        </div>
      )}
    </div>
  );
}

// file: src/next/navigator/components/Search.tsx
export interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  expandable?: boolean;
  className?: string;
}

export function Search({
  placeholder = "Search...",
  onSearch,
  expandable = false,
  className = "",
}: SearchProps) {
  const { renderIcon, isMobile } = useNavigator();
  const [expanded, setExpanded] = useState(!expandable);
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const toggleExpand = () => {
    if (expandable) {
      setExpanded(!expanded);

      // If collapsing, clear the query
      if (expanded) {
        setQuery("");
      }
    }
  };

  // If expandable and on mobile, show only icon when collapsed
  if (expandable && !expanded) {
    return (
      <button
        className={`mv-nav-search-button ${className}`}
        onClick={toggleExpand}
        aria-label="Open search"
      >
        {renderIcon("Search", 20)}
      </button>
    );
  }

  return (
    <form
      className={`mv-nav-search ${expandable ? "expandable" : ""} ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="mv-nav-search-container">
        <span className="mv-nav-search-icon">
          {renderIcon("Search", 20)}
        </span>

        <input
          type="text"
          className="mv-nav-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={placeholder}
        />

        {query && (
          <button
            type="button"
            className="mv-nav-search-clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            {renderIcon("X", 16)}
          </button>
        )}

        {expandable && (
          <button
            type="button"
            className="mv-nav-search-collapse"
            onClick={toggleExpand}
            aria-label="Close search"
          >
            {renderIcon("X", 20)}
          </button>
        )}
      </div>
    </form>
  );
}

// file: src/next/navigator/components/Actions.tsx
export interface ActionsProps {
  actions?: ContextAction[];
  position?: "left" | "right" | "center";
  className?: string;
  children?: React.ReactNode;
}

export function Actions({
  actions,
  position = "right",
  className = "",
  children,
}: ActionsProps) {
  const { renderIcon } = useNavigator();

  // If children are provided, render those
  if (children) {
    return (
      <div className={`mv-nav-actions ${position} ${className}`}>
        {children}
      </div>
    );
  }

  // Otherwise render from provided actions array
  return (
    <div className={`mv-nav-actions ${position} ${className}`}>
      {actions?.map((action) => (
        <button
          key={action.id}
          className="mv-nav-action-button"
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.iconName
            ? (
              renderIcon(action.iconName, 24)
            )
            : <span>{action.label}</span>}
        </button>
      ))}
    </div>
  );
}

// file: src/next/navigator/components/Breadcrumbs.tsx
export interface BreadcrumbsProps {
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

export function Breadcrumbs({
  separator = "/",
  maxItems,
  className = "",
}: BreadcrumbsProps) {
  const { getBreadcrumbs, getItemUrl, Link } = useNavigator();

  const breadcrumbs = getBreadcrumbs();
  const items = maxItems && breadcrumbs.length > maxItems
    ? [
      ...breadcrumbs.slice(0, 1),
      { id: "ellipsis", label: "...", path: "" },
      ...breadcrumbs.slice(-Math.max(1, maxItems - 2)),
    ]
    : breadcrumbs;

  if (items.length <= 1) return null;

  return (
    <nav className={`mv-nav-breadcrumbs ${className}`} aria-label="Breadcrumbs">
      <ol className="mv-nav-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className="mv-nav-breadcrumb-item">
              {item.id === "ellipsis"
                ? (
                  <span className="mv-nav-breadcrumb-ellipsis">
                    {item.label}
                  </span>
                )
                : (
                  <>
                    {isLast
                      ? (
                        <span className="mv-nav-breadcrumb-current">
                          {item.label}
                        </span>
                      )
                      : (
                        <Link
                          to={getItemUrl(item)}
                          className="mv-nav-breadcrumb-link"
                        >
                          {item.label}
                        </Link>
                      )}
                  </>
                )}

              {!isLast && (
                <span
                  className="mv-nav-breadcrumb-separator"
                  aria-hidden="true"
                >
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// file: src/next/navigator/components/MegaMenu.tsx
export interface MegaMenuProps {
  item: NavTreeNode;
  columns?: number;
  featured?: boolean;
  className?: string;
}

export function MegaMenu({
  item,
  columns = 3,
  featured = true,
  className = "",
}: MegaMenuProps) {
  const { getRelatedItems, getItemsByTags, getItemUrl, Link, renderIcon } =
    useNavigator();

  // Get related items and organize by tags
  const relatedItems = getRelatedItems(item);
  const categoryItems = relatedItems.filter((i) =>
    i.tags?.includes("category")
  );
  const featuredItems = featured
    ? relatedItems.filter((i) => i.tags?.includes("featured"))
    : [];

  // Split categories into columns
  const categoriesPerColumn = Math.ceil(categoryItems.length / columns);
  const categoryColumns = Array.from(
    { length: columns },
    (_, i) =>
      categoryItems.slice(
        i * categoriesPerColumn,
        (i + 1) * categoriesPerColumn,
      ),
  ).filter((col) => col.length > 0);

  return (
    <div className={`mv-nav-mega-menu ${className}`}>
      {/* Categories section */}
      <div
        className="mv-nav-mega-menu-categories"
        style={{
          gridTemplateColumns: `repeat(${categoryColumns.length}, 1fr)`,
        }}
      >
        {categoryColumns.map((column, colIndex) => (
          <div key={colIndex} className="mv-nav-mega-menu-column">
            {column.map((category) => (
              <Link
                key={category.id}
                to={getItemUrl(category)}
                className="mv-nav-mega-menu-item"
              >
                {category.iconName && (
                  <span className="mv-nav-mega-menu-icon">
                    {renderIcon(category.iconName, 16)}
                  </span>
                )}
                <span className="mv-nav-mega-menu-label">{category.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Featured items section */}
      {featured && featuredItems.length > 0 && (
        <div className="mv-nav-mega-menu-featured">
          <h3 className="mv-nav-mega-menu-heading">Featured</h3>
          <div className="mv-nav-mega-menu-featured-items">
            {featuredItems.map((featuredItem) => (
              <Link
                key={featuredItem.id}
                to={getItemUrl(featuredItem)}
                className="mv-nav-mega-menu-featured-item"
              >
                <div className="mv-nav-mega-menu-featured-placeholder">
                  {featuredItem.iconName &&
                    renderIcon(featuredItem.iconName, 24)}
                </div>
                <span className="mv-nav-mega-menu-featured-label">
                  {featuredItem.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// file: src/next/navigator/components/index.ts
// export { Header } from "./Header";
// export { Brand } from "./Brand";
// export { Drawer } from "./Drawer";
// export { Tabs } from "./Tabs";
// export { Item } from "./Item";
// export { Group } from "./Group";
// export { Search } from "./Search";
// export { Actions } from "./Actions";
// export { Breadcrumbs } from "./Breadcrumbs";
// export { MegaMenu } from "./MegaMenu";
