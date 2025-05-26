// file: next/examples/EcommerceExample.jsx
// Example of an e-commerce navigation using the composition-based Navigator component

import React, { useState } from "react";
import {
  Actions,
  Brand,
  Content,
  createIconRenderer,
  Drawer,
  Header,
  Navigator,
} from "../next";
import { Icons } from "../next/icons";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Direct router implementation
const router = {
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: "/" }),
  matchPath: (pattern, pathname) => pathname === pattern ? { pathname } : null,
};

// Create a store logo component
const StoreLogo = () => (
  <div className="store-logo">
    <span className="store-logo-shop">Shop</span>
    <span className="store-logo-hub">Hub</span>
  </div>
);

// E-commerce theme overrides
const ecommerceTheme = {
  colors: {
    primary: "#16A34A", // Green for the primary brand color
    surface: "#FFFFFF",
    navSeparator: "#E5E7EB",
    activeTabIndicator: "#16A34A",
    activeTabBackground: "#ECFDF5",
    text: "#111827",
    textMuted: "#6B7280",
    buttonPrimary: "#16A34A",
    buttonPrimaryText: "#FFFFFF",
    headerBackground: "#FFFFFF",
    footerBackground: "#F9FAFB",
    accentBlue: "#2563EB",
    accentYellow: "#FBBF24",
    sale: "#DC2626",
  },
  typography: {
    fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
    headerSize: "16px",
    navSize: "14px",
    fontWeightNormal: 400,
    fontWeightBold: 600,
  },
  spacing: {
    headerHeight: "72px",
    navItemPadding: "12px 16px",
    sectionSpacing: "16px",
  },
  borders: {
    navSeparator: "1px solid var(--nav-color-navSeparator)",
    radius: "8px",
  },
  transitions: {
    navHover: "all 0.2s ease",
    menuExpand: "all 0.25s ease",
  },
};

// Custom Cart component for the header
const CartButton = () => {
  const [cartCount, setCartCount] = useState(3);

  return (
    <button
      className="cart-button"
      onClick={() => setCartCount((prev) => prev + 1)}
    >
      {renderIcon("ShoppingCart", 24)}
      <span className="cart-count">{cartCount}</span>
    </button>
  );
};

// Custom search component
const SearchInput = () => (
  <div className="ecommerce-search">
    <div className="ecommerce-search-container">
      <input
        type="text"
        placeholder="Search for products..."
        className="ecommerce-search-input"
      />
      <button className="ecommerce-search-button">
        {renderIcon("Search", 20)}
      </button>
    </div>
  </div>
);

// Navigation data
const navigationData = [
  {
    id: "main",
    items: [
      {
        id: "clothing",
        label: "Clothing",
        path: "/clothing",
        icon: "ShoppingBag",
      },
      {
        id: "electronics",
        label: "Electronics",
        path: "/electronics",
        icon: "Smartphone",
      },
      { id: "home", label: "Home & Garden", path: "/home", icon: "Home" },
      { id: "beauty", label: "Beauty", path: "/beauty", icon: "Heart" },
      {
        id: "sports",
        label: "Sports",
        path: "/sports",
        icon: "Activity",
      },
      { id: "toys", label: "Toys", path: "/toys", icon: "Gift" },
    ],
  },
];

// Actions data
const actionsData = [
  {
    id: "account",
    icon: "User",
    label: "Account",
    type: "icon",
    position: "right",
    onClick: () => console.log("Account clicked"),
  },
  {
    id: "wishlist",
    icon: "Heart",
    label: "Wishlist",
    type: "icon",
    position: "right",
    onClick: () => console.log("Wishlist clicked"),
  },
];

// Component for mega menu item
const MegaMenuItem = ({ category, subcategories, featured }) => {
  return (
    <div className="mega-menu-container">
      {/* Categories */}
      <div className="mega-menu-categories">
        <h3 className="mega-menu-title">{category}</h3>
        <ul className="mega-menu-list">
          {subcategories.map((sub) => (
            <li key={sub} className="mega-menu-item">
              <a href="#" className="mega-menu-link">{sub}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured */}
      <div className="mega-menu-featured">
        <h3 className="mega-menu-title">Featured Products</h3>
        <div className="mega-menu-products">
          {featured.map((product) => (
            <div key={product.name} className="mega-menu-product">
              <div className="mega-menu-product-image">
                <div className="mega-menu-product-placeholder">
                  Product Image
                </div>
              </div>
              <h4 className="mega-menu-product-name">{product.name}</h4>
              <p className="mega-menu-product-price">${product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mega menu data
const megaMenus = {
  clothing: {
    category: "Clothing",
    subcategories: [
      "Men's",
      "Women's",
      "Children's",
      "Activewear",
      "Outerwear",
      "Formal",
      "Casual",
      "Seasonal",
      "Accessories",
      "Footwear",
    ],
    featured: [
      { name: "Summer T-Shirt", price: "19.99" },
      { name: "Slim Fit Jeans", price: "49.99" },
      { name: "Cotton Hoodie", price: "39.99" },
    ],
  },
  electronics: {
    category: "Electronics",
    subcategories: [
      "Smartphones",
      "Laptops",
      "Tablets",
      "Headphones",
      "Cameras",
      "Gaming",
      "TV & Home Theater",
      "Wearables",
      "Audio",
      "Accessories",
    ],
    featured: [
      { name: "Wireless Earbuds", price: "89.99" },
      { name: "Smart Watch", price: "199.99" },
      { name: "Bluetooth Speaker", price: "79.99" },
    ],
  },
  home: {
    category: "Home & Garden",
    subcategories: [
      "Furniture",
      "Bedding",
      "Kitchen",
      "Bath",
      "Decor",
      "Organization",
      "Outdoor",
      "Lighting",
      "Rugs",
      "Seasonal",
    ],
    featured: [
      { name: "Ceramic Planter", price: "24.99" },
      { name: "Throw Pillow Set", price: "34.99" },
      { name: "Scented Candle", price: "18.99" },
    ],
  },
};

// Custom navigation component with mega menu
const CustomNavigation = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  return (
    <div className="ecommerce-nav">
      <div className="ecommerce-nav-inner">
        {navigationData[0].items.map((item) => (
          <div
            key={item.id}
            className={`ecommerce-nav-item ${
              activeMenu === item.id ? "ecommerce-nav-item-active" : ""
            }`}
            onMouseEnter={() => setActiveMenu(item.id)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <span>{item.label}</span>
            {activeMenu === item.id && megaMenus[item.id] && (
              <MegaMenuItem {...megaMenus[item.id]} />
            )}
          </div>
        ))}

        {/* Sale item with special styling */}
        <div className="ecommerce-nav-item ecommerce-nav-item-sale">
          SALE
        </div>
      </div>
    </div>
  );
};

// Footer with newsletter signup
const EcommerceFooter = () => {
  return (
    <footer className="ecommerce-footer">
      <div className="ecommerce-footer-container">
        <div className="ecommerce-footer-links">
          <div className="ecommerce-footer-column">
            <h3 className="ecommerce-footer-title">Shop</h3>
            <ul className="ecommerce-footer-list">
              {[
                "New Arrivals",
                "Best Sellers",
                "Sale",
                "Clothing",
                "Electronics",
                "Home & Garden",
              ].map((item) => (
                <li key={item} className="ecommerce-footer-item">
                  <a href="#" className="ecommerce-footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ecommerce-footer-column">
            <h3 className="ecommerce-footer-title">Customer Service</h3>
            <ul className="ecommerce-footer-list">
              {[
                "Contact Us",
                "FAQ",
                "Shipping & Returns",
                "Store Locator",
                "Gift Cards",
                "Size Guide",
              ].map((item) => (
                <li key={item} className="ecommerce-footer-item">
                  <a href="#" className="ecommerce-footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ecommerce-footer-column">
            <h3 className="ecommerce-footer-title">About</h3>
            <ul className="ecommerce-footer-list">
              {[
                "Our Story",
                "Careers",
                "Press",
                "Sustainability",
                "Affiliates",
                "Terms & Conditions",
              ].map((item) => (
                <li key={item} className="ecommerce-footer-item">
                  <a href="#" className="ecommerce-footer-link">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ecommerce-footer-column">
            <h3 className="ecommerce-footer-title">Newsletter</h3>
            <p className="ecommerce-footer-text">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="ecommerce-newsletter">
              <input
                type="email"
                placeholder="Enter your email"
                className="ecommerce-newsletter-input"
              />
              <button className="ecommerce-newsletter-button">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="ecommerce-footer-bottom">
          <div className="ecommerce-footer-copyright">
            &copy; 2025 ShopHub. All rights reserved.
          </div>
          <div className="ecommerce-footer-social">
            {["Facebook", "Instagram", "Twitter", "Pinterest"].map((social) => (
              <a key={social} href="#" className="ecommerce-footer-social-link">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main content component
const EcommerceContent = () => (
  <div className="ecommerce-content-wrapper">
    {/* Hero banner */}
    <div className="ecommerce-hero">
      <div className="ecommerce-hero-content">
        <h1 className="ecommerce-hero-title">Summer Collection 2025</h1>
        <p className="ecommerce-hero-text">
          Discover the latest trends and styles for the summer season. Shop our
          new arrivals for the hottest looks.
        </p>
        <button className="ecommerce-hero-button">Shop Now</button>
      </div>
    </div>

    {/* Featured categories */}
    <div className="ecommerce-section">
      <h2 className="ecommerce-section-title">Shop by Category</h2>
      <div className="ecommerce-category-grid">
        {["Clothing", "Electronics", "Home & Garden"].map((category) => (
          <div key={category} className="ecommerce-category-item">
            <h3 className="ecommerce-category-name">{category}</h3>
          </div>
        ))}
      </div>
    </div>

    {/* Featured products */}
    <div className="ecommerce-section">
      <h2 className="ecommerce-section-title">Best Sellers</h2>
      <div className="ecommerce-product-grid">
        {[
          { name: "Wireless Earbuds", price: "89.99" },
          { name: "Summer T-Shirt", price: "19.99" },
          { name: "Ceramic Planter", price: "24.99" },
          { name: "Smart Watch", price: "199.99" },
        ].map((product) => (
          <div key={product.name} className="ecommerce-product-card">
            <div className="ecommerce-product-image">
              Product Image
            </div>
            <div className="ecommerce-product-info">
              <h3 className="ecommerce-product-name">{product.name}</h3>
              <p className="ecommerce-product-price">${product.price}</p>
              <button className="ecommerce-product-button">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer */}
    <EcommerceFooter />
  </div>
);

const EcommerceExample = () => {
  return (
    <Navigator
      brand={{
        logo: <StoreLogo />,
        title: "ShopHub",
        url: "/",
      }}
      navigation={navigationData}
      router={router}
      renderIcon={renderIcon}
      actions={actionsData}
      responsive={{
        mobile: {
          breakpoint: 768,
          primaryNav: "drawer",
          categoryNav: "tabs",
          brand: {
            truncateTitle: true,
            useIcon: true,
          },
          actions: {
            visible: ["account"],
            overflowMenu: ["wishlist"],
          },
        },
        tablet: {
          breakpoint: 1024,
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
        desktop: {
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
      }}
      themeOverrides={ecommerceTheme}
    >
      {/* React 19 style element for styling */}
      <style>
        {`
        /* Logo */
        .store-logo {
          font-size: 22px;
          font-weight: bold;
        }
        
        .store-logo-shop {
          color: ${ecommerceTheme.colors.primary};
        }
        
        .store-logo-hub {
          color: ${ecommerceTheme.colors.accentBlue};
        }
        
        /* Layout */
        .ecommerce-layout {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - ${ecommerceTheme.spacing.headerHeight});
        }
        
        /* Custom header elements */
        .ecommerce-search {
          flex: 1;
          max-width: 600px;
          margin: 0 24px;
        }
        
        .ecommerce-search-container {
          display: flex;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .ecommerce-search-input {
          flex: 1;
          padding: 10px 16px;
          border: none;
          font-size: 14px;
          outline: none;
        }
        
        .ecommerce-search-button {
          padding: 0 16px;
          background-color: ${ecommerceTheme.colors.primary};
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Cart button */
        .cart-button {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .cart-count {
          position: absolute;
          top: 0;
          right: 0;
          background-color: ${ecommerceTheme.colors.accentBlue};
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Custom navigation */
        .ecommerce-nav {
          background-color: ${ecommerceTheme.colors.surface};
          border-bottom: 1px solid ${ecommerceTheme.colors.navSeparator};
          padding: 0 24px;
        }
        
        .ecommerce-nav-inner {
          display: flex;
          height: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .ecommerce-nav-item {
          position: relative;
          padding: ${ecommerceTheme.spacing.navItemPadding};
          cursor: pointer;
          transition: ${ecommerceTheme.transitions.navHover};
          font-weight: 500;
        }
        
        .ecommerce-nav-item:hover {
          color: ${ecommerceTheme.colors.primary};
        }
        
        .ecommerce-nav-item-active {
          color: ${ecommerceTheme.colors.primary};
        }
        
        .ecommerce-nav-item-sale {
          color: ${ecommerceTheme.colors.sale} !important;
          font-weight: 600;
        }
        
        /* Mega menu */
        .mega-menu-container {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: ${ecommerceTheme.colors.surface};
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-radius: 0 0 ${ecommerceTheme.borders.radius} ${ecommerceTheme.borders.radius};
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 3fr;
          gap: 24px;
          z-index: 100;
          width: 800px;
        }
        
        .mega-menu-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .mega-menu-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .mega-menu-item {
          margin-bottom: 8px;
        }
        
        .mega-menu-link {
          color: ${ecommerceTheme.colors.textMuted};
          text-decoration: none;
          font-size: 14px;
        }
        
        .mega-menu-link:hover {
          color: ${ecommerceTheme.colors.primary};
        }
        
        .mega-menu-products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        .mega-menu-product {
          text-align: center;
        }
        
        .mega-menu-product-image {
          background-color: #F9FAFB;
          border-radius: ${ecommerceTheme.borders.radius};
          padding: 16px;
          margin-bottom: 8px;
        }
        
        .mega-menu-product-placeholder {
          width: 100%;
          height: 120px;
          background-color: #E5E7EB;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }
        
        .mega-menu-product-name {
          font-size: 14px;
          font-weight: 500;
          margin: 8px 0 4px;
        }
        
        .mega-menu-product-price {
          font-size: 14px;
          font-weight: 600;
          color: ${ecommerceTheme.colors.primary};
          margin: 0;
        }
        
        /* Main content */
        .ecommerce-content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .ecommerce-hero {
          margin: 24px 0;
          position: relative;
          height: 400px;
          border-radius: 12px;
          overflow: hidden;
          background-color: #F3F4F6;
          display: flex;
          align-items: center;
          padding: 0 48px;
        }
        
        .ecommerce-hero-content {
          max-width: 500px;
        }
        
        .ecommerce-hero-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        
        .ecommerce-hero-text {
          font-size: 16px;
          color: ${ecommerceTheme.colors.textMuted};
          margin-bottom: 24px;
        }
        
        .ecommerce-hero-button {
          background-color: ${ecommerceTheme.colors.primary};
          color: white;
          border: none;
          border-radius: ${ecommerceTheme.borders.radius};
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .ecommerce-section {
          margin: 48px 0;
        }
        
        .ecommerce-section-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 24px;
          text-align: center;
        }
        
        .ecommerce-category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .ecommerce-category-item {
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          height: 200px;
          background-color: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .ecommerce-category-name {
          font-size: 20px;
          font-weight: 600;
        }
        
        .ecommerce-product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        
        .ecommerce-product-card {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        
        .ecommerce-product-image {
          height: 200px;
          background-color: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
        }
        
        .ecommerce-product-info {
          padding: 16px;
        }
        
        .ecommerce-product-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .ecommerce-product-price {
          font-size: 18px;
          font-weight: 600;
          color: ${ecommerceTheme.colors.primary};
          margin: 0 0 16px;
        }
        
        .ecommerce-product-button {
          width: 100%;
          background-color: ${ecommerceTheme.colors.primary};
          color: white;
          border: none;
          border-radius: ${ecommerceTheme.borders.radius};
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        /* Footer */
        .ecommerce-footer {
          background-color: ${ecommerceTheme.colors.footerBackground};
          padding: 48px 0;
          border-top: ${ecommerceTheme.borders.navSeparator};
          margin-top: 48px;
        }
        
        .ecommerce-footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .ecommerce-footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
          margin-bottom: 48px;
        }
        
        .ecommerce-footer-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .ecommerce-footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .ecommerce-footer-item {
          margin-bottom: 8px;
        }
        
        .ecommerce-footer-link {
          color: ${ecommerceTheme.colors.textMuted};
          text-decoration: none;
        }
        
        .ecommerce-footer-text {
          color: ${ecommerceTheme.colors.textMuted};
          margin-bottom: 16px;
        }
        
        .ecommerce-newsletter {
          display: flex;
        }
        
        .ecommerce-newsletter-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 8px 0 0 8px;
          font-size: 14px;
          outline: none;
        }
        
        .ecommerce-newsletter-button {
          padding: 0 16px;
          background-color: ${ecommerceTheme.colors.primary};
          color: white;
          border: none;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
        }
        
        .ecommerce-footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 0;
          border-top: ${ecommerceTheme.borders.navSeparator};
        }
        
        .ecommerce-footer-copyright {
          color: ${ecommerceTheme.colors.textMuted};
          font-size: 14px;
        }
        
        .ecommerce-footer-social {
          display: flex;
          gap: 16px;
        }
        
        .ecommerce-footer-social-link {
          color: ${ecommerceTheme.colors.text};
          text-decoration: none;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ecommerce-nav {
            display: none;
          }
          
          .ecommerce-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .ecommerce-hero {
            height: auto;
            padding: 32px 24px;
          }
          
          .ecommerce-category-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .ecommerce-footer-bottom {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
        `}
      </style>

      {/* Header with brand, search, and actions */}
      <Header>
        <Brand logo={<StoreLogo />} title="ShopHub" />
        <SearchInput />
        <div className="header-actions">
          <CartButton />
          <Actions actions={actionsData} />
        </div>
      </Header>

      {/* Custom navigation with mega menu */}
      <CustomNavigation />

      {/* Main layout with content */}
      <div className="ecommerce-layout">
        <Drawer mode="temporary" />
        <Content>
          <EcommerceContent />
        </Content>
      </div>
    </Navigator>
  );
};

export default EcommerceExample;
