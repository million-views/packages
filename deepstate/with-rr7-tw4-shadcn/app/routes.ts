import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

const dashboard_routes = [
  route("dashboard", "routes/dashboard/$index.tsx"),
  // route("settings", "routes/dashboard/$settings.tsx"),
];

const user_routes = [
  route("users", "routes/users/$index.tsx"),
];


const global_routes = [
  layout("./layout.tsx", [
    index("routes/$home.tsx"),
    ...dashboard_routes,
    ...user_routes
  ])
];


// const user_routes = layout("routes/users/layout.tsx", [
//   index("routes/users/$index.tsx"),
//   route(":id/comments/:comment_id", "routes/users/$comment.tsx"),
// ]);

export default [
  ...global_routes,
  // dashboard_routes,
  // user_routes,
] satisfies RouteConfig;

