// file: src/next/examples/all-in-one.tsx
import { Navigator } from "../";
import { Icons } from "../icons";
import { createIconRenderer } from "../utils/icon";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Mock router adapter
const router = {
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: "/" }),
  matchPath: (pattern: string, pathname: string) => {
    return pathname === pattern ? { pathname } : null;
  },
};

// Example usages
export function DashboardExample({ navTree, section = "main" }) {
  return (
    <Navigator
      navigationTree={navTree}
      section={section}
      router={router}
      renderIcon={renderIcon}
      template="dashboard"
      appTitle="Admin Dashboard"
    />
  );
}

export function DocsExample({ navTree, section = "main" }) {
  return (
    <Navigator
      navigationTree={navTree}
      section={section}
      router={router}
      renderIcon={renderIcon}
      template="docs"
      appTitle="Developer Docs"
    />
  );
}

export function EcommerceExample({ navTree, section = "store" }) {
  return (
    <Navigator
      navigationTree={navTree}
      section={section}
      router={router}
      renderIcon={renderIcon}
      template="ecommerce"
      appTitle="ShopHub"
    />
  );
}

export function NewsExample({ navTree, section = "main" }) {
  return (
    <Navigator
      navigationTree={navTree}
      section={section}
      secondarySection="categories"
      router={router}
      renderIcon={renderIcon}
      template="news"
      appTitle="News"
    />
  );
}
