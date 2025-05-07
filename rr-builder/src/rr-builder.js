// @ts-check
import {
  index as rrIndex,
  layout as rrLayout,
  prefix as rrPrefix,
  route as rrRoute,
} from "@react-router/dev/routes";

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 *
 * @typedef {Parameters<typeof import("@react-router/dev/routes").route>[2]} RouteOptions
 * @typedef {Parameters<typeof import("@react-router/dev/routes").index>[1]} IndexOptions
 * @typedef {Parameters<typeof import("@react-router/dev/routes").layout>[1]} LayoutOptions
 * @typedef {import("@m5nv/rr-builder").NavMeta} NavMeta
 */

class Builder {
  /**
   * @param {RouteConfigEntry} entry
   */
  constructor(entry) {
    /** @type {RouteConfigEntry} */
    this.entry = entry;
  }

  /**
   * Mirror React Router’s route helper, with options passthrough.
   * @param {string | null | undefined} path
   * @param {string} file
   * @param {RouteOptions} [options]
   * @returns {Builder}
   */
  static route(path, file, options) {
    const entry = options ? rrRoute(path, file, options) : rrRoute(path, file);
    return new Builder(entry);
  }

  /**
   * Mirror React Router’s index helper, with options passthrough.
   * @param {string} file
   * @param {IndexOptions} [options]
   * @returns {Builder}
   */
  static index(file, options) {
    return new Builder(rrIndex(file, options));
  }

  /**
   * Mirror React Router’s layout helper, with options passthrough.
   * @param {string} file
   * @param {LayoutOptions} [options]
   * @returns {Builder}
   */
  static layout(file, options) {
    const entry = options ? rrLayout(file, options, []) : rrLayout(file, []);
    return new Builder(entry);
  }

  /**
   * Prepend a path to a set of routes.
   * @param {string} prefixPath
   * @param {Builder[]} builders
   * @returns {Builder[]}
   */
  static prefix(prefixPath, builders) {
    const prefixed = rrPrefix(
      prefixPath,
      builders.map((b) => b.entry),
    );
    return prefixed.map((e) => new Builder(e));
  }

  /**
   * Attach child routes. Index routes cannot have children.
   * @param {Builder[]} builders
   * @returns {Builder}
   */
  children(...builders) {
    if (this.entry.index) {
      throw new Error("Cannot add children to an index route");
    }

    // Fail-fast check: ensure no one passed a Builder[] by mistake
    for (const b of builders) {
      if (Array.isArray(b)) {
        throw new Error(
          "You passed a Builder[] to children() — did you forget to spread your prefix() result?",
        );
      }
    }
    this.entry.children = builders.map((b) => b.entry);
    return this;
  }

  /**
   * Attach navigation metadata into handle.
   * @param {NavMeta} meta
   * @returns {Builder}
   */
  meta(meta) {
    // @ts-ignore: custom handle field doesn't exist in RouteConfigEntry (we know!)
    this.entry.handle = { ...meta };
    return this;
  }

  /**
   * Produce final array of RouteConfigEntry for React Router.
   * @param {Builder[]} builders
   * @returns {RouteConfigEntry[]}
   */
  static build(builders) {
    return builders.map((b) => b.entry);
  }
}

export const { route, index, layout, prefix, build } = Builder;
