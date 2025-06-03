import { useEffect, useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Button,
  Card,
  CollapsibleSection,
  List,
  Select,
  TabGroup,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
  MenuItem,
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

  // Convert privacy and advanced options to MenuItem format for better semantics
  const privacyItems: MenuItem[] = [
    {
      id: "data-collection",
      label: "Data Collection",
      icon: "📊",
      description: "Control what data is collected and stored",
    },
    {
      id: "cookies",
      label: "Cookie Preferences",
      icon: "🍪",
      description: "Manage cookie settings and tracking",
    },
    {
      id: "sharing",
      label: "Data Sharing",
      icon: "🤝",
      description: "Control how your data is shared with third parties",
    },
    {
      id: "deletion",
      label: "Data Deletion",
      icon: "🗑️",
      description: "Request deletion of your personal data",
    },
  ];

  const advancedItems: MenuItem[] = [
    {
      id: "developer-mode",
      label: "Developer Mode",
      icon: "👨‍💻",
      description: "Enable advanced developer features",
    },
    {
      id: "api-access",
      label: "API Access",
      icon: "🔌",
      description: "Manage API keys and access tokens",
    },
    {
      id: "debugging",
      label: "Debug Mode",
      icon: "🐛",
      description: "Enable detailed logging and debugging",
    },
    {
      id: "experimental",
      label: "Experimental Features",
      icon: "🧪",
      description: "Try out beta features and experiments",
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

  const handleItemClick = (item: MenuItem) => {
    console.log("Settings item clicked:", item.label);
    // Handle specific settings actions
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <CollapsibleSection
        title="Basic Information"
        icon="👤"
        expanded
      >
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              Display Name
            </label>
            <input
              type="text"
              defaultValue="John Doe"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="form-input"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Regional Settings"
        icon="🌍"
        expanded
      >
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              Language
            </label>
            <Select
              options={languageOptions}
              value={language}
              onSelect={(value) => setLanguage(value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">
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
    <div className="settings-section">
      <CollapsibleSection
        title="Theme Settings"
        icon="🎨"
        expanded
      >
        <div className="theme-controls">
          <div className="form-field">
            <label className="form-label">
              Light / Dark Mode
            </label>
            <Select
              options={themeOptions}
              value={theme}
              onSelect={handleThemeChange}
            />
            <p className="form-help">
              Choose between light and dark variants for your selected color
              palette
            </p>
          </div>

          <div className="form-field">
            <label className="form-label">
              Color Palette
            </label>
            <p className="form-help">
              Each palette includes both light and dark variants. Changes are
              applied instantly.
            </p>

            <div className="palette-grid">
              {paletteOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handlePaletteChange(option.id as Palette)}
                  className={`palette-card ${
                    palette === option.id ? "palette-card--selected" : ""
                  }`}
                >
                  <div className="palette-header">
                    <div
                      className="palette-swatch"
                      style={{ background: option.color }}
                    />
                    <div>
                      <div className="palette-name">
                        {option.label}
                      </div>
                      {palette === option.id && (
                        <div className="palette-status">
                          Currently Active ({theme} mode)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="palette-description">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Display Options"
        icon="📱"
        expanded
      >
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked />
            <span>Use compact layout</span>
          </label>
          <label className="checkbox-item">
            <input type="checkbox" />
            <span>Show animations</span>
          </label>
          <label className="checkbox-item">
            <input type="checkbox" defaultChecked />
            <span>High contrast mode</span>
          </label>
        </div>
      </CollapsibleSection>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <CollapsibleSection
        title="Email Notifications"
        icon="📧"
        badge={emailNotifications ? 1 : 0}
        expanded
      >
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span>Enable email notifications</span>
          </label>
          {emailNotifications && (
            <div className="checkbox-subgroup">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>Weekly digest</span>
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                <span>Marketing updates</span>
              </label>
              <label className="checkbox-item">
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
        <div className="checkbox-group">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
            />
            <span>Enable push notifications</span>
          </label>
          {pushNotifications && (
            <div className="checkbox-subgroup">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                <span>New messages</span>
              </label>
              <label className="checkbox-item">
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
    <div className="settings-container">
      <Breadcrumbs items={breadcrumbs} />

      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <ActionBar
          actions={settingsActions}
          onActionClick={handleActionClick}
          variant="compact"
        />
      </div>

      <Card variant="outlined" padding="none">
        <div className="settings-tabs">
          <TabGroup
            tabs={settingsTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>

        <div className="settings-content">
          {activeTab === "general" && renderGeneralSettings()}
          {activeTab === "appearance" && renderAppearanceSettings()}
          {activeTab === "notifications" && renderNotificationSettings()}

          {activeTab === "privacy" && (
            <div>
              <div className="tab-placeholder">
                <div className="tab-placeholder-icon">🔒</div>
                <h3>Privacy Settings</h3>
                <p>Manage your data protection and privacy preferences:</p>
              </div>

              <List
                items={privacyItems}
                variant="detailed"
                onItemClick={handleItemClick}
              />
            </div>
          )}

          {activeTab === "advanced" && (
            <div>
              <div className="tab-placeholder">
                <div className="tab-placeholder-icon">🔧</div>
                <h3>Advanced Settings</h3>
                <p>Developer options and advanced configuration:</p>
              </div>

              <List
                items={advancedItems}
                variant="detailed"
                onItemClick={handleItemClick}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Live Preview Footer */}
      <Card variant="elevated" padding="lg">
        <div className="preview-footer">
          <div>
            <h4 className="preview-title">
              Live Theme Preview
            </h4>
            <p className="preview-description">
              Currently using <strong>{palette}</strong> palette in{" "}
              <strong>{theme}</strong>{" "}
              mode. Changes are applied instantly across the entire interface.
            </p>
          </div>
          <div className="preview-actions">
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
