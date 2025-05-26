// file: main.tsx
// Updated Navigator component using SSR-safe approach
import React from "react";
import { NavigationHeader } from "./header";
import { NavigationTiers } from "./tiers";
import { NavigatorProvider } from "./context";
import type { NavigatorProps } from "./types";

// ========================================
// Exported Components for Customization
// ========================================

export { NavigatorSearch } from "./search";
export { NavigatorAppSwitcher } from "./switcher";
export { NavigatorActions } from "./actions";
export { useNavigator } from "./context";

// ========================================
// Main Navigator Component
// ========================================

export const Navigator: React.FC<NavigatorProps> = ({
  // Required props
  navigationTree,
  router,

  // Section management
  section = "main",
  onSectionChange,

  // Display configuration
  darkMode = false,
  displayMode = "adaptive",

  // Header elements
  logo,
  appTitle = "Application",
  search = false,
  onSearch,
  appSwitcher = true,
  actions = [],

  // Customization
  headerProps = {},
  navigationLevelDefaults = {},

  // Icons
  renderIcon = (name) => <span>{name}</span>,

  // Theme
  theme = "",
}) => {
  // Validate required props
  if (!navigationTree) {
    throw new Error("Navigator: navigationTree is required");
  }

  if (!router) {
    throw new Error("Navigator: router is required");
  }

  if (!router.Link) {
    throw new Error("Navigator: router.Link is required");
  }

  if (!router.matchPath) {
    throw new Error("Navigator: router.matchPath is required");
  }

  if (!router.useLocation) {
    throw new Error("Navigator: router.useLocation is required");
  }

  // Default section change handler
  const handleSectionChange = onSectionChange || ((newSection) => {
    console.warn(
      `Navigator: No onSectionChange handler provided for section change to "${newSection}"`,
    );
  });

  // Helper function to format section names
  const formatSectionName = (sectionKey: string) => {
    return sectionKey.charAt(0).toUpperCase() +
      sectionKey.slice(1).replace(/-/g, " ");
  };

  // Get available sections
  const availableSections = Object.keys(navigationTree);

  // Get theme class
  const themeClass = theme ? `nav-theme-${theme}` : "";

  return (
    <NavigatorProvider
      navigationTree={navigationTree}
      section={section}
      availableSections={availableSections}
      onSectionChange={handleSectionChange}
      router={router}
      darkMode={darkMode}
      displayMode={displayMode}
      renderIcon={renderIcon}
      formatSectionName={formatSectionName}
    >
      <div className={`nav-container ${darkMode ? "dark" : ""} ${themeClass}`}>
        <NavigationHeader
          logo={logo}
          appTitle={appTitle}
          search={search}
          onSearch={onSearch}
          appSwitcher={appSwitcher}
          actions={actions}
          darkMode={darkMode}
          {...headerProps}
        />
        <NavigationTiers
          navigationLevelDefaults={navigationLevelDefaults}
        />
      </div>
    </NavigatorProvider>
  );
};
