// @ts-check

import type {
  RouteConfigEntry,
} from "@react-router/dev/routes";

/** Meta information for use by layout and navigational UI components */
export interface NavMeta {
  /** Display text for the navigation item */
  label?: string;

  /** Icon key for the navigation item */
  iconName?: string;

  /** If true, active matching requires an exact path match */
  end?: boolean;

  /**
   * Primary partition key for your navigation tree.
   *
   * At build time we **partition** the full route forest into
   * disjoint sub-trees—one per `section`. Each node lives in exactly
   * one section bucket (inherit from parent, root defaults to "main").
   */
  section?: string;

  /**
   * Secondary classifier **within** a section.
   * This string is carried through into each generated NavTreeNode,
   * so at _runtime_ you can cluster or tabulate items by `group`
   * (e.g. “Analytics” vs “Reports” panels inside the dashboard menu).
   */
  group?: string;
}

/**
 * Represents an extended route configuration entry, combining RouteConfigEntry 
 * with navigation/layout metadata.
 */
export type ExtendedRouteConfigEntry = RouteConfigEntry & {
  handle?: NavMeta;
};

/**
 * Type for the nodes in the final navigation tree used by UI components
 * to render menu and grand-central type nav bars.
 * 
 * Note: The 'section' property in `meta` is hoisted and not present in the
 * final nav tree node.
 */
export type NavTreeNode = {
  /**
   * The route ID, consistent with metaMap keys
   */
  id?: string;
  /**
   * Nav label from handle
   */
  label?: string;
  /**
   * Icon name from handle
   */
  iconName?: string;
  /**
   * End flag from handle
   */
  end?: boolean;
  /**
   * Group name from handle
   */
  group?: string;
  /**
   * The full path of the route
   */
  path: string;
  /**
   * Child nodes
   */
  children?: NavTreeNode[];
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
