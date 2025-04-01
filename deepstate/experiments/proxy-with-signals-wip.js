import { computed, effect, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, root, fn) {
  return computed(() => fn(self, root));
}

const cache = new WeakMap();
function deepProxy(obj, root, opts = {}) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (cache.has(obj)) return cache.get(obj);
  let p; // declared for inner functions
  // Create a transformed copy if wrapSignals is enabled and the object isn’t marked shallow.
  let transformed = obj;
  if (opts.wrapSignals && !obj[IS_SHALLOW]) {
    transformed = Array.isArray(obj) ? [] : {};
    for (const key of Reflect.ownKeys(obj)) {
      const val = obj[key];
      // If the property is marked shallow, copy as-is.
      if (val && typeof val === "object" && val[IS_SHALLOW]) {
        transformed[key] = val;
      } // If it's already a signal (or computed), leave it.
      else if (val && typeof val === "object" && "value" in val) {
        transformed[key] = val;
      } else if (typeof val === "function") {
        // Wrap functions as a marker.
        transformed[key] = { __wrapFunction: val };
      } else if (val && typeof val === "object") {
        // Recursively wrap nested objects.
        transformed[key] = deepProxy(val, root, opts);
      } else {
        // For primitives, wrap them in a signal.
        transformed[key] = signal(val);
      }
    }
    // Add computedProps if provided.
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
        // Unwrap signals/computed.
        if (v && typeof v === "object" && "value" in v) {
          v = v.value;
        } // Optionally call function markers.
        else if (v && typeof v === "object" && v.__wrapFunction) {
          if (opts.callFunctions) {
            try {
              v = v.__wrapFunction.call(o, o, root || p);
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
      if (k === "toJSON") {
        return () => serialize(root || p);
      }
      let v = Reflect.get(t, k, rec);
      // If we see a function marker, use derivedBy to inline a computed.
      if (v && typeof v === "object" && v.__wrapFunction) {
        const orig = v.__wrapFunction;
        v = derivedBy(rec, root || p, orig);
        t[k] = v; // cache it
        return v;
      }
      return v;
    },
    set(t, k, newVal, rec) {
      let current = Reflect.get(t, k, rec);
      if (current && typeof current === "object" && "value" in current) {
        current.value = newVal;
        return true;
      }
      return Reflect.set(t, k, newVal, rec);
    },
  };

  p = new Proxy(transformed, handler);
  cache.set(obj, p);
  return p;
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
  if (!self.requirements || self.requirements.length === 0) return true;
  return self.requirements.every((req) => {
    const requiredTask = root.find((t) => t.id.value === req.requiredTaskId);
    return requiredTask &&
      [req.requiredState, "completed"].includes(requiredTask.state.value);
  });
};

// Instead of manually wrapping state, we let deepProxy do it.
// First, prepare tasks with state property (or default "pending")
const tasksWithState = rawTasks.map((task) => ({
  ...task,
  state: task.state || "pending",
  isEnabled,
}));

// Define a computedProps mapping to add an 'isEnabled' computed property.
// const computedProps = {
//   isEnabled: (self, root) => {
//     if (!self.requirements || self.requirements.length === 0) return true;
//     return self.requirements.every((req) => {
//       const requiredTask = root.find((t) => t.id.value === req.requiredTaskId);
//       return requiredTask &&
//         [req.requiredState, "completed"].includes(requiredTask.state.value);
//     });
//   },
// };

// const computedProps = {
//   isEnabled: (self, root) => {
//     // Force dependency on the array by reading its length.
//     const dummy = root.length;
//     if (!self.requirements || self.requirements.length === 0) return true;
//     return self.requirements.every((req) => {
//       const requiredTask = root.find((t) => t.id.value === req.requiredTaskId);
//       if (!requiredTask) return false;
//       // Force dependency on requiredTask.state.value by reading it into a variable.
//       const st = requiredTask.state.value;
//       return [req.requiredState, "completed"].includes(st);
//     });
//   },
// };

// Wrap the tasksWithState array. We want the root to be an array that supports .find.
// const proxiedTasksArray = deepProxy(tasksWithState, null, {
//   wrapSignals: true,
// });

// Now, wrap each task with computedProps, using the proxied array as the root.
// const tasks = proxiedTasksArray.map((task) =>
//   deepProxy(task, proxiedTasksArray, { wrapSignals: true, computedProps })
// );

const tasks = deepProxy(tasksWithState, null, {
  wrapSignals: true,
});

// Create an effect to reset state if a task becomes disabled.
effect(() => {
  tasks.forEach((task) => {
    if (!task.isEnabled.value) {
      task.state.value = "pending";
    }
  });
});

// Optionally, view the plain object representation.
// console.log("Serialized tasks:", tasks.toJSON());

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
tasks.forEach((task) => {
  console.log(
    `Task ${task.id.value} (${task.name.value}): state=${task.state.value}, isEnabled=${task.isEnabled.value}`,
  );
});
