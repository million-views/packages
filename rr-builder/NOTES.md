# React Route v7 Notes

Ideally, this library should not exist; and it might go away if we could present
a case to the `rr` team to support `route augmentation` option in the
`framework mode` helpers API (`layout`, `index`, `route`, `prefix`).

These notes are not validated;I gathered them while reading the documentation
and trying to create a `single source of truth` that combines routes with
navigation information in a centralized location; in v7, that is the `routes.js`
or `routes.ts` file.

## What is route augmentation?

Websites and webapps have to display menus, navbars and links to allow users to
navigate the site or the app. RR only deals with the mechanisms of taking the
users from point A to point B; and these mechanisms at a minimum need only the
`path` and the `element` or reference to the `component` file.

Rendering a menu is not the concern of RR; the developer is responsible for
creating the necessary markup up using `<NavLink>` and `<Link>` typically in a
`layout` file. A menu any link will need information such as a `label`, `icon`,
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

npx rr-check app/routes.js --show-id --show-path ✅ No duplicate route IDs
found.

Route Tree: ├── [L] Home (path: /, id: routes/page) ├── [N] Settings (path:
/settings, id: routes/settings/page) ├── [S] (no label) (path: /, id:
routes/dashboard/layout) │ ├── [N]↑ Dashboard (path: /dashboard, id:
routes/dashboard/page) │ ├── [S]↑ Overview|Layout (path: /, id: overview) │ │
├── [N]↑ Overview (path: /dashboard/overview, id:
routes/dashboard/overview/summary) │ │ ├── [N]↑ Performance (path:
/dashboard/overview/performance, id: routes/dashboard/overview/performance) │ │
└── [N]↑ Metrics (path: /dashboard/overview/metrics, id:
routes/dashboard/overview/metrics) │ ├── [S]↑ (no label) (path: /, id:
analytics) │ │ ├── [N]↑ Analytics (path: /dashboard/analytics, id:
routes/dashboard/analytics/summary) │ │ ├── [N]↑ Traffic (path:
/dashboard/analytics/traffic, id: routes/dashboard/analytics/traffic) │ │ └──
[N]↑ Conversion (path: /dashboard/analytics/conversion, id:
routes/dashboard/analytics/conversion) │ └── [S]↑ (no label) (path: /, id:
reports) │ ├── [N]↑ Reports (path: /dashboard/reports, id:
routes/dashboard/reports/summary) │ ├── [N]↑ Monthly (path:
/dashboard/reports/monthly, id: reports-monthly) │ ├── [N]↑ Quarterly (path:
/dashboard/reports/quarterly, id: reports-quarterly) │ └── [N]↑ Annual (path:
/dashboard/reports/annual, id: reports-annual) └── [S] (no label) (path: /, id:
users) ├── [N]↑ All Users (path: /users, id: users-index) ├── [N]↑ Active Users
(path: /users/active, id: users-active) ├── [N]↑ Inactive Users (path:
/users/inactive, id: users-inactive) └── [S]↑ (no label) (path: /, id: roles)
├── [N]↑ All Roles (path: /users/roles, id: users-roles-index) ├── [N]↑
Administrators (path: /users/roles/admin, id: users-roles-admin) ├── [N]↑
Editors (path: /users/roles/editor, id: users-roles-editor) └── [N]↑ Viewers
(path: /users/roles/viewer, id: users-roles-viewer)

/ [Home] ├── settings [Settings] ├── dashboard [Dashboard] │ ├── overview
[Overview] │ │ ├── performance [Performance] │ │ └── metrics [Metrics] │ ├──
analytics [Analytics] │ │ ├── traffic [Traffic] │ │ └── conversion [Conversion]
│ └── reports [Reports] │ ├── monthly [Monthly] │ ├── quarterly [Quarterly] │
└── annual [Annual] └── users [Users] ├── active [Active Users] ├── inactive
[Inactive Users] └── roles [All Roles] ├── admin [Administrators] ├── editor
[Editors] └── viewer [Viewers]

/ [Home] ├── settings [Settings] ├── dashboard [Dashboard] │ ├── overview
[Overview] │ │ ├── performance [Performance] │ │ └── metrics [Metrics] │ ├──
analytics [Analytics] │ │ ├── traffic [Traffic] │ │ └── conversion [Conversion]
│ └── reports [Reports] │ ├── monthly [Monthly] │ ├── quarterly [Quarterly] │
└── annual [Annual] └── users [Users] ├── active [Active Users] ├── inactive
[Inactive Users] └── roles [All Roles] ├── admin [Administrators] ├── editor
[Editors] └── viewer [Viewers]
