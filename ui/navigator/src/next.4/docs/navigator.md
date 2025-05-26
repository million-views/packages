# Navigator API Documentation

## Core Concepts

The Navigator component implements a Model-View-Controller pattern:

- **Model**: `navigationTree` - The hierarchical navigation data structure
- **Controller**: `Navigator` - Manages state and navigation logic
- **View**: `Template` - Renders navigation UI based on state

This separation creates a clear flow of data and responsibilities:

1. `navigationTree` provides the raw navigation data (Model)
2. `Navigator` processes this data and manages navigation state (Controller)
3. Templates access this processed state to render the appropriate UI (View)

## NavigatorProps

```typescript
export interface NavigatorProps {
  // Navigation data structure from rr-builder
  navigationTree: Record<string, NavTreeNode[]>;

  // Primary section to display
  section: string;

  // Optional secondary section for multi-level navigation
  secondarySection?: string;

  // Router integration
  router: {
    Link: React.ComponentType<any>;
    useLocation: () => { pathname: string };
    matchPath: (pattern: string, pathname: string) => any | null;
  };

  // Icon rendering function
  renderIcon: (
    name: string | React.ReactNode,
    size?: number,
  ) => React.ReactNode;

  // Template selection or custom template component
  template?: string | React.ComponentType<TemplateProps>;

  // Application title
  appTitle?: string;

  // Application logo
  logo?: React.ReactNode | string;
}
```

## Navigation Context (useNavigator)

Templates access navigation state through the `useNavigator()` hook:

```typescript
interface NavigatorContextType {
  navigationTree: Record<string, NavTreeNode[]>;
  activeSection: string;
  secondarySection?: string;
  activeItem: NavTreeNode | null;
  isDrawerOpen: boolean;
  isMobile: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  getItemsByTags: (tag: string) => NavTreeNode[];
  getRelatedItems: (parentItem: NavTreeNode) => NavTreeNode[];
  getBreadcrumbs: () => NavTreeNode[];
  renderIcon: (
    name: string | React.ReactNode,
    size?: number,
  ) => React.ReactNode;
  isItemActive: (item: NavTreeNode) => boolean;
  isItemParentOfActive: (item: NavTreeNode) => boolean;
  getItemUrl: (item: NavTreeNode) => string;
  Link: React.ComponentType<any>;
  appTitle?: string;
  logo?: React.ReactNode | string;
}
```

## Usage Example

```jsx
import { Navigator } from "@m5nv/navigator";
import { navigationTree } from "./routes";

function App() {
  return (
    <div className="app-layout">
      <Navigator
        navigationTree={navigationTree}
        section="main"
        router={routerAdapter}
        renderIcon={renderIcon}
        template="dashboard"
        appTitle="Admin Dashboard"
        logo="LayoutDashboard"
      />
      <main className="content">
        {/* Page content renders outside Navigator */}
      </main>
    </div>
  );
}
```

## Template Selection

Navigator supports built-in templates or custom components:

```jsx
// Using a built-in template
<Navigator template="dashboard" {...props} />

// Using a custom template component
<Navigator template={CustomTemplate} {...props} />
```

See `Template Developer's Guide` for details on how to create your custom
template or extending built-in templates.

## Navigation Tree Structure

The NavigationTree follows this structure:

```typescript
interface NavTreeNode {
  id: string;
  label: string;
  path: string;
  iconName?: string;
  tags?: string[];
  parent?: string;
  end?: boolean;
  contextActions?: ContextAction[];
  children?: NavTreeNode[];
}

// Organized by sections
type NavigationTree = Record<string, NavTreeNode[]>;
```

## Custom Template Integration

To create a custom template:

```jsx
function CustomTemplate({ components }) {
  const navContext = useNavigator();

  return (
    <div className="mv-custom-container">
      {/* Navigation UI implementation */}
    </div>
  );
}

// Usage
<Navigator template={CustomTemplate} {...props} />;
```

# References

- [Navigator Template Developer's Guide](./navigator-template-guide.md)
- [Navigator CSS Documentation](./navigator-css-guide.md)
