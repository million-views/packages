import { useState } from "react";
import {
  ActionBar,
  Breadcrumbs,
  Button,
  Card,
  Drawer,
  List,
  MegaDropdown,
  SearchBox,
  Select,
} from "@m5nv/ui-elements";
import type {
  Action,
  BreadcrumbItem,
  MenuGroup,
  MenuItem,
  SelectOption,
} from "@m5nv/ui-elements";

export default function Ecommerce() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [cartItems, setCartItems] = useState<any[]>([]);

  const breadcrumbs: BreadcrumbItem[] = [
    { id: "home", label: "Home", href: "/" },
    { id: "shop", label: "Shop" },
    { id: "category", label: "Electronics" },
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
    { id: "wishlist", label: "Wishlist", icon: "❤️", badge: 5 },
    { id: "cart", label: "Cart", icon: "🛒", badge: cartItems.length },
    { id: "account", label: "Account", icon: "👤" },
  ];

  // Sample product data
  const products: MenuItem[] = [
    {
      id: "1",
      label: "Wireless Headphones",
      description: "Premium noise-canceling headphones with 30-hour battery",
      icon: "🎧",
      badge: 299,
      group: "electronics",
    },
    {
      id: "2",
      label: "Smart Watch",
      description: "Fitness tracking with heart rate monitor and GPS",
      icon: "⌚",
      badge: 199,
      group: "electronics",
    },
    {
      id: "3",
      label: "Cotton T-Shirt",
      description: "100% organic cotton, available in multiple colors",
      icon: "👕",
      badge: 29,
      group: "clothing",
    },
    {
      id: "4",
      label: "JavaScript Guide",
      description: "Complete guide to modern JavaScript development",
      icon: "📚",
      badge: 45,
      group: "books",
    },
    {
      id: "5",
      label: "Plant Pot Set",
      description: "Ceramic pots perfect for indoor plants",
      icon: "🪴",
      badge: 89,
      group: "home",
    },
    {
      id: "6",
      label: "Mechanical Keyboard",
      description: "Cherry MX switches with RGB backlighting",
      icon: "⌨️",
      badge: 159,
      group: "electronics",
    },
    {
      id: "7",
      label: "Denim Jacket",
      description: "Classic fit denim jacket, stone washed",
      icon: "🧥",
      badge: 79,
      group: "clothing",
    },
    {
      id: "8",
      label: "Recipe Book",
      description: "100 healthy recipes for busy professionals",
      icon: "🍳",
      badge: 32,
      group: "books",
    },
  ];

  // MegaDropdown categories
  const categoryGroups: MenuGroup[] = [
    {
      id: "electronics",
      title: "Electronics",
      items: [
        { id: "phones", label: "Smartphones", icon: "📱", featured: true },
        { id: "laptops", label: "Laptops", icon: "💻", featured: true },
        { id: "headphones", label: "Headphones", icon: "🎧" },
        { id: "watches", label: "Smart Watches", icon: "⌚" },
        { id: "cameras", label: "Cameras", icon: "📷" },
      ],
    },
    {
      id: "clothing",
      title: "Clothing",
      items: [
        { id: "mens", label: "Men's Fashion", icon: "👔", featured: true },
        { id: "womens", label: "Women's Fashion", icon: "👗", featured: true },
        { id: "shoes", label: "Shoes", icon: "👟" },
        { id: "accessories", label: "Accessories", icon: "👜" },
      ],
    },
    {
      id: "home",
      title: "Home & Garden",
      items: [
        { id: "furniture", label: "Furniture", icon: "🪑" },
        { id: "decor", label: "Home Decor", icon: "🖼️" },
        { id: "kitchen", label: "Kitchen", icon: "🍳", featured: true },
        { id: "garden", label: "Garden", icon: "🌱" },
      ],
    },
  ];

  const filteredProducts = products.filter((product) =>
    selectedCategory === "all" || product.group === selectedCategory
  );

  const handleAddToCart = (product: MenuItem) => {
    setCartItems(
      (prev) => [...prev, { ...product, quantity: 1, total: product.badge }],
    );
    setCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleActionClick = (action: Action) => {
    if (action.id === "cart") {
      setCartOpen(true);
    }
  };

  const handleCategorySelect = (item: MenuItem) => {
    setSelectedCategory(item.group || "all");
  };

  const handleSearch = (query: string) => {
    console.log("Search products:", query);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div style={{ padding: "var(--mv-space-xl)" }}>
      <Breadcrumbs items={breadcrumbs} />

      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "var(--mv-space-lg) 0",
        }}
      >
        <h1 style={{ margin: 0 }}>Shop</h1>
        <ActionBar
          actions={shopActions}
          onActionClick={handleActionClick}
          variant="compact"
        />
      </div>

      {/* Search and Categories */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "var(--mv-space-xl)",
          marginBottom: "var(--mv-space-xl)",
        }}
      >
        <Card variant="outlined" padding="lg">
          <h3 style={{ margin: "0 0 var(--mv-space-lg) 0" }}>
            Browse Categories
          </h3>
          <MegaDropdown
            groups={categoryGroups}
            columns={1}
            showFeatured={true}
            onItemClick={handleCategorySelect}
          />
        </Card>

        <Card variant="outlined" padding="lg">
          <div
            style={{
              display: "flex",
              gap: "var(--mv-space-md)",
              marginBottom: "var(--mv-space-lg)",
            }}
          >
            <SearchBox
              placeholder="Search products..."
              variant="outlined"
              onSearch={handleSearch}
              clearable
            />
            <Select
              options={categoryOptions}
              value={selectedCategory}
              onSelect={(value) => setSelectedCategory(value)}
              placeholder="Category"
            />
            <Select
              options={sortOptions}
              value={sortBy}
              onSelect={(value) => setSortBy(value)}
              placeholder="Sort by"
            />
          </div>

          <p
            style={{
              color: "var(--mv-color-text-secondary)",
              margin: "0 0 var(--mv-space-lg) 0",
            }}
          >
            Showing {filteredProducts.length} products
          </p>

          {/* Product List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "var(--mv-space-lg)",
            }}
          >
            {filteredProducts.map((product) => (
              <Card key={product.id} variant="elevated" padding="lg">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--mv-space-md)",
                    marginBottom: "var(--mv-space-md)",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{product.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 var(--mv-space-xs) 0" }}>
                      {product.label}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--mv-color-text-secondary)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {product.description}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      color: "var(--mv-color-primary)",
                    }}
                  >
                    ${product.badge}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Shopping Cart Drawer */}
      <Drawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        position="right"
        mode="temporary"
      >
        <div style={{ padding: "var(--mv-space-lg)" }}>
          <h3 style={{ margin: "0 0 var(--mv-space-lg) 0" }}>
            Shopping Cart ({cartItems.length})
          </h3>

          {cartItems.length === 0
            ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "var(--mv-space-2xl)",
                  color: "var(--mv-color-text-secondary)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    marginBottom: "var(--mv-space-md)",
                  }}
                >
                  🛒
                </div>
                <p>Your cart is empty</p>
              </div>
            )
            : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--mv-space-md)",
                    marginBottom: "var(--mv-space-xl)",
                  }}
                >
                  {cartItems.map((item) => (
                    <Card key={item.id} variant="outlined" padding="md">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--mv-space-sm)",
                          }}
                        >
                          <span>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: "500" }}>
                              {item.label}
                            </div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--mv-color-text-secondary)",
                              }}
                            >
                              ${item.badge} × {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--mv-space-sm)",
                          }}
                        >
                          <strong>${item.total}</strong>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveFromCart(item.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--mv-color-border)",
                    paddingTop: "var(--mv-space-lg)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "var(--mv-space-lg)",
                    }}
                  >
                    <span style={{ fontSize: "1.125rem", fontWeight: "500" }}>
                      Total:
                    </span>
                    <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                      ${cartTotal}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--mv-space-sm)",
                    }}
                  >
                    <Button variant="primary" size="lg">
                      Checkout
                    </Button>
                    <Button variant="ghost" onClick={() => setCartOpen(false)}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </>
            )}
        </div>
      </Drawer>
    </div>
  );
}
