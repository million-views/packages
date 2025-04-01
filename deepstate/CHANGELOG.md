# [Changelog](https://github.com/million-views/packages/commits/main/deepstate)

## [2.0.0] - YYYY-MM-DD

This major release (V2) introduces significant improvements, API changes, and a
more robust reactivity core compared to V1. Migration from V1 will be required,
primarily concerning how computed properties are defined.

### Breaking Changes 💥

- **Computed Properties Redefined:**
  - Computed properties are now defined **inline** as regular functions directly
    within the initial state object passed to `reify`. The library automatically
    detects these functions and wraps them.
  - Computed functions now receive `self` (a proxy to the local state level
    where the computed is defined) as the first argument, and optionally `root`
    (a proxy to the top-level state) as the second argument
    (`myComputed(self, root) { ... }`). This provides correct local context.
  - The V1 approach of passing a separate `computed: { ... }` map in the `reify`
    options is **removed**. V1 computeds likely only received the `root`
    context, potentially leading to incorrect behavior for nested state.
- **`toJSON()` Behavior:**
  - The `store.toJSON()` method (and the proxy's `toJSON()`) now explicitly
    **excludes** computed properties from its output. It only serializes the
    base data properties, aligning better with standard `JSON.stringify`
    behavior and optimizing for serialization/hydration.
- **Array/Object Replacement Policy:**
  - Directly assigning a new array or object to a property that already holds an
    array/object managed by DeepState (e.g., `state.items = newArray`) is
    explicitly disallowed and will now throw a specific `TypeError`.
  - **Assigning to `$prop.value` via Escape Hatch Disallowed:** Attempting to
    replace an entire array or object by assigning to the `.value` property of
    the underlying signal/proxy accessed via the escape hatch (e.g.,
    `state.$items.value = newArray`) is also **disallowed**. This would
    previously have likely failed silently or behaved unpredictably from a
    reactivity standpoint. This capability is explicitly not supported in V2 due
    to the significant architectural complexity and potential for bugs required
    to implement it robustly within the deep reactivity model.
  - **Recommendation:** Use standard mutation methods (`.splice()`, `.push()`,
    etc.) or dedicated actions to modify collections. (V1 implicitly disallowed
    direct replacement; V2 makes the policy explicit and clarifies the escape
    hatch limitation).

### Added ✨

- **`snapshot()` Method:**
  - A new `store.snapshot()` method (and corresponding proxy method) has been
    added.
  - Unlike `toJSON()`, `snapshot()` returns a plain object representation of the
    state that **includes** the resolved values of computed properties.
  - Primarily intended for testing, debugging, or specific framework
    integrations requiring a complete point-in-time view of the state.
- **Versioning Signals (`__version`):**
  - `store.__version`: A top-level signal (non-enumerable) that increments after
    each attached action completes successfully. Useful for framework adapters
    (e.g., triggering updates in Svelte/React).
  - `store.state.arrayIdentifier.__version`: Array proxies now contain a
    non-enumerable `__version` signal that increments automatically when array
    indices or length are changed via the proxy `set`/`deleteProperty` traps.
    (Note: Wrapping native mutation methods like `push`, `splice` to increment
    version was deferred).
- **Inline Computed Properties:** (Also a Breaking Change, listed here as a
  feature) Functions within the initial state are automatically treated as
  computed properties with `self`/`root` context. This significantly improves
  Developer Experience (DX).

### Changed 🔁

- **Core Reactivity:** Internal reactivity mechanism rewritten based on evolving
  the `simpleDeepProxy` concept, aiming for improved robustness, particularly
  with nested state and computed property context.
- **SSR Implementation:** Server-Side Rendering support (`isSSR` detection) is
  refined using mock signal implementations (`SSRSignal`, `SSRComputed`) and
  safe primitives (`safeSignal`, `safeBatch`, etc.) for better compatibility and
  correctness in non-browser environments.
- **Fine-Grained Reactivity:** Ensured that accessing array elements or
  properties within array items does not unnecessarily depend on the array's
  structure `__version`, preserving finer-grained updates for components
  observing specific items.

### Fixed 🐛

- **Computed Property Context:** Resolved potential issues from V1 where
  computed properties might have received incorrect context (only root, or map
  of signals), especially within nested objects/arrays. V2 provides stable
  `self` and `root` proxies.
- **Nested Reactivity:** Improved handling of nested objects and arrays to
  ensure reactivity propagates correctly and consistently.

### Removed ➖

- Removed the V1 `options.computed` argument from `reify`. Computed properties
  must now be defined inline within the initial state object.

## v1.5.1 - 26MAR2025

- Doc fix: add install instruction, duh!

## v1.5.0 - 26MAR2025

- Refactor to support Svelte (new entry point that sets escape hatch to `_`
  instead of `$`)
- Added `with-sveltekit` sample code for reference
- Update documentation with notes on how to use with Svelte

## v1.4.1 - 25MAR2025

- Refactor internals to remove direct import from @preact/signals
- Create entry file corresponding to core, signals and react packages
- Maintain compatibility by keeping the default entry point be to
  @preact/signals
- Split SSR and SPA tests
- Add a hack to allow deepstate to work with SSR
- Update README with copious notes on how to use with React and guide developers
  to not shy away from using $-prefix in render code in all runtimes (i.e.,
  Preact, React, Svelte).

## v1.3.1 - 10MAR2025

- **Array Handling Improvements:**
  - Added an internal version counter to deep arrays to ensure in-place
    mutations (push, pop, shift, splice, delete, etc.) trigger reactivity.
  - Disallowed whole array replacement for deep arrays to prevent expensive
    re-wrapping; developers must use the `$` escape hatch (e.g.,
    `state.$todos.value = newArray`) for full replacements.
  - Documented best practices for handling large arrays, including marking
    arrays as shallow and using batching.

- **Batching Support:**
  - Enhanced documentation with an example of how to use Preact Signals’
    `batch()` function to coalesce multiple array mutations, reducing
    unnecessary re-renders.

- **Documentation Updates:**
  - Revised array handling section to clearly explain the differences between
    in-place mutations and whole array replacement.
  - Added notes on when to use the `$` escape hatch and the `shallow` helper.
  - Provided an example for effective batching to improve performance.

- **Test Suite Refinements:**
  - Consolidated duplicate tests and expanded coverage of array operations.
  - Updated tests to reflect the expected behavior for array mutations and
    batching.

## v1.2.2 - 09MAR2025

- bug: bug fix for bug fix :-(

## v1.2.1 - 09MAR2025

- bug: array.length needs special treatment
- added tests to check array methods

## v1.1.3 - 08MAR2025

- doc: add a bit of structure and document the use of 'shallow'
- remove unused 'target' in create_handler function

## v1.1.2 - 07MAR2025

- doc: fix typos

## v1.1.1 - 07MAR2025

- Breaking change: bound actions now receive `state` instead of `store`
- doc: point to jsonplaceholder.typicode.com in sample code.

## v1.0.1 - 07MAR2025

- Rewrite 'attach' to be more readable
- doc: Add note for 'attach' accepting sync and async functions

## v1.0.0 - 07MAR2025

- First cut
