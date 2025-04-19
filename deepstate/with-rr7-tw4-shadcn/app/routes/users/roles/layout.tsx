import { Outlet } from "react-router";

export default function RolesLayout() {
  return (
    <div className="flex flex-col">
      {/* No Navigator here - using the central one */}
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Roles</h1>
        <Outlet />
      </div>
    </div>
  );
}
