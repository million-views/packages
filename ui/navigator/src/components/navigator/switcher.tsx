// NavigatorAppSwitcher.tsx
import React from "react";
import type { AppSwitcherProps } from "./types";

export const NavigatorAppSwitcher: React.FC<AppSwitcherProps> = ({
  section,
  availableSections,
  onSectionChange,
  renderIcon,
  formatSectionName,
  className = "",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!onSectionChange) {
    throw new Error(
      "NavigatorAppSwitcher: onSectionChange function is required",
    );
  }

  if (!renderIcon) {
    throw new Error("NavigatorAppSwitcher: renderIcon function is required");
  }

  if (!formatSectionName) {
    throw new Error(
      "NavigatorAppSwitcher: formatSectionName function is required",
    );
  }

  if (availableSections.length <= 1) return null;

  return (
    <div className={`nav-app-switcher ${className}`}>
      <button
        className="nav-app-switcher-btn nav-app-switcher-btn-light dark:nav-app-switcher-btn-dark"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{formatSectionName(section)}</span>
        <span className="nav-app-switcher-icon">
          {renderIcon("ChevronDown")}
        </span>
      </button>

      {isOpen && (
        <div className="nav-dropdown nav-dropdown-light dark:nav-dropdown-dark">
          <div className="nav-dropdown-container">
            {availableSections.map((sectionName) => (
              <button
                key={sectionName}
                className={`nav-dropdown-item ${
                  section === sectionName
                    ? "nav-dropdown-item-active-light dark:nav-dropdown-item-active-dark"
                    : "nav-dropdown-item-light dark:nav-dropdown-item-dark"
                }`}
                onClick={() => {
                  onSectionChange(sectionName);
                  setIsOpen(false);
                }}
              >
                {formatSectionName(sectionName)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigatorAppSwitcher;
