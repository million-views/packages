# rr-builder

A tiny fluent builder for React Router v7 that keeps a **single source of
truth** for both your routing configuration and navigation metadata. Use the
familiar `route`, `index`, `layout` and `prefix` helpers, chain `.children()`
for nesting and `.meta()` for nav labels/icons, then extract a plain
`RouteConfigEntry[]` for React Router via `buildRoutes()`.

## Motivation

- **Single source of truth**: Author your routes & navigation metadata in one
  place, not duplicated across router setup and menu components.
- **Familiar API**: Reuse React Router’s own helper names (`route`, `index`,
  `layout`, `prefix`).
- **Fluent, readable syntax**: Avoid deeply nested arrays and
  arrays-of-arrays-of-arrays.
- **Runtime preservation**: Metadata is stashed on each entry’s `.handle`
  property so your `Navigator` component can read `route.handle` directly.

## Usage Example

```ts
import type { RouteConfig } from "@react-router/dev/routes";
import { buildRoutes, index, layout, prefix, route } from "rr-builder";

const tree = [
  layout("routes/layout.tsx")
    .children(
      index("routes/page.tsx").meta({
        label: "Home",
        iconName: "Home",
        end: true,
      }),
      route("settings", "routes/settings.tsx").meta({
        label: "Settings",
        iconName: "Settings",
      }),
      route("dashboard", "routes/dashboard/layout.tsx")
        .meta({ label: "Dashboard", iconName: "dashboard" })
        .children(
          route("overview", "routes/dashboard/overview.tsx")
            .meta({ label: "Overview", iconName: "BarChart" }),
        ),
    ),
  ...prefix("blog", [
    index("routes/blog/index.tsx"),
    route(":postId", "routes/blog/post.tsx"),
  ]),
];

export default buildRoutes(tree) satisfies RouteConfig;
```

## API Interface

```ts
import {
  buildRoutes,
  index,
  layout,
  prefix,
  route,
  type RouteConfigEntry,
} from "rr-builder";
```

### Builder Methods

- `route(path: string | null | undefined, file: string, options?: object)` →
  builder for a dynamic or static route; `options` supports the same props as
  React Router’s `route` helper (e.g. `id`, `index`, `caseSensitive`).
- `index(file: string, options?: object)` → builder for an index route;
  `options` supports the same props as React Router’s `index` helper (e.g.
  `id`).
- `layout(file: string, options?: object)` → builder for a layout route;
  `options` supports the same props as React Router’s `layout` helper (e.g.
  `id`).
- `prefix(path: string, builders: Builder[])` → prepend a path to multiple root
  builders; returns an **array** of `Builder` instances (one per provided
  builder), rather than a single `Builder`, matching its specialized use-case.

#### Chaining

- `.children(...builders)` → attach nested routes
- `.meta({ label?, iconName?, end?, section? })` → stash navigation metadata
  into `entry.handle`

#### Extraction

- `build(builders: Builder[]): RouteConfigEntry[]` → produce the final array of
  `RouteConfigEntry` objects (ready for `createBrowserRouter` or `useRoutes`)

## 1:1 Comparison

### React Router API

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
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

### Fluent Builder API

```ts
import type { RouteConfig } from "@react-router/dev/routes";
import { buildRoutes, index, layout, prefix, route } from "./lib/rr-builder";

// 1) Define tree via chained calls
const tree = [
  index("./home.tsx"),

  route("about", "./about.tsx"),

  layout("./auth/layout.tsx")
    .children(
      route("login", "./auth/login.tsx"),
      route("register", "./auth/register.tsx"),
    ),

  // prefix returns array of Builders
  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
];

// 2) Export exactly the array Router expects
export default buildRoutes(tree) satisfies RouteConfig;
```

### Quick DX Comparison

| Aspect                 | React Router API                                  | Fluent Builder API                                                       |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| **Nesting style**      | Inline nested arrays                              | Flat top‑level array + explicit `.children`                              |
| **Readability**        | Heavy on brackets (`[`, `]`, `,`)                 | Linear, method‑chained intent                                            |
| **Error resilience**   | Easy to mis‑brace or mis‑comma                    | IDE can autocomplete `.children()` & `.meta()`                           |
| **Composability**      | Spreading results of `prefix()` inline            | Spreading `prefix(...)` works the same                                   |
| **Extension points**   | Would need to wrap each helper if adding features | Single builder supports `.meta()`, `.children()` without extra overloads |
| **1:1 correspondence** | Direct helper → config entries                    | Builder → same `RouteConfigEntry[]` via `buildRoutes`                    |

**Bottom line:**\
The **fluent API** preserves all of React Router’s capabilities (including
`prefix`‑spreading) but gives you a more **linear, chainable** authoring
style—fewer nested arrays and commas, easier code‑completion, and a single place
to integrate metadata when you need it.

**Fluent advantages**:

- Linear, chainable calls
- IDE autocomplete on `.children` and `.meta`
- Flattened structure easier to read & maintain
