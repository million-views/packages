# Icon Rendering System Implementation

Implement a centralized icon rendering system for the Navigator component with a
minimal API surface.

NOTE: The icons registry is not a concern of the Navigator and it should never
by included by the Navigator or its constituents. It should just assume that
renderIcon will do it's thing. So, the following in next/index.ts is a code
smell; and if there are other parts of the code (outside of examples) that
import the icon registry then that is also a code smell.

The key changes are:

1. **Icon Rendering in Navigator Context**
   - Add `createIconRenderer` and `LetterIcon` functions to Navigator context
     (see below)
   - Single `renderIcon` prop on Navigator for customization; make it a required
     prop and fail fast if not present

2. **Icon Registry**
   - Create registry of SVG icons in `next/icons.tsx`
   - Scan current code and move all adhoc icons defined in the code to this
     registry
   - NOTE: this icon registry should never by included by any of the Navigator
     or its constituents. The user is responsible for passing in a icons
     registry; our registry is being built to support our example code.

3. **Component Updates**
   - All components use context's `renderIcon` function
   - Support both string names (`"Menu"`) and React nodes (`<CustomIcon/>`)

4. **Simplified API**
   - Only add one new prop: `renderIcon`
   - Consistent with previous version's pattern
   - No additional configuration options

Ensure you do not introduce any type errors.

## Code for `createIconRenderer` and `LetterIcon`

```jsx
/**
 * Create a default icon renderer that displays a fallback for missing icons
 *
 * @param icons Map of icon names to rendering functions
 * @returns A function that renders an icon by name
 */
export function createIconRenderer(
  icons: Record<string, (size: number) => React.ReactNode> = {},
) {
  return (name: string, size: number = 20) => {
    if (icons[name]) {
      return icons[name](size);
    }

    // Default letter icon when icon not found
    return <LetterIcon label={name} size={size} />;
  };
}

/**
 * Create a fallback letter icon
 */
export function LetterIcon(
  { label, size = 24 }: { label: string; size?: number },
) {
  const cp = label.codePointAt(0) || 0;
  const c = String.fromCodePoint(cp).toLocaleUpperCase();
  const s = +size;
  const h = s / 2;
  const r = h - 1;
  const fs = s * 0.6;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={h} cy={h} r={r} fill="none" />
      <text
        x="50%"
        y="50%"
        dy=".35em"
        textAnchor="middle"
        fontWeight="100"
        fontFamily="system-ui"
        fontSize={fs}
      >
        {c}
      </text>
    </svg>
  );
}
```
