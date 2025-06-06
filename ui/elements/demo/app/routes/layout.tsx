// ===========================================
// MIGRATED LAYOUT.TSX - UPDATED FOR V2.0
// ===========================================

import { Outlet, useLocation, useNavigate } from "react-router";
import {
  ActionBar,
  Brand,
  Button,
  Card,
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
      description: "Welcome page and theme showcase",
    },
    {
      id: "showcase",
      label: "Container Queries",
      icon: "🚀",
      description: "Revolutionary responsive design demo",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      description: "Business analytics with smart containers",
    },
    {
      id: "ecommerce",
      label: "E-commerce",
      icon: "🛍️",
      description: "Product catalog with responsive layout",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      description: "App configuration and theming",
    },
  ];

  const headerActions: Action[] = [
    { id: "menu", label: "Menu", icon: "☰" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
    { id: "showcase", label: "Container Queries", icon: "🚀" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  const handleNavigation = (item: MenuItem) => {
    const path = item.id === "home" ? "/" : `/${item.id}`;
    navigate(path);
    setDrawerOpen(false);
  };

  const handleActionClick = (action: Action) => {
    if (action.id === "menu") {
      setDrawerOpen(!drawerOpen);
    } else if (action.id === "showcase") {
      navigate("/showcase");
    } else if (action.id === "notifications") {
      console.log("Show notifications");
    } else if (action.id === "profile") {
      console.log("Show profile menu");
    }
  };

  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  // COMPOSITION DEMO: Convert theme options to Action[] data for ActionBar
  const themeActions: Action[] = [
    { id: "ghibli", label: "Ghibli", icon: "🌿" },
    { id: "blue", label: "Blue", icon: "💙" },
    { id: "purple", label: "Purple", icon: "💜" },
    { id: "green", label: "Green", icon: "💚" },
    { id: "orange", label: "Orange", icon: "🧡" },
    { id: "toggle-theme", label: "Toggle Light/Dark", icon: "🌓" },
  ];

  const handleThemeAction = (action: Action) => {
    if (action.id === "toggle-theme") {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("ui-elements-theme", newTheme);
    } else {
      // Handle palette changes
      document.documentElement.setAttribute("data-palette", action.id);
      localStorage.setItem("ui-elements-palette", action.id);
    }
  };

  const getCurrentSelectedItems = () => {
    const currentPath = location.pathname;
    if (currentPath === "/") return ["home"];
    const pathSegment = currentPath.slice(1);
    return navigationItems.some((item) => item.id === pathSegment)
      ? [pathSegment]
      : [];
  };

  return (
    <div className="app-layout">
      {/* FIXED: Header with proper design props */}
      <Header design={{ variant: "raised" }} responsive={true}>
        <Brand
          title="UI Elements"
          subtitle="Container Query Demo"
          logo="🚀"
          design={{ size: "md" }}
          responsive={true}
          href="/"
        />

        <SearchBox
          placeholder="Search demos..."
          design={{ variant: "filled" }}
          onSearch={handleSearch}
          clearable
          className="layout-search"
          responsive={true}
        />

        <div className="header-actions">
          <ActionBar
            actions={headerActions}
            onActionClick={handleActionClick}
            design={{
              position: "right",
              orientation: "horizontal",
              density: "comfortable",
            }}
            responsive={true}
          />
        </div>
      </Header>

      {/* FIXED: Drawer with proper design props */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        design={{ position: "left", mode: "temporary" }}
        responsive={true}
      >
        <h3>🧭 Navigation</h3>

        <List
          items={navigationItems}
          design={{ variant: "detailed" }}
          selectable={true}
          selectedItems={getCurrentSelectedItems()}
          onItemClick={handleNavigation}
          responsive={true}
        />

        {/* Quick Theme Switcher in Drawer */}
        <Card design={{ variant: "outlined", padding: "md" }} responsive={true}>
          <h4>🎨 Quick Theme Switch</h4>
          <div className="grid grid--auto-fit">
            {[
              { id: "ghibli", emoji: "🌿", name: "Ghibli" },
              { id: "blue", emoji: "💙", name: "Blue" },
              { id: "purple", emoji: "💜", name: "Purple" },
              { id: "green", emoji: "💚", name: "Green" },
              { id: "orange", emoji: "🧡", name: "Orange" },
            ].map((palette) => (
              <Button
                key={palette.id}
                design={{ variant: "ghost", size: "sm" }}
                onClick={() => {
                  document.documentElement.setAttribute(
                    "data-palette",
                    palette.id,
                  );
                  localStorage.setItem("ui-elements-palette", palette.id);
                }}
                responsive={true}
              >
                {palette.emoji}
              </Button>
            ))}
          </div>
          <div className="section-spacing">
            <Button
              design={{ variant: "outline", intent: "secondary", size: "sm" }}
              onClick={() => {
                const currentTheme = document.documentElement.getAttribute(
                  "data-theme",
                );
                const newTheme = currentTheme === "light" ? "dark" : "light";
                document.documentElement.setAttribute("data-theme", newTheme);
                localStorage.setItem("ui-elements-theme", newTheme);
              }}
              responsive={true}
            >
              🌓 Toggle Light/Dark
            </Button>
          </div>
        </Card>
      </Drawer>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
