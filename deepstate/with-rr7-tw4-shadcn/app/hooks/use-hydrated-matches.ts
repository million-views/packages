/// Custom hook (experimental) to hydrate routes at runtime with
/// meta (.handle) information

import { useMatches, type UIMatch } from "react-router";
import type { RouteConfigEntry } from "@react-router/dev/routes";
import type { NavMeta } from "@m5nv/rr-builder";
import routes from "@/routes";

// Credit:
// [How to pass props to Layout component...?](https://stackoverflow.com/a/79537911/20360913)

/// Define what a match with NavMeta in the handle looks like
interface RouteMatch extends UIMatch {
  handle: NavMeta;
}
type ExtendedRouteConfigEntry = RouteConfigEntry & { handle?: NavMeta };

/**
 * Generate a map of route ID → NavMeta for all routes in the tree
 * @param {ExtendedRouteConfigEntry[]} routes
 * @returns {Map<string, NavMeta>}
 */
export function createMetaMap(routes: ExtendedRouteConfigEntry[]): Map<string, NavMeta> {
  const map = new Map<string, NavMeta>();
  for (const r of routes) {
    const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");
    if (r.handle) {
      map.set(id, r.handle);
    }
    if (Array.isArray(r.children)) {
      const childMap = createMetaMap(r.children);
      for (const [k, v] of childMap) map.set(k, v);
    }
  }
  return map;
}

// Initialize metaMap once per module load
const metaMap = createMetaMap(routes as RouteConfigEntry[]);

/**
 * Hook that returns matches with any missing handle fields hydrated from metaMap
 */
export function useHydratedMatches() {
  const matches = useMatches();
  return matches.map(match => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    return meta ? { ...match, handle: meta } : match;
  });
}
