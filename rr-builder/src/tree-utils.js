// tree-utils.js (v0.2)
/// <reference types="./tree-utils" />

/// Recursively visit every node
export function walk(nodes, onNode) {
  function recurse(list, depth) {
    for (const node of list) {
      onNode(node, depth, list);
      if (node.children) recurse(node.children, depth + 1);
    }
  }
  recurse(nodes, 0);
}

/// Pure node‐wise transform, recursing on original children
export function map(nodes, fn) {
  return nodes.map((node) => {
    const result = fn(node);
    if (node.children) {
      result.children = map(node.children, fn);
    }
    return result;
  });
}

/// Structural rewrites: zero/one/many replacements per node
export function flatMap(nodes, fn) {
  return nodes.flatMap((node) => {
    const reps = fn(node);
    return reps.flatMap((rep) => {
      if (rep.children) {
        const newChildren = flatMap(rep.children, fn);
        return [{ ...rep, children: newChildren }];
      }
      return [rep];
    });
  });
}

/// Hierarchical‐preserving filter: prunes only branches with no matches
export function filter(nodes, pred) {
  const out = [];
  for (const node of nodes) {
    // always recurse into children first
    const kids = node.children ? filter(node.children, pred) : [];
    // include this node if it passes, or if any child made the cut
    if (pred(node) || kids.length) {
      out.push({ ...node, children: kids });
    }
  }
  return out;
}

/// Bottom‐up catamorphic fold
export function reduce(nodes, fn) {
  return nodes.map((node) => {
    const childAcc = node.children ? reduce(node.children, fn) : [];
    return fn(node, childAcc);
  });
}

/// Function‐piping
export function pipe(...fns) {
  return (x) => fns.reduce((v, f) => f(v), x);
}

/// Build a pipeline with context and return a {run function, context}
export function workflow(...args) {
  let steps, ctx;

  if (Array.isArray(args[0])) {
    // [stepsArray, optionalCtx]
    [steps, ctx = {}] = args;
  } else {
    // variadic: if last arg is NOT a function, treat as ctx
    const maybeCtx = args[args.length - 1];
    if (typeof maybeCtx !== "function") {
      ctx = maybeCtx;
      steps = args.slice(0, -1);
    } else {
      ctx = {};
      steps = args;
    }
  }

  // partial application
  const stages = steps.map((fn) => (x) => fn(x, ctx));
  return {
    run(input) {
      return pipe(...stages)(input);
    },
    ctx,
  };
}
