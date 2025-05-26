# Navigator Template Developer Guide

A `Navigator Template` in the Navigator system implements the **View** in an
MVC-style architecture. Its sole responsibility is rendering navigation
UI—**never application content**.

It is a layout scaffold that renders the visual and interactive structure of
navigation across your application: headers, side drawers, tabs, and menus.

## 1. The contract of the `navigation view`

### ⚖️ Key Principles

- **Navigation Data vs UI Customization**: A navigation template should get
  navigation data from the `useNavigator()` hook, not from consumer-provided
  props. UI elements used in a layout can be customized through props, but the
  data the elements receive is fixed (by the template).

- **Templates Should:**
  - ✅ Render navigation UI elements
  - ✅ Handle responsiveness
  - ✅ Use navigation state and utilities via `useNavigator()`
  - ✅ Allow UI component customization

- **Templates Should Not:**
  - ❌ Render page or application content
  - ❌ Transform navigation state or data
  - ❌ Expect navigation data to be provided via props

### 🎯 The Separation of Concerns

Navigation data flows through a unidirectional pipeline:

1. `navigationTree` (Model) provides the raw data
2. `Navigator` (Controller) processes and enriches this data
3. Templates (View) access this processed data through the `useNavigator()` hook

This maintains a clean separation where templates never need direct access to
the model, only to the processed state provided by the controller.

## 2. Template Props: UI Tree Concept

A navigator template receives just one prop: `components`. This is to be seen as
a mechanism to document the layout and customizable `slots` for the consumer of
the layout. Think of it as a `tree-of-elements`, where in each `element` has a
role and purpose in the overall navigation structure.

The default interface for this `tree-of-elements` is defined as below:

```tsx
export type ComponentOverride = React.ReactNode;

export interface ComponentTree {
  [key: string]: ComponentOverride | ComponentTree;
}

export interface TemplateProps<TComponents = ComponentTree> {
  /**
   * Component overrides - a tree structure of UI elements
   * that can replace standard components at various levels.
   *
   * Each template defines its own structure for this tree,
   * creating a contract between the template and its consumers.
   */
  components?: TComponents;
}
```

### 📐 Type-Safe Component Structures

Templates should advertise their component structure using TypeScript interfaces
with proper typing for better developer experience:

```ts
import { type ElementType } from "react";

// Define the specific component structure for this template
export interface DashboardUiTree {
  header?: {
    element?: ElementType; // ElementType for component slots
    brand?: ElementType; // ElementType for component slots
    search?: ElementType;
    actions?: ElementType;
  };
  drawer?: ElementType;
}

// Use the typed props in your template
export function Dashboard({ components }: TemplateProps<DashboardUiTree>) {
  // Implementation with full type checking and autocomplete
  const HeaderComponent = components?.header?.element || Header;
  const BrandComponent = components?.header?.brand || Brand;
  // ...
}
```

This approach:

- gives template designers full freedom to define their own ui tree for layout
- provides IDE autocompletion, type checking and defines the contract for
  template consumers
- documents the customizable UI `slots` available in the template

## 3. Accessing Navigation Data

### 📊 Using Navigator Utilities

Templates should always use utilities from `useNavigator()` to access navigation
data:

```tsx
function MyTemplate({ components }) {
  const {
    navigationTree,
    activeSection,
    getItemsByTags,
    getRelatedItems,
    isItemActive,
  } = useNavigator();

  // ✅ DO: Get navigation items using utilities
  const mainNavItems = getItemsByTags("main-nav");

  // ✅ DO: Fall back to section items if needed
  const sectionItems = navigationTree[activeSection] || [];

  // ❌ DON'T: Expect navigation items from props
  // const navItems = components.navigation.items; // Wrong approach

  return (
    <div className="my-template">
      {/* Render navigation UI using data from useNavigator() */}
    </div>
  );
}
```

### 🔄 Available Navigation Utilities

The `useNavigator()` hook provides these utilities for accessing and
manipulating navigation data:

- `navigationTree`: The complete navigation tree organized by sections
- `activeSection`: Current active section identifier
- `activeItem`: Currently active navigation item
- `getItemsByTags(tag)`: Returns navigation items with specific tags
- `getRelatedItems(parentItem)`: Returns items related to a parent item
- `getBreadcrumbs()`: Returns the breadcrumb trail for current active item
- `isItemActive(item)`: Checks if an item is active
- `isItemParentOfActive(item)`: Checks if an item is parent of the active item
- `getItemUrl(item)`: Gets the URL for a navigation item

## 4. Customization via Components Prop

### 🎨 UI Customization Pattern

Templates can be customized through the `components` prop, which allows for UI
component overrides:

```tsx
function MyTemplate({ components }) {
  const { appTitle, logo, navigationTree, activeSection } = useNavigator();

  // Get navigation items
  const navItems = navigationTree[activeSection] || [];

  // Get the component to use (custom or default)
  const DrawerComponent = components?.drawer || Drawer;

  return (
    <div className="my-template">
      <Header title={appTitle} logo={logo} />

      {/* Provide navigation content to the drawer component */}
      <DrawerComponent mode="persistent" className="my-template-drawer">
        {navItems.map((item) => <Item key={item.id} item={item} />)}
      </DrawerComponent>
    </div>
  );
}
```

### 📐 Component Interface Contracts

Custom components **must** adhere to the same interface contract as the standard
components they replace:

```tsx
// Consumer's custom drawer component
function MyCustomDrawer({ mode, className, children }) {
  // Must accept the same props as the standard Drawer component
  return (
    <div className={`my-custom-drawer ${className || ""}`}>
      {/* The template provides navigation content as children */}
      {children}
    </div>
  );
}
```

The template is responsible for:

- Generating navigation content using `useNavigator()`
- Providing this content to the UI element
- Passing appropriate props according to the UI element's interface

### 🧠 Granular vs Coarse Customization

You may define a flat or nested structure for component overrides:

```ts
// Coarse
components: {
  header: <CustomHeader />,
  navigation: <CustomNavigation />
}

// Granular
components: {
  header: {
    brand: <CustomBrand />,
    search: <CustomSearch />,
    actions: <CustomActions />
  },
  drawer: <CustomDrawer />,
  tabs: <CustomTabs />
}
```

> **Best Practice**: Favor granular structures to give consumers maximum
> flexibility.

### 🎯 Ideal Template Design

In an ideal implementation:

- Template handles data access and state management
- UI elements of the template receive specific data and behavior props
- UI elements rely on props rather than directly accessing `useNavigator()`

While our current implementation may not fully realize this ideal in all cases,
this is the architectural direction we're moving toward.

## 5. UI Design Principles

### 🧩 Standard UI Design

The `view` of `MVC` in the Navigator system follow a clear hierarchy of
responsibilities:

1. **Templates**
   - Access navigation model through `useNavigator()` utilities
   - Generate navigation items for child components
   - Pass specific navigation items to components that need them
   - Coordinate state and behavior between components

2. **Container Components** (e.g., `Drawer`, `Tabs`)
   - Receive navigation items as props
   - Don't access `navigationTree` directly
   - Focus on UI behavior and layout
   - Pass appropriate props to child components

3. **Leaf Components** (e.g., `Item`, `Brand`)
   - Receive specific items or data through props
   - May use `useNavigator()` for utilities like `isItemActive` or `renderIcon`
   - Focus on rendering specific UI elements

### 🚫 Direct Model Access

UI elements should avoid directly accessing the navigation model:

```tsx
// ❌ BAD: Component directly accessing navigationTree
function BadDrawer() {
  const { navigationTree, activeSection } = useNavigator();
  const navItems = navigationTree[activeSection] || [];

  return (
    <div className="drawer">
      {navItems.map((item) => <Item key={item.id} item={item} />)}
    </div>
  );
}

// ✅ GOOD: Component receives items as props
function GoodDrawer({ items }) {
  return (
    <div className="drawer">
      {items.map((item) => <Item key={item.id} item={item} />)}
    </div>
  );
}
```

### 🛠 Utilities vs Direct Access

Components can use utility functions from `useNavigator()` but should avoid
direct model access:

```tsx
// ✅ GOOD: Using utility functions
function GoodComponent({ item }) {
  const { isItemActive, getItemUrl, renderIcon } = useNavigator();

  return (
    <a
      href={getItemUrl(item)}
      className={isItemActive(item) ? "active" : ""}
    >
      {renderIcon(item.iconName)}
      {item.label}
    </a>
  );
}
```

By following these principles, we create a clean separation of concerns where:

- Templates handle data access and transformation
- UI components focus on UI rendering and behavior
- The navigation model is accessed through controlled, reusable utilities

## 6. Creating a Custom Template

When creating a custom template, follow these principles:

```tsx
import { useNavigator } from "@m5nv/navigator";
import { Brand, Drawer, Header, Item } from "@m5nv/navigator/components";

export function CustomTemplate({ components }) {
  const {
    navigationTree,
    activeSection,
    isDrawerOpen,
    isMobile,
    appTitle,
    logo,
  } = useNavigator();

  // Get navigation items
  const navItems = navigationTree[activeSection] || [];

  // Get UI components (custom or default)
  const HeaderComponent = components?.header || Header;
  const BrandComponent = components?.brand || Brand;
  const DrawerComponent = components?.drawer || Drawer;

  return (
    <div className="mv-custom-container">
      <HeaderComponent>
        <BrandComponent title={appTitle} logo={logo} />
        {/* Other header content */}
      </HeaderComponent>

      <div className="mv-custom-layout">
        <DrawerComponent mode="persistent">
          {/* Navigation content generated by the template */}
          {navItems.map((item) => <Item key={item.id} item={item} />)}
        </DrawerComponent>
      </div>
    </div>
  );
}
```

Note how the template:

1. Retrieves navigation data using `useNavigator()`
2. Allows component customization through the `components` prop
3. Ensures custom components receive the same props as standard components
4. Provides navigation content to components
5. Maintains control over data access and state management

## 7. Built-in Templates

Our built-in templates follow the principles outlined above:

### 📊 Dashboard Template

Admin-style layout with a persistent sidebar.

```ts
components: {
  header: {
    brand: ElementType,
    search: ElementType,
    actions: ElementType,
    element: ElementType
  },
  drawer: ElementType 
}
```

Usage example:

```tsx
<Navigator
  template={(props) => (
    <Dashboard
      components={{
        header: {
          brand: <CustomBrand />,
          search: <CustomSearch />,
        },
        drawer: <CustomDrawer />,
      }}
    />
  )}
  {...navigatorProps}
/>;
```

### 📚 Docs Template

Sidebar-oriented layout for documentation.

```ts
components: {
  header: {
    brand: ElementType,
    controls: ElementType,
    actions: ElementType,
    element: ElementType
  },
  drawer: ElementType
```

Usage example:

```tsx
<Navigator
  template={(props) => (
    <Docs
      components={{
        header: {
          controls: <CustomVersionAndSearch />,
        },
        drawer: <CustomDocSidebar />,
      }}
    />
  )}
  {...navigatorProps}
/>;
```

### 🛍 Ecommerce Template

Store layout with mega menu navigation.

```ts
components: {
  header: {
    brand: ReactNode,
    search: ReactNode,
    actions: ReactNode,
    element: ReactNode
  },
  navigation: ReactNode,  // MegaMenu component override
  drawer: ReactNode       // Mobile drawer component override
}
```

Usage example:

```tsx
<Navigator
  template={(props) => (
    <Ecommerce
      components={{
        header: {
          actions: <CartWithCount count={3} />,
        },
        navigation: <CustomMegaMenu />,
      }}
    />
  )}
  {...navigatorProps}
/>;
```

### 📰 News Template

Tabbed interface for news sections.

```ts
components: {
  header: {
    brand: ElementType,
    search: ElementType,
    actions: ElementType,
    element: ElementType
  },
  tabs: {
    primary: ElementType,
    secondary: ElementType,
  },
  navigation: ElementType, 
  drawer: ElementType
}
```

Usage example:

```tsx
<Navigator
  template={(props) => (
    <News
      components={{
        header: {
          search: <EnhancedSearch />,
        },
        tabs: {
          secondary: <CustomCategoryTabs />,
        },
      }}
    />
  )}
  {...navigatorProps}
/>;
```

## 8. Standard Components

Templates are built with standard components from the Navigator UI system:

- **`<Header>`** – top navigation bar that typically contains:
  - Brand (logo + title)
  - Search box
  - Action buttons

- **`<Brand>`** – logo + title component
  - Accepts `title`, `logo`, and `url` props
  - Used to display application identity

- **`<Drawer>`** – sidebar container
  - Supports `persistent` or `temporary` modes
  - Contains navigation items or groups
  - Handles responsive behavior

- **`<Tabs>`** – horizontal tab bars
  - Renders items from a section as tabs
  - Supports `primary` and `secondary` variants
  - Handles overflow behavior

- **`<Item>`** – navigation link
  - Renders a single navigation item
  - Handles active state
  - Supports icons and labels

- **`<Group>`** – collapsible menu group
  - Contains child navigation items
  - Supports nested navigation structure
  - Handles expand/collapse behavior

- **`<Search>`** – search bar
  - Provides search input functionality
  - Supports `expandable` mode for mobile
  - Handles input events

- **`<Actions>`** – button group
  - Container for action buttons
  - Supports positioning
  - Can contain custom buttons

- **`<Breadcrumbs>`** – path trail
  - Shows navigation hierarchy
  - Renders links to parent items
  - Supports truncation for long paths

- **`<MegaMenu>`** – dropdown menu
  - Displays nested categories
  - Supports featured items
  - Used for complex hierarchical navigation

Each supports composition and customization through props.

## ✅ Summary

A `Navigation Template`:

- should **never** expect navigation data from props
- should derive navigation content from `useNavigator()` utilties, ideally
- should focus **only** on rendering navigational UI
- should document its `ui-component-tree` that allow consumers to customize
- should favor granular `ui-component-tree` for flexibile customization
- should expect `custom` component to adhere to the interface contract
