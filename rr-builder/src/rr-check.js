import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import { flatMap, walk, workflow } from "./tree-utils.js";

// --- FILE TOUCHING UTILITIES ---

/**
 * Ask user for confirmation with a yes/no prompt
 * @param {string} question
 * @returns {Promise<boolean>}
 */
function confirm(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} [y/N]: `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Touch missing component files
 * @param {string[]} missingFiles - Array of missing file paths
 * @param {object} options - Touch options
 * @returns {Promise<{created: string[], skipped: string[]}>}
 */
async function touchMissingFiles(missingFiles, options = {}) {
  const { dryRun = false, force = false, baseDir = process.cwd() } = options;
  const created = [];
  const skipped = [];

  if (missingFiles.length === 0) {
    return { created, skipped };
  }

  // Check which files already exist
  const existingFiles = [];
  const nonExistingFiles = [];
  
  for (const file of missingFiles) {
    const fullPath = path.resolve(baseDir, file);
    if (fs.existsSync(fullPath)) {
      existingFiles.push(file);
    } else {
      nonExistingFiles.push(file);
    }
  }

  // Handle force overwrite confirmation
  if (force && existingFiles.length > 0) {
    console.log(`⚠️  The following files will be OVERWRITTEN:`);
    for (const file of existingFiles) {
      console.log(`  - ${file}`);
    }
    console.log('');
    
    if (!dryRun) {
      const shouldContinue = await confirm('Continue?');
      if (!shouldContinue) {
        console.log('❌  Operation cancelled by user');
        return { created, skipped: missingFiles };
      }
    }
  }

  // Files to actually create
  const filesToCreate = force ? missingFiles : nonExistingFiles;
  const filesToSkip = force ? [] : existingFiles;

  if (dryRun) {
    console.log(`📋  DRY RUN - Would create ${filesToCreate.length} files:`);
    for (const file of filesToCreate) {
      console.log(`  + ${file}`);
    }
    if (filesToSkip.length > 0) {
      console.log(`📋  Would skip ${filesToSkip.length} existing files:`);
      for (const file of filesToSkip) {
        console.log(`  - ${file} (already exists)`);
      }
    }
    return { created: filesToCreate, skipped: filesToSkip };
  }

  // Actually create the files
  for (const file of filesToCreate) {
    try {
      const fullPath = path.resolve(baseDir, file);
      const dir = path.dirname(fullPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Create empty file
      fs.writeFileSync(fullPath, '', 'utf8');
      created.push(file);
    } catch (err) {
      console.error(`❌  Failed to create ${file}: ${err.message}`);
      skipped.push(file);
    }
  }

  // Report skipped existing files
  for (const file of existingFiles) {
    if (!force) {
      skipped.push(file);
    }
  }

  return { created, skipped };
}

// Global CLI state object
let state = {
  file: undefined,
  metaJson: undefined,
  apiStubFile: undefined,
  cruddyOutFile: undefined,
  out: undefined,
  watch: false,
  forcegen: false,
  touch: false,
  force: false,
  dryRun: false,
  base: undefined,
  touchBaseDir: undefined, // Separate base directory for touch operations
  show: {
    route: false,
    nav: false,
    id: false,
    path: false,
  },
  routesFilePath: undefined,
};


// --- Builder DSL Codegen for Section-Based Navigation ---
// --- Builder DSL Codegen for Section-Based Navigation ---

// --- CRUDDY ROUTE GENERATION FROM META JSON ---
import { route, index, layout, prefix, build, section } from "./rr-builder.js";

// --- CRUDDY ROUTE GENERATION FROM META JSON ---

/**
 * Generate routes from meta JSON using CRUDdy by Design principles.
 * @param {object} metaJson
 * @returns {Array}
 */
function generateCruddyRoutes(metaJson) {
  // Accepts { resources: [...] }, { metadata: [...] }, or top-level keys mapping to arrays
  let entries = [];
  if (Array.isArray(metaJson.resources)) {
    // Legacy format
    for (const resource of metaJson.resources) {
      const { name, actions, meta } = resource;
      if (!name || !Array.isArray(actions)) continue;
      for (const action of actions) {
        entries.push({
          resource: name,
          type: action,
          meta: meta || {},
        });
      }
    }
  } else if (Array.isArray(metaJson.metadata)) {
    // New format: flatten metadata
    for (const entry of metaJson.metadata) {
      const ann = entry.annotations || {};
      entries.push({
        resource: ann.resource,
        type: ann.type,
        parent: ann.parent,
        meta: ann.nav || {},
      });
    }
  } else {
    // Top-level keys mapping to arrays (e.g., { photos: [...], albums: [...] })
    for (const [key, arr] of Object.entries(metaJson)) {
      if (!Array.isArray(arr)) continue;
      for (const entry of arr) {
        // Always check for annotations.resource and annotations.type
        if (entry.annotations && typeof entry.annotations === "object") {
          const resource = entry.annotations.resource;
          const type = entry.annotations.type;
          const parent = entry.annotations.parent;
          const meta = entry.annotations.nav || {};
          if (resource && type) {
            entries.push({ resource, type, parent, meta });
          }
        } else {
          // Fallback for legacy formats
          const resource = key;
          const type = entry.type || entry.action || entry.method;
          const parent = entry.parent;
          const meta = entry.meta || entry.nav || {};
          if (resource && type) {
            entries.push({ resource, type, parent, meta });
          }
        }
      }
    }
  }
  
  // If no entries were found, throw an error
  if (entries.length === 0) {
    throw new Error("Invalid meta JSON: no valid route entries found");
  }
  // Group by resource
  const resourceMap = new Map();
  for (const e of entries) {
    if (!e.resource || !e.type) continue;
    if (!resourceMap.has(e.resource)) resourceMap.set(e.resource, []);
    resourceMap.get(e.resource).push(e);
  }

  // Generate routes with proper hierarchical structure
  const routes = [];
  const sections = new Map(); // Group resources into sections
  
  // First, organize resources into logical sections
  for (const [resourceName, actions] of resourceMap.entries()) {
    // Infer section from resource name (e.g., "specialist-metrics" -> "specialist")
    const sectionName = resourceName.split('-')[0];
    if (!sections.has(sectionName)) sections.set(sectionName, new Map());
    sections.get(sectionName).set(resourceName, actions);
  }

  // Generate section-based structure
  for (const [sectionName, sectionResources] of sections.entries()) {
    const sectionRoutes = [];
    
    for (const [resourceName, actions] of sectionResources.entries()) {
      const resourceRoutes = [];
      
      const actionToFile = {
        index: "index.tsx",
        create: "create.tsx", 
        store: "store.tsx",
        show: "show.tsx",
        edit: "edit.tsx",
        update: "update.tsx",
        destroy: "destroy.tsx",
      };

      for (const act of actions) {
        const file = `${resourceName}/${actionToFile[act.type] || (act.type + ".tsx")}`;
        let pathStr = null;
        
        switch (act.type) {
          case "index":
            pathStr = `${resourceName}`;
            break;
          case "create":
            pathStr = `${resourceName}/create`;
            break;
          case "store":
            pathStr = `${resourceName}`;
            break;
          case "show":
            pathStr = `${resourceName}/:id`;
            break;
          case "edit":
            pathStr = `${resourceName}/:id/edit`;
            break;
          case "update":
            pathStr = `${resourceName}/:id`;
            break;
          case "destroy":
            pathStr = `${resourceName}/:id`;
            break;
          default:
            pathStr = `${resourceName}/${act.type}`;
        }
        
        let builder = route(pathStr, file);
        if (act.meta && typeof act.meta === "object" && Object.keys(act.meta).length) {
          builder = builder.nav(act.meta);
        }
        resourceRoutes.push(builder);
      }
      
      // If there are multiple routes for this resource, wrap in a prefix
      if (resourceRoutes.length > 1) {
        const prefixedRoutes = prefix(resourceName, resourceRoutes);
        sectionRoutes.push(...prefixedRoutes);
      } else if (resourceRoutes.length === 1) {
        sectionRoutes.push(...resourceRoutes);
      }
    }
    
    // Create a section with layout if there are multiple resources
    if (sectionResources.size > 1) {
      const sectionBuilder = section(sectionName).children(...sectionRoutes);
      // Add section navigation if we can infer it
      const firstResource = Array.from(sectionResources.values())[0];
      const firstAction = firstResource.find(a => a.meta && a.meta.label);
      if (firstAction && firstAction.meta) {
        sectionBuilder.nav({
          label: `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}`,
          iconName: firstAction.meta.icon || firstAction.meta.iconName
        });
      }
      routes.push(sectionBuilder);
    } else {
      // Single resource - add directly or with layout
      routes.push(...sectionRoutes);
    }
  }

  return build(routes);
}

function codegenBuilderDSL(metadata, outFile = null) {
  // Group by resource
  const resourceMap = new Map();
  for (const entry of metadata) {
    const res = entry.annotations && entry.annotations.resource;
    const type = entry.annotations && entry.annotations.type;
    const parent = entry.annotations && entry.annotations.parent;
    if (!res || !type) continue;
    if (!resourceMap.has(res)) resourceMap.set(res, []);
    resourceMap.get(res).push({ type, parent, entry });
  }

  // Generate builder DSL code with hierarchical structure
  let code = `// Generated builder DSL routes from metadata
import { route, index, layout, prefix, build, section } from "@m5nv/rr-builder";

export default build([
`;

  // Organize resources into logical sections
  const sections = new Map();
  for (const [resourceName, entries] of resourceMap.entries()) {
    // Improved section naming logic
    let sectionName;
    if (resourceName.includes('-')) {
      sectionName = resourceName.split('-')[0];
    } else {
      sectionName = resourceName;
    }
    
    // Handle plurals - group "specialists" with "specialist" section
    if (sectionName.endsWith('s') && sectionName.length > 1) {
      const singular = sectionName.slice(0, -1);
      // Check if there are any resources that start with the singular form
      const hasRelatedResources = Array.from(resourceMap.keys()).some(r => 
        r.startsWith(singular + '-') || r === singular
      );
      if (hasRelatedResources) {
        sectionName = singular;
      }
    }
    
    if (!sections.has(sectionName)) sections.set(sectionName, new Map());
    sections.get(sectionName).set(resourceName, entries);
  }

  // Generate section-based structure with layouts
  for (const [sectionName, sectionResources] of sections.entries()) {
    if (sectionResources.size > 1) {
      // Multiple resources - create a section with layout
      code += `  section("${sectionName}")`;
      
      // Add section navigation if we can infer it
      const firstResource = Array.from(sectionResources.values())[0];
      const firstAction = firstResource.find(a => a.entry.annotations.nav && a.entry.annotations.nav.label);
      if (firstAction && firstAction.entry.annotations.nav) {
        const nav = firstAction.entry.annotations.nav;
        code += `.nav({
    label: "${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}",
    iconName: "${nav.icon || nav.iconName || 'Folder'}"
  })`;
      }
      
      code += `.children(
    layout("${sectionName}/layout.tsx").children(
`;

      // Generate routes for each resource in the section
      for (const [resourceName, entries] of sectionResources.entries()) {
        if (entries.length > 1) {
          // Multiple routes for this resource - use prefix
          code += `      ...prefix("${resourceName}", [
`;
          for (const { type, entry } of entries) {
            code += generateRouteCode(resourceName, type, entry, "        ");
          }
          code += `      ]),
`;
        } else {
          // Single route
          const { type, entry } = entries[0];
          code += generateRouteCode(resourceName, type, entry, "      ");
        }
      }
      
      code += `    )
  ),
`;
    } else {
      // Single resource - add directly with layout if it has multiple routes
      const [resourceName, entries] = Array.from(sectionResources.entries())[0];
      if (entries.length > 1) {
        code += `  layout("${resourceName}/layout.tsx").children(
`;
        for (const { type, entry } of entries) {
          code += generateRouteCode(resourceName, type, entry, "    ");
        }
        code += `  ),
`;
      } else {
        // Single route - add directly
        const { type, entry } = entries[0];
        code += generateRouteCode(resourceName, type, entry, "  ");
      }
    }
  }

  code += `]);
`;

  // Write to file or return string
  if (outFile) {
    fs.writeFileSync(outFile, code, "utf8");
    console.log(`✏️  Generated builder DSL routes: ${outFile}`);
  } else {
    return code;
  }
}

function generateRouteCode(resourceName, type, entry, indent) {
  const nav = entry.annotations.nav || {};
  const file = `${resourceName}/${type}.tsx`;
  let pathStr = null;
  
  // Standard CRUDdy path conventions
  switch (type) {
    case "index":
      pathStr = `${resourceName}`;
      break;
    case "create":
      pathStr = `${resourceName}/create`;
      break;
    case "store":
      pathStr = `${resourceName}`;
      break;
    case "show":
      pathStr = `${resourceName}/:id`;
      break;
    case "edit":
      pathStr = `${resourceName}/:id/edit`;
      break;
    case "update":
      pathStr = `${resourceName}/:id`;
      break;
    case "destroy":
      pathStr = `${resourceName}/:id`;
      break;
    default:
      pathStr = `${resourceName}/${type}`;
  }

  let routeCode = `${indent}route("${pathStr}", "${file}")`;
  if (nav && typeof nav === "object" && Object.keys(nav).length > 0) {
    routeCode += `.nav(${JSON.stringify(nav, null, 2).replace(/\n/g, '\n' + indent + '  ')})`;
  }
  routeCode += `,
`;
  return routeCode;
}

function extractCruddyAnnotations(apiFilePath, outFilePath) {

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
  
  // Handle file touching before validation
  if (state.touch && state.missingFiles && state.missingFiles.length > 0) {
    // For touch operations, default to app/routes unless --base was specified
    const touchBaseDir = state.touchBaseDir || 'app/routes';
    
    const touchOptions = {
      dryRun: state.dryRun,
      force: state.force,
      baseDir: touchBaseDir,
    };
    
    const { created, skipped } = await touchMissingFiles(state.missingFiles, touchOptions);
    
    if (state.dryRun) {
      console.log(''); // Empty line after dry-run output
      // Don't proceed with regular validation for dry runs
      return;
    } else if (created.length > 0) {
      console.log(`✅  Created ${created.length} missing file${created.length > 1 ? 's' : ''}`);
      if (skipped.length > 0) {
        console.log(`⏭️  Skipped ${skipped.length} existing file${skipped.length > 1 ? 's' : ''}`);
      }
      
      // Re-check for errors after creating files
      state.hasErrors = false;
      state.missingFiles = null;
      state.missingFileIds = null;
      checkForErrors(routes);
    }
  }
  
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
        // Changed from forcegen to force for touching files
        state.forcegen = true;
        break;
      case "--touch":
        state.touch = true;
        break;
      case "--force-touch":
        state.force = true;
        break;
      case "--dry-run":
        state.dryRun = true;
        break;
      case "--base":
        if (args[i + 1]) {
          state.touchBaseDir = args[++i];
        }
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
Usage: node rr-check <routes-file> [OPTIONS]
       node rr-check --meta-json <meta.json> [OPTIONS]
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
  --touch                   Create missing component files as empty files.
  --force-touch             Force overwrite existing files when touching (requires confirmation).
  --dry-run                 Preview what files would be created without actually creating them.
  --base=<dir>              Base directory for touching files (defaults to app/routes).

Examples:
  npx rr-check routes.js --print:route-tree
  npx rr-check src/routes.js --print:nav-tree,include-path --out=app/lib/navigation.js
  npx rr-check routes.js --touch --out=navigation.js
  npx rr-check routes.js --touch --dry-run
  npx rr-check routes.js --touch --force-touch --base=src/routes
  npx rr-check --meta-json meta.json --out=routes.js
  npx rr-check --extract-cruddy docs/business-api.ts --out-cruddy cruddy-metadata.json
  deno rr-check src/routes.ts --print:route-tree,include-id --watch 
`,
    );
    return process.exit(1);
  }

  // For meta-json mode, don't set a default output file

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
    // Support { resources: [...] }, { metadata: [...] }, or top-level keys mapping to arrays
    let normalized;
    if (Array.isArray(metaJsonObj.resources)) {
      normalized = metaJsonObj;
    } else if (Array.isArray(metaJsonObj.metadata)) {
      normalized = { metadata: metaJsonObj.metadata };
    } else {
      // Flatten all arrays under top-level keys into a single array
      const allEntries = [];
      for (const key of Object.keys(metaJsonObj)) {
        if (Array.isArray(metaJsonObj[key])) {
          allEntries.push(...metaJsonObj[key]);
        }
      }
      if (allEntries.length === 0) {
        console.error("❌  Invalid meta JSON: no route metadata found");
        process.exit(1);
      }
      normalized = { metadata: allEntries };
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
    // Also generate builder DSL file if requested
    if (state.out) {
      // Extract the actual metadata array to pass to codegenBuilderDSL
      let metadataArray = [];
      if (Array.isArray(metaJsonObj.metadata)) {
        metadataArray = metaJsonObj.metadata;
      } else if (Array.isArray(metaJsonObj.resources)) {
        // Convert resources to metadata format
        for (const resource of metaJsonObj.resources) {
          const { name, actions, meta } = resource;
          if (name && Array.isArray(actions)) {
            for (const action of actions) {
              metadataArray.push({
                method: `${action}${name}`,
                annotations: {
                  resource: name,
                  type: action,
                  nav: meta || {}
                }
              });
            }
          }
        }
      } else {
        // Flatten top-level keys into metadata format
        for (const [key, arr] of Object.entries(metaJsonObj)) {
          if (Array.isArray(arr)) {
            metadataArray.push(...arr);
          }
        }
      }
      codegenBuilderDSL(metadataArray, state.out);
    } else {
      // Print to console when no --out is specified
      let metadataArray = [];
      if (Array.isArray(metaJsonObj.metadata)) {
        metadataArray = metaJsonObj.metadata;
      } else if (Array.isArray(metaJsonObj.resources)) {
        // Convert resources to metadata format
        for (const resource of metaJsonObj.resources) {
          const { name, actions, meta } = resource;
          if (name && Array.isArray(actions)) {
            for (const action of actions) {
              metadataArray.push({
                method: `${action}${name}`,
                annotations: {
                  resource: name,
                  type: action,
                  nav: meta || {}
                }
              });
            }
          }
        }
      } else {
        // Flatten top-level keys into metadata format
        for (const [key, arr] of Object.entries(metaJsonObj)) {
          if (Array.isArray(arr)) {
            metadataArray.push(...arr);
          }
        }
      }
      const generatedCode = codegenBuilderDSL(metadataArray);
      console.log(generatedCode);
    }
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
