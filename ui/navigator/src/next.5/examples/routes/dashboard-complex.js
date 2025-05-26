/// file: dashboard-routes-complex.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// Dashboard routes - complex version with nested routes and context actions
const analyticsRoutes = route("analytics", "routes/analytics/layout.tsx")
  .meta({
    label: "Analytics",
    iconName: "BarChart",
    section: "main",
    actions: [
      { id: "filter-analytics", label: "Filter", iconName: "Filter" },
      { id: "print-analytics", label: "Print", iconName: "Printer" },
    ],
  })
  .children(
    index("routes/analytics/overview.tsx")
      .meta({
        label: "Overview",
        iconName: "PieChart",
      }),
    route("reports", "routes/analytics/reports.tsx")
      .meta({
        label: "Reports",
        iconName: "FileText",
      }),
  );

const usersRoutes = route("users", "routes/users/layout.tsx")
  .meta({
    label: "User Management",
    iconName: "Users",
    section: "main",
  })
  .children(
    route("list", "routes/users/list.tsx")
      .meta({
        label: "User List",
        iconName: "List",
        actions: [
          { id: "add-user", label: "Add User", iconName: "UserPlus" },
          { id: "import-users", label: "Import", iconName: "Upload" },
        ],
      }),
    route("roles", "routes/users/roles.tsx")
      .meta({
        label: "Roles",
        iconName: "Shield",
      }),
  );

const appShell = layout("routes/layout.tsx")
  .children(
    route("dashboard", "routes/dashboard/page.tsx")
      .meta({
        label: "Dashboard",
        iconName: "LayoutDashboard",
        section: "main",
        actions: [
          { id: "refresh-dashboard", label: "Refresh", iconName: "RefreshCw" },
          { id: "export-dashboard", label: "Export", iconName: "Download" },
        ],
      }),
    analyticsRoutes,
    usersRoutes,
    route("settings", "routes/settings/page.tsx")
      .meta({
        label: "Settings",
        iconName: "Settings",
        section: "main",
      }),
  );

// Global actions that will be passed to build()
const globalActions = [
  {
    id: "notifications",
    label: "Notifications",
    iconName: "Bell",
    tags: ["action", "global"],
  },
  {
    id: "user-profile",
    label: "User Profile",
    iconName: "User",
    tags: ["action", "global"],
  },
  {
    id: "theme-toggle",
    label: "Toggle Theme",
    iconName: "Moon",
    tags: ["action", "global"],
  },
  {
    id: "help",
    label: "Help",
    iconName: "HelpCircle",
    tags: ["action", "global"],
  },
];

// Badge information (dynamic content that will be fetched at runtime)
const badges = [
  {
    id: "notifications", // Same ID as the action it applies to
    count: 5,
  },
];

export default build([appShell], { actions: globalActions, badges });

/*
Notes:
1. Context actions are defined within the meta() call for each route using an "actions" array
2. Global actions are passed to build() as a second parameter
3. Badges are also passed to build() to be associated with specific actions
4. We're assuming that the badge count would be filled in at runtime by the application
   and this structure is just the initial state
*/
