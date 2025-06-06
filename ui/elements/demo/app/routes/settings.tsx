// ===========================================
// NEW SETTINGS.TSX - PROPER SETTINGS PAGE
// ===========================================

import { useState } from "react";
import {
  ActionBar,
  Button,
  Card,
  CollapsibleSection,
  List,
  TabGroup,
} from "@m5nv/ui-elements";
import type { Action, MenuItem, Tab } from "@m5nv/ui-elements";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("theme");
  const [currentTheme, setCurrentTheme] = useState("light");
  const [currentPalette, setCurrentPalette] = useState("ghibli");
  const [density, setDensity] = useState("comfortable");
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    reducedMotion: false,
  });

  const settingsTabs: Tab[] = [
    { id: "theme", label: "Theme", icon: "🎨" },
    { id: "accessibility", label: "Accessibility", icon: "♿" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: 2 },
    { id: "account", label: "Account", icon: "👤" },
  ];

  const settingsActions: Action[] = [
    { id: "save", label: "Save Changes", icon: "💾" },
    { id: "reset", label: "Reset All", icon: "🔄" },
    { id: "export", label: "Export Settings", icon: "📤" },
    { id: "import", label: "Import Settings", icon: "📥" },
  ];

  const paletteOptions = [
    {
      id: "ghibli",
      name: "Ghibli",
      emoji: "🌿",
      description: "Earthy green inspired by Studio Ghibli films",
    },
    {
      id: "blue",
      name: "Blue",
      emoji: "💙",
      description: "Classic blue for professional environments",
    },
    {
      id: "purple",
      name: "Purple",
      emoji: "💜",
      description: "Creative purple for artistic workflows",
    },
    {
      id: "green",
      name: "Green",
      emoji: "💚",
      description: "Fresh green for productivity focus",
    },
    {
      id: "orange",
      name: "Orange",
      emoji: "🧡",
      description: "Energetic orange for dynamic teams",
    },
  ];

  const privacyItems: MenuItem[] = [
    {
      id: "analytics",
      label: "Analytics & Tracking",
      icon: "📊",
      description: "Allow anonymous usage analytics to improve the product",
    },
    {
      id: "cookies",
      label: "Cookies",
      icon: "🍪",
      description: "Manage cookie preferences and third-party tracking",
    },
    {
      id: "data-export",
      label: "Data Export",
      icon: "📦",
      description: "Download all your data in portable formats",
    },
    {
      id: "data-deletion",
      label: "Data Deletion",
      icon: "🗑️",
      description: "Permanently delete your account and all associated data",
    },
  ];

  const notificationItems: MenuItem[] = [
    {
      id: "email-notifications",
      label: "Email Notifications",
      icon: "📧",
      description: "Receive updates and alerts via email",
      badge: 1,
    },
    {
      id: "push-notifications",
      label: "Push Notifications",
      icon: "📱",
      description: "Browser and mobile push notifications",
    },
    {
      id: "marketing",
      label: "Marketing Communications",
      icon: "📢",
      description: "Product updates, tips, and promotional content",
      badge: 1,
    },
    {
      id: "security-alerts",
      label: "Security Alerts",
      icon: "🔒",
      description: "Account security and login notifications",
    },
  ];

  const accountItems: MenuItem[] = [
    {
      id: "profile",
      label: "Profile Information",
      icon: "👤",
      description: "Update your name, email, and profile picture",
    },
    {
      id: "password",
      label: "Password & Security",
      icon: "🔐",
      description: "Change password and manage two-factor authentication",
    },
    {
      id: "sessions",
      label: "Active Sessions",
      icon: "🖥️",
      description: "View and manage your active login sessions",
    },
    {
      id: "billing",
      label: "Billing & Subscription",
      icon: "💳",
      description: "Manage your subscription and payment methods",
    },
  ];

  const handleActionClick = (action: Action) => {
    if (action.id === "save") {
      // Apply settings to document
      document.documentElement.setAttribute("data-theme", currentTheme);
      document.documentElement.setAttribute("data-palette", currentPalette);
      document.documentElement.setAttribute("data-density", density);

      if (accessibility.highContrast) {
        document.documentElement.setAttribute("data-high-contrast", "true");
      } else {
        document.documentElement.removeAttribute("data-high-contrast");
      }

      if (accessibility.reducedMotion) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
      } else {
        document.documentElement.removeAttribute("data-reduced-motion");
      }

      // Save to localStorage
      localStorage.setItem("ui-elements-theme", currentTheme);
      localStorage.setItem("ui-elements-palette", currentPalette);
      localStorage.setItem("ui-elements-density", density);
      localStorage.setItem(
        "ui-elements-accessibility",
        JSON.stringify(accessibility),
      );

      console.log("Settings saved!");
    } else if (action.id === "reset") {
      setCurrentTheme("light");
      setCurrentPalette("ghibli");
      setDensity("comfortable");
      setAccessibility({ highContrast: false, reducedMotion: false });
      console.log("Settings reset!");
    }
    console.log("Settings action:", action.id);
  };

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  const handlePaletteChange = (palette: string) => {
    setCurrentPalette(palette);
    document.documentElement.setAttribute("data-palette", palette);
  };

  const handleDensityChange = (newDensity: string) => {
    setDensity(newDensity);
    document.documentElement.setAttribute("data-density", newDensity);
  };

  const handleAccessibilityChange = (key: string, value: boolean) => {
    const newAccessibility = { ...accessibility, [key]: value };
    setAccessibility(newAccessibility);

    if (key === "highContrast") {
      if (value) {
        document.documentElement.setAttribute("data-high-contrast", "true");
      } else {
        document.documentElement.removeAttribute("data-high-contrast");
      }
    } else if (key === "reducedMotion") {
      if (value) {
        document.documentElement.setAttribute("data-reduced-motion", "true");
      } else {
        document.documentElement.removeAttribute("data-reduced-motion");
      }
    }
  };

  const renderThemeSettings = () => (
    <div className="settings-section">
      <CollapsibleSection
        title="Color Palette"
        icon="🎨"
        expanded={true}
        design={{ variant: "default", size: "md" }}
        responsive={true}
      >
        <div className="grid grid--auto-fit">
          {paletteOptions.map((option) => (
            <button
              key={option.id}
              className={`palette-card ${
                currentPalette === option.id ? "palette-card--selected" : ""
              }`}
              onClick={() => handlePaletteChange(option.id)}
            >
              <div className="palette-header">
                <div
                  className="palette-swatch"
                  style={{
                    background: `var(--mv-color-${
                      option.id === "ghibli" ? "primary" : option.id
                    })`,
                  }}
                >
                  {option.emoji}
                </div>
                <div>
                  <div className="palette-name">{option.name}</div>
                  {currentPalette === option.id && (
                    <div className="palette-status">Current</div>
                  )}
                </div>
              </div>
              <div className="palette-description">{option.description}</div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Theme Mode"
        icon="🌓"
        expanded={true}
        design={{ variant: "default", size: "md" }}
        responsive={true}
      >
        <div className="grid grid--two-col">
          <Button
            design={{
              variant: currentTheme === "light" ? "filled" : "outline",
              intent: currentTheme === "light" ? "primary" : "neutral",
              size: "md",
            }}
            onClick={() => handleThemeChange("light")}
          >
            🌅 Light Mode
          </Button>
          <Button
            design={{
              variant: currentTheme === "dark" ? "filled" : "outline",
              intent: currentTheme === "dark" ? "primary" : "neutral",
              size: "md",
            }}
            onClick={() => handleThemeChange("dark")}
          >
            🌙 Dark Mode
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Layout Density"
        icon="📏"
        expanded={true}
        design={{ variant: "default", size: "md" }}
        responsive={true}
      >
        <div className="grid grid--two-col">
          <Button
            design={{
              variant: density === "comfortable" ? "filled" : "outline",
              intent: density === "comfortable" ? "primary" : "neutral",
              size: "md",
            }}
            onClick={() => handleDensityChange("comfortable")}
          >
            📐 Comfortable
          </Button>
          <Button
            design={{
              variant: density === "compact" ? "filled" : "outline",
              intent: density === "compact" ? "primary" : "neutral",
              size: "md",
            }}
            onClick={() => handleDensityChange("compact")}
          >
            📏 Compact
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="settings-section">
      <CollapsibleSection
        title="Visual Accessibility"
        icon="👁️"
        expanded={true}
        design={{ variant: "default", size: "md" }}
        responsive={true}
      >
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={accessibility.highContrast}
              onChange={(e) =>
                handleAccessibilityChange("highContrast", e.target.checked)}
            />
            <div>
              <strong>High Contrast Mode</strong>
              <div className="text-small text-muted">
                Increase contrast for better visibility
              </div>
            </div>
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Motion & Animation"
        icon="🎬"
        expanded={true}
        design={{ variant: "default", size: "md" }}
        responsive={true}
      >
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={accessibility.reducedMotion}
              onChange={(e) =>
                handleAccessibilityChange("reducedMotion", e.target.checked)}
            />
            <div>
              <strong>Reduce Motion</strong>
              <div className="text-small text-muted">
                Minimize animations and transitions
              </div>
            </div>
          </label>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>Privacy & Data Control</h3>
      <p className="text-secondary">
        Manage how your data is collected, used, and shared.
      </p>
      <List
        items={privacyItems}
        design={{
          variant: "detailed",
          orientation: "vertical",
          density: "comfortable",
        }}
        onItemClick={(item) => console.log("Privacy setting:", item.id)}
        responsive={true}
      />
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <p className="text-secondary">
        Choose how and when you want to be notified.
      </p>
      <List
        items={notificationItems}
        design={{
          variant: "detailed",
          orientation: "vertical",
          density: "comfortable",
        }}
        onItemClick={(item) => console.log("Notification setting:", item.id)}
        responsive={true}
      />
    </div>
  );

  const renderAccountSettings = () => (
    <div className="settings-section">
      <h3>Account Management</h3>
      <p className="text-secondary">
        Manage your account details and security settings.
      </p>
      <List
        items={accountItems}
        design={{
          variant: "detailed",
          orientation: "vertical",
          density: "comfortable",
        }}
        onItemClick={(item) => console.log("Account setting:", item.id)}
        responsive={true}
      />
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">⚙️ Settings</h1>
          <p className="page-description">
            Customize your experience with themes, accessibility options, and
            privacy controls.
          </p>
        </div>
        <ActionBar
          actions={settingsActions}
          onActionClick={handleActionClick}
          design={{
            position: "right",
            orientation: "horizontal",
            density: "comfortable",
            variant: "default",
          }}
          responsive={true}
        />
      </header>

      <Card design={{ variant: "outlined", padding: "none" }} responsive={true}>
        <div className="settings-tabs">
          <TabGroup
            tabs={settingsTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            design={{
              variant: "underline",
              size: "md",
              orientation: "horizontal",
            }}
            responsive={true}
          />
        </div>

        <div className="settings-content">
          {activeTab === "theme" && renderThemeSettings()}
          {activeTab === "accessibility" && renderAccessibilitySettings()}
          {activeTab === "privacy" && renderPrivacySettings()}
          {activeTab === "notifications" && renderNotificationSettings()}
          {activeTab === "account" && renderAccountSettings()}
        </div>
      </Card>
    </div>
  );
}
