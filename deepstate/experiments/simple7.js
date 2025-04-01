import { computed, effect, signal } from "@preact/signals-core";

// --- Utils ---

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root, dbi) {
  dbi.log(
    "[derivedBy] Creating computed for:",
    fn.name || "anonymous",
    "self:",
    self,
    "root:",
    !!root,
  );
  // Ensure root is available for the computed function execution
  const actualRoot = root;
  return computed(() => {
    // Log access only when the computed function actually runs
    dbi.log(`[derivedBy] Running computed for: ${fn.name || "anonymous"}`);
    if (!actualRoot) {
      dbi.error(
        "[derivedBy] Error: Root proxy is not available for computed function:",
        fn.name,
      );
      // Decide how to handle this - throw error or return default?
      // Throwing is safer to indicate a setup problem.
      throw new Error(
        `Root proxy not available for computed function ${
          fn.name || "anonymous"
        }`,
      );
    }
    const result = fn(self, actualRoot); // Pass the captured root
    dbi.log(`[derivedBy] ${fn.name || "anonymous"} computed result:`, result);
    return result;
  });
}

// --- Core ---

export function simpleDeepProxy(initial, debug = false) {
  // Set up a debug instrumenter.
  const dbi = (typeof debug === "object" && debug !== null &&
      typeof debug.log === "function" && typeof debug.assert === "function")
    ? debug
    : (debug === true ? console : {
      log: () => {},
      assert: () => {},
      error: (console.error || console.log),
    }); // Ensure error exists

  // Enforce top-level must be an object.
  if (
    initial === null || typeof initial !== "object" || Array.isArray(initial)
  ) {
    throw new Error("Top-level must be a plain object.");
  }

  // The top-level proxy will be captured here AFTER creation.
  // This `root` variable is accessible by `_deepProxy` and `derivedBy` within this scope.
  let root = null;

  function _deepProxy(o) {
    // No need to pass root down explicitly if using the module-level 'root' variable strategy
    dbi.log("[_deepProxy] called with:", o);
    const computedFns = {};
    let storage; // = Array.isArray(o) ? [] : {}; // Initialize based on type below
    let proxy;

    // Helper to check if a value is a signal
    const isSignal = (val) =>
      val && typeof val === "object" && "value" in val &&
      typeof val.peek === "function";

    if (Array.isArray(o)) {
      storage = []; // Initialize as array
      storage = o.map((item) => {
        const itemIsObject = item && typeof item === "object";
        const itemIsSignal = isSignal(item);
        const itemIsShallow = itemIsObject && item[IS_SHALLOW];

        if (itemIsObject && !itemIsSignal && !itemIsShallow) {
          // It's an object/array needing recursion
          dbi.log("[_deepProxy Array Map] -> Recursing into item:", item);
          return _deepProxy(item); // Recurse
        } else if (itemIsShallow) {
          // Store shallow objects raw
          dbi.log("[_deepProxy Array Map] -> Storing shallow item raw:", item);
          return item; // Store raw
        } else {
          // Primitive or already a signal
          dbi.log(
            "[_deepProxy Array Map] -> Wrapping/keeping primitive/signal:",
            item,
          );
          return itemIsSignal ? item : signal(item); // Wrap only if not already a signal
        }
      });
    } else { // Handle Objects (assuming plain object from initial check)
      storage = {}; // Initialize as object
      for (const key in o) {
        // Avoid proxying prototype properties
        if (!Object.hasOwnProperty.call(o, key)) continue;

        const val = o[key];
        dbi.log("[_deepProxy Object Loop] Processing key:", key, "value:", val);

        if (typeof val === "function") {
          dbi.log(
            "[_deepProxy Object Loop] -> Storing computed function for key:",
            key,
          );
          computedFns[key] = val; // Store the function itself
        } else {
          const valIsObject = val && typeof val === "object";
          const valIsSignal = isSignal(val);
          const valIsShallow = valIsObject && val[IS_SHALLOW];

          if (valIsObject && !valIsSignal && !valIsShallow) {
            // It's an object/array needing recursion
            dbi.log("[_deepProxy Object Loop] -> Recursing into key:", key);
            storage[key] = _deepProxy(val); // Recurse
          } else if (valIsShallow) {
            dbi.log(
              "[_deepProxy Object Loop] -> Value is shallow; storing raw for key:",
              key,
            );
            storage[key] = val; // Store shallow object raw
          } else {
            // Primitive or already a signal
            dbi.log(
              "[_deepProxy Object Loop] -> Wrapping/keeping primitive/signal for key:",
              key,
            );
            storage[key] = valIsSignal ? val : signal(val); // Wrap only if not already a signal
          }
        }
      }
    }

    const handler = {
      get(target, prop, receiver) {
        dbi.log(
          `[_deepProxy get] Request for prop: "${String(prop)}" on target:`,
          target,
        );

        // 1. Handle direct properties of the storage (signals, nested proxies, raw shallow values)
        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          dbi.log(
            `[_deepProxy get] Found prop "${
              String(prop)
            }" in target. Raw value:`,
            val,
          );
          if (isSignal(val)) {
            dbi.log(
              `[_deepProxy get] Unwrapping signal for prop "${
                String(prop)
              }" ->`,
              val.value,
            );
            return val.value;
          }
          // Return nested proxy or raw shallow value directly
          return val;
        }

        // 2. Handle computed properties
        if (prop in computedFns) {
          dbi.log(
            `[_deepProxy get] Prop "${
              String(prop)
            }" is a computed function. Accessing/Creating computed signal.`,
          );
          // Computed properties are calculated on demand and cached on the target (storage)
          // Check if the computed signal is already cached on the target
          const cachedComputed = Reflect.get(target, prop); // No receiver here, check direct storage
          // Add a simple check if the stored value seems like a computed signal (improve if needed)
          if (
            isSignal(cachedComputed) && cachedComputed._fn === computedFns[prop]
          ) { // Check if it's our signal tagged below
            dbi.log(
              `[_deepProxy get] Returning value from cached computed signal for "${
                String(prop)
              }"`,
            );
            return cachedComputed.value;
          } else {
            // Create the computed signal, store it, return its value
            dbi.log(
              `[_deepProxy get] Creating new computed signal for "${
                String(prop)
              }"`,
            );
            const comp = derivedBy(
              receiver, // The current proxy ('self')
              computedFns[prop],
              root, // Use the module-level root (should be set after initial creation)
              dbi,
            );
            // Cache the computed signal itself on the storage object
            comp._fn = computedFns[prop]; // Tag the signal for caching check
            target[prop] = comp;
            return comp.value;
          }
        }

        // 3. Handle Array methods specifically for Array proxies
        if (
          Array.isArray(target) && typeof prop === "string" &&
          prop in Array.prototype
        ) {
          const method = Array.prototype[prop];
          if (typeof method === "function") {
            dbi.log(
              `[_deepProxy get] Returning bound array method for: "${prop}"`,
            );
            // Return the method bound to the proxy receiver, so 'this' inside method works as expected
            // Note: This means array methods like map/forEach will yield proxied items / unwrapped signals
            return method.bind(receiver);
            // Alternative: Bind to target (storage) if methods should operate on raw signals? Less intuitive.
            // return method.bind(target);
          }
        }

        // 4. Handle Array index access (redundant if target[prop] check works, but explicit)
        if (
          Array.isArray(target) && typeof prop === "string" &&
          !isNaN(Number(prop))
        ) {
          const index = Number(prop);
          if (index >= 0 && index < target.length) {
            const val = Reflect.get(target, index, receiver); // Access storage directly
            dbi.log(
              `[_deepProxy get] Array element at index: ${index}, raw value:`,
              val,
            );
            if (isSignal(val)) {
              return val.value; // Unwrap signal
            }
            return val; // Return nested proxy or raw value
          }
        }

        dbi.log(
          `[_deepProxy get] Prop "${
            String(prop)
          }" not found in target or computedFns; returning undefined.`,
        );
        return undefined;
      },

      set(target, prop, newVal, receiver) {
        dbi.log(
          `[_deepProxy set] Request to set prop "${String(prop)}" to:`,
          newVal,
        );

        // Check if the property exists on the storage and if it's a signal
        const currentVal = Reflect.get(target, prop); // Check storage directly

        if (isSignal(currentVal)) {
          // If trying to set a signal property, update its value
          dbi.log(
            `[_deepProxy set] Updating signal value for "${String(prop)}"`,
          );
          currentVal.value = newVal;
          return true; // Indicate success
        } else {
          // Allow setting new properties or overwriting existing non-signal properties/proxies on the storage
          // Note: This could overwrite a cached computed signal object if not careful.
          dbi.log(
            `[_deepProxy set] Setting prop "${
              String(prop)
            }" directly on target.`,
          );
          return Reflect.set(target, prop, newVal); // Set on storage directly
        }
      },

      // Add other traps as needed (e.g., deleteProperty, has)
      has(target, prop) {
        dbi.log(`[_deepProxy has] Request for prop: "${String(prop)}"`);
        return (prop in target) || (prop in computedFns);
      },

      deleteProperty(target, prop) {
        dbi.log(
          `[_deepProxy deleteProperty] Request for prop: "${String(prop)}"`,
        );
        if (prop in target) {
          dbi.log(
            `[_deepProxy deleteProperty] Deleting prop "${
              String(prop)
            }" from target`,
          );
          // Check if it's a computed property - might need to remove from computedFns too?
          if (prop in computedFns) {
            dbi.log(
              `[_deepProxy deleteProperty] Also removing computed function "${
                String(prop)
              }"`,
            );
            delete computedFns[prop];
          }
          return Reflect.deleteProperty(target, prop);
        } else if (prop in computedFns) {
          // Only exists as a function, remove it
          dbi.log(
            `[_deepProxy deleteProperty] Removing computed function "${
              String(prop)
            }"`,
          );
          delete computedFns[prop];
          return true;
        }
        dbi.log(`[_deepProxy deleteProperty] Prop "${String(prop)}" not found`);
        return false;
      },
    }; // End handler

    proxy = new Proxy(storage, handler);
    return proxy;
  } // End _deepProxy

  // --- Initialization ---
  // Create the proxy structure recursively
  const finalProxy = _deepProxy(initial);

  // *** CRUCIAL STEP ***
  // After the entire structure is proxied, set the definitive root
  // This `root` variable is captured by the `derivedBy` function's closure
  root = finalProxy;
  dbi.log("[simpleDeepProxy] Final root proxy established.");

  return root; // Return the fully constructed top-level proxy
}

////////////////////////////////////////////////////////////////////////////////
// --- Examples ---
////////////////////////////////////////////////////////////////////////////////

const debug = false; // Enable console logging from dbi
console.log("--- Running Examples ---");

// Example A: Simple object with computed property
console.log("\n--- Example A ---");
const exampleA = {
  a: 5,
  double(self, root) {
    // self should be proxyA
    // root should be proxyA
    return { result: self.a * 2, selfIsRoot: self === root };
  },
};
const proxyA = simpleDeepProxy(exampleA, debug);
console.log("Accessing proxyA.a:", proxyA.a);
console.log("Accessing proxyA.double:", proxyA.double);
// Test reactivity
console.log("Setting proxyA.a = 6");
proxyA.a = 6;
console.log("Accessing proxyA.double again:", proxyA.double); // Should recompute

// Example B: Nested object with computed property using root
console.log("\n--- Example B ---");
const exampleB = {
  x: 10,
  nested: {
    y: 5,
    sum(self, root) {
      // self should be proxyB.nested
      // root should be proxyB
      return { sum: self.y + root.x, selfIsNested: self === root.nested };
    },
  },
};
const proxyB = simpleDeepProxy(exampleB, debug);
console.log("Accessing proxyB.x:", proxyB.x);
console.log("Accessing proxyB.nested.y:", proxyB.nested.y);
console.log("Accessing proxyB.nested.sum:", proxyB.nested.sum);
// Test reactivity
console.log("Setting proxyB.x = 100");
proxyB.x = 100;
console.log("Accessing proxyB.nested.sum again:", proxyB.nested.sum); // Should recompute
console.log("Setting proxyB.nested.y = 50");
proxyB.nested.y = 50;
console.log("Accessing proxyB.nested.sum again:", proxyB.nested.sum); // Should recompute

// Example C: Object with an array and computed property using array methods
console.log("\n--- Example C ---");
const exampleC = {
  items: [1, 2, 3],
  total(self, root) {
    // self should be proxyC
    // root should be proxyC
    // self.items should be the proxy for the array -> [1, 2, 3]
    // REMOVED: dbi.log("[Example C total] Calculating sum of:", self.items);
    return {
      total: self.items.reduce((acc, item) => acc + item, 0),
      selfIsRoot: self === root,
    };
  },
};
const proxyC = simpleDeepProxy(exampleC, debug);
console.log("Accessing proxyC.items:", proxyC.items); // Should show the array
console.log("Accessing proxyC.items[0]:", proxyC.items[0]);
console.log("Accessing proxyC.total:", proxyC.total);
// Test reactivity - modify array element
console.log("Setting proxyC.items[0] = 10");
proxyC.items[0] = 10;
console.log("Accessing proxyC.items:", proxyC.items);
console.log("Accessing proxyC.total again:", proxyC.total); // Should recompute
// Test reactivity - array mutation (if supported by proxy/signals)
// console.log("Pushing 4 to proxyC.items");
// proxyC.items.push(4); // Requires signals integration for array mutations or a more complex proxy
// console.log("Accessing proxyC.items:", proxyC.items);
// console.log("Accessing proxyC.total again:", proxyC.total); // Should recompute if push works reactively

// Example D: Array containing objects, one with a computed property
// *** THIS WAS THE FAILING EXAMPLE ***
console.log("\n--- Example D ---");
const exampleD = {
  tasks: [
    { id: 1, value: 10 }, // Plain object
    {
      id: 2,
      value: 20,
      doubleValue(self, root) { // Computed property within an object in an array
        // self should be proxyD.tasks[1]
        // root should be proxyD
        // REMOVED: dbi.log("[Example D doubleValue] Calculating double for self:", self);
        // REMOVED: dbi.log("[Example D doubleValue] Root:", root);
        // Check: Find self within root.tasks (requires tasks items to be proxies)
        const foundSelf = root.tasks.find((t) => t.id === self.id);
        return {
          double: self.value * 2,
          // selfIsTask: self === root.tasks[1], // Direct index might be unstable if array changes
          selfIsTask: self === foundSelf, // More robust check
        };
      },
    },
  ],
};
const proxyD = simpleDeepProxy(exampleD, debug);
console.log("Accessing proxyD.tasks:", proxyD.tasks); // Should show array of proxies/values
console.log("Accessing proxyD.tasks[0]:", proxyD.tasks[0]); // Should be { id: 1, value: 10 }
console.log("Accessing proxyD.tasks[1]:", proxyD.tasks[1]); // Should be proxy for { id: 2, ... }
console.log("Accessing proxyD.tasks[1].value:", proxyD.tasks[1].value);
console.log(
  "Accessing proxyD.tasks[1].doubleValue:",
  proxyD.tasks[1].doubleValue,
); // *** This should now work ***
// Test reactivity
console.log("Setting proxyD.tasks[1].value = 25");
proxyD.tasks[1].value = 25;
console.log(
  "Accessing proxyD.tasks[1].doubleValue again:",
  proxyD.tasks[1].doubleValue,
); // Should recompute

// Example E: Shallow object
console.log("\n--- Example E ---");
const myShallowObject = shallow({ a: 1, b: signal(2) }); // Mark as shallow
const exampleE = {
  name: "Test E",
  shallowData: myShallowObject,
  computedShallow(self, root) {
    // Accessing shallowData should give the raw object
    // Accessing shallowData.a should work directly
    // Accessing shallowData.b needs .value because it was explicitly a signal inside
    return {
      name: self.name,
      rawA: self.shallowData.a,
      signalB: self.shallowData.b.value, // Access signal inside raw object
      isRaw: self.shallowData === myShallowObject,
    };
  },
};
const proxyE = simpleDeepProxy(exampleE, debug);
console.log("Accessing proxyE.shallowData:", proxyE.shallowData); // Should be the raw shallow object
console.log("Accessing proxyE.shallowData.a:", proxyE.shallowData.a);
console.log("Accessing proxyE.shallowData.b:", proxyE.shallowData.b); // Should be the signal itself
console.log(
  "Accessing proxyE.shallowData.b.value:",
  proxyE.shallowData.b.value,
); // Unwrapped signal value
console.log("Accessing proxyE.computedShallow:", proxyE.computedShallow);
// Modify original shallow object - proxy should see change IF raw object stored
console.log("Modifying original shallow object: myShallowObject.a = 100");
myShallowObject.a = 100;
console.log("Accessing proxyE.shallowData.a again:", proxyE.shallowData.a); // Should reflect change
console.log("Accessing proxyE.computedShallow again:", proxyE.computedShallow); // Should reflect change in rawA

console.log("\n--- End Examples ---");

// --- Dependency Tracking Example ---
const state = {
  greeting: "Hello",
  name: "World",
  message(self, root) {
    // This computed property depends on greeting and name.
    return `${self.greeting}, ${self.name}!`;
  },
};

const proxyState = simpleDeepProxy(state);

console.log("Initial message:", proxyState.message); // "Hello, World!"
proxyState.greeting = "Hi";
console.log("After greeting update:", proxyState.message); // "Hi, World!"
proxyState.name = "Alice";
console.log("After name update:", proxyState.message); // "Hi, Alice!"

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

// --- Update States ---
tasks.tasks[2].state = "ongoing"; // Task 3 now ongoing
tasks.tasks[0].state = "completed"; // Task 1 now ongoing
tasks.tasks[1].state = "completed"; // Task 2 now ongoing

console.log("After state changes, again:");
tasks.tasks.forEach((task) => {
  console.log(
    `Task ${task.id} (${task.name}): state=${task.state}, isEnabled=${task.isEnabled}`,
  );
});

// Optionally, add an effect to trigger side effects (not strictly needed for dependency testing)
// effect(() => {
//   tasks.tasks.forEach((task) => {
//     if (!task.isEnabled) {
//       console.log(`Resetting state of Task ${task.id} to pending.`);
//       task.state = "pending";
//     }
//   });
// });
