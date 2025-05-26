# Navigator Component API Documentation

> After centralizing the use of icons using `renderIcon`\
> 14MAY2025

## Design Philosophy

This API design is guided by several core principles:

1. **Minimal Surface Area, Maximum Flexibility**: Reduce API complexity while
   enabling sophisticated navigation patterns
2. **Progressive Complexity**: Simple use cases should be simple, complex use
   cases possible
3. **Theme-Driven Customization**: Most visual customization through theming,
   not props
4. **Composition over Configuration**: Use component composition for advanced
   scenarios
5. **Context-Aware Behavior**: Components adapt based on viewport, state, and
   context

## Core API Structure

```tsx
<Navigator
  // Brand/identity (required)
  brand={{
    logo: <GoogleLogo />,
    title: "News",
    url: "/",
  }}
  // Navigation structure (required)
  navigation={[
    // Primary navigation section
    {
      id: "main",
      items: [
        { id: "home", label: "Home", path: "/", icon: "Home" },
        { id: "foryou", label: "For you", path: "/foryou", icon: "Star" },
        { id: "following", label: "Following", path: "/following" },
        {
          id: "showcase",
          label: "News Showcase",
          path: "/showcase",
          icon: "Apps",
        },
      ],
    },

    // Secondary navigation section (categories)
    {
      id: "categories",
      separator: true, // Visual separator before this group
      items: [
        {
          id: "us",
          label: "U.S.",
          path: "/section/us",
          icon: "UsFlag",
          contextActions: [ // Actions shown only in this section
            { id: "star", icon: "Star", label: "Save", onClick: () => {} },
            { id: "share", icon: "Share", label: "Share", onClick: () => {} },
          ],
        },
        { id: "world", label: "World", path: "/section/world", icon: "Globe" },
        // More items...
      ],
    },
  ]}
  // Global actions (optional)
  actions={[
    {
      id: "search",
      icon: "Search",
      label: "Search",
      position: "right",
      onClick: () => {},
    },
    // More actions...
  ]}
  // Responsive configuration (optional)
  responsive={{
    mobile: {
      breakpoint: 768, // Max width in pixels
      primaryNav: "drawer", // Hamburger menu for main nav
      categoryNav: "tabs", // Horizontal scrollable tabs for categories
      brand: {
        truncateTitle: true, // "Google News" becomes "Google N..."
        useIcon: true, // Show menu icon with title
      },
    },
    tablet: {
      breakpoint: 1024,
      primaryNav: "tabs",
      categoryNav: "tabs",
    },
    desktop: {
      primaryNav: "tabs",
      categoryNav: "tabs",
      brand: {
        fullWidth: false, // Don't make brand section take full width
      },
    },
  }}
  // Router integration (required)
  router={routerAdapter}
  // Icon renderer function (required)
  renderIcon={renderIcon}
  // Theme configuration (optional)
  theme="google-news" // Preset theme
  // OR theme overrides
  themeOverrides={{
    colors: {
      primary: "#4285F4",
      // Other color overrides
    },
  }}
  // Advanced customization through component overrides (optional)
  components={{
    // Override specific components
    SectionHeader: CustomSectionHeader,
    NavItem: CustomNavItem,
    // Other component overrides
  }}
  // Render props for advanced customization (optional)
  renderBrand={({ brand, isMobile }) => (
    <CustomBrand brand={brand} isMobile={isMobile} />
  )}
  renderNavigation={({ sections, activeSection, activeItem }) => (
    <CustomNavigation
      sections={sections}
      activeSection={activeSection}
      activeItem={activeItem}
    />
  )}
  renderActions={({ actions, isMobile }) => (
    <CustomActions actions={actions} isMobile={isMobile} />
  )}
  // Custom wrapper (optional)
  wrapper={({ children }) => <CustomLayout>{children}</CustomLayout>}
/>;
```

## API Details

### 1. Brand Configuration

The `brand` prop configures the application identity:

```tsx
brand: {
  // Required - Application name
  title: "News",
  
  // Optional - React node for logo (can be SVG, image, or text)
  logo: <GoogleLogo />,
  
  // Optional - URL for logo/title click
  url: "/",
  
  // Optional - Additional content to show in brand area
  extra: <LanguageSelector />
}
```

### 2. Navigation Structure

The `navigation` prop defines your navigation hierarchy:

```tsx
navigation: [
  // Each object is a navigation section
  {
    // Required - Unique identifier for the section
    id: "main",

    // Optional - Add visual separator before this section
    separator: false,

    // Optional - Section label (for mobile menus)
    label: "Main Navigation",

    // Required - Navigation items
    items: [
      {
        // Required - Unique identifier
        id: "home",

        // Required - Display label
        label: "Home",

        // Required - Route path
        path: "/",

        // Optional - Icon for this item (string name or React node)
        icon: "Home",

        // Optional - Whether to match exactly (like React Router's "exact")
        exact: true,

        // Optional - Whether to show this item in mobile view
        mobileVisible: true,

        // Optional - Whether to show this item in desktop view
        desktopVisible: true,

        // Optional - Actions shown only when this item is active
        contextActions: [
          { id: "star", icon: "Star", label: "Save", onClick: () => {} },
        ],

        // Optional - Children items (for dropdown/nested navigation)
        children: [
          { id: "sub1", label: "Sub Item 1", path: "/home/sub1" },
        ],
      },
      // More items...
    ],
  },
  // More sections...
];
```

### 3. Actions Configuration

The `actions` prop defines global navigation actions:

```tsx
actions: [
  {
    // Required - Unique identifier
    id: "search",

    // Optional - Icon to display (string name or React node)
    icon: "Search",

    // Optional - Text label
    label: "Search",

    // Optional - Where to position the action
    position: "right", // "left", "right", "center"

    // Optional - Action variant
    type: "icon", // "icon", "button", "text", "menu"

    // Optional - For button types
    variant: "default", // "default", "primary", "secondary", "text"

    // Optional - Click handler
    onClick: () => {},
  },
  // More actions...
];
```

### 4. Responsive Configuration

The `responsive` prop controls behavior across viewport sizes:

```tsx
responsive: {
  // Mobile configuration
  mobile: {
    // Max width for this breakpoint
    breakpoint: 768,
    
    // How to display primary navigation
    primaryNav: "drawer", // "drawer", "tabs", "hidden"
    
    // How to display category navigation
    categoryNav: "tabs", // "tabs", "dropdown", "hidden"
    
    // Brand area configuration
    brand: {
      truncateTitle: true, // Whether to truncate the title
      useIcon: true,       // Whether to show menu icon
      centered: false      // Whether to center the brand
    },
    
    // Action visibility
    actions: {
      // Which action IDs to show
      visible: ["search", "signin"],
      // Which action IDs to combine into a menu
      overflowMenu: ["help", "settings"]
    }
  },
  
  // Similar configuration for other breakpoints
  tablet: { /* ... */ },
  desktop: { /* ... */ }
}
```

### 5. Icon Renderer (Required)

The `renderIcon` prop provides a function to render icons:

```tsx
renderIcon: ((nameOrIcon, size = 20) => {
  // If it's already a React element, return it
  if (React.isValidElement(nameOrIcon)) {
    return nameOrIcon;
  }

  // If it's a string name, look up in icons map
  if (typeof nameOrIcon === "string") {
    return <YourIconComponent name={nameOrIcon} size={size} />;
  }

  return null;
});

// Helper function to create an icon renderer
const renderIcon = createIconRenderer({
  Search: (size) => <SearchIcon size={size} />,
  Home: (size) => <HomeIcon size={size} />,
  // More icons...
});
```

### 6. Theme Configuration

The `theme` prop can be a string preset or a theme object:

```tsx
// Simple preset
theme: "google-news",

// OR detailed overrides
themeOverrides: {
  colors: {
    primary: "#4285F4",
    surface: "#FFFFFF",
    navSeparator: "#DADCE0",
    activeTabIndicator: "#4285F4",
    activeTabBackground: "#E8F0FE",
    text: "#202124",
    textMuted: "#5F6368"
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    headerSize: "20px",
    navSize: "14px",
    fontWeightNormal: 400,
    fontWeightBold: 500
  },
  spacing: {
    headerHeight: "64px",
    navItemPadding: "0 16px",
    sectionSpacing: "24px"
  },
  borders: {
    navSeparator: "1px solid var(--nav-color-separator)",
    radius: "4px"
  },
  transitions: {
    navHover: "background-color 0.2s ease",
    menuExpand: "all 0.3s ease"
  }
}
```

### 7. Component Overrides

The `components` prop allows replacing specific internal components:

```tsx
components: {
  // Override the header component
  Header: ({ brand, actions }) => (
    <CustomHeader brand={brand} actions={actions} />
  ),
  
  // Override the navigation item component
  NavItem: ({ item, isActive, onClick }) => (
    <CustomNavItem item={item} isActive={isActive} onClick={onClick} />
  ),
  
  // Override the section header component
  SectionHeader: ({ section }) => (
    <CustomSectionHeader section={section} />
  ),
  
  // More component overrides...
}
```

## Advanced API Examples

### Example 1: Google News-like Configuration

```tsx
<Navigator
  brand={{
    logo: <GoogleLogo />,
    title: "News",
    url: "/",
  }}
  navigation={[
    {
      id: "main",
      items: [
        { id: "home", label: "Home", path: "/", icon: "Home" },
        { id: "foryou", label: "For you", path: "/foryou", icon: "Star" },
        { id: "following", label: "Following", path: "/following" },
        {
          id: "showcase",
          label: "News Showcase",
          path: "/showcase",
          icon: "Apps",
        },
      ],
    },
    {
      id: "categories",
      separator: true,
      items: [
        { id: "us", label: "U.S.", path: "/section/us", icon: "User" },
        { id: "world", label: "World", path: "/section/world", icon: "Globe" },
        { id: "local", label: "Local", path: "/section/local", icon: "Home" },
        {
          id: "business",
          label: "Business",
          path: "/section/business",
          icon: "Settings",
        },
        { id: "technology", label: "Technology", path: "/section/technology" },
        {
          id: "entertainment",
          label: "Entertainment",
          path: "/section/entertainment",
          icon: "Star",
        },
      ],
    },
  ]}
  actions={[
    { id: "search", icon: "Search", type: "icon", position: "right" },
    { id: "help", icon: "Help", type: "icon", position: "right" },
    { id: "settings", icon: "Settings", type: "icon", position: "right" },
    {
      id: "signin",
      label: "Sign in",
      type: "button",
      variant: "primary",
      position: "right",
    },
  ]}
  responsive={{
    mobile: {
      breakpoint: 768,
      primaryNav: "drawer",
      categoryNav: "tabs",
      brand: {
        truncateTitle: true,
        useIcon: true,
      },
      actions: {
        visible: ["search", "signin"],
        overflowMenu: ["help", "settings"],
      },
    },
    desktop: {
      primaryNav: "tabs",
      categoryNav: "tabs",
    },
  }}
  router={googleNewsRouterAdapter}
  renderIcon={renderIcon}
  theme="google-news"
/>;
```

### Example 2: Minimal Configuration

```tsx
// Create icon renderer with fallbacks
const renderIcon = createIconRenderer({
  Home: (size) => <HomeIcon size={size} />,
  About: (size) => <InfoIcon size={size} />,
  Contact: (size) => <MailIcon size={size} />,
});

// Minimal configuration with sensible defaults
<Navigator
  brand={{
    title: "My App",
  }}
  navigation={[
    {
      id: "main",
      items: [
        { id: "home", label: "Home", path: "/", icon: "Home" },
        { id: "about", label: "About", path: "/about", icon: "About" },
        { id: "contact", label: "Contact", path: "/contact", icon: "Contact" },
      ],
    },
  ]}
  router={routerAdapter}
  renderIcon={renderIcon}
/>;
```

### Example 3: Custom Component Composition

```tsx
// Maximum customization through composition
<Navigator
  brand={{
    title: "Custom App",
  }}
  navigation={navigationData}
  router={customRouterAdapter}
  renderIcon={customIconRenderer}
  // Use render props for complex custom rendering
  renderBrand={() => (
    <div className="custom-brand">
      <AnimatedLogo />
      <h1>Custom App</h1>
    </div>
  )}
  renderNavigation={({ sections, activeSection, activeItem }) => (
    <CustomNavigation
      sections={sections}
      activeSection={activeSection}
      activeItem={activeItem}
    />
  )}
  renderActions={({ actions }) => <CustomActions actions={actions} />}
  // Custom wrapper for the entire component
  wrapper={({ children }) => (
    <CustomLayout>
      {children}
    </CustomLayout>
  )}
/>;
```

## Theme Token System

The theme system uses CSS variables with a consistent naming structure:

```css
/* Root theme variables */
:root {
  /* Colors */
  --nav-color-primary: #4285f4;
  --nav-color-surface: #ffffff;
  --nav-color-text: #202124;
  --nav-color-text-muted: #5f6368;
  --nav-color-separator: #dadce0;
  --nav-color-active-indicator: #4285f4;
  --nav-color-active-background: #e8f0fe;

  /* Typography */
  --nav-typography-font-family: "Roboto", sans-serif;
  --nav-typography-header-size: 20px;
  --nav-typography-nav-size: 14px;
  --nav-typography-font-weight-normal: 400;
  --nav-typography-font-weight-bold: 500;

  /* Spacing */
  --nav-spacing-header-height: 64px;
  --nav-spacing-nav-item-padding: 0 16px;
  --nav-spacing-section: 24px;

  /* Borders */
  --nav-border-separator: 1px solid var(--nav-color-separator);
  --nav-border-radius: 4px;

  /* Transitions */
  --nav-transition-hover: background-color 0.2s ease;
  --nav-transition-menu: all 0.3s ease;
}
```

## Hook-Based Extensions

For advanced customization, we provide hooks that can be used in custom
components:

```tsx
// Access navigator state and actions
const {
  activeSection,
  activeItem,
  isDrawerOpen,
  toggleDrawer,
  renderIcon,
} = useNavigator();

// Access responsive state
const {
  isMobile,
  isTablet,
  isDesktop,
  currentBreakpoint,
  currentConfig,
} = useResponsive();

// Access theme
const theme = useTheme();
```

## Utilities

```tsx
// Create icon renderer
const renderIcon = createIconRenderer({
  Home: (size) => <HomeIcon size={size} />,
  Settings: (size) => <SettingsIcon size={size} />,
  // More icons...
});

// Override component
const CustomNav = withOverride(DefaultNav, components, "Navigation");
```

## Type Definitions

```typescript
// Core types
interface NavigatorProps {
  brand: BrandConfig | React.ReactNode;
  navigation: NavigationSection[];
  actions?: Action[];
  responsive?: ResponsiveConfig;
  theme?: string | ThemeConfig;
  themeOverrides?: Partial<ThemeConfig>;
  components?: ComponentOverrides;
  router: RouterAdapter;
  renderIcon: (nameOrIcon: React.ReactNode, size?: number) => React.ReactNode;

  // Render props for advanced customization
  renderBrand?: (props: BrandRenderProps) => React.ReactNode;
  renderNavigation?: (props: NavigationRenderProps) => React.ReactNode;
  renderActions?: (props: ActionsRenderProps) => React.ReactNode;
  wrapper?: (props: { children: React.ReactNode }) => React.ReactNode;
}

interface BrandConfig {
  logo?: React.ReactNode;
  title: string;
  url?: string;
  extra?: React.ReactNode;
}

interface NavigationSection {
  id: string;
  label?: string;
  separator?: boolean;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string | React.ReactNode;
  exact?: boolean;
  mobileVisible?: boolean;
  desktopVisible?: boolean;
  contextActions?: Action[];
  children?: NavigationItem[];
}

interface Action {
  id: string;
  icon?: string | React.ReactNode;
  label?: string;
  position?: "left" | "right" | "center";
  type?: "icon" | "button" | "text" | "menu";
  variant?: "default" | "primary" | "secondary" | "text";
  onClick?: () => void;
  href?: string;
  children?: Action[];
}

interface ResponsiveConfig {
  mobile?: BreakpointConfig;
  tablet?: BreakpointConfig;
  desktop?: BreakpointConfig;
}

interface BreakpointConfig {
  breakpoint?: number;
  primaryNav?: "drawer" | "tabs" | "hidden";
  categoryNav?: "tabs" | "dropdown" | "hidden";
  brand?: BrandBreakpointConfig;
  actions?: ActionsBreakpointConfig;
}

// ... more type definitions
```

This API provides a balanced approach that enables sophisticated navigation
patterns while keeping the surface area manageable. It follows a "progressive
complexity" model where simple use cases are simple, but complex use cases are
possible through composition and advanced customization.
