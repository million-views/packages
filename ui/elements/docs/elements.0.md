# @m5nv/ui-elements

**Opinionated, data-driven, themeable UI component library built with modern
CSS.**

Unlike headless UI libraries that provide behavior without styling, Elements
delivers complete styled components with comprehensive theming via CSS custom
properties. Data-driven interfaces minimize markup requirements while maximizing
developer productivity.

## Package Architecture

```
packages/
├── @m5nv/ui-elements/        # Complete UI component library (this package)
├── @m5nv/ui/navigator/       # Navigation system using Elements
└── @m5nv/rr-builder/         # Route configuration
```

## Installation

```bash
npm install @m5nv/ui-elements
```

## Design Philosophy

**Opinionated Styling**: Complete visual design out of the box with professional
defaults **Data-Driven Interfaces**: Pass data arrays instead of writing complex
markup **Comprehensive Theming**: CSS custom properties for complete visual
customization **Type-Stripping Compatible**: Works with Node.js
`--experimental-strip-types` flag **Modern CSS Architecture**: Built with custom
properties, advanced selectors, and performance-first animations

## Usage

```tsx
// Data-driven approach - minimal markup required
import { ActionBar, Select, Table } from "@m5nv/ui-elements";

// Instead of complex markup, provide data
const tableData = {
  columns: [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
  ],
  data: users,
};

const selectOptions = [
  { value: "v2.0", label: "Version 2.0" },
  { value: "v1.9", label: "Version 1.9" },
];

const toolbarActions = [
  { id: "save", label: "Save", icon: "💾" },
  { id: "export", label: "Export", icon: "📤", badge: 3 },
];

// Components handle all markup generation and styling
function App() {
  return (
    <>
      <ActionBar actions={toolbarActions} onActionClick={handleAction} />
      <Select options={selectOptions} onSelect={handleVersionChange} />
      <Table {...tableData} onSort={handleSort} onRowClick={handleRowSelect} />
    </>
  );
}
```

## vs Headless UI Libraries

| Feature                  | Headless UI                | @m5nv/ui-elements                   |
| ------------------------ | -------------------------- | ----------------------------------- |
| **Styling**              | None - you provide all CSS | Complete professional design system |
| **Markup**               | Complex nested components  | Simple data-driven props            |
| **Theming**              | Build from scratch         | CSS custom properties               |
| **Data Handling**        | Manual prop drilling       | Built-in data transformation        |
| **Developer Experience** | High learning curve        | Minimal setup, maximum productivity |

## Complete Component Catalog

### Layout Elements

#### Header

Modern responsive header container with multiple visual variants.

```tsx
<Header variant="glass">
  <Brand title="My App" logo="🚀" />
  <SearchBox placeholder="Search..." />
  <ActionBar actions={headerActions} />
</Header>;
```

**Variants:** `default`, `glass`, `elevated`

**CSS Classes & Customization:**

```css
/* Base header */
.mv-header {
  background: var(--mv-color-surface);
  border-bottom: 1px solid var(--mv-color-border);
  position: sticky;
  top: 0;
  z-index: 30;
}

/* Variants */
.mv-header--glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.mv-header--elevated {
  background: var(--mv-color-surface);
  box-shadow: var(--mv-shadow-lg);
  border-bottom: none;
}

/* Inner container */
.mv-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 var(--mv-space-xl);
  gap: var(--mv-space-lg);
}
```

**Custom Properties:**

- `--mv-color-surface` - Header background
- `--mv-color-border` - Border color
- `--mv-shadow-lg` - Elevated shadow
- `--mv-space-xl` - Inner padding

#### Brand

Logo and title display with flexible sizing and optional subtitles.

```tsx
<Brand
  title="Application Name"
  subtitle="Professional Suite"
  logo={<Logo />}
  size="lg"
/>;
```

**CSS Classes & Customization:**

```css
/* Base brand container */
.mv-brand {
  display: flex;
  align-items: center;
}

/* Size variants */
.mv-brand--sm .mv-brand__logo {
  width: 1.5rem;
  height: 1.5rem;
}
.mv-brand--sm .mv-brand__title {
  font-size: var(--mv-font-size-md);
}

.mv-brand--md .mv-brand__logo {
  width: 2rem;
  height: 2rem;
}
.mv-brand--md .mv-brand__title {
  font-size: var(--mv-font-size-lg);
}

.mv-brand--lg .mv-brand__logo {
  width: 2.5rem;
  height: 2.5rem;
}
.mv-brand--lg .mv-brand__title {
  font-size: var(--mv-font-size-xl);
}

/* Brand link */
.mv-brand__link {
  display: flex;
  align-items: center;
  gap: var(--mv-space-md);
  text-decoration: none;
  color: inherit;
}

/* Logo container */
.mv-brand__logo {
  background: var(--mv-color-primary);
  border-radius: var(--mv-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mv-color-text-inverse);
}

/* Text content */
.mv-brand__title {
  font-weight: 600;
  line-height: 1.2;
}

.mv-brand__subtitle {
  font-size: var(--mv-font-size-sm);
  color: var(--mv-color-text-secondary);
  line-height: 1.2;
}
```

**Custom Properties:**

- `--mv-color-primary` - Logo background
- `--mv-color-text-secondary` - Subtitle color
- `--mv-font-size-*` - Title/subtitle sizes
- `--mv-space-md` - Gap between logo and text

#### Card

Flexible container with multiple visual styles and padding options.

```tsx
<Card variant="elevated" padding="lg">
  <h2>Card Content</h2>
  <p>Professional styling applied automatically</p>
</Card>;
```

**Variants:** `default`, `elevated`, `outlined`, `glass`

**CSS Classes & Customization:**

```css
/* Base card */
.mv-card {
  border-radius: var(--mv-radius-lg);
  transition: var(--mv-transition-fast);
}

/* Style variants */
.mv-card--default {
  background: var(--mv-color-surface);
  border: 1px solid var(--mv-color-border);
}

.mv-card--elevated {
  background: var(--mv-color-surface-elevated);
  box-shadow: var(--mv-shadow-md);
}

.mv-card--outlined {
  background: transparent;
  border: 2px solid var(--mv-color-border);
}

.mv-card--glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.6);
}

/* Padding variants */
.mv-card--padding-none {
  padding: 0;
}
.mv-card--padding-sm {
  padding: var(--mv-space-lg);
}
.mv-card--padding-md {
  padding: var(--mv-space-xl);
}
.mv-card--padding-lg {
  padding: var(--mv-space-2xl);
}
```

**Custom Properties:**

- `--mv-color-surface` - Card background
- `--mv-color-border` - Border color
- `--mv-shadow-md` - Elevated shadow
- `--mv-radius-lg` - Card border radius

#### Drawer

Slide-out panel with backdrop and animations for any content.

```tsx
<Drawer
  isOpen={drawerOpen}
  onClose={closeDrawer}
  position="right"
  mode="temporary"
>
  <ShoppingCart />
  {/* Or navigation, tools, filters, etc. */}
</Drawer>;
```

**CSS Classes & Customization:**

```css
/* Base drawer */
.mv-drawer {
  position: fixed;
  top: 0;
  height: 100vh;
  background: var(--mv-color-surface);
  box-shadow: var(--mv-shadow-lg);
  transition: transform var(--mv-transition-normal);
  z-index: 40;
}

/* Position variants */
.mv-drawer--left {
  left: 0;
  transform: translateX(-100%);
}

.mv-drawer--right {
  right: 0;
  transform: translateX(100%);
}

.mv-drawer--open {
  transform: translateX(0);
}

/* Mode variants */
.mv-drawer--persistent {
  position: relative;
  height: auto;
  box-shadow: none;
}

.mv-drawer--temporary {
  position: fixed;
}

/* Drawer content */
.mv-drawer__content {
  height: 100%;
  overflow-y: auto;
  padding: var(--mv-space-lg);
}

/* Backdrop */
.mv-drawer__backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 39;
}
```

**Custom Properties:**

- `--mv-color-surface` - Drawer background
- `--mv-shadow-lg` - Drawer shadow
- `--mv-transition-normal` - Animation duration
- `--mv-space-lg` - Content padding

### Interactive Elements

#### Button

Comprehensive button system with variants, loading states, and badges.

```tsx
<Button
  variant="primary"
  size="lg"
  badge={5}
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</Button>;
```

**Variants:** `primary`, `secondary`, `ghost`, `danger`, `success`

**CSS Classes & Customization:**

```css
/* Base button */
.mv-button {
  position: relative;
  border: 2px solid transparent;
  border-radius: var(--mv-radius-md);
  cursor: pointer;
  font-weight: 500;
  transition: var(--mv-transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mv-space-sm);
}

/* Size variants */
.mv-button--sm {
  padding: var(--mv-space-sm) var(--mv-space-md);
  font-size: var(--mv-font-size-sm);
  height: 2rem;
}

.mv-button--md {
  padding: var(--mv-space-sm) var(--mv-space-lg);
  font-size: var(--mv-font-size-md);
  height: 2.5rem;
}

.mv-button--lg {
  padding: var(--mv-space-md) var(--mv-space-xl);
  font-size: var(--mv-font-size-lg);
  height: 3rem;
}

/* Style variants */
.mv-button--ghost {
  background: transparent;
  color: var(--mv-color-text-secondary);
  border-color: transparent;
}

.mv-button--ghost:hover:not(:disabled) {
  background: var(--mv-color-surface-hover);
  border-color: var(--mv-color-border);
  color: var(--mv-color-text-primary);
}

.mv-button--primary {
  background: var(--mv-color-primary);
  color: var(--mv-color-text-inverse);
  border-color: var(--mv-color-primary);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.mv-button--primary:hover:not(:disabled) {
  background: var(--mv-color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.mv-button--secondary {
  background: #f1f5f9;
  color: var(--mv-color-secondary);
  border-color: #e2e8f0;
}

.mv-button--danger {
  background: var(--mv-color-danger);
  color: var(--mv-color-text-inverse);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.mv-button--success {
  background: var(--mv-color-success);
  color: var(--mv-color-text-inverse);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

/* Badge */
.mv-button__badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: var(--mv-color-danger);
  color: var(--mv-color-text-inverse);
  border-radius: var(--mv-radius-xl);
  padding: 0.125rem 0.375rem;
  font-size: var(--mv-font-size-xs);
  min-width: 1rem;
  height: 1rem;
}

/* Loading spinner */
.mv-button__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

**Custom Properties:**

- `--mv-color-primary` - Primary button background
- `--mv-color-secondary` - Secondary button color
- `--mv-color-danger` - Danger button background
- `--mv-color-success` - Success button background
- `--mv-radius-md` - Button border radius

#### SearchBox

Advanced search input with multiple variants and expandable mode.

```tsx
<SearchBox
  variant="filled"
  expandable={true}
  onSearch={handleSearch}
  placeholder="Search products..."
/>;
```

**Variants:** `default`, `filled`, `outlined`

**CSS Classes & Customization:**

```css
/* Base search container */
.mv-search {
  position: relative;
}

.mv-search__container {
  display: flex;
  align-items: center;
  gap: var(--mv-space-sm);
  border-radius: var(--mv-radius-md);
  transition: var(--mv-transition-fast);
}

/* Size variants */
.mv-search--sm .mv-search__container {
  height: 2rem;
  padding: 0 var(--mv-space-sm);
}

.mv-search--md .mv-search__container {
  height: 2.5rem;
  padding: 0 var(--mv-space-md);
}

.mv-search--lg .mv-search__container {
  height: 3rem;
  padding: 0 var(--mv-space-lg);
}

/* Style variants */
.mv-search--default .mv-search__container {
  background: #f8fafc;
  border: 1px solid transparent;
}

.mv-search--filled .mv-search__container {
  background: white;
  border: 2px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.mv-search--outlined .mv-search__container {
  background: transparent;
  border: 2px solid #d1d5db;
}

/* Focus states */
.mv-search--default:focus-within .mv-search__container {
  border-color: var(--mv-color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mv-search--filled:focus-within .mv-search__container {
  border-color: var(--mv-color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mv-search--outlined:focus-within .mv-search__container {
  border-color: var(--mv-color-primary);
  background: white;
}

/* Search input */
.mv-search__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: var(--mv-font-size-md);
  color: var(--mv-color-text-primary);
}

.mv-search__input::placeholder {
  color: var(--mv-color-text-muted);
}

/* Action buttons */
.mv-search__clear,
.mv-search__collapse {
  background: none;
  border: none;
  padding: var(--mv-space-xs);
  cursor: pointer;
  border-radius: var(--mv-radius-sm);
  transition: var(--mv-transition-fast);
}

.mv-search__clear:hover,
.mv-search__collapse:hover {
  background: #f1f5f9;
}

/* Expandable toggle */
.mv-search__toggle {
  background: none;
  border: none;
  padding: var(--mv-space-sm);
  border-radius: var(--mv-radius-md);
  cursor: pointer;
  transition: var(--mv-transition-fast);
}

.mv-search__toggle:hover {
  background: var(--mv-color-surface-hover);
}
```

**Custom Properties:**

- `--mv-color-primary` - Focus border color
- `--mv-color-text-muted` - Placeholder text
- `--mv-radius-md` - Container border radius
- `--mv-transition-fast` - Focus animation

### Data-Driven Components

#### Select

Advanced dropdown with search, clear functionality, and descriptions.

```tsx
<Select
  options={[
    { value: "pro", label: "Professional", description: "Advanced features" },
    { value: "basic", label: "Basic", description: "Essential features" },
  ]}
  searchable={true}
  clearable={true}
  onSelect={handlePlanChange}
/>;
```

**Features:** Search filtering, option descriptions, clear button, keyboard
navigation

#### TabGroup

Data-driven tab interface with multiple visual styles.

```tsx
<TabGroup
  tabs={[
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "settings", label: "Settings", icon: "⚙️", badge: 3 },
    { id: "help", label: "Help", external: true, href: "/help" },
  ]}
  variant="pills"
  activeTab="overview"
  onTabChange={handleTabChange}
/>;
```

**Variants:** `default`, `pills`, `underline`

#### List

Data-driven list component with selection support and multiple layouts.

```tsx
<List
  items={[
    {
      id: "1",
      label: "Dashboard",
      icon: "📊",
      badge: 5,
      description: "Main application dashboard",
    },
    { id: "2", label: "Settings", icon: "⚙️", href: "/settings" },
  ]}
  variant="detailed"
  selectable={true}
  onItemClick={handleNavigation}
  onSelectionChange={handleSelection}
/>;
```

**Variants:** `default`, `compact`, `detailed`

#### ActionBar

Data-driven toolbar with actions, badges, and flexible positioning.

```tsx
<ActionBar
  actions={[
    { id: "new", label: "New", icon: "➕" },
    { id: "save", label: "Save", icon: "💾", disabled: !hasChanges },
    { id: "notifications", label: "Alerts", icon: "🔔", badge: 12 },
  ]}
  position="right"
  onActionClick={handleToolbarAction}
/>;
```

#### CollapsibleSection

Accordion-style collapsible content with controlled/uncontrolled modes.

```tsx
<CollapsibleSection
  title="Advanced Settings"
  icon="⚙️"
  badge={3}
  expanded={isExpanded}
  onToggle={setIsExpanded}
>
  <SettingsPanel />
</CollapsibleSection>;
```

#### Breadcrumbs

Data-driven navigation trail with truncation support.

```tsx
<Breadcrumbs
  items={[
    { id: "home", label: "Home", href: "/" },
    { id: "products", label: "Products", href: "/products" },
    { id: "details", label: "Product Details" },
  ]}
  maxItems={5}
  onItemClick={handleBreadcrumbClick}
/>;
```

#### MegaDropdown

Multi-column dropdown menu with grouping and featured items.

```tsx
<MegaDropdown
  groups={[
    {
      id: "products",
      title: "Products",
      items: [
        { id: "pro", label: "Professional", featured: true },
        { id: "basic", label: "Basic" },
      ],
    },
    {
      id: "services",
      title: "Services",
      items: servicesData,
    },
  ]}
  columns={3}
  showFeatured={true}
  onItemClick={handleMenuClick}
/>;
```

#### Table

Comprehensive data table with sorting, selection, and custom rendering.

```tsx
<Table
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (value) => <StatusBadge status={value} />,
    },
  ]}
  data={users}
  sortable={true}
  selectable={true}
  onSort={handleSort}
  onRowClick={handleRowClick}
  onSelectionChange={handleSelectionChange}
/>;
```

#### Pagination

Complete pagination controls with page size selection.

```tsx
<Pagination
  totalItems={1000}
  itemsPerPage={20}
  currentPage={currentPage}
  showPageInfo={true}
  showPageSizeSelector={true}
  pageSizeOptions={[10, 20, 50, 100]}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
/>;
```

## CSS Architecture & Theming

### Comprehensive Design System

Elements uses a complete design system built with CSS custom properties:

```css
:root {
  /* Color Palette */
  --mv-color-primary: #3b82f6;
  --mv-color-secondary: #64748b;
  --mv-color-success: #10b981;
  --mv-color-danger: #ef4444;
  --mv-color-warning: #f59e0b;

  /* Surface Colors */
  --mv-color-surface: #ffffff;
  --mv-color-background: #f8fafc;
  --mv-color-border: #e2e8f0;

  /* Typography */
  --mv-font-family: system-ui, -apple-system, sans-serif;
  --mv-font-size-xs: 0.75rem;
  --mv-font-size-sm: 0.875rem;
  --mv-font-size-md: 1rem;
  --mv-font-size-lg: 1.125rem;

  /* Spacing System */
  --mv-space-xs: 0.25rem;
  --mv-space-sm: 0.5rem;
  --mv-space-md: 0.75rem;
  --mv-space-lg: 1rem;
  --mv-space-xl: 1.5rem;
  --mv-space-2xl: 2rem;

  /* Animation */
  --mv-transition-fast: 150ms ease;
  --mv-transition-normal: 250ms ease;
  --mv-transition-slow: 350ms ease;
}
```

### Easy Theming

Transform the entire library with CSS custom properties:

```css
/* Dark Theme */
:root {
  --mv-color-surface: #1e293b;
  --mv-color-background: #0f172a;
  --mv-color-text-primary: #f8fafc;
  --mv-color-border: #334155;
}

/* Brand Colors */
:root {
  --mv-color-primary: #7c3aed;
  --mv-color-success: #059669;
}

/* Custom Spacing */
:root {
  --mv-space-lg: 2rem; /* More spacious layout */
}
```

## Real-World Examples

### E-commerce Dashboard

```tsx
function EcommerceDashboard() {
  return (
    <>
      <Header variant="elevated">
        <Brand title="ShopAdmin" logo="🛍️" />
        <SearchBox placeholder="Search products..." variant="filled" />
        <ActionBar
          actions={[
            { id: "orders", label: "Orders", badge: 12 },
            { id: "profile", label: "Profile", icon: "👤" },
          ]}
        />
      </Header>

      <div style={{ display: "flex" }}>
        <Drawer isOpen={sidebarOpen} position="left">
          <List
            items={navigationItems}
            variant="detailed"
            onItemClick={handleNavigation}
          />
        </Drawer>

        <main style={{ flex: 1, padding: "var(--mv-space-xl)" }}>
          <TabGroup
            tabs={dashboardTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
          />

          <Card variant="elevated" padding="lg">
            <Table
              columns={productColumns}
              data={products}
              sortable={true}
              selectable={true}
              onSort={handleSort}
            />

            <Pagination
              totalItems={totalProducts}
              itemsPerPage={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showPageSizeSelector={true}
            />
          </Card>
        </main>
      </div>
    </>
  );
}
```

### Documentation Site

```tsx
function DocsSite() {
  return (
    <>
      <Header variant="glass">
        <Brand title="API Docs" subtitle="v2.0" />
        <Select
          options={versionOptions}
          value={currentVersion}
          onSelect={setVersion}
        />
      </Header>

      <Breadcrumbs
        items={currentPath}
        onItemClick={navigateToSection}
      />

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr" }}>
        <aside>
          {docSections.map((section) => (
            <CollapsibleSection
              key={section.id}
              title={section.title}
              expanded={expandedSections.includes(section.id)}
            >
              <List
                items={section.pages}
                variant="compact"
                onItemClick={navigateToPage}
              />
            </CollapsibleSection>
          ))}
        </aside>

        <main>
          <DocumentationContent />
        </main>
      </div>
    </>
  );
}
```

## Performance & Accessibility

**Performance Features:**

- Minimal CSS bundle with tree-shakeable imports
- Hardware-accelerated animations
- Optimized re-renders with React best practices
- Consumer-controlled optimization with React.memo()

**Accessibility Features:**

- Full keyboard navigation support
- ARIA attributes for screen readers
- Focus management with visible indicators
- Semantic HTML structure
- WCAG AA compliant color combinations

**Performance Optimization:**

```tsx
// Optional: Optimize high-frequency components
import { Button, Table } from "@m5nv/ui-elements";

const OptimizedTable = React.memo(Table);
const OptimizedButton = React.memo(Button);
```

## Runtime Compatibility

**Node.js Type-Stripping Support:**

```bash
# Direct TypeScript execution
node --experimental-strip-types app.ts
```

**Compatible TypeScript Features:**

- `interface` declarations (stripped at runtime)
- `type` aliases (stripped at runtime)
- Function parameter types (stripped at runtime)
- Generic constraints (stripped at runtime)

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **CSS Features**: Custom Properties, Advanced Selectors, Transforms
- **Runtime**: Node.js 22+ with type-stripping support

## Framework Integration

### Standalone Usage

```tsx
import { ActionBar, Header, Table } from "@m5nv/ui-elements";

// Complete UI library - no framework dependencies
function App() {
  return (
    <Header variant="elevated">
      <ActionBar actions={actions} onActionClick={handleAction} />
    </Header>
  );
}
```

### With Navigator

```tsx
import { Navigator } from "@m5nv/ui/navigator";

// Navigator uses Elements internally for UI
<Navigator config={navConfig} />;
```

## Migration Benefits

**From Headless UI Libraries:**

- ✅ Remove hundreds of lines of CSS
- ✅ Replace complex markup with simple data props
- ✅ Get professional design immediately
- ✅ Comprehensive theming system included

**From Other UI Libraries:**

- ✅ Data-driven approach reduces markup complexity
- ✅ Modern CSS architecture with better performance
- ✅ AI-optimized single-file distribution
- ✅ Type-stripping compatibility for Node.js

## Contributing

New elements should:

1. **Be data-driven** - accept data structures, not require complex markup
2. **Follow design system** - use CSS custom property patterns
3. **Include accessibility** - keyboard navigation and ARIA support
4. **Be framework-agnostic** - work in any React application
5. **Have comprehensive TypeScript** - full interface coverage

The library focuses on **opinionated, complete solutions** rather than minimal
building blocks, providing maximum developer productivity with professional
results.
