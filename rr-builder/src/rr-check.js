#!/usr/bin/env node
/// <reference types="./tree-utils" />
/// @ts-check

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

function Node2String(node) {
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
          // Fallback only if all else fails (should rarely happen)
          label = "(no label)";
        }
      }
    }
  }

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
  if (!state.hasErrors) {
    console.log("✅ No errors detected");
    return;
  }

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

async function processRoutes(routes) {
  // reset run state
  state.hasErrors = false;
  state.dupIds = null;
  state.duplicateIds = null;
  state.missingFiles = null;
  state.missingFileIds = null;
  state.multiIdxs = null;
  const result = checkForErrors(routes);
  printErrorReport();

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
    if (watching) console.log("🔄 Change detected, regenerating…");
    await processRoutes(routes);
  };

  // run once first
  await run(false);

  if (state.watch) {
    console.log(`👀 Watching ${state.file}…`);
    fs.watchFile(state.routesFilePath, { interval: 200 }, () => run(true));
  }
}

/// go!!!
main();
