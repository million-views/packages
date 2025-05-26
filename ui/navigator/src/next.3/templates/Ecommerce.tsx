// file: src/next/navigator/templates/EcommerceTemplate.tsx
import { useState } from "react";
import type { NavTreeNode, TemplateProps } from "../types";
import "./styles/ecommerce.css";

export function EcommerceTemplate({
  navigationTree,
  activeSection,
  isDrawerOpen,
  isMobile,
  toggleDrawer,
  closeDrawer,
  getItemsByGroup,
  getRelatedItems,
  renderIcon,
  isItemActive,
  getItemUrl,
  Link,
  appTitle = "ShopHub",
}: TemplateProps) {
  const navItems = navigationTree[activeSection] || [];
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const handleMouseEnter = (item: NavTreeNode) => {
    if (item.displayType === "megamenu") {
      setActiveMegaMenu(item.id);
    }
  };

  const handleMouseLeave = () => {
    setActiveMegaMenu(null);
  };

  // Render mega menu for an item
  const renderMegaMenu = (item: NavTreeNode) => {
    const relatedItems = getRelatedItems(item);

    // Group by category
    const categoriesGroup = relatedItems.filter((i) =>
      i.group === "categories"
    );
    const featuredGroup = relatedItems.filter((i) => i.group === "featured");

    return (
      <div className="store-mega-menu">
        <div className="store-mega-menu-categories">
          <h3 className="store-mega-menu-title">{item.label} Categories</h3>
          <ul className="store-mega-menu-list">
            {categoriesGroup.map((category) => (
              <li key={category.id} className="store-mega-menu-item">
                <Link
                  to={getItemUrl(category)}
                  className="store-mega-menu-link"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {featuredGroup.length > 0 && (
          <div className="store-mega-menu-featured">
            <h3 className="store-mega-menu-title">Featured</h3>
            <div className="store-mega-menu-products">
              {featuredGroup.map((product) => (
                <div key={product.id} className="store-mega-menu-product">
                  <div className="store-product-image-placeholder"></div>
                  <h4 className="store-product-name">{product.label}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="store-nav-container">
      <div className="store-nav-header">
        <div className="store-nav-header-inner">
          {isMobile && (
            <button
              className="store-nav-menu-toggle"
              onClick={toggleDrawer}
              aria-label="Toggle menu"
            >
              {renderIcon("Menu", 24)}
            </button>
          )}

          <div className="store-nav-brand">
            <span className="store-brand-primary">Shop</span>
            <span className="store-brand-secondary">Hub</span>
          </div>

          <div className="store-nav-search">
            <div className="store-search-container">
              <input
                type="text"
                placeholder="Search products..."
                className="store-search-input"
              />
              <button className="store-search-button" aria-label="Search">
                {renderIcon("Search", 20)}
              </button>
            </div>
          </div>

          <div className="store-nav-actions">
            <button className="store-action-button" aria-label="User account">
              {renderIcon("User", 24)}
            </button>
            <button className="store-action-button" aria-label="Wishlist">
              {renderIcon("Heart", 24)}
            </button>
            <button className="store-cart-button" aria-label="Shopping cart">
              {renderIcon("ShoppingCart", 24)}
              <span className="store-cart-count">3</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMobile && (
        <>
          <div className={`store-nav-drawer ${isDrawerOpen ? "open" : ""}`}>
            <div className="store-nav-drawer-content">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={getItemUrl(item)}
                  className={`store-nav-item ${
                    isItemActive(item) ? "active" : ""
                  }`}
                >
                  {item.iconName && renderIcon(item.iconName, 20)}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {isDrawerOpen && (
            <div className="store-nav-backdrop" onClick={closeDrawer} />
          )}
        </>
      )}

      {/* Desktop mega menu navigation */}
      {!isMobile && (
        <div className="store-nav-categories">
          <div className="store-categories-inner">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`store-category-item ${
                  isItemActive(item) ? "active" : ""
                }`}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={handleMouseLeave}
              >
                <Link to={getItemUrl(item)} className="store-category-link">
                  {item.label}
                </Link>

                {activeMegaMenu === item.id && renderMegaMenu(item)}
              </div>
            ))}

            <div className="store-category-item store-category-sale">
              SALE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
