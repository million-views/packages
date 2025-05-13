// Navigator.tsx
import React, { useMemo } from "react";
import { NavigationHeader } from "./header";
import { NavigationTiers } from "./tiers";
import { NavigatorContext } from "./context";
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
  const availableSections = useMemo(() => Object.keys(navigationTree), [
    navigationTree,
  ]);

  // Create context value
  const contextValue = useMemo(
    () => ({
      navigationTree,
      section,
      availableSections,
      onSectionChange: handleSectionChange,
      router,
      darkMode,
      displayMode,
      renderIcon,
      formatSectionName,
    }),
    [
      navigationTree,
      section,
      availableSections,
      handleSectionChange,
      router,
      darkMode,
      displayMode,
      renderIcon,
    ],
  );

  // Get theme class
  const themeClass = theme ? `nav-theme-${theme}` : "";

  return (
    <NavigatorContext.Provider value={contextValue}>
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
    </NavigatorContext.Provider>
  );
};
