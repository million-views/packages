# Navigator Component Documentation

## Overview

`Navigator` is a React component that provides an opinionated navigation
solution for React applications that need to render site/app wide navigational
UI. It provides a complete navigation system including an application header,
multi-level navigation, and responsive adaptations.

The component follows these core design principles:

1. **Opinionated Defaults**: Provides a complete, production-ready navigation
   system with minimal configuration
2. **Targeted Flexibility**: Offers customization options in specific areas
   where flexibility is valuable
3. **Fail-Fast Validation**: Implements upfront validation with clear error
   messages
4. **Robust Context Sharing**: Ensures reliable state sharing between components
5. **Strategic Composability**: Allows replacement of specific sub-components
   while maintaining overall structure

## Installation

```bash
npm install @m5nv/ui/navigator
```

## Import Examples

```tsx
// Import core components and hooks
import { Navigator, useNavigator } from "@m5nv/ui/navigator";

// Import individual customizable components
import {
  NavigatorActions,
  NavigatorAppSwitcher,
  NavigatorSearch,
} from "@m5nv/ui/navigator";

// Import utility functions
import { createRouterAdapter, formatSectionName } from "@m5nv/ui/navigator";

// Import type definitions
import type { ActionGroup, NavTreeNode, UserAction } from "@m5nv/ui/navigator";

// Import conditional rendering helpers
import { Choose, Otherwise, When } from "@m5nv/ui/navigator";
```

## Requirements

- React 18+
- Tailwind CSS v4+

## Setup

### 1. Import the CSS

First, import the Navigator CSS into your main Tailwind CSS file:

```css
/* In your main.css or global.css */
@import "@m5nv/ui/navigator/dist/navigator.css";
```

### 2. Basic Usage

```tsx
import { Navigator } from "@m5nv/ui/navigator";
import { Link, matchPath, useLocation } from "react-router-dom";

const App = () => {
  // Create router adapter from react-router functions
  const routerAdapter = {
    Link,
    useLocation,
    matchPath,
  };

  // Navigation tree structure
  const navigationTree = {
    "main": [
      {
        id: "home",
        path: "/",
        label: "Home",
        iconName: "Home",
      },
      {
        id: "dashboard",
        path: "/dashboard",
        label: "Dashboard",
        iconName: "Dashboard",
        children: [
          {
            id: "analytics",
            path: "/dashboard/analytics",
            label: "Analytics",
            iconName: "Chart",
          },
          // More items...
        ],
      },
      // More items...
    ],
  };

  // Custom icon renderer
  const renderIcon = (name) => <YourIconComponent name={name} />;

  return (
    <Navigator
      navigationTree={navigationTree}
      router={routerAdapter}
      renderIcon={renderIcon}
      appTitle="My Application"
    />
  );
};
```

## Theming Support

Navigator comes with a built-in theming system that leverages CSS custom
properties and Tailwind's layer system. You can choose from the included themes
or create your own.

### Using Included Themes

```tsx
<Navigator
  // ...other props
  theme="corporate" // Options: corporate, night, pastel
  darkMode={true} // Toggle dark mode
/>;
```

### Creating Custom Themes

Add your custom theme to your CSS file:

```css
/* In your main.css or a separate themes.css */
@layer utilities {
  .nav-theme-custom {
    --nav-primary: #6366f1;
    --nav-primary-hover: #4f46e5;
    --nav-secondary: #ec4899;
    --nav-secondary-hover: #db2777;
    --nav-accent: #06b6d4;
    --nav-accent-hover: #0891b2;

    --nav-light-bg: #ffffff;
    --nav-light-bg-offset: #f9fafb;
    --nav-light-border: #e5e7eb;
    --nav-light-text: #1f2937;
    --nav-light-text-muted: #6b7280;

    --nav-dark-bg: #0f172a;
    --nav-dark-bg-offset: #1e293b;
    --nav-dark-border: #334155;
    --nav-dark-text: #f8fafc;
    --nav-dark-text-muted: #94a3b8;
  }
}
```

Then use it in your component:

```tsx
<Navigator // ...other props
 theme="custom" />;
```

## Component Structure

The Navigator is composed of several key components:

1. **Navigator**: The main component that provides context and composition
2. **NavigationHeader**: The application header with logo, title, search, and
   actions
3. **NavigationTiers**: Manages the navigation tiers (primary, secondary,
   tertiary) and mobile navigation

## Required Props

| Prop             | Type                            | Description                                     |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| `navigationTree` | `Record<string, NavTreeNode[]>` | The complete navigation structure               |
| `router`         | `RouterAdapter`                 | Router integration object with required methods |

## Optional Props

### Section Management

| Prop              | Type                        | Default  | Description                            |
| ----------------- | --------------------------- | -------- | -------------------------------------- |
| `section`         | `string`                    | `"main"` | The active section from navigationTree |
| `onSectionChange` | `(section: string) => void` | No-op    | Handler for section changes            |

### Display Configuration

| Prop          | Type                                    | Default      | Description                                                |
| ------------- | --------------------------------------- | ------------ | ---------------------------------------------------------- |
| `darkMode`    | `boolean`                               | `false`      | Toggle for dark mode styles                                |
| `displayMode` | `"tabs" \| "breadcrumbs" \| "adaptive"` | `"adaptive"` | Controls navigation display mode                           |
| `theme`       | `string`                                | `""`         | Theme name to apply (e.g., "corporate", "night", "pastel") |

### Actions Configuration

The Navigator supports two ways to configure the user actions in the header:

1. **Simple Array**: Provide an array of action items
2. **Action Group**: Provide a group object with label, icon, and items

#### Simple Array (Basic)

```tsx
const userActions = [
  {
    id: "profile",
    label: "Profile",
    iconName: "User",
    onClick: () => console.log("Profile clicked"),
  },
  {
    id: "settings",
    label: "Settings",
    iconName: "Settings",
    onClick: () => console.log("Settings clicked"),
  },
];

<Navigator
  // ...other props
  actions={userActions}
/>;
```

With this approach, the dropdown button will use default values ("Account" label
and "User" icon).

#### Action Group (Enhanced)

```tsx
const userActionGroup = {
  label: "My Account", // Custom dropdown label
  iconName: "UserCircle", // Custom dropdown icon
  items: [
    {
      id: "profile",
      label: "Profile",
      iconName: "User",
      onClick: () => console.log("Profile clicked"),
    },
    {
      id: "settings",
      label: "Settings",
      iconName: "Settings",
      onClick: () => console.log("Settings clicked"),
    },
  ],
};

<Navigator
  // ...other props
  actions={userActionGroup}
/>;
```

The Action Group approach gives you more control over the dropdown button
appearance.

### Customization

| Prop                      | Type                                | Default     | Description               |
| ------------------------- | ----------------------------------- | ----------- | ------------------------- |
| `headerProps`             | `HeaderProps`                       | `{}`        | Override props for header |
| `navigationLevelDefaults` | `NavigationLevelDefaults`           | See below   | Navigation level settings |
| `renderIcon`              | `(name: string) => React.ReactNode` | Simple span | Icon renderer function    |

### Default Navigation Level Settings

```tsx
{
  primary: {
    alwaysShow: true,
    userToggleable: false
  },
  secondary: {
    alwaysShow: true,
    userToggleable: false
  },
  tertiary: {
    alwaysShow: false,
    userToggleable: true
  }
}
```

## Router Integration

The Navigator is designed to work with any routing library through a router
adapter pattern:

```tsx
interface RouterAdapter {
  Link: React.ComponentType<any>;
  matchPath: (
    pattern: PathPattern | string,
    pathname: string,
  ) => PathMatch | null;
  useLocation: () => { pathname: string };
  navigate?: (to: string) => void;
}
```

### React Router Integration

```tsx
import { Link, matchPath, useLocation } from "react-router-dom";
import { createRouterAdapter } from "@m5nv/ui/navigator";

const routerAdapter = createRouterAdapter(Link, useLocation, matchPath);
```

### Next.js App Router Integration

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createRouterAdapter } from "@m5nv/ui/navigator";

// Create a matchPath function for Next.js
const matchPath = (pattern, pathname) => {
  // Convert string pattern to regex pattern
  const regexPattern = typeof pattern === "string"
    ? pattern.replace(/:[^/]+/g, "[^/]+").replace(/\//g, "\\/")
    : pattern.path.replace(/:[^/]+/g, "[^/]+").replace(/\//g, "\\/");

  const regex = new RegExp(`^${regexPattern}`);

  if (regex.test(pathname)) {
    return { pathname, params: {} };
  }

  return null;
};

// Create Next.js router adapter
const useNextRouterAdapter = () => {
  const pathname = usePathname();

  return createRouterAdapter(
    Link,
    () => ({ pathname }),
    matchPath,
  );
};
```

## Navigation Tree Structure

The navigation tree is the core data structure that defines your application's
navigation. It is structured as a record of sections, each containing an array
of navigation nodes:

```tsx
interface NavTreeNode {
  id: string; // Unique identifier
  path: string; // Route path
  label: string; // Display label
  iconName?: string; // Optional icon name
  end?: boolean; // Whether path is exact match
  children?: NavTreeNode[]; // Optional child nodes
}

const navigationTree: Record<string, NavTreeNode[]> = {
  "main": [
    {
      id: "home",
      path: "/",
      label: "Home",
      iconName: "Home",
      end: true,
    },
    {
      id: "dashboard",
      path: "/dashboard",
      label: "Dashboard",
      iconName: "Dashboard",
      children: [
        {
          id: "analytics",
          path: "/dashboard/analytics",
          label: "Analytics",
          iconName: "Chart",
        },
      ],
    },
  ],
  "admin": [
    {
      id: "admin-home",
      path: "/admin",
      label: "Admin Dashboard",
      iconName: "Shield",
    },
    // More admin section items...
  ],
};
```

## Customization Approaches

The Navigator component provides three levels of customization:

### 1. Basic Props Customization

The simplest form of customization is through props:

```tsx
<Navigator
  darkMode={true}
  displayMode="tabs"
  appTitle="My Custom App"
  logo={<img src="/logo.svg" alt="Logo" />}
  search={true}
  onSearch={handleSearch}
  actions={userActions}
  theme="corporate"
/>;
```

### 2. Component Replacement

For more advanced customization, you can replace entire sub-components:

```tsx
import { Navigator } from "@m5nv/ui/navigator";

// Custom search component
const CustomSearch = () => {
  return (
    <div className="custom-search">
      <input type="text" placeholder="Custom search..." />
      <button>Search</button>
    </div>
  );
};

// Use custom component
<Navigator
  // ...other props
  search={<CustomSearch />}
/>;
```

### 3. Props Overrides

For targeted customization of sub-components:

```tsx
<Navigator
  // ...other props
  headerProps={{
    className: "shadow-lg",
    sticky: true,
  }}
/>;
```

### 4. CSS Customization

You can override the default styles by targeting the semantic class names in
your CSS:

```css
/* In your CSS file */
@layer components {
  .nav-header {
    @apply h-20; /* Make the header taller */
  }

  .nav-btn-primary {
    @apply rounded-full; /* Make primary buttons rounded */
  }
}
```

## Customizable Components

The Navigator exposes several customizable components that you can use to create
your own implementations:

### NavigatorSearch

```tsx
import { NavigatorSearch } from "@m5nv/ui/navigator";

const CustomSearch = () => {
  return (
    <NavigatorSearch
      onSearch={() => console.log("Search clicked")}
      renderIcon={(name) => <MyIcon name={name} />}
      className="custom-search-styles"
    />
  );
};
```

### NavigatorAppSwitcher

```tsx
import { NavigatorAppSwitcher } from "@m5nv/ui/navigator";

const CustomAppSwitcher = ({ sections }) => {
  return (
    <NavigatorAppSwitcher
      section={activeSection}
      availableSections={sections}
      onSectionChange={handleSectionChange}
      renderIcon={renderIcon}
      formatSectionName={(s) => s.toUpperCase()}
      className="custom-switcher-styles"
    />
  );
};
```

### NavigatorActions

```tsx
import { NavigatorActions } from "@m5nv/ui/navigator";

const userActions = [
  {
    id: "profile",
    label: "Profile",
    iconName: "User",
    onClick: () => console.log("Profile clicked"),
  },
  // More actions...
];

const CustomActions = () => {
  return (
    <NavigatorActions
      items={userActions}
      renderIcon={renderIcon}
      className="custom-actions-styles"
    />
  );
};
```

## Semantic CSS Classes

Navigator uses a consistent naming convention for its CSS classes. Here are some
of the key classes you can target for customization:

### Container Classes

- `nav-container`: Main container for the entire navigator
- `nav-header`: Header container
- `nav-tiers`: Navigation tiers container
- `nav-row`: Navigation row container

### Navigation Elements

- `nav-brand`: Logo and app title container
- `nav-title`: Application title
- `nav-controls`: Right side container for search and actions
- `nav-items`: Navigation items container
- `nav-item`: Individual navigation item
- `nav-item-icon`: Icon within navigation item

### Theme Variants

- `nav-header-light`/`nav-header-dark`: Light/dark variants for header
- `nav-row-primary-light`/`nav-row-primary-dark`: Light/dark variants for
  primary navigation row
- `nav-btn-light`/`nav-btn-dark`: Light/dark variants for buttons

### State Classes

- `nav-item-active-*`: Styles for active navigation items
- `nav-item-inactive-*`: Styles for inactive navigation items

### Mobile Navigation

- `nav-mobile-menu`: Mobile menu sidebar
- `nav-mobile-overlay`: Mobile menu overlay
- `nav-mobile-header`: Mobile menu header
- `nav-mobile-content`: Mobile menu content container
- `nav-mobile-list`: Mobile menu list
- `nav-mobile-item`: Mobile menu item

For a complete list of classes, refer to the `navigator.css` file.

## Advanced Usage

### Using the useNavigator Hook

The `useNavigator` hook provides access to the Navigator context within child
components:

```tsx
import { useNavigator } from "@m5nv/ui/navigator";

const NavigationInfo = () => {
  const {
    section,
    navigationTree,
    darkMode,
    router,
  } = useNavigator();

  const { pathname } = router.useLocation();

  return (
    <div>
      <p>Current section: {section}</p>
      <p>Current path: {pathname}</p>
      <p>Dark mode: {darkMode ? "On" : "Off"}</p>
    </div>
  );
};
```

### Conditional Rendering Helpers

The Navigator package includes helper components for conditional rendering:

```tsx
import { Choose, Otherwise, When } from "@m5nv/ui/navigator";

const ConditionalContent = ({ value }) => {
  return (
    <Choose>
      <When condition={value > 100}>
        <p>Value is greater than 100</p>
      </When>
      <When condition={value < 0}>
        <p>Value is negative</p>
      </When>
      <Otherwise>
        <p>Value is between 0 and 100</p>
      </Otherwise>
    </Choose>
  );
};
```

### Creating a Custom Icon Renderer

```tsx
import { createIconRenderer, LetterIcon } from "@m5nv/ui/navigator";
import * as FeatherIcons from "feather-icons-react";

const iconMap = {
  Home: (size) => <FeatherIcons.Home size={size} />,
  Settings: (size) => <FeatherIcons.Settings size={size} />,
  // Map more icons...
};

// Create icon renderer with fallback to letter icon
const renderIcon = createIconRenderer(iconMap);

// Use in Navigator
<Navigator
  // ...other props
  renderIcon={renderIcon}
/>;
```

## Error Handling

The Navigator uses a fail-fast validation approach with clear error messages:

```tsx
// This will throw an error because router is required
<Navigator navigationTree={navigationTree} />
// Error: "Navigator: router is required"

// This will throw an error because Link is required
<Navigator 
  navigationTree={navigationTree}
  router={{ useLocation, matchPath }}
/>
// Error: "Navigator: router.Link is required"
```

## Complete Example

Here's a comprehensive example using the Navigator component:

```tsx
import React, { useState } from "react";
import {
  createIconRenderer,
  createRouterAdapter,
  Navigator,
  NavigatorSearch,
} from "@m5nv/ui/navigator";
import { Link, matchPath, useLocation } from "react-router-dom";
import * as Icons from "./icons";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSection, setCurrentSection] = useState("main");

  // Create router adapter
  const routerAdapter = createRouterAdapter(Link, useLocation, matchPath);

  // Create icon renderer
  const renderIcon = createIconRenderer(Icons);

  // Custom search component
  const CustomSearch = () => {
    return (
      <div className="flex items-center">
        <input
          type="text"
          className="rounded-l px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          placeholder="Search..."
        />
        <button className="rounded-r px-2 py-1 bg-blue-500 text-white">
          {renderIcon("Search")}
        </button>
      </div>
    );
  };

  // User actions for header
  const userActions = {
    label: "My Account",
    iconName: "UserCircle",
    items: [
      {
        id: "profile",
        label: "Profile",
        iconName: "User",
        onClick: () => console.log("Profile clicked"),
      },
      {
        id: "settings",
        label: "Settings",
        iconName: "Settings",
        onClick: () => console.log("Settings clicked"),
      },
      {
        id: "logout",
        label: "Logout",
        iconName: "LogOut",
        onClick: () => console.log("Logout clicked"),
      },
    ],
  };

  return (
    <div>
      <Navigator
        // Required props
        navigationTree={navigationTree}
        router={routerAdapter}
        // Section management
        section={currentSection}
        onSectionChange={setCurrentSection}
        // Display configuration
        darkMode={darkMode}
        displayMode="adaptive"
        theme="corporate"
        // Header elements
        logo={<img src="/logo.svg" alt="Logo" />}
        appTitle="Enterprise App"
        search={<CustomSearch />}
        actions={userActions}
        // Customization
        headerProps={{
          sticky: true,
          className: "shadow-sm",
        }}
        navigationLevelDefaults={{
          tertiary: {
            alwaysShow: false,
            userToggleable: true,
          },
        }}
        // Icons
        renderIcon={renderIcon}
      />

      {/* Page content */}
      <main className="container mx-auto p-4">
        {/* Your page content here */}
      </main>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-800"
      >
        {darkMode ? renderIcon("Sun") : renderIcon("Moon")}
      </button>
    </div>
  );
};

export default App;
```

## Architecture Overview

The Navigator component architecture consists of three main parts:

1. **Navigator**: The main component that provides context and serves as the
   entry point.
2. **NavigationHeader**: Handles the top navigation bar with app title, logo,
   search, and user actions.
3. **NavigationTiers**: Manages all navigation levels and mobile navigation.

### Relationship Between Components

- **Navigator** provides the context and configuration to both NavigationHeader
  and NavigationTiers.
- **NavigationHeader** includes the mobile menu toggle button that communicates
  with NavigationTiers.
- **NavigationTiers** manages all navigation UI states, including the mobile
  navigation drawer.

This architecture centralizes navigation logic in NavigationTiers while keeping
the header functionality isolated in NavigationHeader, resulting in a clean
separation of concerns while maintaining simple communication patterns.

## Best Practices

1. **Structure your navigation tree carefully**: The structure of your
   navigation tree directly impacts the user experience. Plan it according to
   your application's information architecture.

2. **Use consistent icons**: Choose an icon library and use it consistently with
   the `renderIcon` prop.

3. **Consider mobile users**: The Navigator is responsive by default, but test
   your navigation on mobile devices and adjust as needed.

4. **Use error messages**: Pay attention to validation error messages as they
   provide specific guidance on what's missing or incorrect.

5. **Custom components**: When creating custom components, ensure they match the
   style and behavior of the default ones for a consistent user experience.

6. **Performance**: For large navigation trees, consider using memoization to
   prevent unnecessary re-renders.

7. **Accessibility**: Maintain proper ARIA attributes when customizing
   components to ensure accessibility.

8. **Theming**: Use the built-in theming system for consistent styling. Create
   custom themes when necessary.

## TypeScript Support

The Navigator component is built with TypeScript and provides full type
definitions for all components, props, and hooks.

## Browser Support

The Navigator component supports all modern browsers since it requires Tailwind
v4+.

## License

MIT
