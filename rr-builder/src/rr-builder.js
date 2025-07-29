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
 * @typedef {Omit<NavMeta, 'external'>} NavMetaInput
 * @typedef {import("@m5nv/rr-builder").NonSectionBuilder} NonSectionBuilder
 */

/* ---------- Utility functions ------------------------------------ */

/**
 * Type checking helper with clear error messages
 * @param {string} fn Function name for error context
 * @param {string} argName Argument name for error context
 * @param {any} arg Argument value to check
 * @param {string} type Expected type
 */
function checkArg(fn, argName, arg, type) {
  if (typeof arg !== type) {
    throw TypeError(
      `${fn}(${argName}): expected ${type}, got ${typeof arg} (${
        JSON.stringify(arg)
      })`,
    );
  }
}

/**
 * Generate a stable ID from a file path or URL
 * @param {string} file_or_url File path or URL
 * @returns {string} Generated ID
 */
export function makeId(file_or_url) {
  if (file_or_url.startsWith("http")) {
    return file_or_url
      .replace(/^https?:\/\//, "")
      .replace(/[^\w]+/g, "-")
      .replace(/^-+|-+$/g, "");
  } else {
    return file_or_url
      .replace(/^app[\\/]/, "") // drop the leading "app/" or "app\"
      .replace(/\.[^/.]+$/, ""); // drop the extension
  }
}

/**
 * Deep-clone a RouteConfigEntry tree excluding nodes where filter returns false
 * @param {ExtendedRouteConfigEntry[]} entries
 * @param {(e: ExtendedRouteConfigEntry) => boolean} filter
 * @returns {{ kept: ExtendedRouteConfigEntry[], removed: ExtendedRouteConfigEntry[] }}
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

/* ---------- Main Builder Class ----------------------------------- */

/**
 * Main builder class for routes, layouts, indexes, and external links
 */
class Builder {
  /** @param {ExtendedRouteConfigEntry} entry */
  constructor(entry) {
    // Ensure the entry has a stable ID
    const idSource = entry.handle?.external ? entry.path : entry.file;
    entry.id ??= makeId(idSource || "unknown");
    this.entry = entry;
    this._type = "builder";
  }

  /* ---- Fluent API methods --------------------------------------- */

  /**
   * Add navigation metadata to this route
   * @param {NavMetaInput} spec Navigation metadata
   * @returns {Builder}
   */
  nav(spec) {
    // Prevent manual setting of external flag
    if ("external" in spec) {
      throw new Error(
        "Cannot manually set 'external' flag. Use `external()` builder for external links.",
      );
    }

    const isIndex = !!this.entry.index;
    const enhancedSpec = {
      ...(spec.end !== undefined && { end: spec.end ?? isIndex }),
      ...spec,
    };
    this.entry.handle = { ...this.entry.handle, ...enhancedSpec };
    return this;
  }

  /**
   * Add child routes to this builder
   * Index routes and external links cannot have children
   * @param {...*} builders Child builders
   * @returns {Builder}
   */
  children(...builders) {
    // Validate that this builder can have children
    if (this.entry.index) {
      throw new Error(
        "Index routes cannot have children. Use route() or layout() for routes with children.",
      );
    }
    if (this.entry.handle?.external) {
      throw new Error(
        "External links cannot have children. Use route() or layout() for routes with children.",
      );
    }

    // Validate each child builder
    for (const b of builders) {
      if (Array.isArray(b)) {
        throw new Error(
          "children() received an array. Did you forget to spread your prefix() result? " +
            "Use .children(...prefix('path', [...])) instead of .children(prefix('path', [...]))",
        );
      }

      if (isSection(b)) {
        throw new Error(
          "Section builders can only be used at the top level of build(). " +
            "Sections cannot be nested within other routes or sections.",
        );
      }

      // Set anchor for re-attaching nav-only nodes later
      // @ts-ignore
      b.entry._anchor = this.entry.id;
    }

    this.entry.children = builders.map((b) => b.entry);
    return this;
  }

  /* ---- Static factory methods ----------------------------------- */

  /**
   * Create a route builder
   * @param {string} path URL path segment
   * @param {string} file Component file path
   * @param {RouteOptions} [options] Additional route options
   * @returns {Builder}
   */
  static route(path, file, options) {
    checkArg("route", "path", path, "string");
    checkArg("route", "file", file, "string");
    const entry = options ? rrRoute(path, file, options) : rrRoute(path, file);
    return new Builder(entry);
  }

  /**
   * Create an index route builder
   * @param {string} file Component file path
   * @param {IndexOptions} [options] Additional index options
   * @returns {Builder}
   */
  static index(file, options) {
    checkArg("index", "file", file, "string");
    return new Builder(rrIndex(file, options));
  }

  /**
   * Create a layout builder
   * @param {string} file Component file path
   * @param {LayoutOptions} [options] Additional layout options
   * @returns {Builder}
   */
  static layout(file, options) {
    checkArg("layout", "file", file, "string");
    const entry = options ? rrLayout(file, options, []) : rrLayout(file, []);
    return new Builder(entry);
  }

  /**
   * Create prefixed route builders
   * @param {string} prefixPath Path prefix to apply
   * @param {Builder[]} builders Builders to prefix (cannot include external or section)
   * @returns {Builder[]}
   */
  static prefix(prefixPath, builders) {
    checkArg("prefix", "prefixPath", prefixPath, "string");

    if (!Array.isArray(builders)) {
      throw new Error(
        "prefix() expects an array of builders as the second argument",
      );
    }

    // Validate that builders are prefixable
    for (const b of builders) {
      if (isSection(b)) {
        throw new Error(
          "Section builders cannot be prefixed. Sections must be used at the top level of build().",
        );
      }
      if (b.entry.handle?.external) {
        throw new Error(
          "External link builders cannot be prefixed. Use route(), layout(), or index() builders instead.",
        );
      }
    }

    const prefixed = rrPrefix(
      prefixPath,
      builders.map((b) => b.entry),
    );
    return prefixed.map((e) => new Builder(e));
  }

  /**
   * Create an external link builder (navigation-only)
   * @param {string} url External URL
   * @param {{ id?: string }} [opts] Optional configuration
   * @returns {Builder}
   */
  static external(url, opts = {}) {
    checkArg("external", "url", url, "string");

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      console.warn(
        `external("${url}"): URL should start with http:// or https://`,
      );
    }

    /** @type {ExtendedRouteConfigEntry} */
    const entry = {
      file: "",
      id: opts.id,
      path: url, // absolute URL
      handle: { external: true },
    };
    return new Builder(entry);
  }

  /* ---- Build method --------------------------------------------- */

  /**
   * Build the final route configuration
   * @param {Builder[]} builders Array of builders (can include sections at top level)
   * @param {NavExtras} [extras] Additional configuration
   * @returns {RouteConfigEntry[] & { readonly nav?: NavExtras }}
   */
  static build(builders, extras = {}) {
    if (!Array.isArray(builders)) {
      throw new Error(
        "build() expects an array of builders as the first argument",
      );
    }

    const rootEntries = [];

    // Process builders, handling sections specially
    for (const b of builders) {
      if (isSection(b)) {
        // For sections, add their children with the section name attached
        const sectionName = b.name;
        const sectionChildren = b.entry.children || [];

        // Recursively propagate section name to all descendants
        const propagateSection = (entries, section) => {
          for (const entry of entries) {
            entry._section = section;
            if (entry.children) {
              propagateSection(entry.children, section);
            }
          }
        };

        propagateSection(sectionChildren, sectionName);
        rootEntries.push(...sectionChildren);
      } else {
        // Regular builders go to "main" section by default
        const propagateSection = (entry, section) => {
          entry._section = section;
          if (entry.children) {
            for (const child of entry.children) {
              propagateSection(child, section);
            }
          }
        };
        propagateSection(b.entry, "main");
        rootEntries.push(b.entry);
      }
    }

    // Remove external links from routable entries (they're navigation-only)
    const { kept: routable, removed: navOnly } = filterTree(
      rootEntries,
      (e) => !e.handle?.external,
    );

    const finalExtras = {
      ...extras,
      navOnly: [...(extras.navOnly ?? []), ...navOnly],
    };

    // Attach non-enumerable nav payload to the result
    Object.defineProperty(routable, "nav", {
      value: finalExtras,
      enumerable: false,
      writable: false,
      configurable: false,
    });

    return routable;
  }
}

/* ---------- Section Builder Class -------------------------------- */

/**
 * Section builder for creating navigation sections
 */
class SectionBuilder {
  /**
   * @param {string} name Section name
   */
  constructor(name) {
    checkArg("section", "name", name, "string");

    if (!name.trim()) {
      throw new Error("Section name cannot be empty or whitespace-only");
    }

    this.name = name;
    this._type = "section";

    /** @type {ExtendedRouteConfigEntry} */
    this.entry = {
      id: `section:${name}`,
      file: "",
      children: [],
      _section: name,
    };
  }

  /**
   * Add navigation metadata to this section
   * @param {NavMetaInput} spec Navigation metadata (cannot include external flag)
   * @returns {SectionBuilder}
   */
  nav(spec) {
    if ("external" in spec) {
      throw new Error(
        "Section navigation metadata cannot include 'external' property",
      );
    }
    this.entry.handle = { ...this.entry.handle, ...spec };
    return this;
  }

  /**
   * Add child routes to this section
   * @param {...*} builders Child builders (cannot include other sections)
   * @returns {SectionBuilder}
   */
  children(...builders) {
    // Validate each child builder
    for (const b of builders) {
      if (Array.isArray(b)) {
        throw new Error(
          "children() received an array. Did you forget to spread your prefix() result? " +
            "Use .children(...prefix('path', [...])) instead of .children(prefix('path', [...]))",
        );
      }

      if (isSection(b)) {
        throw new Error(
          "Section builders cannot be nested within other sections. " +
            "Sections can only be used at the top level of build().",
        );
      }

      // Set anchor for re-attaching nav-only nodes later
      // @ts-ignore
      b.entry._anchor = this.entry.id;
    }

    this.entry.children = builders.map((b) => b.entry);
    return this;
  }
}

/* ---------- Type Guards ------------------------------------------ */

/**
 * Runtime type guard for SectionBuilder
 * @param {Builder|NonSectionBuilder} builder
 * @returns {builder is SectionBuilder}
 */
function isSection(builder) {
  return (
    builder != null &&
    typeof builder === "object" &&
    builder._type === "section"
  );
}

/* ---------- Exports ---------------------------------------------- */

// Export factory functions from BuilderImpl static methods
export const { route, index, layout, prefix, external, build } = Builder;

/**
 * Create a section container for organizing routes into separate navigation trees
 * @param {string} name Section name
 * @returns {SectionBuilder}
 */
export function section(name) {
  return new SectionBuilder(name);
}

/**
 * Create multiple sections with a shared layout
 * @param {string} layoutFile Layout file path to be shared across all sections
 * @param {Record<string, NonSectionBuilder[]>} sections Object mapping section names to arrays of builders
 * @returns {SectionBuilder[]}
 */
export function sharedLayout(layoutFile, sections) {
  checkArg("sharedLayout", "layoutFile", layoutFile, "string");

  if (!sections || typeof sections !== "object") {
    throw new Error(
      "sharedLayout() expects an object mapping section names to builder arrays",
    );
  }

  return Object.entries(sections).map(([sectionName, children]) => {
    if (!Array.isArray(children)) {
      throw new Error(
        `sharedLayout(): section "${sectionName}" must have an array of builders`,
      );
    }

    // Validate that children don't contain sections (can't nest sections)
    for (const child of children) {
      if (isSection(child)) {
        throw new Error(
          `sharedLayout(): section "${sectionName}" cannot contain nested sections. ` +
            "Sections can only be used at the top level.",
        );
      }
    }

    return section(sectionName).children(
      Builder.layout(layoutFile).children(...children),
    );
  });
}
