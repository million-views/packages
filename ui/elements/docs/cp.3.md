# Container Query Implementation Fix - Continuation Prompt

## Context & Background

You are working on `@m5nv/ui-elements`, a React component library with
**container query support**. The USP of this library:

- each widget is designed to be `data-driven`, `opinionated` and expose only
  minimal `props` delivering value with minimal markup.
- `themable` using `custom css properties` and internally use `semantic html`
- The library has been mostly implemented but still has some ways to go before
  we can release it into the wild.

You are in the middle of fixing a React Router v7 demo application that
showcases these components, but has some lingering issues.

# ✅ COMPLETED TASKS

### Critical Fixes Applied:

1. **ActionBar Container Queries** - Fixed horizontal rendering and responsive
   behavior
2. **MegaDropdown Intelligence** - Responsive behavior with 6 adaptation levels
   (still needs some tweaks to be more adaptive)
3. **Navigation Drawer** - Increased width (380px) and descriptions now display
   properly
4. **Demo Page Cleanup** - Removed style props, consistent spacing using
   semantic classes (there may still be some stragglers)
5. **E-commerce Demo** - Fixed layout and cart functionality

### Working Features:

- ActionBar adapts: labels → icons → compact based on container width
- MegaDropdown: 5 cols → 4 cols → 3 cols → 2 cols → 1 col → list mode
- Navigation drawer shows icons, labels, AND descriptions
- Featured sections display properly

## 🎯 PENDING HIGH-PRIORITY TASKS

### 1. **Direction Prop Implementation** (USER REQUESTED)

**Goal**: Add `direction` prop for intentional vertical/horizontal layout
control

**Components to Update**:

- `ActionBar` - Primary candidate for horizontal/vertical modes
- `List` - Could benefit from horizontal card layout mode
- `TabGroup` - Vertical tabs for sidebars
- `Breadcrumbs` - Vertical breadcrumbs for narrow spaces
- `Pagination` - Vertical pagination for sidebars

**Implementation Needs**:

```typescript
interface DirectionalProps {
  direction?: "horizontal" | "vertical" | "auto"; // auto = responsive
}
```

**CSS Structure Needed**:

```css
.mv-actionbar--horizontal {
  /* flex-direction: row */
}
.mv-actionbar--vertical {
  /* flex-direction: column */
}
.mv-actionbar--auto {
  /* responsive container queries */
}
```

### 2. **Container Query Audit** (CRITICAL)

**Problem**: Other components claim container-aware behavior but may not
actually work

**Components to Test & Fix**:

- `List` - Does it hide descriptions/icons in narrow containers?
- `TabGroup` - Does it handle overflow and hide elements properly?
- `Pagination` - Does it adapt layout and hide page info?
- `Table` - Does it switch to card layout with proper data-label attributes?
- `CollapsibleSection` - Does spacing adapt to container width?

**Testing Protocol**:

1. Browser resize test - components should adapt to container, not viewport
2. Nested container test - components in narrow sidebar should adapt differently
   than full-width
3. Breakpoint verification - ensure claimed breakpoints actually trigger
4. **Do not write any test/debug code**; use human in the loop to perform manual
   testing

### 3. **Demo Page Consistency** (MEDIUM)

**Issues Identified**:

- Vertical spacing between sections inconsistent
- Cards and elements within sections not properly aligned
- Some pages still use div soup instead of semantic structure

** Demo Layout and Pages to Review**:

- `app/root.tsx` - Look for **dog-fooding** opportunities; minimize raw html
- `app/routes/layout.tsx` - Look for **dog-fooding** opportunities; minimize
  conditional JSX expressions by making use of function components.
- `app/routes/home.tsx` - Layout spacing issues
- `app/routes/showcase.tsx` - Claims vs reality verification
- `app/routes/dashboard.tsx` - Table/pagination integration
- `app/routes/settings.tsx` - May need updating to match patterns
- `app/styles/global.css` - Should demonstrate that webapps can be built with
  very little css using `@m5nv/ui-elements`

---

## 🚨 CRITICAL LAYOUT ISSUES (SCREENSHOTS PROVIDED)

### 1. **Select Component Dropdown Clipping**

- **Issue**: Select dropdown lists getting cut off/clipped by parent containers
- **Evidence**: Screenshot shows filter dropdown being clipped at bottom
- **Root Cause**: Parent container has `overflow: hidden` or incorrect
  positioning context
- **Priority**: HIGH - Users can't see all dropdown options

### 2. **Card Layout Alignment Problems**

- **Issue**: "Add to Cart" buttons not aligned across product cards
- **Evidence**: Screenshot shows buttons at different heights
- **Root Cause**: Variable content height without proper CSS Grid alignment
- **Priority**: HIGH - Unprofessional appearance

### 3. **Sidebar Layout Collapse**

- **Issue**: When "Show Filters" clicked, product grid layout breaks
- **Evidence**: Screenshot shows cards change aspect ratio/layout when sidebar
  opens
- **Root Cause**: Grid system not handling sidebar state transitions properly
- **Priority**: HIGH - Core e-commerce functionality broken

### 4. **Header Layout Structure Issues**

- **Issue**: ActionBar not properly right-aligned in header
- **Evidence**: Header layout appears unbalanced
- **User Request**: Header should use CSS Grid with named areas for proper
  control
- **Priority**: MEDIUM - Affects overall app navigation UX

### 5. **Container Query Reliability**

- **Issue**: Components claiming container-awareness may not be working properly
- **Evidence**: Layout breaks suggest responsive behavior is inconsistent
- **Priority**: HIGH - Core value proposition of the library

## ⚠️ POTENTIAL ISSUES TO MONITOR

### 1. **API Consistency**

- **Risk**: Props and behavior inconsistencies across components
- **Examples**: Some use `size`, others use `variant`; some use `responsive`,
  others don't
- **Solution**: Audit and standardize prop naming conventions

## Instructions for Continuation:

1. **Analyze provided files** thoroughly - understand current broken state
2. **Regenerate core library files** completely - don't patch, rebuild
   foundation - if issues are found.
3. **Test each container query claim** - ensure they actually work when browser
   resizes
4. **Fix demo page consistency** - ensure all pages use components properly
   (using consistent layout and spacing)
5. **Pay attention** - none of the widgets in `elements` library accept `style`
   prop; you seem to be forgetting this and start using `style` prop in the demo
   page components. Also, avoid `div soup`; ideally the demo page components
   should have as little markup as needed.

## Files You Have Access To:

- All current `@m5nv/ui-elements` source files (styles.css, index.tsx)
- All React Router v7 demo application files
- Global CSS file (`app/style/global.css`)

## Development Approach:

This is a **dog-fooding exercise** - the demo pages should be simple because the
data-driven UI elements should do the heavy lifting. Focus on making the core
library components actually work as advertised, then ensure demo pages use them
correctly.

The **dog-fooding exercise** should clearly demonstrate that application
developers need very little css to get going. So, what and how much of css is
present in `app/style/global.css` matters. Also the number of `div`s present in
the demo code matters too.

Do not generate any debugging or additional code without consulting with me. You
can use me as your manual tester. The idea here is to preserve your output
tokens to write functional code not waste it on throwaway or debug code.

**Priority**: Fix the `ActionBar` styling issues (horizontal vs vertical; be
responsive to container inline-size to display only what can fit).

## 🚀 SUCCESS CRITERIA

**Critical Layout Issues Resolved**: ✅ MegaDropdown never gets hidden behind
other elements (proper z-index)\
✅ Product card "Add to Cart" buttons align perfectly across all cards\
✅ Sidebar "Show Filters" transitions without breaking product grid layout\
✅ Header ActionBar properly right-aligned with clean grid structure\
✅ All responsive claims actually demonstrated when browser is resized

**When This Phase Is Complete**: ✅ ActionBar/List/Tabs can be intentionally
vertical or horizontal\
✅ All components that claim container-awareness actually demonstrate it\
✅ Demo pages have consistent, professional spacing and layout\
✅ Browser resize test passes for all major components\
✅ TypeScript compilation clean with no prop/type mismatches

**Dog-Fooding Validation**: ✅ Application developers need minimal CSS to build
professional layouts\
✅ Components work perfectly in sidebars, modals, drawers, and any container\
✅ No div soup - semantic HTML structure throughout demos\
✅ E-commerce demo works flawlessly across all screen sizes
