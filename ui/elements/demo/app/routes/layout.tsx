import { Outlet, useLocation, useNavigate } from "react-router";
import {
  ActionBar,
  Brand,
  Drawer,
  Header,
  List,
  SearchBox,
} from "@m5nv/ui-elements";
import { useState } from "react";
import type { Action, MenuItem } from "@m5nv/ui-elements";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems: MenuItem[] = [
    {
      id: "home",
      label: "Home",
      icon: "🏠",
      description: "Welcome & overview",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Business analytics",
    },
    {
      id: "ecommerce",
      label: "E-commerce",
      icon: "🛍️",
      description: "Product catalog",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      description: "App configuration",
    },
  ];

  const headerActions: Action[] = [
    {
      id: "menu",
      label: "Menu",
      icon: "☰",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "🔔",
      badge: 3,
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
    },
  ];

  const handleNavigation = (item: MenuItem) => {
    const path = item.id === "home" ? "/" : `/${item.id}`;
    navigate(path);
    setDrawerOpen(false);
  };

  const handleActionClick = (action: Action) => {
    if (action.id === "menu") {
      setDrawerOpen(!drawerOpen);
    } else if (action.id === "notifications") {
      console.log("Show notifications");
    } else if (action.id === "profile") {
      console.log("Show profile menu");
    }
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
    // Implement search functionality
  };

  // Get selected navigation items based on current route
  const getCurrentSelectedItems = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return ["home"];
    const pathSegment = currentPath.slice(1); // Remove leading slash
    return navigationItems.some((item) => item.id === pathSegment)
      ? [pathSegment]
      : [];
  };

  return (
    <div className="app-layout">
      <Header variant="elevated">
        <Brand
          title="UI Elements Demo"
          subtitle="Showcase App"
          logo="🚀"
        />

        <SearchBox
          placeholder="Search demos..."
          variant="filled"
          onSearch={handleSearch}
          clearable
          className="layout-search"
        />

        <ActionBar
          actions={headerActions}
          onActionClick={handleActionClick}
          position="right"
        />
      </Header>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="left"
        mode="temporary"
      >
        <div style={{ padding: "var(--mv-space-lg)" }}>
          <h3
            style={{
              margin: "0 0 var(--mv-space-lg) 0",
              color: "var(--mv-color-text-primary)",
              fontSize: "var(--mv-font-size-lg)",
              fontWeight: "var(--mv-font-weight-semibold)",
            }}
          >
            Navigation
          </h3>

          {/* Use List component instead of custom buttons - much cleaner! */}
          <List
            items={navigationItems}
            variant="detailed"
            selectable={true}
            selectedItems={getCurrentSelectedItems()}
            onItemClick={handleNavigation}
          />
        </div>
      </Drawer>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
