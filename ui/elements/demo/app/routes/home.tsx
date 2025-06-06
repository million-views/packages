// ===========================================
// MIGRATED HOME.TSX - UPDATED FOR V2.0
// ===========================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ActionBar, Button, Card, List } from "@m5nv/ui-elements";
import type { Action, MenuItem } from "@m5nv/ui-elements";

type Palette = "ghibli" | "blue" | "purple" | "green" | "orange";
type Theme = "light" | "dark";

export default function Home() {
  const navigate = useNavigate();
  const [palette, setPalette] = useState<Palette>("ghibli");
  const [theme, setTheme] = useState<Theme>("light");

  // Apply theme and palette to document
  useEffect(() => {
    const savedPalette =
      (localStorage.getItem("ui-elements-palette") as Palette) || "ghibli";
    const savedTheme = (localStorage.getItem("ui-elements-theme") as Theme) ||
      "light";

    setPalette(savedPalette);
    setTheme(savedTheme);

    document.documentElement.setAttribute("data-palette", savedPalette);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("ui-elements-theme", newTheme);
  };

  const quickActions: Action[] = [
    { id: "showcase", label: "Container Queries", icon: "🚀" },
    { id: "dashboard", label: "View Dashboard", icon: "📊" },
    { id: "ecommerce", label: "Browse Products", icon: "🛍️" },
    { id: "settings", label: "Configure App", icon: "⚙️" },
  ];

  const featureItems: MenuItem[] = [
    {
      id: "layout",
      label: "Layout Elements",
      icon: "🏗️",
      description:
        "Header, Brand, Card, and Drawer components with container-aware behavior",
    },
    {
      id: "interactive",
      label: "Interactive Elements",
      icon: "🎯",
      description:
        "Button and SearchBox components that adapt to their container space",
    },
    {
      id: "data-driven",
      label: "Data-Driven Components",
      icon: "📋",
      description:
        "Complex components with intelligent container-aware responsive behavior",
    },
  ];

  const paletteOptions = [
    { id: "ghibli", label: "Ghibli", emoji: "🌿", color: "#7c9885" },
    { id: "blue", label: "Blue", emoji: "💙", color: "#3b82f6" },
    { id: "purple", label: "Purple", emoji: "💜", color: "#8b5cf6" },
    { id: "green", label: "Green", emoji: "💚", color: "#10b981" },
    { id: "orange", label: "Orange", emoji: "🧡", color: "#f97316" },
  ];

  const handleQuickAction = (action: Action) => {
    navigate(`/${action.id}`);
  };

  const handlePaletteChange = (newPalette: Palette) => {
    setPalette(newPalette);
    document.documentElement.setAttribute("data-palette", newPalette);
    localStorage.setItem("ui-elements-palette", newPalette);
  };

  const handleFeatureClick = (item: MenuItem) => {
    console.log("Feature clicked:", item.label);
  };

  // COMPOSITION DEMO: Convert palette options to Action[] data with visual feedback
  const paletteActions: Action[] = paletteOptions.map((option) => ({
    id: option.id,
    label: palette === option.id ? `${option.label} ✓` : option.label,
    icon: option.emoji,
  }));

  const handlePaletteAction = (action: Action) => {
    handlePaletteChange(action.id as Palette);
  };

  return (
    <div className="page-container">
      {/* Theme Showcase - FIXED: Proper design prop usage */}
      <Card design={{ variant: "outlined", padding: "lg" }}>
        <header className="page-header">
          <div>
            <h2 className="page-title">🎨 Live Multi-Palette Demo</h2>
            <p className="page-description">
              Experience our complete theming system: 5 color palettes × 2
              themes = 10 unique looks!
            </p>
          </div>
          <Button
            design={{ variant: "filled", intent: "primary", size: "md" }}
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙 Switch to Dark" : "🌅 Switch to Light"}
          </Button>
        </header>

        <p className="text-small text-muted">
          Current: {paletteOptions.find((p) => p.id === palette)?.emoji}{" "}
          {palette} ({theme === "light" ? "🌅" : "🌙"})
        </p>

        {
          /*
          COMPOSITION DEMO: Palette Selection using ActionBar + Action data
          Using ActionBar + Action[] data instead of manual Button
          mapping.<br />
          <em>Before:</em> 12 lines of JSX mapping • <em>After:</em>{" "}
            1 ActionBar component with data
        */
        }
        <div className="section-spacing">
          <ActionBar
            actions={paletteActions}
            onActionClick={handlePaletteAction}
            design={{
              orientation: "horizontal",
              density: "comfortable",
              variant: "default",
            }}
            responsive={true}
          />

          <p className="text-small text-muted section-spacing">
            ✨ <strong>Benefits:</strong>{" "}
            Data-driven • Responsive layout • Consistent styling • Less code
          </p>
        </div>

        {/* Theme Preview Cards */}
        <div className="theme-preview section-spacing">
          <div className="theme-preview__card theme-preview__card--primary">
            <div className="theme-preview__icon">🎨</div>
            <div className="theme-preview__label">Primary Color</div>
          </div>
          <div className="theme-preview__card theme-preview__card--success">
            <div className="theme-preview__icon">🌱</div>
            <div className="theme-preview__label">Success Color</div>
          </div>
          <div className="theme-preview__card theme-preview__card--warning">
            <div className="theme-preview__icon">☀️</div>
            <div className="theme-preview__label">Warning Color</div>
          </div>
          <div className="theme-preview__card theme-preview__card--danger">
            <div className="theme-preview__icon">🌸</div>
            <div className="theme-preview__label">Danger Color</div>
          </div>
        </div>
      </Card>

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero__title">@m5nv/ui-elements</h1>
        <p className="hero__description">
          Multi-palette, data-driven, themeable UI component library built with
          modern CSS. Unlike headless UI libraries, Elements provides complete
          styled components with comprehensive theming and revolutionary
          container query support.
        </p>

        <div className="hero__actions">
          <Button
            design={{ variant: "filled", intent: "primary", size: "lg" }}
            onClick={() => navigate("/showcase")}
          >
            🚀 Container Query Demo
          </Button>
          <Button
            design={{ variant: "outline", intent: "secondary", size: "lg" }}
            onClick={() => navigate("/dashboard")}
          >
            📊 Dashboard Example
          </Button>
          <Button
            design={{ variant: "ghost", size: "lg" }}
            onClick={() => navigate("/ecommerce")}
          >
            🛍️ E-commerce Demo
          </Button>
        </div>
      </section>

      {/* FIXED: Quick Actions with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }}>
        <h2>Quick Actions</h2>
        <div className="section-spacing">
          <ActionBar
            actions={quickActions}
            onActionClick={handleQuickAction}
            design={{
              position: "left",
              orientation: "horizontal",
              density: "comfortable",
            }}
            responsive={true}
          />
        </div>
      </Card>

      {/* FIXED: Feature Showcase with proper design props */}
      <Card design={{ variant: "outlined", padding: "lg" }}>
        <h2>Component Categories</h2>
        <div className="section-spacing">
          <List
            items={featureItems}
            design={{ variant: "detailed" }}
            onItemClick={handleFeatureClick}
            responsive={true}
          />
        </div>
      </Card>

      {/* FIXED: Benefits Section with proper design props */}
      <Card design={{ variant: "glass", padding: "lg" }}>
        <h2 className="text-center">Why Choose Elements?</h2>

        <div className="grid grid--three-col section-spacing">
          <div className="text-center">
            <div className="font-size-4xl">🎨</div>
            <h3>Multi-Palette System</h3>
            <p className="text-muted">
              5 beautiful color palettes, each with light and dark variants
            </p>
          </div>
          <div className="text-center">
            <div className="font-size-4xl">📊</div>
            <h3>Data-Driven</h3>
            <p className="text-muted">
              Pass data arrays instead of writing complex markup structures
            </p>
          </div>
          <div className="text-center">
            <div className="font-size-4xl">🚀</div>
            <h3>Container Queries</h3>
            <p className="text-muted">
              Components adapt intelligently to their container width
            </p>
          </div>
        </div>

        <div className="text-center section-spacing">
          <Button
            design={{ variant: "filled", intent: "primary", size: "lg" }}
            onClick={() => navigate("/showcase")}
          >
            🚀 See Container Queries in Action
          </Button>
        </div>
      </Card>
    </div>
  );
}
