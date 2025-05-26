/// file: ecommerce-routes-simple.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// Ecommerce routes - simple version
const appShell = layout("routes/store/layout.tsx")
  .children(
    route("clothing", "routes/store/clothing.tsx")
      .meta({
        label: "Clothing",
        iconName: "ShoppingBag",
        section: "store",
        group: "megamenu", // Using 'group' to identify items that should appear in megamenu
      }),
    route("electronics", "routes/store/electronics.tsx")
      .meta({
        label: "Electronics",
        iconName: "Smartphone",
        section: "store",
        group: "megamenu",
      }),
    route("home", "routes/store/home.tsx")
      .meta({
        label: "Home & Garden",
        iconName: "Home",
        section: "store",
        group: "megamenu",
      }),
  );

// Global actions for header/user menu
const globalActions = [
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
    tags: ["action", "global"],
  },
];

// Badge information (for cart count, etc.)
const badges = [
  {
    id: "cart", // Same ID as the action it applies to
    count: 3,
  },
];

export default build([appShell], { actions: globalActions, badges });

/*
Notes:
1. Using 'group' property to identify megamenu items
2. No nested items in this simple version
3. Global actions passed to build() as a second parameter
4. Badges for the cart also passed to build()
*/
