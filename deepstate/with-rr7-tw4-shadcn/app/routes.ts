import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes"

// Define icon types without JSX
export interface RouteMetadata {
  label: string
  iconName?: string
  end?: boolean
  views?: RouteViewMetadata[]
}

export interface RouteViewMetadata {
  path: string
  label: string
  iconName?: string
  end?: boolean
}

// Navigation metadata for routes
export const routeMetadata: Record<string, RouteMetadata> = {
  "/": {
    label: "Home",
    iconName: "Home",
    end: true,
  },
  "/dashboard": {
    label: "Dashboard",
    iconName: "LayoutDashboard",
    views: [
      {
        path: "/dashboard",
        label: "Overview",
        end: true,
      },
      {
        path: "/dashboard/analytics",
        label: "Analytics",
        iconName: "BarChart2",
      },
      {
        path: "/dashboard/reports",
        label: "Reports",
        iconName: "FileBarChart",
      },
    ],
  },
  "/users": {
    label: "Users",
    iconName: "Users",
  },
  "/settings": {
    label: "Settings",
    iconName: "Settings",
  },
}

// Define routes using helper functions
export default [
  layout("routes/layout.tsx", [
    index("routes/page.tsx"), // home
    ...prefix("dashboard", [
      index("routes/dashboard/page.tsx"),
      route("analytics", "routes/dashboard/analytics/page.tsx"),
      route("reports", "routes/dashboard/reports/page.tsx"),
    ]
    ),
    route("users", "routes/users/page.tsx"),
    route("settings", "routes/settings/page.tsx"),
  ]),
] satisfies RouteConfig

// Helper function to get main navigation routes
export function getMainNavRoutes() {
  return Object.entries(routeMetadata).map(([path, metadata]) => ({
    path,
    ...metadata,
  }))
}

// Helper function to get view routes for a specific page
export function getViewRoutes(parentPath: string) {
  const metadata = routeMetadata[parentPath]
  return metadata?.views || []
}
