import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/layout.tsx",
    children: [
      {
        index: true,
        file: "routes/home.tsx",
      },
      {
        path: "dashboard",
        file: "routes/dashboard.tsx",
      },
      {
        path: "ecommerce",
        file: "routes/ecommerce.tsx",
      },
      {
        path: "settings",
        file: "routes/settings.tsx",
      },
    ],
  },
] satisfies RouteConfig;