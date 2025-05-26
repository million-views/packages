// file: src/next/examples/all-in-one.tsx
import { Navigator } from "../Navigator";
import { Icons } from "../icons";
import { createIconRenderer } from "../utils/icon";
import MockContent from "./MockContent";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Mock router adapter
const useLocation = () => ({ pathname: "/" });
const router = {
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
  useLocation,
  matchPath: (pattern: string, pathname: string) => {
    return pathname === pattern ? { pathname } : null;
  },
};

// Example usages
export function DashboardExample(
  { navTree, section = "main", darkMode = false },
) {
  // Apply dark mode if enabled
  if (darkMode) {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator
        navigationTree={navTree}
        section={section}
        router={router}
        renderIcon={renderIcon}
        template="dashboard"
        appTitle="Admin Dashboard"
        logo="LayoutDashboard"
      />
      <main className="flex-1 p-6">
        <MockContent useLocation={router.useLocation} />
      </main>
    </div>
  );
}

export function DocsExample({ navTree, section = "main", darkMode = false }) {
  if (darkMode) {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator
        navigationTree={navTree}
        section={section}
        router={router}
        renderIcon={renderIcon}
        template="docs"
        appTitle="Developer Docs"
      />
      <main className="flex-1 p-6">
        <MockContent useLocation={router.useLocation} />
      </main>
    </div>
  );
}

export function EcommerceExample(
  { navTree, section = "store", darkMode = false },
) {
  if (darkMode) {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator
        navigationTree={navTree}
        section={section}
        router={router}
        renderIcon={renderIcon}
        template="ecommerce"
        appTitle="ShopHub"
      />
      <main className="flex-1 p-6">
        <MockContent useLocation={router.useLocation} />
      </main>
    </div>
  );
}

export function NewsExample(
  {
    navTree,
    section = "main",
    secondarySection = "categories",
    darkMode = false,
  },
) {
  if (darkMode) {
    document.documentElement.classList.add("dark-mode");
  } else {
    document.documentElement.classList.remove("dark-mode");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigator
        navigationTree={navTree}
        section={section}
        secondarySection={secondarySection}
        router={router}
        renderIcon={renderIcon}
        template="news"
        appTitle="News"
      />
      <main className="flex-1 p-6">
        <MockContent useLocation={router.useLocation} />
      </main>
    </div>
  );
}
