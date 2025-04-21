// @ts-check

import type {
  RouteConfigEntry,
} from "@react-router/dev/routes";

/** Meta information for use by menu and navigational UI components */
export interface NavMeta {
  /** Display text for the navigation item */
  label?: string;
  /** Icon key for the navigation item */
  iconName?: string;
  /** If true, active matching requires an exact path match */
  end?: boolean;
  /** UI container or region for this item (e.g. 'main', 'footer', 'sidebar'). */
  group?: string;
  /**  Logical feature area or domain (e.g. 'dashboard', 'users') */
  section?: string;
}

/** Fluent API wrapper over react-router helper methods */
export interface Builder {
  /** Attach nested routes */
  children(...builders: Builder[]): Builder;
  /** Stash navigation metadata on `.handle` */
  meta(meta: NavMeta): Builder;
  /** The raw RouteConfigEntry under the hood */
  readonly entry: RouteConfigEntry;
}

/** Mirror React Router’s route helper, with optional passthrough options */
export function route(
  path: string | null | undefined,
  file: string,
  options?: Parameters<
    typeof import("@react-router/dev/routes").route
  >[2],
): Builder;

/** Mirror React Router’s index helper */
export function index(
  file: string,
  options?: Parameters<
    typeof import("@react-router/dev/routes").index
  >[1],
): Builder;

/** Mirror React Router’s layout helper */
export function layout(
  file: string,
  options?: Parameters<
    typeof import("@react-router/dev/routes").layout
  >[1],
): Builder;

/** Prepend a path to multiple builders */
export function prefix(
  prefixPath: string,
  builders: Builder[],
): Builder[];

/** Produce the final RouteConfigEntry[] for React Router */
export function build(
  builders: Builder[],
): RouteConfigEntry[];
