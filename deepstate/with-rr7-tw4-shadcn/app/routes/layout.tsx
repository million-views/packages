import { Outlet, useLocation, useMatches } from "react-router";
import { Navigator } from "@/components/navigator";
import { getMainNavRoutes, getViewRoutes } from "@/routes";

export default function RootLayout() {
  const location = useLocation();
  const matches = useMatches();

  // Get the main routes for the primary navigation
  const mainRoutes = getMainNavRoutes();

  // Determine the current parent path
  const currentParentPath = matches.length > 1 ? matches[2].pathname : "/";

  // Get view routes for the current parent route
  const viewRoutes = getViewRoutes(currentParentPath);
  console.log(
    "matches",
    matches,
    "main-routes",
    mainRoutes,
    "view-routes",
    viewRoutes,
  );
  return (
    <div className="min-h-screen flex flex-col">
      <Navigator routes={mainRoutes} viewRoutes={viewRoutes} appName="App" />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  );
}
