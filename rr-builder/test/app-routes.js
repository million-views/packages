import { build, index, layout, prefix, route } from "@m5nv/rr-builder";
// in development, run `npm link @m5nv/rr-builder` in this folder
// to be able to run using node

// to test the routes:
// node src/rr-check.js test/app-routes.js
// or npm run check-app-routes

// —————————————————————————————————————————————————————————————
// 1) Dashboard feature routes
// —————————————————————————————————————————————————————————————
const overview = route("overview", "routes/dashboard/overview/layout.tsx")
  .nav({ label: "Overview", iconName: "BarChart", section: "main" })
  .children(
    index("routes/dashboard/overview/summary.tsx")
      .nav({ label: "Index", iconName: "CircleDot", end: true }),
    route("performance", "routes/dashboard/overview/performance.tsx")
      .nav({ label: "Performance", iconName: "TrendingUp" }),
    route("metrics", "routes/dashboard/overview/metrics.tsx")
      .nav({ label: "Metrics", iconName: "Clock" }),
  );

const analytics = route("analytics", "routes/dashboard/analytics/layout.tsx")
  .nav({ label: "Analytics", iconName: "FileText", section: "main" })
  .children(
    index("routes/dashboard/analytics/summary.tsx")
      .nav({ label: "Index", iconName: "CircleDot", end: true }),
    route("traffic", "routes/dashboard/analytics/traffic.tsx")
      .nav({ label: "Traffic", iconName: "Activity" }),
    route("conversion", "routes/dashboard/analytics/conversion.tsx")
      .nav({ label: "Conversion", iconName: "PieChart" }),
  );

const reports = route("reports", "routes/dashboard/reports/layout.tsx")
  .nav({ label: "Reports", iconName: "PieChart", section: "main" })
  .children(
    index("routes/dashboard/reports/summary.tsx")
      .nav({ label: "Index", iconName: "CircleDot", end: true }),
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
  );

const dashboard = route(
  "dashboard",
  "routes/dashboard/layout.tsx",
  { id: "main" },
)
  .nav({ label: "Dashboard", iconName: "dashboard", section: "main" })
  .children(
    index("routes/dashboard/page.tsx")
      .nav({ label: "Dashboard Home", iconName: "Home", end: true }),
    overview,
    analytics,
    reports,
  );

// —————————————————————————————————————————————————————————————
// 2) User‑management feature routes
// —————————————————————————————————————————————————————————————
const roles = route("roles", "routes/users/roles/layout.tsx")
  .nav({ label: "Roles", section: "users" })
  .children(
    index("routes/users/roles/page.tsx", { id: "users-roles-index" })
      .nav({ label: "All Roles", iconName: "Shield", end: true }),
    route("admin", "routes/users/roles/page.tsx", { id: "users-roles-admin" })
      .nav({ label: "Administrators", iconName: "ShieldAlert" }),
    route("editor", "routes/users/roles/page.tsx", { id: "users-roles-editor" })
      .nav({ label: "Editors", iconName: "Edit" }),
    route("viewer", "routes/users/roles/page.tsx", { id: "users-roles-viewer" })
      .nav({ label: "Viewers", iconName: "Eye" }),
  );

const users = route("users", "routes/users/layout.tsx", { id: "users" })
  .nav({ label: "Users", iconName: "Users", section: "main" })
  .children(
    index("routes/users/page.tsx", { id: "users-index" })
      .nav({ label: "All Users", iconName: "Users", end: true }),
    route("active", "routes/users/page.tsx", { id: "users-active" })
      .nav({ label: "Active Users", iconName: "UserCheck" }),
    route("inactive", "routes/users/page.tsx", { id: "users-inactive" })
      .nav({ label: "Inactive Users", iconName: "UserMinus" }),
    roles,
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
export default build([appShell]);
