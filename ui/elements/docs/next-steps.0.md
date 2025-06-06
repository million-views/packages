# 🚀 @m5nv/ui-elements - Next Steps to Finish Line

## 🎯 **Mission Statement**

Transform this from a good widget library to **THE BEST WIDGET LIBRARY IN TOWN**
by fixing container query implementation, removing problematic components, and
aggressively replacing demo markup with widgets.

---

## 🔥 **CRITICAL ISSUES (Fix First)**

### **1. Container Query Implementation Broken**

**Problem**: Screenshots show container queries aren’t working as advertised

- ❌ **TabGroup**: “History” tab getting cut off instead of adapting
- ❌ **List**: Descriptions still showing in “narrow container” when they should
  hide
- ❌ **ActionBar**: Overflowing instead of wrapping appropriately

**Root Cause**: Missing a clear responsive decision hierarchy — not just
arbitrary breakpoints, but a consistent “hide/show/truncate” strategy per
component and axis (horizontal or vertical). We need to reevaluate:

1. **Information Display Hierarchy** (what to hide or reveal at each threshold)
2. **Layout Strategy** (when to wrap vs. scroll vs. fully expand)
3. **Directional Overflow Styles** (how to style scrollbars)

```css
:root {
  /* Container breakpoints (CSS Level 4) based on container’s width or height */
  /* “Extra‐Small” = ≤ 320px container dimension → icons only */
  --mv-container-xs: 320px;
  /* “Small” = ≤ 375px → icons + dot badges, no full text */
  --mv-container-sm: 375px;
  /* “Medium” = ≤ 600px → icons + truncated labels + numeric badges (capped) */
  --mv-container-md: 600px;
  /* “Large” = ≤ 768px → icons + full labels + full numeric badges + sublabels */
  --mv-container-lg: 768px;
  /* “Extra‐Large” = ≤ 1024px → everything visible + extra spacing/tooltips */
  --mv-container-xl: 1024px;
}
```

Below is the **complete, updated document** using the five container breakpoints
(`320px, 375px, 600px, 768px, 1024px`), discussing both **horizontal** and
**vertical** orientations for ActionBar, TabGroup, and List. All queries are CSS
Level 4 container queries, based on the container’s size rather than the
viewport.

---

### **Level 1: Information Display Hierarchy**

> **Rationale**: At each container dimension, we decide exactly which elements
> (icons, labels, badges, descriptions) to hide or show.
>
> - **XS (≤ 320px)**: Only icons, no text or numeric badges.
> - **SM (≤ 375px)**: Icons + a small “dot” badge if needed; hide full text and
>   numeric badges.
> - **MD (≤ 600px)**: Icons + truncated labels (ellipsis) + numeric badges
>   (capped at “99+”); hide descriptions/sublabels.
> - **LG (≤ 768px)**: Icons + full labels + full numeric badges +
>   sublabels/descriptions.
> - **XL (≤ 1024px)**: Everything visible; add extra spacing or tooltips/hover
>   states.

```css
/* ────────────────────────────────────────────────────────────────────────── */
/* 1A) “XS” (dimension ≤ 320px) → Icons only: hide all labels, descriptions, numeric badges */
@container (width <= var(--mv-container-xs)), 
           (height <= var(--mv-container-xs)) {
  /* ActionBar, TabGroup, List items all hide text & numeric badges at ≤ 320px */
  .mv-action__label,
  .mv-list__item-description,
  .mv-tab__label,
  .mv-tab__external,
  .mv-action__badge,
  .mv-list__badge,
  .mv-tab__badge,
  .mv-action__sublabel,
  .mv-tab__sublabel {
    display: none;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1B) “SM” (dimension ≤ 375px) → Icons + dot badge: hide full labels/descriptions & numeric badges */
@container (width <= var(--mv-container-sm)), 
           (height <= var(--mv-container-sm)) {
  /* Hide any full-text labels or descriptions */
  .mv-action__label,
  .mv-list__item-description,
  .mv-tab__label,
  .mv-tab__external,
  .mv-action__badge,
  .mv-list__badge,
  .mv-tab__badge,
  .mv-action__sublabel,
  .mv-tab__sublabel {
    display: none;
  }
  /* If a “badge-dot” element exists, show it (small circle indicating a badge) */
  .mv-badge-dot {
    display: inline-block;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1C) “MD” (dimension ≤ 600px) → Icons + truncated labels + numeric badges capped; hide descriptions/sublabels */
@container (width <= var(--mv-container-md)), 
           (height <= var(--mv-container-md)) {
  /* Hide descriptions and any external‐link icons beyond primary tab label */
  .mv-list__item-description,
  .mv-tab__external {
    display: none;
  }

  /* Show primary labels truncated with ellipsis (max ~4 characters) */
  .mv-action__label,
  .mv-tab__label {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 4ch;
  }

  /* Show numeric badges, but ensure they’re capped in markup/JS (e.g., “99+”) */
  .mv-action__badge,
  .mv-tab__badge,
  .mv-list__badge {
    display: inline-block;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 10px;
    text-align: center;
    overflow: hidden;
  }

  /* Hide any sublabels or secondary text */
  .mv-action__sublabel,
  .mv-tab__sublabel {
    display: none;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1D) “LG” (dimension ≤ 768px) → Icons + full labels + full numeric badges + sublabels/descriptions */
@container (width <= var(--mv-container-lg)), 
           (height <= var(--mv-container-lg)) {
  /* Show primary labels, allow wrapping */
  .mv-action__label,
  .mv-tab__label {
    display: inline-block;
    white-space: normal;
  }

  /* Show numeric badges with padding to fit 2–3 digits */
  .mv-action__badge,
  .mv-tab__badge,
  .mv-list__badge {
    display: inline-block;
    padding: 0 4px;
    font-size: 12px;
  }

  /* Show sublabels or descriptions where applicable */
  .mv-action__sublabel,
  .mv-tab__sublabel,
  .mv-list__item-description {
    display: inline-block;
    font-size: 12px;
    color: var(--mv-color-secondary);
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 1E) “XL” (dimension ≤ 1024px) → Everything visible; extra spacing & tooltips allowed */
@container (width <= var(--mv-container-xl)), 
           (height <= var(--mv-container-xl)) {
  /* Increase gaps for greater breathing room */
  .mv-actionbar,
  .mv-tabs,
  .mv-list {
    gap: var(--mv-space-sm);
  }

  /* All labels, badges, sublabels, descriptions remain visible */
  .mv-action__label,
  .mv-action__badge,
  .mv-action__sublabel,
  .mv-list__item-description,
  .mv-list__badge,
  .mv-tab__label,
  .mv-tab__badge,
  .mv-tab__sublabel,
  .mv-tab__external {
    display: inline-block;
  }

  /* Optionally show hover tooltips for longer labels */
  .mv-action__label[data-tooltip]:hover::after,
  .mv-tab__label[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(–50%);
    background: var(--mv-color-surface-elevated);
    color: var(--mv-color-on-surface);
    padding: 4px 8px;
    border-radius: var(--mv-radius-sm);
    white-space: nowrap;
    font-size: 12px;
    box-shadow: var(--mv-shadow-sm);
  }
}
```

---

### **Level 2: Layout Strategy by Component Nature**

> **Note**: In all examples below, you must set `container-type` on the parent
> wrapper.
>
> - **Horizontal‐oriented** components use `container-type: inline-size;` (they
>   “watch” width).
> - **Vertical‐oriented** components use `container-type: size;` (they “watch”
>   height).

---

#### **ActionBar**

An ActionBar can be laid out **horizontally** (row of buttons) or **vertically**
(column of buttons). Apply the same “hide/show/truncate” rules (Level 1) on the
relevant axis, and choose whether to **wrap** or **scroll** when under each
threshold.

##### 2.1 Horizontal ActionBar

```css
/* Base: Horizontal ActionBar sets itself as an inline-size container */
.mv-actionbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap; /* initially no wrap */
  gap: var(--mv-space-xs);
  container-type: inline-size; /* allows @container (width <= …) */
}

/* ─ 2A) ≤ 320px width: icons only (Level 1A already hides labels & badges) */

/* ─ 2B) ≤ 375px width: icons + dot badge only (Level 1B hides full labels & numeric badges) */
@container mv-actionbar (width <= var(--mv-container-sm)) {
  /* If we want wrapping at this narrow size: */
  .mv-actionbar {
    flex-wrap: wrap; /* icons can flow to next line */
    gap: var(--mv-space-xs);
  }
}

/* ─ 2C) ≤ 600px width: icons + truncated labels + numeric badges (Level 1C already handles hide/show) */
/* Optionally force horizontal scroll instead of wrap: */
@container mv-actionbar (width <= var(--mv-container-md)) {
  .mv-actionbar {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .mv-actionbar .mv-action__button {
    display: inline-block;
    flex-shrink: 0; /* prevent collapse */
  }
  .mv-actionbar::-webkit-scrollbar {
    height: 6px;
  }
  .mv-actionbar::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
    border-radius: var(--mv-radius-sm);
  }
  .mv-actionbar::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
    transition: background var(--mv-transition-fast);
  }
  .mv-actionbar::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
}

/* ─ 2D) ≤ 768px width: icons + full labels + full badges + sublabels (Level 1D applies) */

/* ─ 2E) ≤ 1024px width: everything + extra spacing/tooltips (Level 1E applies) */

/* > 1024px: desktop view (larger font, more padding, possible keyboard‐shortcut hints) */
```

##### 2.2 Vertical ActionBar

```css
/* Base: Vertical ActionBar watches height */
.mv-actionbar--vertical {
  display: flex;
  flex-direction: column;
  gap: var(--mv-space-xs);
  container-type: size; /* allows @container (height <= …) */
}

/* ─ 2A) ≤ 320px height: icons only (Level 1A hides labels & badges) */
/* ─ 2B) ≤ 375px height: icons + dot badge (Level 1B hides full labels & numeric badges) */
/* ─ 2C) ≤ 600px height: icons + truncated labels + numeric badges (Level 1C applies) */

/* ─ 2D) ≤ 768px height: icons + full labels + full badges + sublabels (Level 1D applies) */

/* ─ 2E) ≤ 1024px height: everything + extra spacing/tooltips (Level 1E applies) */

/* Vertical scroll if container too short: */
@container mv-actionbar--vertical (height <= var(--mv-container-md)) {
  .mv-actionbar--vertical {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }
  .mv-actionbar--vertical::-webkit-scrollbar {
    width: 6px;
  }
  .mv-actionbar--vertical::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-actionbar--vertical::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-actionbar--vertical::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-actionbar--vertical .mv-action__button {
    flex-shrink: 0;
    min-height: fit-content;
  }
}
```

---

#### **TabGroup**

Tabs can be rendered **horizontally** (row of tabs) or **vertically** (sidebar
of tabs). Use the same axis‐dependent container queries:

##### 3.1 Horizontal Tabs (row)

```css
/* Base: Horizontal Tabs watch width */
.mv-tabs {
  display: flex;
  flex-direction: row;
  gap: var(--mv-space-xs);
  container-type: inline-size;
}

/* ─ 3A) ≤ 320px width: icons only (Level 1A hides tab labels & badges) */
/* ─ 3B) ≤ 375px width: icons + dot badge only (Level 1B applies) */
/* ─ 3C) ≤ 600px width: icons + truncated labels + numeric badges (Level 1C applies) */

/* Force horizontal scroll at ≤ 600px width: */
@container mv-tabs (width <= var(--mv-container-md)) {
  .mv-tabs {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
  }
  .mv-tabs::-webkit-scrollbar {
    height: 4px;
  }
  .mv-tabs::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-tab {
    flex-shrink: 0;
    min-width: fit-content;
  }
}

/* ─ 3D) ≤ 768px width: icons + full labels + badges + descriptions (Level 1D applies) */
/* ─ 3E) ≤ 1024px width: everything + extra spacing/tooltips (Level 1E applies) */
```

##### 3.2 Vertical Tabs (column)

```css
/* Base: Vertical Tabs watch height */
.mv-tabs--vertical {
  display: flex;
  flex-direction: column;
  gap: var(--mv-space-xs);
  container-type: size;
}

/* ─ 3A) ≤ 320px height: icons only (Level 1A hides labels & badges) */
/* ─ 3B) ≤ 375px height: icons + dot badge (Level 1B applies) */
/* ─ 3C) ≤ 600px height: icons + truncated labels + numeric badges (Level 1C applies) */
/* ─ 3D) ≤ 768px height: icons + full labels + badges + descriptions (Level 1D applies) */
/* ─ 3E) ≤ 1024px height: everything + extra spacing/tooltips (Level 1E applies) */

/* Vertical scroll at ≤ 600px height: */
@container mv-tabs--vertical (height <= var(--mv-container-md)) {
  .mv-tabs--vertical {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }
  .mv-tabs--vertical::-webkit-scrollbar {
    width: 6px;
  }
  .mv-tabs--vertical::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-tabs--vertical::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs--vertical::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-tab {
    flex-shrink: 0;
    min-height: fit-content;
  }
}
```

---

#### **List**

Lists can be arranged **vertically** (default) or **horizontally** (like a
carousel or row of cards). Again, apply the same breakpoints to the relevant
axis.

##### 4.1 Vertical List (column)

```css
/* Base: Vertical List watches height */
.mv-list {
  display: flex;
  flex-direction: column;
  gap: var(--mv-space-xs);
  container-type: size;
}

/* ─ 4A) ≤ 320px height: minimal info—hide item descriptions, badges, sublabels (Level 1A) */
/* ─ 4B) ≤ 375px height: thumbnails/icons + dot badge (Level 1B applies) */
/* ─ 4C) ≤ 600px height: thumbnails/icons + truncated titles + numeric badges; hide sublabels (Level 1C applies) */
/* ─ 4D) ≤ 768px height: thumbnails/icons + full titles + badges + sublabels (Level 1D applies) */
/* ─ 4E) ≤ 1024px height: everything + extra spacing/tooltips (Level 1E applies) */

/* Vertical scroll when too short (≤ 600px height): */
@container mv-list (height <= var(--mv-container-md)) {
  .mv-list {
    overflow-y: auto;
    scrollbar-width: thin;
  }
  .mv-list::-webkit-scrollbar {
    width: 6px;
  }
  .mv-list::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-list::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-list::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-list__item {
    flex-shrink: 0;
    min-height: fit-content;
  }
}
```

##### 4.2 Horizontal List (row)

```css
/* Base: Horizontal List watches width */
.mv-list--horizontal {
  display: flex;
  flex-direction: row;
  gap: var(--mv-space-xs);
  container-type: inline-size;
}

/* ─ 4A) ≤ 320px width: show only thumbnail/icon, hide title/description/badge (Level 1A) */
/* ─ 4B) ≤ 375px width: show thumbnail + dot badge, hide full text & numeric badge (Level 1B applies) */
/* ─ 4C) ≤ 600px width: show thumbnail + truncated title + numeric badge; hide description (Level 1C applies) */
/* ─ 4D) ≤ 768px width: show thumbnail + full title + badge + description (Level 1D applies) */
/* ─ 4E) ≤ 1024px width: everything + extra spacing/tooltips (Level 1E applies) */

/* Horizontal scroll at ≤ 600px width: */
@container mv-list--horizontal (width <= var(--mv-container-md)) {
  .mv-list--horizontal {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
  }
  .mv-list--horizontal::-webkit-scrollbar {
    height: 6px;
  }
  .mv-list--horizontal::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-list--horizontal::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-list--horizontal::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-list__item {
    flex-shrink: 0;
    min-width: fit-content;
  }
}
```

---

### **Level 3: Directional Overflow with Style**

> **Rationale**: Provide a consistent, polished scroll experience whenever a
> component overflows instead of wrapping.

```css
/* Horizontal Scroll Components (e.g. TabGroup, horizontal ActionBar, horizontal List) */
.mv-horizontal-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
    border-radius: var(--mv-radius-sm);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
    transition: background var(--mv-transition-fast);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
}

/* Vertical Scroll Components (e.g. vertical List, long scrollable content) */
.mv-vertical-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  &::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
    transition: background var(--mv-transition-fast);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
}
```

---

## **Rationale Summary for Container‐Based Breakpoints**

1. **`--mv-container-xs: 320px`**

   - **When ≤ 320px**: Hide all text and numeric badges—only show icons.
   - **Why?** At ≤ 320px, virtually no room for labels; text would wrap or clip.
     Icons ensure a clean, touch‐sized UI.

2. **`--mv-container-sm: 375px`**

   - **When ≤ 375px**: Icons + dot badge (no text, no numeric badges).
   - **Why?** 321–375px covers most smaller smartphones in portrait. A tiny dot
     signals “there’s something to see” without full text.

3. **`--mv-container-md: 600px`**

   - **When ≤ 600px**: Icons + truncated labels (ellipsis) + numeric badges
     (capped at “99+”); hide descriptions/sublabels.
   - **Why?** Smartphones in landscape and small tablets in portrait can
     accommodate text, but we must truncate to avoid overflow.

4. **`--mv-container-lg: 768px`**

   - **When ≤ 768px**: Icons + full labels + full numeric badges +
     sublabels/descriptions.
   - **Why?** 601–768px covers tablet portrait. There’s ample room for complete
     text.

5. **`--mv-container-xl: 1024px`**

   - **When ≤ 1024px**: Everything visible; extra spacing, hover tooltips,
     keyboard‐shortcut hints allowed.
   - **Why?** 769–1024px includes tablet landscape and small laptops—time to
     present the full UI.

- **Beyond 1024px**, treat as “desktop‐full” context: larger fonts, more
  spacing, optional extras like sublabels, tooltips, or shortcut hints.

---

## **Key Takeaways**

1. **Axis Matters**

   - **Horizontal components** ⇒ use `@container (width <= …)` with
     `container-type: inline-size;`
   - **Vertical components** ⇒ use `@container (height <= …)` with
     `container-type: size;`

2. **Consistent Breakpoints**

   - Use the same five thresholds (320, 375, 600, 768, 1024) on the relevant
     axis so that ActionBar, Tabs, and List share a predictable “hide/show”
     hierarchy.

3. **Information Display First**

   - Always start by determining which elements (icons, labels, badges,
     descriptions) need to be hidden or revealed at each threshold.

4. **Layout Strategy Second**

   - Decide whether to **wrap** or **scroll** when under each breakpoint:

     - **ActionBar** (horizontal) can wrap at ≤ 375px or scroll at ≤ 600px.
     - **TabGroup** (horizontal) uses scroll‐only at ≤ 600px—tabs never wrap.
     - **List** (vertical) switches to vertical scroll at ≤ 600px; **List**
       (horizontal) switches to horizontal scroll at ≤ 600px.

5. **Directional Overflow Third**

   - Style scrollbars consistently (thin, custom colors, smooth scrolling, hover
     states) via shared `.mv-horizontal-scroll` and `.mv-vertical-scroll`
     classes.

By following these guidelines, **every** ActionBar, TabGroup, and List component
will correctly adapt to its parent container’s size—whether laid out
horizontally or vertically—avoiding cut‐offs, overflow, or unnecessary
whitespace.

### **2. Navigation Component is Problematic**

**Problem**: Navigation causing ActionBar issues in ecommerce.tsx and
showcase.tsx

**Solution**: **REMOVE Navigation from widget library entirely**

- ✅ Replace with flexible header composition using building blocks
- ✅ Each demo page composes its own header as needed
- ✅ Demonstrates real-world composability: Header + Brand + (optional
  SearchBox) + ActionBar

**Implementation Benefits**:

- **Flexible**: Each page gets exactly what it needs
- **Realistic**: Shows how developers actually build headers
- **Composable**: Demonstrates building-block approach
- **Maintainable**: No complex component with too many responsibilities

### **3. Container Query CSS Architecture Issues**

**Problem**: Inconsistent container setup and targeting

**Fix**: Ensure every responsive component has proper container setup

```css
/* PATTERN: Every responsive component needs this structure */
.mv-component-container {
  container-type: inline-size;
  container-name: component;
}

@container component (max-width: var(--mv-container-sm)) {
  .mv-component {
    /* adaptations */
  }
}
```

---

## 📋 **DETAILED ACTION PLAN**

### **Phase 1: Fix Container Queries (Days 1-2)**

#### **A. Standardize Breakpoints**

```css
/* Update styles.css with consistent breakpoints */
:root {
  /* Container breakpoints (CSS Level 4) based on container’s width or height */
  /* “Extra‐Small” = ≤ 320px container dimension → icons only */
  --mv-container-xs: 320px;
  /* “Small” = ≤ 375px → icons + dot badges, no full text */
  --mv-container-sm: 375px;
  /* “Medium” = ≤ 600px → icons + truncated labels + numeric badges (capped) */
  --mv-container-md: 600px;
  /* “Large” = ≤ 768px → icons + full labels + full numeric badges + sublabels */
  --mv-container-lg: 768px;
  /* “Extra‐Large” = ≤ 1024px → everything visible + extra spacing/tooltips */
  --mv-container-xl: 1024px;
}
```

#### **B. Fix TabGroup Container Queries**

#### **C. Fix List Container Queries**

#### **D. Fix ActionBar Wrapping**

### **Phase 2: Remove Navigation Component (Day 3)**

#### **A. Remove from Widget Library**

- ✅ Delete Navigation component from index.tsx
- ✅ Remove Navigation CSS from styles.css
- ✅ Update type exports

#### **B. Replace Navigation with Flexible Header Composition**

Each demo page composes its own header using building blocks as needed:

**ecommerce.tsx**: Needs search functionality

```tsx
// REMOVE: <Navigation brand={...} items={...} actions={...} />
// REPLACE: Page-specific composition
<Header design={{ variant: "raised" }}>
  <Brand title="ShopDemo Pro" icon="🛍️" />
  <SearchBox placeholder="Search products..." /> // ✅ Needed for ecommerce
  <ActionBar actions={shopActions} design={{ position: "right" }} />
</Header>;
```

**dashboard.tsx**: No search needed, different actions

```tsx
<Header design={{ variant: "raised" }}>
  <Brand title="Analytics Dashboard" icon="📊" />
  <ActionBar actions={dashboardActions} design={{ position: "right" }} />
</Header>;
```

**showcase.tsx**: Minimal header, just branding

```tsx
<Header design={{ variant: "raised" }}>
  <Brand title="Container Demo" icon="🚀" />
</Header>;
```

**settings.tsx**: Settings-specific composition

```tsx
<Header design={{ variant: "raised" }}>
  <Brand title="Settings" icon="⚙️" />
  <ActionBar actions={settingsActions} design={{ position: "right" }} />
</Header>;
```

### **Phase 3: Aggressive Markup Replacement (Days 4-5)**

#### **A. Replace Manual Status Badges**

```tsx
// BEFORE: Manual status badge
<span className={`status-badge status-badge--${status.toLowerCase()}`}>
  {status}
</span>

// AFTER: Use Button with design props
<Button 
  design={{ 
    variant: "filled", 
    intent: status === "Active" ? "success" : "warning",
    size: "sm" 
  }}
>
  {status}
</Button>
```

#### **B. Replace Custom Metric Cards**

```tsx
// BEFORE: Manual metric card markup
<div className="metric-card">
  <div className="metric-value">{value}</div>
  <div className="metric-label">{label}</div>
</div>

// AFTER: Use Card + consistent structure
<Card design={{ variant: "elevated", padding: "md" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "var(--mv-space-sm)" }}>
    <span style={{ fontSize: "2rem" }}>{icon}</span>
    <div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</div>
      <div style={{ color: "var(--mv-color-text-secondary)" }}>{label}</div>
    </div>
  </div>
</Card>
```

#### **C. Replace Form Elements**

```tsx
// BEFORE: Manual form styling
<input className="form-input" />

// AFTER: Use SearchBox or create Input widget
<SearchBox 
  design={{ variant: "outline" }}
  placeholder="Enter value..."
/>
```

#### **D. Replace Custom Grids with ActionBar/List**

```tsx
// BEFORE: Manual grid of buttons
<div className="grid grid--auto-fit">
  {items.map(item => <button key={item.id}>{item.label}</button>)}
</div>

// AFTER: Use ActionBar with data
<ActionBar 
  actions={items.map(item => ({ id: item.id, label: item.label, icon: item.icon }))}
  design={{ orientation: "horizontal", density: "comfortable" }}
/>
```

### **Phase 4: Enhanced Composition Demos (Day 6)**

#### **A. Advanced ActionBar Compositions**

```tsx
// Demonstrate ActionBar versatility
const toolbarActions = [
  { id: "save", label: "Save", icon: "💾" },
  { id: "undo", label: "Undo", icon: "↩️" },
  { id: "redo", label: "Redo", icon: "↪️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

// Show multiple orientations and styles
<Card design={{ padding: "lg" }}>
  <h4>Toolbar Variations</h4>

  <ActionBar
    actions={toolbarActions}
    design={{ orientation: "horizontal", variant: "elevated" }}
  />

  <ActionBar
    actions={toolbarActions}
    design={{ orientation: "vertical", density: "compact" }}
  />
</Card>;
```

#### **B. List + Card Compositions**

```tsx
// Demonstrate List within Cards for complex layouts
<div className="grid grid--two-col">
  <Card design={{ variant: "outlined", padding: "lg" }}>
    <h4>Menu Actions</h4>
    <List
      items={menuItems}
      design={{ variant: "detailed", density: "comfortable" }}
    />
  </Card>

  <Card design={{ variant: "raised", padding: "lg" }}>
    <h4>Quick Actions</h4>
    <ActionBar
      actions={quickActions}
      design={{ orientation: "vertical", variant: "elevated" }}
    />
  </Card>
</div>;
```

### **Phase 5: Testing & Validation (Day 7)**

#### **A. Container Query Testing**

- ✅ Test each component at different container widths
- ✅ Verify TabGroup horizontal scrolling works
- ✅ Confirm List descriptions hide appropriately
- ✅ Check ActionBar wrapping vs. label hiding

#### **B. Cross-Browser Testing**

- ✅ Chrome/Edge: Container query support
- ✅ Firefox: Container query support
- ✅ Safari: Container query support (16.4+)

#### **C. Performance Testing**

- ✅ Measure CSS bundle size reduction
- ✅ Check for unnecessary re-renders
- ✅ Validate smooth animations

---

## 🎯 **SUCCESS METRICS**

### **Before vs. After**

| Metric                          | Before            | Target After       |
| ------------------------------- | ----------------- | ------------------ |
| **Container Query Reliability** | 60% working       | 100% working       |
| **Demo App Custom CSS**         | 400 lines         | 200 lines          |
| **Navigation Complexity**       | Complex component | Simple composition |
| **Widget Usage**                | 70% of markup     | 90% of markup      |
| **Responsiveness Claims**       | Partially true    | Completely true    |

### **Quality Gates**

- ✅ All container queries work as advertised
- ✅ No manual status badges or form elements
- ✅ No Navigation component usage
- ✅ TabGroup handles overflow correctly
- ✅ List hides descriptions in narrow containers
- ✅ ActionBar wraps or hides labels appropriately

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Week 1 (Critical Path)**

1. **Day 1-2**: Fix container query CSS architecture
2. **Day 3**: Remove Navigation, replace with compositions
3. **Day 4-5**: Aggressive markup replacement
4. **Day 6**: Enhanced composition demos
5. **Day 7**: Testing and validation

### **Success Criteria**

- 🎯 Screenshots show components adapting as claimed
- 🎯 Demo app uses 90%+ widget library components
- 🎯 Zero manual form styling or status badges
- 🎯 Consistent responsive behavior across all components
- 🎯 Clean, maintainable demo code

---

## 🔧 **TECHNICAL IMPLEMENTATION DETAILS**

### **Container Query Architecture**

```css
/* ──────────────────────────────────────────────────────────────────────────
   UPDATED Container Query Architecture (CSS Level 4, based on container size)
   ────────────────────────────────────────────────────────────────────────── */

/* 1) Define your container breakpoints in :root (dimension = width or height) */
:root {
  --mv-container-xs:   320px;   /* icons only */
  --mv-container-sm:   375px;   /* icons + dot badges */
  --mv-container-md:   600px;   /* icons + truncated labels + numeric badges */
  --mv-container-lg:   768px;   /* icons + full labels + full badges + sublabels */
  --mv-container-xl:  1024px;   /* everything visible + extra spacing/tooltips */
}

/* ──────────────────────────────────────────────────────────────────────────
   2) STANDARD PATTERN FOR ALL RESPONSIVE COMPONENTS
      – For a horizontal component: container-type = inline-size (watch width)
      – For a vertical   component: container-type = size        (watch height)
   ────────────────────────────────────────────────────────────────────────── */

/* Example: Horizontal ActionBar */
.mv-actionbar-container {
  container-type: inline-size;   /* “width” queries will work */
  container-name: actionbar;     /* unique identifier for @container */
}

/* Example: Vertical List */
.mv-list-container--vertical {
  container-type: size;          /* “height” queries will work */
  container-name: list-vertical;
}

/* ──────────────────────────────────────────────────────────────────────────
   3) USE @container QUERIES AT EACH BREAKPOINT (five tiers: xs, sm, md, lg, xl)
   – ≤ 320px: icons only
   – ≤ 375px: icons + dot badges (no full labels or numbers)
   – ≤ 600px: icons + truncated labels + numeric badges (capped)
   – ≤ 768px: icons + full labels + full badges + sublabels/descriptions
   – ≤ 1024px: everything visible (extra spacing/tooltips allowed)
   ────────────────────────────────────────────────────────────────────────── */

/* ── (A) ICONS ONLY: ≤ 320px ────────────────────────────────────────────────── */
@container actionbar (width <= var(--mv-container-xs)), 
           list-vertical (height <= var(--mv-container-xs)),
           tabs (width <= var(--mv-container-xs)),
           tabs-vertical (height <= var(--mv-container-xs)) {
  /* Hide any text labels, numeric badges, and sublabels */
  .mv-[component]__label,
  .mv-[component]__badge,
  .mv-[component]__sublabel,
  .mv-[component]__description {
    display: none;
  }
  /* Only the icon (e.g. .mv-[component]__icon) remains visible */
}

/* ── (B) ICONS + DOT BADGES: ≤ 375px ────────────────────────────────────────── */
@container actionbar (width <= var(--mv-container-sm)), 
           list-vertical (height <= var(--mv-container-sm)),
           tabs (width <= var(--mv-container-sm)),
           tabs-vertical (height <= var(--mv-container-sm)) {
  /* Hide full labels, numeric badges, and descriptions/sublabels */
  .mv-[component]__label,
  .mv-[component]__badge,
  .mv-[component]__sublabel,
  .mv-[component]__description {
    display: none;
  }
  /* If a “.mv-badge-dot” element exists, show that small dot */
  .mv-badge-dot {
    display: inline-block;
  }
}

/* ── (C) ICONS + TRUNCATED LABELS + NUMERIC BADGES: ≤ 600px ───────────────── */
@container actionbar (width <= var(--mv-container-md)), 
           list-vertical (height <= var(--mv-container-md)),
           tabs (width <= var(--mv-container-md)),
           tabs-vertical (height <= var(--mv-container-md)) {
  /* Hide descriptions/sublabels */
  .mv-[component]__description,
  .mv-[component]__sublabel {
    display: none;
  }
  /* Show primary labels, truncated with ellipsis (max ~4ch) */
  .mv-[component]__label {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 4ch;
  }
  /* Show numeric badges (capped at “99+” in markup/JS) */
  .mv-[component]__badge {
    display: inline-block;
    min-width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 10px;
    text-align: center;
    overflow: hidden;
  }
}

/* ── (D) ICONS + FULL LABELS + FULL BADGES + SUBLABELS: ≤ 768px ────────────── */
@container actionbar (width <= var(--mv-container-lg)), 
           list-vertical (height <= var(--mv-container-lg)),
           tabs (width <= var(--mv-container-lg)),
           tabs-vertical (height <= var(--mv-container-lg)) {
  /* Show full labels (allow wrapping) */
  .mv-[component]__label {
    display: inline-block;
    white-space: normal;
  }
  /* Show numeric badges with padding to accommodate 2–3 digits */
  .mv-[component]__badge {
    display: inline-block;
    padding: 0 4px;
    font-size: 12px;
  }
  /* Show sublabels or secondary descriptions */
  .mv-[component]__sublabel,
  .mv-[component]__description {
    display: inline-block;
    font-size: 12px;
    color: var(--mv-color-secondary);
  }
}

/* ── (E) EVERYTHING VISIBLE + EXTRAS: ≤ 1024px ─────────────────────────────── */
@container actionbar (width <= var(--mv-container-xl)), 
           list-vertical (height <= var(--mv-container-xl)),
           tabs (width <= var(--mv-container-xl)),
           tabs-vertical (height <= var(--mv-container-xl)) {
  /* Increase gaps for breathing room */
  .mv-actionbar-container,
  .mv-list-container--vertical,
  .mv-tabs {
    gap: var(--mv-space-sm);
  }
  /* Ensure all labels, badges, sublabels, descriptions are showing */
  .mv-[component]__label,
  .mv-[component]__badge,
  .mv-[component]__sublabel,
  .mv-[component]__description {
    display: inline-block;
  }
  /* Optional: hover tooltips for longer labels */
  .mv-[component]__label[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--mv-color-surface-elevated);
    color: var(--mv-color-on-surface);
    padding: 4px 8px;
    border-radius: var(--mv-radius-sm);
    white-space: nowrap;
    font-size: 12px;
    box-shadow: var(--mv-shadow-sm);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   4) LAYOUT STRATEGY (WRAP VS. SCROLL) PER COMPONENT & ORIENTATION
   – Horizontal components wrap or scroll under certain thresholds:
     • ActionBar (row) ▶ wrap at ≤ 375px or scroll at ≤ 600px
     • TabGroup  (row) ▶ always scroll at ≤ 600px (tabs never wrap)
     • List      (row) ▶ scroll at ≤ 600px (cards/items never wrap)
   – Vertical components scroll under height constraints:
     • ActionBar (column) ▶ scroll at ≤ 600px height
     • TabGroup  (column) ▶ scroll at ≤ 600px height
     • List      (column) ▶ scroll at ≤ 600px height
   ────────────────────────────────────────────────────────────────────────── */

/* ── ActionBar (Horizontal: watch width) ──────────────────────────────────── */
@container actionbar (width <= var(--mv-container-sm)) {
  .mv-actionbar-container {
    flex-wrap: wrap;             /* allow buttons to flow to next line */
    gap: var(--mv-space-xs);
  }
}
@container actionbar (width <= var(--mv-container-md)) {
  .mv-actionbar-container {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }
  .mv-actionbar-container .mv-action__button {
    flex-shrink: 0;              /* prevent collapse */
    display: inline-block;
  }
  .mv-actionbar-container::-webkit-scrollbar {
    height: 6px;
  }
  .mv-actionbar-container::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
    border-radius: var(--mv-radius-sm);
  }
  .mv-actionbar-container::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
    transition: background var(--mv-transition-fast);
  }
  .mv-actionbar-container::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
}

/* ── ActionBar (Vertical: watch height) ──────────────────────────────────── */
@container actionbar-vertical (height <= var(--mv-container-md)) {
  .mv-actionbar-container--vertical {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }
  .mv-actionbar-container--vertical::-webkit-scrollbar {
    width: 6px;
  }
  .mv-actionbar-container--vertical::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-actionbar-container--vertical::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-actionbar-container--vertical::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-actionbar-container--vertical .mv-action__button {
    flex-shrink: 0;
    min-height: fit-content;
  }
}

/* ── TabGroup (Horizontal: watch width) ───────────────────────────────────── */
@container tabs (width <= var(--mv-container-md)) {
  .mv-tabs-container {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
  }
  .mv-tabs-container::-webkit-scrollbar {
    height: 4px;
  }
  .mv-tabs-container::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs-container::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs-container::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-tab {
    flex-shrink: 0;
    min-width: fit-content;
  }
}

/* ── TabGroup (Vertical: watch height) ────────────────────────────────────── */
@container tabs-vertical (height <= var(--mv-container-md)) {
  .mv-tabs-container--vertical {
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }
  .mv-tabs-container--vertical::-webkit-scrollbar {
    width: 6px;
  }
  .mv-tabs-container--vertical::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-tabs-container--vertical::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-tabs-container--vertical::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-tab {
    flex-shrink: 0;
    min-height: fit-content;
  }
}

/* ── List (Vertical: watch height) ───────────────────────────────────────── */
@container list-vertical (height <= var(--mv-container-md)) {
  .mv-list-container {
    overflow-y: auto;
    scrollbar-width: thin;
  }
  .mv-list-container::-webkit-scrollbar {
    width: 6px;
  }
  .mv-list-container::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-list-container::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-list-container::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-list__item {
    flex-shrink: 0;
    min-height: fit-content;
  }
}

/* ── List (Horizontal: watch width) ──────────────────────────────────────── */
@container list-horizontal (width <= var(--mv-container-md)) {
  .mv-list-container--horizontal {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    scrollbar-width: thin;
  }
  .mv-list-container--horizontal::-webkit-scrollbar {
    height: 6px;
  }
  .mv-list-container--horizontal::-webkit-scrollbar-track {
    background: var(--mv-color-surface-elevated);
  }
  .mv-list-container--horizontal::-webkit-scrollbar-thumb {
    background: var(--mv-color-border-dark);
    border-radius: var(--mv-radius-sm);
  }
  .mv-list-container--horizontal::-webkit-scrollbar-thumb:hover {
    background: var(--mv-color-primary);
  }
  .mv-list__item {
    flex-shrink: 0;
    min-width: fit-content;
  }
}
```

### **Component Replacement Strategy**

1. **Identify manual markup** in demo app
2. **Create Action[] data structures** for interactive elements
3. **Replace with appropriate widgets** (ActionBar, List, Card, Button)
4. **Test container query behavior** at different widths
5. **Validate improved maintainability**

### **Flexible Header Composition Pattern**

Each demo page composes its header using building blocks as needed:

```tsx
// FLEXIBLE PATTERN: Adapt composition to page requirements

// Ecommerce: Brand + Search + Actions
<Header design={{ variant: "raised" }}>
  <Brand title="ShopDemo Pro" icon="🛍️" />
  <SearchBox placeholder="Search products..." />
  <ActionBar actions={shopActions} />
</Header>

// Dashboard: Brand + Actions (no search needed)
<Header design={{ variant: "raised" }}>
  <Brand title="Analytics Dashboard" icon="📊" />
  <ActionBar actions={dashboardActions} />
</Header>

// Showcase: Just branding (minimal header)
<Header design={{ variant: "raised" }}>
  <Brand title="Container Demo" icon="🚀" />
</Header>

// Settings: Brand + Settings-specific actions
<Header design={{ variant: "raised" }}>
  <Brand title="Settings" icon="⚙️" />
  <ActionBar actions={settingsActions} />
</Header>
```

**Key Benefits:**

- ✅ **Flexible composition** - each page gets exactly what it needs
- ✅ **No forced standardization** - SearchBox only where needed
- ✅ **Real-world demonstration** - shows practical usage patterns
- ✅ **Building block approach** - demonstrates widget composability

---

## 🎉 **EXPECTED OUTCOME**

After implementing this plan:

1. **Container queries work perfectly** - screenshots will show components
   adapting as claimed
2. **90%+ widget usage** - minimal custom markup in demo app
3. **Flexible header composition** - each page composes what it needs from
   building blocks
4. **Simple, maintainable code** - developers can easily understand and extend
5. **Reliable responsive behavior** - components adapt consistently across
   different containers
6. **Real-world demonstration** - shows practical usage patterns, not forced
   standardization
7. **Best-in-class developer experience** - truly minimal CSS needed for complex
   UIs

**Result**: A widget library that delivers on its promise of being "THE BEST
WIDGET LIBRARY IN TOWN" through flexible composition and reliable container
queries 🚀

---

_This plan focuses on fixing the gap between claims and reality, while
aggressively demonstrating the power of composition and data-driven UI
development._
