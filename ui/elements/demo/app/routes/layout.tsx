import { Outlet, useLocation, useNavigate } from "react-router";
import { ActionBar, Brand, Drawer, Header, SearchBox } from "@m5nv/ui-elements";
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
    }
    // Handle other actions...
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
    // Implement search functionality
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
          <h3 style={{ margin: "0 0 var(--mv-space-lg) 0" }}>Navigation</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--mv-space-sm)",
            }}
          >
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                  padding: "var(--mv-space-md)",
                  border: "none",
                  background:
                    location.pathname ===
                        (item.id === "home" ? "/" : `/${item.id}`)
                      ? "var(--mv-color-primary)"
                      : "transparent",
                  color:
                    location.pathname ===
                        (item.id === "home" ? "/" : `/${item.id}`)
                      ? "white"
                      : "var(--mv-color-text-primary)",
                  borderRadius: "var(--mv-radius-md)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: "500" }}>{item.label}</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Drawer>

      <main
        style={{
          minHeight: "calc(100vh - 64px)",
          background: "var(--mv-color-background)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
