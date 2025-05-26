# [Changelog](https://github.com/million-views/packages/commits/main/rr-builder)

## v2.0.1 - 25MAY2025

- Doc fix

## v2.0.0 - 25MAY2025

### **Major enhancements and breaking changes**

#### **1. Deep Type-Safety in the Fluent API**

- **Fluent API design** is now strictly enforced by TypeScript types—not just
  documented:
  - Breaking change: `.meta()` renamed to `.nav()` to avoid conflict/confusion
    with `remix`'s `meta` API
  - `.children()` is only available on `route()` and `layout()` builders.
  - `index()` and `external()` builders **cannot** have children; attempts cause
    type errors.
  - `.nav()` on `layout()` **disallows** the `section` field at type-level.
  - `prefix()` only accepts `route`, `layout`, and `index` builders—not
    `external()`; type system enforces this.

#### **2. API Documentation Revamped and Expanded**

- **Section 3 (“Fluent Authoring API”)** is now a comprehensive, type-driven
  explanation—detailing the API surface and the exact type rules for all builder
  helpers, not just a summary table.
- **New “Type Safety at a Glance” section**: Shows, with examples, which usages
  are statically legal and which cause TypeScript errors.
- **Misuse examples** (now type errors) are included, showing what is enforced
  at compile-time, not just at runtime.

#### **3. Practical Usage and Examples Updated**

- All code examples and explanations now use and demonstrate the new type-safe
  builder API, reflecting current best-practices.
- Prefixing, meta usage, and chaining are shown with correct, statically-safe
  usage.
- Any possibility of ambiguous or unsafe `.children()` or `.nav()` usage is
  removed from examples.

#### **4. Code-Generation Workflow Clarified**

- Section on `rr-check` CLI tool is clearer, showing exactly how the codegen
  process works, and what is emitted.
- Example output and integration for generated navigation modules are updated to
  match the type-safe authoring model.

### **Minor & Stylistic changes**

- Tighter, clearer explanation of motivation and what problems this package
  solves.
- Code examples more concise and relevant to modern usage.
- Consistent terminology: “Builder”, “section”, “group”, “meta”, etc.
- Stronger, more readable Quick Start section.
- License and copyright.

## **Migration note**

If you have used a previous version, double-check any use of `.children()` and
`.meta()`:

- You will now get compile-time errors if you misuse these on the wrong builder
  types.
- No changes to runtime code or build steps, but your code will be much more
  robust in editor/CI.
- Search and replace `.meta(` with `.nav(`

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
