# Fluent Route Configuration for React Router v7

A tiny, intuitive fluent builder for React Router v7 that serves as a **single
source of truth** for both your routing configuration and navigation metadata,
plus a companion CLI tool to visualize and debug routes config for duplicate
route IDs.

## Introduction

Frameworks such as _Astro_ and _SvelteKit_ offer file based routing that mandate
following conventions in order for the scheme to work; sooner or later one has
to deal with the limitations of those conventions. On the other hand Framework
mode of _React Router v7_ lets you configure your routes as you
please.&mdash;which is great!.

The downside is that as the app grows, managing deeply nested React Router
configs—and keeping navigation menus in sync—becomes tedious and error‑prone.

Typical chores in maintaining the `routes` file include:

- Add/remove/edit path segments, index routes, and layouts.
- Augmenting route with label, icon, and section for navigation.
- Detecting duplicate IDs or mis‑configured paths before or after hitting a
  cryptic runtime error.

**rr-builder** eases these chores by providing a **fluent API** that wraps React
Router’s own `route`, `index`, `layout`, and `prefix` helpers, and stashes menu
metadata on each route’s `.handle`. A companion tool **`rr-check`** prints an
ASCII forest of your config—optionally annotating IDs and paths, and flagging
duplicates—so you can catch mistakes early.

## Motivation

- **Single source of truth** for routes + navigation metadata.
- **Familiar helper names** match React Router v7 (`route`, `index`, `layout`,
  `prefix`).
- **Fluent syntax**: resulting in fewer nested arrays, clearer intent.
- **IDE‑friendly**: autocomplete on `.children()` and `.meta()`.
- **Debug early**: catch duplicate IDs and path errors with `rr-check`.

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

#### Navigation Meta

`NavMeta` type is used to colocate data needed to render menu and navigational
UI with the route configuration. Currently it is typed as below:

```js
/**
 * @typedef {object} NavMeta
 * @property {string} [label] - Display text for the navigation item.
 * @property {string} [iconName] - Icon key for the navigation item.
 * @property {boolean} [end] - If true, active matching requires an exact path match.
 * @property {string} [group] - UI container or region for this item (e.g. 'main', 'footer', 'sidebar').
 * @property {string} [section] - Logical feature area or domain (e.g. 'dashboard', 'users').
 */
```

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

## Core Concepts

If you are working with `react-router`, you already know this; just in case this
is your first encounter, here are some basic concepts you should know!

### Route vs Layout

- **`route()`**: owns a URL segment (`path`), can render its file and children
  via `<Outlet/>`.
- **`layout()`**: convenience for `route(undefined, file)`, purely a wrapper for
  its children.

### Index Routes

- Defined via `index(file)` —renders at the parent URL (`/dashboard` when under
  `/dashboard`).

### Prefixing

- `prefix(prefixPath, builders[])` spreads into multiple
  `route(prefixPath + child.path)` entries.

### Fluent Chaining

- `.children(...)` for nesting; `.meta(...)` for nav metadata.

## Feature‑Scoped Routing

Partition your app into feature files, each exporting a Builder. Compose at the
root with .children() to keep features decoupled. For example, group related
routes in a module:

```ts
// dashboard.ts
export const dashboard = route("dashboard","./layout.tsx").children(...);

// root routes.ts
import { dashboard } from "./dashboard";
export default build([
  index("./home.tsx"),
  dashboard,
]);
```

Keeps feature boundaries clear.

## Navigation Metadata & `handle`

Stash labels/icons via `.meta()`:

```ts
route("about", "routes/about.tsx").meta({ label: "About", iconName: "Info" });
```

In your navigation UI component, read route.handle via useMatches() or
useRoutes():

```tsx
const match = useMatches().at(-1);
const { label, iconName } = match.handle ?? {};
```

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

## Resource‑Style (CRUD) Routes

In CRUD‑style workflows, you often want a **wrapper layout** that renders shared
UI (e.g. list filters, breadcrumbs) and an `<Outlet/>` for the nested pages. Use
`layout()` (or `route()` if you prefer) as that wrapper:

```ts
export default build([
  layout("routes/posts/layout.tsx")
    .children(
      // GET /posts — list view
      index("routes/posts/index.tsx"),
      // GET /posts/:postId — detail view
      route(":postId", "routes/posts/[postId].tsx"),
      // GET /posts/:postId/edit — edit view
      route(":postId/edit", "routes/posts/[postId]/edit.tsx"),
    ),
]);
```

- `routes/posts/layout.tsx` should include an `<Outlet/>` to render its
  children.
- The `index()` child becomes `/posts`, and the dynamic `route()` children map
  to `/posts/:postId` and `/posts/:postId/edit`.
- You can omit `.meta()` here if these resource routes are not navigable menu
  items.

If you don’t need a separate layout file (i.e. your index component already
renders <Outlet/>), you can use route() in place of layout(). However, when you
reuse the same component file for multiple routes, you must assign a unique id
to each to avoid collisions:

```ts
export default build([
  route("posts", "routes/posts/index.tsx", { id: "posts-wrapper" })
    .children(
      index("routes/posts/index.tsx", { id: "posts-index" }),
      route(":postId", "routes/posts/index.tsx", { id: "posts-detail" }),
      route(":postId/edit", "routes/posts/index.tsx", { id: "posts-edit" }),
    ),
]);
```

Here, the same `routes/posts/index.tsx` component acts as both the list view and
the wrapper (rendering <Outlet/>). By giving each route a distinct id, React
Router can distinguish between /posts, /posts/:postId, and /posts/:postId/edit
even though they share the same component file.

## API Routes (Data Endpoints)

For purely data‑oriented endpoints (e.g. JSON API), define routes without
layouts or navigation metadata. These routes typically export server or loader
functions rather than UI components.

```ts
export default build([
  ...prefix("api", [
    // GET /api/posts
    route("posts", "routes/api/posts.ts"),

    // GET /api/posts/:postId
    route(":postId", "routes/api/posts/[postId].ts"),

    // GET /api/users
    route("users", "routes/api/users.ts"),
  ]),
]);
```

- No `.meta()` is needed since these are not part of a UI menu.
- Each file (e.g. `routes/api/posts.ts`) exports a handler function (e.g.
  `export async function loader() { ... }`).

## `rr-check` CLI: Visualize & Debug

```bash
rr-check <routes.js> [--show-id] [--show-path]
```

- **`--show-id`**: append `(id: …)`
- **`--show-path`**: append `(path: …)`
- Flags duplicate IDs (first pass) and marks them with `*` in the tree.

**NOTE:**\
Node's native ESM loader doesn't understand `.ts` files. If your route
definitions are in TypeScript, use `deno`:

```sh
# locate the script in your node_modules (assuming its installed locally)
# typically found in ./node_modules/@m5nv/rr-builder/bin/rr-check.js
deno run --unstable-sloppy-imports --allow-read rr-check.js routes.ts
```

Alternatively, compile your `routes.ts` to `routes.js` and use:

```sh
npx rr-check routes.js
```

Or if you want to use the tool without installing the package into your project:

```sh
npx -p @m5nv/rr-builder rr-check routes.js
```

### Duplicate‑ID Detection

```
⚠ Duplicate route IDs detected: 
• users-active appears 2 times
Tree marks duplicates with *
```

## Best Practices & Tips

- **One `index()` per URL segment** for home/index pages.
- **Use `route()`** for explicit path segments; **`layout()`** for pure
  wrappers.
- **Partition features** into separate modules and compose at the root.
- **Assign custom `id`** whenever you reuse the same component file.
- **Run `check`** after significant route changes.
- **Labels/icons via `.meta()`** only on nav‑visible routes; omit on purely
  API/resource routes.

## Troubleshooting

- **Appears blank at nested paths** → ensure parent layout renders `<Outlet/>`.
- **Duplicate ID error at runtime** → run `rr-check`, fix IDs.

## License

Distributed under the MIT License. See [LICENSE](../LICENSE) for details.

---

Built with ♥ for a seamless, unified route & navigation authoring experience.
