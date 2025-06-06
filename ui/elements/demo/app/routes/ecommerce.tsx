// ===========================================
// MIGRATED ECOMMERCE.TSX - UPDATED FOR V2.0
// ===========================================

import { useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Button,
  Card,
  Drawer,
  List,
  Navigation,
  SearchBox,
  Select,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
  MenuItem,
  NavigationItem,
  SelectOption,
} from "@m5nv/ui-elements";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export default function Ecommerce() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [cartItems, setCartItems] = useState<
    (Product & { quantity: number })[]
  >([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "shop", label: "Shop" },
  ];

  const categoryOptions: SelectOption[] = [
    { value: "all", label: "All Categories" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "home", label: "Home & Garden" },
  ];

  const sortOptions: SelectOption[] = [
    { value: "popular", label: "Most Popular" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "rating", label: "Highest Rated" },
  ];

  const shopActions: Action[] = [
    {
      id: "view",
      label: viewMode === "grid" ? "List View" : "Grid View",
      icon: viewMode === "grid" ? "☰" : "⊞",
    },
    { id: "filters", label: "Filters", icon: "🔍" },
    { id: "wishlist", label: "Wishlist", icon: "❤️", badge: 5 },
    { id: "cart", label: "Cart", icon: "🛒", badge: cartItems.length },
    { id: "account", label: "Account", icon: "👤" },
  ];

  // FIXED: Proper NavigationItem structure (not NavigationItemProps)
  const navigationItems: NavigationItem[] = [
    {
      id: "electronics",
      label: "Electronics",
      icon: "⚡",
      dropdown: {
        groups: [
          {
            id: "computers",
            title: "Computers & Tablets",
            items: [
              {
                id: "laptops",
                label: "Laptops",
                icon: "💻",
                description: "Gaming, business, and ultrabooks",
              },
              {
                id: "desktops",
                label: "Desktop Computers",
                icon: "🖥️",
                description: "Powerful workstations and gaming rigs",
              },
              {
                id: "tablets",
                label: "Tablets",
                icon: "📱",
                description: "iPad, Android, and Windows tablets",
              },
            ],
          },
          {
            id: "mobile",
            title: "Mobile & Audio",
            items: [
              {
                id: "smartphones",
                label: "Smartphones",
                icon: "📱",
                description: "Latest iPhone and Android devices",
              },
              {
                id: "headphones",
                label: "Headphones",
                icon: "🎧",
                description: "Wireless and noise-canceling",
              },
              {
                id: "speakers",
                label: "Speakers",
                icon: "🔊",
                description: "Bluetooth and smart speakers",
              },
            ],
          },
        ],
        featuredItems: [
          { id: "iphone", label: "iPhone 15 Pro", icon: "📱" },
          { id: "macbook", label: "MacBook Pro M3", icon: "💻" },
          { id: "airpods", label: "AirPods Pro", icon: "🎧" },
        ],
        columns: 2,
      },
    },
    {
      id: "clothing",
      label: "Clothing",
      icon: "👕",
      dropdown: {
        groups: [
          {
            id: "mens",
            title: "Men's Fashion",
            items: [
              {
                id: "shirts",
                label: "Shirts & T-Shirts",
                icon: "👔",
                description: "Casual and formal wear",
              },
              {
                id: "pants",
                label: "Pants & Jeans",
                icon: "👖",
                description: "Denim, chinos, and dress pants",
              },
              {
                id: "outerwear",
                label: "Jackets & Coats",
                icon: "🧥",
                description: "Winter coats and light jackets",
              },
            ],
          },
          {
            id: "womens",
            title: "Women's Fashion",
            items: [
              {
                id: "dresses",
                label: "Dresses",
                icon: "👗",
                description: "Casual, formal, and party dresses",
              },
              {
                id: "tops",
                label: "Tops & Blouses",
                icon: "👚",
                description: "T-shirts, blouses, and sweaters",
              },
              {
                id: "bottoms",
                label: "Pants & Skirts",
                icon: "👖",
                description: "Jeans, leggings, and skirts",
              },
            ],
          },
        ],
        featuredItems: [
          { id: "summer-dress", label: "Summer Collection", icon: "👗" },
          { id: "designer-bag", label: "Designer Bags", icon: "👜" },
          { id: "premium-shoes", label: "Premium Footwear", icon: "👠" },
        ],
        columns: 2,
      },
    },
    {
      id: "home-garden",
      label: "Home & Garden",
      icon: "🏠",
      href: "/category/home-garden",
    },
    {
      id: "books",
      label: "Books",
      icon: "📚",
      href: "/category/books",
    },
  ];

  const products: Product[] = [
    {
      id: "1",
      name: "Premium Wireless Headphones",
      description:
        "Professional-grade noise-canceling headphones with 30-hour battery life",
      price: 299,
      image: "🎧",
      category: "electronics",
    },
    {
      id: "2",
      name: "Smart Fitness Watch",
      description: "Advanced fitness tracking with heart rate monitor and GPS",
      price: 199,
      image: "⌚",
      category: "electronics",
    },
    {
      id: "3",
      name: "Organic Cotton T-Shirt",
      description: "Sustainably sourced 100% organic cotton tee in 12 colors",
      price: 29,
      image: "👕",
      category: "clothing",
    },
    {
      id: "4",
      name: "Complete JavaScript Guide",
      description:
        "Comprehensive guide to modern JavaScript development and best practices",
      price: 45,
      image: "📚",
      category: "books",
    },
    {
      id: "5",
      name: "Ceramic Plant Pot Set",
      description:
        "Handcrafted ceramic pots with drainage system and matching saucers",
      price: 89,
      image: "🪴",
      category: "home",
    },
    {
      id: "6",
      name: "Mechanical Gaming Keyboard",
      description:
        "Professional gaming keyboard with RGB backlighting and programmable macros",
      price: 159,
      image: "⌨️",
      category: "electronics",
    },
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  const filterItems: MenuItem[] = [
    {
      id: "price-range",
      label: "Price Range",
      icon: "💰",
      description: "Filter by price range",
    },
    {
      id: "brand",
      label: "Brand",
      icon: "🏷️",
      description: "Select preferred brands",
    },
    {
      id: "rating",
      label: "Customer Rating",
      icon: "⭐",
      description: "4+ stars and above",
    },
    {
      id: "availability",
      label: "Availability",
      icon: "📦",
      description: "In stock items only",
    },
  ];

  const cartMenuItems: MenuItem[] = cartItems.map((item, index) => ({
    id: `cart-${item.id}-${index}`,
    label: item.name,
    icon: item.image,
    description: `$${item.price} • Qty: ${item.quantity}`,
  }));

  const handleNavItemClick = (item: NavigationItem) => {
    console.log("Navigation item clicked:", item);

    if (
      item.id.includes("electronics") ||
      ["laptops", "smartphones", "headphones"].includes(item.id)
    ) {
      setSelectedCategory("electronics");
    } else if (item.id.includes("clothing")) {
      setSelectedCategory("clothing");
    } else if (item.id.includes("home")) {
      setSelectedCategory("home");
    } else if (item.id.includes("books")) {
      setSelectedCategory("books");
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => [...prev, { ...product, quantity: 1 }]);
    setCartOpen(true);
  };

  const handleActionClick = (action: Action) => {
    if (action.id === "cart") {
      setCartOpen(true);
    } else if (action.id === "filters") {
      setSidebarOpen(!sidebarOpen);
    } else if (action.id === "view") {
      setViewMode(viewMode === "grid" ? "list" : "grid");
    }
  };

  const handleCartItemClick = (item: MenuItem) => {
    console.log("Cart item clicked:", item.label);
  };

  const handleFilterClick = (item: MenuItem) => {
    console.log("Filter clicked:", item.label);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="page-container">
      {/* FIXED: Navigation with proper design props */}
      <Navigation
        brand={{
          label: "ShopDemo Pro",
          icon: "🛍️",
          href: "/",
        }}
        items={navigationItems}
        actions={shopActions}
        onItemClick={handleNavItemClick}
        onActionClick={handleActionClick}
        responsive={true}
        design={{ variant: "default", size: "md" }}
      />

      <Breadcrumbs items={breadcrumbs} responsive={true} />

      <header className="ecommerce-header">
        <div>
          <h1 className="page-title">Shop</h1>
          <p className="page-description">
            Discover amazing products with intelligent container-aware layouts
          </p>
        </div>
        <Button
          design={{ variant: "ghost" }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </header>

      {/* FIXED: Search and Filter Controls with proper design props */}
      <Card design={{ elevation: "raised", padding: "md" }} responsive={true}>
        <div className="search-filters-container">
          <div className="search-filters-grid">
            <SearchBox
              placeholder="Search products..."
              design={{ variant: "outline" }}
              responsive={true}
            />
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onSelect={setSelectedCategory}
              placeholder="Category"
              design={{ variant: "default" }}
              responsive={true}
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onSelect={setSortBy}
              placeholder="Sort by"
              design={{ variant: "default" }}
              responsive={true}
            />
          </div>
        </div>
      </Card>

      {/* Main layout with smooth sidebar transitions */}
      <div
        className={`ecommerce-layout ${
          sidebarOpen
            ? "ecommerce-layout--with-sidebar"
            : "ecommerce-layout--no-sidebar"
        }`}
      >
        {/* Filter Sidebar */}
        {sidebarOpen && (
          <div className="ecommerce-sidebar">
            <Card
              design={{ variant: "outlined", padding: "lg" }}
              responsive={true}
            >
              <h3>Filters</h3>
              <List
                items={filterItems}
                design={{ variant: "detailed" }}
                onItemClick={handleFilterClick}
                responsive={true}
              />
            </Card>
          </div>
        )}

        {/* Main Product Area */}
        <div className="ecommerce-products">
          <p className="products-status">
            Showing {filteredProducts.length} products
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>

          <div
            className={`products-grid ${
              viewMode === "list"
                ? "products-grid--list"
                : "products-grid--three-col"
            }`}
          >
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-card__image">{product.image}</div>
                <div className="product-card__content">
                  <h3 className="product-card__title">{product.name}</h3>
                  <p className="product-card__description">
                    {product.description}
                  </p>
                </div>
                <div className="product-card__footer">
                  <span className="product-card__price">${product.price}</span>
                  <Button
                    design={{
                      variant: "filled",
                      intent: "primary",
                      size: "sm",
                    }}
                    className="product-card__button"
                    onClick={() =>
                      handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FIXED: Shopping Cart Drawer with proper design props */}
      <Drawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        design={{ position: "right", mode: "temporary" }}
        responsive={true}
      >
        <h3>Shopping Cart ({cartItems.length})</h3>

        {cartItems.length === 0
          ? (
            <Card
              design={{ elevation: "raised", padding: "lg" }}
              responsive={true}
            >
              <div className="text-center">
                <div className="font-size-4xl">🛒</div>
                <p>Your cart is empty</p>
                <Button
                  design={{ variant: "filled", intent: "primary" }}
                  onClick={() => setCartOpen(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          )
          : (
            <>
              <List
                items={cartMenuItems}
                design={{ variant: "compact" }}
                onItemClick={handleCartItemClick}
                responsive={true}
              />

              <Card
                design={{ elevation: "raised", padding: "lg" }}
                responsive={true}
              >
                <div className="preview-footer">
                  <span>Total:</span>
                  <span className="text-primary font-weight-bold">
                    ${cartTotal}
                  </span>
                </div>

                <div className="section-spacing">
                  <Button
                    design={{
                      variant: "filled",
                      intent: "primary",
                      size: "lg",
                    }}
                  >
                    Checkout
                  </Button>
                  <Button
                    design={{ variant: "ghost" }}
                    onClick={() => setCartOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Card>
            </>
          )}
      </Drawer>
    </div>
  );
}
