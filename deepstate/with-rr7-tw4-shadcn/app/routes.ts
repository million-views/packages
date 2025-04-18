import { type RouteConfig } from '@react-router/dev/routes';
import { route, index, layout, prefix } from '@/lib/rr-helpers';

export default [
  layout("routes/layout.tsx", [
    index("routes/page.tsx", {
      label: "Home",
      iconName: "home",
    }),

    ...prefix("dashboard", [
      index("routes/dashboard/page.tsx", {
        label: "Dashboard",
        iconName: "dashboard",
      }),
      route("analytics", "routes/dashboard/analytics/page.tsx", {
        label: "Analytics",
        iconName: "BarChart2",
      }),
      route("reports", "routes/dashboard/reports/page.tsx", {
        label: "Reports",
        iconName: "FileBarChart",
      }),
    ]),

    route("users", "routes/users/page.tsx", {
      label: "Users",
      iconName: "Users",
    }),
    route("settings", "routes/settings/page.tsx", {
      label: "Settings",
      iconName: "Settings",
    }),
  ]),
] satisfies RouteConfig;
