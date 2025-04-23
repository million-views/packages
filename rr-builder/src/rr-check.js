#!/usr/bin/env node
// @ts-check

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 */

/**
 * Dynamically import a module exporting a default RouteConfigEntry[] and return it.
 * @param {string} modulePath
 * @returns {Promise<RouteConfigEntry[]>}
 */
async function loadRoutes(modulePath) {
  const full = path.resolve(process.cwd(), modulePath);
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
 * Print the route forest, marking duplicates or missing files with '*'.
 * Optionally include route IDs and/or paths.
 * @param {RouteConfigEntry[]} routes
 * @param {Set<string>} dupIds
 * @param {boolean} showId
 * @param {boolean} showPath
 * @param {boolean} checkFiles
 * @param {string} fileBaseDir       // base directory of the routes file
 * @param {string} [basePath]
 * @param {string} [prefix]
 */
function printTree(
  routes,
  dupIds,
  showId,
  showPath,
  checkFiles,
  fileBaseDir,
  basePath = "",
  prefix = ""
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

    // @ts-ignore: custom handle field doesn't exist in RouteConfigEntry (we know!)
    const label = r.handle?.label || "(no label)";
    const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");

    // Determine marking for duplicates or missing component files
    let mark = dupIds.has(id) ? "*" : " ";
    if (checkFiles) {
      const filePath = path.resolve(fileBaseDir, r.file);
      if (!fs.existsSync(filePath)) {
        mark = "*";
      }
    }

    // Build info parts
    const info = [];
    if (showPath) info.push(`path: ${currentPath}`);
    if (showId) info.push(`id: ${id}`);
    const infoStr = info.length ? ` (${info.join(", ")})` : "";

    console.log(`${prefix}${conn}${mark} ${label}${infoStr}`);

    if (Array.isArray(r.children) && r.children.length) {
      const nextPrefix = prefix + (isLast ? "    " : "│   ");
      printTree(
        r.children,
        dupIds,
        showId,
        showPath,
        checkFiles,
        fileBaseDir,
        nextBase,
        nextPrefix
      );
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error(
      "Usage: rr-check <routes.js> [--show-id] [--show-path] [--check-files]"
    );
    process.exit(1);
  }

  const [file, ...flags] = args;
  const showId = flags.includes("--show-id");
  const showPath = flags.includes("--show-path");
  const checkFiles = flags.includes("--check-files");

  // Determine the directory of the routes file for relative file checks
  const routesFilePath = path.resolve(process.cwd(), file);
  const baseDir = path.dirname(routesFilePath);

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
      [...idMap.entries()].filter(([, count]) => count > 1).map(([id]) => id)
    );
    if (dupIds.size) {
      console.error("⚠ Duplicate route IDs detected:");
      for (const idVal of dupIds) {
        console.error(`  • ${idVal} appears ${idMap.get(idVal)} times`);
      }
      console.error("Tree marks duplicates or missing files with *");
    }

    // 3) Print forest
    printTree(routes, dupIds, showId, showPath, checkFiles, baseDir);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

// go!
await main();
