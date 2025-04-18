import {
  route as rrRoute,
  index as rrIndex,
  layout as rrLayout,
  prefix as rrPrefix,
  type RouteConfigEntry,
} from "@react-router/dev/routes";

// --- Type augmentation to allow `handle` on config entries
export type NavMeta = {
  label?: string;
  iconName?: string;
  end?: boolean;
  section?: string;
};

// the minimal pieces of RouteConfigEntry you want to let callers pass
type RouteOpts = Pick<RouteConfigEntry, "id" | "index" | "caseSensitive"> & NavMeta;
type IndexOpts = Pick<RouteConfigEntry, "id"> & NavMeta;

declare module "@react-router/dev/routes" {
  interface RouteConfigEntry {
    handle?: NavMeta;
  }
}

// --- Extended route type with nested children
export type NavRoute = RouteConfigEntry & {
  handle?: NavMeta;
  children?: NavRoute[];
};

// --- Wrapper for `route`, attaches NavMeta to `handle`
export function route(
  path: string | null | undefined,
  file: string,
  opts?: RouteOpts,
  children?: NavRoute[]
): NavRoute {
  const base = rrRoute(path, file, children);
  return { ...base, handle: { ...opts } };
}

// --- Wrapper for `index`, attaches NavMeta to `handle`
export function index(
  file: string,
  opts?: IndexOpts
): NavRoute {
  const base = rrIndex(file, opts && { id: opts.id });
  return { ...base, handle: { ...opts } };
}

// --- Re-export original `layout` and `prefix`
export const layout = rrLayout;
export const prefix = rrPrefix;

// --- Helper: get routes at a given depth, filtering by section
export function getRoutesByLevel(
  routes: NavRoute[],
  level: number,
  sectionFilter?: string
): NavRoute[] {
  function collect(rs: NavRoute[], cur: number): NavRoute[] {
    if (cur === level) {
      return sectionFilter
        ? rs.filter(r => r.handle?.section === sectionFilter)
        : rs;
    }
    return rs.flatMap(r => (r.children ? collect(r.children, cur + 1) : []));
  }
  return collect(routes, 1);
}

// --- Helper: get immediate children of a parent route by path, filtering by section
export function getChildRoutes(
  routes: NavRoute[],
  parentPath: string,
  sectionFilter?: string
): NavRoute[] {
  const findParent = (lst: NavRoute[]): NavRoute | undefined => {
    for (const r of lst) {
      if (r.path === parentPath) return r;
      if (r.children) {
        const hit = findParent(r.children);
        if (hit) return hit;
      }
    }
  };
  const kids = findParent(routes)?.children ?? [];
  return sectionFilter
    ? kids.filter(r => r.handle?.section === sectionFilter)
    : kids;
}
