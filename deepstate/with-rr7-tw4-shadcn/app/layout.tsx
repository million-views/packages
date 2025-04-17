import { Outlet } from "react-router";
import { navigationItems, primaryTasks } from "./navigation";
import Navigator from "./navigator";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigator items={navigationItems} primaryTasks={primaryTasks} />
      <Outlet />
    </div>
  );
}
