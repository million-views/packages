/// file: news-routes-simple.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// News routes - simple version with main and categories sections
const appShell = layout("routes/news/layout.tsx")
  .children(
    // Main section routes
    index("routes/news/home.tsx")
      .meta({
        label: "Home",
        iconName: "Home",
        section: "main",
        end: true, // Only highlight when exactly on this route
      }),
    route("foryou", "routes/news/for-you.tsx")
      .meta({
        label: "For you",
        iconName: "Star",
        section: "main",
      }),
    route("following", "routes/news/following.tsx")
      .meta({
        label: "Following",
        iconName: "Bell",
        section: "main",
      }),
    // Category section routes - using section: "categories"
    prefix("section", [
      route("us", "routes/news/sections/us.tsx")
        .meta({
          label: "U.S.",
          iconName: "Flag",
          section: "categories", // Different section for categories
        }),
      route("world", "routes/news/sections/world.tsx")
        .meta({
          label: "World",
          iconName: "Globe",
          section: "categories",
        }),
      route("local", "routes/news/sections/local.tsx")
        .meta({
          label: "Local",
          iconName: "MapPin",
          section: "categories",
        }),
    ]),
  );

// Global actions for header
const globalActions = [
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
];

export default build([appShell], { actions: globalActions });

/*
Notes:
1. Using two different sections: "main" and "categories"
2. Using 'end: true' for the home route to only highlight when exactly on that path
3. Using prefix() for section routes to add the common "/section/" prefix
4. Global actions passed to build() as a second parameter
5. No route-specific context actions in this simple version
*/
