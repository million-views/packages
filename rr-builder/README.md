# Fluent Route Configuration

A tiny, fluent builder API to configure React Router v7 framework mode routes,
for a seamless, unified route & navigation authoring experience.

> **Single‑source of truth for routes + navigation**

## 1 · Motivation

Modern web applications benefit from **colocating navigation metadata with route
configuration**—keeping icons, labels, permissions, and UI state together with
the routes that use them. This creates a single source of truth that prevents
the drift and inconsistencies that can plague growing applications.

React Router v7's **framework mode** gives us much needed relief from
handicapped file-system based routing mechanisms. The one downside is that it
**discards extra route properties**, making colocation impossible. Even if React
Router preserved extra metadata, storing complex navigation data in optional
route arguments becomes **brittle and unmanageable** as applications scale.

`@m5nv/rr-builder` solves this by providing a **fluent, type-safe DSL** for
authoring augmented routes with colocated navigational metadata. It provides a
tool to generate both React Router configuration and a runtime navigation API
that keeps everything perfectly synchronized. Now, you can **author your routes
and all navigation metadata in one fluent, type-safe DSL**, and use the
generated runtime‑safe module for your layout, menu, and navigational UI
components.

## 2 · Installation & Platform Support

```bash
# npm or pnpm (dev-only; nothing leaks to runtime)
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
  section,
} from "@m5nv/rr-builder";

export default build(
  [
    // Main section (default)
    layout("project/layout.tsx").children(
      route("overview", "project/overview.tsx").nav({
        label: "Overview",
        iconName: "ClipboardList",
      }),
      route("settings", "project/settings.tsx").nav({
        label: "Settings",
        iconName: "Settings",
        id: "project-settings",
      })
    ),

    // Dedicated admin section
    section("admin").children(
      layout("admin/layout.tsx").children(
        index("admin/dashboard.tsx").nav({
          label: "Admin Dashboard",
          iconName: "Shield",
        }),
        route("users", "admin/users.tsx").nav({
          label: "User Management",
          iconName: "Users",
        }),
        route("reports", "admin/reports.tsx").nav({
          label: "Reports",
          iconName: "BarChart",
          id: "admin-reports",
        })
      )
    ),

    // Documentation section with external links
    section("docs").children(
      external("https://docs.acme.dev").nav({
        label: "API Docs",
        iconName: "Book",
      }),
      external("https://guides.acme.dev").nav({
        label: "User Guides",
        iconName: "HelpCircle",
      })
    ),
  ],
  {
    globalActions: [
      {
        id: "search",
        label: "Search",
        iconName: "Search",
        sections: ["main", "admin"], // Available in main and admin sections
      },
      {
        id: "feedback",
        label: "Send Feedback",
        iconName: "MessageSquare",
        externalUrl: "https://feedback.acme.dev",
      },
    ],
    badgeTargets: ["project-settings", "admin-reports"],
  }
);
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
- Both support all navigation metadata fields.
- Only `route` and `layout` may have children.

### Index & External Builders

- `index(...)` and `external(...)` **do not support** `.children()` (type
  error).
- Both support `.nav()`, with all fields allowed (except `external()` auto-sets
  `external: true`).
- `external(...)` **cannot** be passed to `prefix()`.

### Section Builder

- `section(name)` creates a navigation section for organizing routes into
  separate trees.
- **Sections can only be used at the top level** of `build()` - they cannot be
  nested within other routes or sections.
- Section builders support `.nav()` (without the `section` field) and
  `.children()`.
- A section's `.children()` can accept any non-section builder (`route`,
  `layout`, `index`, `external`).

### Prefix Builder

- `prefix(path, [builders...])` nests several builders under a path segment.
- Only `route`, `layout`, and `index` builders are allowed; `external()` and
  `section()` are disallowed by type.

#### Meta Shape (passed to `.nav()`)

The `.nav()` method lets you attach navigation and UI metadata directly to your
route definitions—making your navigation menus, sidebars, toolbars, and
breadcrumbs entirely data-driven, consistent, and easy to extend.

**Each field serves a specific purpose for your navigation or UI layer**:

```ts
// Navigation metadata for all builders (external flag is set automatically)
type NavMeta = {
  /**
   * Human‑friendly display name for this route/menu entry.
   * Always provide a label for anything visible in navigation.
   */
  label: string;

  /**
   * Icon to show beside label in menus and sidebars.
   * Typically the string name from lucide-react or your icon set.
   */
  iconName?: string;

  /**
   * Used to sort menu items within a group or section.
   * Lower numbers appear first. Defaults to 0 if omitted.
   */
  order?: number;

  /**
   * Used for grouping related routes into submenus, tab panels,
   * or logical clusters within a section (e.g. "Settings", "Billing" tabs).
   */
  group?: string;

  /**
   * List of keywords for search/filtering or for applying styles/logic
   * to groups of routes (e.g. tags: ["admin", "beta"]).
   */
  tags?: string[];

  /**
   * If true, hides this item from all navigation UI,
   * but leaves the route itself active and linkable.
   * Useful for "secret"/unlinked pages, or wizard steps.
   */
  hidden?: boolean;

  /**
   * If true, menu highlighting should only occur on an exact path match,
   * not for descendant routes. Useful for "Home" or main dashboard links.
   */
  end?: boolean;

  /**
   * Arbitrary access control claims for runtime ABAC or RBAC.
   * Can be used to hide/show nav entries based on permissions.
   */
  abac?: string | string[];

  /**
   * List of per-route/contextual actions. These surface as menu items,
   * action buttons, or FABs—e.g. "Create", "Export", "Refresh".
   * UI code can render them as dropdowns, icon buttons, or toolbars.
   */
  actions?: Array<{ id: string; label: string; iconName?: string }>;

  /**
   * Marks this as an external (off-site) link.
   * This flag is set automatically by `external()` and cannot be set manually.
   * UI code can use this to render with special icons or open in a new tab.
   */
  external?: true; // Set automatically, not manually
};

// All builders use: Omit<NavMeta, 'external'> for their .nav() method
// The external flag is only set automatically by the external() builder
```

#### Global Actions & Badge Targets

Beyond per-route metadata, you can define **global actions** and **badge
targets** that apply across your entire application:

```ts
// In your build() call
export default build(
  [
    // ... your routes
  ],
  {
    globalActions: [
      {
        id: "search",
        label: "Global Search",
        iconName: "Search",
        sections: ["main", "admin"], // Only show in these sections
      },
      {
        id: "help",
        label: "Help Center",
        iconName: "HelpCircle",
        externalUrl: "https://help.acme.dev", // External link
      },
      {
        id: "create-project",
        label: "New Project",
        iconName: "Plus",
        // No sections = available everywhere
      },
    ],
    badgeTargets: [
      "notifications", // Route IDs that can show badges
      "admin-users",
      "reports-monthly",
      "global-search", // Action IDs that can show badges
    ],
  }
);
```

**Global Actions** are app-wide commands that appear in your navigation UI
regardless of the current route. They can:

- Be scoped to specific sections via the `sections` array
- Link to external URLs via `externalUrl`
- Trigger application logic when clicked (handled by your UI code)

**Badge Targets** are route IDs or action IDs that can display notification
badges, counters, or status indicators in your navigation UI.

#### Type Safety at a Glance

- `.children(...)` only available on `route()`, `layout()`, and `section()`.
- `section()` builders can only be used at the **top level** of `build()`.
- `prefix()` only accepts `route`, `layout`, `index` builders (not `external` or
  `section`).
- `.children(...)` on `index()` or `external()` is a compile-time error.

##### Example Misuse (flagged for type errors)

```ts
index("home.tsx").children(route("foo", "foo.tsx")); // ❌ error
external("http://foo").children(route("foo", "foo.tsx")); // ❌ error
section("admin").children(section("nested")); // ❌ error
prefix("docs", [external("https://foo.dev")]); // ❌ error
prefix("api", [section("admin")]); // ❌ error

// This is also an error - sections can only be at top level
route("admin", "admin.tsx").children(
  section("users") // ❌ error
);
```

## 5 · Section-Based Navigation Architecture

The `section()` builder enables you to organize your application into distinct
navigation trees, perfect for:

- **Monorepo applications**: A single repo serving multiple webapps (docs,
  dashboard, ...)
- **Role-based interfaces**: Different navigation for different user types
- **Feature modules**: Isolate documentation, settings, or tool sections
- **Progressive disclosure**: Show simpler navigation to new users

### Section Examples

```ts
export default build([
  // Main application routes
  layout("app/layout.tsx").children(
    index("app/dashboard.tsx").nav({ label: "Dashboard" }),
    route("projects", "app/projects.tsx").nav({ label: "Projects" })
  ),

  // Admin section with its own navigation tree
  section("admin")
    .nav({ label: "Administration", iconName: "Shield" })
    .children(
      layout("admin/layout.tsx").children(
        index("admin/overview.tsx").nav({ label: "Admin Overview" }),
        route("users", "admin/users.tsx").nav({ label: "Users" }),
        route("settings", "admin/settings.tsx").nav({ label: "Settings" })
      )
    ),

  // Documentation section
  section("docs")
    .nav({ label: "Documentation", iconName: "Book" })
    .children(
      external("https://api-docs.acme.dev").nav({ label: "API Reference" }),
      external("https://guides.acme.dev").nav({ label: "User Guides" })
    ),
]);
```

Your generated navigation API will provide section-aware methods:

```tsx
// Get all available sections
const sections = nav.sections(); // ["main", "admin", "docs"]

// Get routes for a specific section
const adminRoutes = nav.routes("admin");
const mainRoutes = nav.routes("main"); // or nav.routes() for default
```

## 6 · CLI & Code Generation (`rr-check`)

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
export type NavigationApi = {
  /** list of section names present in the forest of trees */
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
};
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

## 7 · Using the Generated Navigation Module in Your UI

### Register the Router Adapter

```tsx
import { Link, matchPath, useLocation, useMatches } from "react-router";
import nav, { registerRouter } from "@/navigation.generated";

/// one-time registration
registerRouter({ Link, useLocation, useMatches, matchPath });
```

### Rendering Section-Based Navigation

```tsx
function AppNavigation() {
  const sections = nav.sections();

  return (
    <nav>
      {sections.map((sectionName) => (
        <section key={sectionName}>
          <h3>{sectionName}</h3>
          <NavigationSection section={sectionName} />
        </section>
      ))}
    </nav>
  );
}

function NavigationSection({ section }) {
  const items = nav.routes(section);
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <nav.router.Link to={item.path}>
            {item.iconName && <Icon name={item.iconName} />}
            {item.label}
          </nav.router.Link>
        </li>
      ))}
    </ul>
  );
}
```

### Global Actions & Badges

```tsx
function GlobalActionBar() {
  const actions = nav.globalActions;
  const currentSection = getCurrentSection(); // Your logic

  const availableActions = actions.filter(
    (action) => !action.sections || action.sections.includes(currentSection)
  );

  return (
    <div className="action-bar">
      {availableActions.map((action) => (
        <ActionButton
          key={action.id}
          action={action}
          hasBadge={nav.badgeTargets.includes(action.id)}
        />
      ))}
    </div>
  );
}

function ActionButton({ action, hasBadge }) {
  const handleClick = () => {
    if (action.externalUrl) {
      window.open(action.externalUrl, "_blank");
    } else {
      // Dispatch your custom action
      dispatchAction(action.id);
    }
  };

  return (
    <button onClick={handleClick} className="action-button">
      {action.iconName && <Icon name={action.iconName} />}
      {action.label}
      {hasBadge && <Badge />}
    </button>
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
  let { label, iconName, actions } = match?.handle ?? {
    label: "Unknown",
    iconName: "Help",
    actions: [],
  };

  return (
    <article>
      <header>
        <h2>
          <Icon name={iconName} /> {label}
        </h2>
        {actions && (
          <div className="route-actions">
            {actions.map((action) => (
              <button key={action.id} onClick={() => handleAction(action.id)}>
                {action.iconName && <Icon name={action.iconName} />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </header>
      <section>
        <Outlet />
      </section>
    </article>
  );
}
```

## 8 · Concepts & Best Practices

### Route vs Layout vs Section

- **`route()`**: Owns a URL segment (`path`), can render its file and children.
- **`layout()`**: Pure wrapper with children, no path.
- **`section()`**: Top-level container that creates separate navigation trees.

### Index Routes

- Defined with `index(file)`; rendered at the parent path.

### Prefixing

- Use `prefix(path, builders[])` to DRY up grouped path segments.
- Cannot include `section()` or `external()` builders.

### Section Organization

- Use sections to create distinct areas of your application
- Each section gets its own navigation tree
- Perfect for admin areas, documentation, or feature modules
- Sections cannot be nested - they're always top-level

### Shared Layouts vs Individual Sections

**Use `sharedLayout()`** when:

- Multiple sections share the same root layout (app shell, navigation, header)
- You want to eliminate repetitive layout nesting
- You have a common UI structure across different app areas

**Use individual `section()`** when:

- Each section has completely different layout requirements
- Sections are truly independent with no shared UI
- You need maximum flexibility in structure

```ts
// Shared layout - common app shell
...sharedLayout("layouts/app-shell.tsx", {
  "dashboard": dashboardRoutes,
  "admin": adminRoutes,
})

// vs Individual sections - different layouts
section("public").children(
  layout("layouts/marketing.tsx").children(...)
),
section("app").children(
  layout("layouts/authenticated.tsx").children(...)
),
```

### Actions & Global Actions

- **Route actions**: Contextual commands specific to a route (Create, Edit,
  Delete)
- **Global actions**: App-wide commands available across sections (Search, Help,
  New)
- Actions are defined in metadata but wired up by your UI code
- Use `badgeTargets` to show notifications on specific routes or actions

### Unique IDs

If multiple routes use the same file, provide a unique ID:

```ts
index("Page.tsx", { id: "users-all" });
route("active", "Page.tsx", { id: "users-active" });
```

Now you can switch on `match.id` in your component.

## 9 · Troubleshooting & Migration

- **Duplicate IDs**: Only the first is used in navigation trees; fix to avoid
  ambiguity.
- **Missing files**: Shown by the CLI; check spelling or ensure the file exists.
- **Type errors in your editor**: Confirm `.children()` usage follows the
  constraints (no sections except at top level).
- **Section nesting errors**: Remember sections can only be used at the top
  level of `build()`.
- **Switching from manual routes**: Replace your raw array with a single
  `build([...])` call and migrate metadata to `.nav()`.

## 10 · Design notes

- **Sections vs. Groups** – _section_ splits the full forest by tree; _group_
  clusters within a section.
- **External links** – Stay in your menu, but are filtered out before hitting RR
  config.
- **No dev-only deps leak to runtime** – Only the generated module is imported
  at runtime.
- **Type-safety** – The API statically prevents misuse.
- **First-class codegen** – We do codegen so your runtime bundle is
  tree-shakable and never ships builder helpers.
- **Actions are declarative** – Define them in route metadata, wire them up in
  UI code.

## 11 · Roadmap

- **ID collision auto‑resolve** – suggestion prompt instead of hard error.
- **Docs site** – interactive playground, recipes, FAQ.
- **Validate iconName** - iconName against icon libraries such `lucide‑react` at
  build time and create a `icons.ts` ready for import and use by UI menus and
  layouts.
- **Action validation** - Validate action IDs and provide TypeScript
  autocompletion.

## License

© 2025 Million Views, LLC – Distributed under the MIT License. See
[LICENSE](../LICENSE) for details.
