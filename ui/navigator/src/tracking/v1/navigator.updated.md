# Navigator Component Documentation - Updated Sections

## SSR Compatibility

The Navigator component is fully compatible with Server-Side Rendering (SSR)
frameworks such as Next.js, Remix, and others. It uses several techniques to
ensure proper rendering in both server and client environments:

### SSR-Safe Design

- **No Direct Window Access**: The component never directly accesses `window`
  during rendering
- **Deferred Client-Side Behavior**: Browser-specific behaviors are isolated in
  useEffect hooks
- **Default State Values**: Components use sensible defaults for server
  rendering
- **Media Queries**: Responsive behavior uses SSR-safe media query hooks

### SSR Integration Examples

#### Next.js App Router Integration

```tsx
"use client";

import { Navigator } from "@m5nv/ui/navigator";
import { createRouterAdapter } from "@m5nv/ui/navigator";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Create a matchPath function for Next.js
const matchPath = (pattern, pathname) => {
  // Simple path matching for Next.js
  if (typeof pattern === "string") {
    if (pattern === pathname) return { pathname, params: {} };
    if (pattern === "/" && pathname === "/") return { pathname, params: {} };
    if (pattern !== "/" && pathname.startsWith(pattern + "/")) {
      return { pathname, params: {} };
    }
  }
  return null;
};

// Create router adapter
const useNextRouterAdapter = () => {
  const pathname = usePathname();

  return {
    Link,
    useLocation: () => ({ pathname }),
    matchPath,
  };
};

export default function Layout({ children }) {
  const router = useNextRouterAdapter();

  return (
    <>
      <Navigator
        navigationTree={navigationTree}
        router={router}
        // ... other props
      />
      {children}
    </>
  );
}
```

#### Remix Integration

```tsx
import { createRouterAdapter, Navigator } from "@m5nv/ui/navigator";
import { Link, useLocation, useMatches } from "@remix-run/react";

// Custom matchPath function for Remix
const matchPath = (pattern, pathname) => {
  // Simple implementation - you may want to enhance this
  if (typeof pattern === "string") {
    if (pattern === pathname) return { pathname, params: {} };
    if (pattern === "/" && pathname === "/") return { pathname, params: {} };
    if (pattern !== "/" && pathname.startsWith(pattern + "/")) {
      return { pathname, params: {} };
    }
  }
  return null;
};

// Create router adapter
const remixRouterAdapter = {
  Link,
  useLocation: () => {
    const location = useLocation();
    return { pathname: location.pathname };
  },
  matchPath,
};

export default function AppLayout() {
  return (
    <>
      <Navigator
        navigationTree={navigationTree}
        router={remixRouterAdapter}
        // ... other props
      />
      <Outlet />
    </>
  );
}
```

## Enhanced Context System

The Navigator uses a comprehensive context system to share state between
components. This allows for efficient communication without prop drilling or
global state.

### Context Provider

The Navigator component uses a dedicated `NavigatorProvider` component
internally to manage shared state:

```tsx
// This happens internally - you don't need to use NavigatorProvider directly
<NavigatorProvider
  navigationTree={navigationTree}
  section={section}
  availableSections={availableSections}
  onSectionChange={handleSectionChange}
  router={router}
  darkMode={darkMode}
  displayMode={displayMode}
  renderIcon={renderIcon}
  formatSectionName={formatSectionName}
>
  {/* Navigator components */}
</NavigatorProvider>;
```

### Using the Navigator Context

You can access the Navigator context with the `useNavigator` hook in any child
component:

```tsx
import { useNavigator } from "@m5nv/ui/navigator";

function CustomNavigation() {
  const {
    section,
    navigationTree,
    darkMode,
    router,
    // Mobile menu state and control
    isMobileMenuOpen,
    toggleMobileMenu,
  } = useNavigator();

  return (
    <div>
      <button onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? "Close Menu" : "Open Menu"}
      </button>
      <p>Current section: {section}</p>
    </div>
  );
}
```

### Available Context Values

The Navigator context provides the following values:

| Property            | Type                                | Description                  |
| ------------------- | ----------------------------------- | ---------------------------- |
| `navigationTree`    | `Record<string, NavTreeNode[]>`     | Full navigation structure    |
| `section`           | `string`                            | Current active section       |
| `availableSections` | `string[]`                          | All available sections       |
| `onSectionChange`   | `(section: string) => void`         | Section change handler       |
| `router`            | `RouterAdapter`                     | Router integration object    |
| `darkMode`          | `boolean`                           | Dark mode state              |
| `displayMode`       | `DisplayMode`                       | Current display mode         |
| `renderIcon`        | `(name: string) => React.ReactNode` | Icon renderer function       |
| `formatSectionName` | `(section: string) => string`       | Format section name function |
| `isMobileMenuOpen`  | `boolean`                           | Mobile menu open state       |
| `toggleMobileMenu`  | `() => void`                        | Toggle mobile menu function  |

## Responsive Design

The Navigator component uses modern responsive design techniques to adapt to
different screen sizes.

### Responsive Media Queries

The Navigator uses a dedicated `useMediaQuery` hook internally for responsive
behavior:

```tsx
// This happens internally
const isMobile = useMediaQuery("(max-width: 767px)");
const isDesktop = useMediaQuery("(min-width: 1024px)");
```

### Display Modes

The Navigator supports three display modes:

1. `"tabs"` - Always use tabs navigation
2. `"breadcrumbs"` - Always use breadcrumbs navigation
3. `"adaptive"` (default) - Use tabs on desktop, breadcrumbs on mobile

```tsx
<Navigator displayMode="adaptive" // "tabs" | "breadcrumbs" | "adaptive"
  // ... other props
/>;
```

### Custom Responsive Behavior

You can implement custom responsive behavior using the context:

```tsx
import { useNavigator } from "@m5nv/ui/navigator";
import { useMediaQuery } from "@m5nv/ui/hooks";

function CustomResponsiveComponent() {
  const { darkMode } = useNavigator();

  // Your own media query
  const isLargeScreen = useMediaQuery("(min-width: 1280px)");

  return (
    <div
      className={`custom-component ${isLargeScreen ? "large" : "small"} ${
        darkMode ? "dark" : "light"
      }`}
    >
      {isLargeScreen ? <DesktopView /> : <MobileView />}
    </div>
  );
}
```

## Mobile Menu Behavior

The Navigator includes a built-in mobile menu system that is automatically
managed through React Context.

### Accessing Mobile Menu State

You can access and control the mobile menu from any component:

```tsx
import { useNavigator } from "@m5nv/ui/navigator";

function CustomMobileToggle() {
  const { isMobileMenuOpen, toggleMobileMenu } = useNavigator();

  return (
    <button
      onClick={toggleMobileMenu}
      aria-expanded={isMobileMenuOpen}
    >
      {isMobileMenuOpen ? "Close Menu" : "Open Menu"}
    </button>
  );
}
```

### Custom Mobile Menu

You can replace the built-in mobile menu with your own implementation:

```tsx
import { useNavigator } from "@m5nv/ui/navigator";

function CustomMobileMenu() {
  const {
    isMobileMenuOpen,
    toggleMobileMenu,
    navigationTree,
    section,
    router,
  } = useNavigator();

  if (!isMobileMenuOpen) return null;

  // Get navigation items for current section
  const navigationItems = navigationTree[section] || [];

  return (
    <div className="custom-mobile-menu">
      <div className="custom-mobile-overlay" onClick={toggleMobileMenu} />
      <div className="custom-mobile-panel">
        <button onClick={toggleMobileMenu}>Close</button>
        <nav>
          {/* Your custom navigation rendering */}
        </nav>
      </div>
    </div>
  );
}
```

## Component Architecture

The Navigator follows a modular architecture with clear separation of concerns:

### Component Hierarchy

```
Navigator
├── NavigatorProvider (Context)
│   ├── NavigationHeader
│   │   ├── NavigatorSearch (optional)
│   │   ├── NavigatorAppSwitcher (optional)
│   │   └── NavigatorActions (optional)
│   └── NavigationTiers
│       ├── NavigationRow (for tabs mode)
│       │   └── NavItems
│       ├── NavigationBreadcrumb (for breadcrumbs mode)
│       └── MobileMenu (controlled by context)
```

### Primary Components

1. **Navigator**: Entry point component that sets up context and renders main
   structure
2. **NavigatorProvider**: Manages shared state and context
3. **NavigationHeader**: Renders app header with title, search, and actions
4. **NavigationTiers**: Manages navigation levels and mobile menu

### Customizable Elements

1. **NavigatorSearch**: Search button/component
2. **NavigatorAppSwitcher**: Section switcher dropdown
3. **NavigatorActions**: Action buttons/menu
4. **MobileMenu**: Mobile navigation drawer

## React 19 Compatibility

The Navigator component leverages modern React 19 features for improved
performance and maintainability.

### React 19 Features Used

- **Cache API**: Used for efficient caching of media query calculations
- **Hook Patterns**: Uses the latest best practices for hooks
- **SSR Optimizations**: Takes advantage of React 19's improved SSR capabilities

### Version Requirements

- React 18+
- React DOM 18+
- TypeScript 4.7+
- Tailwind CSS 3+

For optimal performance and features, we recommend using:

- React 19+
- TypeScript 5+
- Tailwind CSS 3.3+

## TypeScript Types

The Navigator component provides comprehensive TypeScript definitions:

### Core Types

```tsx
// Navigation structure
export interface NavTreeNode {
  id: string;
  path: string;
  label: string;
  iconName?: string;
  end?: boolean;
  children?: NavTreeNode[];
}

// Router integration
export interface RouterAdapter {
  Link: React.ComponentType<any>;
  matchPath: (pattern: any, pathname: string) => any | null;
  useLocation: () => { pathname: string };
  navigate?: (to: string) => void;
}

// Display mode
export type DisplayMode = "tabs" | "breadcrumbs" | "adaptive";
```

### Context Types

```tsx
// Context Type
export interface NavigatorContextType {
  // Navigation data
  navigationTree: Record<string, NavTreeNode[]>;
  section: string;
  availableSections: string[];
  onSectionChange: (section: string) => void;

  // Routing
  router: RouterAdapter;

  // Theme and display
  darkMode: boolean;
  displayMode: DisplayMode;

  // Utilities
  renderIcon: (iconName: string) => React.ReactNode;
  formatSectionName: (section: string) => string;

  // Mobile menu state
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

// Provider Props
export interface NavigatorContextProviderProps {
  children: React.ReactNode;
  navigationTree: Record<string, NavTreeNode[]>;
  section: string;
  availableSections: string[];
  onSectionChange: (section: string) => void;
  router: RouterAdapter;
  darkMode: boolean;
  displayMode: DisplayMode;
  renderIcon: (iconName: string) => React.ReactNode;
  formatSectionName: (section: string) => string;
}
```

### Component Props

```tsx
// Main Navigator Props
export interface NavigatorProps {
  // Required props
  navigationTree: Record<string, NavTreeNode[]>;
  router: RouterAdapter;

  // Section management
  section?: string;
  onSectionChange?: (section: string) => void;

  // Display configuration
  darkMode?: boolean;
  displayMode?: DisplayMode;

  // Header elements
  logo?: React.ReactNode;
  appTitle?: string;
  search?: boolean | React.ReactNode;
  onSearch?: () => void;
  appSwitcher?: boolean | React.ReactNode;
  actions?: UserAction[] | ActionGroup | React.ReactNode;

  // Customization
  headerProps?: Omit<
    HeaderProps,
    | "logo"
    | "appTitle"
    | "search"
    | "onSearch"
    | "appSwitcher"
    | "actions"
    | "darkMode"
  >;
  navigationLevelDefaults?: NavigationLevelDefaults;

  // Icons
  renderIcon?: (name: string) => React.ReactNode;

  // Theme
  theme?: string;
}
```

For a complete list of types, refer to the `types.ts` file or use your IDE's
TypeScript features to explore available types.
