/// file: ecommerce-routes-complex.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// Ecommerce routes - complex version with categories and featured items
// For megamenu, we'll use conventions:
// 1. Parent routes with group="megamenu" will be top-level megamenu categories
// 2. Child routes with parent="categoryId" will associate with that category
// 3. Child routes with group="categories" will appear in the categories section
// 4. Child routes with group="featured" will appear in the featured section

const clothingRoutes = route("clothing", "routes/store/clothing/layout.tsx")
  .meta({
    label: "Clothing",
    iconName: "ShoppingBag",
    section: "store",
    group: "megamenu",
    actions: [
      { id: "view-new-arrivals", label: "New Arrivals", iconName: "Sparkles" },
      { id: "view-sale-items", label: "Sale Items", iconName: "Tag" },
    ],
  })
  .children(
    route("mens", "routes/store/clothing/mens.tsx")
      .meta({
        label: "Men's",
        parent: "clothing", // Associate with parent category
        group: "categories",
      }),
    route("womens", "routes/store/clothing/womens.tsx")
      .meta({
        label: "Women's",
        parent: "clothing",
        group: "categories",
      }),
    route("kids", "routes/store/clothing/kids.tsx")
      .meta({
        label: "Kids",
        parent: "clothing",
        group: "categories",
      }),
    route("tshirt", "routes/store/clothing/product.tsx", {
      id: "tshirt-product",
    })
      .meta({
        label: "Summer T-Shirt",
        parent: "clothing",
        group: "featured",
      }),
    route("jeans", "routes/store/clothing/product.tsx", { id: "jeans-product" })
      .meta({
        label: "Slim Fit Jeans",
        parent: "clothing",
        group: "featured",
      }),
  );

const electronicsRoutes = route(
  "electronics",
  "routes/store/electronics/layout.tsx",
)
  .meta({
    label: "Electronics",
    iconName: "Smartphone",
    section: "store",
    group: "megamenu",
  })
  .children(
    route("phones", "routes/store/electronics/phones.tsx")
      .meta({
        label: "Phones",
        parent: "electronics",
        group: "categories",
      }),
    route("laptops", "routes/store/electronics/laptops.tsx")
      .meta({
        label: "Laptops",
        parent: "electronics",
        group: "categories",
      }),
    route("audio", "routes/store/electronics/audio.tsx")
      .meta({
        label: "Audio",
        parent: "electronics",
        group: "categories",
      }),
    route("headphones", "routes/store/electronics/product.tsx", {
      id: "headphones-product",
    })
      .meta({
        label: "Wireless Earbuds",
        parent: "electronics",
        group: "featured",
      }),
    route("watch", "routes/store/electronics/product.tsx", {
      id: "watch-product",
    })
      .meta({
        label: "Smart Watch",
        parent: "electronics",
        group: "featured",
      }),
  );

const appShell = layout("routes/store/layout.tsx")
  .children(
    clothingRoutes,
    electronicsRoutes,
    route("home", "routes/store/home.tsx")
      .meta({
        label: "Home & Garden",
        iconName: "Home",
        section: "store",
        group: "megamenu",
      }),
    route("beauty", "routes/store/beauty.tsx")
      .meta({
        label: "Beauty",
        iconName: "Heart",
        section: "store",
      }),
    route("sports", "routes/store/sports.tsx")
      .meta({
        label: "Sports",
        iconName: "Activity",
        section: "store",
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

// Badge information (dynamic content)
const badges = [
  {
    id: "wishlist",
    count: 2,
  },
  {
    id: "cart",
    count: 3,
  },
];

export default build([appShell], { actions: globalActions, badges });

/*
Notes:
1. Using conventions to structure the megamenu:
   - 'group="megamenu"' identifies top-level megamenu categories
   - 'parent="categoryId"' associates items with their parent category
   - 'group="categories"' for items that should appear in the categories section
   - 'group="featured"' for featured products
2. Context actions defined on the clothing route
3. Global actions passed to build() as a second parameter
4. Badges for wishlist and cart counts
5. This approach uses existing meta properties instead of introducing new ones
*/
