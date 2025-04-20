import {
  route as rrRoute,
  index as rrIndex,
  layout as rrLayout,
  prefix as rrPrefix,
  type RouteConfigEntry,
} from "@react-router/dev/routes";

export type NavMeta = {
  label?: string;
  iconName?: string;
  end?: boolean;
  section?: string;
};

// infer the exact options types from the originals
type RouteOptions = Parameters<typeof rrRoute>[2];
type IndexOptions = Parameters<typeof rrIndex>[1];
type LayoutOptions = Parameters<typeof rrLayout>[1];

class Builder {
  private entry: RouteConfigEntry;

  private constructor(entry: RouteConfigEntry) {
    this.entry = entry;
  }

  /** Mirror React Router’s route helper, with options passthrough. */
  static route(
    path: string | null | undefined,
    file: string,
    options?: RouteOptions,
  ): Builder {
    const entry = options
      ? rrRoute(path, file, options)
      : rrRoute(path, file);
    return new Builder(entry);
  }

  /** Mirror React Router’s index helper, with options passthrough. */
  static index(
    file: string,
    options?: IndexOptions,
  ): Builder {
    return new Builder(rrIndex(file, options));
  }

  /** Mirror React Router’s layout helper, with options passthrough. */
  static layout(
    file: string,
    options?: LayoutOptions,
  ): Builder {
    const entry = options
      ? rrLayout(file, options, [])
      : rrLayout(file, []);
    return new Builder(entry);
  }

  /** Prepend a path to a set of routes. */
  static prefix(prefixPath: string, builders: Builder[]): Builder[] {
    const prefixed = rrPrefix(
      prefixPath,
      builders.map(b => b.entry),
    );
    return prefixed.map(e => new Builder(e));
  }

  /** Attach child routes. Index routes cannot have children. */
  children(...builders: Builder[]): Builder {
    if (this.entry.index) {
      throw new Error("Cannot add children to an index route");
    }
    this.entry.children = builders.map(b => b.entry);
    return this;
  }

  /** Attach navigation metadata into handle. */
  meta(meta: NavMeta): Builder {
    this.entry.handle = { ...meta };
    return this;
  }

  /** Produce final array of RouteConfigEntry for React Router. */
  static build(builders: Builder[]): RouteConfigEntry[] {
    return builders.map(b => b.entry);
  }
}

export const { route, index, layout, prefix, build } = Builder;
