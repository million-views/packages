# @m5nv/ui-elements

**Multi-palette, data-driven, themeable UI component library built with modern
CSS.**

Unlike headless UI libraries that provide behavior without styling, Elements
delivers complete styled components with 5 beautiful color palettes, each
available in light and dark variants. Data-driven interfaces minimize markup
requirements while maximizing developer productivity.

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

**Multi-Palette System**: 5 complete color palettes (Ghibli, Blue, Purple,
Green, Orange) each with light and dark variants\
**Opinionated Styling**: Complete visual design out of the box with professional
defaults\
**Data-Driven Interfaces**: Pass data arrays instead of writing complex markup\
**Comprehensive Theming**: CSS custom properties enable instant theme switching\
**Type-Stripping Compatible**: Works with Node.js `--experimental-strip-types`
flag\
**Modern CSS Architecture**: Built with custom properties, advanced selectors,
and performance-first animations

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
// Choose your palette for instant brand alignment
function App() {
  // Set your preferred palette and theme
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", "blue"); // Professional
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

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

| Feature                  | Headless UI                | @m5nv/ui-elements                            |
| ------------------------ | -------------------------- | -------------------------------------------- |
| **Styling**              | None - you provide all CSS | 5 complete palettes with light/dark variants |
| **Markup**               | Complex nested components  | Simple data-driven props                     |
| **Theming**              | Build from scratch         | Instant palette switching via CSS            |
| **Data Handling**        | Manual prop drilling       | Built-in data transformation                 |
| **Developer Experience** | High learning curve        | 10 themes ready, maximum productivity        |

## Complete Component Catalog

### Layout Elements

#### Header

Modern responsive header container with warm, natural styling.

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
  z-index: var(--mv-z-sticky);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Variants */
.mv-header--glass {
  background: rgba(250, 249, 246, 0.85);
  border-bottom: 1px solid rgba(230, 225, 216, 0.6);
}

.mv-header--elevated {
  background: var(--mv-color-surface);
  box-shadow: var(--mv-shadow-md);
  border-bottom: none;
}

/* Inner container */
.mv-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--mv-space-lg) var(--mv-space-xl);
  gap: var(--mv-space-xl);
  min-height: 4rem;
}
```

**Custom Properties:**

- `--mv-color-surface` - Header background (warm white)
- `--mv-color-border` - Border color (soft beige)
- `--mv-shadow-md` - Elevated shadow (soft and natural)
- `--mv-space-xl` - Inner padding (generous spacing)

#### Brand

Logo and title display with warm, friendly styling.

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
  flex-shrink: 0;
}

.mv-brand__link {
  display: flex;
  align-items: center;
  gap: var(--mv-space-md);
  text-decoration: none;
  color: inherit;
  transition: var(--mv-transition-fast);
  border-radius: var(--mv-radius-md);
  padding: var(--mv-space-sm);
  margin: calc(-1 * var(--mv-space-sm));
}

.mv-brand__link:hover {
  background: var(--mv-color-surface-hover);
  transform: translateY(-1px);
}

/* Brand text styling */
.mv-brand__title {
  font-size: var(--mv-font-size-lg);
  font-weight: var(--mv-font-weight-semibold);
  line-height: var(--mv-line-height-tight);
  color: var(--mv-color-text-primary);
}

.mv-brand__subtitle {
  font-size: var(--mv-font-size-sm);
  color: var(--mv-color-text-secondary);
  line-height: var(--mv-line-height-tight);
}
```

**Custom Properties:**

- `--mv-color-text-primary` - Natural dark brown title
- `--mv-color-text-secondary` - Medium brown subtitle
- `--mv-font-size-*` - Natural font scale
- `--mv-space-md` - Organic spacing between elements

#### Card

Flexible container with natural, warm styling.

```tsx
<Card variant="elevated" padding="lg">
  <h2>Card Content</h2>
  <p>Beautiful natural styling applied automatically</p>
</Card>;
```

**Variants:** `default`, `elevated`, `outlined`, `glass`

**CSS Classes & Customization:**

```css
/* Base card with natural warmth */
.mv-card {
  background: var(--mv-color-surface);
  border-radius: var(--mv-radius-lg);
  transition: var(--mv-transition-normal);
  border: 1px solid var(--mv-color-border-light);
}

.mv-card--elevated {
  box-shadow: var(--mv-shadow-md);
  border: 1px solid var(--mv-color-border-light);
}

.mv-card--elevated:hover {
  box-shadow: var(--mv-shadow-lg);
  transform: translateY(-2px);
}

.mv-card--glass {
  background: rgba(250, 249, 246, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(230, 225, 216, 0.6);
}
```

**Custom Properties:**

- `--mv-color-surface` - Warm white background
- `--mv-color-border-light` - Soft border colors
- `--mv-shadow-md/lg` - Natural, soft shadows
- `--mv-radius-lg` - Organic border radius

### Interactive Elements

#### Button

Beautiful button system with natural hover effects and Ghibli-inspired colors.

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
  font-weight: var(--mv-font-weight-medium);
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
  height: 2.25rem;
}

.mv-button--md {
  padding: var(--mv-space-md) var(--mv-space-lg);
  font-size: var(--mv-font-size-md);
  height: 2.75rem;
}

.mv-button--lg {
  padding: var(--mv-space-lg) var(--mv-space-xl);
  font-size: var(--mv-font-size-lg);
  height: 3.25rem;
}

/* Style variants with natural hover effects */
.mv-button--primary {
  background: var(--mv-color-primary);
  color: var(--mv-color-text-inverse);
  border-color: var(--mv-color-primary);
  box-shadow: var(--mv-shadow-sm);
}

.mv-button--primary:hover:not(:disabled) {
  background: var(--mv-color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--mv-shadow-md);
}

.mv-button--ghost {
  background: transparent;
  color: var(--mv-color-text-secondary);
  border-color: var(--mv-color-border);
}

.mv-button--ghost:hover:not(:disabled) {
  background: var(--mv-color-surface-hover);
  border-color: var(--mv-color-border-dark);
  color: var(--mv-color-text-primary);
  transform: translateY(-1px);
}

/* Badge positioning */
.mv-button__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--mv-color-danger);
  color: var(--mv-color-text-inverse);
  border-radius: var(--mv-radius-full);
  padding: 0 var(--mv-space-xs);
  font-size: var(--mv-font-size-xs);
  min-width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--mv-color-surface);
}
```

**Custom Properties:**

- `--mv-color-primary` - Sage green button background
- `--mv-color-secondary` - Warm taupe button color
- `--mv-color-danger` - Muted coral for danger actions
- `--mv-color-success` - Fresh green for success actions
- `--mv-radius-md` - Natural border radius
- `--mv-shadow-sm/md` - Soft, natural shadows

#### SearchBox

Advanced search input with proper icon positioning and natural styling.

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
/* Base search container - Fixed Layout */
.mv-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 200px;
}

.mv-search__container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--mv-color-surface);
  border: 2px solid var(--mv-color-border);
  border-radius: var(--mv-radius-md);
  transition: var(--mv-transition-fast);
}

.mv-search__container:focus-within {
  border-color: var(--mv-color-primary);
  box-shadow: 0 0 0 3px rgba(124, 152, 133, 0.15);
}

/* Properly positioned search icon */
.mv-search__icon {
  position: absolute;
  left: var(--mv-space-md);
  color: var(--mv-color-text-muted);
  pointer-events: none;
  z-index: 1;
  font-size: var(--mv-font-size-md);
}

/* Input with proper padding for icons */
.mv-search__input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: var(--mv-color-text-primary);
  font-family: inherit;
  padding-left: 2.75rem; /* Space for search icon */
  padding-right: 2.75rem; /* Space for clear button */
}

/* Action buttons positioned correctly */
.mv-search__clear,
.mv-search__collapse {
  position: absolute;
  right: var(--mv-space-md);
  background: none;
  border: none;
  color: var(--mv-color-text-muted);
  cursor: pointer;
  padding: var(--mv-space-xs);
  border-radius: var(--mv-radius-sm);
  transition: var(--mv-transition-fast);
}

.mv-search__clear:hover,
.mv-search__collapse:hover {
  background: var(--mv-color-surface-hover);
  color: var(--mv-color-text-primary);
}

/* Size variants with proper icon positioning */
.mv-search--sm .mv-search__container {
  height: 2.25rem;
}

.mv-search--sm .mv-search__input {
  padding-left: 2.25rem;
  padding-right: 2.25rem;
}

.mv-search--md .mv-search__container {
  height: 2.75rem;
}

.mv-search--lg .mv-search__container {
  height: 3.25rem;
}

.mv-search--lg .mv-search__input {
  padding-left: 3rem;
  padding-right: 3rem;
}

/* Style variants */
.mv-search--filled .mv-search__container {
  background: var(--mv-color-surface-elevated);
  border-color: transparent;
}

.mv-search--outlined .mv-search__container {
  border-width: 2px;
  border-color: var(--mv-color-border-dark);
}
```

**Custom Properties:**

- `--mv-color-primary` - Focus border color (sage green)
- `--mv-color-text-muted` - Icon and placeholder text
- `--mv-color-surface-elevated` - Filled variant background
- `--mv-radius-md` - Container border radius
- `--mv-transition-fast` - Focus animation (200ms)

### Data-Driven Components

#### Select

Advanced dropdown with natural styling and warm interactions.

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

#### TabGroup

Data-driven tab interface with Ghibli-inspired styling.

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

Beautiful list component with natural hover effects.

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

Data-driven toolbar with natural styling and proper spacing.

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

Accordion-style collapsible content with warm, natural animations.

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

Data-driven navigation trail with natural styling.

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

Multi-column dropdown with Ghibli-inspired styling.

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
  ]}
  columns={3}
  showFeatured={true}
  onItemClick={handleMenuClick}
/>;
```

#### Table

Comprehensive data table with natural colors and proper spacing.

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

Complete pagination with natural styling and proper button sizes.

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

## Multi-Palette Theming System

Elements features a comprehensive theming system with **5 distinct color
palettes**, each available in both light and dark variants, providing **10 total
theme combinations**:

### The Five Palettes

#### 🌿 Ghibli Palette

**Natural & Organic**

- **Light**: Sage greens (#7c9885), warm browns, cream surfaces
- **Dark**: Light sage (#a8c4a2), cozy dark browns, warm cream text
- **Best for**: Wellness apps, organic brands, nature-focused applications

#### 💙 Blue Palette

**Professional & Clean**

- **Light**: Classic blues (#3b82f6), crisp whites, sharp contrast
- **Dark**: Light blues (#60a5fa), professional dark surfaces, clean text
- **Best for**: Business applications, dashboards, corporate tools

#### 💜 Purple Palette

**Creative & Modern**

- **Light**: Vibrant purples (#8b5cf6), neutral grays, artistic feel
- **Dark**: Light purples (#a78bfa), sophisticated dark surfaces
- **Best for**: Creative tools, design applications, artistic platforms

#### 💚 Green Palette

**Fresh & Energetic**

- **Light**: Fresh greens (#10b981), clean whites, vibrant energy
- **Dark**: Bright greens (#34d399), balanced dark surfaces
- **Best for**: Finance apps, health platforms, growth-focused tools

#### 🧡 Orange Palette

**Warm & Inviting**

- **Light**: Energetic oranges (#f97316), warm surfaces, friendly feel
- **Dark**: Bright oranges (#fb923c), comfortable dark surfaces
- **Best for**: Social apps, entertainment, lifestyle applications

### Implementation

```tsx
// Simple palette switching
function App() {
  const [palette, setPalette] = useState<
    "ghibli" | "blue" | "purple" | "green" | "orange"
  >("ghibli");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Apply both palette and theme
    document.documentElement.setAttribute("data-palette", palette);
    document.documentElement.setAttribute("data-theme", theme);
  }, [palette, theme]);

  return (
    <div>
      {/* All components automatically use the selected palette and theme */}
      <Header variant="elevated">
        <Brand title="My App" />
        <Button variant="primary">Styled with current palette</Button>
      </Header>
    </div>
  );
}
```

### Palette Selection Guide

**Choose your palette based on your application's personality:**

- **🌿 Ghibli** for natural, calming, organic experiences
- **💙 Blue** for professional, trustworthy, business applications
- **💜 Purple** for creative, innovative, artistic platforms
- **💚 Green** for growth, health, financial success themes
- **🧡 Orange** for social, energetic, lifestyle experiences

Each palette maintains perfect contrast ratios and accessibility standards
across both light and dark themes.

## CSS Architecture & Theming

### Multi-Palette Design System

Elements features 5 complete color palettes, each with carefully crafted light
and dark variants. The system uses CSS custom properties with data attributes
for instant theme switching:

```css
/* Base system with 5 complete palettes */
:root {
  /* Natural Font Scale */
  --mv-font-size-xs: 0.75rem;
  --mv-font-size-sm: 0.875rem;
  --mv-font-size-md: 1rem;
  --mv-font-size-lg: 1.125rem;

  /* Natural Spacing System - Based on 8px grid */
  --mv-space-xs: 0.25rem; /* 4px */
  --mv-space-sm: 0.5rem; /* 8px */
  --mv-space-md: 0.75rem; /* 12px */
  --mv-space-lg: 1rem; /* 16px */
  --mv-space-xl: 1.5rem; /* 24px */
  --mv-space-2xl: 2rem; /* 32px */

  /* Organic Border Radius */
  --mv-radius-sm: 0.375rem; /* 6px */
  --mv-radius-md: 0.5rem; /* 8px */
  --mv-radius-lg: 0.75rem; /* 12px */
  --mv-radius-xl: 1rem; /* 16px */
}

/* GHIBLI PALETTE - Light & Dark */
[data-palette="ghibli"][data-theme="light"] {
  --mv-color-primary: #7c9885; /* Sage green */
  --mv-color-secondary: #8b7355; /* Warm taupe */
  --mv-color-success: #9cb86f; /* Fresh green */
  --mv-color-danger: #d4776a; /* Muted coral */
  --mv-color-warning: #e6b85c; /* Golden yellow */
  --mv-color-surface: #faf9f6; /* Warm white */
  --mv-color-background: #f8f6f1; /* Natural background */
  --mv-color-text-primary: #3a3530; /* Warm dark brown */
}

[data-palette="ghibli"][data-theme="dark"] {
  --mv-color-primary: #a8c4a2; /* Light sage */
  --mv-color-secondary: #a89888; /* Light taupe */
  --mv-color-success: #a8c4a2; /* Sage green */
  --mv-color-danger: #e08677; /* Soft coral */
  --mv-color-warning: #f2c76b; /* Warm yellow */
  --mv-color-surface: #2d2a26; /* Warm dark brown */
  --mv-color-background: #252220; /* Deep brown */
  --mv-color-text-primary: #f0ede8; /* Warm cream */
}

/* BLUE PALETTE - Professional & Clean */
[data-palette="blue"][data-theme="light"] {
  --mv-color-primary: #3b82f6; /* Classic blue */
  --mv-color-secondary: #64748b; /* Professional gray */
  --mv-color-success: #10b981; /* Fresh green */
  --mv-color-surface: #ffffff; /* Pure white */
  --mv-color-background: #f8fafc; /* Light gray */
  --mv-color-text-primary: #0f172a; /* Deep blue-black */
}

[data-palette="blue"][data-theme="dark"] {
  --mv-color-primary: #60a5fa; /* Light blue */
  --mv-color-secondary: #94a3b8; /* Light gray */
  --mv-color-success: #34d399; /* Bright green */
  --mv-color-surface: #1e293b; /* Dark blue-gray */
  --mv-color-background: #0f172a; /* Deep blue */
  --mv-color-text-primary: #f8fafc; /* Pure white */
}

/* PURPLE PALETTE - Creative & Modern */
[data-palette="purple"][data-theme="light"] {
  --mv-color-primary: #8b5cf6; /* Vibrant purple */
  --mv-color-secondary: #6b7280; /* Neutral gray */
  --mv-color-surface: #fefefe; /* Off-white */
  --mv-color-background: #faf5ff; /* Light purple tint */
  --mv-color-text-primary: #111827; /* Dark gray */
}

[data-palette="purple"][data-theme="dark"] {
  --mv-color-primary: #a78bfa; /* Light purple */
  --mv-color-secondary: #9ca3af; /* Medium gray */
  --mv-color-surface: #374151; /* Dark gray */
  --mv-color-background: #1f2937; /* Deep gray */
  --mv-color-text-primary: #f9fafb; /* Light gray */
}

/* Additional palettes: GREEN and ORANGE follow similar patterns */
```

### Easy Multi-Palette Theming

Transform your entire application instantly by changing data attributes:

```tsx
// Switch between 5 palettes and 2 themes (10 total combinations)
function ThemeSwitcher() {
  const [palette, setPalette] = useState<
    "ghibli" | "blue" | "purple" | "green" | "orange"
  >("ghibli");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    document.documentElement.setAttribute("data-theme", theme);
  }, [palette, theme]);

  return (
    <div>
      <select value={palette} onChange={(e) => setPalette(e.target.value)}>
        <option value="ghibli">🌿 Ghibli - Natural sage green</option>
        <option value="blue">💙 Blue - Professional classic</option>
        <option value="purple">💜 Purple - Creative modern</option>
        <option value="green">💚 Green - Fresh vibrant</option>
        <option value="orange">🧡 Orange - Energetic warm</option>
      </select>

      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">🌅 Light Mode</option>
        <option value="dark">🌙 Dark Mode</option>
      </select>
    </div>
  );
}
```

### Palette Characteristics

**🌿 Ghibli Palette**

- Light: Sage greens, warm browns, cream surfaces
- Dark: Light sage, warm dark surfaces, cream text
- Perfect for: Natural, organic applications

**💙 Blue Palette**

- Light: Professional blues, clean whites, sharp contrast
- Dark: Light blues, blue-gray surfaces, crisp text
- Perfect for: Business applications, dashboards

**💜 Purple Palette**

- Light: Vibrant purples, neutral grays, creative feel
- Dark: Light purples, modern dark surfaces
- Perfect for: Creative tools, design applications

**💚 Green Palette**

- Light: Fresh greens, clean surfaces, vibrant energy
- Dark: Bright greens, professional dark surfaces
- Perfect for: Health, finance, growth-focused apps

**🧡 Orange Palette**

- Light: Energetic oranges, warm surfaces, inviting feel
- Dark: Bright oranges, balanced dark surfaces
- Perfect for: Social, entertainment, lifestyle apps

## Real-World Examples

### E-commerce Dashboard

```tsx
function EcommerceDashboard() {
  // Set palette based on brand - Orange for energetic retail
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", "orange");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

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
  // Professional blue palette for documentation
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", "blue");
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

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
- Hardware-accelerated animations with natural easing
- Optimized re-renders with React best practices
- Consumer-controlled optimization with React.memo()

**Accessibility Features:**

- Full keyboard navigation support
- ARIA attributes for screen readers
- Focus management with visible indicators
- Semantic HTML structure
- WCAG AA compliant color combinations
- Natural color contrast ratios

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
- **CSS Features**: Custom Properties, Advanced Selectors, Transforms, Backdrop
  Filter
- **Runtime**: Node.js 22+ with type-stripping support

## Framework Integration

### Standalone Usage

```tsx
import { ActionBar, Header, Table } from "@m5nv/ui-elements";

// Complete UI library with beautiful Ghibli aesthetic
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
- ✅ Get 5 beautiful palettes with 10 theme combinations instantly
- ✅ Comprehensive multi-palette theming system included
- ✅ Professional color palettes for any brand or use case

**From Other UI Libraries:**

- ✅ Data-driven approach reduces markup complexity
- ✅ Modern CSS architecture with instant palette switching
- ✅ 5 distinct visual personalities (natural, professional, creative, fresh,
  energetic)
- ✅ Type-stripping compatibility for Node.js
- ✅ Multi-palette system that scales with your application needs

## Contributing

New elements should:

1. **Be data-driven** - accept data structures, not require complex markup
2. **Support all palettes** - work beautifully with all 5 color palettes and
   both themes
3. **Include accessibility** - keyboard navigation and ARIA support
4. **Be framework-agnostic** - work in any React application
5. **Have comprehensive TypeScript** - full interface coverage
6. **Follow the design system** - use CSS custom properties for consistent
   theming

The library focuses on **opinionated, complete solutions** with a flexible
multi-palette system that adapts to any brand or visual style, providing maximum
developer productivity with beautiful, professional results across all 10 theme
combinations.
