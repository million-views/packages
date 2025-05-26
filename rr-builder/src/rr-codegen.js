/// @ts-check
/// <reference types="./tree-utils" />
/// <reference types="./rr-builder" />
import fs from "node:fs";
import path from "node:path";
import { flatMap, walk } from "@m5nv/rr-builder/tree-utils";

/**
 * @typedef {import('./rr-builder').NavMeta} NavMeta
 * @typedef {import('./rr-builder').NavStructNode} NavStructNode
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
  const meta = [...metaMap.entries()].map(
    ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
  ).join("\n");
  const navi = JSON.stringify(navTree, null, 2);
  const ext = path.extname(dest).toLocaleLowerCase();
  const gactions = JSON.stringify(extras.globalActions ?? []);
  const btargets = JSON.stringify(extras.badgeTargets ?? []);
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
 * Section-anywhere build: splits into multiple section-keyed sub-trees.
 * @return {Record<string, NavStructNode[]>}
 */
function buildNavigationTree(routes) {
  /** @type {Record<string, NavStructNode[]>} */
  const navigationTree = {};
  const pruned = pruneLayouts(routes);
  const stack = [];

  function emit(section, node) {
    if (!navigationTree[section]) navigationTree[section] = [];
    navigationTree[section].push(node);
  }

  walk(pruned, (node, depth) => {
    // 1) figure out which section this node belongs to
    const parentCtx = depth > 0 ? stack[depth - 1].activeSection : "main";
    const activeSection = node.handle?.section ?? parentCtx;

    // 2) build our NavTreeNode
    //    Only add properties that exist and are of interest to the UI component
    const { handle, id, path } = NodeNormalize(node);
    const navNode = {
      id,
      path,
      ...(handle?.external && { external: true }),
    };

    // 3) attach to the right place
    // const isNewSectionRoot = depth === 0 || handle?.section !== undefined;
    const isNewSectionRoot = depth === 0 ||
      (handle?.section !== undefined && handle.section !== parentCtx);
    if (isNewSectionRoot) {
      // root of “main” (depth=0) or root of a deeper section
      emit(activeSection, navNode);
    } else {
      // plain descendant of the same section
      const dnode = stack[depth - 1];
      if (dnode.navNode.children) {
        dnode.navNode.children.push(navNode);
      } else {
        dnode.navNode.children = [navNode];
      }
      // stack[depth - 1].navNode.children.push(navNode);
    }
    // 4) push our own context for any children
    stack[depth] = { activeSection, navNode };
  });

  return navigationTree;
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
const metaMap = new Map<string, NavMeta>([
${meta}
]);

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
const metaMap = new Map([
${meta}
]);

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
