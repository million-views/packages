// file: next/components/Actions.tsx
// Actions component for Navigator

import { useState } from "react";
import type { Action, ActionsProps } from "../types";
import { useNavigator } from "../context/Navigator";

/**
 * Actions component for displaying navigation actions/buttons
 * Can be used independently or within a Header
 */
export function Actions({
  actions = [],
  children,
  mode = "default",
  visibleActions,
  overflowActions,
  className = "",
}: ActionsProps) {
  const { renderIcon, responsive } = useNavigator();
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  // If children are provided, render them directly
  if (children) {
    return (
      <div className={`nav-actions ${className}`}>
        {children}
      </div>
    );
  }

  // Filter actions based on visibility configuration
  const getFilteredActions = () => {
    // If visibility not configured, show all actions
    if (!visibleActions) {
      // Check responsive config for action visibility
      if (responsive.isMobile && responsive.currentConfig.actions?.visible) {
        return actions.filter((action) =>
          responsive.currentConfig.actions?.visible?.includes(action.id)
        );
      }
      return actions;
    }

    // Show only actions in the visible list
    return actions.filter((action) => visibleActions.includes(action.id));
  };

  // Get actions for overflow menu
  const getOverflowActions = () => {
    if (!overflowActions) {
      // Check responsive config for overflow actions
      if (
        responsive.isMobile && responsive.currentConfig.actions?.overflowMenu
      ) {
        return actions.filter((action) =>
          responsive.currentConfig.actions?.overflowMenu?.includes(action.id)
        );
      }
      return [];
    }

    return actions.filter((action) => overflowActions.includes(action.id));
  };

  // Filtered actions based on configuration
  const visibleFilteredActions = getFilteredActions();
  const overflowFilteredActions = getOverflowActions();

  // Function to render an action
  const renderAction = (action: Action) => {
    const {
      id,
      icon,
      label,
      type = "icon",
      variant = "default",
      onClick,
      href,
    } = action;

    // Base props for all action types
    //!!! key is special in React and cannot be spread into JSX; do not change
    const key = id;
    const baseProps = {
      onClick: onClick || (href ? undefined : () => {}),
      className: `nav-action nav-action-${type} nav-action-${variant}`,
    };

    // For href actions, render an anchor
    if (href) {
      return (
        <a
          key={key}
          {...baseProps}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {icon && <span className="nav-action-icon">{renderIcon(icon)}</span>}
          {label && <span className="nav-action-label">{label}</span>}
        </a>
      );
    }

    // For button types
    if (type === "button") {
      return (
        <button key={key} {...baseProps}>
          {icon && <span className="nav-action-icon">{renderIcon(icon)}</span>}
          {label && <span className="nav-action-label">{label}</span>}
        </button>
      );
    }

    // For icon types
    if (type === "icon") {
      return (
        <button key={key} {...baseProps} aria-label={label} title={label}>
          <span className="nav-action-icon">{renderIcon(icon)}</span>
        </button>
      );
    }

    // Default fallback
    return (
      <button key={key} {...baseProps}>
        {icon && <span className="nav-action-icon">{renderIcon(icon)}</span>}
        {label && <span className="nav-action-label">{label}</span>}
      </button>
    );
  };

  return (
    <div className={`nav-actions ${className}`}>
      {/* Render filtered actions */}
      {visibleFilteredActions.map(renderAction)}

      {/* Overflow menu */}
      {overflowFilteredActions.length > 0 && (
        <div className="nav-overflow">
          <button
            className="nav-overflow-toggle"
            onClick={() => setIsOverflowOpen(!isOverflowOpen)}
            aria-expanded={isOverflowOpen}
            aria-haspopup="true"
          >
            {renderIcon("More")}
          </button>

          {isOverflowOpen && (
            <div className="nav-overflow-menu">
              {overflowFilteredActions.map((action) => (
                <button
                  key={action.id}
                  className="nav-overflow-item"
                  onClick={() => {
                    setIsOverflowOpen(false);
                    action.onClick?.();
                  }}
                >
                  {action.icon && (
                    <span className="nav-overflow-item-icon">
                      {renderIcon(action.icon)}
                    </span>
                  )}
                  <span className="nav-overflow-item-label">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
