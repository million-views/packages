import { type RouteConfig } from "@react-router/dev/routes";
import { route, index, layout, build, prefix } from "./lib/rr-builder.ts";


// —————————————————————————————————————————————————————————————
// 1) Dashboard feature routes (owns its own Builder)
// —————————————————————————————————————————————————————————————
const overview = route("overview", "routes/dashboard/overview/layout.tsx")
  .meta({ label: "Summary", iconName: "BarChart" })
  .children(
    index("routes/dashboard/overview/summary.tsx")
      .meta({ label: "Index", iconName: "CircleDot", end: true }),
    route("performance", "routes/dashboard/overview/performance.tsx")
      .meta({ label: "Performance", iconName: "TrendingUp" }),
    route("metrics", "routes/dashboard/overview/metrics.tsx")
      .meta({ label: "Metrics", iconName: "Clock" })
  );

const analytics = route("analytics", "routes/dashboard/analytics/layout.tsx")
  .meta({ label: "Analytics", iconName: "FileText", })
  .children(
    index("routes/dashboard/analytics/summary.tsx")
      .meta({ label: "Index", iconName: "CircleDot", end: true }),
    route("traffic", "routes/dashboard/analytics/traffic.tsx")
      .meta({ label: "Traffic", iconName: "Activity" }),
    route("conversion", "routes/dashboard/analytics/conversion.tsx")
      .meta({ label: "Conversion", iconName: "PieChart" })
  );

const reports = route("reports", "routes/dashboard/reports/layout.tsx")
  .meta({ label: "Reports", iconName: "FileText", })
  .children(
    index("routes/dashboard/reports/summary.tsx")
      .meta({ label: "Index", iconName: "CircleDot", end: true }),
    route("monthly", "routes/dashboard/reports/monthly.tsx")
      .meta({ label: "Monthly", iconName: "Calendar" }),
    route("quarterly", "routes/dashboard/reports/quarterly.tsx")
      .meta({ label: "Quarterly", iconName: "CalendarDays" }),
    route("quarterly", "routes/dashboard/reports/annual.tsx")
      .meta({ label: "Annual", iconName: "CalendarRange" })
  );

const dashboard = route("dashboard", "routes/dashboard/layout.tsx", { id: "main" })
  .meta({ label: "Dashboard", iconName: "dashboard", section: "main" })
  .children(
    overview, analytics, reports
  );

// —————————————————————————————————————————————————————————————
// 2) User‑management feature routes
// —————————————————————————————————————————————————————————————
const roles = route("roles", "routes/dashboard/layout.tsx")
  .meta({ label: "Roles", section: "roles" })
  .children(index("routes/users/roles/page.tsx")
    .meta({ label: "All Roles", iconName: "Shield", end: true }),
    route("admin", "routes/users/roles/admin.tsx")
      .meta({ label: "Administrators", iconName: "ShieldAlert" }),
    route("editor", "routes/users/roles/editor.tsx")
      .meta({ label: "Editors", iconName: "Edit" }),
    route("viewer", "routes/users/roles/viewer.tsx")
      .meta({ label: "Viewers", iconName: "Eye" })
  );

const users = route("users", "routes/dashboard/layout.tsx", { id: "users" })
  .meta({ label: "Users", section: "users" })
  .children(
    index("routes/users/page.tsx")
      .meta({ label: "All Users", iconName: "Users", end: true }),
    route("active", "routes/users/active.tsx")
      .meta({ label: "Active Users", iconName: "UserCheck" }),
    route("inactive", "routes/users/inactive.tsx")
      .meta({ label: "Inactive Users", iconName: "UserMinus" }),
    roles
  );

// —————————————————————————————————————————————————————————————
// 3) Top‑level shell (your “app” layout + main nav items + feature sections)
// —————————————————————————————————————————————————————————————
const appShell = layout("routes/layout.tsx")
  .children(
    index("routes/page.tsx")
      .meta({
        label: "Home",
        iconName: "Home",
        end: true,
        section: "main",
      }),
    route("settings", "routes/settings/page.tsx")
      .meta({ label: "Settings", iconName: "Settings", section: "main" }),
    dashboard,
    users,
  );

// —————————————————————————————————————————————————————————————
// 4) Finally, export exactly the array Router expects
// —————————————————————————————————————————————————————————————
export default build([appShell]) satisfies RouteConfig;
