// tree-utils.d.ts (v0.2)

/**
 * Walks a tree, invoking a callback for each node in depth-first order.
 * @template T
 * @param nodes - Array of tree nodes.
 * @param onNode - Callback receiving (node, depth, siblings).
 */
export function walk<T>(
  nodes: T[],
  onNode: (node: T, depth: number, siblings: T[]) => void
): void;

/**
 * Maps each node via the provided function, preserving tree structure.
 * @template T
 * @param nodes - Array of tree nodes.
 * @param fn - Mapping function returning a new node.
 * @returns Mapped tree.
 */
export function map<T>(
  nodes: T[],
  fn: (node: T) => T
): T[];

/**
 * Applies a mapping function to each node that returns an array, then flattens the result.
 * @template T
 * @param nodes - Array of tree nodes.
 * @param fn - Mapping function returning T[].
 * @returns Flattened mapped nodes.
 */
export function flatMap<T>(
  nodes: T[],
  fn: (node: T) => T[]
): T[];

/**
 * Filters nodes by a predicate (preserving nesting), pruning branches for which
 * the predicate is false.
 * @template T
 * @param nodes - Array of tree nodes.
 * @param pred - Predicate function.
 * @returns Filtered tree.
 */
export function filter<T>(
  nodes: T[],
  pred: (node: T) => boolean
): T[];

/**
 * Performs a bottom-up (catamorphic) reduction over a tree.
 * @template T,R
 * @param nodes - Array of tree nodes.
 * @param fn - Reducer receiving (node, array of child results) and returning an accumulator.
 * @returns Array of R for each root node.
 */
export function reduce<T, R>(
  nodes: T[],
  fn: (node: T, childrenAcc: R[]) => R
): R[];

/**
 * Composes multiple functions left-to-right into a single unary function.
 * @template A,B
 * @param fns - Functions to compose.
 * @returns Composed function.
 */
export function pipe<A, B>(
  ...fns: Array<(arg: any) => any>
): (a: A) => B;

/**
 * Builds a workflow runner from a sequence of discrete steps, each of which 
 * receives the current value plus a shared context and returns the next value.
 * 
 * There are three overloads:
 * 1) Array form: pass an array of steps and optionally an initial context.
 *    Let's you do: `workflow([stepA, stepB, stepC], myCtx?)`
 * 
 * 2) Variadic form with trailing context: 
 *    last argument (non-function) is taken as C.
 *    Let's you do: `workflow(stepA, stepB, stepC, myCtx)`
 * 
 * 3) Pure variadic form: all args are step functions, ctx defaults to {}.
 *    Let's you do: `workflow(stepA, stepB, stepC)`
 * 
 * @template I  — the type of the initial input to `run`
 * @template O  — the type of the final output from `run`
 * @template C  — the shape of the shared context object
 *
 * @param steps
 *   An array of functions `(value: any, ctx: C) => any`.  On execution,
 *   these are composed into a single pipeline under the hood.
 *   The first step receives your input of type `I`, and the last step’s
 *   return value will be of type `O`.
 *
 * @param initial
 *   An optional initial context object of type `C` (defaults to `{}`).
 *
 * @returns
 *   An object containing:
 *   - `run(input: I): O` — executes the composed pipeline and returns the final value.
 *   - `ctx: C`          — the shared context for each step to look up or store data
 */
export function workflow<
  I,
  O,
  C extends object = Record<string, unknown>
>(
  steps: Array<(value: any, ctx: C) => any>,
  initialCtx?: C
): {
  run(input: I): O;
  ctx: C;
};

export function workflow<
  I,
  O,
  C extends object
>(
  ...args: [...Array<(value: any, ctx: C) => any>, C]
): {
  run(input: I): O;
  ctx: C;
};

export function workflow<
  I,
  O,
  C extends object = Record<string, unknown>
>(
  ...steps: Array<(value: any, ctx: C) => any>
): {
  run(input: I): O;
  ctx: C;
};
