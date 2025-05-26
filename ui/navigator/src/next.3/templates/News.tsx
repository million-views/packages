// file: src/next/navigator/templates/NewsTemplate.tsx
import type { TemplateProps } from "../types";
import "./styles/news.css";

export function NewsTemplate({
  navigationTree,
  activeSection,
  secondarySection,
  isDrawerOpen,
  isMobile,
  toggleDrawer,
  closeDrawer,
  renderIcon,
  isItemActive,
  getItemUrl,
  Link,
  appTitle = "News",
}: TemplateProps) {
  const primaryNavItems = navigationTree[activeSection] || [];
  const secondaryNavItems = secondarySection
    ? navigationTree[secondarySection] || []
    : [];

  return (
    <div className="news-nav-container">
      <div className="news-nav-header">
        <div className="news-nav-header-inner">
          <button
            className="news-nav-menu-toggle"
            onClick={toggleDrawer}
            aria-label="Toggle menu"
          >
            {renderIcon("Menu", 24)}
          </button>

          <div className="news-nav-brand">
            <div className="news-brand-logo">
              <span className="news-brand-g">G</span>
              <span className="news-brand-o1">o</span>
              <span className="news-brand-o2">o</span>
              <span className="news-brand-g2">g</span>
              <span className="news-brand-l">l</span>
              <span className="news-brand-e">e</span>
            </div>
            <span className="news-brand-title">{appTitle}</span>
          </div>

          {!isMobile && (
            <div className="news-nav-search">
              <div className="news-search-container">
                <span className="news-search-icon">
                  {renderIcon("Search", 20)}
                </span>
                <input
                  type="text"
                  placeholder="Search for topics, locations & sources"
                  className="news-search-input"
                />
                <span className="news-search-dropdown">
                  {renderIcon("ChevronDown", 20)}
                </span>
              </div>
            </div>
          )}

          <div className="news-nav-actions">
            <button className="news-action-button" aria-label="Search">
              {renderIcon("Search", 24)}
            </button>
            <button className="news-action-button" aria-label="Help">
              {renderIcon("HelpCircle", 24)}
            </button>
            <button className="news-action-button" aria-label="Settings">
              {renderIcon("Settings", 24)}
            </button>
            <button className="news-signin-button">
              Sign in
            </button>
          </div>
        </div>
      </div>

      {/* Primary navigation tabs (Home, For you, Following, etc) */}
      <div className="news-nav-tabs primary">
        <div className="news-tabs-inner">
          {primaryNavItems.map((item) => (
            <Link
              key={item.id}
              to={getItemUrl(item)}
              className={`news-tab-item ${isItemActive(item) ? "active" : ""}`}
            >
              {item.iconName && renderIcon(item.iconName, 20)}
              <span className="news-tab-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Secondary navigation tabs (U.S., World, Local, etc) */}
      {secondarySection && (
        <div className="news-nav-tabs secondary">
          <div className="news-tabs-inner">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.id}
                to={getItemUrl(item)}
                className={`news-tab-item ${
                  isItemActive(item) ? "active" : ""
                }`}
              >
                <span className="news-tab-label">{item.label}</span>
              </Link>
            ))}

            <button className="news-more-sections" aria-label="More sections">
              {renderIcon("MoreVertical", 20)}
            </button>
          </div>
        </div>
      )}

      {/* Mobile drawer */}
      <div className={`news-nav-drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="news-nav-drawer-content">
          {/* Primary navigation items */}
          <div className="news-drawer-section">
            {primaryNavItems.map((item) => (
              <Link
                key={item.id}
                to={getItemUrl(item)}
                className={`news-drawer-item ${
                  isItemActive(item) ? "active" : ""
                }`}
              >
                {item.iconName && renderIcon(item.iconName, 20)}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="news-drawer-divider"></div>

          {/* Secondary navigation items */}
          {secondarySection && (
            <div className="news-drawer-section">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={getItemUrl(item)}
                  className={`news-drawer-item ${
                    isItemActive(item) ? "active" : ""
                  }`}
                >
                  {item.iconName && renderIcon(item.iconName, 20)}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isDrawerOpen && (
        <div className="news-nav-backdrop" onClick={closeDrawer} />
      )}
    </div>
  );
}
