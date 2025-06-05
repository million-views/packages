# 📋 **@m5nv/ui-elements Modernization Specification**

## **🎯 Project Overview**

Transform the existing @m5nv/ui-elements React component library to use modern
CSS features and simplified prop architecture while maintaining backward
compatibility and enforcing "data down, callbacks up" patterns. Note: backward
compatibility is desired but not required; this package has not been released
into the wild yet. So, now is the time to design and implement the best widget
library we can muster for developers to love and adopt.

---

## **📁 Required Inputs**

### **1. Current Codebase Files:**

- `styles.css` - Complete current CSS file
- `index.tsx` - Complete current React component file
- `package.json` - Current dependencies and configuration

### **2. Implementation Context:**

You are modernizing an existing, working component library. Do not start from
scratch - modify the existing code.

---

## **🎯 Implementation Goals**

### **CSS Modernization:**

1. **CSS Nesting** - Convert all nested selectors to native CSS nesting
2. **Cascade Layers** - Organize CSS using `@layer base, components, utilities`
3. **Modern CSS Features** - Use `color-mix()`, `:has()`, logical properties
4. **Remove Legacy** - Eliminate vendor prefixes, old browser hacks
5. **Size Reduction** - Target 40-50% smaller CSS bundle

### **React API Modernization:**

1. **Dimensional Props** - Convert to `layout` and `styling` prop objects
2. **Default Responsive** - Make all components responsive by default
3. **Data Down, Callbacks Up** - Enforce pure data flow
4. **Preact Compatible** - Use only React/Preact common features
5. **No Optimization Assumptions** - Remove React.memo, unnecessary useCallback

---

## **🏗️ Target Component Architecture**

### **Standard Component Interface:**

```tsx
interface ComponentProps extends BaseProps {
  // Core data (varies per component)
  actions?: Action[];
  items?: MenuItem[];
  columns?: TableColumn[];
  data?: any[];

  // Universal layout dimension
  layout?: {
    variant?: string;
    size?: BaseSize;
    position?: string;
    orientation?: Orientation;
  };

  // Universal styling dimension
  styling?: {
    className?: string;
    theme?: string;
  };

  // Event callbacks (component-specific)
  onActionClick?: (action: Action) => void;
  onItemClick?: (item: MenuItem) => void;
  // ... other callbacks
}
```

### **Components to Modernize:**

- ActionBar, List, TabGroup, Pagination (add layout.orientation)
- Table, Select, SearchBox, Button (add layout/styling structure)
- Header, Brand, Card, Drawer (add layout/styling structure)
- Navigation, MegaDropdown, Breadcrumbs (add layout/styling structure)
- CollapsibleSection (add layout/styling structure)

---

## **📐 CSS Architecture Target**

### **Cascade Layer Structure:**

```css
@layer base {
  /* Design system, resets, base styles */
}

@layer components {
  /* All component styles with nesting */
  .mv-actionbar {
    /* Base styles */

    &--horizontal {
      /* Orientation variant */
    }
    &--vertical {
      /* Orientation variant */
    }

    &__action {
      /* Action styles */

      &:hover {
        /* Hover state */
      }
      &--disabled {
        /* Disabled state */
      }
    }

    &__icon {
      /* Icon styles */
    }
    &__label {
      /* Label styles */
    }
  }
}

@layer utilities {
  /* Container query utilities, overrides */
}
```

### **Modern CSS Features to Use:**

- **Nesting**: `.mv-component { &__element { &--modifier { } } }`
- **color-mix()**:
  `color-mix(in srgb, var(--mv-color-primary) 15%, transparent)`
- **:has()**: `.mv-button:has(.mv-button__spinner) { }`
- **Logical Properties**: `margin-inline-start`, `padding-block-end`
- **Container Style Queries**: `@container style(--variant: compact)`

---

## **⚠️ Critical CSS Guidelines**

### **Forbidden Patterns:**

1. **❌ Hardcoded px values** except for borders (1px, 2px)
   ```css
   /* BAD */
   .component {
     width: 300px;
     margin: 20px;
   }

   /* GOOD */
   .component {
     width: min(100%, 20rem);
     margin: var(--mv-space-lg);
   }
   ```

2. **❌ Width/Height with Padding/Border** (box model conflicts)
   ```css
   /* BAD */
   .component {
     width: 200px;
     padding: 16px;
     border: 2px solid;
   }

   /* GOOD */
   .component {
     max-width: 200px;
     padding: var(--mv-space-lg);
     border: 2px solid var(--mv-color-border);
     box-sizing: border-box;
   }
   ```

3. **❌ Margin abuse** - Use spacing tokens, prefer padding
   ```css
   /* BAD */
   .component {
     margin: 5px 10px 15px 20px;
   }

   /* GOOD */
   .component {
     margin-block: var(--mv-space-md);
     margin-inline: var(--mv-space-lg);
   }
   ```

4. **❌ Div-soup** - Use semantic HTML
   ```tsx
   /* BAD */
   <div className="list">
     <div className="item">Content</div>
   </div>

   /* GOOD */
   <ul className="mv-list">
     <li className="mv-list__item">Content</li>
   </ul>
   ```

---

## **🧩 Widget Design Principles**

### **1. Composability First**

- **Export granular components** - Individual pieces should be usable
- **Example**: Export both `ActionBar` and individual `Action` component

```tsx
/// Parent components AND sub-components should be usable
import { ActionBar, Action, Tab, TabGroup  } from '@m5nv/ui-elements';

/// Full widget: note actions contains data not `Action[]`
<ActionBar actions={actions} onActionClick={handleClick} />

  /// Individual building blocks also available
<Action 
  action={{ id: 'save', label: 'Save', icon: '💾' }} 
  onClick={handleSave} 
/>

/// Mixed usage
<div className="custom-toolbar">
  <Action action={primaryAction} onClick={handlePrimary} />
  <ActionBar actions={secondaryActions} layout={{ variant: "compact" }} />
</div>

/// NOTE: tabs contain data NOT `Tab[]`
<TabGroup tabs={tabs} onTabChange={handleTabChange} />

/// Individual tab also available (as an example, do this only if it makes sense)
<Tab 
  tab={{ id: "profile", label: "Profile", icon: "👤" }}
  active={true}
  onClick={handleTabClick}
/>
```

### **2. 80/20 Rule**

- **Cover 80% of use cases** with simple APIs
- **Don't over-engineer** for edge cases
- **Smart defaults** reduce configuration needs

### **3. Semantic HTML Foundation**

- **Use proper elements**: `<button>`, `<nav>`, `<table>`, `<ul>`, etc.
- **ARIA attributes** built-in automatically
- **Screen reader friendly** by default

### **4. Data-Driven Architecture**

- **Accept rich data objects** - Transform internally
- **Minimal JSX** in application layer
- **Complete widgets** - Handle edge cases internally

---

## **⚛️ React Code Quality Standards**

### **1. Clean JSX Patterns**

**❌ Avoid conditional JSX expressions:**

```tsx
// BAD
return (
  <div>
    {isLoading && <Spinner />}
    {error && <ErrorMessage error={error} />}
    {items.length === 0 && <EmptyState />}
    {items.length > 0 && <List items={items} />}
  </div>
);
```

**✅ Use conditional components:**

```tsx
// GOOD
function Spinner({ isLoading }) {
  if (!isLoading) return null;
  return <div className="mv-spinner" />;
}

function ErrorMessage({ error }) {
  if (!error) return null;
  return <div className="mv-error">{error.message}</div>;
}

function ListItems({ items }) {
  if (items.length === 0) {
    return <div className="mv-empty">No items</div>;
  }
  return <ul className="mv-list">...</ul>;
}

// Clean, predictable JSX
return (
  <div>
    <Spinner isLoading={isLoading} />
    <ErrorMessage error={error} />
    <ListItems items={items} />
  </div>
);
```

### **2. Function Declarations**

**❌ Avoid arrow functions except for one-liners:**

```tsx
// BAD
const handleClick = (event) => {
  event.preventDefault();
  onAction(action);
};

// GOOD
function handleClick(event) {
  event.preventDefault();
  onAction(action);
}

// Arrow functions OK for one-liners
const isActive = (id) => selectedIds.includes(id);
```

### **3. Minimal Render Functions**

**❌ Avoid complex render functions:**

```tsx
// BAD
const renderContent = () => {
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (items.length === 0) return <EmptyState />;
  return <List items={items} />;
};
```

**✅ Use internal components instead:**

```tsx
// GOOD - Components handle their own logic
function TableContent({ isLoading, error, items }) {
  return (
    <>
      <LoadingSpinner isVisible={isLoading} />
      <ErrorDisplay error={error} />
      <DataRows items={items} isEmpty={items.length === 0} />
    </>
  );
}
```

---

## **🔧 Implementation Steps**

### **Phase 1: CSS Modernization**

1. **Add Cascade Layers** - Wrap existing CSS in `@layer` blocks
2. **Convert to Nesting** - Transform all nested selectors to native nesting
3. **Modern Features** - Replace RGBA with `color-mix()`, add `:has()` selectors
4. **Remove Legacy** - Strip vendor prefixes, old browser workarounds
5. **Logical Properties** - Convert directional properties
6. **Fix CSS Anti-patterns** - Remove hardcoded px, fix box model issues

### **Phase 2: Component API Modernization**

1. **Add OrientableProps** - Extend interface for layout-aware components
2. **Layout Dimension** - Add layout prop to all components
3. **Styling Dimension** - Add styling prop to all components
4. **Default Responsive** - Remove responsive prop, make default behavior
5. **Composable Exports** - Export granular components (Action, TabItem, etc.)

### **Phase 3: Code Quality Enhancement**

1. **Clean JSX Patterns** - Replace conditional expressions with components
2. **Function Declarations** - Convert arrow functions to declarations
3. **Remove Optimizations** - Strip React.memo, unnecessary useCallback
4. **Semantic HTML** - Ensure proper element usage
5. **Type Safety** - Update TypeScript interfaces

---

## **⚠️ Critical Constraints**

### **Browser Support:**

- **Minimum**: 6 months old browsers only
- **Features Available**: All modern CSS features, no fallbacks needed

### **Framework Compatibility:**

- **React**: 19+ features allowed but not required
- **Preact**: Must work with Preact (common React/Preact subset only)
- **SSR**: All code must be server-safe

### **API Compatibility:**

- **Backward Compatible**: Existing code should continue working
- **Breaking Changes OK**: Pre-release, prioritize getting it right
- **Library First**: No framework assumptions, pure data-driven widgets

### **Performance:**

- **No Assumptions**: Don't add React.memo, let applications optimize
- **Bundle Size**: Smaller CSS/JS bundles
- **Runtime**: Same or better performance

---

## **✅ Success Criteria**

### **Measurable Goals:**

1. **CSS Bundle**: 40-50% smaller than current
2. **Modern Features**: Native nesting, cascade layers, color-mix() usage
3. **API Consistency**: All components use layout/styling pattern
4. **Composability**: Key components export granular pieces
5. **Framework Agnostic**: Works with React and Preact
6. **Type Safety**: Full TypeScript support for new patterns
7. **Code Quality**: Clean JSX, function declarations, semantic HTML

### **Quality Gates:**

- All existing functionality preserved
- No runtime errors in SSR environment
- TypeScript compilation with no errors
- CSS validates in target browsers
- Components export granular pieces where appropriate
- Clean JSX with no conditional expressions
- Semantic HTML throughout

---

## **🔄 Implementation Notes**

### **Approach:**

- **Incremental**: Modify existing working code, don't rewrite
- **Quality First**: This is pre-release, prioritize getting it right
- **Tested**: Ensure each change maintains existing functionality
- **Clean**: Remove complexity while adding new capabilities

### **Order of Operations:**

1. CSS modernization and cleanup (framework agnostic)
2. Component interface additions (additive changes)
3. Code quality improvements (JSX patterns, function declarations)
4. Composability enhancements (export granular components)
5. Documentation and type updates

This specification provides comprehensive guidelines for creating a modern,
maintainable, and high-quality widget library that follows best practices while
remaining flexible and composable.
