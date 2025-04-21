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
 * Print the route tree, marking duplicates with '*' before the label.
 * Optionally include route IDs if showId flag is true.
 * @param {RouteConfigEntry[]} routes
 * @param {Set<string>} dupIds
 * @param {boolean} showId
 * @param {string} [prefix='']
 */
function printTree(routes, dupIds, showId, prefix = "") {
  routes.forEach((r, idx) => {
    const isLast = idx === routes.length - 1;
    const conn = isLast ? "└── " : "├── ";
    const label = r.handle?.label || "(no label)";
    const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");
    const mark = dupIds.has(id) ? "*" : " ";
    const idPart = showId ? ` (id: ${id})` : "";
    console.log(`${prefix}${conn}${mark} ${label}${idPart}`);
    if (Array.isArray(r.children) && r.children.length) {
      const next = prefix + (isLast ? "    " : "│   ");
      printTree(r.children, dupIds, showId, next);
    }
  });
}

async function main() {
  const args = Deno.args;
  if (args.length < 1) {
    console.error("Usage: navigator.js <routes.ts> [--show-id]");
    Deno.exit(1);
  }
  const file = args[0];
  const showId = args.includes("--show-id");
  try {
    // 1) Load routes
    let routes = await loadRoutes(file);
    // Flatten single unlabeled root to print forest
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
      for (const id of dupIds) {
        console.error(`  • ${id} appears ${idMap.get(id)} times`);
      }
      console.error("Tree marks duplicates with *");
    }

    // 3) Print tree
    printTree(routes, dupIds, showId);
  } catch (err) {
    console.error("Error:", err.message);
    Deno.exit(1);
  }
}

await main();
