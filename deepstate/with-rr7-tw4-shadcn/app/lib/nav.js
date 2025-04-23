// ⚠ AUTO-GENERATED — 2025-04-23T11:49:57.566Z — do not edit
import { useMatches } from "react-router";
/** @typedef {import("react-router").UIMatch} UIMatch */
/** @typedef {import("@m5nv/rr-builder").NavMeta} NavMeta */

export const metaMap = new Map([
 ["routes/page", {"label":"Home","iconName":"Home","end":true,"section":"main"}],
 ["routes/settings/page", {"label":"Settings","iconName":"Settings","section":"main"}],
 ["routes/dashboard/page", {"label":"Dashboard","iconName":"LayoutDashboard","end":true}],
 ["overview", {"label":"Overview|Layout","iconName":"BarChart","section":"main"}],
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
 * Hook to hydrate matches with your navigation metadata
 * @returns {UIMatch[]}
 */
export function useHydratedMatches() {
  const matches = useMatches();
  return matches.map(match => {
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    return meta ? { ...match, handle: meta } : match;
  });
}
