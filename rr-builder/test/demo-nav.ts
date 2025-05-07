
// ⚠ AUTO-GENERATED — 2025-05-07T01:11:13.421Z — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes. 

import { useMatches, type UIMatch } from 'react-router';
import type { NavMeta, NavTreeNode } from "@m5nv/rr-builder";

export const metaMap = new Map<string, NavMeta>([
  ["./routes/page", {"label":"Home","section":"main","end":true}],
  ["./routes/settings/page", {"label":"Settings","iconName":"Settings","section":"main"}],
  ["./routes/dashboard/layout", {"label":"Dashboard"}],
  ["./routes/dashboard/overview/summary", {"label":"Overview","iconName":"CircleDot","group":"Overview","section":"dashboard"}],
  ["./routes/dashboard/reports/annual", {"label":"Annual","iconName":"CalendarRange","group":"Reports"}],
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 */
export const navigationTree: Record<string, NavTreeNode[]> = {
  "main": [
    {
      "id": "./routes/page",
      "path": "/",
      "label": "Home",
      "end": true
    },
    {
      "id": "./routes/settings/page",
      "path": "settings",
      "label": "Settings",
      "iconName": "Settings"
    }
  ],
  "dashboard": [
    {
      "id": "./routes/dashboard/overview/summary",
      "path": "dashboard/overview",
      "label": "Overview",
      "iconName": "CircleDot",
      "group": "Overview",
      "children": [
        {
          "id": "./routes/dashboard/reports/annual",
          "path": "dashboard/reports/annual",
          "label": "Annual",
          "iconName": "CalendarRange",
          "group": "Reports"
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
