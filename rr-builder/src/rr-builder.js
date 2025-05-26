// @ts-check
import {
  index as rrIndex,
  layout as rrLayout,
  prefix as rrPrefix,
  route as rrRoute,
} from "@react-router/dev/routes";

/**
 * @typedef {import("@react-router/dev/routes").RouteConfigEntry} RouteConfigEntry
 * @typedef {Parameters<typeof import("@react-router/dev/routes").route>[2]} RouteOptions
 * @typedef {Parameters<typeof import("@react-router/dev/routes").index>[1]} IndexOptions
 * @typedef {Parameters<typeof import("@react-router/dev/routes").layout>[1]} LayoutOptions
 * @typedef {import("@m5nv/rr-builder").ExtendedRouteConfigEntry} ExtendedRouteConfigEntry
 * @typedef {import("@m5nv/rr-builder").NavMeta} NavMeta
 * @typedef {import("@m5nv/rr-builder").NavExtras} NavExtras
 */

function checkArg(fn, argName, arg, type) {
  if (typeof arg !== type) {
    throw TypeError(
      `Bad argument: ${fn}(...${argName}...) → expected ${type}, got ${typeof arg}`,
    );
  }
}

/* ---------- utils -------------------------------------------------- */
/// for `rr-check` to do its job, we have to guarantee every configuration has
/// an id; react-router helpers set it (at config time) only if the user
/// provides it, otherwise it is set at build time (in framework mode)
export function makeId(file_or_url) {
  if (file_or_url.startsWith("http")) {
    return file_or_url
      .replace(/^https?:\/\//, "")
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
  } else {
    return file_or_url
      .replace(/^app[\\/]/, "") // drop the leading “app/” or “app\”
      .replace(/\.[^/.]+$/, ""); // drop the extension
  }
}

/**
 * Deep-clone a RouteConfigEntry tree **excluding** nodes for which
 * `filter(entry) === false`. Returns `{ kept, removed }`.
 * @param {ExtendedRouteConfigEntry[]} entries
 * @param {(e: ExtendedRouteConfigEntry) => boolean} filter
 */
function filterTree(entries, filter) {
  const kept = [];
  const removed = [];

  for (const e of entries) {
    if (!filter(e)) {
      removed.push(e);
      continue;
    }
    const clone = { ...e };
    if (clone.children) {
      const { kept: childKept, removed: childRem } = filterTree(
        clone.children,
        filter,
      );
      clone.children = childKept.length ? childKept : undefined;
      removed.push(...childRem);
    }
    kept.push(clone);
  }
  return { kept, removed };
}

/* ---------- Builder ------------------------------------------------ */

class Builder {
  /** @param {ExtendedRouteConfigEntry} entry */
  constructor(entry) {
    /** @type {ExtendedRouteConfigEntry} */
    // ── ensure the entry has a stable ID ────────────────────────────
    entry.id ??= makeId(entry.handle?.external ? entry.path : entry.file);
    this.entry = entry;
    // console.log(entry);
  }

  /* ---- fluent helpers ------------------------------------------- */

  /** @param {NavMeta} spec */
  nav(spec) {
    const isIndex = !!this.entry.index;
    spec = {
      ...(spec.end !== undefined && { end: spec.end ?? isIndex }),
      section: spec.section ?? "main",
      ...spec,
    };
    this.entry.handle = { ...this.entry.handle, ...spec };
    return this;
  }

  /** backward-compat alias */
  meta(meta) {
    return this.nav(meta);
  }

  /**
   * Attach child routes. Index routes cannot have children.
   * @param {Builder[]} builders
   */
  children(...builders) {
    if (this.entry.index || this.entry.handle?.external) {
      throw new Error("Cannot add children to an index route or external link");
    }

    for (const b of builders) {
      if (Array.isArray(b)) {
        throw new Error(
          "You passed a Builder[] to children() — did you forget to spread your prefix() result?",
        );
      }
      // console.log(
      //   `(file|path)=>(${b.entry.file}|${b.entry.path}); this.entry.id=>${this.entry.id}`,
      // );
      // remember the parent so rr-check can re-attach navOnly nodes later
      // @ts-ignore
      b.entry._anchor = this.entry.id;
    }

    this.entry.children = builders.map((b) => b.entry);
    return this;
  }

  /* ---- static factories ----------------------------------------- */

  static route(path, file, options) {
    checkArg("route", "path", path, "string");
    checkArg("route", "file", file, "string");
    const entry = options ? rrRoute(path, file, options) : rrRoute(path, file);
    return new Builder(entry);
  }

  static index(file, options) {
    checkArg("index", "file", file, "string");
    return new Builder(rrIndex(file, options));
  }

  static layout(file, options) {
    checkArg("layout", "file", file, "string");
    const entry = options ? rrLayout(file, options, []) : rrLayout(file, []);
    return new Builder(entry);
  }

  static prefix(prefixPath, builders) {
    checkArg("prefix", "prefixPath", prefixPath, "string");
    const prefixed = rrPrefix(
      prefixPath,
      builders.map((b) => b.entry),
    );
    return prefixed.map((e) => new Builder(e));
  }

  /** Create an **external** link node (nav-only) */
  static external(url, opts = {}) {
    checkArg("external", "url", url, "string");
    /** @type {ExtendedRouteConfigEntry} */
    const entry = {
      file: "",
      id: opts.id,
      path: url, // absolute URL
      handle: { external: true },
    };
    return new Builder(entry);
  }

  /* ---- build ----------------------------------------------------- */

  /**
   * @param {Builder[]} builders
   * @param {NavExtras} [extras]
   * @returns {RouteConfigEntry[] & { readonly nav?: NavExtras }}
   */
  static build(builders, extras = {}) {
    const rootEntries = builders.map((b) => b.entry);

    // remove every node (deep) where entry.external === true
    const { kept: routable, removed: navOnly } = filterTree(
      rootEntries,
      (e) => !e.handle?.external,
    );

    const finalExtras = {
      ...extras,
      navOnly: [...(extras.navOnly ?? []), ...navOnly],
    };

    // attach non-enumerable nav payload
    Object.defineProperty(routable, "nav", {
      value: finalExtras,
      enumerable: false,
      writable: false,
    });

    return routable;
  }
}

/* ---------- exports ---------------------------------------------- */
export const {
  route,
  index,
  layout,
  prefix,
  external,
  build,
} = Builder;
