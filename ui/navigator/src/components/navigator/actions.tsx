// file: actions.tsx
// NavigatorActions
import React from "react";
import type { ActionsProps } from "./types";

export const NavigatorActions: React.FC<ActionsProps> = ({
  items,
  renderIcon,
  className = "",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!items) return null;

  if (!renderIcon) {
    throw new Error("NavigatorActions: renderIcon function is required");
  }

  // Check if items is an array of UserAction or an ActionGroup
  const isActionGroup = !Array.isArray(items) && "items" in items;
  const actionItems = isActionGroup ? items.items : items;

  // Single action button
  if (Array.isArray(actionItems) && actionItems.length === 1) {
    const action = actionItems[0];
    return (
      <button
        className={`nav-btn-primary nav-btn-primary-light dark:nav-btn-primary-dark ${className}`}
        onClick={action.onClick}
      >
        {action.iconName && (
          <span className="mr-1">{renderIcon(action.iconName)}</span>
        )}
        <span>{action.label}</span>
      </button>
    );
  }

  // Extract label and iconName from ActionGroup or use defaults
  const dropdownLabel = isActionGroup ? items.label : "Account";
  const dropdownIconName = isActionGroup && items.iconName
    ? items.iconName
    : "User";

  // Multiple actions dropdown
  return (
    <div className={`nav-actions-menu ${className}`}>
      <button
        className="nav-actions-btn nav-actions-btn-light dark:nav-actions-btn-dark"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="mr-1">{renderIcon(dropdownIconName)}</span>
        <span className="hidden sm:inline">{dropdownLabel}</span>
        <span className="ml-1">{renderIcon("ChevronDown")}</span>
      </button>

      {isOpen && (
        <div className="nav-dropdown nav-dropdown-light dark:nav-dropdown-dark">
          <div className="nav-dropdown-container">
            {Array.isArray(actionItems) && actionItems.map((action) => (
              <button
                key={action.id}
                className="nav-dropdown-item nav-dropdown-item-light dark:nav-dropdown-item-dark"
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.iconName && (
                  <span className="nav-dropdown-item-icon">
                    {renderIcon(action.iconName)}
                  </span>
                )}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
