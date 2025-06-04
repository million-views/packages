# Container Query Implementation Fix - Continuation Prompt

## Context & Background

You are working on `@m5nv/ui-elements`, a React component library with
**comprehensive container query support**. The library has been partially
implemented but has **fundamental issues** that prevent container queries from
working properly. You are in the middle of fixing a React Router v7 demo
application that showcases these components.

## Current Problem State

The container query implementation is **fundamentally broken**. Multiple
components claim to be container-aware but don't actually adapt to their
container width. Here are the specific issues:

### Critical Issues Requiring Full Regeneration:

1. **Table Component Card Layout**:
   - Claims to switch to card layout on narrow containers with proper headers
   - Actually shows "ID: 1, Name: John Doe" instead of form-like "Name: John
     Doe, Role: Designer" cards
   - NOTE: this could be a demo page component or global styling issue because
     this feature seems to be working in the `showcase` page component

2. **CollapsibleSection Toggle**:
   - Triangle toggle doesn't work at all - clicking does nothing
   - Component logic for controlled/uncontrolled state is broken

3. **Pagination Container Queries**:
   - Broken CSS causing malformed layout
   - Should hide page numbers on narrow screens, show "Page X of Y"
   - Currently shows broken container structure

4. **ActionBar Container Queries**:
   - Claims to hide labels on narrow screens, showing only icons
   - Actually doesn't hide labels at all - no responsive behavior

5. **MegaDropdown Theme Issues**:
   - Not properly applying theme/palette colors
   - Check background surface color or opaqueness for issues

6. **Component Usage Inconsistencies**:
   - Table works in Showcase page but broken in Dashboard page
   - Suggests demo pages aren't using components consistently

## Files That Need Complete Regeneration:

### Core Library Files (PRIORITY):

- `@m5nv/ui-elements/styles.css` - **Complete container query CSS rewrite**
- `@m5nv/ui-elements/index.tsx` - **Fix component logic issues**

### Demo Application Files:

- `routes/home.tsx` - Fix layout/spacing issues
- `routes/showcase.tsx` - Make it do what it claims it does
- Review `app/styles/global.css` - Check for CSS conflicts

## Success Criteria:

When fixed, these behaviors should work:

1. **Browser resize test**: Resize browser window → components adapt container
   width
2. **Table test**: Narrow container → table switches to card layout with "Name:
   John Doe, Role: Designer" format
3. **ActionBar test**: Narrow container → labels hide, only icons show
4. **Pagination test**: Narrow container → page numbers hide, "Page X of Y"
   shows
5. **CollapsibleSection test**: Click triangle → content expands/collapses
6. **MegaDropdown test**: Theme switching → dropdown colors update properly
7. **Showcase test**: Each section does what it claims it can do

## Key Implementation Requirements:

### Container Query CSS Foundation:

```css
/* Must actually work - many are currently broken */
@container table (max-width: 400px) {
  /* Switch to card layout with proper data-label support */
}

@container actionbar (max-width: 300px) {
  /* Hide labels, show only icons */
}
```

### Component Logic Fixes:

- CollapsibleSection toggle state management
- Table `data-label` attribute injection
- Consistent prop usage across demo pages

### Navigation Structure:

- Sidebar menu items previously used {icon, title, description}; now it displays
  only the {title}. We need the old behavior back.
- Proper theme color application

## Instructions for Continuation:

1. **Analyze provided files** thoroughly - understand current broken state
2. **Regenerate core library files** completely - don't patch, rebuild
   foundation
3. **Test each container query claim** - ensure they actually work when browser
   resizes
4. **Fix demo page consistency** - ensure all pages use components properly
5. **Validate theme switching** - all components should respect theme changes

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

**Priority**: Fix the core library container query foundation first, then
address demo page issues.
