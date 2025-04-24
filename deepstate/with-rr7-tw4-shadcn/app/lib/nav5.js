// ⚠ AUTO-GENERATED — 2025-04-24T11:53:05.335Z — do not edit
// @ts-check
import { useMatches } from 'react-router';
/** @typedef {import("react-router").UIMatch} UIMatch */
/** @typedef {import('@m5nv/rr-builder').NavMeta} NavMeta */
/** @typedef {import('./nav5.js').NavTreeNode} NavTreeNode */ // Reference the type definition below

/** @type {Map<string, NavMeta>} */
export const metaMap = new Map([
  ["routes/page", {"label":"Home","iconName":"Home","end":true,"section":"main"}],
  ["routes/settings/page", {"label":"Settings","iconName":"Settings","section":"main"}],
  ["routes/dashboard/page", {"label":"Dashboard","iconName":"LayoutDashboard","end":true}],
  ["overview", {"label":"Overview|Layout","iconName":"BarChart","group":"dashboard"}],
  ["routes/dashboard/overview/summary", {"label":"Overview","iconName":"CircleDot","end":true}],
  ["routes/dashboard/overview/performance", {"label":"Performance","iconName":"TrendingUp"}],
  ["routes/dashboard/overview/metrics", {"label":"Metrics","iconName":"Clock"}],
  ["routes/dashboard/analytics/summary", {"label":"Analytics","iconName":"BarChart","end":true}],
  ["routes/dashboard/analytics/traffic", {"label":"Traffic","iconName":"Activity"}],
  ["routes/dashboard/analytics/conversion", {"label":"Conversion","iconName":"PieChart"}],
  ["routes/dashboard/reports/summary", {"label":"Reports","iconName":"FileText","end":true}],
  ["reports-monthly", {"label":"Monthly","iconName":"Calendar"}],
  ["reports-quarterly", {"label":"Quarterly","iconName":"CalendarDays"}],
  ["reports-annual", {"label":"Annual","iconName":"CalendarRange"}],
  ["users-index", {"label":"All Users","iconName":"Users","end":true}],
  ["users-active", {"label":"Active Users","iconName":"UserCheck"}],
  ["users-inactive", {"label":"Inactive Users","iconName":"UserMinus"}],
  ["users-roles-index", {"label":"All Roles","iconName":"Shield","end":true}],
  ["users-roles-admin", {"label":"Administrators","iconName":"ShieldAlert"}],
  ["users-roles-editor", {"label":"Editors","iconName":"Edit"}],
  ["users-roles-viewer", {"label":"Viewers","iconName":"Eye"}],
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 * @type {Record<string, NavTreeNode[]>}
 */
export const navigationTree = {
  "main": [
    {
      "id": "routes/page",
      "label": "Home",
      "iconName": "Home",
      "end": true,
      "path": "/"
    },
    {
      "id": "routes/settings/page",
      "label": "Settings",
      "iconName": "Settings",
      "path": "/settings"
    },
    {
      "id": "routes/dashboard/page",
      "label": "Dashboard",
      "iconName": "LayoutDashboard",
      "end": true,
      "path": "/dashboard"
    },
    {
      "id": "overview",
      "label": "Overview|Layout",
      "iconName": "BarChart",
      "group": "dashboard",
      "path": "/",
      "children": [
        {
          "id": "routes/dashboard/overview/summary",
          "label": "Overview",
          "iconName": "CircleDot",
          "end": true,
          "path": "/dashboard/overview"
        },
        {
          "id": "routes/dashboard/overview/performance",
          "label": "Performance",
          "iconName": "TrendingUp",
          "path": "/dashboard/overview/performance"
        },
        {
          "id": "routes/dashboard/overview/metrics",
          "label": "Metrics",
          "iconName": "Clock",
          "path": "/dashboard/overview/metrics"
        }
      ]
    },
    {
      "id": "analytics",
      "label": "Analytics",
      "path": "/",
      "children": [
        {
          "id": "routes/dashboard/analytics/summary",
          "label": "Analytics",
          "iconName": "BarChart",
          "end": true,
          "path": "/dashboard/analytics"
        },
        {
          "id": "routes/dashboard/analytics/traffic",
          "label": "Traffic",
          "iconName": "Activity",
          "path": "/dashboard/analytics/traffic"
        },
        {
          "id": "routes/dashboard/analytics/conversion",
          "label": "Conversion",
          "iconName": "PieChart",
          "path": "/dashboard/analytics/conversion"
        }
      ]
    },
    {
      "id": "reports",
      "label": "Reports",
      "path": "/",
      "children": [
        {
          "id": "routes/dashboard/reports/summary",
          "label": "Reports",
          "iconName": "FileText",
          "end": true,
          "path": "/dashboard/reports"
        },
        {
          "id": "reports-monthly",
          "label": "Monthly",
          "iconName": "Calendar",
          "path": "/dashboard/reports/monthly"
        },
        {
          "id": "reports-quarterly",
          "label": "Quarterly",
          "iconName": "CalendarDays",
          "path": "/dashboard/reports/quarterly"
        },
        {
          "id": "reports-annual",
          "label": "Annual",
          "iconName": "CalendarRange",
          "path": "/dashboard/reports/annual"
        }
      ]
    },
    {
      "id": "users",
      "label": "Users",
      "path": "/",
      "children": [
        {
          "id": "users-index",
          "label": "All Users",
          "iconName": "Users",
          "end": true,
          "path": "/users"
        },
        {
          "id": "users-active",
          "label": "Active Users",
          "iconName": "UserCheck",
          "path": "/users/active"
        },
        {
          "id": "users-inactive",
          "label": "Inactive Users",
          "iconName": "UserMinus",
          "path": "/users/inactive"
        },
        {
          "id": "roles",
          "label": "Roles",
          "path": "/",
          "children": [
            {
              "id": "users-roles-index",
              "label": "All Roles",
              "iconName": "Shield",
              "end": true,
              "path": "/users/roles"
            },
            {
              "id": "users-roles-admin",
              "label": "Administrators",
              "iconName": "ShieldAlert",
              "path": "/users/roles/admin"
            },
            {
              "id": "users-roles-editor",
              "label": "Editors",
              "iconName": "Edit",
              "path": "/users/roles/editor"
            },
            {
              "id": "users-roles-viewer",
              "label": "Viewers",
              "iconName": "Eye",
              "path": "/users/roles/viewer"
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Hook to hydrate matches with your navigation metadata
 * @returns {Array<UIMatch & { handle?: NavMeta }>} // Refined return type for better type inference
 */
export function useHydratedMatches() {
  const matches = useMatches();
  return matches.map(match => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match;
  });
}

// Type definitions for reference (optional, good for JS users with JSDoc)
/**
 * @typedef {Object} NavTreeNode
 * @property {string} id - The route ID, consistent with metaMap keys
 * @property {string | undefined} [label] - Nav label from handle
 * @property {string | undefined} [iconName] - Icon name from handle
 * @property {boolean | undefined} [end] - End flag from handle
 * @property {string | undefined] [group] - Group name from handle
 * // section?: string; // Section is hoisted to the top-level keys
 * @property {string} path - The full path of the route
 * @property {NavTreeNode[]} [children] - Child nodes
 */
