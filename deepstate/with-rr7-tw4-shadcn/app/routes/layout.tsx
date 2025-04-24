import { Outlet, useNavigation } from "react-router";
import { Loader } from "lucide-react";
import Navigator from "@/components/navigator4";

/**
 * Root layout component that includes the Navigator and content area
 */
export default function RootLayout() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  return (
    <div className="min-h-screen flex flex-col">
      {/* Global navigation loading indicator */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
      <Navigator />
      <main className="flex-1 container p-6">
        <Outlet />
      </main>
    </div>
  );
}
