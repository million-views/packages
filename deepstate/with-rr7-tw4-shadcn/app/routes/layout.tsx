import { Outlet, useLocation, useMatches } from "react-router";
import { Navigator } from "@/components/navigator";
import routes from "@/routes";

export default function RootLayout() {
  const location = useLocation();
  // console.log("routes", routes);
  // const matches = useMatches();
  // matches.forEach((element) => console.log("Root.Layout", element));

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator routes={routes} appName="App" />
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  );
}
