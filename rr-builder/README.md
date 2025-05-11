# Fluent Route Configuration for React Router v7

A tiny, fluent builder API to configure React Router v7 framework mode routes,
for a seamless, unified route & navigation authoring experience.

Comes with a companion CLI tool, `rr-check` to visualize, debug, and generate
navigation data for use by layout and menu components.

**Motivation:**

- **Single source of truth** for routes + navigation metadata.
- **Codegen**: catch errors and generate boilerplate code with `rr-check`.

## Introduction

Framework mode of _React Router v7_ lets you configure your routes as you please
in a single `routes` file in one location. This is way better than convention
based file system layout dependendant routers (, we think).

The downside is that as the app grows, managing deeply nested React Router
configs—and keeping navigation menus in sync—becomes tedious and error‑prone.

Typical chores in maintaining the `routes` file include:

- Add/remove/edit path segments, index routes, and layouts.
- Augmenting route with label, icon, and section for navigation.
- Detecting duplicate IDs or mis‑configured paths before or after hitting a
  cryptic runtime error.

**rr-builder** eases these chores by providing a **fluent API** that wraps React
Router’s own `route`, `index`, `layout`, and `prefix` helpers, and stashes menu
metadata on each route’s `.handle`. A companion tool **`rr-check`** lets you
check for common mistakes such as routes with duplicate IDs and misspelled or
missing component files; and generates 'navigation' code module that helps in
reducing boiler plate code in layouts and menu components.

## Installation

Install the fluent API and CLI:

```bash
npm install @m5nv/rr-builder
```

**Peer Dependency:** This package requires **React Router v7**’s dev helpers as
a peer dependency. If your project does not already include it, install:

```bash
npm install @react-router/dev
```

## `rr-builder` API

```ts
import {
  build,
  index,
  layout,
  prefix,
  route,
  type RouteConfigEntry,
} from "@m5nv/rr-builder";
```

### `route(path, file, options?)`

- Defines a route matching `path` (or dynamic segments).
- `options` forwarded to React Router’s `route` helper (e.g. `id`,
  `caseSensitive`).

### `index(file, options?)`

- Defines an **index** route (no `path`) for its parent.

### `layout(file, options?)`

- A convenience for a wrapper without its own `path` (pure `<Outlet/>`).

### `prefix(path, builders[])`

- Prepends `path` to a batch of builders; returns an array of new builders.

### Chaining

- `.children(...builders)` attach nested routes.
- `.meta({ label?, iconName?, end?, group?, section? })` stash nav metadata on
  `.handle`.

### Extraction

- `build(builders: Builder[]): RouteConfigEntry[]` —final array for
  React Router.

## React Router API vs `rr-builder` API

<details>
<summary>React Router v7 API</summary>

```ts
import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),
  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
  ]),
  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
  ]),
] satisfies RouteConfig;
```

</details>

<details>
<summary>rr-builder API</summary>

```ts
import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

export default build([
  index("./home.tsx"),
  route("about", "./about.tsx"),
  layout("./auth/layout.tsx").children(
    route("login", "./auth/login.tsx"),
  ),
  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
  ]),
]);
```

</details>

Bottom line: **RR Builder API** is more linear, chainable, and IDE‑friendly.

# Core Concepts

If you are working with `react-router`, you already know this; just in case this
is your first encounter, here are some basic concepts you should know!

## Route vs Layout

- **`route()`**: owns a URL segment (`path`), can render its file and children
  via `<Outlet/>`.
- **`layout()`**: convenience for `route(undefined, file)`, purely a wrapper for
  its children.

## Index Routes

- Defined via `index(file)` —renders at the parent URL (`/dashboard` when under
  `/dashboard`).

## Prefixing

- `prefix(prefixPath, builders[])` spreads into multiple
  `route(prefixPath + child.path)` entries.

## Reusable Components & Custom IDs

When multiple routes use the same component file, supply unique `id`:

```ts
index("Page.tsx", { id: "users-all" });
route("active", "Page.tsx", { id: "users-active" });
```

Your component can then inspect:

```tsx
const match = useMatches().at(-1);
switch(match.id) { ... }
```

## Component‑Level (Splat) Routing

You can still mix static config with in-component `<Routes>`:

```ts
route("dashboard/*", "layout.tsx");
```

```tsx
<Outlet/>
<Routes>
  <Route index element={<Home/>}/>
  <Route path="analytics" element={<Analytics/>}/>
</Routes>
```

# Practical application of `rr-builder` and `rr-check`

## Augmented route configuration

```js
/// file: routes.js
import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

export default build([
  layout("./routes/layout.tsx").children(
    index("./routes/page.tsx")
      .meta({ label: "Home", section: "main", end: true }),
    route("settings", "routes/settings/page.tsx")
      .meta({ label: "Settings", iconName: "Settings", section: "main" }),
    layout("./routes/dashboard/layout.tsx")
      .meta({ label: "Dashboard" })
      .children(
        ...prefix("dashboard/overview", [
          index("./routes/dashboard/overview/summary.tsx")
            .meta({
              label: "Overview",
              iconName: "CircleDot",
              group: "Overview",
              section: "dashboard",
            }),
        ]),
        ...prefix("dashboard/reports", [
          route("annual", "./routes/dashboard/reports/annual.tsx")
            .meta({
              label: "Annual",
              iconName: "CalendarRange",
              group: "Reports",
            }),
        ]),
      ),
    // …add more children here as needed…
  ),
]);
```

### Partitioning and grouping navigation with `section` & `group` props

When building complex applications, it’s useful to embed metadata into your
route definitions so that UI components can render context-aware menus, footers,
or sitemaps without hard coding some of the information that is already
available in the route configuration. We accomplish this by augmenting each
route with two distinct keys in its handle (using `meta()`):

- **section** – A build-time partition key: splits the full route forest into
  disjoint sub-trees (e.g. main, dashboard, reports).

- **group** – A runtime classifier: carried through each node so UI code can
  cluster related items within a section (e.g. “Analytics” vs “Reports” panels).

### "Exact" vs "Prefix" matching, and the use of `end` prop

In general the concept of "exact" vs "prefix" matching is a fundamental pattern
in hierarchical navigation systems because it solves a common problem:

- **Prefix matching** (default): Useful for showing context - "you are somewhere
  in this section"
- **Exact matching**: Useful for precise location - "you are exactly here"

The `end` prop is useful in specific scenarios:

1. **Home or index routes** - You typically want these highlighted only when
   you're exactly on that route:

   ```js
   index("./app/home/page").meta({
     label: "Home",
     iconName: "Home",
     end: true, // Only highlighted on exact match
   });
   ```

2. **When you want to prevent a parent route from being highlighted** when
   viewing its children.

## Check configuration and generate code

`rr-check` tool can check for errors and generate code for inclusion in the
runtime bundle for use by layout and menu components.

```bash
Usage: npx rr-check <routes-file> [--print:<FLAGS>] [--out <file>] [--watch]

Arguments:
  <routes-file>             Path to your routes config file (e.g. routes.js or routes.ts).

Options:
  --print:<FLAGS>           Comma-separated list of output types (no spaces). Available flags:
                              route-tree     Print an ASCII tree of all routes.
                              nav-tree       Print an ASCII tree of navigable routes.
                              include-id     Append each node’s unique ID in the tree leaves.
                              include-path   Append each node’s URL path in the tree leaves.
  --watch                   Watch the routes-file for changes and rerun automatically.
  --out=<file>              Write code (navigationTree, useHydratedMatches()) to <file>.

Examples:
  npx rr-check routes.js --print:route-tree
  npx rr-check src/routes.js --print:nav-tree,include-path --out app/lib/navigation.js
  deno rr-check src/routes.ts --print:route-tree,include-id --watch
```

> **NOTE:** Node's native ESM loader doesn't understand .ts files. If your route
> definitions are in TypeScript, use deno:

```bash
# locate the script in your node_modules (assuming its installed locally)
# typically found in ./node_modules/@m5nv/rr-builder/src/rr-check.js
deno run --unstable-sloppy-imports --allow-read path-to/rr-check.js routes.ts
```

Alternatively, compile your routes.ts to routes.js and use:

```bash
npx rr-check routes.js
```

Or if you want to use the tool without installing the package into your project:

```bash
npx -p @m5nv/rr-builder rr-check routes.js
```

### `rr-check` for error checking

A routes configuration with no error and no options produces the following
output:

```bash
npx rr-check routes.js
✅  No errors detected
```

For the purpose of demonstration using an erroneous `routes.js` input produces
the following output.

```bash
npx rr-check routes.js

⚠️  Found 1 duplicate route ID
⚠️  Found 6 missing component files

Duplicate IDs:
  * foo appears 2 times

Missing component files:
  ! ./routes/layout.tsx
  ! ./routes/page.tsx
  ! ./routes/settings/page.tsx
  ! ./routes/dashboard/layout.tsx
  ! ./routes/dashboard/overview/summary.tsx
  ! ./routes/dashboard/reports/annual.tsx
```

We can troubleshoot where the error is by using --print option as below:

```bash
npx rr-check routes.js --print:nav-tree,include-id

⚠️  Found 1 duplicate route ID
⚠️  Found 6 missing component files

Duplicate IDs:
  * foo appears 2 times

Missing component files:
  ! ./routes/layout.tsx
  ! ./routes/page.tsx
  ! ./routes/settings/page.tsx
  ! ./routes/dashboard/layout.tsx
  ! ./routes/dashboard/overview/summary.tsx
  ! ./routes/dashboard/reports/annual.tsx
.
├── Home(*!) [id: foo]
├── Settings(!) [id: ./routes/settings/page]
└── Overview(*!) [id: foo]
    └── Annual(!) [id: ./routes/dashboard/reports/annual]
```

### `rr-check` for code generation

And finally we can ask `rr-check` to generate code that can be included in your
build for the purpose of reducing boilerplate in layout components and providing
navigation using information that is in sync with your routes configuration.
Based on the extension, `rr-check` can generate either `.ts` or `.js` output.

```bash
npx rr-check routes.js --out app/lib/navigation.generated.ts

✅  No errors detected
✏️  Generated navigation module: app/lib/navigation.generated.ts
```

The generated file for the demo `routes.js` example we are using will look as
below; subsequent sections discuss how to use this information.

```typescript
// ⚠ AUTO-GENERATED — 2025-05-07T01:11:13.421Z — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes.

import { type UIMatch, useMatches } from "react-router";
import type { NavMeta, NavTreeNode } from "@m5nv/rr-builder";

export const metaMap = new Map<string, NavMeta>([
  ["./routes/page", { "label": "Home", "section": "main", "end": true }],
  ["./routes/settings/page", {
    "label": "Settings",
    "iconName": "Settings",
    "section": "main",
  }],
  ["./routes/dashboard/layout", { "label": "Dashboard" }],
  ["./routes/dashboard/overview/summary", {
    "label": "Overview",
    "iconName": "CircleDot",
    "group": "Overview",
    "section": "dashboard",
  }],
  ["./routes/dashboard/reports/annual", {
    "label": "Annual",
    "iconName": "CalendarRange",
    "group": "Reports",
  }],
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 */
export const navigationTree: Record<string, NavTreeNode[]> = {
  "main": [
    {
      "id": "./routes/page",
      "path": "/",
      "label": "Home",
      "end": true,
    },
    {
      "id": "./routes/settings/page",
      "path": "/settings",
      "label": "Settings",
      "iconName": "Settings",
    },
  ],
  "dashboard": [
    {
      "id": "./routes/dashboard/overview/summary",
      "path": "/dashboard/overview",
      "label": "Overview",
      "iconName": "CircleDot",
      "group": "Overview",
      "children": [
        {
          "id": "./routes/dashboard/reports/annual",
          "path": "/dashboard/reports/annual",
          "label": "Annual",
          "iconName": "CalendarRange",
          "group": "Reports",
        },
      ],
    },
  ],
};

/**
 * Hook to hydrate matches with your navigation metadata
 */
export function useHydratedMatches(): Array<UIMatch<unknown, NavMeta>> {
  const matches = useMatches();
  return matches.map((match) => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match as UIMatch<unknown, NavMeta>;
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta
      ? { ...match, handle: meta }
      : match as UIMatch<unknown, NavMeta>;
  });
}
```

## Using generated `navigation` module in UI

### Layout templates

Often a layout needs to dynamically render content that is different for each
route. This can be accomplished if we could pass in extra information into the
layout at render time. In `react-router` framework mode, the recommended way is
to `export function handle()` and get to that information using `useMatches()`.
This can be tedious and the information can get scattered.

The `navigation` module exposes `useHydratedMatches()` function that injects
`meta` information found in your augmented route configuration, allowing you to
create layout templates and bread crumbs without having to write and export a
`handle()` function.

```tsx
import { Outlet, type UIMatch } from "react-router";
import { Icon } from "@/components/icon-mapper";
import { useHydratedMatches } from "@/lib/navigation.generated.ts";

/// A simple "dynamic" layout for content
export default function ContentLayout() {
  const matches = useHydratedMatches();
  const match = matches.at(-1) as RouteMatch;
  let { label, iconName } = match?.handle ??
    { label: "Who are we?", iconName: "ShieldQuestion" };
  return (
    <article className="flex flex-col">
      <h2 className="flex flex-row gap-1 p-2">
        <Icon name={iconName as string} />
        {label}
      </h2>
      <section className="flex-1">
        <Outlet />
      </section>
    </article>
  );
}
```

This layout can be reused in your routes configuration by providing unique `id`.

### Navigation Sidebars

```javascript
import { navigationTree } from "./navigation.generated.ts";

function Sidebar({ section }) {
  const items = navigationTree[section] || [];

  // cluster by `group` (default to “ungrouped”)
  const byGroup = items.reduce((acc, node) => {
    const key = node.group || "ungrouped";
    (acc[key] ||= []).push(node);
    return acc;
  }, {});

  return (
    <nav>
      {Object.entries(byGroup).map(([grp, nodes]) => (
        <SectionPanel title={grp} key={grp}>
          <MenuList items={nodes} />
        </SectionPanel>
      ))}
    </nav>
  );
}
```

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.
