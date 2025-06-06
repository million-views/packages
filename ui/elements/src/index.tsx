/**
 * @m5nv/ui-elements v2.0 - THE BEST WIDGET LIBRARY IN TOWN
 *
 * Modern, composable, data-driven UI components with performance-first architecture
 * and semantic design patterns.
 *
 * Key Features:
 * - 🎨 Semantic design props with component-specific vocabularies
 * - ⚡ Performance-optimized: static design vs dynamic state separation
 * - 🧩 Granular composable exports for maximum flexibility
 * - 🎯 TypeScript as documentation with rich interfaces
 * - 🌍 ElementsUIProvider for app-level theming
 * - 🔄 Orientation support for adaptive layouts
 *
 * @version 2.0.0
 * @license MIT
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./styles.css";

// ===========================================
// PROVIDER CONTEXT & THEMING
// ===========================================

/**
 * Global theme configuration for the entire application
 */
export interface ElementsUIContext {
  /** Color scheme preference */
  theme?: "light" | "dark";
  /** Color palette selection */
  palette?: "ghibli" | "blue" | "purple" | "green" | "orange";
  /** Spatial density preference */
  density?: "comfortable" | "compact";
  /** Accessibility enhancements */
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
}

const ElementsUIContextInternal = createContext<ElementsUIContext | null>(null);

export interface ElementsUIProviderProps extends ElementsUIContext {
  children: React.ReactNode;
}

/**
 * ElementsUIProvider - App-level theming and configuration
 *
 * @example
 * ```tsx
 * <ElementsUIProvider theme="dark" palette="blue" density="compact">
 *   <App />
 * </ElementsUIProvider>
 * ```
 */
export function ElementsUIProvider({
  children,
  theme = "light",
  palette = "ghibli",
  density = "comfortable",
  accessibility = {},
}: ElementsUIProviderProps) {
  const contextValue: ElementsUIContext = {
    theme,
    palette,
    density,
    accessibility,
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-palette", palette);
    root.setAttribute("data-density", density);

    if (accessibility.highContrast) {
      root.setAttribute("data-high-contrast", "true");
    }
    if (accessibility.reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    }
  }, [theme, palette, density, accessibility]);

  return (
    <ElementsUIContextInternal.Provider value={contextValue}>
      {children}
    </ElementsUIContextInternal.Provider>
  );
}

/**
 * Hook to access current ElementsUI context
 * Returns empty object if no provider is present (graceful fallback)
 */
export function useElementsUI(): ElementsUIContext {
  const context = useContext(ElementsUIContextInternal);
  return context || {};
}

// ===========================================
// CORE TYPE SYSTEM
// ===========================================

/**
 * Semantic intent vocabulary for components
 */
export type Intent =
  | "primary" // Main brand actions, primary CTAs
  | "secondary" // Supporting actions, secondary CTAs
  | "success" // Positive outcomes, confirmations
  | "warning" // Caution, attention needed
  | "danger" // Problems, destructive actions
  | "upsell" // Promotional, upgrade actions
  | "selected" // Current choice, active state
  | "beta" // Experimental, new features
  | "neutral"; // Default, balanced actions

/**
 * Physical size scale
 */
export type Size = "sm" | "md" | "lg";

/**
 * Spatial density levels
 */
export type Density = "comfortable" | "compact";

/**
 * Layout orientation
 */
export type Orientation = "horizontal" | "vertical";

/**
 * Base props for all components
 */
export interface BaseProps {
  /**
   * Enable container query responsive behavior (default: true)
   * When true, components adapt based on their container width
   */
  responsive?: boolean;
}

// ===========================================
// DATA INTERFACES
// ===========================================

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
 * Option for Select components
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Navigation item for data-driven navigation
 */
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  dropdown?: {
    groups: Array<{
      id: string;
      title: string;
      items: Array<{
        id: string;
        label: string;
        description?: string;
        icon?: string;
        href?: string;
        external?: boolean;
        featured?: boolean;
      }>;
    }>;
    featuredItems?: Array<{
      id: string;
      label: string;
      icon?: string;
      href?: string;
    }>;
    columns?: number;
  };
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

// ===========================================
// GRANULAR COMPONENTS
// ===========================================

export interface ActionProps extends BaseProps {
  /** Action data object containing id, label, icon, etc. */
  action: Action;

  /** 🎨 STATIC DESIGN - Visual appearance decisions */
  design?: {
    /** Visual prominence level */
    variant?: "filled" | "outline" | "ghost";
    /** Semantic intent - drives color and meaning */
    intent?: Intent;
    /** Physical scale within layout hierarchy */
    size?: Size;
  };

  /** Click event handler */
  onClick?: (action: Action) => void;
}

/**
 * Action - Individual action component for granular composition
 *
 * @example
 * ```tsx
 * // Full ActionBar widget
 * <ActionBar actions={actions} onActionClick={handleClick} />
 *
 * // Individual Action for custom layouts
 * <Action
 *   action={{ id: 'save', label: 'Save', icon: '💾' }}
 *   onClick={handleSave}
 *   design={{ variant: 'filled', intent: 'primary' }}
 * />
 *
 * // Mixed usage in custom toolbar
 * <div className="custom-toolbar">
 *   <Action action={primaryAction} onClick={handlePrimary} />
 *   <ActionBar actions={secondaryActions} design={{ density: 'compact' }} />
 * </div>
 * ```
 */
export function Action({
  action,
  onClick,
  design = {},
  responsive = true,
}: ActionProps) {
  function handleClick() {
    if (action.disabled) return;

    if (action.external && action.href) {
      window.open(action.href, "_blank");
    }

    onClick?.(action);
  }

  const {
    variant = "ghost",
    intent = "neutral",
    size = "md",
  } = design;

  return (
    <button
      className={`mv-action mv-action--${variant} mv-action--${intent} mv-action--${size} ${
        action.disabled ? "mv-action--disabled" : ""
      }`}
      onClick={handleClick}
      disabled={action.disabled}
      aria-label={action.label}
    >
      {action.icon && <span className="mv-action__icon">{action.icon}</span>}
      <span className="mv-action__label">{action.label}</span>
      {action.badge && action.badge > 0 && (
        <span className="mv-action__badge">{action.badge}</span>
      )}
    </button>
  );
}

export interface TabItemProps extends BaseProps {
  /** Tab data object containing id, label, icon, etc. */
  tab: Tab;

  /** 🎨 STATIC DESIGN - Visual appearance decisions */
  design?: {
    /** Visual treatment style */
    variant?: "default" | "pills" | "underline";
    /** Physical scale */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Changes during interaction */
  /** Whether this tab is currently active */
  active?: boolean;

  /** Click event handler */
  onClick?: (tab: Tab) => void;
}

/**
 * TabItem - Individual tab component for granular composition
 *
 * @example
 * ```tsx
 * // Full TabGroup widget
 * <TabGroup tabs={tabs} activeTab={activeId} onTabChange={handleChange} />
 *
 * // Individual TabItem for custom layouts
 * <TabItem
 *   tab={{ id: "profile", label: "Profile", icon: "👤" }}
 *   active={activeTab === "profile"}
 *   onClick={handleTabClick}
 *   design={{ variant: 'pills', size: 'lg' }}
 * />
 * ```
 */
export function TabItem({
  tab,
  active = false,
  onClick,
  design = {},
}: TabItemProps) {
  function handleClick() {
    if (tab.disabled) return;

    if (tab.external && tab.href) {
      window.open(tab.href, "_blank");
      return;
    }

    onClick?.(tab);
  }

  const {
    variant = "default",
    size = "md",
  } = design;

  return (
    <button
      role="tab"
      aria-selected={active}
      className={`mv-tab mv-tab--${variant} mv-tab--${size} ${
        active ? "mv-tab--active" : ""
      } ${tab.disabled ? "mv-tab--disabled" : ""}`}
      onClick={handleClick}
      disabled={tab.disabled}
    >
      {tab.icon && <span className="mv-tab__icon">{tab.icon}</span>}
      <span className="mv-tab__label">{tab.label}</span>
      {tab.badge && tab.badge > 0 && (
        <span className="mv-tab__badge">{tab.badge}</span>
      )}
      {tab.external && <span className="mv-tab__external">↗</span>}
    </button>
  );
}

// ===========================================
// LAYOUT ELEMENTS
// ===========================================

export interface HeaderProps extends BaseProps {
  /** Header content */
  children?: React.ReactNode;

  /** 🎨 STATIC DESIGN - Visual treatment decisions */
  design?: {
    /** Visual style treatment */
    variant?: "default" | "glass" | "raised";
  };
}

/**
 * Header - Modern responsive header container
 */
export function Header({
  design = { variant: "default" },
  responsive = true,
  children,
}: HeaderProps) {
  const { variant = "default" } = design;
  const containerClass = responsive ? "mv-header-container" : "";

  return (
    <header className={`mv-header mv-header--${variant} ${containerClass}`}>
      <div className="mv-header__inner">
        {children}
      </div>
    </header>
  );
}

export interface BrandProps extends BaseProps {
  /** Primary brand title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Brand logo element */
  logo?: React.ReactNode;
  /** Brand link destination */
  href?: string;

  /** 🎨 STATIC DESIGN - Brand presentation decisions */
  design?: {
    /** Physical scale within header hierarchy */
    size?: Size;
  };
}

/**
 * Brand - Logo and title display with container-aware responsive behavior
 */
export function Brand({
  title,
  subtitle,
  logo,
  href = "#",
  design = { size: "md" },
  responsive = true,
}: BrandProps) {
  const { size = "md" } = design;
  const containerClass = responsive ? "mv-brand-container" : "";

  return (
    <div className={`mv-brand mv-brand--${size} ${containerClass}`}>
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
  /** Card content */
  children?: React.ReactNode;

  /** 🎨 STATIC DESIGN - Visual hierarchy decisions */
  design?: {
    /** Visual depth and prominence */
    elevation?: "flat" | "raised" | "floating";
    /** Internal spacing density */
    padding?: "none" | "sm" | "md" | "lg";
    /** Visual treatment style */
    variant?: "default" | "outlined" | "glass";
  };

  /** ⚡ DYNAMIC STATE - Interactive status */
  /** Selection state in card grids or lists */
  selected?: boolean;
  /** Loading state for card content */
  loading?: boolean;
  /** Error state for card content */
  error?: boolean;
}

/**
 * Card - Flexible container with visual hierarchy support
 */
export function Card({
  design = {},
  selected = false,
  loading = false,
  error = false,
  responsive = true,
  children,
}: CardProps) {
  const {
    elevation = "flat",
    padding = "md",
    variant = "default",
  } = design;

  const stateClasses = [
    selected && "mv-card--selected",
    loading && "mv-card--loading",
    error && "mv-card--error",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={`mv-card mv-card--${variant} mv-card--${elevation} mv-card--padding-${padding} ${stateClasses}`}
    >
      {children}
    </div>
  );
}

export interface DrawerProps extends BaseProps {
  /** Drawer content */
  children: React.ReactNode;

  /** 🎨 STATIC DESIGN - Layout positioning */
  design?: {
    /** Slide-in direction */
    position?: "left" | "right";
    /** Interaction behavior */
    mode?: "temporary" | "persistent";
  };

  /** ⚡ DYNAMIC STATE - Visibility state */
  /** Whether drawer is currently open */
  isOpen: boolean;
  /** Show backdrop overlay */
  backdrop?: boolean;

  /** Close event handler */
  onClose: () => void;
}

/**
 * Drawer - Slide-out panel with backdrop and animations
 */
export function Drawer({
  isOpen,
  onClose,
  design = {},
  backdrop = true,
  responsive = true,
  children,
}: DrawerProps) {
  const {
    position = "left",
    mode = "temporary",
  } = design;

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && mode === "temporary") {
        onClose();
      }
    }

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
        }`}
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
  /** Button content */
  children: React.ReactNode;

  /** 🎨 STATIC DESIGN - Visual appearance decisions set once */
  design?: {
    /** Visual prominence level - how much attention it draws */
    variant?: "filled" | "outline" | "ghost";
    /** Semantic intent - primary brand action vs secondary action */
    intent?: Intent;
    /** Physical scale within layout hierarchy */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Changes frequently during interaction */
  /** Loading state during async operations */
  loading?: boolean;
  /** Disabled state based on form validity or conditions */
  disabled?: boolean;
  /** Badge count for notifications or status */
  badge?: number;

  /** Button behavior and events */
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  "aria-label"?: string;
  className?: string;
}

/**
 * Button - Comprehensive button system with semantic design choices
 *
 * @example
 * ```tsx
 * // Static design choices - set once, rarely change
 * <Button
 *   design={{ variant: 'filled', intent: 'primary', size: 'lg' }}
 *   loading={isSubmitting}  // Dynamic state
 *   disabled={!isValid}     // Dynamic state
 *   onClick={handleSubmit}
 * >
 *   Submit Order
 * </Button>
 * ```
 */
export function Button({
  children,
  design = {},
  loading = false,
  disabled = false,
  badge,
  type = "button",
  onClick,
  responsive = true,
  className = "",
  ...ariaProps
}: ButtonProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (loading || disabled) return;
    onClick?.(event);
  }

  const {
    variant = "ghost",
    intent = "neutral",
    size = "md",
  } = design;

  const stateClasses = [
    loading && "mv-button--loading",
    disabled && "mv-button--disabled",
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={`mv-button mv-button--${variant} mv-button--${intent} mv-button--${size} ${stateClasses} ${className}`}
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
  /** Input value for controlled usage */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;

  /** 🎨 STATIC DESIGN - Visual treatment decisions */
  design?: {
    /** Background emphasis style */
    variant?: "default" | "filled" | "outline";
    /** Physical scale within layout */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Form interaction state */
  /** Validation error state - changes on every keystroke */
  error?: boolean;
  /** Search operation in progress */
  loading?: boolean;
  /** Form disabled state */
  disabled?: boolean;

  /** Behavioral features */
  expandable?: boolean;
  clearable?: boolean;

  /** Event handlers */
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  className?: string;
}

/**
 * SearchBox - Advanced search input with container-aware responsive behavior
 */
export function SearchBox({
  value: controlledValue,
  defaultValue = "",
  placeholder = "Search...",
  design = {},
  error = false,
  loading = false,
  disabled = false,
  expandable = false,
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

  const {
    variant = "default",
    size = "md",
  } = design;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value;

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  }

  function handleSearch() {
    if (value.trim()) {
      onSearch?.(value.trim());
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  function handleClear() {
    const newValue = "";

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }

    onClear?.();
  }

  const containerClass = responsive ? "mv-search-container" : "";
  const stateClasses = [
    error && "mv-search--error",
    loading && "mv-search--loading",
    disabled && "mv-search--disabled",
  ].filter(Boolean).join(" ");

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
      className={`mv-search mv-search--${variant} mv-search--${size} ${containerClass} ${stateClasses} ${className}`}
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
        {loading && <span className="mv-search__spinner" />}
      </div>
    </div>
  );
}

// ===========================================
// DATA-DRIVEN COMPONENTS
// ===========================================

export interface SelectProps extends BaseProps {
  /** Available options for selection */
  options: SelectOption[];
  /** Selected value for controlled usage */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Placeholder text when no selection */
  placeholder?: string;

  /** 🎨 STATIC DESIGN - Visual treatment decisions */
  design?: {
    /** Background emphasis style */
    variant?: "default" | "filled" | "outline";
    /** Physical scale within layout */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Form interaction state */
  /** Form disabled state */
  disabled?: boolean;
  /** Validation error state */
  error?: boolean;

  /** Behavioral features */
  searchable?: boolean;
  clearable?: boolean;

  /** Event handlers */
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
  design = {},
  disabled = false,
  error = false,
  searchable = false,
  clearable = false,
  onSelect,
  onChange,
  responsive = true,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const {
    variant = "default",
    size = "md",
  } = design;

  const filteredOptions = searchQuery
    ? options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : options;

  const selectedOption = options.find((opt) => opt.value === value);

  function handleSelect(option: SelectOption) {
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
  }

  function handleClear() {
    const newValue = "";

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }

    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current && !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerClass = responsive ? "mv-select-container" : "";
  const stateClasses = [
    isOpen && "mv-select--open",
    error && "mv-select--error",
    disabled && "mv-select--disabled",
  ].filter(Boolean).join(" ");

  return (
    <div
      ref={selectRef}
      className={`mv-select mv-select--${variant} mv-select--${size} ${containerClass} ${stateClasses}`}
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

export interface NavigationProps extends BaseProps {
  /** Brand configuration */
  brand?: {
    label: string;
    subtitle?: string;
    icon?: React.ReactNode;
    href?: string;
  };
  /** Array of navigation item data objects */
  items: NavigationItem[];
  /** Array of action data objects for right-side actions */
  actions?: Action[];

  /** 🎨 STATIC DESIGN - Layout structure decisions */
  design?: {
    /** Visual treatment style */
    variant?: "default" | "raised" | "transparent";
    /** Physical scale */
    size?: Size;
  };

  /** Event handlers */
  onItemClick?: (item: NavigationItem) => void;
  onActionClick?: (action: Action) => void;
}

/**
 * Navigation - Data-driven navigation bar with brand, items, and actions
 *
 * @example
 * ```tsx
 * <Navigation
 *   brand={{ label: "My App", icon: "🚀", href: "/" }}
 *   items={navigationItems}
 *   actions={headerActions}
 *   onItemClick={handleNavClick}
 *   onActionClick={handleActionClick}
 * />
 * ```
 */
export function Navigation({
  brand,
  items,
  actions = [],
  design = {},
  onItemClick,
  onActionClick,
  responsive = true,
}: NavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const {
    variant = "default",
    size = "md",
  } = design;

  function handleItemClick(item: NavigationItem) {
    if (item.disabled) return;

    if (item.dropdown) {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
      return;
    }

    if (item.external && item.href) {
      window.open(item.href, "_blank");
    }

    onItemClick?.(item);
    setOpenDropdown(null);
  }

  function handleActionClick(action: Action) {
    onActionClick?.(action);
  }

  function handleDropdownItemClick(
    dropdownItem: any,
    parentItem: NavigationItem,
  ) {
    if (dropdownItem.external && dropdownItem.href) {
      window.open(dropdownItem.href, "_blank");
    }

    // Create a synthetic navigation item for the callback
    const syntheticItem: NavigationItem = {
      id: dropdownItem.id,
      label: dropdownItem.label,
      href: dropdownItem.href,
      external: dropdownItem.external,
    };

    onItemClick?.(syntheticItem);
    setOpenDropdown(null);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <nav
      ref={navRef}
      className={`mv-navigation mv-navigation--${variant} mv-navigation--${size}`}
    >
      {brand && (
        <div className="mv-navigation__brand">
          <Brand
            title={brand.label}
            subtitle={brand.subtitle}
            logo={brand.icon}
            href={brand.href || "#"}
            design={{ size }}
            responsive={responsive}
          />
        </div>
      )}

      <div className="mv-navigation__items">
        {items.map((item) => (
          <div key={item.id} className="mv-navigation__item-container">
            <button
              className={`mv-navigation__item ${
                item.disabled ? "mv-navigation__item--disabled" : ""
              } ${
                openDropdown === item.id ? "mv-navigation__item--active" : ""
              }`}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className="mv-navigation__item-icon">{item.icon}</span>
              )}
              <span className="mv-navigation__item-label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="mv-navigation__item-badge">{item.badge}</span>
              )}
              {item.dropdown && (
                <span className="mv-navigation__item-arrow">▼</span>
              )}
            </button>

            {item.dropdown && openDropdown === item.id && (
              <div
                className={`mv-navigation__dropdown mv-navigation__dropdown--columns-${
                  item.dropdown.columns || 3
                }`}
              >
                <div className="mv-navigation__dropdown-content">
                  {item.dropdown.groups.map((group) => (
                    <div
                      key={group.id}
                      className="mv-navigation__dropdown-group"
                    >
                      <h4 className="mv-navigation__dropdown-group-title">
                        {group.title}
                      </h4>
                      <div className="mv-navigation__dropdown-group-items">
                        {group.items.map((dropdownItem) => (
                          <button
                            key={dropdownItem.id}
                            className={`mv-navigation__dropdown-item ${
                              dropdownItem.featured
                                ? "mv-navigation__dropdown-item--featured"
                                : ""
                            }`}
                            onClick={() =>
                              handleDropdownItemClick(dropdownItem, item)}
                          >
                            {dropdownItem.icon && (
                              <span className="mv-navigation__dropdown-item-icon">
                                {dropdownItem.icon}
                              </span>
                            )}
                            <div className="mv-navigation__dropdown-item-content">
                              <span className="mv-navigation__dropdown-item-label">
                                {dropdownItem.label}
                              </span>
                              {dropdownItem.description && (
                                <span className="mv-navigation__dropdown-item-description">
                                  {dropdownItem.description}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {item.dropdown.featuredItems &&
                    item.dropdown.featuredItems.length > 0 && (
                    <div className="mv-navigation__dropdown-featured">
                      <h4 className="mv-navigation__dropdown-group-title">
                        Featured
                      </h4>
                      <div className="mv-navigation__dropdown-featured-items">
                        {item.dropdown.featuredItems.map((featuredItem) => (
                          <button
                            key={featuredItem.id}
                            className="mv-navigation__dropdown-featured-item"
                            onClick={() =>
                              handleDropdownItemClick(featuredItem, item)}
                          >
                            {featuredItem.icon && (
                              <span className="mv-navigation__dropdown-item-icon">
                                {featuredItem.icon}
                              </span>
                            )}
                            <span className="mv-navigation__dropdown-item-label">
                              {featuredItem.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {actions.length > 0 && (
        <div className="mv-navigation__actions">
          <ActionBar
            actions={actions}
            onActionClick={handleActionClick}
            design={{ variant: "default", density: "comfortable" }}
            responsive={responsive}
          />
        </div>
      )}
    </nav>
  );
}

export interface BreadcrumbsProps extends BaseProps {
  /** Array of breadcrumb item data objects */
  items: BreadcrumbItem[];

  /** 🎨 STATIC DESIGN - Visual presentation decisions */
  design?: {
    /** Physical scale */
    size?: Size;
    /** Visual treatment */
    variant?: "default" | "minimal";
  };

  /** ⚡ DYNAMIC STATE - Display options */
  /** Maximum number of items to show before truncating */
  maxItems?: number;

  /** Event handlers */
  onItemClick?: (item: BreadcrumbItem) => void;
}

/**
 * Breadcrumbs - Data-driven navigation trail
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { id: "home", label: "Home", href: "/" },
 *     { id: "products", label: "Products", href: "/products" },
 *     { id: "details", label: "Product Details" }
 *   ]}
 *   onItemClick={handleBreadcrumbClick}
 * />
 * ```
 */
export function Breadcrumbs({
  items,
  design = {},
  maxItems = 5,
  onItemClick,
  responsive = true,
}: BreadcrumbsProps) {
  const {
    size = "md",
    variant = "default",
  } = design;

  function handleItemClick(item: BreadcrumbItem) {
    if (item.href && !onItemClick) {
      window.location.href = item.href;
      return;
    }

    onItemClick?.(item);
  }

  // Handle truncation for long breadcrumb trails
  const displayItems = items.length > maxItems
    ? [
      items[0], // Always show first item
      { id: "ellipsis", label: "..." }, // Ellipsis indicator
      ...items.slice(-2), // Show last 2 items
    ]
    : items;

  const containerClass = responsive ? "mv-breadcrumbs-container" : "";

  return (
    <nav
      className={`mv-breadcrumbs mv-breadcrumbs--${variant} mv-breadcrumbs--${size} ${containerClass}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="mv-breadcrumbs__list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === "ellipsis";

          return (
            <li key={`${item.id}-${index}`} className="mv-breadcrumbs__item">
              {index > 0 && (
                <span className="mv-breadcrumbs__separator" aria-hidden="true">
                  /
                </span>
              )}

              {isEllipsis
                ? <span className="mv-breadcrumbs__ellipsis">{item.label}</span>
                : isLast
                ? (
                  <span className="mv-breadcrumbs__current" aria-current="page">
                    {item.label}
                  </span>
                )
                : (
                  <button
                    className="mv-breadcrumbs__link"
                    onClick={() => handleItemClick(item)}
                    type="button"
                  >
                    {item.label}
                  </button>
                )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface TabGroupProps extends BaseProps {
  /** Array of tab data objects */
  tabs: Tab[];

  /** 🎨 STATIC DESIGN - Layout and visual decisions */
  design?: {
    /** Visual treatment style */
    variant?: "default" | "pills" | "underline";
    /** Physical scale */
    size?: Size;
    /** Content arrangement - affects layout structure */
    orientation?: Orientation;
  };

  /** ⚡ DYNAMIC STATE - Selection state */
  /** Currently active tab ID */
  activeTab?: string;

  /** Tab change event handler */
  onTabChange?: (tabId: string, tab: Tab) => void;
}

/**
 * TabGroup - Data-driven tab interface with orientation support
 *
 * @example
 * ```tsx
 * // Horizontal tabs (default)
 * <TabGroup
 *   tabs={tabs}
 *   activeTab={activeId}
 *   onTabChange={handleChange}
 *   design={{ variant: 'underline', size: 'md' }}
 * />
 *
 * // Vertical navigation-style tabs
 * <TabGroup
 *   tabs={tabs}
 *   design={{ orientation: 'vertical', variant: 'pills' }}
 * />
 * ```
 */
export function TabGroup({
  tabs,
  activeTab,
  design = {},
  onTabChange,
  responsive = true,
}: TabGroupProps) {
  function handleTabClick(tab: Tab) {
    if (tab.disabled) return;

    if (tab.external && tab.href) {
      window.open(tab.href, "_blank");
      return;
    }

    onTabChange?.(tab.id, tab);
  }

  const {
    variant = "default",
    size = "md",
    orientation = "horizontal",
  } = design;

  const containerClass = responsive ? "mv-tabs-container" : "";

  return (
    <div
      className={`mv-tabs mv-tabs--${variant} mv-tabs--${size} mv-tabs--${orientation} ${containerClass}`}
    >
      <div className="mv-tabs__container" role="tablist">
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => handleTabClick(tab)}
            design={{ variant, size }}
          />
        ))}
      </div>
    </div>
  );
}

export interface ListProps extends BaseProps {
  /** Array of menu item data objects */
  items: MenuItem[];

  /** 🎨 STATIC DESIGN - Layout and presentation decisions */
  design?: {
    /** Content arrangement - affects layout structure */
    orientation?: Orientation;
    /** Information detail level */
    variant?: "default" | "compact" | "detailed";
    /** Visual spacing density */
    density?: Density;
  };

  /** ⚡ DYNAMIC STATE - Selection state (changes frequently) */
  /** Multi-selection capability */
  selectable?: boolean;
  /** Currently selected item IDs */
  selectedItems?: string[];

  /** Event handlers */
  onItemClick?: (item: MenuItem) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * List - Data-driven list component with orientation support
 *
 * @example
 * ```tsx
 * // Vertical list (default)
 * <List
 *   items={items}
 *   design={{ variant: 'detailed', density: 'comfortable' }}
 *   selectable={true}
 *   selectedItems={selectedIds}
 *   onSelectionChange={setSelectedIds}
 * />
 *
 * // Horizontal card-style list
 * <List
 *   items={items}
 *   design={{ orientation: 'horizontal', variant: 'compact' }}
 * />
 * ```
 */
export function List({
  items,
  design = {},
  selectable = false,
  selectedItems = [],
  onItemClick,
  onSelectionChange,
  responsive = true,
}: ListProps) {
  function handleItemClick(item: MenuItem) {
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
  }

  const {
    orientation = "vertical",
    variant = "default",
    density = "comfortable",
  } = design;

  const containerClass = responsive ? "mv-list-container" : "";

  return (
    <div
      className={`mv-list mv-list--${variant} mv-list--${orientation} mv-list--${density} ${containerClass}`}
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

export interface ActionBarProps extends BaseProps {
  /** Array of action data objects */
  actions: Action[];

  /** 🎨 STATIC DESIGN - Layout structure decisions */
  design?: {
    /** Content flow direction - affects layout structure */
    orientation?: Orientation;
    /** Alignment within container */
    position?: "left" | "center" | "right";
    /** Visual spacing density */
    density?: Density;
    /** Visual treatment */
    variant?: "default" | "compact" | "elevated";
  };

  /** Action click event handler */
  onActionClick?: (action: Action) => void;
}

/**
 * ActionBar - Data-driven toolbar with orientation support
 *
 * @example
 * ```tsx
 * // Horizontal toolbar (default)
 * <ActionBar
 *   actions={actions}
 *   design={{ position: 'right', density: 'comfortable' }}
 *   onActionClick={handleAction}
 * />
 *
 * // Vertical sidebar actions
 * <ActionBar
 *   actions={actions}
 *   design={{ orientation: 'vertical', variant: 'elevated' }}
 * />
 * ```
 */
export function ActionBar({
  actions,
  design = {},
  onActionClick,
  responsive = true,
}: ActionBarProps) {
  function handleActionClick(action: Action) {
    if (action.disabled) return;

    if (action.external && action.href) {
      window.open(action.href, "_blank");
    }

    onActionClick?.(action);
  }

  const {
    orientation = "horizontal",
    position = "left",
    density = "comfortable",
    variant = "default",
  } = design;

  // Non-responsive version - simple flex container
  if (!responsive) {
    return (
      <div
        className={`mv-actionbar mv-actionbar--${variant} mv-actionbar--${position} mv-actionbar--${orientation} mv-actionbar--${density}`}
      >
        {actions.map((action) => (
          <Action
            key={action.id}
            action={action}
            onClick={() => handleActionClick(action)}
            design={{ variant: "ghost", size: "md" }}
          />
        ))}
      </div>
    );
  }

  // Responsive version with proper container query structure
  return (
    <div
      className={`mv-actionbar-container mv-actionbar-container--${position} mv-actionbar-container--${orientation}`}
    >
      <div
        className={`mv-actionbar mv-actionbar--${variant} mv-actionbar--${orientation} mv-actionbar--${density}`}
      >
        {actions.map((action) => (
          <Action
            key={action.id}
            action={action}
            onClick={() => handleActionClick(action)}
            design={{ variant: "ghost", size: "md" }}
          />
        ))}
      </div>
    </div>
  );
}

export interface CollapsibleSectionProps extends BaseProps {
  /** Section title */
  title: string;
  /** Optional icon */
  icon?: string;
  /** Optional badge count */
  badge?: number;
  /** Optional link destination */
  href?: string;
  /** Section content */
  children: React.ReactNode;

  /** 🎨 STATIC DESIGN - Visual presentation decisions */
  design?: {
    /** Visual treatment style */
    variant?: "default" | "bordered" | "raised";
    /** Physical scale */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Expansion state (changes frequently) */
  /** Whether section is expanded (controlled) */
  expanded?: boolean;
  /** Whether section can be collapsed */
  collapsible?: boolean;

  /** Event handlers */
  onToggle?: (expanded: boolean) => void;
  onTitleClick?: () => void;
}

/**
 * CollapsibleSection - Accordion-style collapsible content
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
  design = {},
  responsive = true,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const {
    variant = "default",
    size = "md",
  } = design;

  function handleToggle() {
    if (!collapsible) return;

    const newExpanded = !expanded;

    if (isControlled) {
      onToggle?.(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  }

  function handleTitleClick() {
    onTitleClick?.();
    if (collapsible) {
      handleToggle();
    }
  }

  const containerClass = responsive ? "mv-collapsible-container" : "";
  const stateClasses = [
    expanded && "mv-collapsible--expanded",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={`mv-collapsible mv-collapsible--${variant} mv-collapsible--${size} ${containerClass} ${stateClasses}`}
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

export interface TableProps extends BaseProps {
  /** Table column definitions */
  columns: TableColumn[];
  /** Table data rows */
  data: any[];

  /** 🎨 STATIC DESIGN - Presentation style decisions */
  design?: {
    /** Visual treatment */
    variant?: "default" | "striped" | "bordered";
    /** Row/cell spacing density */
    density?: Density;
    /** Text and element scale */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Interactive state (changes frequently) */
  /** Sorting capability and current sort state */
  sortable?: boolean;
  /** Selection capability */
  selectable?: boolean;
  /** Currently selected rows */
  selectedRows?: any[];

  /** Event handlers */
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}

/**
 * Table - Comprehensive data table with container-aware responsive behavior
 */
export function Table({
  columns,
  data,
  design = {},
  sortable = false,
  selectable = false,
  selectedRows = [],
  onSort,
  onRowClick,
  onSelectionChange,
  responsive = true,
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<
    {
      key: string;
      direction: "asc" | "desc";
    } | null
  >(null);

  const {
    variant = "default",
    density = "comfortable",
    size = "md",
  } = design;

  function handleSort(column: TableColumn) {
    if (!sortable || !column.sortable) return;

    const direction =
      sortConfig?.key === column.key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    setSortConfig({ key: column.key, direction });
    onSort?.(column.key, direction);
  }

  function handleRowSelect(row: any, selected: boolean) {
    if (!selectable) return;

    const newSelection = selected
      ? [...selectedRows, row]
      : selectedRows.filter((r) => r !== row);

    onSelectionChange?.(newSelection);
  }

  function handleSelectAll() {
    if (!selectable) return;

    const allSelected = data.length > 0 && selectedRows.length === data.length;
    onSelectionChange?.(allSelected ? [] : [...data]);
  }

  function isRowSelected(row: any) {
    return selectedRows.includes(row);
  }

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 &&
    selectedRows.length < data.length;

  const containerClass = responsive ? "mv-table-container" : "";

  return (
    <div
      className={`mv-table mv-table--${variant} mv-table--${density} mv-table--${size} ${containerClass}`}
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
                  data-label={column.label}
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

export interface PaginationProps extends BaseProps {
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Current active page number */
  currentPage: number;
  /** Available page size options */
  pageSizeOptions?: number[];

  /** 🎨 STATIC DESIGN - Layout structure decisions */
  design?: {
    /** Content arrangement - affects layout structure */
    orientation?: Orientation;
    /** Visual spacing density */
    density?: Density;
    /** Physical scale */
    size?: Size;
  };

  /** ⚡ DYNAMIC STATE - Display options that may change */
  /** Show item count information */
  showPageInfo?: boolean;
  /** Show page size selector */
  showPageSizeSelector?: boolean;

  /** Event handlers */
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Pagination - Complete pagination with orientation support
 */
export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  showPageInfo = true,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100],
  design = {},
  onPageChange,
  onPageSizeChange,
  responsive = true,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const {
    orientation = "horizontal",
    density = "comfortable",
    size = "md",
  } = design;

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  }

  function handlePageSizeChange(newPageSize: number) {
    onPageSizeChange?.(newPageSize);
    onPageChange(1);
  }

  function getPageNumbers() {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

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

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mv-pagination">
      <div
        className={`mv-pagination-container mv-pagination-container--${orientation} mv-pagination--${density} mv-pagination--${size}`}
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
// PERFORMANCE-OPTIMIZED EXAMPLES
// ===========================================

/*
🚀 PERFORMANCE-CONSCIOUS USAGE EXAMPLES:

// ✅ GOOD - Stable design references
const primaryButton = { variant: 'filled', intent: 'primary', size: 'lg' };
const secondaryButton = { variant: 'outline', intent: 'secondary', size: 'md' };

function MyForm({ isSubmitting, isValid }) {
  return (
    <div>
      <Button
        design={primaryButton}        // Static object reference - no re-renders
        loading={isSubmitting}        // Dynamic state - changes efficiently
        disabled={!isValid}          // Dynamic state - changes efficiently
      >
        Submit
      </Button>

      <Button
        design={secondaryButton}      // Static object reference - no re-renders
        disabled={isSubmitting}       // Dynamic state - changes efficiently
      >
        Cancel
      </Button>
    </div>
  );
}

// ❌ BAD - Creates new objects every render
function MyForm({ isSubmitting, isValid }) {
  return (
    <Button
      design={{
        variant: 'filled',
        intent: isSubmitting ? 'loading' : 'primary'  // State in design prop!
      }}
    >
      Submit
    </Button>
  );
}

🎯 THE GOLDEN RULE:
If it changes in response to user interaction or real-time updates,
it's NOT a design choice - it's component state.

Static design props = Set once, rarely change = Performance ✅
Dynamic state props = Change frequently = Separate props ✅
*/
