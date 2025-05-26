import { build, external, layout, route } from "@m5nv/rr-builder";
/// @ts-check

/** @typedef {import('@m5nv/rr-builder').LayoutBuilder} LayoutBuilder */

/* -----------------------------------------------------------
 * MAIN “project” SECTION   (tabs from the screenshot)
 * --------------------------------------------------------- */
/// Note: `layout`s are not routeable, so they are excluded by the
/// codegen tool in the final navigation forest of trees it consstructs;
/// as a consequence, specifying a `section` in .nav() has no impact on
/// the construction of the tree; we may want to fix this by playing with
/// typescript's discriminated-union mechanism to only allow certain
/// attributes in `nav` depending on the `this` type.

const projectRoot = layout("project/layout.tsx")
  .children(
    external("https://wildy-external.acme.dev")
      .nav({ label: "Go wild", iconName: "Wild", section: "project" }),
    route("overview", "project/overview.tsx")
      .nav({
        label: "Overview",
        iconName: "ClipboardList",
        order: 1,
        section: "project",
      }),
    route("integrations", "project/integrations.tsx")
      .nav({ label: "Integrations", iconName: "Plug", order: 2 }),
    route("deployments", "project/deployments.tsx")
      .nav({ label: "Deployments", iconName: "Truck", order: 3 }),
    route("activity", "project/activity.tsx")
      .nav({ label: "Activity", iconName: "Activity", order: 4 }),
    route("domains", "project/domains.tsx")
      .nav({ label: "Domains", iconName: "Globe", order: 5 }),
    route("usage", "project/usage.tsx")
      .nav({ label: "Usage", iconName: "BarChart2", order: 6 }),
    route("monitoring", "project/monitoring.tsx")
      .nav({
        label: "Monitoring",
        iconName: "Monitor",
        order: 7,
        /* route-specific (context) actions */
        actions: [
          {
            id: "create-query",
            label: "Create New Query",
            iconName: "PlusCircle",
          },
        ],
      }),
    route("observability", "project/observability.tsx")
      .nav({ label: "Observability", iconName: "Eye", order: 8 }),
    route("storage", "project/storage.tsx")
      .nav({ label: "Storage", iconName: "Database", order: 9 }),
    route("flags", "project/flags.tsx")
      .nav({ label: "Flags", iconName: "Flag", order: 10 }),
    route("ai", "project/ai.tsx")
      .nav({ label: "AI", iconName: "BrainCircuit", order: 11 }),
    route("support", "project/support.tsx", { id: "fubar" })
      .nav({ label: "Support", iconName: "LifeBuoy", order: 12 })
      .children(
        external("https://docs.foo.dev")
          .nav({ label: "Docs", iconName: "Book", tags: ["help"] }),
        external("https://help.foo.dev")
          .nav({ label: "Help", iconName: "Help", tags: ["help"] }),
        external("https://foo.dev/changelog")
          .nav({ label: "Changelog", iconName: "ChangeLog", tags: ["help"] }),
      ),
    route("settings", "project/settings.tsx")
      .nav({ label: "Settings", iconName: "Settings", order: 13 }),
  );

/* -----------------------------------------------------------
 * EXTERNAL links (live outside React-Router tree)
 * --------------------------------------------------------- */
const resources = route("resources", "project/resources.tsx")
  .nav({
    label: "Resources",
    iconName: "List",
    section: "project", // inherits project menu
    group: "resources",
    hidden: true,
  })
  .children(
    external("https://docs.acme.dev")
      .nav({ label: "Docs", iconName: "Book", tags: ["help"] }),
    external("https://help.acme.dev")
      .nav({ label: "Help", iconName: "Help", tags: ["help"] }),
    external("https://acme.dev/changelog")
      .nav({ label: "Changelog", iconName: "ChangeLog", tags: ["help"] }),
  );

const externals = [
  external("https://docs.acme.dev")
    .nav({ label: "Docs", iconName: "Book", tags: ["help"] }),
  external("https://help.acme.dev")
    .nav({ label: "Help", iconName: "Help", tags: ["help"] }),
  external("https://acme.dev/changelog")
    .nav({ label: "Changelog", iconName: "ChangeLog", tags: ["help"] }),
];
/* -----------------------------------------------------------
 * BUILD + NAV-EXTRAS
 * --------------------------------------------------------- */
export default build(
  [projectRoot, resources, ...externals], // ← array of Builders
  {
    globalActions: [
      {
        id: "ship-tickets",
        label: "Ship Tickets",
        iconName: "Truck",
        sections: ["project"],
      },
      { id: "feedback", label: "Feedback", iconName: "MessageSquare" },
      { id: "notifications", label: "Notifications", iconName: "Bell" },
    ],
    badgeTargets: ["ship-tickets", "notifications"],
  },
);
