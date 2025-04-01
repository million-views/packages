import { computed, effect, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root, dbi) {
  dbi.log("[derivedBy] self:", self, "root:", root);
  return computed(() => {
    const result = fn(self, root);
    dbi.log(`[derivedBy] ${fn.name} computed result:`, result);
    return result;
  });
}

export function simpleDeepProxy(
  initial,
  rootHolder = { root: null },
  debug = false,
) {
  // Set up our debug instrumenter.
  let dbi;
  if (
    typeof debug === "object" && debug !== null &&
    typeof debug.log === "function" && typeof debug.assert === "function"
  ) {
    dbi = debug;
  } else {
    dbi = debug === true ? console : {
      log: () => undefined,
      assert: () => undefined,
      error: () => undefined,
    };
  }

  dbi.log("[init] simpleDeepProxy called with:", initial);
  const computedFns = {};
  let storage = Array.isArray(initial) ? [] : {};

  for (const key in initial) {
    const val = initial[key];
    dbi.log("[init] Processing key:", key, "value:", val);
    if (typeof val === "function") {
      dbi.log("[init] -> Storing computed function for key:", key);
      computedFns[key] = val;
    } else if (val && typeof val === "object" && !("value" in val)) {
      if (val[IS_SHALLOW]) {
        dbi.log("[init] -> Value is shallow; storing as-is for key:", key);
        storage[key] = val;
      } else {
        dbi.log("[init] -> Recursing into key:", key);
        storage[key] = simpleDeepProxy(val, rootHolder, debug);
      }
    } else {
      dbi.log("[init] -> Wrapping primitive for key:", key);
      storage[key] = signal(val);
    }
  }

  const handler = {
    get(target, prop, receiver) {
      dbi.log("[get] prop:", prop);
      if (
        Array.isArray(target) && typeof prop === "string" &&
        prop in Array.prototype
      ) {
        const method = Array.prototype[prop];
        if (typeof method === "function") {
          dbi.log("[get] Returning bound array method for:", prop);
          return method.bind(target);
        }
      }
      if (prop in target) {
        const val = Reflect.get(target, prop, receiver);
        dbi.log("[get] Found prop in target:", prop, "raw value:", val);
        if (val && typeof val === "object" && "value" in val) {
          dbi.log("[get] Unwrapping signal for prop:", prop, "->", val.value);
          return val.value;
        }
        return val;
      }
      if (prop in computedFns) {
        dbi.log(
          "[get] Prop",
          prop,
          "is a computed function. Creating computed signal.",
        );
        const comp = derivedBy(
          receiver,
          computedFns[prop],
          rootHolder.root || receiver,
          dbi,
        );
        target[prop] = comp;
        return comp.value;
      }
      dbi.log("[get] Prop", prop, "not found; returning undefined.");
      return undefined;
    },
    set(target, prop, newVal, receiver) {
      dbi.log("[set] prop:", prop, "newVal:", newVal);
      if (prop in target) {
        const curr = Reflect.get(target, prop, receiver);
        if (curr && typeof curr === "object" && "value" in curr) {
          dbi.log("[set] Updating signal for prop:", prop);
          curr.value = newVal;
          return true;
        }
      }
      dbi.log("[set] Setting prop normally for:", prop);
      return Reflect.set(target, prop, newVal, receiver);
    },
  };

  const proxy = new Proxy(storage, handler);
  if (rootHolder.root === null) {
    rootHolder.root = proxy;
    dbi.log("[init] Top-level proxy set as root:", proxy);
  }
  return proxy;
}

////////////////////////////////////////////////////////////////////////////////

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

// --- Inline Computed isEnabled ---
// self: the current task (reactively wrapped)
// root: the full tasks array (our proxy) so we can find dependencies.
const isEnabled = (self, root) => {
  // console.log("Computing isEnabled for task", self.id, "state:", self.state);
  if (!self.requirements || self.requirements.length === 0) return true;
  return self.requirements.every((req) => {
    const requiredTask = root.tasks.find((t) => t.id === req.requiredTaskId);
    return requiredTask &&
      [req.requiredState, "completed"].includes(requiredTask.state);
  });
};

const tasksWithState = rawTasks.map((task) => ({
  ...task,
  state: task.state || "pending",
  isEnabled,
}));

const tasks = simpleDeepProxy({ tasks: tasksWithState });

// --- Log Initial State ---
console.log("Initial tasks:");
tasks.tasks.forEach((task) => {
  console.log(
    `Task ${task.id} (${task.name}): state=${task.state}, isEnabled=${task.isEnabled}`,
  );
});

// --- Update States ---
tasks.tasks[0].state = "ongoing"; // Task 1 now ongoing
tasks.tasks[1].state = "ongoing"; // Task 2 now ongoing

// --- Log Updated State ---
console.log("After state changes:");
tasks.tasks.forEach((task) => {
  console.log(
    `Task ${task.id} (${task.name}): state=${task.state}, isEnabled=${task.isEnabled}`,
  );
});

// Optionally, add an effect to trigger side effects (not strictly needed for dependency testing)
effect(() => {
  tasks.tasks.forEach((task) => {
    if (!task.isEnabled) {
      console.log(`Resetting state of Task ${task.id} to pending.`);
      task.state = "pending";
    }
  });
});
