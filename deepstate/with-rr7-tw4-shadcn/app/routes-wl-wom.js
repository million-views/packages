import { build, index, layout, prefix, route } from "@m5nv/rr-builder";
/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 * @typedef {import("@react-router/dev/routes").RouteConfig} RouteConfig
 */

// —————————————————————————————————————————————————————————————
// 1) Dashboard feature routes
// —————————————————————————————————————————————————————————————
const overview = layout("layouts/content.tsx", { id: "overview" })
  // .meta({ label: "Overview", iconName: "BarChart", section: "main" })
  .children(
    ...prefix("overview", [
      index("routes/dashboard/overview/summary.tsx")
        .meta({ label: "Overview", iconName: "CircleDot", end: true }),
      route("performance", "routes/dashboard/overview/performance.tsx")
        .meta({ label: "Performance", iconName: "TrendingUp" }),
      route("metrics", "routes/dashboard/overview/metrics.tsx")
        .meta({ label: "Metrics", iconName: "Clock" }),
    ]),
  );

const analytics = layout("layouts/content.tsx", {
  id: "analytics",
})
  // .meta({ label: "Analytics", iconName: "FileText", section: "main" })
  .children(
    ...prefix("analytics", [
      index("routes/dashboard/analytics/summary.tsx")
        .meta({ label: "Analytics", iconName: "BarChart", end: true }),
      route("traffic", "routes/dashboard/analytics/traffic.tsx")
        .meta({ label: "Traffic", iconName: "Activity" }),
      route("conversion", "routes/dashboard/analytics/conversion.tsx")
        .meta({ label: "Conversion", iconName: "PieChart" }),
    ]),
  );

const reports = layout("layouts/content.tsx", {
  id: "reports",
})
  // .meta({ label: "Reports", iconName: "PieChart", section: "main" })
  .children(
    ...prefix("reports", [
      index("routes/dashboard/reports/summary.tsx")
        .meta({ label: "Reports", iconName: "FileText", end: true }),
      route("monthly", "routes/dashboard/reports/monthly.tsx", {
        id: "reports-monthly",
      })
        .meta({ label: "Monthly", iconName: "Calendar" }),
      route("quarterly", "routes/dashboard/reports/quarterly.tsx", {
        id: "reports-quarterly",
      })
        .meta({ label: "Quarterly", iconName: "CalendarDays" }),
      route("annual", "routes/dashboard/reports/annual.tsx", {
        id: "reports-annual",
      })
        .meta({ label: "Annual", iconName: "CalendarRange" }),
    ]),
  );

const dashboard = layout(
  "layouts/content.tsx",
  { id: "main" },
)
  // .meta({ label: "Dashboard", iconName: "LayoutDashboard", section: "main" })
  .children(
    ...prefix("dashboard", [
      index("routes/dashboard/page.tsx")
        .meta({ label: "Dashboard", iconName: "LayoutDashboard", end: true }),
      overview,
      analytics,
      reports,
    ]),
  );

// —————————————————————————————————————————————————————————————
// 2) User‑management feature routes
// —————————————————————————————————————————————————————————————
const roles = layout("routes/users/layout.tsx", { id: "roles"} )
  // .meta({ label: "Roles", section: "users" })
  .children(
    ...prefix("roles", [
      index("routes/users/roles/page.tsx", { id: "users-roles-index" })
        .meta({ label: "All Roles", iconName: "Shield", end: true }),
      route("admin", "routes/users/roles/page.tsx", { id: "users-roles-admin" })
        .meta({ label: "Administrators", iconName: "ShieldAlert" }),
      route("editor", "routes/users/roles/page.tsx", { id: "users-roles-editor" })
        .meta({ label: "Editors", iconName: "Edit" }),
      route("viewer", "routes/users/roles/page.tsx", { id: "users-roles-viewer" })
        .meta({ label: "Viewers", iconName: "Eye" }),
    ]),
  );

const users = layout("routes/users/layout.tsx", { id: "users" })
  // .meta({ label: "Users", iconName: "Users", section: "main" })
  .children(
    ...prefix("users", [
      index("routes/users/page.tsx", { id: "users-index" })
        .meta({ label: "All Users", iconName: "Users", end: true }),
      route("active", "routes/users/page.tsx", { id: "users-active" })
        .meta({ label: "Active Users", iconName: "UserCheck" }),
      route("inactive", "routes/users/page.tsx", { id: "users-inactive" })
        .meta({ label: "Inactive Users", iconName: "UserMinus" }),
      roles,
    ]),
  );

// —————————————————————————————————————————————————————————————
// 3) App shell
// —————————————————————————————————————————————————————————————
const appShell = layout("routes/layout.tsx")
  .children(
    index("routes/page.tsx"),
      // .meta({ label: "Home", iconName: "Home", end: true, section: "main" }),
    route("settings", "routes/settings/page.tsx"),
      // .meta({ label: "Settings", iconName: "Settings", section: "main" }),
    dashboard,
    users,
  );

// —————————————————————————————————————————————————————————————
// 4) Export
// —————————————————————————————————————————————————————————————
/** @type {RouteConfig} */
export default build([appShell]);
