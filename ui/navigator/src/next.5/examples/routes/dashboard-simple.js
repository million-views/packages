/// file: dashboard-routes-simple.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// Dashboard routes - simple version
const appShell = layout("routes/layout.tsx")
  .children(
    route("dashboard", "routes/dashboard/page.tsx")
      .meta({
        label: "Dashboard",
        iconName: "LayoutDashboard",
        section: "main",
      }),
    route("analytics", "routes/analytics/page.tsx")
      .meta({
        label: "Analytics",
        iconName: "BarChart",
        section: "main",
      }),
    route("settings", "routes/settings/page.tsx")
      .meta({
        label: "Settings",
        iconName: "Settings",
        section: "main",
      }),
  );

// Global actions that will be passed to build()
// Note: This assumes an extension to the build() API to accept a second parameter
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
    id: "help",
    label: "Help",
    iconName: "HelpCircle",
    tags: ["action", "global"],
  },
];

export default build([appShell], { actions: globalActions });

/*
Notes:
1. The current implementation assumes build() can be extended to accept a second parameter
   for global actions that are not tied to specific routes.
2. We're using tags to identify these as global actions.
3. For this simple version, we don't have any route-specific context actions.
*/
