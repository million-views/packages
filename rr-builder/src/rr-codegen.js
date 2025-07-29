/// @ts-check
/// <reference types="./tree-utils" />
/// <reference types="./rr-builder" />
import fs from "node:fs";
import path from "node:path";
import { flatMap, walk } from "@m5nv/rr-builder/tree-utils";

/**
 * @typedef {import('./rr-builder').NavMeta} NavMeta
 * @typedef {import('./rr-builder').NavStructNode} NavStructNode
 * @typedef {import("@m5nv/rr-builder").ExtendedRouteConfigEntry} ExtendedRouteConfigEntry
 */

function toPascalCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // Remove hyphens/underscores and capitalize next char
    .replace(/^(.)/, (_, c) => c.toUpperCase()); // Capitalize the first character
}

export function makeId(filepath) {
  return filepath
    ?.replace(/^app[\\/]/, "") // drop the leading “app/” or “app\”
    .replace(/\.[^/.]+$/, ""); // drop the extension
}

export function NodeNormalize(node) {
  let { handle, path, id, index, file } = node || {};
  let label = handle?.label;
  if (!path && index) {
    // Special case for root path "/"
    path = "/";
  } else if (path?.startsWith("/") === false) {
    if (path.startsWith("http") === false) {
      path = "/" + path;
    }
  }

  if (!id) {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    id = makeId(file);
  }

  if (!label) {
    label = id;
    if (!label) {
      if (path) {
        // Derive label from path segment for non-root paths
        const segments = path.split("/").filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          label = toPascalCase(lastSegment);
        } else {
          label = "(no label)";
        }
      }
    }
  }

  return { handle, path, id, index, label };
}

// function format(data, maxLineLength = 80) {
//   // return JSON.stringify(data, null, 2);
//   return JSON.stringify(data);
// }

/**
 * Format arrays or objects for code generation with readable line breaks
 * @param {any} data Array or object to format
 * @param {number} maxLineLength Maximum length before breaking to new line
 * @returns {string} Formatted data string
 */
function format(data, maxLineLength = 80) {
  if (data === null || data === undefined) {
    return JSON.stringify(data);
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return "[]";
    }

    // For simple arrays (strings, numbers, booleans)
    if (data.every((item) => typeof item !== "object" || item === null)) {
      const items = data.map((item) => JSON.stringify(item));

      // Try single line first
      const singleLine = `[${items.join(", ")}]`;
      if (singleLine.length <= maxLineLength) {
        return singleLine;
      }

      // Multi-line format for simple arrays
      let result = "[\n";
      let currentLine = "";

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const separator = i < items.length - 1 ? ", " : "";

        if (currentLine === "") {
          currentLine = `  ${item}${separator}`;
        } else if (
          (currentLine + item + separator).length <= maxLineLength - 2
        ) {
          currentLine += item + separator;
        } else {
          result += currentLine + "\n";
          currentLine = `  ${item}${separator}`;
        }
      }

      if (currentLine) {
        result += currentLine + "\n";
      }

      result += "]";
      return result;
    }

    // For complex arrays (objects/arrays)
    const items = data.map((item) => JSON.stringify(item, null, 2));

    // Always multi-line for complex arrays
    let result = "[\n";
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const separator = i < items.length - 1 ? "," : "";

      // Indent each line of the item
      const indentedItem = item.split("\n").map((line) => `  ${line}`).join(
        "\n",
      );
      result += indentedItem + separator + "\n";
    }
    result += "]";

    return result;
  }

  // Handle objects
  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return "{}";
    }

    // Try single line for simple objects
    const singleLine = JSON.stringify(data);
    if (singleLine.length <= maxLineLength) {
      return singleLine;
    }

    // Multi-line format for objects
    let result = "{\n";
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = data[key];
      const separator = i < keys.length - 1 ? "," : "";

      // Recursively format nested values
      const formattedValue = typeof value === "object" && value !== null
        ? format(value, maxLineLength - 4) // Reduce line length for nested indentation
        : JSON.stringify(value);

      // Indent nested multi-line values
      const indentedValue = formattedValue.includes("\n")
        ? formattedValue.split("\n").map((line, idx) =>
          idx === 0 ? line : `  ${line}`
        ).join("\n")
        : formattedValue;

      result += `  ${JSON.stringify(key)}: ${indentedValue}${separator}\n`;
    }
    result += "}";

    return result;
  }

  // For primitive types, just use JSON.stringify
  return JSON.stringify(data);
}

// rewrite tree to exclude layout routes and pull up the children
export function pruneLayouts(nodes) {
  // no path (so not a page) AND not an index route
  function isLayoutRoute(n) {
    return n.path === undefined && n.index !== true;
  }

  function groupUnderIndex(kids) {
    const idx = kids.findIndex((n) => n.index);
    if (idx < 0) return kids;
    const [parent] = kids.splice(idx, 1);
    parent.children = [...(parent.children || []), ...kids];
    return [parent];
  }

  function recurse(list, isRoot) {
    return flatMap(list, (node) => {
      if (!isLayoutRoute(node)) {
        return [{
          ...node,
          children: node.children ? recurse(node.children, false) : undefined,
        }];
      }
      const kids = recurse(node.children, false);
      return isRoot ? kids : groupUnderIndex(kids);
    });
  }

  // kickoff
  return recurse(nodes, true);
}

/// NOTE: assumes `routes` already is merged with extras.navOnly by the caller
export function codegen(dest, routes, extras) {
  const metaMap = createMetaMap(routes);
  const navTree = buildNavigationTree(routes);
  const header = `
// ⚠ AUTO-GENERATED — ${new Date().toISOString()} — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes. 
`;
  const meta = format([...metaMap.entries()]);
  const navi = format(navTree);
  const ext = path.extname(dest).toLocaleLowerCase();
  const gactions = format(extras.globalActions ?? []);
  const btargets = format(extras.badgeTargets ?? []);
  let code = undefined;
  if (ext === ".ts") {
    code = codegenTsContent(header, meta, navi, gactions, btargets);
  } else {
    code = codegenJsContent(header, meta, navi, gactions, btargets);
  }

  try {
    // 4. Write the code to the output file
    fs.writeFileSync(dest, code, "utf8");
    console.log(`✏️  Generated navigation module: ${dest}`);
  } catch (error) {
    console.error("Error during code generation:", error.message);
    // Don't exit here, allow watch mode to continue if possible
  }
}

function createMetaMap(routes) {
  const meta = new Map();
  if (!Array.isArray(routes)) return meta;

  walk(routes, (node) => {
    const id = node.id ?? makeId(node.file);
    if (id && node.handle && Object.keys(node.handle).length) {
      meta.set(id, node.handle);
    }
  });

  return meta;
}

/**
 * Build navigation trees organized by section.
 * Sections are now explicit and _section is pre-populated during build().
 * @param {ExtendedRouteConfigEntry[]} routes
 * @return {Record<string, NavStructNode[]>}
 */
function buildNavigationTree(routes) {
  /** @type {Record<string, NavStructNode[]>} */
  const navigationTree = {};
  const pruned = pruneLayouts(routes);

  // Group routes by their _section property (set during build)
  const routesBySection = new Map();

  // First pass: collect all routes and group by section
  walk(pruned, (node) => {
    const section = node._section || "main";
    if (!routesBySection.has(section)) {
      routesBySection.set(section, []);
    }
    routesBySection.get(section).push(node);
  });

  // Second pass: build navigation tree for each section
  for (const [sectionName, sectionRoutes] of routesBySection) {
    navigationTree[sectionName] = buildSectionTree(sectionRoutes);
  }

  return navigationTree;
}

/**
 * Build a navigation tree for routes within a single section
 * @param {ExtendedRouteConfigEntry[]} routes Routes belonging to one section
 * @return {NavStructNode[]}
 */
function buildSectionTree(routes) {
  if (!routes || routes.length === 0) return [];

  const processedRoutes = new Set();
  const sectionName = routes[0]._section || "main"; // All routes should have same section

  /** @param {ExtendedRouteConfigEntry} route */
  function buildNodeTree(route) {
    if (processedRoutes.has(route)) return null;
    processedRoutes.add(route);

    const { handle, id, path } = NodeNormalize(route);

    /** @type {NavStructNode} */
    const navNode = {
      id,
      path,
      ...(handle?.external && { external: true }),
    };

    // Process children, but only include children from the same section
    if (route.children && route.children.length > 0) {
      const childNodes = [];
      for (const child of route.children) {
        // Only include children that belong to the same section
        // @ts-ignore - _section is added by our build process
        const childSection = child._section || "main";
        if (childSection === sectionName) {
          const childNode = buildNodeTree(child);
          if (childNode) {
            childNodes.push(childNode);
          }
        }
      }
      if (childNodes.length > 0) {
        navNode.children = childNodes;
      }
    }

    return navNode;
  }

  // Find root routes (routes that are not children of other routes in this section)
  const childRouteIds = new Set();

  for (const route of routes) {
    for (const child of route.children ?? []) {
      // @ts-ignore - _section is added by our build process
      const childSection = child._section || "main";
      if (childSection === sectionName) {
        childRouteIds.add(child.id);
      }
    }
  }

  const rootRoutes = routes.filter((route) => !childRouteIds.has(route.id));

  // Build tree starting from root routes
  const treeNodes = [];
  for (const rootRoute of rootRoutes) {
    const treeNode = buildNodeTree(rootRoute);
    if (treeNode) {
      treeNodes.push(treeNode);
    }
  }

  return treeNodes;
}

function codegenTsContent(header, meta, navi, gactions, btargets) {
  return `${header}
import type {
  GlobalActionSpec,
  NavigationApi,
  NavMeta,
  NavStructNode,
  NavTreeNode,
  RouterAdapter,
} from "@m5nv/rr-builder";

/* 1 ─ raw data ─────────────────────────────────────────────── */
const metaMap = new Map<string, NavMeta>(${meta});

/* thin structural forest */
const navStructure: Record<string, NavStructNode[]> = ${navi};

/**
 * Global actions, if any; the application should wire these up.
 */
const globalActions: GlobalActionSpec[] = ${gactions};

/**
 * Badge targets, if any; the application should wire these up.
 */
const badgeTargets: string[] = ${btargets};

/* 2 ─ pure helpers (no adapter) ─────────────────────────────── */
const cache = new Map<string, NavTreeNode[]>();

function hydrate(n: NavStructNode): NavTreeNode {
  const meta = metaMap.get(n.id) ?? {};
  return { ...meta, id: n.id, path: n.path, children: n.children?.map(hydrate) };
}

// shared depth-first helper
function collect(
  nodes: NavTreeNode[],
  test: (n: NavTreeNode) => boolean,
  acc: NavTreeNode[] = [],
): NavTreeNode[] {
  for (const n of nodes) {
    if (test(n)) acc.push(n);
    if (n.children) collect(n.children, test, acc);
  }
  return acc;
}

function sections() {
  return Object.keys(navStructure);
}

function routes(section: string = "main") {
  if (!cache.has(section)) cache.set(section, (navStructure[section] ?? []).map(hydrate));
  return cache.get(section)!;
}

function routesByTags(
  section: string,
  tags: string[],
): NavTreeNode[] {
  const hasAll = (n: NavTreeNode) =>
    tags.every((t) => n.tags?.includes(t));
  return collect(routes(section), hasAll);
}

function routesByGroup(
  section: string,
  group: string,
): NavTreeNode[] {
  return collect(routes(section), (n) => n.group === group);
}

/* 3 ─ router adapter plumbing ──────────────────────────────── */
let adapter: RouterAdapter | null = null;
export function registerRouter(a: RouterAdapter) {
  adapter = a;
}

function assertAdapter(): RouterAdapter {
  if (!adapter)
    throw new Error(
      "navigationApi: router adapter not registered. " +
      "Call registerRouter({ Link, useLocation, useMatches, matchPath }) " +
      "once, in your AppShell.",
    );
  return adapter;
}

/**
 * Hook to hydrate matches with your navigation metadata
 */
function useHydratedMatches(): Array<{ handle: NavMeta }> {
  const { useMatches } = assertAdapter();
  const matches = useMatches();
  return matches.map((match) => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match as typeof match & { handle: NavMeta };
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match as typeof match & { handle: NavMeta };
  });
}

export default {
  sections,
  routes,
  routesByTags,
  routesByGroup,
  useHydratedMatches,
  globalActions,
  badgeTargets,
  /* router adapter (proxied) */
  get router() {
    return assertAdapter();
  },
} as NavigationApi;
`;
}

function codegenJsContent(header, meta, navi, gactions, btargets) {
  return `${header}
// @ts-check
/* eslint-disable jsdoc/require-jsdoc */

/** @typedef {import('@m5nv/rr-builder').NavMeta} NavMeta */
/** @typedef {import('@m5nv/rr-builder').NavTreeNode} NavTreeNode */
/** @typedef {import('@m5nv/rr-builder').NavStructNode} NavStructNode */
/** @typedef {import('@m5nv/rr-builder').GlobalActionSpec} GlobalActionSpec */

/* 1 ─ raw data ─────────────────────────────────────────────── */
const metaMap = new Map(${meta});

/** @type {Record<string, NavStructNode[]>} */
const navStructure = ${navi};

/**
 * Global actions, if any; the application should wire these up.
 * @type {GlobalActionSpec[]}
 */
const globalActions = ${gactions};

/**
 * Badge targets, if any; the application should wire these up.
 * @type {string[]}
 */
const badgeTargets = ${btargets}

/* 2 ─ pure helpers ─────────────────────────────────────────── */
const cache = new Map();

/** @param {NavStructNode} n @return {NavTreeNode} */
function hydrate(n) {
  const meta = metaMap.get(n.id) ?? {};
  return { ...meta, id: n.id, path: n.path, children: n.children?.map(hydrate) };
}

/**
 * Depth-first collector.
 * @param {NavTreeNode[]} nodes
 * @param {(n: NavTreeNode)=>boolean} test
 * @param {NavTreeNode[]} [acc]
 * @returns {NavTreeNode[]}
 */
function collect(nodes, test, acc = []) {
  for (const n of nodes) {
    if (test(n)) acc.push(n);
    if (n.children) collect(n.children, test, acc);
  }
  return acc;
}

/** @return {string[]} */
function sections() {
  return Object.keys(navStructure);
}

/** @return {NavTreeNode[]} */
function routes(section = "main") {
  if (!cache.has(section)) cache.set(section, (navStructure[section] ?? []).map(hydrate));
  return cache.get(section);
}

/** @return {NavTreeNode[]} */
function routesByTags(section, tags) {
  return collect(routes(section), (n) => tags.every((t) => n.tags?.includes(t)));
}

/** @return {NavTreeNode[]} */
function routesByGroup(section, group) {
  return collect(routes(section), (n) => n.group === group);
}

/* 3 ─ router adapter plumbing ─────────────────────────────── */
let adapter = null;
/** @param {import('@m5nv/rr-builder').RouterAdapter} a */
export function registerRouter(a) {
  adapter = a;
}

function assertAdapter() {
  if (!adapter)
    throw new Error(
      "navigationApi: router adapter not registered. " +
      "Call registerRouter({ Link, useLocation, useMatches, matchPath }) " +
      "once, in your AppShell.",
    );
  return adapter;
}

/**
 * Hook to hydrate matches with your navigation metadata
 * @returns { Array<{ handle: NavMeta }> } 
 */
function useHydratedMatches() {
  const { useMatches } = assertAdapter();
  const matches = useMatches();
  return matches.map((match) => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match;
  });
}

/// Navigation API
export default {
  sections,
  routes,
  routesByTags,
  routesByGroup,
  useHydratedMatches,
  globalActions,
  badgeTargets,
  /* router adapter (proxied) */
  get router() {
    return assertAdapter();
  },
};
`;
}
