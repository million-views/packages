import type { RouteConfig } from "@react-router/dev/routes";
import { route, index, layout, build } from "./lib/rr-builder.ts";

// —————————————————————————————————————————————————————————————
// 1) Dashboard feature routes (owns its own Builder)
// —————————————————————————————————————————————————————————————
const dashboardSection = layout("routes/dashboard/layout.tsx", { id: "main" })
  .meta({ label: "Dashboard", iconName: "dashboard", section: "main" })
  .children(
    route("overview", "routes/dashboard/overview/layout.tsx")
      .meta({ label: "Summary", iconName: "BarChart" })
      .children(
        index("routes/dashboard/overview/summary.tsx")
          .meta({ label: "Summary", iconName: "CircleDot", end: true }),
        route("performance", "routes/dashboard/overview/performance.tsx")
          .meta({ label: "Performance", iconName: "TrendingUp" }),
        route("metrics", "routes/dashboard/overview/metrics.tsx")
          .meta({ label: "Metrics", iconName: "Clock" })
      ),
    route("analytics", "routes/dashboard/analytics/layout.tsx")
      .meta({ label: "Analytics", iconName: "FileText", })
      .children(
        index("routes/dashboard/analytics/summary.tsx")
          .meta({ label: "Summary", iconName: "CircleDot", end: true }),
        route("traffic", "routes/dashboard/analytics/traffic.tsx")
          .meta({ label: "Traffic", iconName: "Activity" }),
        route("conversion", "routes/dashboard/analytics/conversion.tsx")
          .meta({ label: "Conversion", iconName: "PieChart" })
      )
  );

// —————————————————————————————————————————————————————————————
// 2) User‑management feature routes
// —————————————————————————————————————————————————————————————
const userSection = route("users", "routes/dashboard/layout.tsx")
  .meta({ label: "Users", section: "users" })
  .children(
    index("routes/users/page.tsx")
      .meta({ label: "All Users", iconName: "Users", end: true }),
    route("active", "routes/users/active.tsx")
      .meta({ label: "Active Users", iconName: "UserCheck" }),
    route("inactive", "routes/users/inactive.tsx")
      .meta({ label: "Inactive Users", iconName: "UserMinus" }),
    layout("routes/dashboard/layout.tsx", { id: "users" })
      .meta({ label: "Roles", section: "roles" })
      .children(
        index("routes/users/roles/page.tsx")
          .meta({ label: "All Roles", iconName: "Shield", end: true }),
        route("admin", "routes/users/roles/admin.tsx")
          .meta({ label: "Administrators", iconName: "ShieldAlert" }),
        route("editor", "routes/users/roles/editor.tsx")
          .meta({ label: "Editors", iconName: "Edit" }),
        route("viewer", "routes/users/roles/viewer.tsx")
          .meta({ label: "Viewers", iconName: "Eye" })
      )
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
    dashboardSection,
    userSection,
  );

// —————————————————————————————————————————————————————————————
// 4) Finally, export exactly the array Router expects
// —————————————————————————————————————————————————————————————
export default build([appShell]) satisfies RouteConfig;
