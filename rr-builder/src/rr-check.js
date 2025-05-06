#!/usr/bin/env node
/// @ts-check
/// <reference types="./tree-utils" />
/// <reference types="./rr-builder" />

/**
 * @typedef {import('./rr-builder').NavTreeNode} NavTreeNode
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";

import { flatMap, walk, workflow } from "./tree-utils.js";

// state + options
const state = {
  /** Input routes file path
   * @type {string | null}
   */
  file: null,

  routesFilePath: "",

  /** Output file path for code generation
   * @type {string | null}
   */
  out: null,
  watch: false,
  show: { route: false, nav: false, id: false, path: false },
  base: "",
  hasErrors: false,

  /** @type {Set<string> | null} */
  dupIds: null,
  /** @type {Map<string, number> | null} */
  duplicateIds: null,
  /** @type {string[] | null} */
  missingFiles: null,
  /** @type {Set<string> | null} */
  missingFileIds: null,
};

// simple arg parsing and bootstrap state
function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args[0].startsWith("-")) {
    return false;
  }
  state.file = args[0];
  state.routesFilePath = path.resolve(process.cwd(), state.file);
  state.base = path.dirname(state.routesFilePath);

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--out":
        if (args[i + 1]) state.out = args[++i];
        break;
      case "--watch":
        state.watch = true;
        break;
      case "--show-route-tree":
        state.show.route = true;
        break;
      case "--show-nav-tree":
        state.show.nav = true;
        break;
      case "--show-id":
        state.show.id = true;
        break;
      case "--show-path":
        state.show.path = true;
        break;
    }
  }
  return true;
}

function toPascalCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // Remove hyphens/underscores and capitalize next char
    .replace(/^(.)/, (_, c) => c.toUpperCase()); // Capitalize the first character
}

function getMarker(node_id) {
  let mark = " ";
  // Use the node's ID (either from NavTreeNode or ExtendedRouteConfigEntry)
  if (node_id && state.dupIds && state.missingFileIds) {
    const isDuplicate = state.dupIds.has(node_id);
    const isMissingFile = state.missingFileIds.has(node_id);

    if (isDuplicate && isMissingFile) {
      mark = "(*!)"; // Indicate both duplicate and missing file
    } else if (isDuplicate) {
      mark = "(*)"; // Indicate only duplicate
    } else if (isMissingFile) {
      mark = "(!)"; // Indicate only missing file
    }
  }

  return mark;
}

function NodeNormalize(node) {
  let { handle, path, id, index, file } = node;
  let label = handle?.label;
  if (!path && index) {
    // Special case for root path "/"
    path = "/";
  }

  if (!id) {
    id = file?.replace(/\.[^/.]+$/, "");
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

function Node2String(node) {
  let { path, id, index, label } = NodeNormalize(node);

  const mark = getMarker(id);
  const info = [];
  if (state.show.path && path) {
    info.push(`path: ${path}`);
    if (index) {
      info.push(`index`);
    }
  }
  if (state.show.id && id) info.push(`id: ${id}`);
  const xtra = info.length ? ` [${info.join(", ")}]` : "";
  return `${label}${mark}${xtra}`;
}

function printTree(nodes) {
  console.log(".");
  const lastFlags = [];
  walk(nodes, (node, depth, siblings) => {
    const idx = siblings.indexOf(node);
    const isLast = idx === siblings.length - 1;
    lastFlags[depth] = isLast;
    let prefix = "";
    for (let i = 0; i < depth; i++) {
      prefix += lastFlags[i] ? "    " : "│   ";
    }
    const pointer = isLast ? "└── " : "├── ";
    console.log(prefix + pointer + Node2String(node));
  });

  // return nodes so we can use this function in `pipe`
  return nodes;
}

// rewrite tree to exclude layout routes and pull up the children
function pruneLayouts(nodes) {
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

function printErrorReport() {
  const { duplicateIds, missingFiles, dupIds, multiIdxs } = state;
  if (duplicateIds && missingFiles && dupIds && multiIdxs) {
  } else {
    console.log("⚠️  Out of sync!");
    return;
  }

  // Always show error count summary
  const dupCount = duplicateIds.size;
  const missingCount = missingFiles.length;

  if (dupCount > 0) {
    console.error(
      `⚠️  Found ${dupCount} duplicate route ID${dupCount > 1 ? "s" : ""}`,
    );
  }

  if (missingCount > 0) {
    console.error(
      `⚠️  Found ${missingCount} missing component file${
        missingCount > 1 ? "s" : ""
      }`,
    );
  }

  if (dupCount > 0) {
    console.error("\nDuplicate IDs:");
    for (const [id, count] of duplicateIds.entries()) {
      console.error(`  * ${id} appears ${count} times`);
    }
  }

  if (missingCount > 0) {
    console.error("\nMissing component files:");
    for (const file of missingFiles) {
      console.error(`  ! ${file}`);
    }
  }
}

function checkForErrors(routes) {
  function findDuplicateIds(nodes, ctx) {
    const counts = new Map();
    walk(nodes, (n) => {
      const id = n.id ?? (n.file ? n.file.replace(/\.[^/.]+$/, "") : undefined);
      // count iff id could be determined
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });

    ctx.duplicateIds = new Map(
      [...counts.entries()].filter(([, count]) => count > 1),
    );

    ctx.dupIds = new Set([...ctx.duplicateIds.keys()]);
    return nodes;
  }

  function findMissingFiles(nodes, ctx) {
    ctx.missingFiles = [];
    ctx.missingFileIds = new Set();
    walk(nodes, (node) => {
      const file = path.resolve(ctx.base, node.file);
      if (!fs.existsSync(file)) {
        ctx.missingFiles.push(node.file);
        const id = node.id ?? node.file.replace(/\.[^/.]+$/, "");
        ctx.missingFileIds.add(id);
      }
    });
    return nodes;
  }

  function findMultipleIndexLevels(nodes, ctx) {
    ctx.multiIdxs = [];
    walk(nodes, (node, depth, siblings) => {
      // only inspect a sibling‐group once, at its first node
      if (siblings[0] === node) {
        const idxs = siblings.filter((n) => n.index);
        if (idxs.length > 1) {
          ctx.multiIdxs.push(
            ...idxs.map((n) => ({
              file: n.file,
              id: n.id ?? undefined,
              label: n.handle?.label,
            })),
          );
        }
      }
    });
    return nodes;
  }

  const { run, ctx } = workflow(
    findDuplicateIds,
    findMultipleIndexLevels,
    findMissingFiles,
    state,
  );

  // execute the workflow
  const result = run(routes);

  // have to check first to keep ts-check happy :-(
  const { duplicateIds, missingFiles, dupIds, multiIdxs } = ctx;
  if (duplicateIds && missingFiles && dupIds && multiIdxs) {
    if (duplicateIds.size > 0 || missingFiles.length > 0 || multiIdxs.length) {
      state.hasErrors = true;
    }
  } else {
    console.log("⚠️  Out of sync!");
  }

  return state.hasErrors;
}

export function createMetaMap(routes) {
  const meta = new Map();
  if (!Array.isArray(routes)) return meta;

  walk(routes, (node) => {
    const id = node.id ??
      (node.file ? node.file.replace(/\.[^/.]+$/, "") : undefined);
    if (id && node.handle && Object.keys(node.handle).length) {
      meta.set(id, node.handle);
    }
  });

  return meta;
}

/**
 * Section-anywhere build: splits into multiple section-keyed sub-trees.
 * @return {Record<string, NavTreeNode[]>}
 */
export function buildNavigationTree(routes) {
  /** @type {Record<string, NavTreeNode[]>} */
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
      ...(handle?.label && { label: handle.label }),
      ...(handle?.iconName && { iconName: handle.iconName }),
      ...(handle?.group && { group: handle.group }),
      ...(handle?.end && { end: handle.end }),
    };

    // 3) attach to the right place
    const isNewSectionRoot = depth === 0 || handle?.section !== undefined;
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

function codegenJsContent(header, meta, navi) {
  const content = `${header}
// @ts-check
import { useMatches } from 'react-router';
/** @typedef {import('@m5nv/rr-builder').NavMeta} NavMeta */
/** @typedef {import('@m5nv/rr-builder').NavTreeNode} NavTreeNode */
/** @typedef {import("react-router").UIMatch<unknown, NavMeta|unknown>} UIMatch */


/** @type {Map<string, NavMeta>} */
export const metaMap = new Map([
${meta}
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 * @type {Record<string, NavTreeNode[]>}
 */
export const navigationTree = ${navi};

/**
 * Hook to hydrate matches with your navigation metadata
 * @returns {Array<UIMatch>}>}
 */
export function useHydratedMatches() {
  const matches = useMatches();
  return matches.map(match => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match;
  });
}
`;
  return content;
}

function codegenTsContent(header, meta, navi) {
  const content = `${header}
import { useMatches, type UIMatch } from 'react-router';
import type { NavMeta, NavTreeNode } from "@m5nv/rr-builder";

export const metaMap = new Map<string, NavMeta>([
${meta}
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 */
export const navigationTree: Record<string, NavTreeNode[]> = ${navi};

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
`;
  return content;
}

function codegen(routes) {
  if (!state.out) {
    return;
  }

  const metaMap = createMetaMap(routes);
  const navTree = buildNavigationTree(routes);

  // console.log(metaMap);
  // console.log(navTree);
  // for (const [k, v] of Object.entries(navTree)) {
  //   console.log("~~~~~~~~", k, "~~~~~~~");
  //   printTree(v);
  // }

  const header = `
// ⚠ AUTO-GENERATED — ${new Date().toISOString()} — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes. 
`;
  const meta = [...metaMap.entries()].map(
    ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
  ).join("\n");
  const navi = JSON.stringify(navTree, null, 2);
  const ext = path.extname(state.out).toLocaleLowerCase();

  let code = undefined;
  if (ext === ".ts") {
    code = codegenTsContent(header, meta, navi);
  } else {
    code = codegenJsContent(header, meta, navi);
  }

  try {
    // 4. Write the code to the output file
    fs.writeFileSync(state.out, code, "utf8");
    console.log(`✏️ Generated path-based nav module: ${state.out}`);
  } catch (error) {
    console.error("Error during code generation:", error.message);
    // Don't exit here, allow watch mode to continue if possible
  }
}

async function processRoutes(routes) {
  // reset run state
  state.hasErrors = false;
  state.dupIds = null;
  state.duplicateIds = null;
  state.missingFiles = null;
  state.missingFileIds = null;
  state.multiIdxs = null;
  checkForErrors(routes);
  if (state.hasErrors) {
    printErrorReport();
    console.error("⚠️  Skipping code generation due to errors");
  } else {
    console.log("✅  No errors detected");
    codegen(routes);
  }

  if (state.show.route) {
    printTree(routes);
  }

  if (state.show.nav) {
    printTree(pruneLayouts(routes));
  }
}

// build a loader that remembers its own lastHash
function createLoader(filePath) {
  let lastHash = "";
  return async function loadRoutes() {
    const url = pathToFileURL(filePath).href + `?t=${Date.now()}`;
    let arr = [], error = false;
    try {
      const m = await import(url);
      if (Array.isArray(m.default)) arr = m.default;
    } catch (e) {
      console.error(
        `❌  ${e.message}`,
      );
      error = true;
    }
    const hash = crypto.createHash("sha256")
      .update(JSON.stringify(arr))
      .digest("hex");
    const changed = hash !== lastHash;
    lastHash = hash;
    return { routes: arr, changed, error };
  };
}

async function main() {
  if (!parseArgs()) {
    console.error(
      "Usage: node rr-check <routes.js> [--out <file>] [--watch] …",
    );
    return process.exit(1);
  }

  const load = createLoader(state.routesFilePath);

  const run = async (watching = false) => {
    const { routes, changed, error } = await load();
    if (error) process.exit(1);
    if (routes.length === 0 || (watching && !changed)) return;
    if (watching) console.log("🔄  Change detected, regenerating…");
    await processRoutes(routes);
  };

  // run once first
  await run(false);

  if (state.watch) {
    console.log(`👀  Watching ${state.file}…`);
    fs.watchFile(state.routesFilePath, { interval: 200 }, () => run(true));
  }
}

/// go!!!
main();
