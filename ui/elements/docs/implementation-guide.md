# @m5nv/ui-elements v2.0 - Detailed Implementation Guide

## 🎯 **Mission Statement**

Transform @m5nv/ui-elements into "the best widget library in town" with modern
architecture, performance optimization, and semantic design patterns.

---

## 📋 **Critical Architectural Decisions**

### **1. Props Architecture**

- ✅ **REMOVE `styling` prop completely** - No escape hatch, forces proper
  design system usage
- ✅ **RENAME `layout` to `design`** - More semantic and descriptive
- ✅ **Component-specific design interfaces** - Each component gets tailored
  design options
- ✅ **Separate static design from dynamic state** - Performance-first approach

### **2. Performance Rules**

**What BELONGS in `design` prop:**

- Static visual choices set once at component creation
- Semantic variants: `primary | secondary | danger`
- Size scales: `sm | md | lg`
- Visual treatments: `filled | outline | ghost`
- Layout arrangements: `horizontal | vertical`
- Density levels: `comfortable | compact`
- Elevation levels: `flat | raised | floating`

**What NEVER goes in `design` prop:**

- Loading states: `loading={boolean}`
- Selection states: `selected={boolean}`
- Validation states: `error={boolean}`
- Disabled states: `disabled={boolean}`
- Hover/Focus states: CSS pseudo-selectors only
- Progress states: `progress={number}`
- Visibility states: `open={boolean}`

### **3. Provider Pattern**

- ✅ **ElementsUiProvider** for app-level theming
- ✅ **Optional but included** to establish architectural pattern
- ✅ **Controls**: theme, palette, density, accessibility

### **4. TypeScript as Documentation**

- ✅ **Self-documenting interfaces** with rich JSDoc comments
- ✅ **Component-specific vocabularies** - no generic strings
- ✅ **Performance guidance** in type definitions

---

## 🏗️ **Implementation Steps**

### **Phase 1: Core Architecture**

#### **A. Base Type System**

```typescript
// NEW: Provider context
interface ElementsUIContext {
  theme?: "light" | "dark";
  palette?: "ghibli" | "blue" | "purple" | "green" | "orange";
  density?: "comfortable" | "compact";
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
}

// REMOVE: Old BaseProps with styling
// ADD: New BaseProps with responsive only
interface BaseProps {
  responsive?: boolean; // Default: true
}

// NEW: Semantic vocabulary
type Intent =
  | "primary"
  | "secondary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "upsell"
  | "selected"
  | "beta";

type Size = "sm" | "md" | "lg";
type Density = "comfortable" | "compact";
type Orientation = "horizontal" | "vertical";
```

#### **B. Component-Specific Design Interfaces**

**Button:**

```typescript
interface ButtonProps extends BaseProps {
  children: React.ReactNode;

  // 🎨 STATIC DESIGN - Set once, rarely change
  design?: {
    /** Visual role - primary brand action vs secondary action */
    variant?: "filled" | "outline" | "ghost";
    /** Semantic intent - drives color and meaning */
    intent?: "primary" | "secondary" | "success" | "warning" | "danger";
    /** Physical scale - layout hierarchy */
    size?: "sm" | "md" | "lg";
  };

  // ⚡ DYNAMIC STATE - Changes frequently during interaction
  /** Loading state during async operations */
  loading?: boolean;
  /** Disabled state based on form validity */
  disabled?: boolean;
  /** Badge count for notifications */
  badge?: number;

  // Event handlers
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
}
```

**ActionBar:**

```typescript
interface ActionBarProps extends BaseProps {
  actions: Action[];

  // 🎨 STATIC DESIGN - Layout structure decisions
  design?: {
    /** Layout flow direction */
    orientation?: "horizontal" | "vertical";
    /** Alignment within container */
    position?: "left" | "center" | "right";
    /** Spacing density */
    density?: "comfortable" | "compact";
    /** Visual treatment */
    variant?: "default" | "elevated";
  };

  // Event handlers
  onActionClick?: (action: Action) => void;
}
```

**Input/SearchBox:**

```typescript
interface SearchBoxProps extends BaseProps {
  value?: string;
  placeholder?: string;

  // 🎨 STATIC DESIGN - Visual treatment
  design?: {
    /** Background treatment */
    variant?: "filled" | "outline";
    /** Physical scale */
    size?: "sm" | "md" | "lg";
  };

  // ⚡ DYNAMIC STATE - Form interaction state
  /** Validation error state */
  error?: boolean;
  /** Search in progress */
  loading?: boolean;
  /** Form disabled state */
  disabled?: boolean;

  // Behaviors
  clearable?: boolean;
  expandable?: boolean;

  // Event handlers
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
}
```

**List:**

```typescript
interface ListProps extends BaseProps {
  items: MenuItem[];

  // 🎨 STATIC DESIGN - Layout structure
  design?: {
    /** Content arrangement */
    orientation?: "horizontal" | "vertical";
    /** Visual density */
    density?: "comfortable" | "compact";
    /** Information detail level */
    variant?: "default" | "detailed";
  };

  // ⚡ DYNAMIC STATE - Selection state
  /** Multi-selection capability */
  selectable?: boolean;
  /** Currently selected items */
  selectedItems?: string[];

  // Event handlers
  onItemClick?: (item: MenuItem) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}
```

**Table:**

```typescript
interface TableProps extends BaseProps {
  columns: TableColumn[];
  data: any[];

  // 🎨 STATIC DESIGN - Presentation style
  design?: {
    /** Visual treatment */
    variant?: "default" | "striped" | "bordered";
    /** Row/cell spacing */
    density?: "comfortable" | "compact";
    /** Text/element scale */
    size?: "sm" | "md" | "lg";
  };

  // ⚡ DYNAMIC STATE - Interactive state
  /** Sorting capability */
  sortable?: boolean;
  /** Selection capability */
  selectable?: boolean;
  /** Currently selected rows */
  selectedRows?: any[];

  // Event handlers
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}
```

**Card:**

```typescript
interface CardProps extends BaseProps {
  children: React.ReactNode;

  // 🎨 STATIC DESIGN - Visual hierarchy
  design?: {
    /** Visual depth/prominence */
    elevation?: "flat" | "raised" | "floating";
    /** Internal spacing */
    padding?: "none" | "sm" | "md" | "lg";
    /** Visual treatment */
    variant?: "default" | "outlined" | "glass";
  };

  // ⚡ DYNAMIC STATE - Status indication
  /** Selection state in card grids */
  selected?: boolean;
  /** Loading state for card content */
  loading?: boolean;
  /** Error state for card content */
  error?: boolean;
}
```

#### **C. Provider Implementation**

```typescript
// Context definition
const ElementsUIContext = React.createContext<ElementsUIContext | null>(null);

// Provider component
interface ElementsUIProviderProps {
  children: React.ReactNode;
  theme?: "light" | "dark";
  palette?: "ghibli" | "blue" | "purple" | "green" | "orange";
  density?: "comfortable" | "compact";
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
}

function ElementsUIProvider({
  children,
  theme = "light",
  palette = "ghibli",
  density = "comfortable",
  accessibility = {},
}: ElementsUIProviderProps) {
  // Implementation with CSS custom property updates
}

// Hook for consuming context
function useElementsUI() {
  const context = useContext(ElementsUIContext);
  return context || {}; // Graceful fallback when no provider
}
```

### **Phase 2: Component Updates**

#### **A. Update All Components**

For each component:

1. **Remove `styling` prop** completely
2. **Rename `layout` to `design`**
3. **Create component-specific design interface**
4. **Separate dynamic state props**
5. **Add JSDoc comments** explaining design vs state
6. **Update internal logic** to use new prop structure

#### **B. Granular Component Exports**

Keep existing granular components:

- `Action` - Individual action for composition
- `TabItem` - Individual tab for composition

Add JSDoc explaining composition patterns:

```typescript
/**
 * Action - Individual action component for granular composition
 *
 * @example
 * // Full ActionBar widget
 * <ActionBar actions={actions} onActionClick={handleClick} />
 *
 * // Individual Action for custom layouts
 * <Action
 *   action={{ id: 'save', label: 'Save', icon: '💾' }}
 *   onClick={handleSave}
 *   design={{ variant: 'filled', intent: 'primary' }}
 * />
 */
```

### **Phase 3: CSS Updates**

#### **A. Expand Semantic Classes**

Update CSS to support expanded intent vocabulary:

```css
@layer components {
  .mv-button {
    /* Base button styles */

    /* Intent-based styling */
    &--primary {
      /* primary brand actions */
    }
    &--secondary {
      /* supporting actions */
    }
    &--success {
      /* positive confirmations */
    }
    &--warning {
      /* attention needed */
    }
    &--danger {
      /* destructive actions */
    }
    &--upsell {
      /* promotional actions */
    }
    &--selected {
      /* current selection */
    }
    &--beta {
      /* experimental features */
    }
    &--neutral {
      /* default balanced */
    }

    /* Variant-based styling */
    &--filled {
      /* strong prominence */
    }
    &--outline {
      /* medium prominence */
    }
    &--ghost {
      /* subtle prominence */
    }
  }
}
```

#### **B. Provider CSS Integration**

Add CSS custom property integration:

```css
:root {
  /* Default values */
  --mv-theme: light;
  --mv-palette: ghibli;
  --mv-density: comfortable;
}

[data-theme="dark"] {
  /* Dark theme overrides */
}

[data-palette="blue"] {
  /* Blue palette overrides */
}

[data-density="compact"] {
  /* Compact spacing overrides */
}
```

### **Phase 4: Examples & Documentation**

#### **A. Performance-Conscious Usage Examples**

```typescript
// ✅ GOOD - Stable design references
const primaryDesign = { variant: "filled", intent: "primary", size: "lg" };
const secondaryDesign = { variant: "outline", intent: "secondary", size: "md" };

function MyForm({ isSubmitting, isValid }) {
  return (
    <div>
      <Button
        design={primaryDesign} // Static object reference
        loading={isSubmitting} // Dynamic state
        disabled={!isValid} // Dynamic state
      >
        Submit
      </Button>

      <Button
        design={secondaryDesign} // Static object reference
        disabled={isSubmitting} // Dynamic state
      >
        Cancel
      </Button>
    </div>
  );
}

// ❌ BAD - Creates new objects every render
function MyForm({ isSubmitting, isValid }) {
  return (
    <Button
      design={{
        variant: "filled",
        intent: isSubmitting ? "loading" : "primary", // State in design!
      }}
    >
      Submit
    </Button>
  );
}
```

#### **B. Provider Usage Examples**

```typescript
// App level - set once
function App() {
  return (
    <ElementsUIProvider
      theme="dark"
      palette="blue"
      density="compact"
      accessibility={{ highContrast: true }}
    >
      <MyApplication />
    </ElementsUIProvider>
  );
}

// Component level - pure design semantics
function Dashboard() {
  return (
    <div>
      <Button design={{ variant: "filled", intent: "primary", size: "lg" }}>
        Get Started
      </Button>

      <ActionBar
        actions={actions}
        design={{ orientation: "vertical", density: "compact" }}
      />

      <Table
        columns={columns}
        data={data}
        design={{ variant: "striped", density: "comfortable" }}
      />
    </div>
  );
}
```

---

## 🎯 **Quality Gates**

### **Code Quality**

- [ ] All components use `design` prop instead of `layout`
- [ ] No `styling` prop anywhere in codebase
- [ ] All dynamic state separated from design props
- [ ] Component-specific design interfaces (no generic objects)
- [ ] Rich JSDoc comments on all interfaces
- [ ] Provider pattern implemented and optional

### **Performance**

- [ ] No object creation in render functions
- [ ] Design props contain only static choices
- [ ] Dynamic state uses separate props
- [ ] Stable object references in examples

### **CSS Modernization**

- [ ] Cascade layers: `@layer base, components, utilities`
- [ ] Native CSS nesting throughout
- [ ] Modern CSS features: `color-mix()`, `:has()`, logical properties
- [ ] Expanded semantic vocabulary support
- [ ] Provider integration with CSS custom properties

### **Developer Experience**

- [ ] TypeScript interfaces are self-documenting
- [ ] Clear performance guidance in JSDoc
- [ ] Rich examples showing best practices
- [ ] Migration guide updated with new patterns

---

## 📦 **File Checklist**

### **To Update:**

- [ ] `src/index.tsx` - Component implementations
- [ ] `styles.css` - CSS with expanded vocabulary
- [ ] `package.json` - Version bump to 2.0.0
- [ ] Migration guide - New API patterns

### **To Create:**

- [ ] Provider implementation
- [ ] Performance examples
- [ ] Best practices documentation

---

## 🚀 **Migration Strategy**

### **Breaking Changes**

- `styling` prop removed (breaking)
- `layout` renamed to `design` (breaking but simple find/replace)
- Some dynamic state moved to separate props (breaking)

### **Backward Compatibility**

- Most existing code works with simple prop renames
- Provider is optional - works without it
- Core functionality unchanged

### **Migration Steps for Users**

1. Replace `layout={...}` with `design={...}`
2. Remove any `styling={...}` props
3. Move dynamic state to separate props
4. Optionally add `ElementsUIProvider`

---

## 🎉 **Success Criteria**

1. **Performance**: No unnecessary re-renders from design prop changes
2. **Developer Experience**: Self-documenting TypeScript interfaces
3. **Flexibility**: Rich semantic vocabulary for all use cases
4. **Maintainability**: Clear separation between design and state
5. **Composability**: Granular components work seamlessly
6. **Modernization**: Latest CSS features and patterns

**Mission: Build the best widget library in town!** 🚀

---

**This guide should enable complete implementation of @m5nv/ui-elements v2.0
with all discussed improvements and performance optimizations.**
