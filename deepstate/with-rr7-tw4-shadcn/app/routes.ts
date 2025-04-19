import type { RouteConfig } from "@react-router/dev/routes"
import { route, index, layout } from "./lib/rr-helpers"
import type { NavRoute } from "./lib/rr-helpers"

// Define our application routes with integrated metadata
export default [
  layout(
    "routes/layout.tsx",
    [
      // Level 1 routes - Main navigation
      index("routes/page.tsx", {
        label: "Home",
        iconName: "Home",
        end: true,
      }),

      // Dashboard section with nested routes
      layout(
        "routes/dashboard/layout.tsx",
        [
          // Level 2 routes - Dashboard sections
          layout(
            "routes/dashboard/overview/layout.tsx",
            [
              // Level 3 routes - Overview subsections
              index("routes/dashboard/overview/summary.tsx", {
                label: "Summary",
                iconName: "CircleDot",
                end: true,
              }),
              route("performance", "routes/dashboard/overview/performance.tsx", {
                label: "Performance",
                iconName: "TrendingUp",
              }),
              route("metrics", "routes/dashboard/overview/metrics.tsx", {
                label: "Metrics",
                iconName: "Clock",
              }),
            ]
          ),

          // Analytics section
          layout(
            "routes/dashboard/analytics/layout.tsx",
            [
              // Level 3 routes - Analytics subsections
              index("routes/dashboard/analytics/summary.tsx", {
                label: "Summary",
                iconName: "CircleDot",
                end: true,
              }),
              route("traffic", "routes/dashboard/analytics/traffic.tsx", {
                label: "Traffic",
                iconName: "Activity",
              }),
              route("conversion", "routes/dashboard/analytics/conversion.tsx", {
                label: "Conversion",
                iconName: "PieChart",
              }),
            ]
          ),

          // Reports section
          layout(
            "routes/dashboard/reports/layout.tsx",
            [
              // Level 3 routes - Reports subsections
              index("routes/dashboard/reports/summary.tsx", {
                label: "Summary",
                iconName: "CircleDot",
                end: true,
              }),
              route("monthly", "routes/dashboard/reports/monthly.tsx", {
                label: "Monthly",
                iconName: "Calendar",
              }),
              route("quarterly", "routes/dashboard/reports/quarterly.tsx", {
                label: "Quarterly",
                iconName: "CalendarDays",
              }),
              route("annual", "routes/dashboard/reports/annual.tsx", {
                label: "Annual",
                iconName: "CalendarRange",
              }),
            ]
          ),
        ]
      ),

      // Users section with nested routes
      layout(
        "routes/users/layout.tsx",
        [
          // Level 2 routes - User management
          index("routes/users/page.tsx", {
            label: "All Users",
            iconName: "Users",
            end: true,
          }),
          route("active", "routes/users/active.tsx", {
            label: "Active Users",
            iconName: "UserCheck",
          }),
          route("inactive", "routes/users/inactive.tsx", {
            label: "Inactive Users",
            iconName: "UserMinus",
          }),

          // User roles section - Level 2
          layout(
            "routes/users/roles/layout.tsx",
            [
              // Level 3 routes - Roles subsections
              index("routes/users/roles/page.tsx", {
                label: "All Roles",
                iconName: "Shield",
                end: true,
              }),
              route("admin", "routes/users/roles/admin.tsx", {
                label: "Administrators",
                iconName: "ShieldAlert",
              }),
              route("editor", "routes/users/roles/editor.tsx", {
                label: "Editors",
                iconName: "Edit",
              }),
              route("viewer", "routes/users/roles/viewer.tsx", {
                label: "Viewers",
                iconName: "Eye",
              }),
            ]
          ),
        ]
      ),

      // Settings section - Level 1
      route("settings", "routes/settings/page.tsx", {
        label: "Settings",
        iconName: "Settings",
      }),
    ]
  ),
] satisfies RouteConfig;
