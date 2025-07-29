/// file: routes-wl-wm.js (using layout + metadata)
import { build, index, layout, prefix, route } from "@m5nv/rr-builder";
/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 * @typedef {import("@react-router/dev/routes").RouteConfig} RouteConfig
 */

// —————————————————————————————————————————————————————————————
// 1) Dashboard feature routes
// —————————————————————————————————————————————————————————————
const overview = layout("layouts/content.tsx", { id: "overview" })
  .nav({ label: "Overview", iconName: "BarChart", section: "main" })
  .children(
    ...prefix("overview", [
      index("routes/dashboard/overview/summary.tsx")
        .nav({ label: "Overview", iconName: "CircleDot", end: true }),
      route("performance", "routes/dashboard/overview/performance.tsx")
        .nav({ label: "Performance", iconName: "TrendingUp" }),
      route("metrics", "routes/dashboard/overview/metrics.tsx")
        .nav({ label: "Metrics", iconName: "Clock" }),
    ]),
  );

const analytics = layout("layouts/content.tsx", {
  id: "analytics",
})
  .nav({ label: "Analytics", iconName: "FileText", section: "main" })
  .children(
    ...prefix("analytics", [
      index("routes/dashboard/analytics/summary.tsx")
        .nav({ label: "Analytics", iconName: "BarChart", end: true }),
      route("traffic", "routes/dashboard/analytics/traffic.tsx")
        .nav({ label: "Traffic", iconName: "Activity" }),
      route("conversion", "routes/dashboard/analytics/conversion.tsx")
        .nav({ label: "Conversion", iconName: "PieChart" }),
    ]),
  );

const reports = layout("layouts/content.tsx", {
  id: "reports",
})
  .nav({ label: "Reports", iconName: "PieChart", section: "main" })
  .children(
    ...prefix("reports", [
      index("routes/dashboard/reports/summary.tsx")
        .nav({ label: "Reports", iconName: "FileText", end: true }),
      route("monthly", "routes/dashboard/reports/monthly.tsx", {
        id: "reports-monthly",
      })
        .nav({ label: "Monthly", iconName: "Calendar" }),
      route("quarterly", "routes/dashboard/reports/quarterly.tsx", {
        id: "reports-quarterly",
      })
        .nav({ label: "Quarterly", iconName: "CalendarDays" }),
      route("annual", "routes/dashboard/reports/annual.tsx", {
        id: "reports-annual",
      })
        .nav({ label: "Annual", iconName: "CalendarRange" }),
    ]),
  );

const dashboard = layout(
  "routes/dashboard/layout.tsx",
  { id: "main" },
)
  .nav({ label: "Dashboard", iconName: "LayoutDashboard", section: "main" })
  .children(
    ...prefix("dashboard", [
      index("routes/dashboard/page.tsx")
        .nav({ label: "Dashboard", iconName: "LayoutDashboard", end: true }),
      overview,
      analytics,
      reports,
    ]),
  );

// —————————————————————————————————————————————————————————————
// 2) User‑management feature routes
// —————————————————————————————————————————————————————————————
const roles = layout("routes/users/layout.tsx", { id: "roles" })
  .nav({ label: "Roles", section: "users" })
  .children(
    ...prefix("roles", [
      index("routes/users/roles/page.tsx", { id: "users-roles-index" })
        .nav({ label: "All Roles", iconName: "Shield", end: true }),
      route("admin", "routes/users/roles/page.tsx", { id: "users-roles-admin" })
        .nav({ label: "Administrators", iconName: "ShieldAlert" }),
      route("editor", "routes/users/roles/page.tsx", {
        id: "users-roles-editor",
      })
        .nav({ label: "Editors", iconName: "Edit" }),
      route("viewer", "routes/users/roles/page.tsx", {
        id: "users-roles-viewer",
      })
        .nav({ label: "Viewers", iconName: "Eye" }),
    ]),
  );

const users = layout("routes/users/layout.tsx", { id: "users" })
  .nav({ label: "Users", iconName: "Users", section: "main" })
  .children(
    ...prefix("users", [
      index("routes/users/page.tsx", { id: "users-index" })
        .nav({ label: "All Users", iconName: "Users", end: true }),
      route("active", "routes/users/page.tsx", { id: "users-active" })
        .nav({ label: "Active Users", iconName: "UserCheck" }),
      route("inactive", "routes/users/page.tsx", { id: "users-inactive" })
        .nav({ label: "Inactive Users", iconName: "UserMinus" }),
      roles,
    ]),
  );

// —————————————————————————————————————————————————————————————
// 3) App shell
// —————————————————————————————————————————————————————————————
const appShell = layout("routes/layout.tsx")
  .children(
    index("routes/page.tsx")
      .nav({ label: "Home", iconName: "Home", end: true, section: "main" }),
    route("settings", "routes/settings/page.tsx")
      .nav({ label: "Settings", iconName: "Settings", section: "main" }),
    dashboard,
    users,
  );

// —————————————————————————————————————————————————————————————
// 4) Export
// —————————————————————————————————————————————————————————————
/** @type {RouteConfig} */
export default build([appShell]);
