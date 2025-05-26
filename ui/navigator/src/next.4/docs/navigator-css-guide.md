# CSS Documentation

## Naming Convention

The Navigator uses a consistent class naming pattern:

- All classes are prefixed with `mv-`
- Navigation components use the `mv-nav-` prefix
- Template-specific classes use the template name prefix:
  - Dashboard: `mv-dashboard-`
  - Docs: `mv-docs-`
  - Ecommerce: `mv-ecommerce-`
  - News: `mv-news-`

## CSS Variables

The base styles (in `navigator.css`) define CSS variables for consistent
theming:

```css
:root {
  /* Colors */
  --mv-nav-primary-color: #4285f4;
  --mv-nav-surface-color: #ffffff;
  --mv-nav-text-color: #202124;
  --mv-nav-muted-color: #5f6368;
  --mv-nav-border-color: #dadce0;
  --mv-nav-active-color: #4285f4;
  --mv-nav-active-bg: #e8f0fe;

  /* Typography */
  --mv-nav-font-family: system-ui, sans-serif;
  --mv-nav-font-size: 14px;
  --mv-nav-font-weight: 400;
  --mv-nav-font-weight-bold: 500;

  /* Spacing */
  --mv-nav-header-height: 64px;
  --mv-nav-item-padding: 0 16px;
  --mv-nav-drawer-width: 280px;

  /* Animation */
  --mv-nav-transition-speed: 0.3s;
  --mv-nav-transition-curve: ease;
}
```

These variables should be used throughout your templates for consistency.

## Component CSS Classes

### Header Component

- `.mv-nav-header`: Main header container
- `.mv-nav-header-inner`: Inner container for header content

### Brand Component

- `.mv-nav-brand`: Container for logo and title
- `.mv-nav-brand-logo`: Logo container
- `.mv-nav-brand-title`: Application title

### Drawer Component

- `.mv-nav-drawer`: Sidebar drawer container
- `.mv-nav-drawer.open`: Active state
- `.mv-nav-drawer.persistent`: Always-visible mode
- `.mv-nav-drawer.temporary`: Toggle-visible mode
- `.mv-nav-drawer-content`: Content container

### Navigation Item

- `.mv-nav-item`: Navigation item
- `.mv-nav-item.active`: Active state
- `.mv-nav-item-icon`: Icon container
- `.mv-nav-item-label`: Text label
- `.mv-nav-item.depth-0/1/2`: Nesting levels

### Navigation Group

- `.mv-nav-group`: Group container
- `.mv-nav-group-header`: Group title bar
- `.mv-nav-group-title`: Group title
- `.mv-nav-group-toggle`: Expand/collapse toggle
- `.mv-nav-group-children`: Container for child items

### Tabs

- `.mv-nav-tabs`: Tab container
- `.mv-nav-tabs.primary`: Primary tabs style
- `.mv-nav-tabs.secondary`: Secondary tabs style
- `.mv-nav-tab-item`: Individual tab
- `.mv-nav-tab-item.active`: Active tab

### Search

- `.mv-nav-search`: Search container
- `.mv-nav-search-container`: Input and buttons wrapper
- `.mv-nav-search-input`: Text input
- `.mv-nav-search-button`: Search action button

### Actions

- `.mv-nav-actions`: Action buttons container
- `.mv-nav-action-button`: Action button

### Overlay

- `.mv-nav-backdrop`: Backdrop for mobile drawer

## Template-Specific Classes

### Dashboard Template

- `.mv-dashboard-container`: Main container
- `.mv-dashboard-layout`: Layout grid structure
- `.mv-dashboard-content`: Content area

### Docs Template

- `.mv-docs-container`: Main container
- `.mv-docs-layout`: Layout structure
- `.mv-docs-sidebar`: Documentation sidebar
- `.mv-docs-content`: Content area

### Ecommerce Template

- `.mv-ecommerce-container`: Main container
- `.mv-ecommerce-layout`: Layout structure
- `.store-nav-categories`: Category navigation
- `.store-mega-menu-trigger`: Mega menu trigger

### News Template

- `.mv-news-container`: Main container
- `.mv-news-layout`: Layout structure
- `.mv-news-tabs-container`: Tab containers
- `.news-google-logo`: Custom Google logo

## Responsive Design

The Navigator uses media queries for responsive adaptations:

```css
@media (max-width: 768px) {
  /* Mobile adaptations */
  .mv-nav-drawer {
    transform: translateX(-100%);
  }

  .mv-nav-drawer.open {
    transform: translateX(0);
  }
}
```

All templates should follow this breakpoint pattern.

## Dark Mode Support

Dark mode is supported via CSS variables:

```css
.dark-mode {
  --mv-nav-surface-color: #1f2937;
  --mv-nav-text-color: #f9fafb;
  --mv-nav-muted-color: #9ca3af;
  --mv-nav-border-color: #374151;
  --mv-nav-active-bg: #2d3748;
}
```

## Custom Template Styling

When creating a custom template:

1. Import the base stylesheet first
2. Follow the naming conventions
3. Use CSS variables for theming
4. Implement responsive designs

Example:

```css
/* Import base styles */
@import "../styles/base.css";

/* Custom template styles */
.mv-custom-container {
  font-family: var(--mv-nav-font-family);
  color: var(--mv-nav-text-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mv-custom-layout {
  display: flex;
  flex: 1;
}

/* Responsive adaptation */
@media (max-width: 768px) {
  .mv-custom-layout {
    flex-direction: column;
  }
}
```
