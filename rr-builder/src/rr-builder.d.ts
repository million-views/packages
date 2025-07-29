// @ts-check

/* ------------------------------------------------------------------
 * @m5nv/rr-builder • Type Declarations • v2.1
 * ------------------------------------------------------------------ */

import type { RouteConfigEntry } from "@react-router/dev/routes";

/* ------------------------------------------------------------------
 * 1 · Base types for route configuration
 * ------------------------------------------------------------------ */

/** 
 * Route configuration entry extended with navigation metadata
 */
export type ExtendedRouteConfigEntry = RouteConfigEntry & {
  /** Navigation metadata stored in handle */
  handle?: NavMeta;
  /** Internal: section name for routes within a section */
  _section?: string;
  /** Internal: parent id for re-anchoring nav-only nodes */
  _anchor?: string;
};

/** 
 * Action specification for route-level or global actions
 */
export type ActionSpec = {
  id: string;
  label: string;
  iconName?: string;
};

/**
 * Global action specification with optional section scoping
 */
export type GlobalActionSpec = ActionSpec & {
  /** Sections where this action should appear (omit for all sections) */
  sections?: string[];
  /** External URL to open instead of dispatching action */
  externalUrl?: string;
};

/* ------------------------------------------------------------------
 * 2 · Navigation metadata types
 * ------------------------------------------------------------------ */

/**
 * Complete navigation metadata for routes, indexes, and external links
 */
export type NavMeta = {
  /** Human-readable display name */
  label?: string;
  /** Icon identifier (typically from an icon library) */
  iconName?: string;
  /** Grouping identifier for organizing related routes */
  group?: string;
  /** Sort order within a group (lower numbers first) */
  order?: number;
  /** Tags for filtering, search, or feature flags */
  tags?: string[];
  /** Hide from navigation UI while keeping route active */
  hidden?: boolean;
  /** Require exact path match for active highlighting */
  end?: boolean;
  /** Access control attributes for authorization */
  abac?: string | string[];
  /** Route-specific actions available in this context */
  actions?: ActionSpec[];
  /** Automatically set for external links (cannot be set manually) */
  external?: true;
};

/* ------------------------------------------------------------------
 * 3 · Navigation tree node types
 * ------------------------------------------------------------------ */

/**
 * Structural navigation node used internally by code generation
 */
export type NavStructNode = {
  id: string;
  path: string;
  external?: true;
  children?: NavStructNode[];
};

/**
 * Fully hydrated navigation tree node for runtime use
 */
export type NavTreeNode = NavMeta & {
  id?: string;
  path: string;
  children?: NavTreeNode[];
};


/* ------------------------------------------------------------------
 * 4 · Build configuration types
 * ------------------------------------------------------------------ */

/**
 * Extra configuration passed to build()
 */
export type NavExtras = {
  /** Global actions available across sections */
  globalActions?: GlobalActionSpec[];
  /** Route or action IDs that can display badges */
  badgeTargets?: string[];
  /** Internal: navigation-only nodes (external links) */
  navOnly?: ExtendedRouteConfigEntry[];
};

/* ------------------------------------------------------------------
 * 5 · Router adapter type
 * ------------------------------------------------------------------ */

/**
 * Router adapter for framework integration
 */
export type RouterAdapter = {
  Link: any;  // Component for navigation links
  useLocation: () => { pathname: string };
  useMatches: () => { id: string; handle?: any }[];
  matchPath: (pattern: string, pathname: string) => any | null;
};

/* ------------------------------------------------------------------
 * 6 · Navigation API types
 * ------------------------------------------------------------------ */

/**
 * Generated navigation API for runtime use
 */
export type NavigationApi = {
  /** Get all available section names */
  sections(): string[];
  /** Get routes for a section (defaults to "main") */
  routes(section?: string): NavTreeNode[];
  /** Filter routes by tags within a section */
  routesByTags(section: string, tags: string[]): NavTreeNode[];
  /** Filter routes by group within a section */
  routesByGroup(section: string, group: string): NavTreeNode[];
  /** Hook to hydrate router matches with navigation metadata */
  useHydratedMatches: <T = unknown>() => Array<{ handle: NavMeta }>;
  /** Global actions defined in build() */
  globalActions: GlobalActionSpec[];
  /** Badge target IDs defined in build() */
  badgeTargets: string[];
  /** Router adapter instance (set by `registerRouter()`) */
  router: RouterAdapter;
};

/* ------------------------------------------------------------------
 * 7 · One-time adapter registration (singleton)
 * ------------------------------------------------------------------ */

/**
 * Call exactly once (e.g. in AppShell) to plug your router implementation
 * into the navigation API.  
 * 
 * Typical use in a React-Router apps could be:
 * ```ts
 * /// file: root.tsx
 * import { Link, matchPath, useLocation, useMatches } from "react-router";
 * import navigationApi, { registerRouter } from "@/navigation.generated";
 *
 * /// one-time registration
 * registerRouter({ Link, useLocation, useMatches, matchPath });
 * ```
 */
export function registerRouter(adapter: RouterAdapter): void;

/* ------------------------------------------------------------------
 * 8 · Builder types
 * ------------------------------------------------------------------ */

/**
 * Base builder type with common properties
 */
type BaseBuilder = {
  readonly entry: ExtendedRouteConfigEntry;
  readonly _type: string;
};

/**
 * Route builder with navigation and children support
 */
export type RouteBuilder = BaseBuilder & {
  readonly _type: 'builder';
  nav(meta: Omit<NavMeta, 'external'>): RouteBuilder;
  children(...builders: NonSectionBuilder[]): RouteBuilder;
};

/**
 * Layout builder with navigation and children support
 */
export type LayoutBuilder = BaseBuilder & {
  readonly _type: 'builder';
  nav(meta: Omit<NavMeta, 'external'>): LayoutBuilder;
  children(...builders: NonSectionBuilder[]): LayoutBuilder;
};

/**
 * Index builder with navigation support only
 */
export type IndexBuilder = BaseBuilder & {
  readonly _type: 'builder';
  nav(meta: Omit<NavMeta, 'external'>): IndexBuilder;
  // NO children() method
};

/**
 * External link builder with navigation support only
 */
export type ExternalBuilder = BaseBuilder & {
  readonly _type: 'builder';
  nav(meta: Omit<NavMeta, 'external'>): ExternalBuilder;
  // NO children() method
};

/**
 * Section builder for top-level organization of application's route 
 * configuration into a `forest of trees`.
 */
export type SectionBuilder = BaseBuilder & {
  readonly _type: 'section';
  readonly name: string;
  nav(meta: Omit<NavMeta, 'external'>): SectionBuilder;
  children(...builders: NonSectionBuilder[]): SectionBuilder;
};

/**
 * Union of all non-section builders
 */
export type NonSectionBuilder = RouteBuilder | LayoutBuilder | IndexBuilder | ExternalBuilder;

/**
 * Union of builders that can be prefixed
 */
export type PrefixableBuilder = RouteBuilder | LayoutBuilder | IndexBuilder;

/**
 * Union of all possible builders
 */
export type Builder = NonSectionBuilder | SectionBuilder;

/* ------------------------------------------------------------------
 * 9 · RR utility function wrappers + section and external for DX 
 * ------------------------------------------------------------------ */

/** Create a route builder */
export function route(
  path: string,
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").route>[2],
): RouteBuilder;

/** Create an index route builder */
export function index(
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").index>[1],
): IndexBuilder;

/** Create a layout builder */
export function layout(
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").layout>[1],
): LayoutBuilder;

/** Create prefixed route builders */
export function prefix(
  prefixPath: string,
  builders: PrefixableBuilder[],
): PrefixableBuilder[];

/** Create an external link builder */
export function external(
  url: string,
  opts?: { id?: string },
): ExternalBuilder;

/** Create a section builder */
export function section(name: string): SectionBuilder;

/** Create shared layout with multiple sections */
export function sharedLayout(
  layoutFile: string,
  sections: Record<string, NonSectionBuilder[]>
): SectionBuilder[];

/** Build the final route configuration */
export function build(
  builders: Builder[],
  extras?: NavExtras,
): RouteConfigEntry[] & { readonly nav?: NavExtras };
