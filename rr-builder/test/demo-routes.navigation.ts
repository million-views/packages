
// ⚠ AUTO-GENERATED — 2025-05-26T01:08:35.714Z — do not edit by hand!
// Consult @m5nv/rr-builder docs to keep this file in sync with your routes. 

import type {
  GlobalActionSpec,
  NavigationApi,
  NavMeta,
  NavStructNode,
  NavTreeNode,
  RouterAdapter,
} from "@m5nv/rr-builder";

/* 1 ─ raw data ─────────────────────────────────────────────── */
const metaMap = new Map<string, NavMeta>([
  ["project/overview", {"section":"project","label":"Overview","iconName":"ClipboardList","order":1}],
  ["project/integrations", {"section":"main","label":"Integrations","iconName":"Plug","order":2}],
  ["project/deployments", {"section":"main","label":"Deployments","iconName":"Truck","order":3}],
  ["project/activity", {"section":"main","label":"Activity","iconName":"Activity","order":4}],
  ["project/domains", {"section":"main","label":"Domains","iconName":"Globe","order":5}],
  ["project/usage", {"section":"main","label":"Usage","iconName":"BarChart2","order":6}],
  ["project/monitoring", {"section":"main","label":"Monitoring","iconName":"Monitor","order":7,"actions":[{"id":"create-query","label":"Create New Query","iconName":"PlusCircle"}]}],
  ["project/observability", {"section":"main","label":"Observability","iconName":"Eye","order":8}],
  ["project/storage", {"section":"main","label":"Storage","iconName":"Database","order":9}],
  ["project/flags", {"section":"main","label":"Flags","iconName":"Flag","order":10}],
  ["project/ai", {"section":"main","label":"AI","iconName":"BrainCircuit","order":11}],
  ["fubar", {"section":"main","label":"Support","iconName":"LifeBuoy","order":12}],
  ["docs-foo-dev", {"external":true,"section":"main","label":"Docs","iconName":"Book","tags":["help"]}],
  ["help-foo-dev", {"external":true,"section":"main","label":"Help","iconName":"Help","tags":["help"]}],
  ["foo-dev-changelog", {"external":true,"section":"main","label":"Changelog","iconName":"ChangeLog","tags":["help"]}],
  ["project/settings", {"section":"main","label":"Settings","iconName":"Settings","order":13}],
  ["wildy-external-acme-dev", {"external":true,"section":"project","label":"Go wild","iconName":"Wild"}],
  ["project/resources", {"section":"project","label":"Resources","iconName":"List","group":"resources","hidden":true}],
  ["docs-acme-dev", {"external":true,"section":"main","label":"Docs","iconName":"Book","tags":["help"]}],
  ["help-acme-dev", {"external":true,"section":"main","label":"Help","iconName":"Help","tags":["help"]}],
  ["acme-dev-changelog", {"external":true,"section":"main","label":"Changelog","iconName":"ChangeLog","tags":["help"]}],
]);

/* thin structural forest */
const navStructure: Record<string, NavStructNode[]> = {
  "project": [
    {
      "id": "project/overview",
      "path": "/overview"
    },
    {
      "id": "wildy-external-acme-dev",
      "path": "https://wildy-external.acme.dev",
      "external": true
    },
    {
      "id": "project/resources",
      "path": "/resources"
    }
  ],
  "main": [
    {
      "id": "project/integrations",
      "path": "/integrations"
    },
    {
      "id": "project/deployments",
      "path": "/deployments"
    },
    {
      "id": "project/activity",
      "path": "/activity"
    },
    {
      "id": "project/domains",
      "path": "/domains"
    },
    {
      "id": "project/usage",
      "path": "/usage"
    },
    {
      "id": "project/monitoring",
      "path": "/monitoring"
    },
    {
      "id": "project/observability",
      "path": "/observability"
    },
    {
      "id": "project/storage",
      "path": "/storage"
    },
    {
      "id": "project/flags",
      "path": "/flags"
    },
    {
      "id": "project/ai",
      "path": "/ai"
    },
    {
      "id": "fubar",
      "path": "/support",
      "children": [
        {
          "id": "docs-foo-dev",
          "path": "https://docs.foo.dev",
          "external": true
        },
        {
          "id": "help-foo-dev",
          "path": "https://help.foo.dev",
          "external": true
        },
        {
          "id": "foo-dev-changelog",
          "path": "https://foo.dev/changelog",
          "external": true
        }
      ]
    },
    {
      "id": "project/settings",
      "path": "/settings"
    },
    {
      "id": "docs-acme-dev",
      "path": "https://docs.acme.dev",
      "external": true
    },
    {
      "id": "help-acme-dev",
      "path": "https://help.acme.dev",
      "external": true
    },
    {
      "id": "acme-dev-changelog",
      "path": "https://acme.dev/changelog",
      "external": true
    },
    {
      "id": "docs-acme-dev",
      "path": "https://docs.acme.dev",
      "external": true
    },
    {
      "id": "help-acme-dev",
      "path": "https://help.acme.dev",
      "external": true
    },
    {
      "id": "acme-dev-changelog",
      "path": "https://acme.dev/changelog",
      "external": true
    }
  ]
};

/**
 * Global actions, if any; the application should wire these up.
 */
const globalActions: GlobalActionSpec[] = [{"id":"ship-tickets","label":"Ship Tickets","iconName":"Truck","sections":["project"]},{"id":"feedback","label":"Feedback","iconName":"MessageSquare"},{"id":"notifications","label":"Notifications","iconName":"Bell"}];

/**
 * Badge targets, if any; the application should wire these up.
 */
const badgeTargets: string[] = ["ship-tickets","notifications"];

/* 2 ─ pure helpers (no adapter) ─────────────────────────────── */
const cache = new Map<string, NavTreeNode[]>();

function hydrate(n: NavStructNode): NavTreeNode {
  const meta = metaMap.get(n.id) ?? {};
  return { ...meta, id: n.id, path: n.path, children: n.children?.map(hydrate) };
}

// shared depth-first helper
function collect(
  nodes: NavTreeNode[],
  test: (n: NavTreeNode) => boolean,
  acc: NavTreeNode[] = [],
): NavTreeNode[] {
  for (const n of nodes) {
    if (test(n)) acc.push(n);
    if (n.children) collect(n.children, test, acc);
  }
  return acc;
}

function sections() {
  return Object.keys(navStructure);
}

function routes(section: string = "main") {
  if (!cache.has(section)) cache.set(section, (navStructure[section] ?? []).map(hydrate));
  return cache.get(section)!;
}

function routesByTags(
  section: string,
  tags: string[],
): NavTreeNode[] {
  const hasAll = (n: NavTreeNode) =>
    tags.every((t) => n.tags?.includes(t));
  return collect(routes(section), hasAll);
}

function routesByGroup(
  section: string,
  group: string,
): NavTreeNode[] {
  return collect(routes(section), (n) => n.group === group);
}

/* 3 ─ router adapter plumbing ──────────────────────────────── */
let adapter: RouterAdapter | null = null;
export function registerRouter(a: RouterAdapter) {
  adapter = a;
}

function assertAdapter(): RouterAdapter {
  if (!adapter)
    throw new Error(
      "navigationApi: router adapter not registered. " +
      "Call registerRouter({ Link, useLocation, useMatches, matchPath }) " +
      "once, in your AppShell.",
    );
  return adapter;
}

/**
 * Hook to hydrate matches with your navigation metadata
 */
function useHydratedMatches(): Array<{ handle: NavMeta }> {
  const { useMatches } = assertAdapter();
  const matches = useMatches();
  return matches.map((match) => {
    // If match.handle is already populated (e.g. from module handle exports), keep it
    if (match.handle) return match as typeof match & { handle: NavMeta };
    const meta = metaMap.get(match.id);
    // Return a new object if handle is added to avoid mutating the original match
    return meta ? { ...match, handle: meta } : match as typeof match & { handle: NavMeta };
  });
}

export default {
  sections,
  routes,
  routesByTags,
  routesByGroup,
  useHydratedMatches,
  globalActions,
  badgeTargets,
  /* router adapter (proxied) */
  get router() {
    return assertAdapter();
  },
} as NavigationApi;
