
// ⚠ AUTO-GENERATED — 2025-05-11T12:53:07.343Z — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes. 

import { useMatches, type UIMatch } from 'react-router';
import type { NavMeta, NavTreeNode } from "@m5nv/rr-builder";

export const metaMap = new Map<string, NavMeta>([
  ["routes/page", {"label":"Home","iconName":"Home","end":true,"section":"main"}],
  ["routes/settings/page", {"label":"Settings","iconName":"Settings","section":"main"}],
  ["main", {"label":"Dashboard","iconName":"LayoutDashboard","section":"main"}],
  ["routes/dashboard/page", {"label":"Dashboard","iconName":"LayoutDashboard","end":true}],
  ["overview", {"label":"Overview","iconName":"BarChart","section":"main"}],
  ["routes/dashboard/overview/summary", {"label":"Overview","iconName":"CircleDot","end":true}],
  ["routes/dashboard/overview/performance", {"label":"Performance","iconName":"TrendingUp"}],
  ["routes/dashboard/overview/metrics", {"label":"Metrics","iconName":"Clock"}],
  ["analytics", {"label":"Analytics","iconName":"FileText","section":"main"}],
  ["routes/dashboard/analytics/summary", {"label":"Analytics","iconName":"BarChart","end":true}],
  ["routes/dashboard/analytics/traffic", {"label":"Traffic","iconName":"Activity"}],
  ["routes/dashboard/analytics/conversion", {"label":"Conversion","iconName":"PieChart"}],
  ["reports", {"label":"Reports","iconName":"PieChart","section":"main"}],
  ["routes/dashboard/reports/summary", {"label":"Reports","iconName":"FileText","end":true}],
  ["reports-monthly", {"label":"Monthly","iconName":"Calendar"}],
  ["reports-quarterly", {"label":"Quarterly","iconName":"CalendarDays"}],
  ["reports-annual", {"label":"Annual","iconName":"CalendarRange"}],
  ["users", {"label":"Users","iconName":"Users","section":"main"}],
  ["users-index", {"label":"All Users","iconName":"Users","end":true}],
  ["users-active", {"label":"Active Users","iconName":"UserCheck"}],
  ["users-inactive", {"label":"Inactive Users","iconName":"UserMinus"}],
  ["roles", {"label":"Roles","section":"users"}],
  ["users-roles-index", {"label":"All Roles","iconName":"Shield","end":true}],
  ["users-roles-admin", {"label":"Administrators","iconName":"ShieldAlert"}],
  ["users-roles-editor", {"label":"Editors","iconName":"Edit"}],
  ["users-roles-viewer", {"label":"Viewers","iconName":"Eye"}],
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 */
export const navigationTree: Record<string, NavTreeNode[]> = {
  "main": [
    {
      "id": "routes/page",
      "path": "/",
      "label": "Home",
      "iconName": "Home",
      "end": true
    },
    {
      "id": "routes/settings/page",
      "path": "/settings",
      "label": "Settings",
      "iconName": "Settings"
    },
    {
      "id": "routes/dashboard/page",
      "path": "/dashboard",
      "label": "Dashboard",
      "iconName": "LayoutDashboard",
      "end": true,
      "children": [
        {
          "id": "routes/dashboard/overview/summary",
          "path": "/dashboard/overview",
          "label": "Overview",
          "iconName": "CircleDot",
          "end": true,
          "children": [
            {
              "id": "routes/dashboard/overview/performance",
              "path": "/dashboard/overview/performance",
              "label": "Performance",
              "iconName": "TrendingUp"
            },
            {
              "id": "routes/dashboard/overview/metrics",
              "path": "/dashboard/overview/metrics",
              "label": "Metrics",
              "iconName": "Clock"
            }
          ]
        },
        {
          "id": "routes/dashboard/analytics/summary",
          "path": "/dashboard/analytics",
          "label": "Analytics",
          "iconName": "BarChart",
          "end": true,
          "children": [
            {
              "id": "routes/dashboard/analytics/traffic",
              "path": "/dashboard/analytics/traffic",
              "label": "Traffic",
              "iconName": "Activity"
            },
            {
              "id": "routes/dashboard/analytics/conversion",
              "path": "/dashboard/analytics/conversion",
              "label": "Conversion",
              "iconName": "PieChart"
            }
          ]
        },
        {
          "id": "routes/dashboard/reports/summary",
          "path": "/dashboard/reports",
          "label": "Reports",
          "iconName": "FileText",
          "end": true,
          "children": [
            {
              "id": "reports-monthly",
              "path": "/dashboard/reports/monthly",
              "label": "Monthly",
              "iconName": "Calendar"
            },
            {
              "id": "reports-quarterly",
              "path": "/dashboard/reports/quarterly",
              "label": "Quarterly",
              "iconName": "CalendarDays"
            },
            {
              "id": "reports-annual",
              "path": "/dashboard/reports/annual",
              "label": "Annual",
              "iconName": "CalendarRange"
            }
          ]
        }
      ]
    },
    {
      "id": "users-index",
      "path": "/users",
      "label": "All Users",
      "iconName": "Users",
      "end": true,
      "children": [
        {
          "id": "users-active",
          "path": "/users/active",
          "label": "Active Users",
          "iconName": "UserCheck"
        },
        {
          "id": "users-inactive",
          "path": "/users/inactive",
          "label": "Inactive Users",
          "iconName": "UserMinus"
        },
        {
          "id": "users-roles-index",
          "path": "/users/roles",
          "label": "All Roles",
          "iconName": "Shield",
          "end": true,
          "children": [
            {
              "id": "users-roles-admin",
              "path": "/users/roles/admin",
              "label": "Administrators",
              "iconName": "ShieldAlert"
            },
            {
              "id": "users-roles-editor",
              "path": "/users/roles/editor",
              "label": "Editors",
              "iconName": "Edit"
            },
            {
              "id": "users-roles-viewer",
              "path": "/users/roles/viewer",
              "label": "Viewers",
              "iconName": "Eye"
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Hook to hydrate matches with your navigation metadata
 */
export function useHydratedMatches(): Array<UIMatch<unknown, NavMeta>> {
  const matches = useMatches();
  return matches.map(match => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match as UIMatch<unknown, NavMeta>;
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match as UIMatch<unknown, NavMeta>;
  });
}
