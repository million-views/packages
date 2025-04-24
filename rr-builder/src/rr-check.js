#!/usr/bin/env node
// @ts-check

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 */

/**
 * @typedef {import("@m5nv/rr-builder").NavMeta} NavMeta
 */

/**
 * @typedef {RouteConfigEntry &
 * {
 * handle?: NavMeta
 * }
 * } ExtendedRouteConfigEntry
 */

/**
 * Type for the nodes in the final navigation tree used for codegen.
 * @typedef {Object} NavTreeNode
 * @property {string} id - The route ID, consistent with metaMap keys
 * @property {string | undefined} [label] - Nav label from handle
 * @property {string | undefined} [iconName] - Icon name from handle
 * @property {boolean | undefined} [end] - End flag from handle
 * @property {string | undefined] [group] - Group name from handle
 * // section?: string; // Section is hoisted to the top-level keys in navigationTree
 * @property {string} path - The full path of the route
 * @property {NavTreeNode[]} [children] - Child nodes
 */

/**
 * Dynamically import a module exporting a default RouteConfigEntry[].
 * Includes cache busting for watch mode.
 * @param {string} modulePath - Path to the routes file.
 * @returns {Promise<ExtendedRouteConfigEntry[]>}
 */
async function loadRoutes(modulePath) {
  const full = path.resolve(process.cwd(), modulePath);
  // Add cache busting query param to the URL to ensure fresh import in watch mode
  const url = pathToFileURL(full).href + `?update=${Date.now()}`;
  const mod = await import(url);
  // Expecting default export to be an array of RouteConfigEntry
  return /** @type {ExtendedRouteConfigEntry[]} */ (mod.default);
}

/**
 * Recursively count route ID occurrences for duplicate detection.
 * Uses the standard React Router ID derivation.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {Map<string, number>} countMap - Map to store ID counts.
 */
function collectIdsForDuplicateCheck(routes, countMap) {
  if (!Array.isArray(routes)) return;

  for (const r of routes) {
    // Use the standard ID derivation logic (id ?? file-based)
    const id = r.id ?? (r.file ? r.file.replace(/\.[^/.]+$/, "") : undefined);

    // Only count if a valid ID could be determined
    if (id) {
      countMap.set(id, (countMap.get(id) || 0) + 1);
    }

    // Recurse into children
    if (Array.isArray(r.children)) {
      collectIdsForDuplicateCheck(r.children, countMap);
    }
  }
}

/**
 * Print the route forest structure to the console.
 * Marks duplicates (*) or missing files (*) based on checks.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {Set<string>} dupIds - Set of duplicate IDs detected.
 * @param {boolean} showId - Whether to include route IDs in the output.
 * @param {boolean} showPath - Whether to include route paths in the output.
 * @param {boolean} checkFiles - Whether to check if component files exist.
 * @param {string} fileBaseDir - The base directory to resolve route file paths against.
 * @param {string} [basePath=""] - The path accumulated from parent routes.
 * @param {string} [prefix=""] - The prefix string for tree indentation.
 */
function printTree(
  routes,
  dupIds,
  showId,
  showPath,
  checkFiles,
  fileBaseDir,
  basePath = "",
  prefix = "",
) {
  if (!Array.isArray(routes)) return;

  routes.forEach((r, idx) => {
    const isLast = idx === routes.length - 1;
    const conn = isLast ? "└── " : "├── "; // Tree connection characters

    // Compute the full path for display
    let currentPath = basePath;
    if (typeof r.path === "string") {
      // Append current segment, handle root case, clean slashes
      currentPath = basePath === "" ? `/${r.path}` : `${basePath}/${r.path}`;
      currentPath = currentPath.replace(/\/{2,}/g, "/").replace(/\/+$/, "") ||
        "/"; // Clean multiple/trailing slashes, ensure '/' for root
    } else if (r.index) {
      // Index routes inherit parent path, ensure '/' for root index
      currentPath = basePath === "" ? "/" : basePath.replace(/\/+$/, "") || "/"; // Clean trailing slash on parent path
    } else {
      // Layout routes without a path segment inherit parent path
      currentPath = basePath.replace(/\/+$/, "") || "/"; // Clean trailing slash on parent path
    }

    // Determine the base path for children
    let nextBase;
    if (typeof r.path === "string") {
      // Children build on the current route's path segment
      nextBase = basePath === "" ? r.path : `${basePath}/${r.path}`;
      nextBase = nextBase.replace(/\/{2,}/g, "/").replace(/\/+$/, ""); // Clean and remove trailing slash for base path
    } else {
      // Children of layout/index routes without a path segment inherit the parent's base path
      nextBase = basePath.replace(/\/+$/, ""); // Just clean parent base path
    }

    // Get the label from handle or use a default
    const label = r.handle?.label || (r.index ? "(index)" : "(no label)"); // Indicate index routes

    // Use the standard ID derivation for display and checks
    const id = r.id ?? (r.file ? r.file.replace(/\.[^/.]+$/, "") : undefined);

    // Determine marking for duplicates or missing component files
    let mark = " ";
    if (id && dupIds.has(id)) { // Only mark duplicates if a valid ID was found
      mark = "*";
    }
    if (checkFiles && r.file) {
      const filePath = path.resolve(fileBaseDir, r.file);
      if (!fs.existsSync(filePath)) {
        mark = "*"; // Mark if file is missing
      }
    }

    // Build info parts (path and ID)
    const info = [];
    if (showPath) info.push(`path: ${currentPath}`);
    if (showId && id) info.push(`id: ${id}`); // Only show ID if a valid ID was determined
    const infoStr = info.length ? ` (${info.join(", ")})` : "";

    // Print the current node line
    console.log(`${prefix}${conn}${mark} ${label}${infoStr}`);

    // Recurse into children if they exist
    if (Array.isArray(r.children) && r.children.length) {
      const nextPrefix = prefix + (isLast ? "    " : "│   "); // Adjust prefix for children
      printTree(
        r.children,
        dupIds,
        showId,
        showPath,
        checkFiles,
        fileBaseDir,
        nextBase,
        nextPrefix,
      );
    }
  });
}

/**
 * Recursively builds the navigation tree by traversing the route configuration,
 * including only navigable nodes and preserving hierarchy.
 * @param {ExtendedRouteConfigEntry[]} routes - The list of route configuration objects at the current level.
 * @param {string} parentPath - The path accumulated from parent routes.
 * @returns {NavTreeNode[]} - An array of NavTreeNode for the current level of the final tree.
 */
function buildNavTreeRecursive(routes, parentPath = "") {
  if (!Array.isArray(routes)) {
    return [];
  }

  const currentLevelNavNodes = [];

  // Debug output to help troubleshoot - can be removed later
  console.log(`Processing ${routes.length} routes at path: '${parentPath}'`);

  for (const route of routes) {
    const hasPath = route.path !== undefined && route.path !== null;
    const segment = hasPath ? String(route.path) : "";
    const hasNonEmptyPath = segment !== "" && segment !== "/"; // Check if it has a specific path (not root)
    const isRootPath = segment === "" || segment === "/"; // Check if it's a root path ('/' or empty)
    const isLayoutRoute = isRootPath && !route.index; // Layout routes have root path but aren't index routes
    const hasChildren = Array.isArray(route.children) &&
      route.children.length > 0;
    const hasId = route.id !== undefined;
    const hasLabel = route.handle?.label !== undefined;

    // Calculate the full path for this node
    const fullPath = (parentPath === "" && segment === "")
      ? "/" // Root route without path segment
      : (parentPath === "" ? `/${segment}` : `${parentPath}/${segment}`); // Append segment
    const cleanedPath = fullPath.replace(/\/{2,}/g, "/").replace(/\/+$/, "") ||
      "/"; // Clean multiple/trailing slashes

    // Debug output - can be removed later
    console.log(
      `Route ${
        route.id || "unknown"
      }: path='${route.path}', cleanedPath='${cleanedPath}', isLayoutRoute=${isLayoutRoute}`,
    );

    // A route is considered part of the navigation tree if:
    // 1. It has a non-empty path (directly navigable), OR
    // 2. It is an index route (navigable to parent's path), OR
    // 3. It is a "container" route (layout or route) with:
    //    a. An ID (developer explicitly named it)
    //    b. Children (serves as a container for other routes)
    //    c. Either has a label or we can derive a label from its ID
    const isNavigable = hasNonEmptyPath || route.index === true ||
      (hasId && hasChildren);

    // Debug output - can be removed later
    console.log(
      `Route ${
        route.id || "unknown"
      }: isNavigable=${isNavigable}, hasLabel=${hasLabel}, hasId=${hasId}, hasChildren=${hasChildren}`,
    );

    // Determine the parent path for children recursive call
    const nextParentPath = hasPath ? cleanedPath : parentPath;

    // Recursively process children
    const childrenNavigableNodes = buildNavTreeRecursive(
      route.children || [],
      nextParentPath,
    );

    if (isNavigable) {
      // If the current route is navigable, create its node
      const id = route.id ??
        (route.file ? route.file.replace(/\.[^/.]+$/, "") : undefined) ??
        cleanedPath;

      // For the label, use the handle's label if available
      // If not, and this is a container route (with ID and children),
      // convert the ID to a display name (e.g., "user-profile" -> "User Profile")
      let label = route.handle?.label;
      if (!label && hasId && hasChildren) {
        // Convert ID to a display name (camelCase/kebab-case to Title Case)
        label = route.id
          .replace(/[-_]/g, " ") // Replace hyphens/underscores with spaces
          .replace(/([a-z])([A-Z])/g, "$1 $2") // Insert space before capital letters (camelCase)
          .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
      }

      /** @type {NavTreeNode} */
      const node = {
        id: id,
        label: label,
        iconName: route.handle?.iconName,
        end: route.handle?.end,
        group: route.handle?.group,
        section: route.handle?.section, // Keep section for top-level grouping
        path: cleanedPath,
        // Attach the navigable children nodes found recursively
        ...(childrenNavigableNodes.length > 0 &&
          { children: childrenNavigableNodes }), // Only add children property if not empty
      };

      // Debug output - can be removed later
      console.log(
        `Created node for ${id} with label "${label}", with ${childrenNavigableNodes.length} children`,
      );

      currentLevelNavNodes.push(node); // Add this navigable node to the current level's list
    } else {
      // If the current route is NOT navigable,
      // promote its children to the current level

      // Debug output - can be removed later
      console.log(
        `Route ${
          route.id || "unknown"
        } not navigable, promoting ${childrenNavigableNodes.length} children`,
      );

      currentLevelNavNodes.push(...childrenNavigableNodes); // Spread the children nodes into the current level
    }
  }

  return currentLevelNavNodes; // Return the array of navigable nodes for this level
}

/**
 * Generate a map of route ID → NavMeta for all routes in the tree.
 * This map is used to generate the `metaMap` artifact.
 * Uses the standard React Router ID derivation.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @returns {Map<string, NavMeta>} - The map of route IDs to NavMeta objects.
 */
export function createMetaMap(routes) {
  const map = new Map();
  if (!Array.isArray(routes)) return map;

  for (const r of routes) {
    // Use consistent ID derivation (id ?? file-based)
    const id = r.id ?? (r.file ? r.file.replace(/\.[^/.]+$/, "") : undefined);

    // Only add to map if a valid ID could be determined AND there is handle data
    if (id && r.handle && Object.keys(r.handle).length > 0) {
      // If duplicate IDs exist, the Map will store the handle from the last route processed with that ID.
      // The duplicate check feature warns the user about this.
      map.set(id, r.handle);
    }

    // Recurse into children
    if (Array.isArray(r.children)) {
      const childMap = createMetaMap(r.children);
      // Merge child metas into the parent map (later entries for the same ID overwrite earlier ones)
      for (const [k, v] of childMap) map.set(k, v);
    }
  }
  return map;
}

/**
 * Generate the JavaScript code file content.
 * @param {string} outFile - The path of the output file (used for type reference).
 * @param {string} now - ISO date string for the header comment.
 * @param {string} metaEntries - Stringified array of metaMap entries.
 * @param {Record<string, NavTreeNode[]>} sections - Grouped navigation tree data.
 * @returns {string} - The generated JavaScript code content.
 */
function codegenJsContent(outFile, now, metaEntries, sections) {
  const header = `// ⚠ AUTO-GENERATED — ${now} — do not edit`;
  // JSON.stringify is suitable for the tree structure in JS
  const sectionsStr = JSON.stringify(sections, null, 2);

  // Determine the relative path for the type reference in the JSDoc
  const outFileName = path.basename(outFile);

  const content = `${header}
// @ts-check
import { useMatches } from 'react-router';
/** @typedef {import("react-router").UIMatch} UIMatch */
/** @typedef {import('@m5nv/rr-builder').NavMeta} NavMeta */
/** @typedef {import('./${outFileName}').NavTreeNode} NavTreeNode */ // Reference the type definition below

/** @type {Map<string, NavMeta>} */
export const metaMap = new Map([
${metaEntries}
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 * @type {Record<string, NavTreeNode[]>}
 */
export const navigationTree = ${sectionsStr};

/**
 * Hook to hydrate matches with your navigation metadata
 * @returns {Array<UIMatch & { handle?: NavMeta }>} // Refined return type for better type inference
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

// Type definitions for reference (optional, good for JS users with JSDoc)
/**
 * @typedef {Object} NavTreeNode
 * @property {string} id - The route ID, consistent with metaMap keys
 * @property {string | undefined} [label] - Nav label from handle
 * @property {string | undefined} [iconName] - Icon name from handle
 * @property {boolean | undefined} [end] - End flag from handle
 * @property {string | undefined] [group] - Group name from handle
 * // section?: string; // Section is hoisted to the top-level keys
 * @property {string} path - The full path of the route
 * @property {NavTreeNode[]} [children] - Child nodes
 */
`;
  return content;
}

/**
 * Generate the TypeScript code file content.
 * @param {string} now - ISO date string for the header comment.
 * @param {string} metaEntries - Stringified array of metaMap entries.
 * @param {Record<string, NavTreeNode[]>} sections - Grouped navigation tree data.
 * @returns {string} - The generated TypeScript code content.
 */
function codegenTsContent(now, metaEntries, sections) {
  const header = `// ⚠ AUTO-GENERATED — ${now} — do not edit`;
  const sectionsStr = JSON.stringify(sections, null, 2); // JSON.stringify is fine for TS structure

  const content = `${header}
import { useMatches, type UIMatch } from 'react-router';
import type { NavMeta } from "@m5nv/rr-builder";

/**
 * Processed navigation tree node.
 * Note: The 'section' property is hoisted and not present in the final tree nodes.
 */
export interface NavTreeNode {
  id: string;
  label?: string;
  iconName?: string;
  end?: boolean;
  group?: string;
  // section?: string; // Section is hoisted to the top-level keys
  path: string;
  children?: NavTreeNode[];
}


export const metaMap = new Map<string, NavMeta>([
${metaEntries}
]);

/**
 * Processed navigation tree grouped by section.
 * Keys are section names, values are arrays of tree nodes.
 * Any route node without a 'section' prop defaults to the 'main' section.
 */
export const navigationTree: Record<string, NavTreeNode[]> = ${sectionsStr};

/**
 * Hook to hydrate matches with your navigation metadata
 */
export function useHydratedMatches()  : Array<UIMatch & { handle?: NavMeta }> { // Refined return type
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

/**
 * Generate nav code artifact based on routes and write it to a file.
 * This function orchestrates the tree building, meta map creation, grouping, and code generation.
 * @param {string} outFile - The file path to write the output code.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 */
function codegen(outFile, routes) {
  try {
    // Add pre-processing step: Inspect route structure before building the tree
    console.log("\n--- Route Structure Debug ---");
    const debugRouteStructure = (routes, level = 0) => {
      if (!Array.isArray(routes)) return;

      const indent = " ".repeat(level * 2);
      routes.forEach((route) => {
        const hasPath = route.path !== undefined && route.path !== null;
        const segment = hasPath ? String(route.path) : "";
        const hasLabel = route.handle?.label;

        console.log(
          `${indent}Route: id=${
            route.id || "unknown"
          }, path='${segment}', hasLabel=${!!hasLabel}`,
        );

        if (Array.isArray(route.children) && route.children.length > 0) {
          console.log(`${indent}Children:`);
          debugRouteStructure(route.children, level + 1);
        }
      });
    };

    debugRouteStructure(routes);

    // 1. Build the navigation tree by processing the top-level routes
    console.log("\n--- Building Navigation Tree ---");
    const navTree = buildNavTreeRecursive(routes, "");

    console.log("\n--- Final Built Nav Tree (before grouping) ---");
    console.log(JSON.stringify(navTree, null, 2)); // Log the built tree structure

    // 2. Create the metaMap from the original routes (includes all routes with handles)
    const metamap = createMetaMap(routes);
    // Format metaMap entries for code generation
    const metaEntries = [...metamap.entries()].map(
      ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
    ).join("\n");

    // 3. Group the top-level navigation tree nodes by 'section' property.
    /** @type {Record<string, NavTreeNode[]>} */
    const sections = {};

    navTree.forEach((topLevelNode) => {
      // Use the section from the node, defaulting to 'main' if not present.
      // This is where the constraint on the 'section' prop is applied for grouping.
      const sec = topLevelNode.section || "main";
      sections[sec] = sections[sec] || [];

      // Create a copy of the top-level node, removing the 'section' property
      // as it's used for the top-level key in the generated output.
      // Use destructuring to ensure we create a proper shallow copy that preserves children
      const { section, ...nodeWithoutSection } = topLevelNode;

      // Add the node (with its children already nested) to the appropriate section array
      sections[sec].push(nodeWithoutSection);
    });

    console.log("\n--- Final Grouped Sections ---");
    console.log(JSON.stringify(sections, null, 2)); // Log the grouped sections

    // Ensure sections with no nodes are not included
    for (const key in sections) {
      if (sections[key].length === 0) {
        delete sections[key];
      }
    }

    // 4. Generate the code content (JS or TS)
    const ext = path.extname(outFile).toLowerCase();
    const now = new Date().toISOString();
    let codeContent;

    if (ext === ".ts") {
      codeContent = codegenTsContent(now, metaEntries, sections);
    } else {
      codeContent = codegenJsContent(outFile, now, metaEntries, sections);
    }

    // 5. Write the code to the output file
    fs.writeFileSync(outFile, codeContent, "utf8");
    console.error(`✏️ Generated nav module: ${outFile}`);

    // 6. Debug: Verify the written content
    const writtenContent = fs.readFileSync(outFile, "utf8");
    const treeStart = writtenContent.indexOf("export const navigationTree =");
    const treeEnd = writtenContent.indexOf(";", treeStart);
    if (treeStart !== -1 && treeEnd !== -1) {
      const treeJson = writtenContent.substring(
        treeStart + "export const navigationTree =".length,
        treeEnd,
      ).trim();
      try {
        const parsedTree = JSON.parse(treeJson);
        console.log("\n--- Verification: Final Tree in Generated File ---");
        console.log(
          "Tree has hierarchy:",
          Object.values(parsedTree).some((section) =>
            section.some((node) => node.children && node.children.length)
          ),
        );
      } catch (e) {
        console.error("Error parsing tree from generated file:", e.message);
      }
    }
  } catch (error) {
    console.error("Error during code generation:", error.message);
    // Don't exit here, allow watch mode to continue if possible
  }
}

/** Main CLI entry point */
async function main() {
  // Remove node executable path and script path from arguments
  const argv = process.argv.slice(2);

  // Basic argument parsing
  const file = argv[0]; // The first argument is expected to be the routes file path
  if (!file) {
    console.error(
      "Usage: node script.js <routes.js> [--out <file>] [--watch] [--show-id] [--show-path] [--check-files]",
    );
    process.exit(1);
  }

  // Flags are everything after the file name
  const flags = argv.slice(1);

  // Determine codegen/watch flags
  const outIdx = flags.indexOf("--out");
  const outFile = outIdx >= 0 && outIdx + 1 < flags.length
    ? flags[outIdx + 1]
    : null;
  const watch = flags.includes("--watch");

  // Determine print/check flags
  const showId = flags.includes("--show-id");
  const showPath = flags.includes("--show-path");
  const checkFiles = flags.includes("--check-files");

  // Determine mode: Codegen/Watch OR Check/Print
  // Codegen mode is active if --out or --watch is present.
  // Otherwise, it's Check/Print mode.
  const isCodegenMode = outFile !== null || watch;

  try {
    // Determine the directory of the routes file for relative file checks if needed
    const routesFilePath = path.resolve(process.cwd(), file);
    const baseDir = path.dirname(routesFilePath);

    if (isCodegenMode) {
      // --- Codegen Mode ---
      if (!outFile && watch) {
        console.error("Error: --watch requires --out <file>");
        process.exit(1);
      }

      // Load routes initially
      let currentRoutes = await loadRoutes(file);

      // Perform initial codegen if output file is specified
      if (outFile) {
        codegen(outFile, currentRoutes);
      }

      // Set up watch mode if requested
      if (watch) {
        console.error(`👀 Watching ${file} for changes...`);
        // Calculate initial hash of the routes structure
        let lastHash = crypto.createHash("sha256").update(
          JSON.stringify(currentRoutes),
        )
          .digest("hex");

        // Watch the routes file for changes
        fs.watch(routesFilePath, async (evt) => {
          // Only react to 'change' events
          if (evt !== "change") return;

          // Add a small delay to allow file system to settle and file to be fully written
          setTimeout(async () => {
            try {
              // Load the updated routes
              const updatedRoutes = await loadRoutes(file);
              // Calculate hash of the updated routes structure
              const hash = crypto.createHash("sha256").update(
                JSON.stringify(updatedRoutes),
              )
                .digest("hex");

              // If the structure has changed (hash is different)
              if (hash !== lastHash) {
                lastHash = hash; // Update the last hash
                console.error("🔄 Change detected, regenerating...");
                // Regenerate code if an output file is specified
                if (outFile) {
                  codegen(outFile, updatedRoutes);
                }
              }
            } catch (readErr) {
              // Log error but continue watching
              console.error(
                `Error reading file during watch: ${readErr.message}`,
              );
            }
          }, 100); // 100ms delay
        });
      }
    } else {
      // --- Check/Print Mode ---

      // Load routes
      let routes = await loadRoutes(file);

      // Flatten a potential root wrapper route if it exists and has no label or path
      // This mimics the behavior of the first script's main function for cleaner printing
      if (
        routes.length === 1 &&
        !routes[0].handle?.label &&
        !routes[0].path && // Check if root wrapper has no path segment
        Array.isArray(routes[0].children)
      ) {
        routes = routes[0].children;
      }

      // 2) Collect duplicate IDs for reporting
      const idMap = new Map();
      collectIdsForDuplicateCheck(routes, idMap);
      // Filter for IDs that appear more than once
      const dupIds = new Set(
        [...idMap.entries()].filter(([, count]) => count > 1).map(([id]) => id),
      );

      // Report duplicate IDs if found
      if (dupIds.size > 0) {
        console.error("⚠ Duplicate route IDs detected:");
        for (const idVal of dupIds) {
          console.error(`  • ${idVal} appears ${idMap.get(idVal)} times`);
        }
        console.error("Tree marks duplicates or missing files with *");
      } else {
        console.error("✅ No duplicate route IDs found.");
      }

      // 3) Print the route forest structure
      console.log("\nRoute Tree:");
      printTree(routes, dupIds, showId, showPath, checkFiles, baseDir);

      // Add a legend if any markers were used
      if (checkFiles || dupIds.size > 0) {
        console.error("\nLegend:");
        if (checkFiles && dupIds.size > 0) {
          console.error("(*) indicates duplicate ID or missing file.");
        } else if (checkFiles) {
          console.error("(*) indicates missing file.");
        } else if (dupIds.size > 0) {
          console.error("(*) indicates duplicate ID.");
        }
      }
    }
  } catch (err) {
    // Catch errors during initial load or setup
    console.error("Error:", err.message);
    process.exit(1); // Exit on critical error in main execution path
  }
}

// Execute the main function
main();
