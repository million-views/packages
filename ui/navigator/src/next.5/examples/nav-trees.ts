// file: src/next/examples/navigation-trees.ts
// Updated navigation tree format that rr-builder would generate
// This format represents our "single source of truth" for both routes and navigation

// Dashboard navigation trees
const dashboard = {
  simple: {
    // Navigation items organized by section
    main: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        iconName: "LayoutDashboard",
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/analytics",
        iconName: "BarChart",
      },
      {
        id: "settings",
        label: "Settings",
        path: "/settings",
        iconName: "Settings",
      },
    ],
    // Global actions from build({ actions: [...] })
    actions: [
      {
        id: "notifications",
        label: "Notifications",
        iconName: "Bell",
        tags: ["action", "global"],
      },
      {
        id: "user-profile",
        label: "User Profile",
        iconName: "User",
        tags: ["action", "global"],
      },
      {
        id: "help",
        label: "Help",
        iconName: "HelpCircle",
        tags: ["action", "global"],
      },
    ],
  },
  complex: {
    main: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        iconName: "LayoutDashboard",
        // Context actions from meta({ actions: [...] })
        actions: [
          { id: "refresh-dashboard", label: "Refresh", iconName: "RefreshCw" },
          { id: "export-dashboard", label: "Export", iconName: "Download" },
        ],
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/analytics",
        iconName: "BarChart",
        actions: [
          { id: "filter-analytics", label: "Filter", iconName: "Filter" },
          { id: "print-analytics", label: "Print", iconName: "Printer" },
        ],
        children: [
          {
            id: "overview",
            label: "Overview",
            path: "/analytics/overview",
            iconName: "PieChart",
          },
          {
            id: "reports",
            label: "Reports",
            path: "/analytics/reports",
            iconName: "FileText",
          },
        ],
      },
      {
        id: "users",
        label: "User Management",
        path: "/users",
        iconName: "Users",
        children: [
          {
            id: "list",
            label: "User List",
            path: "/users/list",
            iconName: "List",
            actions: [
              { id: "add-user", label: "Add User", iconName: "UserPlus" },
              { id: "import-users", label: "Import", iconName: "Upload" },
            ],
          },
          {
            id: "roles",
            label: "Roles",
            path: "/users/roles",
            iconName: "Shield",
          },
        ],
      },
      {
        id: "settings",
        label: "Settings",
        path: "/settings",
        iconName: "Settings",
      },
    ],
    // Global actions from build({ actions: [...] })
    actions: [
      {
        id: "notifications",
        label: "Notifications",
        iconName: "Bell",
        badges: { count: 5 }, // Badge data merged from build({ badges: [...] })
        tags: ["action", "global"],
      },
      {
        id: "user-profile",
        label: "User Profile",
        iconName: "User",
        tags: ["action", "global"],
      },
      {
        id: "theme-toggle",
        label: "Toggle Theme",
        iconName: "Moon",
        tags: ["action", "global"],
      },
      {
        id: "help",
        label: "Help",
        iconName: "HelpCircle",
        tags: ["action", "global"],
      },
    ],
  },
};

// Documentation navigation trees
const docs = {
  simple: {
    main: [
      {
        id: "introduction",
        label: "Introduction",
        path: "/introduction",
        iconName: "Book",
      },
      {
        id: "getting-started",
        label: "Getting Started",
        path: "/getting-started",
        iconName: "Play",
      },
      {
        id: "components",
        label: "Components",
        path: "/components",
        iconName: "Layers",
      },
    ],
    actions: [
      {
        id: "github",
        label: "GitHub",
        iconName: "Github",
        tags: ["action", "global"],
      },
      {
        id: "theme-toggle",
        label: "Toggle Theme",
        iconName: "Moon",
        tags: ["action", "global"],
      },
    ],
  },
  complex: {
    main: [
      {
        id: "introduction",
        label: "Introduction",
        path: "/introduction",
        iconName: "Book",
        actions: [
          { id: "edit-page", label: "Edit this page", iconName: "Edit" },
          { id: "feedback", label: "Feedback", iconName: "MessageSquare" },
        ],
      },
      {
        id: "getting-started",
        label: "Getting Started",
        path: "/getting-started",
        iconName: "Play",
        children: [
          {
            id: "installation",
            label: "Installation",
            path: "/getting-started/installation",
          },
          {
            id: "basic-usage",
            label: "Basic Usage",
            path: "/getting-started/basic-usage",
          },
          {
            id: "configuration",
            label: "Configuration",
            path: "/getting-started/configuration",
          },
        ],
      },
      {
        id: "components",
        label: "Components",
        path: "/components",
        iconName: "Layers",
        children: [
          {
            id: "navigator",
            label: "Navigator",
            path: "/components/navigator",
          },
          { id: "header", label: "Header", path: "/components/header" },
          { id: "drawer", label: "Drawer", path: "/components/drawer" },
        ],
      },
      {
        id: "hooks",
        label: "Hooks",
        path: "/hooks",
        iconName: "Anchor",
        actions: [
          { id: "code-example", label: "Show Example", iconName: "Code" },
        ],
        children: [
          {
            id: "use-navigator",
            label: "useNavigator",
            path: "/hooks/use-navigator",
          },
          { id: "use-theme", label: "useTheme", path: "/hooks/use-theme" },
        ],
      },
    ],
    actions: [
      {
        id: "github",
        label: "GitHub",
        iconName: "Github",
        tags: ["action", "global"],
      },
      {
        id: "discord",
        label: "Discord Community",
        iconName: "MessageCircle",
        tags: ["action", "global"],
      },
      {
        id: "theme-toggle",
        label: "Toggle Theme",
        iconName: "Moon",
        tags: ["action", "global"],
      },
    ],
  },
};

// E-commerce navigation trees
const ecommerce = {
  simple: {
    store: [
      {
        id: "clothing",
        label: "Clothing",
        path: "/clothing",
        iconName: "ShoppingBag",
        group: "megamenu",
      },
      {
        id: "electronics",
        label: "Electronics",
        path: "/electronics",
        iconName: "Smartphone",
        group: "megamenu",
      },
      {
        id: "home",
        label: "Home & Garden",
        path: "/home",
        iconName: "Home",
        group: "megamenu",
      },
    ],
    actions: [
      {
        id: "search",
        label: "Search",
        iconName: "Search",
        tags: ["action", "global"],
      },
      {
        id: "account",
        label: "My Account",
        iconName: "User",
        tags: ["action", "global"],
      },
      {
        id: "wishlist",
        label: "Wishlist",
        iconName: "Heart",
        tags: ["action", "global"],
      },
      {
        id: "cart",
        label: "Shopping Cart",
        iconName: "ShoppingCart",
        badges: { count: 3 },
        tags: ["action", "global"],
      },
    ],
  },
  complex: {
    store: [
      {
        id: "clothing",
        label: "Clothing",
        path: "/clothing",
        iconName: "ShoppingBag",
        group: "megamenu",
        actions: [
          { id: "view-new-arrivals", label: "New Arrivals", iconName: "Sparkles" },
          { id: "view-sale-items", label: "Sale Items", iconName: "Tag" },
        ],
        children: [
          {
            id: "mens",
            label: "Men's",
            path: "/clothing/mens",
            parent: "clothing",
            group: "categories",
          },
          {
            id: "womens",
            label: "Women's",
            path: "/clothing/womens",
            parent: "clothing",
            group: "categories",
          },
          {
            id: "kids",
            label: "Kids",
            path: "/clothing/kids",
            parent: "clothing",
            group: "categories",
          },
          {
            id: "tshirt",
            label: "Summer T-Shirt",
            path: "/clothing/tshirt",
            parent: "clothing",
            group: "featured",
          },
          {
            id: "jeans",
            label: "Slim Fit Jeans",
            path: "/clothing/jeans",
            parent: "clothing",
            group: "featured",
          },
        ],
      },
      {
        id: "electronics",
        label: "Electronics",
        path: "/electronics",
        iconName: "Smartphone",
        group: "megamenu",
        children: [
          {
            id: "phones",
            label: "Phones",
            path: "/electronics/phones",
            parent: "electronics",
            group: "categories",
          },
          {
            id: "laptops",
            label: "Laptops",
            path: "/electronics/laptops",
            parent: "electronics",
            group: "categories",
          },
          {
            id: "audio",
            label: "Audio",
            path: "/electronics/audio",
            parent: "electronics",
            group: "categories",
          },
          {
            id: "headphones",
            label: "Wireless Earbuds",
            path: "/electronics/headphones",
            parent: "electronics",
            group: "featured",
          },
          {
            id: "watch",
            label: "Smart Watch",
            path: "/electronics/watch",
            parent: "electronics",
            group: "featured",
          },
        ],
      },
      {
        id: "home",
        label: "Home & Garden",
        path: "/home",
        iconName: "Home",
        group: "megamenu",
      },
      { id: "beauty", label: "Beauty", path: "/beauty", iconName: "Heart" },
      {
        id: "sports",
        label: "Sports",
        path: "/sports",
        iconName: "Activity",
      },
    ],
    actions: [
      {
        id: "search",
        label: "Search",
        iconName: "Search",
        tags: ["action", "global"],
      },
      {
        id: "account",
        label: "My Account",
        iconName: "User",
        tags: ["action", "global"],
      },
      {
        id: "wishlist",
        label: "Wishlist",
        iconName: "Heart",
        badges: { count: 2 },
        tags: ["action", "global"],
      },
      {
        id: "cart",
        label: "Shopping Cart",
        iconName: "ShoppingCart",
        badges: { count: 3 },
        tags: ["action", "global"],
      },
    ],
  },
};

// News navigation trees
const news = {
  simple: {
    main: [
      { id: "home", label: "Home", path: "/", iconName: "Home", end: true },
      { id: "foryou", label: "For you", path: "/foryou", iconName: "Star" },
      {
        id: "following",
        label: "Following",
        path: "/following",
        iconName: "Bell",
      },
    ],
    categories: [
      { id: "us", label: "U.S.", path: "/section/us", iconName: "Flag" },
      {
        id: "world",
        label: "World",
        path: "/section/world",
        iconName: "Globe",
      },
      {
        id: "local",
        label: "Local",
        path: "/section/local",
        iconName: "MapPin",
      },
    ],
    actions: [
      {
        id: "search",
        label: "Search",
        iconName: "Search",
        tags: ["action", "global"],
      },
      {
        id: "settings",
        label: "Settings",
        iconName: "Settings",
        tags: ["action", "global"],
      },
      {
        id: "help",
        label: "Help",
        iconName: "HelpCircle",
        tags: ["action", "global"],
      },
    ],
  },
  complex: {
    main: [
      {
        id: "home",
        label: "Home",
        path: "/",
        iconName: "Home",
        end: true,
        actions: [
          { id: "customize-home", label: "Customize", iconName: "Sliders" },
        ],
      },
      { id: "foryou", label: "For you", path: "/foryou", iconName: "Star" },
      {
        id: "following",
        label: "Following",
        path: "/following",
        iconName: "Bell",
      },
      {
        id: "showcase",
        label: "News Showcase",
        path: "/showcase",
        iconName: "Layout",
      },
      {
        id: "saved",
        label: "Saved searches",
        path: "/saved",
        iconName: "Bookmark",
      },
    ],
    categories: [
      {
        id: "us",
        label: "U.S.",
        path: "/section/us",
        iconName: "Flag",
        actions: [
          { id: "save-section", label: "Save", iconName: "Bookmark" },
          { id: "share-section", label: "Share", iconName: "Share" },
          { id: "hide-section", label: "Hide", iconName: "EyeOff" },
        ],
      },
      {
        id: "world",
        label: "World",
        path: "/section/world",
        iconName: "Globe",
      },
      {
        id: "local",
        label: "Local",
        path: "/section/local",
        iconName: "MapPin",
      },
      {
        id: "business",
        label: "Business",
        path: "/section/business",
        iconName: "Briefcase",
      },
      {
        id: "technology",
        label: "Technology",
        path: "/section/technology",
        iconName: "Cpu",
      },
      {
        id: "entertainment",
        label: "Entertainment",
        path: "/section/entertainment",
        iconName: "Film",
      },
      {
        id: "sports",
        label: "Sports",
        path: "/section/sports",
        iconName: "Activity",
      },
      {
        id: "science",
        label: "Science",
        path: "/section/science",
        iconName: "Flask",
      },
      {
        id: "health",
        label: "Health",
        path: "/section/health",
        iconName: "Health",
      },
    ],
    actions: [
      {
        id: "search",
        label: "Search",
        iconName: "Search",
        tags: ["action", "global"],
      },
      {
        id: "user-account",
        label: "Account",
        iconName: "User",
        tags: ["action", "global"],
      },
      {
        id: "language",
        label: "Language",
        iconName: "Globe",
        tags: ["action", "global"],
      },
      {
        id: "settings",
        label: "Settings",
        iconName: "Settings",
        tags: ["action", "global"],
      },
      {
        id: "help",
        label: "Help",
        iconName: "HelpCircle",
        tags: ["action", "global"],
      },
    ],
  },
};

export default {
  dashboard, docs, ecommerce, news
};