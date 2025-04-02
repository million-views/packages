# DeepState V2 - Functional Specification

- **Version:** 2.0.0 (Draft)
- **Date:** April 1, 2025
- **Status:** Ready for review

> _NOTE_: Code and Specification may diverge post release. Code will always
> remain the source of truth!

## 1. Overview

DeepState V2 is a JavaScript library for creating deeply reactive state
management stores. It leverages ES6 Proxies to intercept property access and
mutations on nested objects and arrays, integrating with a signals-based
reactivity core (primarily `@preact/signals-core` or a compatible API) to
provide fine-grained updates.

The primary goal is to offer a simple API (`reify`) for creating state trees
where changes to any part of the tree automatically trigger updates in dependent
computations (computed properties) and effects (managed externally via the
signal primitives), while also providing mechanisms for SSR compatibility,
explicit state snapshots, and framework integration.

## 2. Core Concepts

- **Deep Reactivity:** DeepState implements deep reactivity, ensuring that
  changes made anywhere within the nested structure of managed state objects and
  arrays trigger appropriate reactive updates. This is achieved by recursively
  wrapping state data in Proxies and utilizing fine-grained Signal Primitives
  for dependency tracking.
- **Signal-Based Primitives:** Reactivity is fundamentally built upon signal
  primitives (e.g., `signal`, `computed`, `batch`, `untracked` from
  `@preact/signals-core`). DeepState wraps raw data in signals and uses computed
  signals for derived state, delegating the actual dependency tracking and
  notification logic to the underlying signal library. Dependency injection
  allows using different compatible signal libraries.
- **Proxy-Based Implementation:** ES6 Proxies are used recursively to wrap the
  state objects and arrays. Proxy traps (`get`, `set`, `deleteProperty`, `has`)
  intercept operations, allowing DeepState to interact with the underlying
  signals, trigger updates, enforce policies, and manage computed properties.
- **Inline Computed Properties:** Functions defined directly within the initial
  state object are automatically treated as computed properties, simplifying
  definition and providing local context.
- **State Mutation:** State is mutated directly via the proxy (e.g.,
  `state.prop = value`, `state.items.push(...)`) or through attached actions.
  DeepState ensures these mutations interact correctly with the underlying
  signals.
- **Restricted Replacement:** Wholesale replacement of nested arrays or objects
  via direct assignment (`state.items = newArray`) is disallowed to simplify the
  internal architecture and avoid reactivity pitfalls. Mutation is the primary
  means of modification.
- **Fine-Grained Updates:** The architecture aims to ensure that mutations
  trigger updates only for signals and computeds that truly depend on the
  changed data, leveraging the underlying signal library's dependency tracking.
  Achieving fine-grained _UI_ updates relies on the consuming framework or
  application code subscribing directly to the specific state signals needed by
  each component, rather than relying on coarser update mechanisms like
  `store.__version`.

## 3. Architecture and Theory of Operation

### 3.1. `createDeepStateAPIv2` Factory

- Provides a mechanism for dependency injection, allowing users (or package
  maintainers) to supply specific implementations of `signal`, `computed`,
  `untracked`, and `batch`. Defaults to `@preact/signals-core`.
- Introduces an optional `debug` option (`true`, `false`, or a console-like
  object) to enable internal logging. Initializes a `dbi` (debug interface)
  instance based on this flag, which is then available via closure to internal
  functions.
- Configures the escape hatch prefix (default `$`).
- Determines the execution environment (SSR vs. SPA) and selects the appropriate
  "safe" primitives (`safeSignal`, `safeComputed`, etc.).

### 3.2. SSR Detection & Safe Primitives

- Detects SSR environments (prioritizing `process.env.DEEPSTATE_MODE`, falling
  back to `!isBrowser && isNode`).
- If SSR is detected (`isSSR === true`):
  - Uses mock implementations (`SSRSignal`, `SSRComputed`) that hold state and
    allow calculation but do not establish reactive subscriptions via their
    `.subscribe()` method.
  - Uses pass-through functions for `safeUntracked` and `safeBatch`.
- If SPA mode (`isSSR === false`):
  - Uses the injected/default signal primitives (`injectedSignal`,
    `injectedComputed`, `injectedUntracked`, `injectedBatch`).

### 3.3. `reify(initial, options)` Function

- The main user-facing entry point for creating a store.
- Accepts `initial` state object and an `options` object
  (`{ permissive?, actions? }`).
- Validates that `initial` is a plain object (top-level arrays disallowed).
- Initializes a top-level version signal (`store.__version`).
- Calls `_createStateProxy` (passing down `permissive` option) to recursively
  build the proxied state tree. Internal functions within the proxy mechanism
  access the `dbi` instance via closure from the factory scope.
- Returns a `store` object containing
  `{ state: Proxy, attach: Function, toJSON: Function, snapshot: Function, actions?: object, __version?: Signal }`.

### 3.4. Recursive Proxy Creation (`_createStateProxy`, `_recursiveDeepProxy`)

- `_createStateProxy`: Sets up the initial call and establishes the `root` proxy
  reference via a closure, making it available to nested computed functions.
  Passes `permissive` option down.
- `_recursiveDeepProxy`:
  - Takes an object or array (`o`) and options (`opts` containing `permissive`).
  - Identifies functions within objects to store in a `computedFns` map for that
    level (representing initially defined computed properties).
  - Creates underlying storage (`storage`: plain object or array).
  - Iterates through the input object/array:
    - Wraps primitive values in `safeSignal`.
    - Recursively calls `_recursiveDeepProxy` for nested objects/arrays that are
      not marked `shallow`, passing `opts`.
    - Stores raw `shallow` objects directly.
    - Wraps references to `shallow` objects in a `safeSignal`.
    - For arrays, defines a non-enumerable `__version` property holding a
      `safeSignal(0)`.
  - Creates an ES6 Proxy with a `handler` around the `storage`.
  - The `handler` closes over `computedFns`, `root`, and `opts` (including
    `permissive`). Internal logging uses the `dbi` instance from the factory
    closure.

### 3.5. Proxy Handler Traps

- **`get(target, prop, receiver)`:**
  - Handles escape hatch (`$`) access, returning the underlying signal/proxy or
    materializing/returning the computed signal object.
  - Handles `snapshot` and `toJSON` property access, returning functions that
    perform the snapshotting logic (`snapshot` includes computeds after
    materialization, `toJSON` excludes computeds/functions).
  - Reads `target.__version.value` for arrays (when `prop !== '__version'`) to
    establish dependency (SPA only).
  - Checks `target` (`storage`) for the property. Returns signal value or raw
    value. Returns the `__version` signal object itself if requested.
  - Checks `computedFns` (for initial computeds) and `target` (for dynamic
    computeds). Handles caching and calls `derivedBy` to create/cache computed
    signals on `target`. Returns computed value.
  - Handles array method access.
  - Uses `dbi` from closure for logging.
- **`set(target, prop, newVal, receiver)`:**
  - Disallows setting via escape hatch (`$prop`) or setting initially defined
    computed properties (throws `TypeError`).
  - Updates existing signals. Increments `array.__version` if applicable.
  - Handles array index assignments. Increments `array.__version`.
  - Handles array `length` assignment. Increments `array.__version`.
  - If `prop` is new on an object: If `permissive: true`, checks if `newVal` is
    a function. If yes, creates a computed property using `derivedBy` and stores
    the resulting computed signal; if no, wraps the value using
    `safeSignal(deep_wrap(newVal))` and adds it to `target`. If
    `permissive: false`, throws `TypeError`.
  - Throws `TypeError` on attempts to replace existing nested proxies (wholesale
    object/array replacement).
  - Uses `dbi` from closure for logging.
- **`deleteProperty(target, prop)`:** Intercepts the `delete` operator.
  Disallows deleting via escape hatch (`$prop`). For existing properties on the
  target (`storage`) or initially defined computed properties (`computedFns`),
  deletion is only permitted if `permissive` mode is `true` OR if the target is
  an array and `prop` is a numeric index. If deletion is disallowed due to
  strict mode, a `TypeError` is thrown. If the property does not exist or
  deletion is prevented via escape hatch, `true` is returned (to satisfy proxy
  invariants). Otherwise, returns the boolean result of
  `Reflect.deleteProperty`. Increments `array.__version` if applicable. Uses
  `dbi` from closure for logging. (See Section 3.11).
- **`has(target, prop)`:** Checks for `prop` existence in `target` (`storage`)
  or `computedFns`. Handles escape hatch prefix correctly.

### 3.6. Computed Property Handling (`derivedBy`)

- Called by the `get` trap (for initial computeds) or the `set` trap (for
  dynamically added computeds in permissive mode).
- Receives `self` (the proxy `receiver`), `fn` (the original computed function),
  `rootFromClosure`. Uses `dbi` from closure.
- Uses `safeComputed` to wrap execution logic, calling `fn` with `self` or
  `self, root`.
- Tags signal with `_fn`. Returns `safeComputed` instance.

### 3.7. State Versioning (`__version`)

- **`store.__version`**: A `safeSignal(0)` incremented after `safeBatch`
  completes in the `attach` wrapper for actions. Serves as a coarse-grained
  notification mechanism for framework integration.
- **`array.__version`**: A `safeSignal(0)` on array storage, incremented by
  `set`/`deleteProperty` traps. Read by `get` trap (SPA only). Allows effects to
  depend on array structure changes.

### 3.8. Snapshotting (`createSnapshot`)

- Recursive function. Uses `untrackedFn`. Takes `options { forJson }`.
- Handles primitives, signals (`peek`), shallow objects, circular refs.
- Iterates target keys via `Reflect.ownKeys(proxy)`. Excludes non-materialized
  computeds when called by `toJSON`. Includes materialized computeds (initial or
  dynamic) if present on target.
- Skips internal properties/symbols. Accesses values via proxy. Skips functions
  if `forJson`.
- The behavior of `toJSON` (excluding computed properties) is consistent with
  the documented behavior in V1.

### 3.9. Actions (`attach`, `options.actions`)

- Actions are wrapped. Wrapper executes original action in `safeBatch` (no-op in
  SSR).
- Action receives `state` proxy. Supports `async` actions.
- `safeBatch` scope and `store.__version` timing nuances apply to async actions
  (version increments after sync start).
- Wrapper returns action's result.

### 3.10. Shallow Objects (`shallow()`)

- `shallow(obj)` adds `IS_SHALLOW` symbol.
- Shallow objects are not proxied internally; their reference is wrapped in
  `safeSignal`.

### 3.11. Permissive Mode (`options.permissive`)

The `permissive` option, passed to `reify`, controls the strictness of shape
enforcement for proxied objects within the state tree after initialization. It
defaults to `false` (strict mode), providing stronger guarantees about the state
structure.

- **Strict Mode (`permissive: false`):**
  - **Purpose:** Enforces a fixed shape for state objects based on the
    properties defined in the `initial` state passed to `reify`. This helps
    prevent accidental structural modifications (adding or deleting properties,
    including computed properties) and ensures predictability, which is often
    beneficial in larger applications or teams.
  - **Behavior (`set` trap):** Prevents _adding_ new properties to existing
    proxied objects. Attempting to set a property that does not exist on the
    object will throw a `TypeError`.
  - **Behavior (`deleteProperty` trap):** Prevents _deleting_ existing data
    properties _and_ initially defined computed property definitions from
    proxied objects. Attempting to delete a property defined in the initial
    shape will throw a `TypeError`.
  - **Exceptions:** This strictness does _not_ apply to array contents. Deleting
    numeric indices from arrays (`delete state.myArray[0]`) is still allowed in
    strict mode. Standard array mutation methods (`push`, `splice`, etc.) also
    remain functional, modifying the array's contents without changing the
    object's shape.

- **Permissive Mode (`permissive: true`):**
  - **Purpose:** Allows the shape of state objects to evolve dynamically after
    initialization. Useful for scenarios like managing caches, implementing
    dynamic UI state sections, during rapid prototyping, or when integrating
    with less strictly typed data sources where the exact shape isn't known
    upfront or needs to change.
  - **Behavior (`set` trap):** Allows _adding_ new properties to existing
    proxied objects. If the value being added is a function, it is automatically
    treated as a new **computed property** (using `derivedBy`). Otherwise, the
    new property's value will be appropriately wrapped (e.g., in a
    `safeSignal`).
  - **Behavior (`deleteProperty` trap):** Allows _deleting_ any existing
    property (data properties, array properties, computed definitions - initial
    or dynamic) using the `delete` operator.

## 4. API Reference (High-Level)

- **`createDeepStateAPIv2(dependencies?: DepOptions, esc?: string): { shallow, reify }`:**
  - `DepOptions`:
    `{ signal?, computed?, untracked?, batch?, debug?: boolean | object }`
- **`reify(initialState: Object, options?: Options): Store`:**
  - `options`: `{ permissive?: boolean, actions?: object }`
  - `Store`:
    `{ state: Proxy, attach: Function, actions?: object, toJSON: Function, snapshot: Function, __version: Signal }`
- **`shallow(obj: Object): Object`:** Marks an object as shallow.
- **`store.state`:** The root proxy object. Access properties, computeds,
  `$prop`, `toJSON()`, `snapshot()`. Array proxies have `.__version`.
- **`store.attach(actions: object): Store`:** Attaches actions.
- **`store.actions`:** Object containing attached actions.
- **`store.toJSON(): Object`:** Data-only snapshot.
- **`store.snapshot(): Object`:** Full snapshot including computeds.
- **`store.__version`:** Top-level version signal.

## 5. Assumptions & Limitations

- **Signal Primitive Dependency:** Requires `@preact/signals-core` compatible
  primitives.
- **SSR Reactivity:** No reactive `effect` loop in SSR mode.
- **Array/Object Replacement:** Disallowed via direct/escape hatch assignment.
- **Proxy Overhead:** Minor performance overhead exists.
- **Functions in State:** Discouraged unless intended as computeds (initial or
  dynamically added via permissive mode).
- **Strict Mode Scope:** Enforces object shape (including initial computed
  properties); doesn't prevent array content mutation.
- **Async Action Nuances:** `safeBatch` covers sync start; `store.__version`
  increments at sync start.
- **Escape Hatch (`$`) and Deep Reactivity:** Accessing an underlying signal via
  the escape hatch (e.g., `let { $prop: sig } = state`) and then directly
  setting its value to a non-primitive (e.g., `sig.value = { new: 'object' }` or
  `sig.value = [1, 2]`) bypasses DeepState's proxy wrapping mechanism for the
  new value. While the signal update will trigger effects depending on the
  signal itself, the _internal structure_ of the newly assigned object or array
  will _not_ be deeply reactive. Subsequent mutations to the properties or
  elements of this new object/array will not be tracked by DeepState. Use the
  standard proxy assignment (`state.prop = { new: 'object' }`) to ensure new
  structures remain deeply reactive.

## 6. Motivation, Rationale, and Comparison

### 6.1. Mutational DX via Proxies & Signals

Core goal: Intuitive state management via modern JS, balancing DX with good
performance for reactive UI updates.

- **Familiarity/Intuitiveness:** Allows direct mutation syntax
  (`state.prop = value`).
- **Reduced Boilerplate:** Avoids verbose immutable update patterns for nested
  changes.
- **Transparency via Proxies:** Proxies intercept "mutations" and translate them
  into underlying Signal updates automatically.
- **Leveraging Signal Primitives:** Achieves reactivity and predictability via
  the signal graph, offering similar benefits to immutable patterns through a
  different mechanism.

### 6.2. Key Differentiators

- **Proxy-based Deep Reactivity**
- **Signal Primitive Core**
- **Mutational DX**
- **Inline & Dynamic Computed Properties:** Automatic detection/handling of
  functions (initial or added in permissive mode) as reactive computations with
  local context (`self`, `root`).

### 6.3. Comparison with Redux

- **Immutability:** Redux (strict) vs. DeepState (proxied mutation interface).
- **Update Mechanism:** Redux (reducers/dispatch) vs. DeepState (proxy
  traps/actions).
- **Structure:** Redux (single store) vs. DeepState (standalone stores via
  `reify`).
- **Boilerplate:** DeepState aims for less (inline/dynamic computeds, direct
  mutation).
- **Granularity:** Redux (selectors) vs. DeepState (signal graph).

### 6.4. Comparison with Zustand

- **Update Mechanism:** Zustand (immutable via `set` functions) vs. DeepState
  (proxied mutations).
- **Deep Reactivity:** Zustand (shallow default) vs. DeepState (deep default).
- **API Style:** Zustand (hook-centric) vs. DeepState (framework-agnostic store
  object).
- **Computed State:** Zustand (selectors) vs. DeepState (inline/dynamic
  computeds).

### 6.5. Performance Considerations

- **Proxy Overhead:** Small, generally negligible.
- **Signal Performance:** Dependent on underlying signal library.
- **Fine-Grained Benefits:** Potential for efficient updates via signal graph.
