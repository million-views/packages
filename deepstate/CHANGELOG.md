# [Changelog](https://github.com/million-views/packages/commits/main/deepstate)

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
