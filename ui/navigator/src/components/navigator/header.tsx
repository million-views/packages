// NavigationHeader.tsx
import { isValidElement, useEffect, useState } from "react";
import {
  type HeaderProps,
  NavigatorActions,
  NavigatorAppSwitcher,
  NavigatorSearch,
  useNavigator,
} from "./main";

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
  } = useNavigator();

  // Check if using mobile view (will be more sophisticated in real implementation)
  const [isMobile, setIsMobile] = useState(false);

  // Setup responsive detection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    // Access the toggleMobileMenu function exposed by NavigationTiers
    if (typeof window !== "undefined" && (window as any).__toggleMobileMenu) {
      (window as any).__toggleMobileMenu();
    }
  };

  // Render search component based on prop type
  const renderSearch = () => {
    if (search === true && onSearch) {
      return <NavigatorSearch onSearch={onSearch} renderIcon={renderIcon} />;
    } else if (isValidElement(search)) {
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
    } else if (isValidElement(appSwitcher)) {
      return appSwitcher;
    }
    return null;
  };

  // Render actions component based on prop type
  const renderActions = () => {
    if (Array.isArray(actions)) {
      return <NavigatorActions items={actions} renderIcon={renderIcon} />;
    } else if (isValidElement(actions)) {
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

export default NavigationHeader;
