# DeepState V2 - Functional Specification

- **Version:** 2.0.1 (Draft)
- **Date:** April 3, 2025
- **Status:** Revised

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
explicit state snapshots, and framework integration with configurable behaviors.

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
  definition and providing local context (`self`, `root`).
- **State Mutation:** State is mutated directly via the proxy (e.g.,
  `state.prop = value`, `state.items.push(...)`) or through attached actions.
  DeepState ensures these mutations interact correctly with the underlying
  signals.
- **Restricted Replacement:** Wholesale replacement of nested arrays or objects
  via direct assignment (`state.items = newArray`) is disallowed by default to
  simplify the internal architecture and avoid reactivity pitfalls. Mutation is
  the primary means of modification.
- **Fine-Grained Updates:** The architecture aims to ensure that mutations
  trigger updates only for signals and computeds that truly depend on the
  changed data, leveraging the underlying signal library's dependency tracking.
  Achieving fine-grained _UI_ updates relies on the consuming framework or
  application code subscribing directly to the specific state signals needed by
  each component, rather than relying on coarser update mechanisms like
  `store.__version`.

## 3. Architecture and Theory of Operation

### 3.1. `createDeepStateAPIv2` Factory

- **Signature:** `createDeepStateAPIv2(dependencies?, options?)`
- Provides a mechanism for dependency injection via the optional `dependencies`
  object, allowing users (or package maintainers) to supply specific
  implementations of `signal`, `computed`, `untracked`, and `batch`. Defaults
  are provided internally (conceptually matching `@preact/signals-core`).
- Accepts an optional `options` object for configuration:
  - `debug` (boolean | object, default: `false`): Enables internal logging. If
    `true`, logs to `console`. If an object with `log`/`error` methods, uses
    that object.
  - `escapeHatch` (string, default: `'$'`): Defines the prefix character for
    accessing underlying signal objects or triggering special behavior. Can be
    changed (e.g., to `_` for Svelte).
  - `enableReactSsrEscapeHatchPatch` (boolean, default: `false`): If `true`,
    modifies the behavior of the escape hatch (`$prop` or custom) _only during
    SSR_ to return the primitive value instead of the signal mock object. This
    is primarily intended as an option for the React entry point to mimic V1
    behavior and avoid SSR errors when rendering `$prop` directly, but has
    client-side hydration implications (see Section 5).
- Initializes a `dbi` (debug interface) instance based on the `debug` flag.
- Determines the execution environment (SSR vs. SPA) and selects the appropriate
  "safe" primitives (`safeSignal`, `safeComputed`, etc.).
- Stores the configured `escapeHatch` character and the internal
  `useReactSsrPatch` flag (derived from `enableReactSsrEscapeHatchPatch`) for
  use by proxy handlers.

### 3.2. SSR Detection & Safe Primitives

- Detects SSR environments (prioritizing `process.env.DEEPSTATE_MODE`, falling
  back to `!isBrowser && isNode`).
- If SSR is detected (`isSSR === true`):
  - Uses mock implementations (`SSRSignal`, `SSRComputed`) that hold state and
    allow calculation but do not establish reactive subscriptions via their
    `.subscribe()` method. These mocks implement `.value`, `.peek()`,
    `.toString()`, `.valueOf()`, `[Symbol.toPrimitive]`, and `.toJSON()` methods
    that return the current value or computed result.
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
  access `dbi`, `isSSR`, `escapeHatch`, and the `useReactSsrPatch` flag via
  closure from the factory scope.
- Returns a `store` object containing
  `{ state: Proxy, attach: Function, toJSON: Function, snapshot: Function, actions?: object, __version?: Signal }`.

### 3.4. Recursive Proxy Creation (`_createStateProxy`, `_recursiveDeepProxy`)

- `_createStateProxy`: Sets up the initial call and establishes the `root` proxy
  reference via a closure, making it available to nested computed functions.
  Passes `permissive` option and the internal `_useReactSsrPatch` flag down to
  `_recursiveDeepProxy`.
- `_recursiveDeepProxy`:
  - Takes an object or array (`o`) and `currentLevelOpts` (containing
    `permissive` and `_useReactSsrPatch`).
  - Identifies functions within objects to store in a `computedFns` map for that
    level.
  - Creates underlying storage (`storage`: plain object or array).
  - Iterates through the input object/array:
    - Wraps primitive values or existing signal instances in `safeSignal`.
    - Recursively calls `_recursiveDeepProxy` for nested objects/arrays that are
      not marked `shallow`, passing `currentLevelOpts`.
    - Wraps references to `shallow` objects in a `safeSignal`.
    - For arrays, defines a non-enumerable `__version` property holding a
      `safeSignal(0)`.
  - Creates an ES6 Proxy with a `handler` around the `storage`.
  - The `handler` closes over `computedFns`, `root`, `currentLevelOpts`,
    `isSSR`, `escapeHatch`, and `dbi`.

### 3.5. Proxy Handler Traps

- **`get(target, prop, receiver)`:**
  - **Escape Hatch Access (`options.escapeHatch` prefix):** Handles access via
    the configured escape hatch prefix.
    - In **SPA mode**, returns the underlying `Signal`/`Computed` object
      (materializing computeds if necessary).
    - In **SSR mode**, behavior depends on the `enableReactSsrEscapeHatchPatch`
      option passed to the factory:
      - If `true`, returns the primitive value (`.value`) of the underlying
        `SSRSignal` or `SSRComputed` mock object.
      - If `false`, returns the underlying `SSRSignal`/`SSRComputed` mock object
        itself.
  - **Snapshot/toJSON Access:** Handles `snapshot` and `toJSON` property access.
    The getter for the `snapshot` property attempts to pre-materialize computed
    properties before calling `createSnapshot`. Returns functions that invoke
    `createSnapshot` with appropriate options (`{ forJson: true/false }`).
  - **Array Version Tracking:** Reads `target.__version.value` for arrays (when
    `prop !== '__version'`) to establish dependency (SPA only).
  - **Standard Access:** Checks `target` (`storage`) for the property. If found:
    returns `signal.value` if it's a signal, otherwise returns the raw value
    (e.g., a nested proxy or a shallow object reference). Returns the
    `__version` signal object itself if requested.
  - **Computed Access:** Checks `computedFns` (for initial computeds) and
    `target` (for dynamic computeds cached after first access). If found,
    handles caching (stores signal instance on `target` on first access) and
    calls `derivedBy` to create/cache computed signals as needed. Returns the
    computed signal's `.value`.
  - **Array Methods:** Intercepts access to standard array methods (e.g.,
    `push`, `map`) and binds them to the `receiver` (the proxy) to ensure that
    mutations performed via these methods trigger the appropriate proxy traps
    (`set`, `deleteProperty`) and update array versioning.
  - Uses `dbi` from closure for logging.
- **`set(target, prop, newVal, receiver)`:**
  - Disallows setting via escape hatch (`$prop`) or setting initially defined
    computed properties (throws `TypeError`).
  - Updates existing signals (`signal.value = ...`). Increments
    `array.__version` if applicable (array index/length assignments).
  - Handles array index assignments. Increments `array.__version`.
  - Handles array `length` assignment. Increments `array.__version`.
  - If `prop` is new on an object: If `permissive: true`, checks if `newVal` is
    a function. If yes, creates a computed property using `derivedBy` and stores
    the resulting computed signal on `target`; if no, wraps the value using
    `safeSignal(deep_wrap(newVal))` and adds it to `target`. If
    `permissive: false`, throws `TypeError`.
  - Throws `TypeError` on attempts to replace existing nested proxies (wholesale
    object/array replacement).
  - Uses `dbi` from closure for logging.
- **`deleteProperty(target, prop)`:** Intercepts the `delete` operator.
  - Disallows deleting via escape hatch (`$prop`), returning `true` (to satisfy
    proxy invariants).
  - For existing properties on the `target` (`storage`) or initially defined
    computed properties (`computedFns`): deletion is only permitted if
    `permissive` mode is `true` OR if the target is an array and `prop` is a
    numeric index.
  - If deletion is disallowed due to strict mode, a `TypeError` is thrown.
  - If the property does not exist, `true` is returned.
  - Otherwise, performs `Reflect.deleteProperty` on the `target` or removes from
    `computedFns` (if permissive).
  - Increments `array.__version` if applicable (array index deletion). Uses
    `dbi` from closure for logging.
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
  `set`/`deleteProperty` traps affecting array indices or length. Read by `get`
  trap (SPA only) to track array modifications. Allows effects to depend on
  array structure changes.

### 3.8. Snapshotting (`createSnapshot`)

- Recursive function called internally by `store.toJSON()` and
  `store.snapshot()`. Uses `safeUntracked`. Takes `options { forJson }`.
- Handles primitives, signals (`peek`), shallow objects (returns the raw object
  reference), and circular references (via `WeakMap`).
- Iterates target keys discovered via `Reflect.ownKeys(proxy)`. (Note: Relies on
  default proxy `ownKeys` behavior unless explicitly implemented, potentially
  affected by computed property caching timing).
- Accesses values via the `source[key]` proxy access.
- The getter for the `snapshot` property (exposed via `store.state.snapshot`)
  attempts to pre-materialize computed properties by accessing them before
  calling the recursive `createSnapshot` utility, aiming to ensure they are
  discoverable during key iteration.
- Includes resolved computed property values if `forJson` is `false` and the
  computed property key is discovered during iteration. Excludes computed
  properties (and all functions) if `forJson` is `true`.
- Skips internal properties/symbols (`__version`, escape hatch props) and
  snapshot/toJSON methods.

### 3.9. Actions (`attach`, `options.actions`)

- Actions provided via `reify` options or `attach` are wrapped.
- Wrapper executes original action within `safeBatch` (no-op in SSR).
- Action receives `state` proxy as the first argument. Supports `async` actions.
- `safeBatch` scope and `store.__version` timing nuances apply to async actions
  (`store.__version` increments after the synchronous part of the action
  starts/completes its batch).
- Wrapper returns the original action's result.

### 3.10. Shallow Objects (`shallow()`)

- `shallow(obj)` adds `IS_SHALLOW` symbol.
- Shallow objects are not proxied internally. Their _reference_ is wrapped in
  `safeSignal` and stored within the parent structure. Mutations _within_ the
  shallow object are not tracked by DeepState.

### 3.11. Permissive Mode (`options.permissive`)

- (Description remains the same as original spec provided)

## 4. API Reference (High-Level)

- **`createDeepStateAPIv2(dependencies?: DepOptions, options?: FactoryOptions): { shallow, reify }`:**
  - `DepOptions`: `{ signal?, computed?, untracked?, batch? }` (Signal
    primitives)
  - **`FactoryOptions`**:
    `{ debug?: boolean | object, escapeHatch?: string, enableReactSsrEscapeHatchPatch?: boolean }`
    (Configuration, see 3.1 for defaults)
- **`reify(initialState: Object, options?: ReifyOptions): Store`:**
  - **`ReifyOptions`**: `{ permissive?: boolean, actions?: object }` (Store
    creation options)
  - `Store`:
    `{ state: Proxy, attach: Function, actions?: object, toJSON: Function, snapshot: Function, __version: Signal }`
- **`shallow(obj: Object): Object`:** Marks an object as shallow.
- **`store.state`:** The root proxy object. Access properties (`.prop`),
  computeds (`.computed`), use escape hatch (`.$prop`, `_prop`, etc.), call
  `.toJSON()`, `.snapshot()`. Array proxies expose a `.__version` signal.
- **`store.attach(actions: object): Store`:** Attaches actions. Returns the
  store for chaining.
- **`store.actions`:** Object containing all attached actions. Call like methods
  (`store.actions.myAction()`).
- **`store.toJSON(): Object`:** Returns a plain JavaScript object representation
  suitable for serialization (e.g., `JSON.stringify`) or SSR hydration.
  **Excludes computed properties and functions.**
- **`store.snapshot(): Object`:** Returns a plain JavaScript object
  representation including the **resolved values** of computed properties found
  during snapshotting. Useful for debugging or testing.
- **`store.__version`:** A top-level signal (`Signal<number>`) that increments
  after any attached action completes. Useful for coarse-grained change
  detection.

## 5. Assumptions & Limitations

- **Signal Primitive Dependency:** Requires `@preact/signals-core` compatible
  primitives (or alternatives provided via dependency injection).
- **SSR Reactivity:** No reactive `effect` loop runs in SSR mode. Computed
  properties re-evaluate on every access via `.value`.
- **Array/Object Replacement:** Wholesale replacement of nested objects/arrays
  via direct proxy assignment (`state.nested = {}`) is disallowed by default.
  Use mutation or actions. Escape hatch assignment
  (`state.$nested = newSignal()`) updates the signal reference but doesn't
  deeply wrap the new value automatically.
- **Proxy Overhead:** Minor performance overhead exists compared to plain
  objects, generally negligible.
- **Functions in State:** Storing arbitrary functions as state properties is
  discouraged unless they are intended as computeds (either defined inline
  initially or added dynamically in permissive mode).
- **Strict Mode Scope:** Enforces object shape (properties present at
  initialization); doesn't prevent mutation of array _contents_ or properties
  _within_ nested objects.
- **Async Action Nuances:** `safeBatch` typically only covers the synchronous
  start of an async action. `store.__version` increments after this synchronous
  batch completes.
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
- **Conditional SSR Escape Hatch (`enableReactSsrEscapeHatchPatch`):** Enabling
  this option (`true`) allows rendering escape-hatch properties (e.g.,
  `{$prop}`) directly during SSR without error by returning the primitive value.
  However, this creates an inconsistency with client-side behavior (where the
  escape hatch returns the signal object). This inconsistency can lead to
  **client-side hydration errors** if the same `{$prop}` pattern is used on the
  client without appropriate handling (like using React's implicit
  `<SignalValue/>` component which requires `useSignals` context, or explicitly
  rendering `$prop.value`). Use this patch with caution and prefer standard
  access (`state.prop`) or explicit value access (`$prop.value`) in components
  for better cross-environment reliability.
- **Snapshot Reliability for Computeds:** The `snapshot()` function relies on
  iterating proxy keys. Including computed properties depends on them being
  accessed/cached onto the internal storage before or during key iteration by
  `createSnapshot`. While usually reliable via pre-materialization, complex
  scenarios or future proxy implementation changes might affect this.
  Implementing `ownKeys` on the proxy handler could provide greater robustness.

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
