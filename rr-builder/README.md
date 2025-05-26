# Fluent Route Configuration

A tiny, fluent builder API to configure React Router v7 framework mode routes,
for a seamless, unified route & navigation authoring experience.

> **Single‑source of truth for routes + navigation**

## 1 · Why this package exists

React‑Router v7’s **framework‑mode** is awesome, but:

- It discards extra route props, making it impossible to keep navigation/UI meta
  in sync with your route config.
- As apps grow, maintaining and extending nested RR configs by hand becomes
  tedious and error‑prone.

`@m5nv/rr-builder` lets you **author your routes and all navigation metadata in
one fluent, type-safe DSL**, and then generates a runtime‑safe module for your
layout, menus, and navigation UIs.

## 2 · Installation & Platform Support

```bash
# npm or pnpm (dev-only; nothing leaks to runtime)
npm install -D @m5nv/rr-builder
# or
pnpm add -D @m5nv/rr-builder
```

> **Peer dependency:** Make sure you have `@react-router/dev` (v7) installed as
> a peer dependency:
>
> ```bash
> npm install @react-router/dev
> ```

## 3 · Quick Start & Example

```ts
// routes.ts
import {
  build,
  external,
  index,
  layout,
  prefix,
  route,
} from "@m5nv/rr-builder";

export default build([
  layout("project/layout.tsx").children(
    route("overview", "project/overview.tsx")
      .nav({
        label: "Overview",
        iconName: "ClipboardList",
        section: "project",
      }),
    route("settings", "project/settings.tsx")
      .nav({ label: "Settings", iconName: "Settings" }),
    external("https://docs.acme.dev")
      .nav({ label: "Docs", iconName: "Book" }),
    prefix("account", [
      index("project/account/home.tsx")
        .nav({ label: "Account Home", iconName: "User" }),
      route("settings", "project/account/settings.tsx")
        .nav({ label: "Account Settings", iconName: "Settings" }),
    ]),
  ),
]);
```

Generate the runtime helper and nav code:

```bash
# using npx (works everywhere)
npx rr-check routes.ts --out src/navigation.generated.ts
```

> NOTE: to natively handle `typescript` files you do need the latest version of
> `Node.js`; or you could use typescript to convert `routes.ts` to JS and then
> use `rr-check`. More details below.

## 4 · Fluent Authoring API (with Type Safety)

@m5nv/rr-builder provides a type-safe, fluent builder DSL so only legal
route/navigation structures are possible:

### Route & Layout Builders

- `route(...)` and `layout(...)` return builders with `.children()` and
  `.nav()`.
- `layout(...).nav()` **cannot** set a `section` (type error).
- Only `route` and `layout` may have children.

### Index & External Builders

- `index(...)` and `external(...)` **do not support** `.children()` (type
  error).
- Both support `.nav()`, with all fields allowed (except `external()` auto-sets
  `external: true`).
- `external(...)` **cannot** be passed to `prefix()`.

### Prefix Builder

- `prefix(path, [builders...])` nests several builders under a path segment.
- Only `route`, `layout`, and `index` builders are allowed; `external()` is
  disallowed by type.

Here’s a more descriptive, context-rich replacement for your **Meta Shape
(passed to `.nav()`)** section:

#### Meta Shape (passed to `.nav()`)

The `.nav()` method lets you annotate each route with extra navigation/UI
metadata. These attributes drive how your Navigator, menu, sidebar, or
breadcrumbs are rendered and allow you to embed business context directly in
your route config. Here’s what each field means:

```ts
// For route(), index(), external()
interface NavMeta {
  label: string; // **Human‑readable name** for UI elements (menus, tabs, breadcrumbs).
  iconName?: string; // **Icon key** (typically from lucide-react or your icon set) to show beside the label.
  order?: number; // **Sorting hint**—lower numbers appear earlier in the section/group.
  section?: string; // **High-level menu partition** (e.g. "main", "admin", "support"). If omitted, defaults to "main". Used to group unrelated branches.
  group?: string; // **Cluster key**—for dividing a section into tabs, panels, or submenus (e.g. “Profile” vs “Security” tabs in Account).
  tags?: string[]; // **Arbitrary search/filter keywords** (for power search, badges, or smart menus).
  hidden?: boolean; // **Hide from all navigation UIs**—route remains valid, but isn’t shown in menu/sidebar.
  end?: boolean; // **Exact path match only** for highlighting in nav (like React Router’s “end”). Useful for index/home routes.
  external?: true; // **Automatically set by external()**. Marks this as an external/off-site link.
  abac?: Record<string, string>; // **Access control**—attributes for runtime ABAC checks (if your app supports them).
  actions?: Array<{ id: string; label: string; iconName?: string }>;
  // **Route-specific actions** to show as contextual buttons or menus (e.g. “Create”, “Export”).
}
```

**Best practices for NavMeta:**

- specify `label` on every route from the start to avoid drift
- specify `section` if you want to split your product into distinct areas each
  with its own navigation style; e.g. `docs`, `dashboard`, `shop`, `news`. —
  remember layouts can set UI meta, but not section partitioning.
- use `group` for tabs, `order` for sorting, and `tags` for search or
  context-aware navigation.
- Actions let you surface per-route commands (like “Create new post” or “Invite
  user”) right from the navigation model.

Collectively by using `.nav()`, `globalActions` and `badgeTargets`, your
`routes.[tj]s` file can become not only the single source of truth but also a
`planning tool`! For example, you could creatively use `tags` to mark in which
sprint a `route` will be delivered or was introduced.

#### Type Safety at a Glance

- `.children(...)` only available on `route()`/`layout()`.
- `.nav({ section: ... })` disallowed on `layout()`.
- `prefix()` only accepts `route`, `layout`, `index` builders.
- `.children(...)` on `index()` or `external()` is a compile-time error.

##### Example Misuse (now type errors)

```ts
index("home.tsx").children(route("foo", "foo.tsx")); // ❌ error
external("http://foo").children(route("foo", "foo.tsx")); // ❌ error
layout("layout.tsx").nav({ section: "main" }); // ❌ error
prefix("docs", [external("https://foo.dev")]); // ❌ error
```

## 5 · CLI & Code Generation (`rr-check`)

Check your routes, visualize trees, and generate navigation helpers for runtime.

### Usage

```bash
npx rr-check <routes-file> [--print:<flags>] [--out <file>] [--watch]
```

**Flags:**

| Flag              | Effect                                                     |
| ----------------- | ---------------------------------------------------------- |
| `--out <file>`    | Where to emit the navigation helper module                 |
| `--force`         | Code-gen even if duplicate IDs or missing files are found  |
| `--print:<flags>` | Comma-list: route-tree, nav-tree, include-id, include-path |
| `--watch`         | Watch for file changes and regenerate automatically        |

The generated module exports:

```ts
// Wire up RR
export function registerRouter(adapter: RouterAdapter): void;

// Data model and utility functions
export interface NavigationApi {
  /** list of section names present in the `forest of trees` */
  sections(): string[];

  /* pure selectors – NO runtime context */
  routes(section?: string): NavTreeNode[];
  routesByTags(section: string, tags: string[]): NavTreeNode[];
  routesByGroup(section: string, group: string): NavTreeNode[];

  /* convenience hook that hydrates results returned by adapter.useMatches */
  useHydratedMatches: <T = unknown>() => Array<{ handle: NavMeta }>;

  /* static extras */
  globalActions: GlobalActionSpec[];
  badgeTargets: string[];

  /* router adapter injected at factory time */
  router: RouterAdapter;
}
```

### Typescript support

You can run the codegen/CLI tool with Deno for `.ts` route files:

```bash
deno run --unstable-sloppy-imports --allow-read ./node_modules/@m5nv/rr-builder/src/rr-check.js routes.ts
```

Or, use the latest Node.js (> v23.6.0):

```bash
node ./node_modules/@m5nv/rr-builder/src/rr-check.js routes.ts
```

### Typical error and output

```bash
npx rr-check routes.ts --print:nav-tree,include-id

⚠️  Found 1 duplicate route ID
⚠️  Found 6 missing component files
...
├── Home(*!) [id: foo]
├── Settings(!) [id: routes/settings/page]
└── Overview(*!) [id: foo]
    └── Annual(!) [id: routes/dashboard/reports/annual]
```

## 6 · Using the Generated Navigation Module in Your UI

### Register the Router Adapter

```tsx
import { Link, matchPath, useLocation, useMatches } from "react-router-dom";
import nav, { registerRouter } from "@/navigation.generated";

/// one-time registration
registerRouter({ Link, useLocation, useMatches, matchPath });
```

### Rendering navigation/menus

```tsx
function Sidebar({ section }) {
  const items = nav.routes(section);
  return (
    <ul>
      {items.map((n) => (
        <li key={n.id}>
          <nav.router.Link to={n.path}>{n.label}</nav.router.Link>
        </li>
      ))}
    </ul>
  );
}
```

### Dynamic Layouts with Hydrated Matches

```tsx
import { Outlet } from "react-router";
import { useHydratedMatches } from "./navigation.generated";

export default function ContentLayout() {
  const matches = useHydratedMatches();
  const match = matches.at(-1);
  let { label, iconName } = match?.handle ??
    { label: "Unknown", iconName: "Help" };
  return (
    <article>
      <h2>
        <Icon name={iconName} /> {label}
      </h2>
      <section>
        <Outlet />
      </section>
    </article>
  );
}
```

## 7 · Concepts & Best Practices

### Route vs Layout

- **`route()`**: Owns a URL segment (`path`), can render its file and children.
- **`layout()`**: Pure wrapper with children, no path.

### Index Routes

- Defined with `index(file)`; rendered at the parent path.

### Prefixing

- Use `prefix(path, builders[])` to DRY up grouped path segments.

### Unique IDs

If multiple routes use the same file, provide a unique ID:

```ts
index("Page.tsx", { id: "users-all" });
route("active", "Page.tsx", { id: "users-active" });
```

Now you can switch on `match.id` in your component.

## 8 · Troubleshooting & Migration

- **Duplicate IDs**: Only the first is used in navigation trees; fix to avoid
  ambiguity.
- **Missing files**: Shown by the CLI; check spelling or ensure the file exists.
- **Type errors in your editor**: Confirm `.children()` and `.nav({ section })`
  are only used where allowed.
- **Switching from manual routes**: Replace your raw array with a single
  `build([...])` call and migrate metadata to `.nav()`.

## 9 · Design notes

- **Sections vs. Groups** – _section_ splits the full `forest` by `tree`;
  _group_ clusters within a section.
- **External links** – Stay in your menu, but are filtered out before hitting RR
  config.
- **No dev-only deps leak to runtime** – Only the generated module is imported
  at runtime.
- **Type-safety** – The API statically prevents misuse.
- **First-class codegen** – We do codegen so your runtime bundle is
  tree-shakable and never ships builder helpers.

## 10 · Roadmap

- **Adapter gallery** – ship `@m5nv/rr-adapter-preact`, `…-solid`, etc.
- **Schema plug‑ins** – allow custom meta keys via generic parameter.
- **ID collision auto‑resolve** – suggestion prompt instead of hard error.
- **VS Code plugin** – live tree preview + jump‑to‑route.
- **Docs site** – interactive playground, recipes, FAQ.
- **Validate iconName** - iconName against icon libraries such `lucide‑react` at
  build time and create a `icons.ts` ready for import and use by UI menus and
  layouts.

## License

© 2025 Million Views, LLC – Distributed under the MIT License. See
[LICENSE](../LICENSE) for details.
