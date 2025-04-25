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
 * Print the path-based navigation tree structure to the console.
 * This version focuses on displaying paths and their hierarchical relationships.
 *
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {Set<string>} dupIds - Set of duplicate IDs detected.
 * @param {boolean} showId - Whether to include route IDs in the output.
 * @param {boolean} showPath - Whether to include route paths in the output.
 * @param {boolean} checkFiles - Whether to check if component files exist.
 * @param {string} fileBaseDir - The base directory to resolve route file paths against.
 */
function printPathBasedTree(
  routes,
  dupIds,
  showId,
  showPath,
  checkFiles,
  fileBaseDir,
) {
  // First, extract all navigable routes with their paths
  const navigableRoutes = extractNavigableRoutes(routes);

  // Then build the path-based tree
  const pathTree = buildTreeForSection(navigableRoutes);

  // Print the tree
  console.log("\nPath-based Navigation Tree:");
  printPathTreeNodes(
    pathTree,
    "",
    dupIds,
    showId,
    showPath,
    checkFiles,
    fileBaseDir,
  );

  // Add a legend
  console.log("\nLegend:");
  console.log("(P) - Path-based node (derived from URL structure)");
  console.log("(R) - Route node (actual navigable route)");

  if (checkFiles || dupIds.size > 0) {
    if (checkFiles && dupIds.size > 0) {
      console.log("(*) - Indicates duplicate ID or missing file.");
    } else if (checkFiles) {
      console.log("(*) - Indicates missing file.");
    } else if (dupIds.size > 0) {
      console.log("(*) - Indicates duplicate ID.");
    }
  }
}

/**
 * Recursively print the nodes of a path-based tree.
 *
 * @param {Array} nodes - The array of tree nodes to print.
 * @param {string} prefix - The prefix string for tree indentation.
 * @param {Set<string>} dupIds - Set of duplicate IDs detected.
 * @param {boolean} showId - Whether to include route IDs in the output.
 * @param {boolean} showPath - Whether to include route paths in the output.
 * @param {boolean} checkFiles - Whether to check if component files exist.
 * @param {string} fileBaseDir - The base directory to resolve route file paths against.
 */
function printPathTreeNodes(
  nodes,
  prefix,
  dupIds,
  showId,
  showPath,
  checkFiles,
  fileBaseDir,
) {
  if (!Array.isArray(nodes)) return;

  nodes.forEach((node, idx) => {
    const isLast = idx === nodes.length - 1;
    const conn = isLast ? "└── " : "├── "; // Tree connection characters

    // Determine marking for duplicates or missing component files
    let mark = " ";
    if (node.id && dupIds.has(node.id)) {
      mark = "*";
    }
    if (checkFiles && node.file) {
      const filePath = path.resolve(fileBaseDir, node.file);
      if (!fs.existsSync(filePath)) {
        mark = "*";
      }
    }

    // Build info parts (path and ID) - only show ID if it actually exists and showId is true
    const info = [];
    if (showPath) info.push(`path: ${node.path}`);
    if (showId && node.id) info.push(`id: ${node.id}`);
    const infoStr = info.length ? ` (${info.join(", ")})` : "";

    // Print the current node line
    console.log(`${prefix}${conn}${mark} ${node.label}${infoStr}`);

    // Recurse into children if they exist
    if (Array.isArray(node.children) && node.children.length) {
      const nextPrefix = prefix + (isLast ? "    " : "│   "); // Adjust prefix for children
      printPathTreeNodes(
        node.children,
        nextPrefix,
        dupIds,
        showId,
        showPath,
        checkFiles,
        fileBaseDir,
      );
    }
  });
}

/**
 * Builds a navigation tree based on path structure rather than route hierarchy.
 * This creates a tree that's ideal for site navigation menus.
 *
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 * @param {boolean} [verbose=false] - Whether to log debugging information.
 * @returns {Object} - Object with sections as keys and arrays of NavTreeNode as values.
 */
function buildPathBasedNavigationTree(routes, verbose = false) {
  // Step 1: Extract all navigable routes with complete path and metadata
  const navigableRoutes = extractNavigableRoutes(routes);

  if (verbose) {
    console.log("Extracted navigable routes:");
    console.log(JSON.stringify(navigableRoutes, null, 2));
  }

  // Step 2: Group by section
  const sectionMap = {};
  for (const route of navigableRoutes) {
    const section = route.section || "main";
    sectionMap[section] = sectionMap[section] || [];
    sectionMap[section].push(route);
  }

  // Step 3: Build path-based tree for each section
  const result = {};
  for (const section in sectionMap) {
    result[section] = buildTreeForSection(sectionMap[section]);

    if (verbose) {
      console.log(`Tree for section '${section}':`);
      console.log(JSON.stringify(result[section], null, 2));
    }
  }

  return result;
}

/**
 * Extract navigable routes with their complete paths by traversing the route tree.
 * Handles layout routes and resolves paths properly.
 *
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array
 * @param {string} [basePath=""] - The base path for the current level
 * @returns {Array} - Array of navigable routes with complete paths and metadata
 */
function extractNavigableRoutes(routes, basePath = "") {
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
      (route.file ? route.file.replace(/\.[^/.]+$/, "") : undefined) ??
      fullPath;

    // Get or derive label
    let label = route.handle?.label;
    if (!label && route.id) {
      // Derive label from ID as a fallback
      label = route.id
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Only include routes with actual paths (not layout routes with path="/")
    // Layout routes are "/" and not index routes
    const isLayoutRoute = (path === "/" || path === "") && !route.index;

    // Include if it's not a layout route or it's an index route
    if (!isLayoutRoute || route.index) {
      result.push({
        id,
        path: fullPath,
        label: label || (route.index ? "(index)" : "(no label)"),
        iconName: route.handle?.iconName,
        end: route.handle?.end,
        group: route.handle?.group,
        section: route.handle?.section,
      });
    }

    // Process children recursively, passing the current full path as the base
    if (Array.isArray(route.children)) {
      result.push(...extractNavigableRoutes(route.children, fullPath));
    }
  }

  return result;
}

/**
 * First pass: Analyze routes to infer paths for layout routes based on their children
 *
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array
 * @param {string} [basePath=""] - The base path for the current level
 * @returns {Map<string, string>} - Map of layout route IDs to their inferred paths
 */
function inferLayoutPathsFromChildren(routes, basePath = "") {
  const layoutPathMap = new Map();

  // Process the route tree to collect child paths for layout routes
  function processRoutes(routes, currentPath = "") {
    if (!Array.isArray(routes)) return;

    for (const route of routes) {
      // Calculate the full path for this route
      let path = route.path !== undefined ? String(route.path) : "";
      let fullPath;

      if (route.index && currentPath) {
        // Index routes inherit parent path
        fullPath = currentPath;
      } else if (path) {
        // Regular path routes
        fullPath = currentPath === "" ? `/${path}` : `${currentPath}/${path}`;
        fullPath = fullPath.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";
      } else {
        // Layout routes with empty path
        fullPath = currentPath;
      }

      // For layout routes, examine direct child paths
      const isLayout = (path === "" || path === "/") && !route.index;
      if (isLayout && route.id && Array.isArray(route.children)) {
        // Extract direct child paths, ignoring nested layout routes
        const childPaths = [];

        for (const child of route.children) {
          // Skip nested layout routes
          const childIsLayout = (child.path === "" || child.path === "/") &&
            !child.index;
          if (!childIsLayout) {
            // For direct children with actual paths, calculate their full paths
            if (child.path && child.path !== "/") {
              // Correctly handle path joining
              let childPath;
              if (child.path.startsWith("/")) {
                // Absolute path
                childPath = child.path;
              } else {
                // Relative path
                childPath = fullPath === "/"
                  ? `/${child.path}`
                  : `${fullPath}/${child.path}`;
              }
              childPath = childPath.replace(/\/+/g, "/").replace(/\/+$/, "") ||
                "/";
              childPaths.push(childPath);
            }
          }
        }

        // If we have child paths, determine common prefix
        if (childPaths.length > 0) {
          // Find the common path prefix
          const inferredPath = findCommonPathPrefix(childPaths);

          if (inferredPath && inferredPath !== "/") {
            layoutPathMap.set(route.id, inferredPath);
          } else {
            // Fallback: If we can't infer a path from direct children,
            // look at the parent path as context
            layoutPathMap.set(route.id, fullPath);
          }
        } else {
          // No direct child paths, use parent context
          layoutPathMap.set(route.id, fullPath);
        }
      }

      // Recurse into children with correct path context
      if (Array.isArray(route.children)) {
        processRoutes(route.children, fullPath);
      }
    }
  }

  processRoutes(routes, basePath);
  return layoutPathMap;
}

/**
 * Find the common path prefix shared by multiple paths
 * @param {string[]} paths - Array of paths
 * @returns {string} - Common path prefix
 */
function findCommonPathPrefix(paths) {
  if (paths.length === 0) return "/";
  if (paths.length === 1) {
    // If there's only one path, use its parent path
    const segments = paths[0].split("/").filter(Boolean);
    segments.pop(); // Remove the last segment (the specific page)
    return segments.length === 0 ? "/" : `/${segments.join("/")}`;
  }

  // Split all paths into segments
  const segmentArrays = paths.map((path) => path.split("/").filter(Boolean));

  // Find the common prefix segments
  const commonSegments = [];
  const firstPath = segmentArrays[0];

  for (let i = 0; i < firstPath.length; i++) {
    const segment = firstPath[i];
    // Check if this segment exists in all paths at the same position
    if (segmentArrays.every((segments) => segments[i] === segment)) {
      commonSegments.push(segment);
    } else {
      break;
    }
  }

  return commonSegments.length === 0 ? "/" : `/${commonSegments.join("/")}`;
}

/**
 * Second pass: Extract navigable routes with correct paths
 *
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array
 * @param {string} basePath - The base path for the current level
 * @param {Map<string, string>} layoutPathMap - Map of layout route IDs to their inferred paths
 * @returns {Array} - Array of navigable routes with correct paths
 */
function extractRoutesWithCorrectPaths(routes, basePath = "", layoutPathMap) {
  if (!Array.isArray(routes)) return [];

  let result = [];

  for (const route of routes) {
    // Calculate the full path for this route
    let path = route.path !== undefined ? String(route.path) : "";
    let fullPath;

    // Handle layout routes specifically based on inferred paths
    const isLayout = (path === "" || path === "/") && !route.index;

    if (isLayout && route.id && layoutPathMap.has(route.id)) {
      // Use the inferred path for this layout
      fullPath = layoutPathMap.get(route.id);
    } else if (route.index && basePath) {
      // Index routes inherit parent path
      fullPath = basePath;
    } else if (path === "/" || path === "") {
      // Layout routes without inferred paths use parent path
      fullPath = basePath;
    } else {
      // Handle path segments correctly
      if (path.startsWith("/")) {
        // Absolute path - don't append to basePath
        fullPath = path;
      } else {
        // Relative path - append to basePath
        fullPath = basePath === "" ? `/${path}` : `${basePath}/${path}`;
      }
    }

    // Clean up path (remove double slashes, trailing slash)
    fullPath = fullPath.replace(/\/+/g, "/").replace(/\/+$/, "") || "/";

    // Get the ID using standard derivation
    const id = route.id ??
      (route.file ? route.file.replace(/\.[^/.]+$/, "") : undefined) ??
      fullPath;

    // Get or derive label
    let label = route.handle?.label;
    if (!label && route.id) {
      // Derive label from ID as a fallback
      label = route.id
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    // Skip layout routes at the root level (path="/")
    // but include layout routes that have been given a meaningful path
    const shouldInclude = !isLayout ||
      (isLayout && route.id && layoutPathMap.has(route.id) &&
        layoutPathMap.get(route.id) !== "/");

    if (shouldInclude || route.index) {
      // Include this route in the result
      result.push({
        id,
        path: fullPath,
        label: label || (route.index ? "(index)" : "(no label)"),
        iconName: route.handle?.iconName,
        end: route.handle?.end,
        group: route.handle?.group,
        section: route.handle?.section,
      });
    }

    // Calculate the path to pass to children
    let childBasePath;
    if (isLayout && route.id && layoutPathMap.has(route.id)) {
      // Use inferred path for layout routes
      childBasePath = layoutPathMap.get(route.id);
    } else {
      childBasePath = fullPath;
    }

    // Process children recursively
    if (Array.isArray(route.children)) {
      result = result.concat(
        extractRoutesWithCorrectPaths(
          route.children,
          childBasePath,
          layoutPathMap,
        ),
      );
    }
  }

  return result;
}

/**
 * Build a navigation tree for a section based on paths
 * @param {Array} routes - Array of routes for this section
 * @returns {Array} - Navigation tree for this section
 */
function buildTreeForSection(routes) {
  // Filter out layout routes that have path="/" but aren't supposed to be at the root level
  // We can identify these by looking for specific IDs or patterns in the ID
  const filteredRoutes = routes.filter((route) => {
    // Only filter routes with path="/"
    if (route.path !== "/") return true;

    // Keep the real root route (often the home page)
    if (
      route.id === "routes/page" || route.id === "index" || route.id === "home"
    ) {
      return true;
    }

    // Filter out layout routes that actually belong under subpaths
    // Check ID patterns that suggest they're subpath layouts
    if (route.id) {
      // Check for IDs like "overview", "analytics", "reports" which are likely layout containers
      // or IDs that end with "layout"
      if (
        route.id === "overview" ||
        route.id === "analytics" ||
        route.id === "reports" ||
        route.id === "users" ||
        route.id === "roles" ||
        route.id.endsWith("layout")
      ) {
        return false;
      }

      // Check if ID contains a path structure that suggests it's a subpath
      // e.g., "routes/dashboard/overview/summary"
      if (
        route.id.includes("/") &&
        (route.id.includes("/overview/") ||
          route.id.includes("/analytics/") ||
          route.id.includes("/reports/") ||
          route.id.includes("/users/") ||
          route.id.includes("/roles/"))
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort routes by path to ensure correct nesting
  filteredRoutes.sort((a, b) => {
    // Sort by path segments length first (shorter paths come first)
    const aSegments = a.path.split("/").filter(Boolean);
    const bSegments = b.path.split("/").filter(Boolean);

    if (aSegments.length !== bSegments.length) {
      return aSegments.length - bSegments.length;
    }

    // If paths have the same depth, sort alphabetically
    return a.path.localeCompare(b.path);
  });

  // Create a tree structure
  const root = { children: [] };

  // Process each route
  for (const route of filteredRoutes) {
    // Special handling for the root route - only include the main home page
    if (route.path === "/") {
      // Only include the actual home page at the root
      if (
        route.id === "routes/page" || route.id === "index" ||
        route.id === "home"
      ) {
        root.children.unshift({
          ...route,
          children: [],
        });
      }
      continue;
    }

    // Split the path into segments
    const segments = route.path.split("/").filter(Boolean);

    // Start at the root
    let currentNode = root;
    let currentPath = "";

    // Build the path segment by segment and create/find nodes
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath = currentPath ? `${currentPath}/${segment}` : `/${segment}`;

      // Check if this is the final segment (the actual route)
      const isFinalSegment = i === segments.length - 1;

      // Find or create a node for this segment
      let node = currentNode.children.find((child) =>
        child.path === currentPath
      );

      if (!node) {
        // If this is an intermediate segment, create a placeholder
        if (!isFinalSegment) {
          node = {
            id: `placeholder-${currentPath.replace(/\//g, "-")}`,
            path: currentPath,
            label: segment.charAt(0).toUpperCase() + segment.slice(1),
            children: [],
          };
          currentNode.children.push(node);
        } else {
          // If this is the final segment, add the actual route
          node = {
            ...route,
            children: [],
          };
          currentNode.children.push(node);
        }
      } else if (isFinalSegment) {
        // If we found a node but it's a placeholder and we're at the final segment,
        // update it with the actual route data
        Object.assign(node, route);
      }

      // Move down the tree
      currentNode = node;
    }
  }

  return root.children;
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
 * This function orchestrates the tree building, meta map creation, grouping, and code generation.
 * @param {string} outFile - The file path to write the output code.
 * @param {ExtendedRouteConfigEntry[]} routes - The route configuration array.
 */
function codegen(outFile, routes) {
  try {
    // 1. Extract navigable routes
    const navigableRoutes = extractNavigableRoutes(routes);

    // 2. Group routes by section
    const routesBySections = {};
    for (const route of navigableRoutes) {
      const section = route.section || "main";
      routesBySections[section] = routesBySections[section] || [];
      routesBySections[section].push(route);
    }

    // 3. Build tree for each section
    const sections = {};
    for (const section in routesBySections) {
      sections[section] = buildTreeForSection(routesBySections[section]);
    }

    // 4. Create the metaMap from the original routes (includes all routes with handles)
    const metamap = createMetaMap(routes);
    // Format metaMap entries for code generation
    const metaEntries = [...metamap.entries()].map(
      ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
    ).join("\n");

    // 5. Generate the code content (JS or TS)
    const ext = path.extname(outFile).toLowerCase();
    const now = new Date().toISOString();
    let codeContent;

    if (ext === ".ts") {
      codeContent = codegenTsContent(now, metaEntries, sections);
    } else {
      codeContent = codegenJsContent(outFile, now, metaEntries, sections);
    }

    // 6. Write the code to the output file
    fs.writeFileSync(outFile, codeContent, "utf8");
    console.error(`✏️ Generated path-based nav module: ${outFile}`);
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
  const verbose = flags.includes("--verbose");

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

      // Collect duplicate IDs for reporting
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

      // Print the traditional route forest structure (for backward compatibility)
      console.log("\nTraditional Route Tree:");
      printTree(routes, dupIds, showId, showPath, checkFiles, baseDir);

      // Print the path-based navigation tree (for navigation purposes)
      printPathBasedTree(
        routes,
        dupIds,
        showId,
        showPath,
        checkFiles,
        baseDir,
        verbose,
      );
    }
  } catch (err) {
    // Catch errors during initial load or setup
    console.error("Error:", err.message);
    process.exit(1); // Exit on critical error in main execution path
  }
}

// Execute the main function
main();
