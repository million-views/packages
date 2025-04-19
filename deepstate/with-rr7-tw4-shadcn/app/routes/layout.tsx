import { Outlet, useLocation, useMatches } from "react-router";
import { Navigator } from "@/components/navigator";
import routes from "@/routes";

export default function RootLayout() {
  const location = useLocation();
  const matches = useMatches();
  console.log("routes", routes);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator routes={routes} appName="App" />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  );
}
