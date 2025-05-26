// file: src/next/navigator/templates/DashboardTemplate.tsx
import type { TemplateProps } from "../types";
import "./styles/dashboard.css";

export function DashboardTemplate({
  navigationTree,
  activeSection,
  isDrawerOpen,
  isMobile,
  toggleDrawer,
  closeDrawer,
  renderIcon,
  isItemActive,
  getItemUrl,
  Link,
  appTitle = "Dashboard",
}: TemplateProps) {
  const navItems = navigationTree[activeSection] || [];

  return (
    <div className="dashboard-nav-container">
      <div className="dashboard-nav-header">
        <div className="dashboard-nav-header-inner">
          <button
            className="dashboard-nav-menu-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle menu"
          >
            {renderIcon("Menu", 24)}
          </button>

          <div className="dashboard-nav-brand">
            {renderIcon("Layout", 24)}
            <span className="dashboard-nav-brand-title">{appTitle}</span>
          </div>

          <div className="dashboard-nav-search">
            <input
              type="text"
              placeholder="Search..."
              className="dashboard-nav-search-input"
            />
          </div>

          <div className="dashboard-nav-actions">
            <button
              className="dashboard-nav-action-button"
              aria-label="Notifications"
            >
              {renderIcon("Bell", 24)}
            </button>
            <button
              className="dashboard-nav-action-button"
              aria-label="Settings"
            >
              {renderIcon("Settings", 24)}
            </button>
            <button className="dashboard-nav-action-button" aria-label="User">
              {renderIcon("User", 24)}
            </button>
          </div>
        </div>
      </div>

      <div className={`dashboard-nav-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="dashboard-nav-drawer-content">
          {navItems.map((section) => (
            <div key={section.id} className="dashboard-nav-section">
              {section.label && (
                <div className="dashboard-nav-section-title">
                  {section.label}
                </div>
              )}

              <div className="dashboard-nav-section-items">
                {section.children?.map((item) => (
                  <Link
                    key={item.id}
                    to={getItemUrl(item)}
                    className={`dashboard-nav-item ${
                      isItemActive(item) ? "active" : ""
                    }`}
                  >
                    {item.iconName && (
                      <span className="dashboard-nav-item-icon">
                        {renderIcon(item.iconName, 20)}
                      </span>
                    )}
                    <span className="dashboard-nav-item-label">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isDrawerOpen && (
        <div className="dashboard-nav-backdrop" onClick={closeDrawer} />
      )}
    </div>
  );
}
