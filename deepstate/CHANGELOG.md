# [Changelog](https://github.com/million-views/packages/commits/main/deepstate)

## 2.0.0 - YYYY-MM-DD

This major release (V2) introduces significant improvements, API changes, and a
more robust reactivity core compared to V1. Migration from V1 will be required,
primarily concerning how computed properties are defined and how strict mode
behaves.

### Breaking Changes 💥

- **Computed Properties Redefined:**
  - Computed properties are now defined **inline** as regular functions directly
    within the initial state object passed to `reify`. The library automatically
    detects these functions and wraps them.
  - Computed functions now receive `self` (a proxy to the local state level
    where the computed is defined) as the first argument, and optionally `root`
    (a proxy to the top-level state) as the second argument
    (`myComputed(self, root) { ... }`). This provides correct local context.
  - The V1 approach of passing a separate `computedFns` object as the second
    argument to `reify` is **removed**. V1 computeds likely only received the
    `root` context.
- **Array/Object Replacement Policy:**
  - Directly assigning a new array or object to a property that already holds an
    array/object managed by DeepState (e.g., `state.items = newArray`) is
    explicitly disallowed and throws a `TypeError`.
  - Assigning to `$prop.value` via the escape hatch to replace collections
    (e.g., `state.$items.value = newArray`) is also **disallowed**.
  - **Recommendation:** Use standard mutation methods (`.splice()`, `.push()`,
    etc.) or dedicated actions to modify collections. (V1 implicitly disallowed
    direct replacement; V2 makes the policy explicit).
- **Strict Mode (`permissive: false`) Deletion Behavior:**
  - Strict mode now prevents the deletion of **both** existing data properties
    _and_ initially defined computed property definitions using the `delete`
    operator (throws `TypeError`). This enforces a more consistent "fixed shape"
    based on the initial state. (Array index deletion remains allowed).

### Added ✨

- **`snapshot()` Method:**
  - A new `store.snapshot()` method returns a plain object representation of the
    state that **includes** the resolved values of computed properties (both
    initial and dynamically added). Primarily intended for testing/debugging.
- **Versioning Signals (`__version`):**
  - `store.__version`: Top-level signal incremented after actions complete.
  - `store.state.arrayIdentifier.__version`: Array-level signal incremented on
    structural changes via `set`/`deleteProperty`. Useful for framework
    integrations.
- **Dynamic Computed Properties:**
  - In permissive mode (`permissive: true`), assigning a function to a _new_
    property on a state object now automatically creates a reactive computed
    property.
- **Inline Computed Properties:** (Also a Breaking Change) Functions in the
  initial state are automatically treated as computed properties with
  `self`/`root` context (Improved DX).
- **Debug Logging Configuration:**
  - A `debug` option (`true`, `false`, or console-like object) can now be passed
    to the `createDeepStateAPIv2` factory function to enable/configure internal
    logging.

### Changed 🔁

- **Core Reactivity:** Internal reactivity mechanism rewritten for improved
  robustness.
- **SSR Implementation:** Refined SSR detection and handling using mock
  signals/primitives.
- **Fine-Grained Reactivity:** Improved array dependency tracking to avoid
  unnecessary updates.
- **Permissive Mode (`set` Behavior):** Enhanced permissive mode `set` trap to
  create computed properties dynamically when a function is assigned to a new
  key.
- **Strict Mode (`delete` Behavior):** Enhanced strict mode `delete` trap to
  prevent deletion of initial computed properties, enforcing shape more
  strictly.
- **`toJSON()` Behavior:** The behavior of `toJSON()` (excluding computed
  properties) remains consistent with the documented behavior of V1.

### Fixed 🐛

- **Computed Property Context:** Resolved potential V1 issues with incorrect
  context (`self`/`root`) in computeds.
- **Nested Reactivity:** Improved consistency for nested objects/arrays.
- **Proxy Invariants (`deleteProperty`):** Fixed potential `TypeError` ("trap
  returned falsish") when using `delete` on non-existent properties or via the
  escape hatch prefix, by ensuring the trap returns `true` in these cases as
  required by proxy invariants.

### Removed ➖

- Removed the V1 `computedFns` argument from `reify` (replaced by inline
  definition).

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
