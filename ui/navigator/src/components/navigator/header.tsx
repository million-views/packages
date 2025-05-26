// file: header.tsx
// Updated NavigationHeader with SSR-safe approach
import React from "react";
import { useNavigator } from "./context";
import { NavigatorSearch } from "./search";
import { NavigatorAppSwitcher } from "./switcher";
import { NavigatorActions } from "./actions";
import { useMediaQuery } from "./media-query";
import type { ActionGroup, HeaderProps } from "./types";

export const NavigationHeader: React.FC<HeaderProps> = ({
  logo,
  appTitle,
  search = false,
  onSearch,
  appSwitcher = true,
  actions = [],
  className = "",
  sticky = false,
  darkMode = false,
}) => {
  const {
    section,
    availableSections,
    onSectionChange,
    renderIcon,
    formatSectionName,
    toggleMobileMenu, // Access from context
  } = useNavigator();

  // Use the SSR-safe media query hook
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Render search component based on prop type
  const renderSearch = () => {
    if (search === true && onSearch) {
      return <NavigatorSearch onSearch={onSearch} renderIcon={renderIcon} />;
    } else if (React.isValidElement(search)) {
      return search;
    }
    return null;
  };

  // Render app switcher component based on prop type
  const renderAppSwitcher = () => {
    if (appSwitcher === true && availableSections.length > 1) {
      return (
        <NavigatorAppSwitcher
          section={section}
          availableSections={availableSections}
          onSectionChange={onSectionChange}
          renderIcon={renderIcon}
          formatSectionName={formatSectionName}
        />
      );
    } else if (React.isValidElement(appSwitcher)) {
      return appSwitcher;
    }
    return null;
  };

  // Render actions component based on prop type
  const renderActions = () => {
    if (Array.isArray(actions)) {
      // It's UserAction[]
      return <NavigatorActions items={actions} renderIcon={renderIcon} />;
    } else if (
      actions && typeof actions === "object" && "items" in actions &&
      Array.isArray(actions.items)
    ) {
      // It's ActionGroup
      return (
        <NavigatorActions
          items={actions as ActionGroup}
          renderIcon={renderIcon}
        />
      );
    } else if (React.isValidElement(actions)) {
      // It's a React element
      return actions;
    }
    return null;
  };

  return (
    <header
      className={`nav-header ${
        darkMode ? "nav-header-dark" : "nav-header-light"
      } 
        ${sticky ? "nav-header-sticky" : ""} ${className}`}
    >
      <div className="nav-header-inner">
        {/* Left side - Logo, menu toggle, app title */}
        <div className="nav-brand">
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className={`nav-btn ${
                darkMode ? "nav-btn-dark" : "nav-btn-light"
              } mr-2`}
              aria-label="Open navigation menu"
            >
              {renderIcon("Menu")}
            </button>
          )}

          {logo && (
            <div className="nav-logo">
              {logo}
            </div>
          )}

          <h1 className="nav-title">
            {appTitle}
          </h1>

          {/* App Switcher - Only show in desktop mode */}
          {!isMobile && renderAppSwitcher()}
        </div>

        {/* Right side - Search and actions */}
        <div className="nav-controls">
          {renderSearch()}
          {renderActions()}
        </div>
      </div>
    </header>
  );
};
