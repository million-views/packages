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
defaults\
**Data-Driven Interfaces**: Pass data arrays instead of writing complex markup\
**Comprehensive Theming**: CSS custom properties for complete visual
customization\
**Type-Stripping Compatible**: Works with Node.js `--experimental-strip-types`
flag\
**Modern CSS Architecture**: Built with custom properties, advanced selectors,
and performance-first animations

## Usage

```tsx
// Data-driven approach - minimal markup required
import { ActionBar, List, Select } from "@m5nv/ui-elements";

// Instead of complex markup, provide data
const selectOptions = [
  { value: "v2.0", label: "Version 2.0" },
  { value: "v1.9", label: "Version 1.9" },
];

const toolbarActions = [
  { id: "save", label: "Save", icon: "💾" },
  { id: "export", label: "Export", icon: "📤", badge: 3 },
];

const listItems = [
  { id: "1", label: "Dashboard", icon: "📊", description: "Main overview" },
  { id: "2", label: "Settings", icon: "⚙️", description: "Configuration" },
];

// Components handle all markup generation and styling
function App() {
  return (
    <>
      <ActionBar actions={toolbarActions} onActionClick={handleAction} />
      <Select options={selectOptions} onSelect={handleVersionChange} />
      <List
        items={listItems}
        variant="detailed"
        onItemClick={handleNavigation}
      />
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

#### Card

Flexible container with multiple visual styles and padding options.

```tsx
<Card variant="elevated" padding="lg">
  <h2>Card Content</h2>
  <p>Professional styling applied automatically</p>
</Card>;
```

**Variants:** `default`, `elevated`, `outlined`, `glass`

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
import { Button, List } from "@m5nv/ui-elements";

const OptimizedList = React.memo(List);
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
import { ActionBar, Header, List } from "@m5nv/ui-elements";

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
