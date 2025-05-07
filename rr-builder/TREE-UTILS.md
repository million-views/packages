# **tree-utils.js** API & Usage Guide

This guide covers:

1. **API Reference**: concise descriptions of core functions and their
   parameters.
2. **Example use cases**: snippets demonstrating common patterns.
3. **Composition and workflow**: snippets demonstrating combining primitives.

The `tree-utils` API came about while creating a tool to process `react-router`
route configuration (in v7 framework mode). The router configuration is a tree
like structure, and thus this API should work in other domains that involve
processing tree like structures; the only requirement is that tree node have a
`children` prop.

## 1. API Reference

| Function     | Signature                  | Description                                                                                                                                        |
| ------------ | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **walk**     | `(nodes, onNode)`          | Depth-first (pre-order) traversal; invokes `onNode(node, depth, siblings)`. Use for audits, printing, side-effects.                                |
| **map**      | `(nodes, fn) → newNodes`   | One-to-one node transformation; automatically rebuilds each node's `children` from the result of `fn`.                                             |
| **flatMap**  | `(nodes, fn) → newNodes`   | Transforms each node into zero, one, or multiple replacement nodes, flattening the output; ideal for structural rewrites like pruning or grafting. |
| **filter**   | `(nodes, pred) → newNodes` | Keeps only nodes where `pred(node)` is true, pruning entire subtrees otherwise.                                                                    |
| **reduce**   | `(nodes, fn) => R[]`       | Catamorphic reduce: fold bottom-up, computing a result per node from its children's accumulated values; returns R[] for root nodes.                |
| **pipe**     | `(...fns) → fn`            | Composes unary functions left-to-right. `pipe(f,g)(x) === g(f(x))`. Useful for building transform pipelines.                                       |
| **workflow** | see below                  | Build a workflow runner from discrete steps + shared context; supports array, variadic, and trailing-context overloads.                            |

Each function hides recursion—you supply the node array and callback only.

### 1.1. When to Use Which

- **walk**: side-effects, diagnostics, one-off accumulators
- **map**: simple node-wise mutation without shape changes
- **flatMap**: structural rewrites (prune/graft, duplication, macro expansion)
- **filter**: remove subtrees without matches, preserve nesting of kept nodes
- **reduce**: bottom-up aggregation and lookup-map building
- **pipe**: workflow composition
- **workflow**: share state across a sequenced pipeline of processors

**`flatMap` vs `filter` vs `reduce`:**

- `flatMap` transforms each node into zero, one, or multiple replacement nodes,
  flattening the output; best for structural rewrites like pruning, grafting or
  expanding structures.
- `filter` branch-prune while preserving hierarchy—recurses into all branches,
  keeps a node if it or any descendant matches fn, otherwise cuts off entire
  dead branches.
- `reduce` bottom-up fold—computes a value per node based on its children’s
  accumulated results, then bubbles up to roots. Use for aggregation, lookup-map
  building, or any scenario where parent results depend on processed child data.

### 1.2. Callback Protocols

#### flatMap `fn` protocol

`fn` implements the logic of `tree-rewrite` algebra:

- **Signature**: `(node: T) => T[]`
- **Return**: zero, one, or multiple replacement nodes.
- **Recursion**: Any returned node’s `children` array will be processed by
  `flatMap`.
- **Use**: perform structural rewrites like prune & graft, macro expansion, or
  duplication in one pass.

#### filter `fn` protocol

`fn` implements the predicate:

- **Signature:** `(node: T) => boolean`
- **Recursion:** always descends into node.children first
- **Return:** true to keep this node (with its filtered children); false to
  prune it—unless its descendants matched, in which case those are promoted
  under their nearest kept ancestor
- **Use:** remove all branches lacking any matching nodes, while preserving the
  original nesting of all kept nodes

#### reduce `fn` protocol

`fn` implements the logic of your bottom-up reducer:

- **Signature:** `(node: T, childrenAcc: R[]) => R`
- **Children Accumulation:** childrenAcc is an array of R values returned by
  `fn` for each child.
- **Return:** a single accumulator value for the node.
- **Use:** compute aggregated values, build lookup structures, or any scenario
  where each node's result depends on child results.

#### `workflow` signature overloads

```ts
// 1) Array form, optional context
workflow<I, O, C extends object = {}>(
  steps: Array<(value: any, ctx: C) => any>,
  initialCtx?: C
): { run(input: I): O; ctx: C; }

// 2) Variadic with trailing context
workflow<I, O, C extends object>(
  ...args: [...Array<(value: any, ctx: C) => any>, C]
): { run(input: I): O; ctx: C; }

// 3) Pure variadic, default context
workflow<I, O, C extends object = {}>(
  ...steps: Array<(value: any, ctx: C) => any>
): { run(input: I): O; ctx: C; }
```

## 2. Use cases

Copy these examples into a `quicktest.js` file and run with your favorite
runtime such as `node` or `deno`.

### 2.1 Print an ASCII Tree

Traverse and render a directory-like tree:

```js
// file: quicktest.js
import { walk } from "./tree-utils.js";

// Load routes JSON (ESM import)
// In Node.js v22+ with "type": "module" in package.json
// or via a bundler that supports JSON imports
import routes from "./routes.json" assert { type: "json" };

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
    const name = node.id || node.handle?.label || node.file;
    console.log(prefix + pointer + name);
  });
}

printTree(routes);
```

### 2.2 Audit for Duplicate IDs

Use `walk` to collect and report repeated `id` fields:

```js
// file: quicktest.js
import { walk } from "./tree-utils.js";
function findDuplicateIds(nodes) {
  const counts = {};
  walk(nodes, (n) => {
    if (n.id) counts[n.id] = (counts[n.id] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));
}

console.log(findDuplicateIds(routes));
```

### 2.3 Filter Routes by Path Prefix

`filter` lets you **prune** subtrees that **don't** match a predicate:

```js
// file: quicktest.js
import { filter } from "./tree-utils.js";
const adminRoutes = filter(
  routes,
  (node) => node.path?.startsWith("/admin"),
);
printTree(adminRoutes);
```

### 2.4 Prune Layout Wrappers

Remove nodes without `path` and promote their children, grouping siblings under
the `index` node:

```js
// file: quicktest.js
import { flatMap } from "./tree-utils.js";

const isLayoutRoute = (n) => n.children && !n.hasOwnProperty("path");
const groupUnderIndex = (kids) => {
  const idx = kids.findIndex((n) => n.index);
  if (idx < 0) return kids;
  const [parent] = kids.splice(idx, 1);
  parent.children = [...(parent.children || []), ...kids];
  return [parent];
};

export function pruneLayouts(nodes, isRoot = true) {
  return flatMap(nodes, (node) => {
    if (!isLayoutRoute(node)) {
      return [{
        ...node,
        children: node.children
          ? pruneLayouts(node.children, false)
          : undefined,
      }];
    }
    const kids = pruneLayouts(node.children, false);
    return isRoot ? kids : groupUnderIndex(kids);
  });
}

const navTree = pruneLayouts(routes);
printTree(navTree);
```

### 2.5 Count navigable routes using `reduce`

```js
// file: quicktest.js
import { reduce } from "./tree-utils.js";

// Count only routes that have a path (skip layout-only nodes)
const counts = reduce(routes, (node, childCounts) => {
  const selfCount = node.path ? 1 : 0;
  return selfCount + childCounts.reduce((a, b) => a + b, 0);
});

// Result is a one-element array (since there’s a single root)
console.log(counts[0]);
```

### 2.6 Building an ID→Node Lookup Map using `reduce`

```js
// file: quicktest.js
import { reduce } from "./tree-utils.js";

const maps = reduce(routes, (node, childrenMaps) => {
  // start with this node’s id→path (if it has one)
  const m = node.id && node.path ? { [node.id]: node.path } : {};
  // merge in every child’s map
  childrenMaps.forEach((cm) => Object.assign(m, cm));
  return m;
});

const idToPath = Object.assign({}, ...maps);
console.log(idToPath["users-inactive"]); // → "users/inactive"
console.log(idToPath["reports-quarterly"]); // → "dashboard/reports/quarterly"
```

## 3 Advanced (composition using pipe, and workflow)

### 3.1 Pipeline Composition

Use `pipe` to execute a sequence of audits & transforms, and finally print the
pruned tree.

```js
// file: quicktest.js
import { filter, flatMap, map, pipe, walk } from "./tree-utils.js";

// 1) Define a pipeline: run audits, then prune, then print
const workflow = pipe(
  (nodes) => {
    const dupes = findDuplicateIds(nodes);
    const missing = findMissingFiles(nodes);
    const multiIdx = findMultipleIndexLevels(nodes);
    if (dupes.length || missing.length || multiIdx.length) {
      console.warn("Audit issues:", { dupes, missing, multiIdx });
    }
    return nodes;
  },
  (nodes) => pruneLayouts(nodes), // strip layout wrappers
  (nodes) => filter(nodes, (n) => !n.handle?.hidden), // drop hidden
  (nodes) => map(nodes, (n) => ({ ...n, label: n.handle?.label })),
);

// 2) Execute
import routes from "./routes.json" assert { type: "json" };

const result = workflow(routes);
printTree(result);
```

### 3.2 Building a workflow

```js
import { workflow } from "./tree-utils.js";

function stepA(val, ctx) {
  ctx.seenA = true;
  return val + 1;
}
function stepB(val, ctx) {
  ctx.seenB = true;
  return val * 2;
}

const wf = workflow(stepA, stepB, { z: 42 });
const result = wf.run(5); // (5 + 1) * 2 = 12
console.log(result, wf.ctx);
// → 12, { z: 42, seenA: true, seenB: true }
```
