// @ts-check

/* ------------------------------------------------------------------
 * @m5nv/rr-builder • Type Declarations • v2 
 * ------------------------------------------------------------------ */

import type { RouteConfigEntry } from "@react-router/dev/routes";

/* ------------------------------------------------------------------
 * 1 · Type spec for augmenting routes with actions and meta data
 * ------------------------------------------------------------------ */
/** 
 * Augmented metadata will be stashed in a handle for the codegen
 * 
 */
export type ExtendedRouteConfigEntry = RouteConfigEntry & {
  /** nav metadata is stashed in `handle` */
  handle?: NavMeta;
};

/** 
 * Used to define route level actions in meta data
 * 
 * Note: actions are (to be) wired up at runtime by the application.
 */
export interface ActionSpec {
  id: string;
  label: string;
  iconName?: string;
}

/**
 * Use to define global actions
 * 
 * Note: actions are (to be) wired up at runtime by the application.
 */
export interface GlobalActionSpec extends ActionSpec {
  sections?: string[];      // omit ⇒ visible in all sections
  externalUrl?: string;     // open link instead of dispatch
}

/* ------------------------------------------------------------------
 * 2 · Route augmenting metadata
 * ------------------------------------------------------------------ */

export interface NavMeta {
  /* presentation */
  label?: string;
  iconName?: string;

  /**
   * Build-time **partition key**.
   * Omit ⇒ `"main"` (for both internal and external).
   */
  section?: string;

  /**
   * Runtime **cluster** inside a section
   * (e.g. “Clothing” vs “Electronics” vs "Home & Garden" in a mega-menu).
   */
  group?: string;

  /** Explicit sort key inside a group (default 0) */
  order?: number;

  /** Orthogonal labels for A/B flags, footer filters, etc. */
  tags?: string[];

  /* behaviour */
  /** Exact-match highlight (default true for index routes) */
  end?: boolean;

  /** Hide from navigation UIs without deleting the route */
  hidden?: boolean;

  /** ABAC permission key(s) (evaluated by @m5nv/abac) */
  abac?: string | string[];

  /** Route-level (context) actions surfaced by Navigator */
  actions?: ActionSpec[];

  /** set automatically by external() builder (nav-only link) */
  external?: true;
}

/* ------------------------------------------------------------------
 * 3 · Navigation node (internal index and for apps at runtime)
 * ------------------------------------------------------------------ */
/**
 * INTERNAL – structural outline used in code-gen; contains only 
 * id/path/children/external flag. App code should consume hydrated NavTreeNode
 * instead.
 */
export type NavStructNode = {
  id: string;
  path: string;
  external?: true;
  children?: NavStructNode[];
};

/**
 * Type for the nodes in the final navigation tree used by UI components
 * to render menu and grand-central type nav bars.
 * 
 * Note: The 'section' property in `nav` is hoisted out and not present in the
 * final nav tree node.
 * 
 * This is hydrated at runtime.
 */
export type NavTreeNode = Omit<NavMeta, "section"> & {
  id?: string;
  path: string;
  children?: NavTreeNode[];
};

/* ------------------------------------------------------------------
 * 4 · Extras passed to build()
 * ------------------------------------------------------------------ */

export interface NavExtras {
  globalActions?: GlobalActionSpec[];
  badgeTargets?: string[];
  /** nav-only nodes (external links); used by code-gen */
  navOnly?: RouteConfigEntry[];
}

/* ------------------------------------------------------------------
 * 5 · Router-adapter type (no default impl)
 * ------------------------------------------------------------------ */

export interface RouterAdapter {
  Link: any;  // ComponentType<any> – kept as any to avoid react import
  useLocation: () => { pathname: string };
  useMatches: () => { id: string; handle?: any }[];
  matchPath: (pattern: string, pathname: string) => any | null;
}

/* ------------------------------------------------------------------
 * 6 · Navigation API (generated module default)
 * ------------------------------------------------------------------ */

export interface NavigationApi {
  /** list of section names present in the `forest of trees` */
  sections(): string[];

  /* pure selectors – NO runtime context */
  routes(section?: string): NavTreeNode[];
  routesByTags(section: string, tags: string[]): NavTreeNode[];
  routesByGroup(section: string, group: string): NavTreeNode[];

  /* convenience hook that hydrates results returned by adapter.useMatches */
  useHydratedMatches: <T = unknown>() => Array<{ handle: NavMeta }>;

  /* static extras */
  globalActions: GlobalActionSpec[];
  badgeTargets: string[];

  /* router adapter injected at factory time */
  router: RouterAdapter;
}

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
 * 8 · Fluent Builder API
 * ------------------------------------------------------------------ */

/** 
 * Fluent API wrapper over react-router helper methods
 * 
 * NOTE: we could technically remove RR dependency
 */
export interface RouteBuilder {
  children(...builders: Builder[]): RouteBuilder;
  nav(meta: NavMeta): RouteBuilder;
  readonly entry: ExtendedRouteConfigEntry;
}

export interface LayoutBuilder {
  children(...builders: Builder[]): LayoutBuilder;
  nav(meta: Omit<NavMeta, "section">): LayoutBuilder; // section not allowed
  readonly entry: ExtendedRouteConfigEntry;
}

export interface IndexBuilder {
  nav(meta: NavMeta): IndexBuilder;
  readonly entry: ExtendedRouteConfigEntry;
  // NO children()
}

export interface ExternalBuilder {
  nav(meta: NavMeta): ExternalBuilder;
  readonly entry: ExtendedRouteConfigEntry;
  // NO children()
}

// Union for anything that is a builder
export type Builder = RouteBuilder | LayoutBuilder | IndexBuilder | ExternalBuilder;

// For prefixing, exclude external
export type PrefixableBuilder = RouteBuilder | LayoutBuilder | IndexBuilder;

/* ---------- factory helpers ------------------------------------ */
/** Wraps RR's route helper */
export function route(
  path: string | null | undefined,
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").route>[2],
): RouteBuilder;

/** Wraps RR's index helper */
export function index(
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").index>[1],
): IndexBuilder;

/** Wraps RR's layout helper */
export function layout(
  file: string,
  options?: Parameters<typeof import("@react-router/dev/routes").layout>[1],
): LayoutBuilder;

/** Wraps RR's `prefix` helper; input is builders instead of routes */
export function prefix(
  prefixPath: string,
  builders: Builder[],
): PrefixableBuilder[];

/** Create navigation only external links that are not handled by RR */
export function external(
  url: string,
  opts?: { id?: string },
): ExternalBuilder;

/** build() produces routable array **and** attaches non-enumerable `.nav` payload */
export function build(
  builders: Builder[],
  extras?: NavExtras,
): RouteConfigEntry[] & { readonly nav?: NavExtras };
