import { build, index, layout, prefix, route } from "@m5nv/rr-builder";

export default build([
  layout("./routes/layout.tsx").children(
    index("./routes/page.tsx")
      .meta({ label: "Home", section: "main", end: true }),
    route("settings", "./routes/settings/page.tsx")
      .meta({ label: "Settings", iconName: "Settings", section: "main" }),
    layout("./routes/dashboard/layout.tsx")
      .meta({ label: "Dashboard" })
      .children(
        ...prefix("dashboard/overview", [
          index("./routes/dashboard/overview/summary.tsx")
            .meta({
              label: "Overview",
              iconName: "CircleDot",
              group: "Overview",
              section: "dashboard",
            }),
        ]),
        ...prefix("dashboard/reports", [
          route("annual", "./routes/dashboard/reports/annual.tsx")
            .meta({
              label: "Annual",
              iconName: "CalendarRange",
              group: "Reports",
            }),
        ]),
      ),
    // …add more children here as needed…
  ),
]);
