#!/usr/bin/env node
// @ts-check

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pathToFileURL } from "url";
import { timeStamp } from "console";

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry & { handle?: import("@m5nv/rr-builder").NavMeta, path?: string }} RouteEntry
 */

/** Dynamically import routes to bust ESM cache */
async function loadRoutes(file) {
  const filePath = path.resolve(process.cwd(), file);
  const url = pathToFileURL(filePath).href + `?update=${Date.now()}`;
  const mod = await import(url);
  return /** @type {RouteEntry[]} */ (mod.default);
}

/** Collect duplicate IDs */
function collectIds(routes, map = new Map()) {
  for (const r of routes) {
    if (r.id) map.set(r.id, (map.get(r.id) || 0) + 1);
    if (r.children) collectIds(r.children, map);
  }
  return map;
}

/** Build a full tree with metadata */
function buildTree(routes, parentPath = "") {
  return routes.flatMap((r) => {
    const hasPath = r.path !== undefined;
    const segment = hasPath ? r.path : "";
    const fullPath = hasPath
      ? `${parentPath}/${segment}`.replace(/\/+/g, "/")
      : parentPath || "/";
    const node = {
      id: r.id || fullPath,
      label: r.handle?.label,
      iconName: r.handle?.iconName,
      end: r.handle?.end,
      group: r.handle?.group,
      section: r.handle?.section,
      path: hasPath ? fullPath : undefined,
      children: [],
    };
    if (r.children) {
      node.children = buildTree(r.children, fullPath);
    }
    return [node];
  });
}

/** Prune layout-only nodes */
function pruneTree(nodes) {
  return nodes.flatMap((n) => {
    const isWrapper = n.label === undefined && n.path === undefined;
    if (isWrapper) {
      return pruneTree(n.children || []);
    }
    const children = n.children ? pruneTree(n.children) : undefined;
    return [{ ...n, children }];
  });
}

/** Strip empty children arrays */
function stripEmpty(nodes) {
  return nodes.map((n) => {
    const node = { ...n };
    if (Array.isArray(node.children)) {
      if (node.children.length > 0) {
        node.children = stripEmpty(node.children);
      } else {
        delete node.children;
      }
    }
    return node;
  });
}

function codegenJs(outFile, now, metaEntries, sections) {
  const header = `// ⚠ AUTO-GENERATED — ${now} — do not edit`;
  const content = `${header}
// @ts-check
import { useMatches } from 'react-router';
/** @typedef {import("react-router").UIMatch} UIMatch */
/** @typedef {import('@m5nv/rr-builder').NavMeta} NavMeta */

/** @type {Map<string, NavMeta>} */
export const metaMap = new Map([
  ${metaEntries}
]);

/// TODO: need to type this data
export const navigationTree = ${JSON.stringify(sections, null, 2)};

/**
 * Hook to hydrate matches with your navigation metadata
 * @returns {UIMatch[]}
 */
export function useHydratedMatches() {
  const matches = useMatches();
  return matches.map(match => {
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    return meta ? { ...match, handle: meta } : match;
  });
}
`;

  fs.writeFileSync(outFile, content, "utf8");
  console.error(`✏️ Generated nav module: ${outFile}`);
}

function codegenTs(outFile, now, metaEntries, sections) {
  const header = `// ⚠ AUTO-GENERATED — ${now} — do not edit`;
  const content = `${header}
import { useMatches, type UIMatch } from 'react-router';
import type { NavMeta } from "@m5nv/rr-builder";

export const metaMap = new Map<string, NavMeta>([
${metaEntries}
]);

/// TODO: need to type this data
export const navigationTree = ${JSON.stringify(sections, null, 2)};

/**
 * Hook to hydrate matches with your navigation metadata
 */
export function useHydratedMatches()  : UIMatch[] {
  const matches = useMatches();
  return matches.map(match => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match;
    const meta = metaMap.get(match.id);
    return meta ? { ...match, handle: meta } : match;
  });
}
`;

  fs.writeFileSync(outFile, content, "utf8");
  console.error(`✏️ Generated nav module: ${outFile}`);
}

/** Generate nav code artifact */
function codegen(outFile, routes) {
  const raw = buildTree(routes);
  const pruned = pruneTree(raw);
  const tree = stripEmpty(pruned);

  // Build metaMap array

  let metaEntries = tree.map((n) => [n.id, {
    ...(n.label !== undefined && { label: n.label }),
    ...(n.iconName !== undefined && { iconName: n.iconName }),
    ...(n.end !== undefined && { end: n.end }),
    ...(n.group !== undefined && { group: n.group }),
    ...(n.section !== undefined && { section: n.section }),
  }]);

  // Group by section
  const sections = {};
  tree.forEach((n) => {
    const sec = n.section || "main";
    sections[sec] = sections[sec] || [];
    sections[sec].push(n);
  });

  // Remove hoisted 'section' prop from nodes
  function removeSection(nodes) {
    return nodes.map((n) => {
      const { section, ...rest } = n;
      if (rest.children) rest.children = removeSection(rest.children);
      return rest;
    });
  }
  for (const key of Object.keys(sections)) {
    sections[key] = removeSection(sections[key]);
  }
  const ext = path.extname(outFile).toLowerCase();
  const now = new Date().toISOString();
  metaEntries = metaEntries.map(
    ([id, m]) => `  [${JSON.stringify(id)}, ${JSON.stringify(m)}],`,
  ).join("\n");
  if (ext === ".ts") {
    codegenTs(outFile, now, metaEntries, sections);
  } else {
    codegenJs(outFile, now, metaEntries, sections);
  }
}

/** CLI entry */
async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error("Usage: rr-check <routes> [--out <file>] [--watch]");
    process.exit(1);
  }
  const file = argv[0];
  const outIdx = argv.indexOf("--out");
  const out = outIdx >= 0 ? argv[outIdx + 1] : null;
  const watch = argv.includes("--watch");

  try {
    let routes = await loadRoutes(file);
    if (out) codegen(out, routes);
    if (watch) {
      console.error(`👀 Watching ${file} for changes...`);
      let lastHash = crypto.createHash("sha256").update(JSON.stringify(routes))
        .digest("hex");
      fs.watch(path.resolve(process.cwd(), file), async (evt) => {
        if (evt !== "change") return;
        const upd = await loadRoutes(file);
        const hash = crypto.createHash("sha256").update(JSON.stringify(upd))
          .digest("hex");
        if (hash !== lastHash) {
          lastHash = hash;
          console.error("🔄 Change detected, regenerating...");
          codegen(out, upd);
        }
      });
    }
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  }
}

main();
