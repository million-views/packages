// rr-builder.ts
import {
  route as rrRoute,
  index as rrIndex,
  layout as rrLayout,
  prefix as rrPrefix,
  type RouteConfigEntry,
} from "@react-router/dev/routes"

export type NavMeta = {
  label?: string
  iconName?: string
  end?: boolean
  section?: string
}

class Builder {
  private entry: RouteConfigEntry
  constructor(entry: RouteConfigEntry) {
    this.entry = entry
  }

  static route(path: string | null | undefined, file: string) {
    return new Builder(rrRoute(path, file))
  }
  static index(file: string) {
    return new Builder(rrIndex(file))
  }
  static layout(file: string) {
    return new Builder(rrLayout(file, []))
  }
  static prefix(prefixPath: string, bs: Builder[]) {
    // reuse built‑in prefix to generate new entries
    const prefixed = rrPrefix(prefixPath, bs.map(b => b.entry))
    return prefixed.map(e => new Builder(e))
  }

  children(...bs: Builder[]) {
    this.entry.children = bs.map(b => b.entry)
    return this
  }

  meta(m: NavMeta) {
    this.entry.handle = { ...m }
    return this
  }

  static build(bs: Builder[]): RouteConfigEntry[] {
    return bs.map(b => b.entry)
  }
}

export const {
  route,
  index,
  layout,
  prefix,
  build
} = Builder
