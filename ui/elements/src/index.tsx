/**
 * @m5nv/ui-elements - CLEAN VERSION
 *
 * Opinionated, data-driven, themeable UI component library with standardized container queries.
 * Now featuring CLEAN dedicated container patterns for truly responsive components.
 *
 * USP: Unlike headless UI libraries that provide behavior without styling,
 * Elements provides complete styled components with comprehensive theming via CSS
 * custom properties and container-aware responsive design.
 *
 * Compatible with Node.js type-stripping for runtime execution without transformation.
 *
 * @version 1.0.0
 * @license MIT
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

// ===========================================
// SHARED TYPES & INTERFACES
// ===========================================

/**
 * Base size variants used across multiple components
 */
export type BaseSize = "sm" | "md" | "lg";

/**
 * Orientation/Direction for layout components
 */
export type Orientation = "horizontal" | "vertical";

/**
 * Base props extended by all components
 */
export interface BaseProps {
  className?: string;
  /**
   * Enable container query responsive behavior (default: true)
   * When true, components adapt based on their container width
   */
  responsive?: boolean;
}

/**
 * Base props for components that support orientation
 */
export interface OrientableProps extends BaseProps {
  /**
   * Layout orientation (default: "horizontal")
   * Controls whether content flows horizontally or vertically
   */
  orientation?: Orientation;
}

/**
 * Action item for data-driven components
 */
export interface Action {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  href?: string;
  disabled?: boolean;
  external?: boolean;
}

/**
 * Menu/List item for data-driven components
 */
export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  description?: string;
  featured?: boolean;
  group?: string;
}

/**
 * Option for Select components
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Tab for TabGroup component
 */
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  href?: string;
  disabled?: boolean;
  external?: boolean;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
}

/**
 * Table column definition
 */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * Group for MegaDropdown
 */
export interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

// ===========================================
// LAYOUT ELEMENTS
// ===========================================

export interface HeaderProps extends BaseProps {
  variant?: "default" | "glass" | "elevated";
  children?: React.ReactNode;
}

/**
 * Header - Modern responsive header container with container queries
 */
export function Header({
  variant = "default",
  responsive = true,
  className = "",
  children,
}: HeaderProps) {
  return (
    <header
      className={`mv-header mv-header--${variant} ${
        responsive ? "mv-header-container" : ""
      } ${className}`}
    >
      <div className="mv-header__inner">
        {children}
      </div>
    </header>
  );
}

export interface BrandProps extends BaseProps {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
  href?: string;
  size?: BaseSize;
}

/**
 * Brand - Logo and title display with container-aware responsive behavior
 */
export function Brand({
  title,
  subtitle,
  logo,
  href = "#",
  size = "md",
  responsive = true,
  className = "",
}: BrandProps) {
  return (
    <div
      className={`mv-brand mv-brand--${size} ${
        responsive ? "mv-brand-container" : ""
      } ${className}`}
    >
      <a href={href} className="mv-brand__link">
        {logo && <div className="mv-brand__logo">{logo}</div>}
        <div className="mv-brand__content">
          <span className="mv-brand__title">{title}</span>
          {subtitle && <span className="mv-brand__subtitle">{subtitle}</span>}
        </div>
      </a>
    </div>
  );
}

export interface CardProps extends BaseProps {
  variant?: "default" | "elevated" | "outlined" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

/**
 * Card - Flexible container with container-aware padding
 */
export function Card({
  variant = "default",
  padding = "md",
  responsive = true,
  className = "",
  children,
}: CardProps) {
  return (
    <div
      className={`mv-card mv-card--${variant} mv-card--padding-${padding} ${className}`}
    >
      {children}
    </div>
  );
}

export interface DrawerProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "left" | "right";
  mode?: "temporary" | "persistent";
  backdrop?: boolean;
  children: React.ReactNode;
}

/**
 * Drawer - Slide-out panel with backdrop and animations
 */
export function Drawer({
  isOpen,
  onClose,
  position = "left",
  mode = "temporary",
  backdrop = true,
  responsive = true,
  className = "",
  children,
}: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && mode === "temporary") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      if (mode === "temporary") {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (mode === "temporary") {
        document.body.style.overflow = "";
      }
    };
  }, [isOpen, mode, onClose]);

  return (
    <>
      <div
        className={`mv-drawer mv-drawer--${position} mv-drawer--${mode} ${
          isOpen ? "mv-drawer--open" : ""
        } ${className}`}
      >
        <div className="mv-drawer__content">
          {children}
        </div>
      </div>

      {backdrop && isOpen && mode === "temporary" && (
        <div
          className="mv-drawer__backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// ===========================================
// BASIC INTERACTION ELEMENTS
// ===========================================

export interface ButtonProps extends BaseProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: BaseSize;
  badge?: number;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
}

/**
 * Button - Comprehensive button system with variants and states
 */
export function Button({
  children,
  variant = "ghost",
  size = "md",
  badge,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  responsive = true,
  className = "",
  ...ariaProps
}: ButtonProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      onClick?.(event);
    },
    [loading, disabled, onClick],
  );

  return (
    <button
      type={type}
      className={`mv-button mv-button--${variant} mv-button--${size} ${
        loading ? "mv-button--loading" : ""
      } ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...ariaProps}
    >
      <span className="mv-button__content">{children}</span>
      {badge && badge > 0 && <span className="mv-button__badge">{badge}</span>}
      {loading && <span className="mv-button__spinner" />}
    </button>
  );
}

export interface SearchBoxProps extends BaseProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  variant?: "default" | "filled" | "outlined";
  size?: BaseSize;
  expandable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
}

/**
 * SearchBox - Advanced search input with container-aware responsive behavior
 */
export function SearchBox({
  value: controlledValue,
  defaultValue = "",
  placeholder = "Search...",
  variant = "default",
  size = "md",
  expandable = false,
  disabled = false,
  clearable = false,
  onChange,
  onSearch,
  onFocus,
  onBlur,
  onClear,
  responsive = true,
  className = "",
}: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [expanded, setExpanded] = useState(!expandable);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (isControlled) {
        onChange?.(newValue);
      } else {
        setInternalValue(newValue);
      }
    },
    [isControlled, onChange],
  );

  const handleSearch = useCallback(() => {
    if (value.trim()) {
      onSearch?.(value.trim());
    }
  }, [value, onSearch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    const newValue = "";

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }

    onClear?.();
  }, [isControlled, onChange, onClear]);

  if (expandable && !expanded) {
    return (
      <button
        className={`mv-search__toggle mv-search__toggle--${size} ${className}`}
        onClick={() => setExpanded(true)}
        disabled={disabled}
        aria-label="Open search"
      >
        🔍
      </button>
    );
  }

  return (
    <div
      className={`mv-search mv-search--${variant} mv-search--${size} ${
        responsive ? "mv-search-container" : ""
      } ${className}`}
    >
      <div className="mv-search__container">
        <span className="mv-search__icon">🔍</span>
        <input
          type="text"
          className="mv-search__input"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={placeholder}
        />
        {clearable && value && (
          <button
            type="button"
            className="mv-search__clear"
            onClick={handleClear}
            disabled={disabled}
          >
            ✕
          </button>
        )}
        {expandable && (
          <button
            type="button"
            className="mv-search__collapse"
            onClick={() => setExpanded(false)}
            disabled={disabled}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ===========================================
// DATA-DRIVEN COMPONENTS
// ===========================================

export interface SelectProps extends BaseProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: BaseSize;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onSelect?: (value: string, option: SelectOption) => void;
  onChange?: (value: string) => void;
}

/**
 * Select - Data-driven dropdown with container-aware responsive behavior
 */
export function Select({
  options,
  value: controlledValue,
  defaultValue = "",
  placeholder = "Select option...",
  size = "md",
  disabled = false,
  searchable = false,
  clearable = false,
  onSelect,
  onChange,
  responsive = true,
  className = "",
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const filteredOptions = searchQuery
    ? options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback((option: SelectOption) => {
    if (option.disabled) return;

    const newValue = option.value;

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }

    onSelect?.(newValue, option);
    setIsOpen(false);
    setSearchQuery("");
  }, [isControlled, onChange, onSelect]);

  const handleClear = useCallback(() => {
    const newValue = "";

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }

    setIsOpen(false);
  }, [isControlled, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current && !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={selectRef}
      className={`mv-select mv-select--${size} ${
        isOpen ? "mv-select--open" : ""
      } ${responsive ? "mv-select-container" : ""} ${className}`}
    >
      <button
        className="mv-select__trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="mv-select__value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="mv-select__actions">
          {clearable && value && (
            <button
              type="button"
              className="mv-select__clear"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            >
              ✕
            </button>
          )}
          <span className="mv-select__arrow">▼</span>
        </div>
      </button>

      {isOpen && (
        <div className="mv-select__dropdown">
          {searchable && (
            <div className="mv-select__search">
              <input
                type="text"
                className="mv-select__search-input"
                placeholder="Search options..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="mv-select__options" role="listbox">
            {filteredOptions.length === 0
              ? <div className="mv-select__empty">No options found</div>
              : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`mv-select__option ${
                      option.value === value
                        ? "mv-select__option--selected"
                        : ""
                    } ${option.disabled ? "mv-select__option--disabled" : ""}`}
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span className="mv-select__option-label">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mv-select__option-description">
                        {option.description}
                      </span>
                    )}
                  </button>
                ))
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface TabGroupProps extends OrientableProps {
  tabs: Tab[];
  activeTab?: string;
  variant?: "default" | "pills" | "underline";
  size?: BaseSize;
  onTabChange?: (tabId: string, tab: Tab) => void;
}

/**
 * TabGroup - Data-driven tab interface with orientation support
 * Supports both horizontal (default) and vertical layouts
 */
export function TabGroup({
  tabs,
  activeTab,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  onTabChange,
  responsive = true,
  className = "",
}: TabGroupProps) {
  const handleTabClick = useCallback((tab: Tab) => {
    if (tab.disabled) return;

    if (tab.external && tab.href) {
      window.open(tab.href, "_blank");
      return;
    }

    onTabChange?.(tab.id, tab);
  }, [onTabChange]);

  return (
    <div
      className={`mv-tabs mv-tabs--${variant} mv-tabs--${size} mv-tabs--${orientation} ${
        responsive ? "mv-tabs-container" : ""
      } ${className}`}
    >
      <div className="mv-tabs__container" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`mv-tabs__item ${
              activeTab === tab.id ? "mv-tabs__item--active" : ""
            } ${tab.disabled ? "mv-tabs__item--disabled" : ""}`}
            onClick={() => handleTabClick(tab)}
            disabled={tab.disabled}
          >
            {tab.icon && <span className="mv-tabs__icon">{tab.icon}</span>}
            <span className="mv-tabs__label">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="mv-tabs__badge">{tab.badge}</span>
            )}
            {tab.external && <span className="mv-tabs__external">↗</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface ListProps extends OrientableProps {
  items: MenuItem[];
  variant?: "default" | "compact" | "detailed";
  selectable?: boolean;
  selectedItems?: string[];
  onItemClick?: (item: MenuItem) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * List - Data-driven list component with orientation support
 * Supports both vertical (default) and horizontal layouts
 */
export function List({
  items,
  variant = "default",
  orientation = "vertical", // Note: List defaults to vertical unlike ActionBar
  selectable = false,
  selectedItems = [],
  onItemClick,
  onSelectionChange,
  responsive = true,
  className = "",
}: ListProps) {
  const handleItemClick = useCallback((item: MenuItem) => {
    if (item.disabled) return;

    if (selectable) {
      const newSelection = selectedItems.includes(item.id)
        ? selectedItems.filter((id) => id !== item.id)
        : [...selectedItems, item.id];
      onSelectionChange?.(newSelection);
    }

    if (item.external && item.href) {
      window.open(item.href, "_blank");
    }

    onItemClick?.(item);
  }, [selectable, selectedItems, onSelectionChange, onItemClick]);

  return (
    <div
      className={`mv-list mv-list--${variant} mv-list--${orientation} ${
        responsive ? "mv-list-container" : ""
      } ${className}`}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={`mv-list__item ${
            selectedItems.includes(item.id) ? "mv-list__item--selected" : ""
          } ${item.disabled ? "mv-list__item--disabled" : ""}`}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
        >
          <div className="mv-list__item-content">
            {item.icon && (
              <span className="mv-list__item-icon">{item.icon}</span>
            )}
            <div className="mv-list__item-text">
              <span className="mv-list__item-label">{item.label}</span>
              {item.description && variant === "detailed" && (
                <span className="mv-list__item-description">
                  {item.description}
                </span>
              )}
            </div>
            <div className="mv-list__item-meta">
              {item.badge && item.badge > 0 && (
                <span className="mv-list__item-badge">{item.badge}</span>
              )}
              {item.external && (
                <span className="mv-list__item-external">↗</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export interface ActionBarProps extends OrientableProps {
  actions: Action[];
  variant?: "default" | "compact";
  position?: "left" | "center" | "right";
  onActionClick?: (action: Action) => void;
}

/**
 * ActionBar - Data-driven toolbar with orientation support
 * Supports both horizontal (default) and vertical layouts
 */
export function ActionBar({
  actions,
  variant = "default",
  position = "left",
  orientation = "horizontal",
  onActionClick,
  responsive = true,
  className = "",
}: ActionBarProps) {
  const handleActionClick = useCallback((action: Action) => {
    if (action.disabled) return;

    if (action.external && action.href) {
      window.open(action.href, "_blank");
    }

    onActionClick?.(action);
  }, [onActionClick]);

  // Non-responsive version - simple flex container
  if (!responsive) {
    return (
      <div
        className={`mv-actionbar mv-actionbar--${variant} mv-actionbar--${position} mv-actionbar--${orientation} ${className}`}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            className={`mv-actionbar__action ${
              action.disabled ? "mv-actionbar__action--disabled" : ""
            }`}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            aria-label={action.label}
          >
            {action.icon && (
              <span className="mv-actionbar__icon">{action.icon}</span>
            )}
            <span className="mv-actionbar__label">{action.label}</span>
            {action.badge && action.badge > 0 && (
              <span className="mv-actionbar__badge">{action.badge}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Responsive version with proper container query structure
  return (
    <div
      className={`mv-actionbar-container mv-actionbar-container--${position} mv-actionbar-container--${orientation} ${className}`}
    >
      <div
        className={`mv-actionbar mv-actionbar--${variant} mv-actionbar--${orientation}`}
      >
        {actions.map((action) => (
          <button
            key={action.id}
            className={`mv-actionbar__action ${
              action.disabled ? "mv-actionbar__action--disabled" : ""
            }`}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            aria-label={action.label}
          >
            {action.icon && (
              <span className="mv-actionbar__icon">{action.icon}</span>
            )}
            <span className="mv-actionbar__label">{action.label}</span>
            {action.badge && action.badge > 0 && (
              <span className="mv-actionbar__badge">{action.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface CollapsibleSectionProps extends BaseProps {
  title: string;
  icon?: string;
  badge?: number;
  href?: string;
  expanded?: boolean;
  collapsible?: boolean;
  children: React.ReactNode;
  onToggle?: (expanded: boolean) => void;
  onTitleClick?: () => void;
}

/**
 * CollapsibleSection - Accordion-style collapsible content with container-aware spacing
 */
export function CollapsibleSection({
  title,
  icon,
  badge,
  href,
  expanded: controlledExpanded,
  collapsible = true,
  children,
  onToggle,
  onTitleClick,
  responsive = true,
  className = "",
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleToggle = useCallback(() => {
    if (!collapsible) return;

    const newExpanded = !expanded;

    if (isControlled) {
      onToggle?.(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  }, [collapsible, expanded, isControlled, onToggle]);

  const handleTitleClick = useCallback(() => {
    onTitleClick?.();
    if (collapsible) {
      handleToggle();
    }
  }, [onTitleClick, collapsible, handleToggle]);

  return (
    <div
      className={`mv-collapsible ${
        expanded ? "mv-collapsible--expanded" : ""
      } ${responsive ? "mv-collapsible-container" : ""} ${className}`}
    >
      {href
        ? (
          <a
            className="mv-collapsible__header"
            href={href}
            onClick={handleTitleClick}
          >
            {icon && <span className="mv-collapsible__icon">{icon}</span>}
            <span className="mv-collapsible__title">{title}</span>
            {badge && badge > 0 && (
              <span className="mv-collapsible__badge">{badge}</span>
            )}
            {collapsible && (
              <span className="mv-collapsible__toggle">
                {expanded ? "▼" : "▶"}
              </span>
            )}
          </a>
        )
        : (
          <button
            className="mv-collapsible__header"
            onClick={handleTitleClick}
            type="button"
          >
            {icon && <span className="mv-collapsible__icon">{icon}</span>}
            <span className="mv-collapsible__title">{title}</span>
            {badge && badge > 0 && (
              <span className="mv-collapsible__badge">{badge}</span>
            )}
            {collapsible && (
              <span className="mv-collapsible__toggle">
                {expanded ? "▼" : "▶"}
              </span>
            )}
          </button>
        )}

      {expanded && (
        <div className="mv-collapsible__content">
          {children}
        </div>
      )}
    </div>
  );
}

export interface BreadcrumbsProps extends BaseProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem) => void;
}

/**
 * Breadcrumbs - Data-driven navigation trail with container-aware responsive behavior
 */
export function Breadcrumbs({
  items,
  separator = "/",
  maxItems,
  onItemClick,
  responsive = true,
  className = "",
}: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  const displayItems = maxItems && items.length > maxItems
    ? [
      items[0],
      { id: "ellipsis", label: "...", href: "" },
      ...items.slice(-Math.max(1, maxItems - 2)),
    ]
    : items;

  const handleItemClick = useCallback(
    (item: BreadcrumbItem, event: React.MouseEvent) => {
      if (item.id === "ellipsis") {
        event.preventDefault();
        return;
      }

      if (onItemClick) {
        event.preventDefault();
        onItemClick(item);
      }
    },
    [onItemClick],
  );

  return (
    <nav
      className={`mv-breadcrumbs ${
        responsive ? "mv-breadcrumbs-container" : ""
      } ${className}`}
      aria-label="Breadcrumbs"
    >
      <ol className="mv-breadcrumbs__list">
        {displayItems.map((item, index) => (
          <li key={item.id} className="mv-breadcrumbs__item">
            {item.id === "ellipsis"
              ? <span className="mv-breadcrumbs__ellipsis">{item.label}</span>
              : index === displayItems.length - 1
              ? <span className="mv-breadcrumbs__current">{item.label}</span>
              : (
                <a
                  href={item.href || "#"}
                  className="mv-breadcrumbs__link"
                  onClick={(e) => handleItemClick(item, e)}
                >
                  {item.label}
                </a>
              )}

            {index < displayItems.length - 1 && (
              <span className="mv-breadcrumbs__separator">{separator}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Enhanced MegaDropdown types
export interface MegaDropdownItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  href?: string;
  badge?: number | string;
  featured?: boolean;
  disabled?: boolean;
}

export interface MegaDropdownGroup {
  id: string;
  title: string;
  items: MegaDropdownItem[];
}

export interface MegaDropdownProps {
  groups: MegaDropdownGroup[];
  featuredItems?: MegaDropdownItem[];
  columns?: number;
  showFeatured?: boolean;
  onItemClick?: (item: MegaDropdownItem) => void;
  responsive?: boolean;
  className?: string;
  debug?: boolean; // For development
}

export interface NavigationItemProps {
  label: string;
  icon?: string;
  href?: string;
  dropdown?: MegaDropdownProps;
  onItemClick?: (item: MegaDropdownItem) => void;
  className?: string;
}

// Hook for container size detection
function useContainerObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width, blockSize: height } =
          entry.contentBoxSize[0];
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}

// Enhanced overflow detection hook
function useOverflowDetection(
  triggerRef: React.RefObject<HTMLElement>,
  dropdownRef: React.RefObject<HTMLElement>,
  isOpen: boolean,
) {
  const [position, setPosition] = useState<"center" | "left" | "right">(
    "center",
  );

  const detectOverflow = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current || !isOpen) return;

    const trigger = triggerRef.current;
    const dropdown = dropdownRef.current;
    const viewport = window.visualViewport || {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Get positions
    const triggerRect = trigger.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    // Calculate desired centered position
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const dropdownHalfWidth = dropdownRect.width / 2;

    // Check for left overflow
    const leftOverflow = triggerCenterX - dropdownHalfWidth < 16; // 16px margin

    // Check for right overflow
    const rightOverflow =
      triggerCenterX + dropdownHalfWidth > viewport.width - 16;

    // Determine best position
    if (leftOverflow && !rightOverflow) {
      setPosition("left");
    } else if (rightOverflow && !leftOverflow) {
      setPosition("right");
    } else if (leftOverflow && rightOverflow) {
      // Both sides overflow - use the side with more space
      const leftSpace = triggerCenterX;
      const rightSpace = viewport.width - triggerCenterX;
      setPosition(leftSpace > rightSpace ? "left" : "right");
    } else {
      setPosition("center");
    }
  }, [triggerRef, dropdownRef, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Detect on next frame to ensure dropdown is rendered
      requestAnimationFrame(detectOverflow);

      // Re-detect on resize
      window.addEventListener("resize", detectOverflow);
      return () => window.removeEventListener("resize", detectOverflow);
    }
  }, [isOpen, detectOverflow]);

  return position;
}

// Enhanced MegaDropdown Content Component
export const MegaDropdownContent: React.FC<MegaDropdownProps> = ({
  groups,
  featuredItems = [],
  columns = 3,
  showFeatured = true,
  onItemClick,
  responsive = true,
  className = "",
  debug = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useContainerObserver(containerRef);

  const handleItemClick = (item: MegaDropdownItem) => {
    if (item.disabled) return;
    if (onItemClick) {
      onItemClick(item);
    }
    if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`mv-megadropdown__content ${
        responsive ? "mv-megadropdown-container" : ""
      } ${className}`}
      data-debug={debug}
      data-width={debug ? Math.round(width) : undefined}
    >
      {/* Main Groups Grid */}
      <div className="mv-megadropdown__groups">
        {groups.map((group) => (
          <div key={group.id} className="mv-megadropdown__column">
            <h3 className="mv-megadropdown__group-title">{group.title}</h3>
            <div className="mv-megadropdown__items">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`mv-megadropdown__item ${
                    item.disabled ? "mv-megadropdown__item--disabled" : ""
                  }`}
                >
                  {item.icon && (
                    <span className="mv-megadropdown__item-icon">
                      {item.icon}
                    </span>
                  )}
                  <div className="mv-megadropdown__item-content">
                    <span className="mv-megadropdown__item-label">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="mv-megadropdown__item-description">
                        {item.description}
                      </span>
                    )}
                  </div>
                  {item.badge && (
                    <span className="mv-megadropdown__item-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Featured Section */}
      {showFeatured && featuredItems.length > 0 && (
        <div className="mv-megadropdown__featured">
          <h3 className="mv-megadropdown__featured-title">Featured</h3>
          <div className="mv-megadropdown__featured-items">
            {featuredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`mv-megadropdown__featured-item ${
                  item.disabled
                    ? "mv-megadropdown__featured-item--disabled"
                    : ""
                }`}
              >
                {item.icon && (
                  <div className="mv-megadropdown__featured-icon">
                    {item.icon}
                  </div>
                )}
                <div className="mv-megadropdown__featured-label">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Navigation Item with Smart Positioning
export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  icon,
  href,
  dropdown,
  onItemClick,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const position = useOverflowDetection(triggerRef, dropdownRef, isOpen);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (dropdown) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (href && !dropdown) {
      window.location.href = href;
    } else if (dropdown) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item: MegaDropdownItem) => {
    setIsOpen(false);
    if (onItemClick) {
      onItemClick(item);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate position classes
  const dropdownClasses = [
    "mv-megadropdown",
    isOpen ? "mv-megadropdown--open" : "",
    position === "left" ? "mv-megadropdown--left-edge" : "",
    position === "right" ? "mv-megadropdown--right-edge" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={`mv-nav-item ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        className="mv-nav-item__trigger"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup={dropdown ? "true" : "false"}
      >
        {icon && <span className="mv-nav-item__icon">{icon}</span>}
        <span className="mv-nav-item__label">{label}</span>
        {dropdown && <span className="mv-nav-item__arrow">▼</span>}
      </button>

      {dropdown && (
        <div
          ref={dropdownRef}
          className={dropdownClasses}
        >
          <MegaDropdownContent
            {...dropdown}
            onItemClick={handleItemClick}
          />
        </div>
      )}
    </div>
  );
};

// Enhanced Main Navigation Component
export interface NavigationProps {
  brand?: {
    label: string;
    icon?: string;
    href?: string;
  };
  items: NavigationItemProps[];
  actions?: React.ReactNode;
  className?: string;
  responsive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  brand,
  items,
  actions,
  responsive = true,
  className = "",
}) => {
  return (
    <nav
      className={`mv-navigation ${
        responsive ? "mv-navigation-container" : ""
      } ${className}`}
    >
      <div className="mv-navigation__container">
        {brand && (
          <a
            href={brand.href || "/"}
            className="mv-navigation__brand"
          >
            {brand.icon && <span>{brand.icon}</span>}
            {brand.label}
          </a>
        )}

        <div className="mv-navigation__menu">
          {items.map((item, index) => <NavigationItem key={index} {...item} />)}
        </div>

        {actions && (
          <div className="mv-navigation__actions">
            {actions}
          </div>
        )}
      </div>
    </nav>
  );
};

// Legacy MegaDropdown Component (for backward compatibility)
export const MegaDropdown: React.FC<MegaDropdownProps> = (props) => {
  return (
    <div className="mv-megadropdown mv-megadropdown--static">
      <MegaDropdownContent {...props} />
    </div>
  );
};

export default MegaDropdown;

// ===========================================
// TABLE COMPONENT WITH CLEAN CONTAINER QUERIES
// ===========================================

export interface TableProps extends BaseProps {
  columns: TableColumn[];
  data: any[];
  sortable?: boolean;
  selectable?: boolean;
  selectedRows?: any[];
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

/**
 * Table - Comprehensive data table with container-aware responsive behavior
 * Automatically switches to card layout on narrow containers
 */
export function Table({
  columns,
  data,
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSort,
  onRowClick,
  onSelectionChange,
  responsive = true,
  className = "",
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<
    {
      key: string;
      direction: "asc" | "desc";
    } | null
  >(null);

  const handleSort = useCallback((column: TableColumn) => {
    if (!sortable || !column.sortable) return;

    const direction =
      sortConfig?.key === column.key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    setSortConfig({ key: column.key, direction });
    onSort?.(column.key, direction);
  }, [sortable, sortConfig, onSort]);

  const handleRowSelect = useCallback((row: any, selected: boolean) => {
    if (!selectable) return;

    const newSelection = selected
      ? [...selectedRows, row]
      : selectedRows.filter((r) => r !== row);

    onSelectionChange?.(newSelection);
  }, [selectable, selectedRows, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (!selectable) return;

    const allSelected = data.length > 0 && selectedRows.length === data.length;
    onSelectionChange?.(allSelected ? [] : [...data]);
  }, [selectable, data, selectedRows, onSelectionChange]);

  const isRowSelected = useCallback((row: any) => {
    return selectedRows.includes(row);
  }, [selectedRows]);

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 &&
    selectedRows.length < data.length;

  return (
    <div
      className={`mv-table ${
        responsive ? "mv-table-container" : ""
      } ${className}`}
    >
      <table className="mv-table__table">
        <thead className="mv-table__header">
          <tr className="mv-table__header-row">
            {selectable && (
              <th className="mv-table__header-cell mv-table__header-cell--select">
                <input
                  type="checkbox"
                  className="mv-table__checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`mv-table__header-cell ${
                  column.sortable ? "mv-table__header-cell--sortable" : ""
                } ${
                  column.align ? `mv-table__header-cell--${column.align}` : ""
                }`}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
              >
                <div className="mv-table__header-content">
                  <span className="mv-table__header-label">{column.label}</span>
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="mv-table__sort-indicator">
                      {sortConfig.direction === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="mv-table__body">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`mv-table__row ${
                isRowSelected(row) ? "mv-table__row--selected" : ""
              } ${onRowClick ? "mv-table__row--clickable" : ""}`}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {selectable && (
                <td className="mv-table__cell mv-table__cell--select">
                  <input
                    type="checkbox"
                    className="mv-table__checkbox"
                    checked={isRowSelected(row)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleRowSelect(row, e.target.checked);
                    }}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`mv-table__cell ${
                    column.align ? `mv-table__cell--${column.align}` : ""
                  }`}
                  data-label={column.label} // For mobile card layout
                >
                  <span className="mv-table__cell-content">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="mv-table__empty">
          <div style={{ fontSize: "3rem", marginBottom: "var(--mv-space-lg)" }}>
            📋
          </div>
          <h3 style={{ margin: "0 0 var(--mv-space-md) 0" }}>
            No Data Available
          </h3>
          <p style={{ margin: 0, color: "var(--mv-color-text-secondary)" }}>
            There are no items to display in this table.
          </p>
        </div>
      )}
    </div>
  );
}

// ===========================================
// PAGINATION COMPONENT WITH CLEAN CONTAINER QUERIES
// ===========================================

export interface PaginationProps extends OrientableProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Pagination - Complete pagination with orientation support
 * Supports both horizontal (default) and vertical layouts
 */
export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  showPageInfo = true,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100],
  orientation = "horizontal",
  onPageChange,
  onPageSizeChange,
  responsive = true,
  className = "",
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    onPageSizeChange?.(newPageSize);
    // Reset to first page when changing page size
    onPageChange(1);
  }, [onPageChange, onPageSizeChange]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`mv-pagination mv-pagination--${orientation}`}>
      <div
        className={`mv-pagination-container mv-pagination-container--${orientation} ${className}`}
        style={{
          "--mv-current-page": currentPage,
          "--mv-total-pages": totalPages,
        } as React.CSSProperties}
        data-current-page={currentPage}
        data-total-pages={totalPages}
      >
        {showPageInfo && (
          <div className="mv-pagination__info">
            <span>
              Showing {startItem}-{endItem} of {totalItems} items
            </span>
          </div>
        )}

        <div className="mv-pagination__controls">
          <button
            className="mv-pagination__button mv-pagination__button--prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..."
                ? <span className="mv-pagination__ellipsis">...</span>
                : (
                  <button
                    className={`mv-pagination__button mv-pagination__button--page ${
                      page === currentPage
                        ? "mv-pagination__button--active"
                        : ""
                    }`}
                    onClick={() => handlePageChange(page as number)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                )}
            </React.Fragment>
          ))}

          <button
            className="mv-pagination__button mv-pagination__button--next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="mv-pagination__page-size">
            <label className="mv-pagination__page-size-label">
              Items per page:
            </label>
            <select
              className="mv-pagination__page-size-select"
              value={itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// UTILITY HOOKS
// ===========================================

/**
 * Hook to detect container size using ResizeObserver
 * Useful for advanced container-aware logic
 */
export function useContainerSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width, blockSize: height } =
          entry.contentBoxSize[0];
        setSize({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}

/**
 * Hook to determine current container breakpoint
 */
export function useContainerBreakpoint(ref: React.RefObject<HTMLElement>) {
  const { width } = useContainerSize(ref);

  if (width <= 320) return "xs";
  if (width <= 480) return "sm";
  if (width <= 640) return "md";
  if (width <= 768) return "lg";
  if (width <= 1024) return "xl";
  return "2xl";
}

// ===========================================
// MIGRATION NOTES
// ===========================================

/*
MIGRATION GUIDE for @m5nv/ui-elements v1.0:

🎉 NEW: Clean Container Query Responsive Design + Orientation Support
All components now use dedicated container classes following ActionBar/Pagination pattern.

🚀 NEW ORIENTATION FEATURES:
- ✅ ActionBar: `orientation="horizontal|vertical"` - toolbar vs button stack
- ✅ List: `orientation="vertical|horizontal"` - vertical list vs horizontal cards
- ✅ TabGroup: `orientation="horizontal|vertical"` - horizontal tabs vs vertical nav
- ✅ Pagination: `orientation="horizontal|vertical"` - horizontal controls vs stacked layout

USAGE EXAMPLES:
```tsx
// Vertical action bar (great for sidebars)
<ActionBar actions={actions} orientation="vertical" />

// Horizontal list (great for card galleries)
<List items={items} orientation="horizontal" />

// Vertical tabs (great for navigation)
<TabGroup tabs={tabs} orientation="vertical" />

// Vertical pagination (great for narrow containers)
<Pagination orientation="vertical" {...paginationProps} />
```

IMPROVED PATTERNS:
1. ✅ Clean dedicated containers: `.mv-component-container`
2. ✅ Simplified responsive prop handling: `${responsive ? "mv-component-container" : ""}`
3. ✅ Consistent container query breakpoints across all components
4. ✅ Eliminated messy generic `.mv-container-query` classes
5. ✅ Streamlined CSS with consolidated responsive logic
6. 🆕 **Orientation support for layout flexibility**

BREAKING CHANGES: None!
- All existing code continues to work exactly as before
- Container queries are enabled by default but don't break existing layouts
- Set `responsive={false}` on any component to disable container query behavior
- Orientation defaults to sensible values (horizontal for toolbars, vertical for lists)

The future of responsive design is here! 🚀
*/
