#!/usr/bin/env node

import fs from "fs";
import path from "path";

const state = {
  file: null,
  routesFilePath: "",
  out: null,
  forcegen: false,
  watch: false,
  show: { route: false, nav: false, id: false, path: false },
  base: "",
  hasErrors: false,
  irrecoverableError: false,
  duplicateIds: null,
  missingFiles: null,
  missingFileIds: null,
  metaJson: null,
  apiStubFile: null,
  cruddyOutFile: null
};

function extractCruddyAnnotations(apiFilePath, outFilePath) {
  const src = fs.readFileSync(apiFilePath, "utf8");
  // Match JSDoc blocks containing @cruddy tags
  const jsdocBlocks = src.match(/\/\*\*([\s\S]*?)\*\//g) || [];
  const rawEntries = [];
  for (const block of jsdocBlocks) {
    if (!block.includes("@cruddy")) continue;
    const lines = block.split("\n").map(l => l.trim().replace(/^\* ?/, ""));
    const annotations = {};
    const navObj = {};
    for (const line of lines) {
      const navMatch = line.match(/^@cruddy\.nav\.(\w+)(?:\s+(.*))?/);
      if (navMatch) {
        const navKey = navMatch[1];
        let navValue = navMatch[2] || "";
        try {
          navValue = JSON.parse(navValue);
        } catch {}
        navObj[navKey] = navValue;
        continue;
      }
      const m = line.match(/^@cruddy\.(\w+)(?:\s+(.*))?/);
      if (m && m[1] !== "nav") {
        const key = m[1];
        let value = m[2] || "";
        try {
          value = JSON.parse(value);
        } catch {}
        annotations[key] = value;
      }
    }
    if (Object.keys(navObj).length > 0) {
      annotations["nav"] = navObj;
    }
    const afterBlock = src.slice(src.indexOf(block) + block.length);
    const fnMatch = afterBlock.match(/(?:async\s+)?(?:function\s+)?([a-zA-Z0-9_]+)\s*\(/);
    const methodName = fnMatch ? fnMatch[1] : null;
    if (Object.keys(annotations).length > 0) {
      rawEntries.push({ method: methodName, annotations });
    }
  }

  // Domain-agnostic section rollup: group by first segment of resource name
  function getSectionName(annotations) {
    if (annotations.resource) {
      let res = String(annotations.resource);
      // Split by dash, underscore, or camelCase boundary
      let match = res.match(/^([a-zA-Z0-9]+)(?=[-_A-Z]|$)/);
      return match ? match[1].toLowerCase() : res.toLowerCase();
    } else if (annotations.type) {
      return String(annotations.type).toLowerCase();
    }
    return "other";
  }

  const sectioned = {};
  for (const entry of rawEntries) {
    const section = getSectionName(entry.annotations);
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(entry);
  }
  fs.writeFileSync(outFilePath, JSON.stringify(sectioned, null, 2), "utf8");
  console.log(`✏️  Extracted @cruddy annotations to: ${outFilePath}`);
}

// --- CRUDDY ROUTE GENERATION FROM META JSON ---
import { route, index, layout, prefix, build } from "./rr-builder.js";

/**
 * Generate routes from meta JSON using CRUDdy by Design principles.
 * @param {object} metaJson
 * @returns {Array}
 */
function generateCruddyRoutes(metaJson) {
  // metaJson is expected to be an object with resources array or similar
  // Example structure:
  // {
  //   "resources": [
  //     { "name": "photos", "actions": ["index", "show", ...], "meta": {...} }, ...
  //   ]
  // }
  if (!metaJson || !Array.isArray(metaJson.resources)) {
    throw new Error("Invalid meta JSON: missing 'resources' array");
  }
  const routes = [];
  for (const resource of metaJson.resources) {
    const { name, actions, meta } = resource;
    if (!name || !Array.isArray(actions)) continue;
    // Standard CRUDdy action to file mapping
    const actionToFile = {
      index: "index.ts",
      create: "create.ts",
      store: "store.ts",
      show: "show.ts",
      edit: "edit.ts",
      update: "update.ts",
      destroy: "destroy.ts",
    };
    for (const action of actions) {
      const file = `${name}/${actionToFile[action] || (action + ".ts")}`;
      let pathStr = null;
      // Path conventions per CRUDdy by Design
      switch (action) {
        case "index":
          pathStr = `${name}`;
          break;
        case "create":
          pathStr = `${name}/create`;
          break;
        case "store":
          pathStr = `${name}`;
          break;
        case "show":
          pathStr = `${name}/:id`;
          break;
        case "edit":
          pathStr = `${name}/:id/edit`;
          break;
        case "update":
          pathStr = `${name}/:id`;
          break;
        case "destroy":
          pathStr = `${name}/:id`;
          break;
        default:
          pathStr = `${name}/${action}`;
      }
      // Use Builder API to create route
      // Attach meta using .meta() if meta is a plain object
      let builder = route(pathStr, file);
      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        builder = builder.meta(meta);
      }
      routes.push(builder);
    }
  }
  return build(routes);
}

function toPascalCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // Remove hyphens/underscores and capitalize next char
    .replace(/^(.)/, (_, c) => c.toUpperCase()); // Capitalize the first character
}

function makeId(filepath) {
  return filepath
    ?.replace(/^app[\\/]/, "") // drop the leading “app/” or “app\”
    .replace(/\.[^/.]+$/, ""); // drop the extension
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

function NodeNormalize(node) {
  let { handle, path, id, index, file } = node || {};
  let label = handle?.label;
  if (!path && index) {
    // Special case for root path "/"
    path = "/";
  } else if (path?.startsWith("/") === false) {
    path = "/" + path;
  }

  if (!id) {
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
    console.log(`✏️  Generated navigation module: ${state.out}`);
  } catch (error) {
    console.error("Error during code generation:", error.message);
    // Don't exit here, allow watch mode to continue if possible
  }
}

async function processRoutes(routes) {
  // reset run state
  state.hasErrors = false;
  state.irrecoverableError = false;
  state.duplicateIds = null;
  state.missingFiles = null;
  state.missingFileIds = null;
  state.multiIdxs = null;
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
    codegen(routes);
  }

  if (state.show.route || state.irrecoverableError) {
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

function parseArgs() {
  const args = process.argv.slice(2);
  let sawInput = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("-")) {
      // treat first non-flag as input file if not already set
      if (!sawInput && !state.file && !state.metaJson && !state.apiStubFile) {
        state.file = arg;
        state.routesFilePath = path.resolve(process.cwd(), state.file);
        state.base = path.dirname(state.routesFilePath);
        sawInput = true;
      }
      continue;
    }
    if (arg === "--meta-json" && args[i + 1]) {
      state.metaJson = args[++i];
      continue;
    }
    if (arg === "--extract-cruddy" && args[i + 1]) {
      state.apiStubFile = args[++i];
      continue;
    }
    if (arg === "--out-cruddy" && args[i + 1]) {
      state.cruddyOutFile = args[++i];
      continue;
    }
    if (arg.startsWith("--print:")) {
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
      continue;
    }
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
  // Must have either a file, metaJson, or apiStubFile
  if (!state.file && !state.metaJson && !state.apiStubFile) return false;
  return true;
}

async function main() {
  if (!parseArgs()) {
    console.error(
      `
Usage: node rr-check <routes-file> [--print:<FLAGS>] [--out <file>] [--watch]\n
       node rr-check --meta-json <meta.json> [--out <file>]
       node rr-check --extract-cruddy <api-file> --out-cruddy <output.json>

Arguments:
  <routes-file>             Path to your routes config file (e.g. routes.js or routes.ts).
  --meta-json <meta.json>   Path to meta JSON file for CRUDdy route generation.
  --extract-cruddy <api-file>  Path to API file with JSDoc @cruddy comments to extract.
  --out-cruddy <output.json>   Output JSON filename for extracted metadata.

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
  npx rr-check --meta-json meta.json --out=routes.js
  npx rr-check --extract-cruddy docs/business-api.ts --out-cruddy cruddy-metadata.json
  deno rr-check src/routes.ts --print:route-tree,include-id --watch 
`,
    );
    return process.exit(1);
  }

  // If --extract-cruddy is provided, extract @cruddy JSDoc comments
  if (state.apiStubFile && state.cruddyOutFile) {
    try {
      extractCruddyAnnotations(path.resolve(process.cwd(), state.apiStubFile), path.resolve(process.cwd(), state.cruddyOutFile));
    } catch (e) {
      console.error(`❌  Failed to extract @cruddy annotations: ${e.message}`);
      process.exit(1);
    }
    return;
  }

  // If --meta-json is provided, generate routes from meta JSON
  if (state.metaJson) {
    let metaJsonObj;
    try {
      const metaRaw = fs.readFileSync(path.resolve(process.cwd(), state.metaJson), "utf8");
      metaJsonObj = JSON.parse(metaRaw);
    } catch (e) {
      console.error(`❌  Failed to read or parse meta JSON: ${e.message}`);
      process.exit(1);
    }
    // Support both { resources: [...] } and { metadata: [...] } formats
    let normalized;
    if (Array.isArray(metaJsonObj.resources)) {
      normalized = metaJsonObj;
    } else if (Array.isArray(metaJsonObj.metadata)) {
      // Group by resource, collect unique action types
      const resourceMap = new Map();
      for (const entry of metaJsonObj.metadata) {
        const res = entry.annotations && entry.annotations.resource;
        const type = entry.annotations && entry.annotations.type;
        if (!res || !type) continue;
        if (!resourceMap.has(res)) resourceMap.set(res, new Set());
        resourceMap.get(res).add(type);
      }
      normalized = {
        resources: Array.from(resourceMap.entries()).map(([name, actionsSet]) => ({
          name,
          actions: Array.from(actionsSet)
        }))
      };
    } else {
      console.error("❌  Invalid meta JSON: missing 'resources' or 'metadata' array");
      process.exit(1);
    }
    let routes;
    try {
      routes = generateCruddyRoutes(normalized);
    } catch (e) {
      console.error(`❌  Failed to generate routes from meta JSON: ${e.message}`);
      process.exit(1);
    }
    // For meta-json input, skip missing file checks and always codegen
    state.hasErrors = false;
    state.irrecoverableError = false;
    codegen(routes);
    return;
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
