import { useEffect, useState } from "react";
import { ActionBar, Button, Card, List } from "@m5nv/ui-elements";
import { useNavigate } from "react-router";
import type { Action, MenuItem } from "@m5nv/ui-elements";

type Palette = "ghibli" | "blue" | "purple" | "green" | "orange";
type Theme = "light" | "dark";

export default function Home() {
  const navigate = useNavigate();
  const [palette, setPalette] = useState<Palette>("ghibli");
  const [theme, setTheme] = useState<Theme>("light");

  // Apply theme and palette to document
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    document.documentElement.setAttribute("data-theme", theme);
  }, [palette, theme]);

  const toggleTheme = () => {
    setTheme((prev) => prev === "light" ? "dark" : "light");
  };

  const quickActions: Action[] = [
    {
      id: "dashboard",
      label: "View Dashboard",
      icon: "📊",
    },
    {
      id: "ecommerce",
      label: "Browse Products",
      icon: "🛍️",
    },
    {
      id: "settings",
      label: "Configure App",
      icon: "⚙️",
    },
    {
      id: "docs",
      label: "Documentation",
      icon: "📚",
      external: true,
      href: "https://github.com/m5nv/ui-elements",
    },
  ];

  // Convert features to MenuItem format for better semantic markup
  const featureItems: MenuItem[] = [
    {
      id: "layout",
      label: "Layout Elements",
      icon: "🏗️",
      description: "Header, Brand, Card, and Drawer components for structure",
    },
    {
      id: "interactive",
      label: "Interactive Elements",
      icon: "🎯",
      description: "Button and SearchBox components for user interaction",
    },
    {
      id: "data-driven",
      label: "Data-Driven Components",
      icon: "📋",
      description: "Complex components that handle data structures efficiently",
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
    if (action.external && action.href) {
      window.open(action.href, "_blank");
    } else {
      navigate(`/${action.id}`);
    }
  };

  const handlePaletteChange = (newPalette: Palette) => {
    setPalette(newPalette);
  };

  const handleFeatureClick = (item: MenuItem) => {
    console.log("Feature clicked:", item.label);
    // Could navigate to specific demo sections
  };

  return (
    <div className="home-container">
      {/* Theme Showcase Section */}
      <Card variant="elevated" padding="lg" className="theme-showcase">
        <div className="showcase-header">
          <div>
            <h3 className="showcase-title">
              🎨 Live Multi-Palette Demo
            </h3>
            <p className="showcase-subtitle">
              Experience our complete theming system: 5 color palettes × 2
              themes = 10 unique looks!
            </p>
          </div>

          <div className="theme-controls">
            <span className="current-theme">
              Current: {paletteOptions.find((p) => p.id === palette)?.emoji}
              {" "}
              {palette} ({theme === "light" ? "🌅" : "🌙"})
            </span>
            <Button
              variant="primary"
              size="md"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙 Switch to Dark" : "🌅 Switch to Light"}
            </Button>
          </div>
        </div>

        {/* Palette Selection */}
        <div style={{ marginBottom: "var(--mv-space-lg)" }}>
          <h4 style={{ margin: "0 0 var(--mv-space-md) 0" }}>
            Choose Your Palette:
          </h4>
          <div className="palette-grid">
            {paletteOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePaletteChange(option.id as Palette)}
                className={`palette-option ${
                  palette === option.id ? "palette-option--selected" : ""
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preview Cards */}
        <div className="theme-preview-grid">
          <div className="preview-card preview-card--primary">
            <div className="preview-icon">🎨</div>
            <div className="preview-label">Primary Color</div>
          </div>

          <div className="preview-card preview-card--success">
            <div className="preview-icon">🌱</div>
            <div className="preview-label">Success Color</div>
          </div>

          <div className="preview-card preview-card--warning">
            <div className="preview-icon">☀️</div>
            <div className="preview-label">Warning Color</div>
          </div>

          <div className="preview-card preview-card--danger">
            <div className="preview-icon">🌸</div>
            <div className="preview-label">Danger Color</div>
          </div>
        </div>
      </Card>

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">
          @m5nv/ui-elements
        </h1>
        <p className="hero-description">
          Multi-palette, data-driven, themeable UI component library built with
          modern CSS. Unlike headless libraries, Elements delivers complete
          styled components with comprehensive theming.
        </p>

        <div className="hero-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard Demo
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/ecommerce")}
          >
            Explore E-commerce
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h2 style={{ margin: "0 0 var(--mv-space-lg) 0" }}>Quick Actions</h2>
        <ActionBar
          actions={quickActions}
          onActionClick={handleQuickAction}
          position="left"
        />
      </Card>

      {/* Feature Showcase - Using List component for semantic markup */}
      <Card variant="outlined" padding="lg" className="features-showcase">
        <h2 style={{ margin: "0 0 var(--mv-space-lg) 0", textAlign: "center" }}>
          Component Categories
        </h2>
        <List
          items={featureItems}
          variant="detailed"
          onItemClick={handleFeatureClick}
        />
      </Card>

      {/* Benefits Section */}
      <Card variant="glass" padding="lg" className="benefits-card">
        <h2 className="benefits-title">
          Why Choose Elements?
        </h2>

        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">🎨</div>
            <h3>Multi-Palette System</h3>
            <p>
              5 beautiful color palettes, each with light and dark variants for
              10 total themes
            </p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">📊</div>
            <h3>Data-Driven</h3>
            <p>
              Pass data arrays instead of writing complex markup structures
            </p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <h3>Instant Theme Switching</h3>
            <p>
              CSS custom properties enable instant theme changes across your
              entire application
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
