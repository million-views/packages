import { useEffect, useState } from "react";
import { ActionBar, Button, Card } from "@m5nv/ui-elements";
import { useNavigate } from "react-router";
import type { Action } from "@m5nv/ui-elements";

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

  const features = [
    {
      title: "Layout Elements",
      description: "Header, Brand, Card, and Drawer components for structure",
      icon: "🏗️",
      examples: [
        "Header with variants",
        "Responsive brand display",
        "Flexible card containers",
        "Slide-out drawers",
      ],
    },
    {
      title: "Interactive Elements",
      description: "Button and SearchBox components for user interaction",
      icon: "🎯",
      examples: [
        "Multi-variant buttons",
        "Loading states",
        "Expandable search",
        "Clear functionality",
      ],
    },
    {
      title: "Data-Driven Components",
      description: "Complex components that handle data structures efficiently",
      icon: "📋",
      examples: [
        "Sortable tables",
        "Dropdown selects",
        "Tab navigation",
        "Action toolbars",
      ],
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

  return (
    <div style={{ padding: "var(--mv-space-2xl)" }}>
      {/* Theme Showcase Section */}
      <Card variant="elevated" padding="lg">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--mv-space-lg)",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 var(--mv-space-sm) 0" }}>
              🎨 Live Multi-Palette Demo
            </h3>
            <p
              style={{
                margin: 0,
                color: "var(--mv-color-text-secondary)",
                fontSize: "var(--mv-font-size-sm)",
              }}
            >
              Experience our complete theming system: 5 color palettes × 2
              themes = 10 unique looks!
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "var(--mv-space-md)",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "var(--mv-font-size-sm)",
                color: "var(--mv-color-text-secondary)",
                fontWeight: "var(--mv-font-weight-medium)",
              }}
            >
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
          <div
            style={{
              display: "flex",
              gap: "var(--mv-space-md)",
              flexWrap: "wrap",
            }}
          >
            {paletteOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePaletteChange(option.id as Palette)}
                style={{
                  padding: "var(--mv-space-md) var(--mv-space-lg)",
                  borderRadius: "var(--mv-radius-md)",
                  border: palette === option.id
                    ? "3px solid var(--mv-color-primary)"
                    : "2px solid var(--mv-color-border)",
                  background: palette === option.id
                    ? "var(--mv-color-primary)"
                    : "var(--mv-color-surface)",
                  color: palette === option.id
                    ? "var(--mv-color-text-inverse)"
                    : "var(--mv-color-text-primary)",
                  cursor: "pointer",
                  transition: "var(--mv-transition-fast)",
                  fontWeight: "var(--mv-font-weight-medium)",
                }}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preview Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--mv-space-md)",
          }}
        >
          <div
            style={{
              padding: "var(--mv-space-lg)",
              borderRadius: "var(--mv-radius-md)",
              background: "var(--mv-color-primary)",
              color: "var(--mv-color-text-inverse)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "2rem", marginBottom: "var(--mv-space-sm)" }}
            >
              🎨
            </div>
            <div
              style={{
                fontSize: "var(--mv-font-size-sm)",
                fontWeight: "var(--mv-font-weight-semibold)",
              }}
            >
              Primary Color
            </div>
          </div>

          <div
            style={{
              padding: "var(--mv-space-lg)",
              borderRadius: "var(--mv-radius-md)",
              background: "var(--mv-color-success)",
              color: "var(--mv-color-text-inverse)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "2rem", marginBottom: "var(--mv-space-sm)" }}
            >
              🌱
            </div>
            <div
              style={{
                fontSize: "var(--mv-font-size-sm)",
                fontWeight: "var(--mv-font-weight-semibold)",
              }}
            >
              Success Color
            </div>
          </div>

          <div
            style={{
              padding: "var(--mv-space-lg)",
              borderRadius: "var(--mv-radius-md)",
              background: "var(--mv-color-warning)",
              color: "var(--mv-color-text-inverse)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "2rem", marginBottom: "var(--mv-space-sm)" }}
            >
              ☀️
            </div>
            <div
              style={{
                fontSize: "var(--mv-font-size-sm)",
                fontWeight: "var(--mv-font-weight-semibold)",
              }}
            >
              Warning Color
            </div>
          </div>

          <div
            style={{
              padding: "var(--mv-space-lg)",
              borderRadius: "var(--mv-radius-md)",
              background: "var(--mv-color-danger)",
              color: "var(--mv-color-text-inverse)",
              textAlign: "center",
            }}
          >
            <div
              style={{ fontSize: "2rem", marginBottom: "var(--mv-space-sm)" }}
            >
              🌸
            </div>
            <div
              style={{
                fontSize: "var(--mv-font-size-sm)",
                fontWeight: "var(--mv-font-weight-semibold)",
              }}
            >
              Danger Color
            </div>
          </div>
        </div>
      </Card>

      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "var(--mv-space-2xl)",
          maxWidth: "800px",
          margin: "var(--mv-space-2xl) auto var(--mv-space-2xl) auto",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            margin: "0 0 var(--mv-space-lg) 0",
            background:
              "linear-gradient(135deg, var(--mv-color-primary), var(--mv-color-success))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          @m5nv/ui-elements
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--mv-color-text-secondary)",
            margin: "0 0 var(--mv-space-xl) 0",
            lineHeight: "1.6",
          }}
        >
          Multi-palette, data-driven, themeable UI component library built with
          modern CSS. Unlike headless libraries, Elements delivers complete
          styled components with comprehensive theming.
        </p>

        <div
          style={{
            display: "flex",
            gap: "var(--mv-space-md)",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
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

      {/* Feature Showcase */}
      <div
        style={{
          marginTop: "var(--mv-space-2xl)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--mv-space-xl)",
        }}
      >
        {features.map((feature, index) => (
          <Card key={index} variant="outlined" padding="lg">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--mv-space-md)",
                marginBottom: "var(--mv-space-md)",
              }}
            >
              <span style={{ fontSize: "2rem" }}>{feature.icon}</span>
              <h3 style={{ margin: 0 }}>{feature.title}</h3>
            </div>

            <p
              style={{
                color: "var(--mv-color-text-secondary)",
                marginBottom: "var(--mv-space-lg)",
              }}
            >
              {feature.description}
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "var(--mv-space-sm)",
              }}
            >
              {feature.examples.map((example, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--mv-space-sm)",
                  }}
                >
                  <span style={{ color: "var(--mv-color-success)" }}>✓</span>
                  <span style={{ fontSize: "0.875rem" }}>{example}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card variant="glass" padding="lg" className="benefits-card">
        <div style={{ marginTop: "var(--mv-space-2xl)" }}>
          <h2
            style={{ textAlign: "center", marginBottom: "var(--mv-space-xl)" }}
          >
            Why Choose Elements?
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "var(--mv-space-lg)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "3rem", marginBottom: "var(--mv-space-md)" }}
              >
                🎨
              </div>
              <h3>Multi-Palette System</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                5 beautiful color palettes, each with light and dark variants
                for 10 total themes
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "3rem", marginBottom: "var(--mv-space-md)" }}
              >
                📊
              </div>
              <h3>Data-Driven</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Pass data arrays instead of writing complex markup structures
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: "3rem", marginBottom: "var(--mv-space-md)" }}
              >
                ⚡
              </div>
              <h3>Instant Theme Switching</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                CSS custom properties enable instant theme changes across your
                entire application
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
