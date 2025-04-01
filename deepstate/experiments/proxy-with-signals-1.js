import { computed, effect, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root) {
  return computed(() => fn(self, root));
}

function deepProxy(obj, opts = {}) {
  const cache = new WeakMap();
  let root; // top-level proxy

  function _deepProxy(o) {
    if (typeof o !== "object" || o === null) return o;
    if (cache.has(o)) return cache.get(o);
    let p;
    let transformed = o;
    if (opts.wrapSignals && !o[IS_SHALLOW]) {
      transformed = Array.isArray(o) ? [] : {};
      // For arrays, attach a version signal so that changes can be tracked.
      if (Array.isArray(o)) {
        transformed.__version = signal(0);
      }
      for (const key of Reflect.ownKeys(o)) {
        const val = o[key];
        if (val && typeof val === "object" && val[IS_SHALLOW]) {
          transformed[key] = val;
        } else if (val && typeof val === "object" && "value" in val) {
          transformed[key] = val;
        } else if (typeof val === "function") {
          transformed[key] = { __wrapFunction: val };
        } else if (val && typeof val === "object") {
          transformed[key] = _deepProxy(val);
        } else {
          transformed[key] = signal(val);
        }
      }
      if (opts.computedProps) {
        for (const compKey in opts.computedProps) {
          if (!(compKey in transformed)) {
            transformed[compKey] = {
              __wrapFunction: opts.computedProps[compKey],
            };
          }
        }
      }
    }
    function serialize(o) {
      if (Array.isArray(o)) return o.map(serialize);
      if (o && typeof o === "object") {
        const res = {};
        for (const key of Reflect.ownKeys(o)) {
          let v = o[key];
          if (v && typeof v === "object" && "value" in v) {
            v = v.value;
          } else if (v && typeof v === "object" && v.__wrapFunction) {
            if (opts.callFunctions) {
              try {
                v = v.__wrapFunction.call(o, o, root);
              } catch (e) {
                v = undefined;
              }
            } else continue;
          }
          res[key] = serialize(v);
        }
        return res;
      }
      return o;
    }
    const handler = {
      get(t, k, rec) {
        // When serializing, use the root.
        if (k === "toJSON") {
          return () => serialize(root);
        }
        // For arrays, "touch" the version to force dependency tracking.
        if (Array.isArray(t) && t.__version && k !== "__version") {
          // Read the version signal (this registers a dependency).
          void t.__version.value;
        }
        let v = Reflect.get(t, k, rec);
        if (v && typeof v === "object" && v.__wrapFunction) {
          const orig = v.__wrapFunction;
          v = derivedBy(rec, orig, root);
          t[k] = v;
          return v;
        }
        return v;
      },
      set(t, k, newVal, rec) {
        let current = Reflect.get(t, k, rec);
        if (current && typeof current === "object" && "value" in current) {
          current.value = newVal;
          // If the target is an array, update its __version to trigger reactivity.
          if (Array.isArray(t) && t.__version) {
            t.__version.value++;
          }
          return true;
        }
        const result = Reflect.set(t, k, newVal, rec);
        if (Array.isArray(t) && t.__version) {
          t.__version.value++;
        }
        return result;
      },
    };
    p = new Proxy(transformed, handler);
    cache.set(o, p);
    if (!root) root = p;
    return p;
  }
  return _deepProxy(obj);
}
export { deepProxy, shallow };

///-----------------------------------------------------------------------------
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
  // Touch the __version so that changes trigger re-evaluation.
  if (Array.isArray(root) && root.__version) {
    void root.__version.value;
  }
  if (!self.requirements || self.requirements.length === 0) return true;
  return self.requirements.every((req) => {
    const requiredTask = root.find((t) => t.id.value === req.requiredTaskId);
    return requiredTask &&
      [req.requiredState, "completed"].includes(requiredTask.state.value);
  });
};

// Instead of manually wrapping state, we let deepProxy do it.
// First, prepare tasks with state property (or default "pending") and
// isEnabled computed function
const tasksWithState = rawTasks.map((task) => ({
  ...task,
  state: task.state || "pending",
  isEnabled,
}));

// // Create an effect to reset state if a task becomes disabled.
// effect(() => {
//   tasks.forEach((task) => {
//     if (!task.isEnabled.value) {
//       task.state.value = "pending";
//     }
//   });
// });

const tasks = deepProxy(tasksWithState, {
  wrapSignals: true,
});

// Inspect the reactive tasks.
tasks.forEach((task) => {
  console.log(
    `Task ${task.id.value} (${task.name.value}): state=${task.state.value}, isEnabled=${task.isEnabled.value}`,
  );
});

tasks[0].state.value = "ongoing";
tasks[1].state.value = "ongoing";

console.log(
  "task 1 and task 2 are set to ongoing, expecting task 3 to be enabled",
);
// Inspect the reactive tasks.
effect(() => {
  tasks.forEach((task) => {
    console.log(
      `Task ${task.id.value} (${task.name.value}): state=${task.state.value}, isEnabled=${task.isEnabled.value}`,
    );
  });
});

const counter = deepProxy(
  { count: 0, double: (self, root) => self.count * 2 },
  {
    wrapSignals: true,
  },
);

console.log("Counter@0: ", counter.count.value, counter.double.value);
counter.count.value++;
console.log("Counter@1: ", counter.count.value, counter.double.value);
counter.count.value++;
console.log("Counter@2: ", counter.count.value, counter.double.value);
