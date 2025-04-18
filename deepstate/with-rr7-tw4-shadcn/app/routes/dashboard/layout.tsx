import { NavLink, Outlet, Route, Routes, useLocation } from "react-router";
export function DashboardNavigation() {
  return (
    <nav>
      <NavLink to="/dashboard" end>
        Dashboard Home
      </NavLink>
      <NavLink to="/dashboard/analytics">Analytics</NavLink>
      <NavLink to="/dashboard/reports">Reports</NavLink>
    </nav>
  );
}

export default function DashboardLayout() {
  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <DashboardNavigation />
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <Outlet />
    </div>
  );
}

// export default function () {
//   const location = useLocation();
//   console.log(location);
//   return (
//     <Routes>
//       <Route path="dashboard" element={<DashboardLayout />}>
//         <Route path="analytics" />
//         <Route path="reports" Component={DashboardReportsPage} />
//         <Route index Component={DashboardOverview} />
//       </Route>
//     </Routes>
//   );
// }
