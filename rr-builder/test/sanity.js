import util from "node:util";
import url from "node:url";
import { flatMap, walk } from "../src/tree-utils.js";
import raw1 from "./routes-wl-wm.json" with { type: "json" };
import raw2 from "./routes-wl-wom.json" with { type: "json" };
import raw3 from "./routes-wr-wm.json" with { type: "json" };
import raw4 from "./routes-wr-wom.json" with { type: "json" };

function printout(o, depth = 7, compact = true, breakLength = 80) {
  console.log(util.inspect(o, { compact, depth, breakLength }));
}

/**
 * Print tree view like Linux tree, using walk.
 * @param {Array} nodes
 */
export function printTree(nodes) {
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
    const name = node.id || node.handle?.label || node.file;
    console.log(prefix + pointer + name);
  });
}

/**
 * Returns true if node is a layout-only route (has children but no "path" property).
 * @param {object} node
 */
export const isLayoutRoute = (node) =>
  node.children && !node.hasOwnProperty("path");

/**
 * If exactly one node in the array has index=true, promotes it to parent and nests the others under its children.
 * Otherwise returns the array unchanged.
 * @param {Array} nodes
 */
export function groupUnderIndex(nodes) {
  const idx = nodes.findIndex((n) => n.index);
  if (idx < 0) return nodes;
  const parent = nodes[idx];
  const siblings = nodes.filter((_, i) => i !== idx);
  if (siblings.length) {
    parent.children = [...(parent.children || []), ...siblings];
  }
  return [parent];
}

/**
 * Drop layout-only nodes (no path), promote children, and regroup under index when appropriate.
 * @param {Array} nodes
 * @returns {Array}
 */
export function pruneLayouts(nodes) {
  return flatMap(nodes, (node) => {
    if (!isLayoutRoute(node)) {
      return [
        {
          ...node,
          children: node.children ? pruneLayouts(node.children) : undefined,
        },
      ];
    }
    const kids = pruneLayouts(node.children);
    return groupUnderIndex(kids);
  });
}

function prune_and_print(nodes, message, debug) {
  console.log(message);
  let pruned = pruneLayouts(nodes);
  printTree(pruned);
  if (debug) {
    printout(pruned);
  }
}

if (import.meta.url.startsWith("file:")) {
  const self = url.fileURLToPath(import.meta.url);
  if (process.argv[1] === self) {
    // remove node executable path and script path from arguments
    let argv = process.argv.slice(2);
    const printable = ["all", "wl-wm", "wl-wom", "wr-wm", "wr-wom"];
    let whichone = "all";
    let debug = false;
    if (argv.length >= 1) {
      // The first argument is expected to be the routes file path
      if (printable.includes(argv[0])) {
        whichone = argv[0];
        argv = argv.slice(1);
      }

      if (argv.length === 1) {
        if (argv.includes("--debug")) {
          debug = true;
        } else {
          console.error(
            "Usage: node sanity.js <all|wl-wm|wl-wom|wr-wm|wr-wom> [--debug]",
          );
          process.exit(-1);
        }
      }
    }

    const work = [
      [raw1, "--- test-routes-wl-wm.json ---"],
      [raw2, "--- test-routes-wl-wom.json ---"],
      [raw3, "--- test-routes-wr-wm.json ---"],
      [raw4, "--- test-routes-wr-wom.json ---"],
    ];

    if (whichone === "all") {
      for (const [n, m] of work) {
        prune_and_print(n, m, debug);
      }
    } else {
      const w = work.find((w) => w[1].indexOf(whichone) !== -1);
      prune_and_print(w[0], w[1], debug);
    }
  }
}
