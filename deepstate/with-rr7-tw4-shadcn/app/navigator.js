#!/usr/bin/env deno run --unstable-sloppy-imports

import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * @typedef {object} RouteConfigEntry
 * @property {string} [id]
 * @property {string} file
 * @property {string} [path]
 * @property {boolean} [index]
 * @property {boolean} [caseSensitive]
 * @property {{ label?: string }} [handle]
 * @property {Array<RouteConfigEntry>} [children]
 */

/**
 * Dynamically import a module exporting a default RouteConfigEntry[] and return it.
 * @param {string} modulePath
 * @returns {Promise<RouteConfigEntry[]>}
 */
async function loadRoutes(modulePath) {
  const full = path.resolve(Deno.cwd(), modulePath);
  const url = pathToFileURL(full).href;
  const mod = await import(url);
  return /** @type {RouteConfigEntry[]} */ (mod.default);
}

/**
 * Recursively count route ID occurrences.
 * @param {RouteConfigEntry[]} routes
 * @param {Map<string, number>} countMap
 */
function collectIds(routes, countMap) {
  for (const r of routes) {
    const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");
    countMap.set(id, (countMap.get(id) || 0) + 1);
    if (Array.isArray(r.children)) {
      collectIds(r.children, countMap);
    }
  }
}

/**
 * Print the route forest, marking duplicates with '*' before the label.
 * Optionally include route IDs and/or paths.
 * @param {RouteConfigEntry[]} routes
 * @param {Set<string>} dupIds
 * @param {boolean} showId
 * @param {boolean} showPath
 * @param {string} basePath
 * @param {string} prefix
 */
function printTree(
  routes,
  dupIds,
  showId,
  showPath,
  basePath = "",
  prefix = "",
) {
  routes.forEach((r, idx) => {
    const isLast = idx === routes.length - 1;
    const conn = isLast ? "└── " : "├── ";

    // Compute current path
    let currentPath;
    if (typeof r.path === "string") {
      currentPath = basePath ? `/${basePath}/${r.path}` : `/${r.path}`;
    } else if (r.index) {
      currentPath = basePath ? `/${basePath}` : "/";
    }

    // Determine next base path for children
    let nextBase;
    if (typeof r.path === "string") {
      nextBase = basePath ? `${basePath}/${r.path}` : r.path;
    } else if (r.index) {
      nextBase = basePath;
    } else {
      nextBase = basePath;
    }

    const label = r.handle?.label || "(no label)";
    const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");
    const mark = dupIds.has(id) ? "*" : " ";

    // Build info parts
    const info = [];
    if (showPath) info.push(`path: ${currentPath}`);
    if (showId) info.push(`id: ${id}`);
    const infoStr = info.length ? ` (${info.join(", ")})` : "";

    console.log(`${prefix}${conn}${mark} ${label}${infoStr}`);

    if (Array.isArray(r.children) && r.children.length) {
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      printTree(r.children, dupIds, showId, showPath, nextBase, nextPrefix);
    }
  });
}

(async () => {
  const args = Deno.args;
  if (args.length < 1) {
    console.error("Usage: navigator.js <routes.ts> [--show-id] [--show-path]");
    Deno.exit(1);
  }

  const file = args[0];
  const showId = args.includes("--show-id");
  const showPath = args.includes("--show-path");

  try {
    // 1) Load and flatten routes
    let routes = await loadRoutes(file);
    if (
      routes.length === 1 &&
      !routes[0].handle?.label &&
      Array.isArray(routes[0].children)
    ) {
      routes = routes[0].children;
    }

    // 2) Collect duplicate IDs
    const idMap = new Map();
    collectIds(routes, idMap);
    const dupIds = new Set(
      [...idMap.entries()]
        .filter(([, count]) => count > 1)
        .map(([id]) => id),
    );
    if (dupIds.size) {
      console.error("⚠ Duplicate route IDs detected:");
      for (const idVal of dupIds) {
        console.error(`  • ${idVal} appears ${idMap.get(idVal)} times`);
      }
      console.error("Tree marks duplicates with *");
    }

    // 3) Print forest
    printTree(routes, dupIds, showId, showPath);
  } catch (err) {
    console.error("Error:", err.message);
    Deno.exit(1);
  }
})();
