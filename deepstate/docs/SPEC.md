# DeepState V2 - Functional Specification

- **Version:** 2.0.0 (Draft)
- **Date:** April 1, 2025
- **Status:** Draft

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

- **Deep Reactivity:** Unlike libraries that only track top-level property
  changes, DeepState aims for reactivity throughout the entire nested structure
  of objects and arrays within the managed state.
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
- Validates that `initial` is a plain object (top-level arrays disallowed).
- Initializes a top-level version signal (`store.__version`).
- Calls `_createStateProxy` to recursively build the proxied state tree.
- Returns a `store` object containing
  `{ state: Proxy, attach: Function, toJSON: Function, snapshot: Function, actions?: object, __version?: Signal }`.

### 3.4. Recursive Proxy Creation (`_createStateProxy`, `_recursiveDeepProxy`)

- `_createStateProxy`: Sets up the initial call and establishes the `root` proxy
  reference via a closure, making it available to nested computed functions.
- `_recursiveDeepProxy`:
  - Takes an object or array (`o`) and options (`opts`).
  - Identifies functions within objects to store in a `computedFns` map for that
    level.
  - Creates underlying storage (`storage`: plain object or array).
  - Iterates through the input object/array:
    - Wraps primitive values in `safeSignal`.
    - Recursively calls `_recursiveDeepProxy` for nested objects/arrays that are
      not marked `shallow`.
    - Stores raw `shallow` objects directly.
    - Wraps references to `shallow` objects in a `safeSignal`.
    - For arrays, defines a non-enumerable `__version` property holding a
      `safeSignal(0)`.
  - Creates an ES6 Proxy with a `handler` around the `storage`.
  - The `handler` closes over `computedFns` for that level, the `root` proxy
    reference from the outer scope, and the `currentLevelOpts` (including
    `permissive`).

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
  - Checks `computedFns`. Handles caching and calls `derivedBy` to create/cache
    computed signals on `target`. Returns computed value.
  - Handles array method access.
- **`set(target, prop, newVal, receiver)`:**
  - Disallows setting via escape hatch (`$prop`) or setting computed properties
    (throws `TypeError`).
  - Updates existing signals. Increments `array.__version` if applicable.
  - Handles array index assignments (adds/overwrites). Increments
    `array.__version`.
  - Handles array `length` assignment. Increments `array.__version`.
  - If `prop` is new on an object: Adds property (wrapped in `safeSignal`) if
    `permissive: true`; throws `TypeError` if `permissive: false`.
  - Throws `TypeError` on attempts to replace existing nested proxies (wholesale
    object/array replacement).
- **`deleteProperty(target, prop)`:** Intercepts the `delete` operator.
  Disallows deleting via escape hatch (`$prop`). Allows deleting computed
  property definitions. For other existing properties on the target (`storage`),
  deletion is only permitted if `permissive` mode is `true` OR if the target is
  an array and `prop` is a numeric index. If deletion is disallowed due to
  strict mode, a `TypeError` is thrown. If the property does not exist or
  deletion is prevented via escape hatch, `true` is returned (to satisfy proxy
  invariants). Otherwise, returns the boolean result of
  `Reflect.deleteProperty`. Increments `array.__version` if an array index was
  successfully deleted. (See Section 3.11 for full details on Permissive Mode).
- **`has(target, prop)`:** Checks for `prop` existence in `target` (`storage`)
  or `computedFns`. Handles escape hatch prefix correctly.

### 3.6. Computed Property Handling (`derivedBy`)

- Called by the `get` trap when a computed property is accessed.
- Receives `self` (the current level's proxy, `receiver`), `fn` (the original
  computed function), `rootFromClosure`, and debug instance (`dbi`).
- Uses `safeComputed` to wrap the execution logic.
- The wrapped function checks for `root` availability (if `fn` expects >1
  argument) and calls `fn` with `self` or `self, root`.
- Tags the created computed signal with `_fn` for caching checks.
- Returns the `safeComputed` instance.

### 3.7. State Versioning (`__version`)

- **`store.__version`**: A `safeSignal(0)` incremented after `safeBatch`
  completes in the `attach` wrapper for actions. Its primary purpose is to serve
  as a **coarse-grained notification mechanism** for external integrations or
  framework adapters. Subscribing _only_ to `store.__version` can simplify
  integration by providing a single trigger after any action completes,
  potentially signaling the need for a UI re-render. However, this approach
  sacrifices granularity, as components subscribing this way may update even if
  the specific data they depend on was not affected by the action. This
  contrasts with subscribing directly to fine-grained state signals for more
  precise updates (see Section 2, Fine-Grained Updates).
- **`array.__version`**: A `safeSignal(0)` added to array `storage`, incremented
  by `set` and `deleteProperty` traps when indices or length change. Read by the
  `get` trap to establish dependencies (SPA only). This allows effects or
  components depending on array _structure_ (e.g., list renderings) to update
  efficiently without needing to depend on every individual item's signal.

### 3.8. Snapshotting (`createSnapshot`)

- Recursive function to create a plain JS object/array representation of the
  state.
- Uses `untrackedFn` (`safeUntracked`) to prevent signal subscriptions during
  the process.
- Takes `options` object (`{ forJson: boolean }`).
- Handles primitives, `null`, and `shallow` objects (returns them directly).
- Handles signals by recursively calling `createSnapshot` on `signal.peek()`.
- Handles circular references using a `WeakMap`.
- Iterates arrays/objects using `Reflect.ownKeys(proxy)`, which defaults to
  iterating the keys of the `target` (`storage`) object/array. This naturally
  excludes computed properties that haven't been materialized onto the target
  when called by `toJSON`.
- Skips internal properties/symbols (`$`, `__version`, `snapshot`, `toJSON`).
- For object properties, accesses value via the proxy (`source[key]`) to resolve
  any materialized signals/computeds.
- If `forJson` is true, skips properties whose resolved value is a function.

### 3.9. Actions (`attach`, `options.actions`)

- Actions provided via `options.actions` or `store.attach(actions)` are wrapped
  to integrate them with the store's reactivity and versioning.
- The wrapper executes the original action function within `safeBatch` (which is
  a no-op in SSR). This batches any synchronous signal mutations performed
  directly within the action's initial execution context (in SPA mode).
- The action receives the `state` proxy as its first argument, allowing it to
  directly read and mutate the state.
- **Asynchronous Actions:** Action functions can be `async` and perform
  asynchronous operations (e.g., `fetch`). DeepState's wrapper does not prevent
  this, and will return the Promise returned by the async action.
  - **Batching Scope:** Note that `safeBatch` typically only applies to
    synchronous signal updates occurring _before_ the first `await` in an async
    action. Updates made after an `await` might occur outside the initial batch
    and trigger separate notifications downstream, depending on the behavior of
    the underlying signal library.
  - **`store.__version` Timing:** After the `safeBatch` wrapper completes (which
    usually happens synchronously after the action function is invoked, even if
    it returns a Promise), the top-level `store.__version` signal is
    incremented. This means `store.__version` signals the _initiation and
    synchronous completion_ of the action, **not** the completion of any
    asynchronous operations within it. If tracking the final completion of an
    async operation is required, the action should manage its own state signals
    (e.g., `isLoading`, `error`) or return a Promise that callers can await.
- The wrapper returns whatever the original action function returns (e.g., a
  value or a Promise).

### 3.10. Shallow Objects (`shallow()`)

- `shallow(obj)` adds a non-enumerable symbol `IS_SHALLOW` to the object.
- When encountered during recursive proxy creation:
  - The `IS_SHALLOW` object itself is _not_ proxied internally.
  - The _reference_ to the shallow object is wrapped in a `safeSignal` in the
    parent's `storage`.
- This allows reactivity when the _reference_ is replaced, but prevents
  reactivity tracking _within_ the shallow object's properties.

### 3.11. Permissive Mode (`options.permissive`)

The `permissive` option, passed to `reify`, controls the strictness of shape
enforcement for proxied objects within the state tree after initialization. It
defaults to `false` (strict mode), providing stronger guarantees about the state
structure.

- **Strict Mode (`permissive: false`):**
  - **Purpose:** Enforces a fixed shape for state objects based on the
    properties defined in the `initial` state passed to `reify`. This helps
    prevent accidental structural modifications (adding or deleting properties)
    and ensures predictability, which is often beneficial in larger applications
    or teams.
  - **Behavior (`set` trap):** Prevents _adding_ new properties to existing
    proxied objects. Attempting to set a property that does not exist on the
    object will throw a `TypeError`.
  - **Behavior (`deleteProperty` trap):** Prevents _deleting_ existing
    properties from proxied objects. Attempting to delete a property defined in
    the initial shape will throw a `TypeError`.
  - **Exceptions:** This strictness does _not_ apply to array contents or
    computed property definitions. Deleting numeric indices from arrays
    (`delete state.myArray[0]`) and deleting computed property definitions
    (`delete state.myComputed`) is still allowed in strict mode. Standard array
    mutation methods (`push`, `splice`, etc.) also remain functional, modifying
    the array's contents without changing the object's shape.

- **Permissive Mode (`permissive: true`):**
  - **Purpose:** Allows the shape of state objects to evolve dynamically after
    initialization. Useful for scenarios like managing caches, implementing
    dynamic UI state sections, during rapid prototyping, or when integrating
    with less strictly typed data sources where the exact shape isn't known
    upfront or needs to change.
  - **Behavior (`set` trap):** Allows _adding_ new properties to existing
    proxied objects. The new property's value will be appropriately wrapped
    (e.g., in a `safeSignal`).
  - **Behavior (`deleteProperty` trap):** Allows _deleting_ any existing
    property (data properties, array properties, computed definitions) using the
    `delete` operator.

## 4. Key Features & Functionality

- **Deep Reactive State Trees:** Creates deeply reactive state from plain
  objects/arrays.
- **Inline Computed Properties:** Functions in initial state become computeds
  with `self`/`root` context.
- **Actions & Batching:** Supports defining synchronous and asynchronous actions
  attached to the store, with automatic batching of synchronous updates (SPA
  mode) via injected `batch` primitive.
- **Escape Hatch (`$`):** Allows direct access to underlying signals/proxies for
  integration or advanced use cases.
- **SSR Support:** Functions in SSR environments by using mock signals, avoiding
  reactivity loops. State can be initialized, mutated (e.g., via actions), and
  read server-side. `toJSON()` provides serializable state.
- **State Versioning (`__version`):** Provides signals for tracking top-level
  (action-based) and array-level changes, useful for external integrations,
  offering both coarse-grained and structure-specific update triggers.
- **`snapshot()`:** Returns a full point-in-time snapshot including resolved
  computed values (useful for testing/debugging).
- **`toJSON()`:** Returns a serializable snapshot containing only base data
  properties (excluding computeds), suitable for `JSON.stringify` and hydration.
- **`shallow()` Objects:** Allows marking specific objects to remain
  non-reactive internally.
- **Permissive Mode:** Option (`permissive: true`) to allow adding/deleting
  properties on state objects dynamically after creation. Defaults to `false`
  (strict mode) which enforces the initial object shape (prevents
  adding/deleting properties, except array indices and computed definitions).
- **Configurable Escape Hatch Prefix:** Allows changing the `$` prefix via
  `createDeepStateAPIv2`.

## 5. API Reference (High-Level)

- **`createDeepStateAPIv2({ signal, computed, ... }, esc?)`:** (Primarily for
  packaging/advanced use) Factory to create the `reify`/`shallow` API with
  specific dependencies.
- **`reify(initialState: Object, options?: Options): Store`:**
  - `options`:
    `{ permissive?: boolean, debug?: boolean | object, actions?: object }`
    (Note: `escapeHatch` is usually set via factory).
  - `Store`:
    `{ state: Proxy, attach: Function, actions?: object, toJSON: Function, snapshot: Function, __version: Signal }`
- **`shallow(obj: Object): Object`:** Marks an object to be treated as shallow.
- **`store.state`:** The root proxy object representing the reactive state.
  - Direct property access/mutation.
  - Computed property access.
  - Escape hatch access (`state.$prop`).
  - `state.toJSON(): Object`
  - `state.snapshot(): Object`
  - Array proxies have `state.arrayProp.__version` (Signal).
- **`store.attach(actions: object): Store`:** Attaches actions to the store.
- **`store.actions`:** Object containing attached actions.
- **`store.toJSON(): Object`:** Returns data-only snapshot.
- **`store.snapshot(): Object`:** Returns full snapshot including computeds.
- **`store.__version`:** Top-level version signal.

## 6. Assumptions & Limitations

- **Signal Primitive Dependency:** Relies on an external library providing
  `@preact/signals-core` compatible `signal`, `computed`, `batch`, and
  `untracked` functions.
- **SSR Reactivity:** `effect` functions from the underlying signal library will
  not run reactively when DeepState is in SSR mode due to the use of mock
  signals. State calculation and mutation work, but the reactive _update loop_
  is inactive.
- **Array/Object Replacement:** Direct assignment (`state.items = [...]`) and
  escape hatch assignment (`state.$items.value = [...]`) to replace existing
  proxied arrays/objects are disallowed. Use mutation methods or actions.
- **Proxy Overhead:** Like any Proxy-based solution, there is some inherent
  performance overhead compared to plain object access, though typically
  negligible for most UI state management.
- **Functions in State:** Only functions intended as computed properties should
  be placed directly in the initial state. Other functions will be included in
  snapshots unless `toJSON()` is used (which skips all functions). Storing
  complex non-computed functions directly in the state is generally discouraged.
- **Strict Mode Scope:** Strict mode (`permissive: false`) enforces the shape of
  _objects_ by preventing addition/deletion of properties. It does _not_ prevent
  mutation of array contents or modification of primitive signal values.
- **Async Action Nuances:** While async actions are supported, `safeBatch` only
  batches initial synchronous updates, and `store.__version` increments after
  the action's synchronous start, not its asynchronous completion.

## 7. Motivation, Rationale, and Comparison

### 7.1. Motivation & Rationale: Mutational DX via Proxies & Signals

A core design goal of DeepState V2 is to provide an intuitive state management
experience by leveraging modern JavaScript features (Proxies, Signals). This
leads to key differences compared to libraries emphasizing immutable update
patterns:

- **Familiarity and Intuitiveness:** DeepState allows developers to interact
  with the state using familiar, direct mutation syntax (e.g.,
  `state.user.name = 'new name'`, `state.items.push(...)`). This aligns with
  standard JavaScript object manipulation, potentially reducing the learning
  curve.
- **Reduced Boilerplate:** Immutable updates, especially for nested structures,
  often require verbose spreading (`...`) at each level. DeepState aims to
  eliminate this manual boilerplate for common mutations.
- **Transparency via Proxies:** ES6 Proxies intercept these "mutations". Instead
  of directly altering plain objects, the proxy traps translate these operations
  into updates on the underlying fine-grained Signals (e.g.,
  `signal.value = 'new name'`). The complexity of ensuring reactivity is managed
  internally and transparently.
- **Leveraging Signal Primitives:** While the _interface_ appears mutational,
  the underlying state changes are managed reactively and atomically via signal
  updates. Signals provide the necessary dependency tracking and guarantee
  predictable state transitions, achieving similar reliability goals as
  immutable patterns but through a different mechanism.

In essence, DeepState prioritizes a developer experience centered around direct
interaction, abstracting the reactive updates behind a Proxy facade built upon a
Signal core.

### 7.2. Key Differentiators

- **Proxy-based Deep Reactivity:** Automatically wraps nested objects/arrays in
  proxies, intercepting operations at any level to trigger signal updates.
- **Signal Primitive Core:** Explicitly relies on injected signal primitives for
  the reactivity graph.
- **Mutational DX:** Offers a direct mutation style on the state proxy interface
  (as explained above).
- **Inline Computed Properties:** Automatic detection and handling of functions
  within the state as reactive computations with local context (`self`, `root`).

### 7.3. Comparison with Redux

- **Immutability vs. Proxied Mutation:** Redux enforces strict immutability via
  reducers returning new state objects. DeepState allows direct-style mutations
  on its proxy interface, managing signal updates internally.
- **Update Mechanism:** Redux uses dispatched actions and pure reducer
  functions. DeepState uses direct proxy operations or attached actions that
  perform mutations.
- **Structure:** Redux often promotes a single global store. DeepState creates
  standalone stores via `reify`, suitable for modular or multiple store
  scenarios.
- **Boilerplate:** DeepState generally requires less boilerplate for basic state
  updates and derived state (inline computeds) compared to Redux's actions,
  reducers, and selectors.
- **Granularity:** Redux relies on memoized selectors (e.g., `reselect`) for
  optimizing reads and preventing unnecessary updates. DeepState relies on the
  underlying signal graph for fine-grained dependency tracking.

### 7.4. Comparison with Zustand

- **Update Mechanism:** Zustand typically enforces immutability at the update
  boundary via functions that receive state and return a new state slice
  (`set(state => ({ count: state.count + 1 }))`). DeepState allows direct proxy
  mutations (`state.count++`).
- **Deep Reactivity:** Zustand typically offers shallow reactivity by default
  for performance; achieving deep reactivity often requires careful structuring
  or specific patterns. DeepState provides deep reactivity automatically via
  recursive proxies.
- **API Style:** Zustand is often presented with a hook-centric API for React.
  DeepState provides a core store object and is framework-agnostic, relying on
  framework adapters or direct signal integration (`effect`).
- **Computed State:** Zustand uses selectors or separate functions for derived
  state. DeepState integrates computed properties directly into the state object
  structure.

### 7.5. Performance Considerations

- **Proxy Overhead:** As with any Proxy-based system, there is a small,
  generally negligible overhead for trap interception compared to direct
  property access on plain objects.
- **Signal Performance:** The ultimate performance relies heavily on the
  efficiency of the chosen underlying signal primitive implementation (e.g.,
  `@preact/signals-core`).
- **Fine-Grained Benefits:** Leveraging signals enables fine-grained updates,
  meaning only components or effects truly dependent on changed data are
  notified, potentially leading to efficient rendering and computation compared
  to more coarse-grained update mechanisms.
- **Goal:** The design aims to provide the DX benefits of deep reactivity and
  direct mutation without incurring prohibitive performance costs for typical UI
  state management, balancing proxy usage with the efficiency of modern signal
  libraries.
