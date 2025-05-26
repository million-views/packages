/// file: docs-routes-simple.js

import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

// Documentation routes - simple version
const appShell = layout("routes/docs/layout.tsx")
  .children(
    route("introduction", "routes/docs/introduction.tsx")
      .meta({
        label: "Introduction",
        iconName: "Book",
        section: "main",
      }),
    route("getting-started", "routes/docs/getting-started.tsx")
      .meta({
        label: "Getting Started",
        iconName: "Play",
        section: "main",
      }),
    route("components", "routes/docs/components.tsx")
      .meta({
        label: "Components",
        iconName: "Layers",
        section: "main",
      }),
  );

// Global actions that will be passed to build()
const globalActions = [
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
];

export default build([appShell], { actions: globalActions });

/*
Notes:
1. This simple docs structure has just three top-level routes
2. Global actions are passed to build() as a second parameter
3. No route-specific context actions in this simple version
*/
