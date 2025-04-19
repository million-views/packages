import { type RouteConfig } from '@react-router/dev/routes';
import { route, index, layout, prefix } from './lib/rr-helpers';

export default [
  layout("routes/layout.tsx", [
    index("routes/page.tsx", {
      label: "Home",
      iconName: "home",
      end: true,
      section: "main"
    }),

    route(
      "dashboard",
      "routes/dashboard/page.tsx", {
      label: "Dashboard",
      iconName: "dashboard",
      end: true,
      section: "main"
    },
      [
        index("routes/dashboard/summary.tsx"),
        route("analytics", "routes/dashboard/analytics/page.tsx", {
          label: "Analytics",
          iconName: "BarChart2",
          section: "main"
        }),
        route("reports", "routes/dashboard/reports/page.tsx", {
          label: "Reports",
          iconName: "FileBarChart",
          section: "main"
        }),
      ]
    ),

    route("users", "routes/users/page.tsx", {
      label: "Users",
      iconName: "Users",
      section: "main"
    }),
    route("settings", "routes/settings/page.tsx", {
      label: "Settings",
      iconName: "Settings",
      section: "main"
    }),
  ]),
] satisfies RouteConfig;
