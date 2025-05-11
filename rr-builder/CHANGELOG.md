# [Changelog](https://github.com/million-views/packages/commits/main/rr-builder)

## v1.1.2 - 11MAY2025

- prefix path with "/" to reduce friction in using react-router's `pathMatch()`
- use a function to generate `id` from `file` prop

## v1.1.1 - 07MAY2025

- Detailed usage help output

## v1.1.0 - 07MAY2025

### Added

- **`tree-utils.js`** module\
  • Core recursion-hiding helpers: `walk`, `map`, `flatMap`, `filter`
  (hierarchy-preserving), `reduce` (bottom-up fold), `pipe`, and the new
  `workflow` runner.\
  • All JSDoc moved into `tree-utils.d.ts` for clean JS implementations.

### Changed

- Catch and throw incorrect `.children()` args.
- **`rr-check.js`** now uses **tree-utils** under the hood for pruning, walking,
  filtering and reducing routes.
- **CLI flags** for `rr-check`:
  - **Removed**: `--show-route-tree`, `--show-nav-tree`, `--show-id`,
    `--show-path`
  - **Added**: single `--print:<…>` option (no spaces, comma-separated):
    ```bash
    --print=route-tree,nav-tree,include-id,include-path
    ```
    - `route-tree` → ASCII tree
    - `nav-tree` → JSON nav-tree
    - `include-id` → append `(id:…)`
    - `include-path` → append `(path:…)`

### Documentation

- **README.md** and **TREE-UTILS.md** fully updated to reflect:
  - Usage of `tree-utils` primitives
  - Expanded discussion of augmented route configuration and how to use
    generated code in UI
  - Precise semantics of **`section`** (build-time partition key) vs **`group`**
    (runtime intra-section classifier)
  - Examples for `reduce`, `workflow`, and CLI usage

## v1.0.0 - 21APR2025

- Initial version
