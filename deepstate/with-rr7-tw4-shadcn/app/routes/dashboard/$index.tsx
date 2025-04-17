// import type { Route } from "./+types/$index";
import DashboardPage from "~/routes/dashboard/view";
import Analytics from "~/routes/dashboard/analytics";
import Reports from "~/routes/dashboard/reports";
import Performance from "~/routes/dashboard/performance";
import { Outlet, Route, Routes, useLocation } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Fancy Dashboard" },
    { name: "description", content: "Welcome to my Dashboard!" },
  ];
}

function Layout() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <Outlet />
    </main>
  );
}

export default function () {
  const location = useLocation();
  console.log(location);
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="performance" element={<Performance />} />
      </Route>
    </Routes>
  );
  // return <DashboardPage />;
}
