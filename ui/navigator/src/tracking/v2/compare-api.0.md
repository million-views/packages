# Navigator Component API Comparison

> Current (v.0) vs. Improved (v.1)

This comparison highlights how the proposed API improvements would simplify
implementation while enabling the sophisticated navigation patterns seen in the
Google News UI.

## Navigation Structure Definition

### Current API

```tsx
const navigationTree = {
  "main": [
    {
      id: "home",
      path: "/",
      label: "Home",
      iconName: "Home",
      end: true,
    },
    {
      id: "foryou",
      path: "/foryou",
      label: "For you",
      iconName: "Star",
      children: [
        {
          id: "us",
          path: "/foryou/us",
          label: "U.S.",
          iconName: "Flag",
        },
        // More nested items...
      ],
    },
    // More items...
  ],
  "admin": [
    // Another section...
  ],
};

<Navigator
  navigationTree={navigationTree}
  section="main"
  onSectionChange={handleSectionChange}
  // More props...
/>;
```

### Improved API

```tsx
<Navigator
  navigation={[
    {
      id: "main",
      items: [
        { id: "home", label: "Home", path: "/" },
        { id: "foryou", label: "For you", path: "/foryou" },
        { id: "following", label: "Following", path: "/following" },
      ],
    },
    {
      id: "categories",
      items: [
        { id: "us", label: "U.S.", path: "/section/us" },
        { id: "world", label: "World", path: "/section/world" },
        // More items...
      ],
    },
  ]}
/>;
```

**DX Improvements:**

- Flatter structure is more intuitive to write and maintain
- Named navigation levels ("main", "categories") replace implicit nesting
- Separation of concerns between navigation levels
- Fewer required properties per navigation item
- No need for separate section switching logic

## Responsive Behavior Configuration

### Current API

```tsx
<Navigator
  displayMode="adaptive" // "tabs" | "breadcrumbs" | "adaptive"
  // No direct control over breakpoints
  // No per-breakpoint configuration
  navigationLevelDefaults={{
    primary: {
      alwaysShow: true,
      userToggleable: false,
    },
    secondary: {
      alwaysShow: true,
      userToggleable: false,
    },
    tertiary: {
      alwaysShow: false,
      userToggleable: true,
    },
  }}
/>;
```

### Improved API

```tsx
<Navigator
  responsive={{
    mobile: {
      maxWidth: 767,
      primaryNav: "drawer",
      secondaryNav: "tabs",
      searchDisplay: "collapsed",
    },
    tablet: {
      maxWidth: 1023,
      primaryNav: "tabs",
      secondaryNav: "tabs",
      searchDisplay: "icon",
    },
    desktop: {
      primaryNav: "tabs",
      secondaryNav: "tabs",
      searchDisplay: "expanded",
    },
  }}
/>;
```

**DX Improvements:**

- Named breakpoints are more intuitive than hard-coded values
- Comprehensive configuration for each breakpoint
- Direct control over all responsive behaviors
- Each navigation level can have its own display mode
- Clear mental model of how navigation will transform

## App Switcher Implementation

### Current API

```tsx
<Navigator
  appSwitcher={true} // Boolean or React element
  // OR custom element
  appSwitcher={<CustomAppSwitcher />}
  // Limited customization through context
/>;
```

### Improved API

```tsx
<Navigator
  appSwitcher={{
    type: "grid",
    layout: { columns: { mobile: 3, desktop: 3 } },
    position: "right",
    items: [
      { id: "gmail", label: "Gmail", icon: "EnvelopeOpen", url: "#" },
      { id: "drive", label: "Drive", icon: "CloudArrowUp", url: "#" },
      // More apps...
    ],
    trigger: {
      icon: "Squares2X2",
      label: "Apps",
    },
  }}
/>;
```

**DX Improvements:**

- Declarative configuration instead of imperative implementation
- Built-in support for different layouts
- Direct control over appearance and behavior
- No need to create a custom component for common use cases
- Responsive configuration built-in

## Search Component Integration

### Current API

```tsx
<Navigator
  search={true} // Boolean or React element
  onSearch={() => console.log("Search clicked")}
  // OR custom element
  search={<CustomSearch />}
  // Limited functionality, just triggers callback
/>;
```

### Improved API

```tsx
<Navigator
  search={{
    enabled: true,
    placeholder: "Search for topics, locations & sources",
    expandable: true,
    onSearch: (query) => console.log("Searching for:", query),
    display: { mobile: "collapsed", desktop: "expanded" },
  }}
/>;
```

**DX Improvements:**

- Full search implementation built-in
- Responsive behavior controls
- Expandable/collapsible functionality
- Direct access to search query
- No need for custom component for common use cases

## Active State Styling

### Current API

```tsx
// No direct control over active state styling
// Must be customized through CSS
//
// In your CSS:
// .nav-item-active-primary-light { /* styles */ }
// .nav-item-active-secondary-light { /* styles */ }
```

### Improved API

```tsx
<Navigator
  activeState={{
    primary: { type: "underline", color: "blue" },
    secondary: { type: "pill", color: "blue-light" },
    drawer: { type: "background", color: "blue-light" },
  }}
/>;
```

**DX Improvements:**

- Declarative active state configuration
- No need for custom CSS
- Consistent styling across all navigation levels
- Predefined active state visualizations
- Easy theme integration

## Icon System

### Current API

```tsx
// Custom icon renderer function
const renderIcon = (name) => {
  // Complex implementation...
  return <YourIconComponent name={name} />;
};

<Navigator
  renderIcon={renderIcon}
  // Each navigation item needs iconName prop
/>;
```

### Improved API

```tsx
<Navigator
  icons={{
    renderer: renderIcon, // Optional custom renderer
    library: "heroicons", // Or built-in options
    showLabels: {
      mobile: false,
      desktop: true,
    },
  }}
/>;
```

**DX Improvements:**

- Built-in support for common icon libraries
- Control over icon+label display
- Responsive icon behavior
- Simpler implementation for common cases
- Consistent icon presentation

## Theme System

### Current API

```tsx
<Navigator
  theme="corporate" // Limited preset themes
  darkMode={true} // Boolean toggle
/>;

// With custom CSS:
// .nav-theme-custom { /* CSS custom properties */ }
```

### Improved API

```tsx
<Navigator
  theme="google-news" // More preset themes
  colorMode="dark" // "light", "dark", "system"
  themeOverrides={{
    colors: {
      primary: "#4285F4",
      background: "#202124",
      // More colors...
    },
    spacing: {
      header: "64px",
      // More spacing values...
    },
  }}
/>;
```

**DX Improvements:**

- More intuitive theme system
- System preference support
- Direct property overrides without CSS
- More preset themes for common designs
- Better separation of theme from structure

## Overall DX Impact

The improved API delivers several key developer experience benefits:

1. **Reduced Complexity**: Flatter structures and more intuitive naming reduce
   cognitive load
2. **Declarative Configuration**: More declarative approach vs. imperative
   implementation
3. **Comprehensive Defaults**: Better defaults that handle common patterns out
   of the box
4. **Responsive Control**: Direct control over responsive behavior at each
   breakpoint
5. **Visual Consistency**: Built-in styling controls ensure consistent
   appearance
6. **Less Boilerplate**: Fewer custom components needed for common use cases
7. **Better Mental Model**: API structure better matches how developers think
   about navigation

These improvements would make our Navigator component significantly easier to
use while enabling the sophisticated navigation patterns seen in the Google News
UI examples.
