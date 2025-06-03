import { useEffect, useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Button,
  Card,
  CollapsibleSection,
  Select,
  TabGroup,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
  SelectOption,
  Tab,
} from "@m5nv/ui-elements";

type Palette = "ghibli" | "blue" | "purple" | "green" | "orange";
type Theme = "light" | "dark";

export default function Settings() {
  const [palette, setPalette] = useState<Palette>("ghibli");
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Apply theme and palette to document
  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    document.documentElement.setAttribute("data-theme", theme);
  }, [palette, theme]);

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "settings", label: "Settings" },
  ];

  const settingsTabs: Tab[] = [
    { id: "general", label: "General", icon: "⚙️" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "advanced", label: "Advanced", icon: "🔧" },
  ];

  const settingsActions: Action[] = [
    { id: "save", label: "Save Changes", icon: "💾" },
    { id: "reset", label: "Reset", icon: "🔄" },
    { id: "export", label: "Export Settings", icon: "📤" },
    { id: "import", label: "Import Settings", icon: "📥" },
  ];

  const themeOptions: SelectOption[] = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
    },
    { value: "dark", label: "Dark", description: "Easy on the eyes" },
  ];

  const languageOptions: SelectOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "ja", label: "日本語" },
  ];

  const timezoneOptions: SelectOption[] = [
    { value: "UTC", label: "UTC (GMT+0)" },
    { value: "EST", label: "Eastern Time (GMT-5)" },
    { value: "PST", label: "Pacific Time (GMT-8)" },
    { value: "CET", label: "Central European Time (GMT+1)" },
    { value: "JST", label: "Japan Standard Time (GMT+9)" },
  ];

  const paletteOptions = [
    {
      id: "ghibli",
      label: "Ghibli",
      color: "#7c9885",
      description: "Warm, natural sage green",
    },
    {
      id: "blue",
      label: "Blue",
      color: "#3b82f6",
      description: "Classic professional blue",
    },
    {
      id: "purple",
      label: "Purple",
      color: "#8b5cf6",
      description: "Creative and modern purple",
    },
    {
      id: "green",
      label: "Green",
      color: "#10b981",
      description: "Fresh and vibrant green",
    },
    {
      id: "orange",
      label: "Orange",
      color: "#f97316",
      description: "Energetic and warm orange",
    },
  ];

  const handleActionClick = (action: Action) => {
    console.log("Settings action:", action.id);
    if (action.id === "save") {
      // Simulate save
      console.log("Settings saved!", { palette, theme, language, timezone });
    }
  };

  const handlePaletteChange = (newPalette: Palette) => {
    setPalette(newPalette);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as Theme);
  };

  const renderGeneralSettings = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mv-space-xl)",
      }}
    >
      <CollapsibleSection
        title="Basic Information"
        icon="👤"
        expanded
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--mv-space-lg)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "var(--mv-space-sm)",
                fontWeight: "500",
              }}
            >
              Display Name
            </label>
            <input
              type="text"
              defaultValue="John Doe"
              style={{
                width: "100%",
                padding: "var(--mv-space-md)",
                border: "1px solid var(--mv-color-border)",
                borderRadius: "var(--mv-radius-md)",
                fontSize: "1rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "var(--mv-space-sm)",
                fontWeight: "500",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              style={{
                width: "100%",
                padding: "var(--mv-space-md)",
                border: "1px solid var(--mv-color-border)",
                borderRadius: "var(--mv-radius-md)",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Regional Settings"
        icon="🌍"
        expanded
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--mv-space-lg)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "var(--mv-space-sm)",
                fontWeight: "500",
              }}
            >
              Language
            </label>
            <Select
              options={languageOptions}
              value={language}
              onSelect={(value) => setLanguage(value)}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "var(--mv-space-sm)",
                fontWeight: "500",
              }}
            >
              Timezone
            </label>
            <Select
              options={timezoneOptions}
              value={timezone}
              onSelect={(value) => setTimezone(value)}
              searchable
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mv-space-xl)",
      }}
    >
      <CollapsibleSection
        title="Theme Settings"
        icon="🎨"
        expanded
      >
        <div style={{ marginBottom: "var(--mv-space-xl)" }}>
          <label
            style={{
              display: "block",
              marginBottom: "var(--mv-space-sm)",
              fontWeight: "500",
            }}
          >
            Light / Dark Mode
          </label>
          <Select
            options={themeOptions}
            value={theme}
            onSelect={handleThemeChange}
          />
          <p
            style={{
              fontSize: "var(--mv-font-size-sm)",
              color: "var(--mv-color-text-secondary)",
              margin: "var(--mv-space-sm) 0 0 0",
            }}
          >
            Choose between light and dark variants for your selected color
            palette
          </p>
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "var(--mv-space-md)",
              fontWeight: "500",
            }}
          >
            Color Palette
          </label>
          <p
            style={{
              fontSize: "var(--mv-font-size-sm)",
              color: "var(--mv-color-text-secondary)",
              margin: "0 0 var(--mv-space-lg) 0",
            }}
          >
            Each palette includes both light and dark variants. Changes are
            applied instantly.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "var(--mv-space-lg)",
            }}
          >
            {paletteOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePaletteChange(option.id as Palette)}
                style={{
                  padding: "var(--mv-space-lg)",
                  borderRadius: "var(--mv-radius-lg)",
                  border: palette === option.id
                    ? "3px solid var(--mv-color-primary)"
                    : "2px solid var(--mv-color-border)",
                  background: palette === option.id
                    ? "var(--mv-color-surface-elevated)"
                    : "var(--mv-color-surface)",
                  cursor: "pointer",
                  transition: "var(--mv-transition-fast)",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--mv-space-md)",
                    marginBottom: "var(--mv-space-sm)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--mv-radius-md)",
                      background: option.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: "var(--mv-font-weight-semibold)",
                        color: "var(--mv-color-text-primary)",
                      }}
                    >
                      {option.label}
                    </div>
                    {palette === option.id && (
                      <div
                        style={{
                          fontSize: "var(--mv-font-size-xs)",
                          color: "var(--mv-color-primary)",
                          fontWeight: "var(--mv-font-weight-medium)",
                        }}
                      >
                        Currently Active ({theme} mode)
                      </div>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "var(--mv-font-size-sm)",
                    color: "var(--mv-color-text-secondary)",
                  }}
                >
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Display Options"
        icon="📱"
        expanded
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--mv-space-md)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
            }}
          >
            <input type="checkbox" defaultChecked />
            <span>Use compact layout</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
            }}
          >
            <input type="checkbox" />
            <span>Show animations</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
            }}
          >
            <input type="checkbox" defaultChecked />
            <span>High contrast mode</span>
          </label>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderNotificationSettings = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--mv-space-xl)",
      }}
    >
      <CollapsibleSection
        title="Email Notifications"
        icon="📧"
        badge={emailNotifications ? 1 : 0}
        expanded
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--mv-space-md)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
            }}
          >
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span>Enable email notifications</span>
          </label>
          {emailNotifications && (
            <div
              style={{
                marginLeft: "var(--mv-space-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--mv-space-sm)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                }}
              >
                <input type="checkbox" defaultChecked />
                <span>Weekly digest</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                }}
              >
                <input type="checkbox" />
                <span>Marketing updates</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                }}
              >
                <input type="checkbox" defaultChecked />
                <span>Security alerts</span>
              </label>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Push Notifications"
        icon="🔔"
        badge={pushNotifications ? 2 : 0}
        expanded
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--mv-space-md)",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--mv-space-sm)",
            }}
          >
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <span>Enable push notifications</span>
          </label>
          {pushNotifications && (
            <div
              style={{
                marginLeft: "var(--mv-space-lg)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--mv-space-sm)",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                }}
              >
                <input type="checkbox" defaultChecked />
                <span>New messages</span>
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--mv-space-sm)",
                }}
              >
                <input type="checkbox" />
                <span>System updates</span>
              </label>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );

  return (
    <div style={{ padding: "var(--mv-space-xl)" }}>
      <Breadcrumbs items={breadcrumbs} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "var(--mv-space-lg) 0",
        }}
      >
        <h1 style={{ margin: 0 }}>Settings</h1>
        <ActionBar
          actions={settingsActions}
          onActionClick={handleActionClick}
          variant="compact"
        />
      </div>

      <Card variant="outlined" padding="none">
        <div style={{ padding: "var(--mv-space-lg) var(--mv-space-lg) 0" }}>
          <TabGroup
            tabs={settingsTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>

        <div style={{ padding: "var(--mv-space-xl)" }}>
          {activeTab === "general" && renderGeneralSettings()}
          {activeTab === "appearance" && renderAppearanceSettings()}
          {activeTab === "notifications" && renderNotificationSettings()}

          {activeTab === "privacy" && (
            <div
              style={{ textAlign: "center", padding: "var(--mv-space-2xl)" }}
            >
              <div
                style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}
              >
                🔒
              </div>
              <h3>Privacy Settings</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Data protection and privacy configuration options. This
                demonstrates how CollapsibleSection can organize complex
                settings.
              </p>
            </div>
          )}

          {activeTab === "advanced" && (
            <div
              style={{ textAlign: "center", padding: "var(--mv-space-2xl)" }}
            >
              <div
                style={{ fontSize: "4rem", marginBottom: "var(--mv-space-lg)" }}
              >
                🔧
              </div>
              <h3>Advanced Settings</h3>
              <p style={{ color: "var(--mv-color-text-secondary)" }}>
                Developer options and advanced configuration. Shows how tabs can
                organize different complexity levels.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Save Changes Footer */}
      <Card variant="elevated" padding="lg">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4 style={{ margin: "0 0 var(--mv-space-xs) 0" }}>
              Live Theme Preview
            </h4>
            <p
              style={{
                margin: 0,
                color: "var(--mv-color-text-secondary)",
                fontSize: "0.875rem",
              }}
            >
              Currently using <strong>{palette}</strong> palette in{" "}
              <strong>{theme}</strong>{" "}
              mode. Changes are applied instantly across the entire interface.
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--mv-space-sm)" }}>
            <Button variant="ghost">
              Reset to Default
            </Button>
            <Button variant="primary">
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
