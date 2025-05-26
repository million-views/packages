#!/usr/bin/env node

/// @ts-check
/// <reference types="./tree-utils" />
/// <reference types="./rr-builder" />

/**
 * @typedef {import('./rr-builder').NavStructNode}
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "crypto";
import { pathToFileURL } from "node:url";

import { walk, workflow } from "@m5nv/rr-builder/tree-utils";
import { codegen, makeId, NodeNormalize, pruneLayouts } from "./rr-codegen.js";

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
  forcegen: false,
  watch: false,
  show: { route: false, nav: false, id: false, path: false },
  base: "",
  hasErrors: false,
  irrecoverableError: false,
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
  // first positional arg is the input file
  state.file = args[0];
  state.routesFilePath = path.resolve(process.cwd(), state.file);
  state.base = path.dirname(state.routesFilePath);

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--print:")) {
      // e.g. --print:route-tree,include-id,include-path
      // or   "--print: route-tree, include-id, include-path"
      const opts = arg
        .slice("--print:".length)
        .split(",")
        .map((s) => s.trim());
      for (const o of opts) {
        switch (o) {
          case "route-tree":
            state.show.route = true;
            break;
          case "nav-tree":
            state.show.nav = true;
            break;
          case "include-id":
            state.show.id = true;
            break;
          case "include-path":
            state.show.path = true;
            break;
        }
      }
    } else {
      switch (arg) {
        case "--out":
          if (args[i + 1]) state.out = args[++i];
          break;
        case "--watch":
          state.watch = true;
          break;
        case "--force":
          state.forcegen = true;
          break;
      }
    }
  }

  return true;
}

function getMarker(node_id) {
  let mark = " ";
  // Use the node's ID (either from NavTreeNode or ExtendedRouteConfigEntry)
  if (node_id && state.duplicateIds && state.missingFileIds) {
    const isDuplicate = state.duplicateIds.has(node_id);
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

function printErrorReport() {
  const { duplicateIds, missingFiles, multiIdxs } = state;
  if (!(duplicateIds && missingFiles && multiIdxs)) {
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
      const id = n?.id ?? makeId(n?.file);
      // count iff id could be determined
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    });

    ctx.duplicateIds = new Map(
      [...counts.entries()].filter(([, count]) => count > 1),
    );

    return nodes;
  }

  function findMissingFiles(nodes, ctx) {
    ctx.missingFiles = [];
    ctx.missingFileIds = new Set();
    walk(nodes, (node) => {
      if (!node) {
        console.log(
          "⚠️  Irrecoverably out of sync; check your route configuration!",
        );
        state.irrecoverableError = true;
      } else {
        const file = path.resolve(ctx.base, node.file);
        if (!fs.existsSync(file)) {
          ctx.missingFiles.push(node.file);
          const id = node.id ?? makeId(node.file);
          ctx.missingFileIds.add(id);
        }
      }
    });
    return nodes;
  }

  function findMultipleIndexLevels(nodes, ctx) {
    ctx.multiIdxs = [];
    walk(nodes, (node, depth, siblings) => {
      // only inspect a sibling‐group once, at its first node
      if (siblings[0] === node) {
        const idxs = siblings.filter((n) => n?.index);
        if (idxs.length > 1) {
          ctx.multiIdxs.push(
            ...idxs.map((n) => ({
              file: n.file,
              id: n.id ?? makeId(n.file),
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
  const { duplicateIds, missingFiles, multiIdxs } = ctx;
  if (duplicateIds && missingFiles && multiIdxs) {
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
    const id = node.id ?? makeId(node.file);
    if (id && node.handle && Object.keys(node.handle).length) {
      meta.set(id, node.handle);
    }
  });

  return meta;
}

async function processRoutes(routes, extras) {
  // reset run state
  state.hasErrors = false;
  state.irrecoverableError = false;
  state.duplicateIds = null;
  state.missingFiles = null;
  state.missingFileIds = null;
  state.multiIdxs = null;

  // re-anchor externals back to their place in the route tree
  const byId = new Map();
  walk(routes, (n) => byId.set(n.id, n));

  for (const ext of extras.navOnly ?? []) {
    const parent = ext._anchor ? byId.get(ext._anchor) : null;
    if (parent) {
      (parent.children ??= []).push(ext);
    } else {
      routes.push(ext);
    }
    // ← cleanup to keep the `navigation` free of private fields
    delete ext._anchor;
  }

  checkForErrors(routes);
  if (state.hasErrors) {
    printErrorReport();
    if (state.out && !state.forcegen) {
      console.error("⚠️  Skipping code generation due to errors");
    } else if (state.out && state.forcegen) {
      console.error("⚠️  Forcing code generation despite detected errors");
    }
  } else {
    console.log("✅  No errors detected");
  }

  if (!state.hasErrors || state.forcegen) {
    if (state.out) {
      codegen(state.out, routes, extras);
    }
  }

  if (state.show.route || state.irrecoverableError) {
    printTree(routes);
  }

  if (state.show.nav) {
    printTree(pruneLayouts(routes));
  }
}

// build a loader that remembers its own lastHash
// patched to pull `routes.nav` out of `build()` output.
function createLoader(filePath) {
  let lastHash = "";
  return async function loadRoutes() {
    const url = pathToFileURL(filePath).href + `?t=${Date.now()}`;
    let arr = [],
      extras = {},
      error = false;
    try {
      const m = await import(url);
      if (Array.isArray(m.default)) arr = m.default;
      if (arr && typeof arr.nav === "object") extras = arr.nav;
    } catch (e) {
      console.error(`❌  ${e.message}`);
      error = true;
    }
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify({ arr, extras }))
      .digest("hex");
    const changed = hash !== lastHash;
    lastHash = hash;
    return { routes: arr, extras, changed, error };
  };
}

async function main() {
  if (!parseArgs()) {
    console.error(
      `
Usage: node rr-check <routes-file> [--print:<FLAGS>] [--out <file>] [--watch]

Arguments:
  <routes-file>             Path to your routes config file (e.g. routes.js or routes.ts).

Options:
  --print:<FLAGS>           Comma-separated list of output types (no spaces). Available flags:
                              route-tree     Print an ASCII tree of all routes.
                              nav-tree       Print an ASCII tree of navigable routes.
                              include-id     Append each node’s unique ID in the tree leaves.
                              include-path   Append each node’s URL path in the tree leaves.
  --watch                   Watch the routes-file for changes and rerun automatically.
  --out=<file>              Write code (navigationTree, useHydratedMatches()) to <file>.

Examples:
  npx rr-check routes.js --print:route-tree
  npx rr-check src/routes.js --print:nav-tree,include-path --out=app/lib/navigation.js
  deno rr-check src/routes.ts --print:route-tree,include-id --watch 
`,
    );
    return process.exit(1);
  }

  const load = createLoader(state.routesFilePath);

  const run = async (watching = false) => {
    const { routes, extras, changed, error } = await load();
    if (error) process.exit(1);
    if (routes.length === 0 || (watching && !changed)) return;
    if (watching) console.log("🔄  Change detected, regenerating…");
    await processRoutes(routes, extras);
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
