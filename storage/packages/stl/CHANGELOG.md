# [Changelog](https://github.com/million-views/packages/commits/main/storage/packages/stl)

## v1.1.1 - 11NOV2024

- BUG-FIX: IN clause with a single item array works correctly now
- Update README.md to inline documentation adapted from `postgres.js`
- Added transform function to convert {string, parameters} to Turso compatible
  query format.
- Added Result constructor function to wrap database results into a convenient
  array prototype object, or an error object that can be checked for by the
  application layer

## v1.0.2 - 10JUL2023

- Remove `Detailed example` from README.md; add ref to `@m5nv/sqlite`
- Run tests from main package.json
- Remove redundant test cases

## v1.0.0 - 06JUL2023

- Bump version to release
- Expose `sql_tagged_literal` to allow advanced usage
- Example code now aligns with `postgres.js` way of use (almost)
- Cross reference `postgres.js`'s documentation

## v0.9.0 - 05JUL2023

- Initial beta release
