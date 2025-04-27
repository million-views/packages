#!/usr/bin/env node
// @ts-check

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";

// =============================================================================
// Configuration & Types
// =============================================================================

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 */

/**
 * @typedef {import("@m5nv/rr-builder").NavMeta} NavMeta
 */

/**
 * @typedef {RouteConfigEntry & {
 *   handle?: NavMeta
 *   normalizedPath?: string
 * }} ExtendedRouteConfigEntry
 */

/**
 * Type for the nodes in the final navigation tree used for codegen.
 * @typedef {Object} NavTreeNode
 * @property {string} [id] - The route ID, consistent with metaMap keys
 * @property {string | undefined} [label] - Nav label from handle
 * @property {string | undefined} [iconName] - Icon name from handle
 * @property {boolean | undefined} [end] - End flag from handle
 * @property {string | undefined} [group] - Group name from handle
 * @property {string | undefined} [section] - Section name from handle
 * @property {string} path - The full path of the route
 * @property {NavTreeNode[]} [children] - Child nodes
 */

/**
 * @typedef {Object} ErrorReport
 * @property {string[]} missingFiles - Array of missing component files
 * @property {Set<string>} missingFileIds - Set of IDs of routes with missing files
 * @property {Map<string, number>} duplicateIds - Map of duplicate IDs with occurrence counts
 * @property {boolean} hasErrors - Whether any errors were detected
 */

// Global CLI options with default values
const options = {
  /** @type {string | null} */
  file: null, // Input routes file path
  /** @type {string | null} */
  outFile: null, // Output file path for code generation
  watch: false, // Watch mode flag
  showRouteTree: false, // Show raw routes tree
  showNavTree: false, // Show navigation tree
  showId: false, // Show route IDs in trees
  showPath: false, // Show paths in trees
};

// Global App State
const AppState = {
  /** @type {Set<string> | null} */
  dupIds: null,
  /** @type {Map<string, number> | null} */
  duplicateIds: null,
  /** @type {string[] | null} */
  missingFiles: null,
  /** @type {Set<string> | null} */
  missingFileIds: null,
  /** @type {string | null} */
  routesFilePath: null,
  /** @type {string | null} */
  baseDir: null,
  /** @type {boolean} */
  hasErrors: false,
};

// =============================================================================
// Core Utility Functions
// =============================================================================

/**
 * Simple debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Converts a string to PascalCase.
 * @param {string} str - The input string.
 * @returns {string} The string in PascalCase.
 */
function toPascalCase(str) {
  if (!str) return "";
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")) // Remove hyphens/underscores and capitalize next char
    .replace(/^(.)/, (_, c) => c.toUpperCase()); // Capitalize the first character
}

/**
 * Determines the marker string for a tree node based on duplicate and missing file status.
 * Shows both markers if applicable.
 * @param {string} [node_id] - The id of the node (either ExtendedRouteConfigEntry or NavTreeNode).
 * @returns {string} - The marker string (" ", "*", "!", or "*!").
 */
function getMarker(node_id) {
  let mark = " ";
  // Use the node's ID (either from NavTreeNode or ExtendedRouteConfigEntry)
  if (node_id && AppState.dupIds && AppState.missingFileIds) {
    const isDuplicate = AppState.dupIds.has(node_id);
    const isMissingFile = AppState.missingFileIds.has(node_id);

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

// =============================================================================
// Route Processing Functions
// =============================================================================

/**
 * Dynamically import a module exporting a default RouteConfigEntry[].
 * Includes cache busting for watch mode.
 * @returns {Promise<ExtendedRouteConfigEntry[]>}
 */
async function loadRoutes() {
  // Add cache busting query param to the URL to ensure fresh import in watch mode
  const url =
    pathToFileURL(/**@type {string} */ (AppState.routesFilePath)).href +
    `?update=${Date.now()}`;
  try {
    const mod = await import(url);
    // Expecting default export to be an array of RouteConfigEntry
    if (!Array.isArray(mod.default)) {
      console.error(
        `Error: Routes file ${AppState.routesFilePath} does not export a default array.`,
      );
      // Return an empty array to allow subsequent checks to run without crashing
      return [];
    }
    return /** @type {ExtendedRouteConfigEntry[]} */ (mod.default);
  } catch (error) {
    console.error(
      `Error loading routes file ${AppState.routesFilePath}: ${error.message}`,
    );
    // Return an empty array on load failure to prevent crashes in subsequent steps
    return [];
  }
}

/**
 * Extract all route data and normalize paths for tree building.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {string} [basePath=""] - The base path for the current level.
 * @returns {ExtendedRouteConfigEntry[]} - Array of routes with normalized paths.
 */
function extractRoutesWithNormalizedPaths(routes, basePath = "") {
  if (!Array.isArray(routes)) return [];

  const result = [];

  for (const route of routes) {
    // Calculate the full path for this route
    let path = route.path !== undefined ? String(route.path) : "";
    let fullPath;

    if (route.index && basePath) {
      // Index routes inherit parent path
      fullPath = basePath;
    } else if (path.startsWith("/")) {
      // Absolute path - use as is
      fullPath = path;
    } else if (path) {
      // Relative path - append to base path
      fullPath = basePath === "" ? `/${path}` : `${basePath}/${path}`;
    } else {
      // Layout routes with empty path - use parent path
      fullPath = basePath;
    }

    // Clean up path (remove double slashes, trailing slash)
    fullPath = fullPath.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";

    // Get the ID using standard derivation
    const id = route.id ??
      (route.file ? route.file.replace(/\.[^/.]+$/, "") : undefined);

    // Get or derive label - PRIMARILY FROM PATH SEGMENT, NOT ID
    let label = route.handle?.label;
    if (!label) {
      // Special case for root path "/"
      if (fullPath === "/") {
        label = "Home";
      } else {
        // Derive label from path segment for non-root paths
        const segments = fullPath.split("/").filter(Boolean);
        if (segments.length > 0) {
          const lastSegment = segments[segments.length - 1];
          label = toPascalCase(lastSegment);
        } else {
          // Fallback only if all else fails (should rarely happen)
          label = "(no label)";
        }
      }
    }

    // Only include routes with actual paths (not layout routes with path="/")
    // Layout routes are "/" and not index routes
    const isLayoutRoute = (path === "/" || path === "") && !route.index;

    // Include if it's not a layout route or it's an index route or has a label
    if (!isLayoutRoute || route.index || label) {
      // Create a normalized route object with the correct path
      const normalizedRoute = {
        ...route,
        path: fullPath,
        normalizedPath: fullPath, // Store the normalized path separately
      };

      if (id) normalizedRoute.id = id;
      if (label) normalizedRoute.handle = { ...route.handle, label };

      result.push(normalizedRoute);
    }

    // Process children recursively, passing the current full path as the base
    if (Array.isArray(route.children)) {
      result.push(
        ...extractRoutesWithNormalizedPaths(route.children, fullPath),
      );
    }
  }

  return result;
}

/**
 * Flattens the routes into a map keyed by path for easier tree building.
 * @param {ExtendedRouteConfigEntry[]} routes - The routes with normalized paths.
 * @returns {Record<string, ExtendedRouteConfigEntry>} - Map of routes keyed by path.
 */
function flattenRoutes(routes) {
  /** @type {Record<string, ExtendedRouteConfigEntry>} */
  const flatMap = {};

  // First pass: collect all routes by their normalized path
  for (const route of routes) {
    if (route.normalizedPath) {
      // For index routes at the same path, prioritize the one with the label
      if (flatMap[route.normalizedPath]) {
        // If current route has a label and existing one doesn't, replace it
        if (
          route.handle?.label && !flatMap[route.normalizedPath].handle?.label
        ) {
          flatMap[route.normalizedPath] = route;
        } // If both or neither have labels, prioritize index routes
        else if (route.index && !flatMap[route.normalizedPath].index) {
          flatMap[route.normalizedPath] = route;
        }
      } else {
        flatMap[route.normalizedPath] = route;
      }
    }
  }

  return flatMap;
}

// =============================================================================
// Error Checking Functions
// =============================================================================

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
 * Recursively collect missing files.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 */
function collectMissingFiles(
  routes,
) {
  if (!Array.isArray(routes)) return;
  if (!AppState.baseDir || !AppState.missingFileIds || !AppState.missingFiles) {
    return;
  }
  for (const r of routes) {
    if (r.file) {
      const filePath = path.resolve(AppState.baseDir, r.file);
      if (!fs.existsSync(filePath)) {
        AppState.missingFiles.push(r.file);

        // Store the ID of the route with missing file
        const id = r.id ?? r.file.replace(/\.[^/.]+$/, "");
        if (id) {
          AppState.missingFileIds.add(id);
        }
      }
    }

    // Recurse into children
    if (Array.isArray(r.children)) {
      collectMissingFiles(
        r.children,
      );
    }
  }
}

/**
 * Check for errors in routes configuration.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @returns {boolean}} - true if errors were found
 */
function checkForErrors(routes) {
  // !! reset fields that contain analysis data
  // Collect duplicate IDs
  const idMap = new Map();
  collectIdsForDuplicateCheck(routes, idMap);
  AppState.duplicateIds = new Map(
    [...idMap.entries()].filter(([, count]) => count > 1),
  );

  // Collect missing files
  AppState.missingFiles = [];
  AppState.missingFileIds = new Set();

  collectMissingFiles(routes);
  AppState.dupIds = new Set([...AppState.duplicateIds.keys()]);
  AppState.hasErrors = AppState.duplicateIds.size > 0 ||
    AppState.missingFiles.length > 0;

  return AppState.hasErrors;
}

/**
 * Print error report.
 */
function printErrorReport() {
  if (!AppState.hasErrors) {
    console.log("✅ No errors detected");
    return;
  }

  if (!AppState.duplicateIds || !AppState.missingFiles) {
    console.log("⚠️ Out of sync!");
    return;
  }

  // Always show error count summary
  const dupCount = AppState.duplicateIds.size;
  const missingCount = AppState.missingFiles.length;

  if (dupCount > 0) {
    console.error(
      `⚠️ Found ${dupCount} duplicate route ID${dupCount > 1 ? "s" : ""}`,
    );
  }

  if (missingCount > 0) {
    console.error(
      `⚠️ Found ${missingCount} missing component file${
        missingCount > 1 ? "s" : ""
      }`,
    );
  }

  // Show detailed errors only in verbose mode
  if (dupCount > 0) {
    console.error("\nDuplicate IDs:");
    for (const [id, count] of AppState.duplicateIds.entries()) {
      console.error(`  * ${id} appears ${count} times`);
    }
  }

  if (missingCount > 0) {
    console.error("\nMissing component files:");
    for (const file of AppState.missingFiles) {
      console.error(`  ! ${file}`);
    }
  }

  // printLegend();
}

// =============================================================================
// Tree Building Functions
// =============================================================================

/**
 * Builds a hierarchical tree structure using path-based organization.
 * @param {Record<string, ExtendedRouteConfigEntry>} routesMap - Map of routes keyed by path.
 * @returns {NavTreeNode[]} - Array of root level navigation tree nodes.
 */
function buildNavigationTree(routesMap) {
  // Root structure to hold all tree nodes
  const root = { children: {} };

  // Get all paths and sort them by path depth and then alphabetically
  const paths = Object.keys(routesMap).sort((a, b) => {
    const aDepth = a.split("/").filter(Boolean).length;
    const bDepth = b.split("/").filter(Boolean).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.localeCompare(b);
  });

  // Process each path to build the tree
  for (const path of paths) {
    const route = routesMap[path];
    if (!route) continue;

    // Skip processing the root path here, we'll handle it separately
    if (path === "/") continue;

    // Split the path into segments
    const segments = path.split("/").filter(Boolean);

    // Start at the root
    let currentNode = root;
    let currentPath = "";

    // Process each segment in the path
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;

      // Determine if this is the final segment
      const isFinalSegment = i === segments.length - 1;

      // Check if node for this segment already exists
      if (!currentNode.children[segment]) {
        // Node doesn't exist, create it
        if (isFinalSegment) {
          // If final segment, use data from the route
          currentNode.children[segment] = createNavTreeNode(route);
        } else {
          // For intermediate segments, create a placeholder
          // First check if we have a route definition for this intermediate path
          const intermediateRoute = routesMap[currentPath];
          if (intermediateRoute) {
            // Use data from the existing route
            currentNode.children[segment] = createNavTreeNode(
              intermediateRoute,
            );
            // Ensure it has a children object
            currentNode.children[segment].children = {};
          } else {
            // Create generic placeholder with derived label
            currentNode.children[segment] = {
              path: currentPath,
              label: toPascalCase(segment),
              children: {},
            };
          }
        }
      } else if (isFinalSegment) {
        // Node exists but we're at final segment, update with route data if needed
        // If this is an index route, it might have more specific data
        if (route.index) {
          Object.assign(
            currentNode.children[segment],
            createNavTreeNode(route),
          );
        }
      }

      // Move to next level in the tree
      currentNode = currentNode.children[segment];

      // Initialize children object if it doesn't exist
      if (!currentNode.children) {
        currentNode.children = {};
      }
    }
  }

  // Convert the object-based tree to array-based tree for the final output
  const result = [];

  // Handle root node if it exists
  if (routesMap["/"]) {
    result.push(createNavTreeNode(routesMap["/"]));
  }

  // Convert child objects to arrays
  function convertToArrays(node) {
    if (!node.children || Object.keys(node.children).length === 0) {
      delete node.children;
      return node;
    }

    // Convert children object to sorted array
    const childrenArray = Object.entries(node.children)
      .map(([, child]) => convertToArrays(child))
      .sort((a, b) => (a.label?.localeCompare(b.label || "") || 0));

    node.children = childrenArray;
    return node;
  }

  // Process each top-level child
  const topLevelChildren = Object.values(root.children);
  for (const child of topLevelChildren) {
    result.push(convertToArrays(child));
  }

  return result;
}

/**
 * Creates a NavTreeNode from a route.
 * @param {ExtendedRouteConfigEntry} route - The route to convert.
 * @returns {NavTreeNode} - The navigation tree node.
 */
function createNavTreeNode(route) {
  /** @type {NavTreeNode} */
  const node = {
    path: route.normalizedPath || route.path || "",
  };

  // Only add properties that exist
  if (route.id) node.id = route.id;
  if (route.handle?.label) node.label = route.handle.label;
  if (route.handle?.iconName) node.iconName = route.handle.iconName;
  if (route.handle?.end !== undefined) node.end = route.handle.end;
  if (route.handle?.group) node.group = route.handle.group;
  if (route.handle?.section) node.section = route.handle.section;

  return node;
}

/**
 * Group navigation nodes by section.
 * @param {NavTreeNode[]} nodes - Array of navigation tree nodes.
 * @returns {Record<string, NavTreeNode[]>} - Map of nodes grouped by section.
 */
function groupNodesBySection(nodes) {
  /** @type {Record<string, NavTreeNode[]>} */
  const sections = {};

  for (const node of nodes) {
    const section = node.section || "main";

    if (!sections[section]) {
      sections[section] = [];
    }

    // Remove section from node as it's hoisted to the sections map
    const { section: _, ...nodeWithoutSection } = node;

    sections[section].push(/** @type {NavTreeNode} */ (nodeWithoutSection));
  }

  // Clean up the nodes to remove empty children arrays
  const cleanupNodes = (nodesArray) => {
    if (!Array.isArray(nodesArray)) return;

    for (const node of nodesArray) {
      if (node.children && node.children.length === 0) {
        delete node.children;
      } else if (node.children) {
        cleanupNodes(node.children);
      }
    }
  };

  // Clean up all sections
  for (const section in sections) {
    cleanupNodes(sections[section]);
  }

  return sections;
}

// function printLegend() {
//   if (!AppState.dupIds || !AppState.missingFileIds || !AppState.missingFiles) {
//     return;
//   }

//   // Only show legend if we have duplicates or missing files
//   if (AppState.dupIds.size > 0 || AppState.missingFileIds.size > 0) {
//     console.log("\nLegend:");
//     if (AppState.dupIds.size > 0) {
//       console.log("(*)  - Indicates duplicate ID");
//     }
//     if (AppState.missingFileIds.size > 0) {
//       console.log("(!)  - Indicates missing file");
//     }
//     if (AppState.dupIds.size > 0 && AppState.missingFileIds.size > 0) {
//       console.log("(*!) - Indicates both duplicate ID and missing file");
//     }
//   }
// }

/**
 * Print the navigation tree.
 * @param {NavTreeNode[]} tree - The navigation tree.
 */
function printNavigationTree(tree) {
  console.log("\nNavigation Tree:");

  /**
   * Internal recursive function to print tree nodes
   * @param {NavTreeNode[]} nodes - The nodes to print
   * @param {string} prefix - The prefix for indentation
   */
  function printNodes(nodes, prefix = "") {
    if (!Array.isArray(nodes)) return;

    nodes.forEach((node, idx) => {
      const isLast = idx === nodes.length - 1;
      const connector = isLast ? "└── " : "├── ";
      // Print the current line
      console.log(
        `${prefix}${connector}${Node2String(node)}`,
      );

      // Process children
      if (Array.isArray(node.children) && node.children.length > 0) {
        const nextPrefix = prefix + (isLast ? "    " : "│   ");
        printNodes(node.children, nextPrefix);
      }
    });
  }

  // Start printing from the root
  printNodes(tree);
}
/**
 * Converts a navigation node to a formatted string representation.
 * @param {Object} node - The navigation node to format.
 * @param {string} node.path - The path of the node.
 * @param {string} [node.id] - The optional ID of the node.
 * @param {string} [node.label] - The optional label of the node.
 * @returns {string} The formatted string representation of the node.
 */
function Node2String({ label, path, id }) {
  const mark = getMarker(id);
  const info = [];
  if (options.showPath) info.push(`path: ${path}`);
  if (options.showId && id) info.push(`id: ${id}`);
  const infoStr = info.length ? ` [${info.join(", ")}]` : "";
  label = label || "(no label)";
  return `${label}${mark}${infoStr}`;
}

/**
 * Print the route tree structure.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {string} [basePath=""] - Base path for current level.
 * @param {string} [prefix=""] - Prefix for indentation.
 */
function printRouteTree(
  routes,
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

    const tnode = {
      id,
      label,
      path: currentPath,
    };

    // Print the current node line
    console.log(`${prefix}${conn}${Node2String(tnode)}`);

    // Recurse into children if they exist
    if (Array.isArray(r.children) && r.children.length) {
      const nextPrefix = prefix + (isLast ? "    " : "│   "); // Adjust prefix for children
      printRouteTree(
        r.children,
        nextBase,
        nextPrefix,
      );
    }
  });
}

// =============================================================================
// Code Generation Functions
// =============================================================================

/**
 * Generate a map of route ID → NavMeta for all routes in the tree.
 * This map is used to generate the `metaMap` artifact.
 * Uses the standard React Router ID derivation.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @returns {Map<string, NavMeta>} - The map of route IDs to NavMeta objects.
 */
function createMetaMap(routes) {
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
 * The tree structure is based on URL paths for intuitive navigation hierarchy.
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
 * @property {string | undefined} [group] - Group name from handle
 * @property {string | undefined} [section] - Section name from handle
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
 * The tree structure is based on URL paths for intuitive navigation hierarchy.
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
 * @param {string} outFile - The file path to write the output code.
 * @param {NavTreeNode[]} navigationNodes - The navigation tree nodes.
 * @param {ExtendedRouteConfigEntry[]} routes - The original routes for meta map.
 */
function codegen(outFile, navigationNodes, routes) {
  try {
    // 1. Group navigation nodes by section
    const sections = groupNodesBySection(navigationNodes);

    // 2. Create the metaMap from the original routes (includes all routes with handles)
    const metamap = createMetaMap(routes);
    // Format metaMap entries for code generation
    const metaEntries = [...metamap.entries()].map(
      ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
    ).join("\n");

    // 3. Generate the code content (JS or TS)
    const ext = path.extname(outFile).toLowerCase();
    const now = new Date().toISOString();
    let codeContent;

    if (ext === ".ts") {
      codeContent = codegenTsContent(now, metaEntries, sections);
    } else {
      codeContent = codegenJsContent(outFile, now, metaEntries, sections);
    }

    // 4. Write the code to the output file
    fs.writeFileSync(outFile, codeContent, "utf8");
    console.log(`✏️ Generated path-based nav module: ${outFile}`);
  } catch (error) {
    console.error("Error during code generation:", error.message);
    // Don't exit here, allow watch mode to continue if possible
  }
}

// =============================================================================
// Main Control Flow Functions
// =============================================================================

/**
 * Processes the routes: checks for errors, builds trees, and performs codegen.
 * @returns {Promise<boolean>} - True if processing was successful (no errors or in watch mode), false otherwise.
 */
async function processRoutes() {
  AppState.routesFilePath = path.resolve(
    process.cwd(),
    /**@type {string}*/ (options.file),
  );
  AppState.baseDir = path.dirname(AppState.routesFilePath);

  // Load routes
  const currentRoutes = await loadRoutes();
  if (!Array.isArray(currentRoutes) || currentRoutes.length === 0) {
    // loadRoutes already logs the error if import fails
    if (!options.watch) {
      console.error(
        "❌ Failed to load routes or routes file is empty/invalid.",
      );
      return false; // Indicate processing failure
    }
    console.error("Continuing watch despite route loading issue...");
    return true; // Indicate that watch mode is active
  }

  // Check for errors
  const errorReport = checkForErrors(currentRoutes);

  // Print error report
  printErrorReport();

  if (options.showRouteTree) {
    // Show Routes Tree if explicitly requested
    console.log("\nRoute Tree:");
    printRouteTree(currentRoutes);
  }

  // Extract and normalize routes for path-based tree
  const normalizedRoutes = extractRoutesWithNormalizedPaths(currentRoutes);

  // Flatten routes by path
  const routesMap = flattenRoutes(normalizedRoutes);

  // Build the navigation tree based on paths
  const navigationTree = buildNavigationTree(routesMap);

  // Show Navigation Tree only if explicitly requested
  if (options.showNavTree) {
    printNavigationTree(navigationTree);
  }

  // Only perform codegen if there are no errors or we're in watch mode
  if (options.outFile && (!AppState.hasErrors || options.watch)) {
    if (!AppState.hasErrors) {
      codegen(options.outFile, navigationTree, currentRoutes);
    } else if (options.watch) {
      console.error(
        "⚠️ Skipping code generation due to errors (will retry on changes)",
      );
    }
  } else if (options.outFile && AppState.hasErrors && !options.watch) {
    console.error("⚠️ Skipping code generation due to errors");
    return false; // Indicate processing failure in non-watch codegen mode
  }

  // Return true if processing was successful or in watch mode
  return !AppState.hasErrors || options.watch;
}

/**
 * Parse command line arguments and setup options
 * @returns {boolean} - True if arguments are valid, false otherwise
 */
function parseCommandLineArgs() {
  // Remove node executable path and script path from arguments
  const argv = process.argv.slice(2);

  // Check if we have at least a file path
  if (argv.length === 0) {
    console.error(
      "Usage: node script.js <routes.js> [--out <file>] [--watch] [--show-route-tree] [--show-nav-tree] [--show-id] [--show-path]",
    );
    return false;
  }

  // The first argument is expected to be the routes file path
  options.file = argv[0];

  // Parse flags after the file name
  const flags = argv.slice(1);

  // Check for output file
  const outIdx = flags.indexOf("--out");
  options.outFile = (outIdx >= 0 && outIdx + 1 < flags.length)
    ? flags[outIdx + 1]
    : null;

  // Parse boolean flags
  options.watch = flags.includes("--watch");
  options.showRouteTree = flags.includes("--show-route-tree");
  options.showNavTree = flags.includes("--show-nav-tree");
  options.showId = flags.includes("--show-id");
  options.showPath = flags.includes("--show-path");

  return true;
}

/**
 * Main function that runs the React Router route checker tool
 */
async function main() {
  // Parse command line arguments
  if (!parseCommandLineArgs()) {
    process.exit(1);
  }

  try {
    // Initial processing
    await processRoutes();

    // If not in watch mode and initial processing failed (errors prevented codegen), exit with error
    if (!options.watch) {
      process.exit(1);
    }

    // Set up watch mode if requested
    if (options.watch) {
      console.log(`👀 Watching ${options.file} for changes...`);

      // Calculate initial hash of the routes structure
      let lastHash = "";
      try {
        const initialRoutesForHash = await loadRoutes();
        // Only calculate hash if routes loaded successfully and are not empty
        if (
          Array.isArray(initialRoutesForHash) && initialRoutesForHash.length > 0
        ) {
          lastHash = crypto.createHash("sha256").update(
            JSON.stringify(initialRoutesForHash),
          ).digest("hex");
        }
      } catch (hashError) {
        console.error(
          `Warning: Could not calculate initial hash for watch mode: ${hashError.message}`,
        );
        // lastHash remains empty, which means the first change will always trigger regeneration
      }

      // Watch the routes file for changes using a debounced handler
      const debouncedProcess = debounce(async () => {
        try {
          const updatedRoutes = await loadRoutes();
          // Only proceed if routes loaded successfully and are not empty
          if (!Array.isArray(updatedRoutes) || updatedRoutes.length === 0) {
            console.error(
              "Skipping processing due to route loading issues or empty file.",
            );
            // Reset hash on load failure to ensure next successful load triggers regeneration
            lastHash = "";
            return;
          }

          // Calculate hash of the updated routes structure
          const hash = crypto.createHash("sha256").update(
            JSON.stringify(updatedRoutes),
          ).digest("hex");

          // If the structure has changed (hash is different)
          if (hash !== lastHash) {
            lastHash = hash; // Update the last hash
            console.log("🔄 Change detected, regenerating...");

            // Process the updated routes
            await processRoutes();
          }
        } catch (watchErr) {
          // Log error but continue watching
          console.error(
            `Error during watch processing: ${watchErr.message}`,
          );
        }
      }, 200); // Debounce delay (200ms)

      // Use the routesFilePath determined earlier
      // @ts-ignore
      fs.watch(AppState.routesFilePath, (evt) => {
        // Only react to 'change' events and trigger the debounced function
        if (evt === "change") {
          debouncedProcess();
        }
      });
    }
  } catch (err) {
    // Catch errors during initial load or setup
    console.error("Error:", err.message);
    process.exit(1); // Exit on critical error in main execution path
  }
}

// Execute the main function
main();
