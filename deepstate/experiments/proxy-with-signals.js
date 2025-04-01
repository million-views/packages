import { computed, effect, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

const cache = new WeakMap();
export function deepProxy(obj) {
  let root; // top-level proxy

  function _deepProxy(o) {
    if (typeof o !== "object" || o === null) return o;
    if (cache.has(o)) return cache.get(o);

    // We'll accumulate plain data here.
    let transformed = Array.isArray(o) ? [] : {};
    // And inline computed functions in a separate map.
    const computedFns = {};

    if (Array.isArray(o)) {
      const ver = signal(0);
      transformed.__version = ver;
    }
    for (const key of Reflect.ownKeys(o)) {
      const val = o[key];
      if (val && typeof val === "object" && val[IS_SHALLOW]) {
        transformed[key] = val;
      } else if (
        val && typeof val === "object" && ("value" in val || "v" in val)
      ) {
        // Already a signal or computed; leave it.
        transformed[key] = val;
      } else if (typeof val === "function") {
        // Instead of marking, store the function for later wrapping.
        computedFns[key] = val;
        // Do not add anything to transformed.
      } else if (val && typeof val === "object") {
        transformed[key] = _deepProxy(val);
      } else {
        transformed[key] = signal(val);
      }
    }
    const handler = {
      get(t, k, rec) {
        if (k === "toJSON") {
          return () => serialize(root);
        }
        // For arrays, "touch" __version to trigger reactivity.
        if (Array.isArray(t) && t.__version) {
          t.__version.value;
        }
        // First, try to get from transformed (plain signals, etc.)
        let v = Reflect.get(t, k, rec);
        // If v is a signal, unwrap it.
        if (v && typeof v === "object" && ("value" in v || "v" in v)) {
          return v.value !== undefined ? v.value : v.v;
        }
        return v;
      },
      set(t, k, newVal, rec) {
        let current = Reflect.get(t, k, rec);
        if (
          current && typeof current === "object" &&
          ("value" in current || "v" in current)
        ) {
          if ("value" in current) {
            current.value = newVal;
          } else {
            current.v = newVal;
          }
          if (Array.isArray(t) && t.__version) t.__version.value++;
          return true;
        }
        const result = Reflect.set(t, k, newVal, rec);
        if (Array.isArray(t) && t.__version) t.__version.value++;
        return result;
      },
    };
    const p = new Proxy(transformed, handler);
    cache.set(o, p);
    if (!root) root = p;
    // Pre-wire all inline computed functions.
    for (const key in computedFns) {
      const compSignal = derivedBy(p, computedFns[key], root);
      Object.defineProperty(p, key, {
        get() {
          return compSignal.value;
        },
        configurable: true,
        enumerable: false,
      });
      Object.defineProperty(p, "$" + key, {
        get() {
          return compSignal;
        },
        configurable: true,
        enumerable: false,
      });
    }
    return p;
  }
  function serialize(o) {
    if (Array.isArray(o)) return o.map(serialize);
    if (o && typeof o === "object") {
      const res = {};
      for (const key of Reflect.ownKeys(o)) {
        let v = o[key];
        // If it's a signal, unwrap it.
        if (v && typeof v === "object" && ("value" in v || "v" in v)) {
          v = v.value !== undefined ? v.value : v.v;
        }
        // Do not serialize computed properties (they were attached non-enumerably).
        res[key] = serialize(v);
      }
      return res;
    }
    return o;
  }
  return _deepProxy(obj);
}

// ----- Test Code -----
const counter = deepProxy({
  count: 0,
  double: (self, root) => self.count * 2,
});
console.log("Counter@0:", counter.count, counter.double);
counter.count++;
console.log("Counter@1:", counter.count, counter.double);
counter.count++;
console.log("Counter@2:", counter.count, counter.double);

const rawTasks = [
  { id: 1, name: "Task 1", requirements: [] },
  { id: 2, name: "Task 2", requirements: [] },
  {
    id: 3,
    name: "Task 3",
    requirements: [
      { id: "r1", requiredTaskId: 1, requiredState: "ongoing" },
      { id: "r2", requiredTaskId: 2, requiredState: "ongoing" },
    ],
  },
  {
    id: 4,
    name: "Task 4",
    requirements: [
      { id: "r3", requiredTaskId: 1, requiredState: "completed" },
      { id: "r4", requiredTaskId: 2, requiredState: "completed" },
      { id: "r5", requiredTaskId: 3, requiredState: "ongoing" },
    ],
  },
];

const isEnabled = (self, root) => {
  console.log("isEnabled: ", self.state, self.requirements);
  if (!self.requirements || self.requirements.length === 0) return true;
  return self.requirements.every((req) => {
    const requiredTask = root.find((t) => t.id === req.requiredTaskId);
    return requiredTask &&
      [req.requiredState, "completed"].includes(requiredTask.state);
  });
};

const tasksWithState = rawTasks.map((task) => ({
  ...task,
  state: task.state || "pending",
  isEnabled, // inline computed property
}));

const tasks = deepProxy(tasksWithState);

effect(() => {
  tasks.forEach((task) => {
    if (!task.isEnabled) {
      task.state = "pending";
    }
  });
});

tasks.forEach((task) => {
  console.log(
    `Task ${task.id} (${task.name}): state=${task.state}, isEnabled=${task.isEnabled}`,
  );
});

tasks[0].state = "ongoing";
tasks[1].state = "ongoing";

console.log("After state changes:");
tasks.forEach((task) => {
  console.log(
    `Task ${task.id} (${task.name}): state=${task.state}, isEnabled=${task.isEnabled}`,
  );
});
