import { Outlet, useNavigation } from "react-router";
import { Loader } from "lucide-react";
import { navigationTree, useHydratedMatches } from "@/lib/nav5";

// import Navigator from "@/components/navigator5";
import Navigator from "@/components/navigator6";

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
      <Navigator
        navigationTree={navigationTree}
        useHydratedMatches={useHydratedMatches}
      />
      <main className="flex-1 container p-6">
        <Outlet />
      </main>
    </div>
  );
}
