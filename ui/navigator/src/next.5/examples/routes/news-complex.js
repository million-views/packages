/// file: news-routes-complex.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// News routes - complex version with main and categories sections, plus context actions
const appShell = layout("routes/news/layout.tsx")
  .children(
    // Main section routes
    index("routes/news/home.tsx")
      .meta({
        label: "Home",
        iconName: "Home",
        section: "main",
        end: true, // Only highlight when exactly on this route
        actions: [
          { id: "customize-home", label: "Customize", iconName: "Sliders" },
        ],
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
    route("showcase", "routes/news/showcase.tsx")
      .meta({
        label: "News Showcase",
        iconName: "Layout",
        section: "main",
      }),
    route("saved", "routes/news/saved.tsx")
      .meta({
        label: "Saved searches",
        iconName: "Bookmark",
        section: "main",
      }),
    // Category section routes - using section: "categories"
    prefix("section", [
      route("us", "routes/news/sections/us.tsx")
        .meta({
          label: "U.S.",
          iconName: "Flag",
          section: "categories",
          actions: [
            { id: "save-section", label: "Save", iconName: "Bookmark" },
            { id: "share-section", label: "Share", iconName: "Share" },
            { id: "hide-section", label: "Hide", iconName: "EyeOff" },
          ],
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
      route("business", "routes/news/sections/business.tsx")
        .meta({
          label: "Business",
          iconName: "Briefcase",
          section: "categories",
        }),
      route("technology", "routes/news/sections/technology.tsx")
        .meta({
          label: "Technology",
          iconName: "Cpu",
          section: "categories",
        }),
      route("entertainment", "routes/news/sections/entertainment.tsx")
        .meta({
          label: "Entertainment",
          iconName: "Film",
          section: "categories",
        }),
      route("sports", "routes/news/sections/sports.tsx")
        .meta({
          label: "Sports",
          iconName: "Activity",
          section: "categories",
        }),
      route("science", "routes/news/sections/science.tsx")
        .meta({
          label: "Science",
          iconName: "Flask",
          section: "categories",
        }),
      route("health", "routes/news/sections/health.tsx")
        .meta({
          label: "Health",
          iconName: "Health",
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
];

export default build([appShell], { actions: globalActions });

/*
Notes:
1. Using two different sections: "main" and "categories"
2. Context actions defined on specific routes (home, us section)
3. More extensive list of category routes
4. Global actions passed to build() as a second parameter
*/
