# React Route v7 Notes

Ideally, this library should not exist; and it might go away if we could present
a case to the `rr` team to support `route augmentation` option in the
`framework mode` helpers API (`layout`, `index`, `route`, `prefix`).

These notes are not validated;I gathered them while reading the documentation
and trying to create a `single source of truth` that combines routes with
navigation information in a centralized location; in v7, that is the `routes.js`
or `routes.ts` file.

# Why `rr-builder` Still Matters in 2025

React-Router’s **framework mode** is fantastic—but it still treats navigation UI
as “someone else’s problem”.\
`rr-builder` exists because:

1. **navdata belongs _with_ routes** – otherwise labels, icons and permissions
   drift out of sync.
2. React-Router’s framework mode eats extra props → you lose nav data at
   runtime.
3. We want **single-file truth**: routes + labels + icons + perms + externals.
   PMs can skim `routes.js` and see the site map, designers tweak
   `order`/`group`, backend devs add ABAC keys;
4. The hidden `routes.nav` payload lets build tools read nav-specific info
   without polluting React-Router’s config.
5. `external()` finally lets us treat off-site links the same way—no rogue
   arrays, no separate JSON files.

If RR someday lets us emit augmented routes in framework mode, this package can
fade away. Until then, we need this tiny fluent wrapper + code-gen keeps
boiler-plate at zero while letting you author navigation declaratively.

## What is route augmentation?

Websites and webapps have to display menus, navbars and links to allow users to
navigate the site or the app. RR only deals with the mechanisms of taking the
users from point A to point B; and these mechanisms at a minimum need only the
`path` and the `element` or reference to the `component` file.

Rendering a menu is not the concern of RR; the developer is responsible for
creating the necessary markup up using `<NavLink>` and `<Link>` typically in a
`layout` file. Any menu link will need information such as a `label`, `icon`,
and a `path` at a minimum.

You can see that that `path` is at the intersection of both concerns. It would
be ideal if we could augment the route information with props related to
navigation at the source.

## What is the issue?

To be able construct and render `grand central` style site menus and navigation
bars, one must have access to the `sitemap` or `productmap`; which contains the
all the routes, the label, the path (`href`) and optionally an icon for each
navigable route.

It is tempting to import `routes.ts` into the component that is responsible for
rendering the navigation bar or map; but that would pull in a devDependency into
the runtime&mdash; and it feels icky to do so.

## What is the solution?

Since we could not find an API that provided access to all the routes, we
decided to take the `codegen` approach. The solution is to augment routes with
the needed information for navigation, and then create a runtime file that
exports a tree suitable for rendering by menu/navigator components.

By creating a file that can be bundled with the runtime, we avoid pulling in
devDependencies. But this is easier said that done. The rest of the notes cover
the issues that had to be resolved in order to obtain a viable solution.

Unfortunately, any such augmentation is stripped away at build time React
Router's framework mode tooling.

So the challenge is to create a seamless experience in augmenting routes and
make them available at runtime. By seamless, we mean that the same API that
developers use to create routes configuration file should be available with the
option to augment the route with meta data.

## Stumble upon

The friction free solution to include metadata for a route (and it's component)
is to use the `handle()` api, in the component itself. This information is then
made available at runtime in the `Route` object as `.handle` prop. The idea is
that the developer can use `useMatches()` API to get the cascade of routes taken
and any component is free to walk this array and look for `.handle` prop.

```js
// routes/dashboard/layout.tsx
export const handle = { label: "Dashboard", iconName: "Chart", group: "main" };
export default function DashboardLayout() {
  return <Outlet />;
}
```

You can see that this can get out of sync and scattered quickly; especially for
`route` components. Second, it gets tiring to export `handle` in every
component.

But more importantly, this is just part of the puzzle. To be able to build
`grand-central` style navbars, we still need access to all the navigable routes.

## Enter `rr-builder`

`@m5nv/rr-builder` is a package that comes with a fluent API to describe your
routes and augment them with meta information. A codegen tool `rr-check` then
validates your routes and generates a file that you can import into your
application and use it for the purpose of rendering navigation and templatising
layouts. This generated module removes the need for exporting `handle()`
function and manually duplicate the path information in your code. More
information can be found in the README.md

# FAQ

- A · Why not just handle?
  - RR’s export const handle works, but scattering labels into every component
    file is brittle. Builders give one glance overview and avoid copy‑pasted
    paths.

- B · Why build() instead of exporting the array directly?
  - build() lets us attach the hidden routes.nav payload, inject defaults
    (order:0, section:"main", …), run compile‑time checks (dup IDs, missing
    files) before the RR compiler touches the config.

- C · Why code‑gen a .ts instead of JSON?
  - Tree‑shake‑able, typed, and can embed the helper functions. Lets the
    consumer avoid parsing / mapping JSON.

- D · Why a section‑anywhere model?
  - We experimented with “section only at depth 0”; it broke real‑world apps
    that nest Project -> Support -> Docs. Allowing a section switch at any depth
    gives freedom while the inheritance rule keeps things predictable.

- E · Duplicate ID policy
  - The first occurrence wins; subsequent duplicates are dropped from the nav
    tree (but still logged). This lets teams stitch external resources in
    multiple places while keeping URLs stable.

- F · External default section removed
  - Originally external() forced section:"external"; field tests showed most
    teams wanted externals mixed into their normal menus, so we dropped the
    implicit default. The builder still marks them with external:true so UI can
    style them differently.

- G · Type-safety
  - The fluent API statically restricts illegal combinations. Only route() and
    layout() accept .children(). layout()'s .nav() does not allow section.
    prefix() cannot wrap external(). These rules are all enforced in TypeScript,
    not at runtime.
