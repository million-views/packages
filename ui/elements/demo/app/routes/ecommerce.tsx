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
  MegaDropdownItem,
  MenuItem,
  NavigationItemProps,
  SelectOption,
} from "@m5nv/ui-elements";

// Product interface for better type safety
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
    { id: "wishlist", label: "Wishlist", icon: "❤️", badge: 5 },
    { id: "cart", label: "Cart", icon: "🛒", badge: cartItems.length },
    { id: "account", label: "Account", icon: "👤" },
  ];

  // Navigation dropdown data (unchanged for functionality)
  const electronicsDropdown = {
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
            description: "All-in-one and tower PCs",
          },
          {
            id: "tablets",
            label: "Tablets",
            icon: "📱",
            description: "iPad, Android, and Windows tablets",
          },
          {
            id: "accessories",
            label: "Computer Accessories",
            icon: "⌨️",
            description: "Keyboards, mice, and more",
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
            description: "Wireless, noise-canceling, and more",
          },
          {
            id: "speakers",
            label: "Speakers",
            icon: "🔊",
            description: "Bluetooth and smart speakers",
          },
          {
            id: "smartwatches",
            label: "Smart Watches",
            icon: "⌚",
            description: "Fitness tracking and connectivity",
          },
        ],
      },
      {
        id: "gaming",
        title: "Gaming",
        items: [
          {
            id: "consoles",
            label: "Gaming Consoles",
            icon: "🎮",
            description: "PlayStation, Xbox, Nintendo Switch",
          },
          {
            id: "pc-gaming",
            label: "PC Gaming",
            icon: "🖥️",
            description: "Graphics cards, gaming PCs",
          },
          {
            id: "gaming-accessories",
            label: "Gaming Accessories",
            icon: "🕹️",
            description: "Controllers, headsets, keyboards",
          },
        ],
      },
    ],
    featuredItems: [
      { id: "iphone", label: "iPhone 15 Pro", icon: "📱" },
      { id: "macbook", label: "MacBook Air M3", icon: "💻" },
      { id: "airpods", label: "AirPods Pro", icon: "🎧" },
      { id: "ps5", label: "PlayStation 5", icon: "🎮" },
    ],
  };

  const clothingDropdown = {
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
          {
            id: "shoes",
            label: "Men's Shoes",
            icon: "👞",
            description: "Sneakers, boots, and dress shoes",
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
          {
            id: "womens-shoes",
            label: "Women's Shoes",
            icon: "👠",
            description: "Heels, flats, and sneakers",
          },
        ],
      },
      {
        id: "accessories",
        title: "Accessories",
        items: [
          {
            id: "bags",
            label: "Bags & Purses",
            icon: "👜",
            description: "Handbags, backpacks, and wallets",
          },
          {
            id: "jewelry",
            label: "Jewelry",
            icon: "💍",
            description: "Rings, necklaces, and earrings",
          },
          {
            id: "watches",
            label: "Watches",
            icon: "⌚",
            description: "Fashion and luxury timepieces",
          },
          {
            id: "sunglasses",
            label: "Sunglasses",
            icon: "🕶️",
            description: "Designer and sport sunglasses",
          },
        ],
      },
    ],
    featuredItems: [
      { id: "summer-dress", label: "Summer Collection", icon: "👗" },
      { id: "designer-bag", label: "Designer Bags", icon: "👜" },
      { id: "premium-shoes", label: "Premium Footwear", icon: "👠" },
    ],
  };

  const navigationItems: NavigationItemProps[] = [
    {
      label: "Electronics",
      icon: "⚡",
      dropdown: electronicsDropdown,
    },
    {
      label: "Clothing",
      icon: "👕",
      dropdown: clothingDropdown,
    },
    {
      label: "Home & Garden",
      icon: "🏠",
      href: "/category/home-garden",
    },
    {
      label: "Sports",
      icon: "🏃",
      href: "/category/sports",
    },
    {
      label: "Books",
      icon: "📚",
      href: "/category/books",
    },
  ];

  // Sample product data
  const products: Product[] = [
    {
      id: "1",
      name: "Wireless Headphones",
      description: "Premium noise-canceling headphones with 30-hour battery",
      price: 299,
      image: "🎧",
      category: "electronics",
    },
    {
      id: "2",
      name: "Smart Watch",
      description: "Fitness tracking with heart rate monitor and GPS",
      price: 199,
      image: "⌚",
      category: "electronics",
    },
    {
      id: "3",
      name: "Cotton T-Shirt",
      description: "100% organic cotton, available in multiple colors",
      price: 29,
      image: "👕",
      category: "clothing",
    },
    {
      id: "4",
      name: "JavaScript Guide",
      description: "Complete guide to modern JavaScript development",
      price: 45,
      image: "📚",
      category: "books",
    },
    {
      id: "5",
      name: "Plant Pot Set",
      description: "Ceramic pots perfect for indoor plants",
      price: 89,
      image: "🪴",
      category: "home",
    },
    {
      id: "6",
      name: "Mechanical Keyboard",
      description: "Cherry MX switches with RGB backlighting",
      price: 159,
      image: "⌨️",
      category: "electronics",
    },
  ];

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => product.category === selectedCategory);

  // Convert cart items to MenuItem format for semantic List component
  const cartMenuItems: MenuItem[] = cartItems.map((item, index) => ({
    id: `cart-${item.id}-${index}`,
    label: item.name,
    icon: item.image,
    description: `$${item.price} • Qty: ${item.quantity}`,
  }));

  const handleNavItemClick = (item: MegaDropdownItem) => {
    console.log("Navigation item clicked:", item);

    // Update category based on clicked item
    if (
      item.id.includes("electronics") ||
      ["laptops", "smartphones", "headphones", "consoles"].includes(item.id)
    ) {
      setSelectedCategory("electronics");
    } else if (
      item.id.includes("clothing") ||
      ["shirts", "dresses", "bags", "shoes", "womens-shoes"].includes(item.id)
    ) {
      setSelectedCategory("clothing");
    } else if (item.id.includes("home") || item.id === "home-garden") {
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
    }
  };

  const handleCartItemClick = (item: MenuItem) => {
    console.log("Cart item clicked:", item.label);
    // Could handle item editing, removal, etc.
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="ecommerce-container">
      {/* Main Navigation with MegaDropdown */}
      <Navigation
        brand={{
          label: "ShopDemo",
          icon: "🛍️",
          href: "/",
        }}
        items={navigationItems.map((item) => ({
          ...item,
          onItemClick: handleNavItemClick,
        }))}
        actions={
          <ActionBar
            actions={shopActions}
            onActionClick={handleActionClick}
            variant="compact"
          />
        }
      />

      <div className="ecommerce-content">
        <Breadcrumbs items={breadcrumbs} />

        <div className="ecommerce-header">
          <h1 className="ecommerce-title">Shop</h1>
        </div>

        {/* Search and Filters - Improved Layout */}
        <div className="ecommerce-filters">
          <SearchBox
            placeholder="Search products..."
            variant="outlined"
            className="ecommerce-search"
          />
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onSelect={setSelectedCategory}
            placeholder="Category"
          />
          <Select
            options={sortOptions}
            value={sortBy}
            onSelect={setSortBy}
            placeholder="Sort by"
          />
        </div>

        <p className="ecommerce-results">
          Showing {filteredProducts.length} products
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
        </p>

        {/* Product Grid - Improved with semantic CSS */}
        <div className="ecommerce-product-grid">
          {filteredProducts.map((product) => (
            <Card key={product.id} variant="elevated" padding="lg">
              <div className="product-image">
                {product.image}
              </div>

              <h3 className="product-title">
                {product.name}
              </h3>

              <p className="product-description">
                {product.description}
              </p>

              <div className="product-footer">
                <span className="product-price">
                  ${product.price}
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
      </div>

      {/* Shopping Cart Drawer - Improved with List component */}
      <Drawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        position="right"
        mode="temporary"
      >
        <div className="cart-content">
          <h3 className="cart-title">
            Shopping Cart ({cartItems.length})
          </h3>

          {cartItems.length === 0
            ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
              </div>
            )
            : (
              <>
                <div className="cart-items">
                  <List
                    items={cartMenuItems}
                    variant="compact"
                    onItemClick={handleCartItemClick}
                  />
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span className="cart-total-label">Total:</span>
                    <span className="cart-total-amount">${cartTotal}</span>
                  </div>

                  <div className="cart-actions">
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
