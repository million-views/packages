// --- Updated simpleDeepProxy with Escape Hatch ---

import { batch, computed, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

// derivedBy remains the same as the benchmark version
function derivedBy(self, fn, root, dbi) {
  const actualRoot = root; // Capture root
  const computedSignal = computed(() => {
    // Check if root argument expected based on function definition
    if (!actualRoot && fn.length > 1) {
      dbi.error(
        "[derivedBy] Error: Root proxy not available for computed function:",
        fn.name,
      );
      throw new Error(
        `Root proxy not available for computed function ${
          fn.name || "anonymous"
        }`,
      );
    }
    // Only pass root if the function expects it (check arity)
    const result = fn.length > 1 ? fn(self, actualRoot) : fn(self);
    return result;
  });
  // Tag the signal for caching check later (used in proxy get)
  computedSignal._fn = fn;
  return computedSignal;
}

// Added escapeHatch parameter with default '$'
export function simpleDeepProxy(initial, debug = false, escapeHatch = "$") {
  const dbi =
    (typeof debug === "object" && debug !== null &&
        typeof debug.log === "function")
      ? debug
      : (debug === true
        ? console
        : { log: () => {}, error: (console.error || console.log) });

  if (
    initial === null || typeof initial !== "object" || Array.isArray(initial)
  ) {
    throw new Error("Top-level must be a plain object.");
  }
  let root = null;
  const isSignal = (val) =>
    val && typeof val === "object" && "value" in val &&
    typeof val.peek === "function";

  function _deepProxy(o) {
    const computedFns = {};
    let storage;
    let proxy;

    // --- Array/Object processing logic remains the same ---
    if (Array.isArray(o)) {
      storage = [];
      storage = o.map((item) => {
        const itemIsObject = item && typeof item === "object";
        const itemIsSignalInstance = isSignal(item);
        const itemIsShallow = itemIsObject && item[IS_SHALLOW];
        if (itemIsObject && !itemIsSignalInstance && !itemIsShallow) {
          return _deepProxy(item);
        } else if (itemIsShallow) {
          return item;
        } else {
          return itemIsSignalInstance ? item : signal(item);
        }
      });
    } else {
      storage = {};
      for (const key in o) {
        if (!Object.hasOwnProperty.call(o, key)) continue;
        const val = o[key];
        if (typeof val === "function") {
          computedFns[key] = val;
        } else {
          const valIsObject = val && typeof val === "object";
          const valIsSignalInstance = isSignal(val);
          const valIsShallow = valIsObject && val[IS_SHALLOW];
          if (valIsObject && !valIsSignalInstance && !valIsShallow) {
            storage[key] = _deepProxy(val);
          } else if (valIsShallow) {
            storage[key] = val;
          } else {
            storage[key] = valIsSignalInstance ? val : signal(val);
          }
        }
      }
    }

    // --- Handler with modified 'get' for escape hatch ---
    const handler = {
      get(target, prop, receiver) {
        // --- Escape Hatch Logic ---
        // Check if escapeHatch is a usable string and prop matches
        if (
          typeof escapeHatch === "string" && escapeHatch.length > 0 &&
          typeof prop === "string" && prop.startsWith(escapeHatch)
        ) {
          const actualProp = prop.substring(escapeHatch.length);
          dbi.log(
            `[Get EscapeHatch] Detected for "${prop}", actualProp: "${actualProp}"`,
          );

          // Check storage first (could contain signal, computed, nested proxy, raw shallow)
          if (actualProp in target) {
            const underlyingVal = Reflect.get(target, actualProp); // Get whatever is stored
            dbi.log(
              `[Get EscapeHatch] Returning underlying value from target for "${actualProp}":`,
              underlyingVal,
            );
            // Return the signal, computed, proxy, or raw value itself WITHOUT unwrapping
            return underlyingVal;
          }

          // Check computed functions that might not be materialized yet
          if (actualProp in computedFns) {
            dbi.log(
              `[Get EscapeHatch] Found computed function for "${actualProp}"`,
            );
            // Ensure computed signal exists on target (materialize if needed for caching/consistency)
            let computedSignal = Reflect.get(target, actualProp);
            if (
              !isSignal(computedSignal) ||
              computedSignal._fn !== computedFns[actualProp]
            ) {
              dbi.log(
                `[Get EscapeHatch] Materializing computed signal for "${actualProp}"`,
              );
              computedSignal = derivedBy(
                receiver,
                computedFns[actualProp],
                root,
                dbi,
              );
              target[actualProp] = computedSignal; // Store it back on target
            }
            dbi.log(
              `[Get EscapeHatch] Returning underlying computed signal object for "${actualProp}":`,
              computedSignal,
            );
            // Return the computed signal object itself
            return computedSignal;
          }

          dbi.log(
            `[Get EscapeHatch] Underlying property "${actualProp}" not found for "${prop}".`,
          );
          return undefined; // Property doesn't exist even without the prefix
        }

        // --- Original Get Logic (if not escape hatch) ---
        dbi.log(`[Get] Request for prop: "${String(prop)}" on target:`, target);

        // 1. Handle direct properties of the storage (signals, nested proxies, raw shallow values)
        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          dbi.log(
            `[Get] Found prop "${String(prop)}" in target. Raw value:`,
            val,
          );
          if (isSignal(val)) {
            dbi.log(
              `[Get] Unwrapping signal for prop "${String(prop)}" ->`,
              val.value,
            );
            return val.value; // UNWRAP value for normal access
          }
          return val; // Return nested proxy or raw shallow value directly
        }

        // 2. Handle computed properties
        if (prop in computedFns) {
          dbi.log(
            `[Get] Prop "${
              String(prop)
            }" is a computed function. Accessing/Creating computed signal.`,
          );
          const cachedComputed = Reflect.get(target, prop);
          if (
            isSignal(cachedComputed) && cachedComputed._fn === computedFns[prop]
          ) {
            dbi.log(
              `[Get] Returning value from cached computed signal for "${
                String(prop)
              }"`,
            );
            return cachedComputed.value; // UNWRAP value for normal access
          } else {
            dbi.log(`[Get] Creating new computed signal for "${String(prop)}"`);
            const comp = derivedBy(receiver, computedFns[prop], root, dbi);
            target[prop] = comp; // Store computed signal itself for caching
            return comp.value; // UNWRAP value for normal access
          }
        }

        // 3. Handle Array methods specifically for Array proxies
        if (
          Array.isArray(target) && typeof prop === "string" &&
          prop in Array.prototype
        ) {
          const method = Array.prototype[prop];
          if (typeof method === "function") {
            dbi.log(`[Get] Returning bound array method for: "${prop}"`);
            return method.bind(receiver);
          }
        }

        // Explicit array index handling was removed in benchmark version, relying on `prop in target`.

        dbi.log(`[Get] Prop "${String(prop)}" not found; returning undefined.`);
        return undefined;
      }, // --- End get handler ---

      // --- set, has, deleteProperty handlers remain the same as benchmark version ---
      set(target, prop, newVal, receiver) {
        dbi.log(`[Set] Request to set prop "${String(prop)}" to:`, newVal);
        const currentVal = Reflect.get(target, prop);
        if (isSignal(currentVal)) {
          dbi.log(`[Set] Updating signal value for "${String(prop)}"`);
          currentVal.value = newVal;
          return true;
        } else {
          dbi.log(`[Set] Setting prop "${String(prop)}" directly on target.`);
          return Reflect.set(target, prop, newVal);
        }
      },
      has(target, prop) {
        // Note: Should 'has' check for escape hatch versions? e.g., should `'$prop' in proxy` be true?
        // Current logic doesn't account for escape hatch, only checks target/computedFns
        // To be fully consistent, 'has' could also check for '$'+prop if 'prop' exists.
        // Let's keep it simple for now:
        dbi.log(`[Has] Request for prop: "${String(prop)}"`);
        return (prop in target) || (prop in computedFns);
      },
      deleteProperty(target, prop) {
        dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
        // Similar to 'has', doesn't currently account for deleting '$prop' vs 'prop' explicitly.
        // Simplest is to delete the underlying prop. User shouldn't delete '$prop'.
        if (prop in computedFns) delete computedFns[prop]; // Remove computed fn if exists
        return Reflect.deleteProperty(target, prop); // Delete from storage
      },
    }; // End handler

    proxy = new Proxy(storage, handler);
    return proxy;
  } // End _deepProxy

  // --- Initialization ---
  const finalProxy = _deepProxy(initial);
  root = finalProxy; // Set root after creation
  dbi.log("[simpleDeepProxy] Final root proxy established.");
  return root;
}

// --- shallow function remains the same ---
// export function shallow(obj) { ... }
// const IS_SHALLOW = Symbol(...);
// --- Benchmark Setup ---
const ITERATIONS = 900000; // Number of repetitions for timed tests

// Define the initial state structure
const getInitialState = () => ({
  counter: 0,
  multiplier: 2,
  text: "hello",
  items: [
    { id: 1, value: 10, label: "A" },
    { id: 2, value: 20, label: "B" },
    { id: 3, value: 30, label: "C" },
  ],
  nested: {
    factor: 5,
    active: true,
  },
  // Computed function for simpleDeepProxy
  doubledCounter(self) {
    return self.counter * self.multiplier;
  },
  // Computed function for simpleDeepProxy
  totalValue(self) {
    // Note: Accessing self.items.reduce assumes array methods work on proxy
    // and item.value accesses nested proxied signal values
    return self.items.reduce((sum, item) => sum + item.value, 0);
  },
  // Computed function for simpleDeepProxy
  nestedDerived(self, root) {
    return root.counter * self.nested.factor;
  },
});

// --- Manual State Setup ---
function setupManualState(initial) {
  const state = {
    counter: signal(initial.counter),
    multiplier: signal(initial.multiplier),
    text: signal(initial.text),
    items: signal(initial.items.map((item) => ({
      // For manual setup, we often wrap the primitives inside the object
      id: signal(item.id),
      value: signal(item.value),
      label: signal(item.label),
    }))),
    nested: {
      factor: signal(initial.nested.factor),
      active: signal(initial.nested.active),
    },
  };

  // Manual Computed Properties
  state.doubledCounter = computed(() => {
    return state.counter.value * state.multiplier.value;
  });

  state.totalValue = computed(() => {
    // Must access .value on the items array signal AND nested value signals
    return state.items.value.reduce((sum, item) => sum + item.value.value, 0);
  });

  state.nestedDerived = computed(() => {
    return state.counter.value * state.nested.factor.value;
  });

  return state;
}

// --- Test Functions ---

// Read primitive value
function testReadPrimitive(state) {
  return state.counter;
}

// Read nested value
function testReadNested(state) {
  // Access first item's value
  // Manual needs .value for array and .value for item value
  // Proxy handles this transparently (if array/object proxying works)
  if (state.items.value) { // Manual path
    return state.items.value[0].value.value;
  } else { // Proxy path
    // Check if items array exists and has length before access
    return state.items && state.items.length > 0
      ? state.items[0].value
      : undefined;
  }
}

// Write primitive value
function testWritePrimitive(state, value) {
  state.counter = value;
}

// Read computed value
function testReadComputed(state) {
  return state.doubledCounter;
}

// Read computed value derived from array/nested
function testReadComplexComputed(state) {
  const total = state.totalValue;
  const nested = state.nestedDerived;
  return total + nested;
}

// --- Benchmark Runner ---

function runTest(label, testFn, state, iterations) {
  console.time(label);
  let result; // To prevent potential optimizations eliminating the loop call
  for (let i = 0; i < iterations; i++) {
    result = testFn(state, i); // Pass iteration count for write test
  }
  console.timeEnd(label);
  return result; // Optionally return last result
}

// --- Run Benchmarks ---

console.log(`--- Starting Benchmarks (Iterations: ${ITERATIONS}) ---`);

// 1. Setup Time
console.log("\n--- Setup Time ---");
console.time("Setup: simpleDeepProxy");
const proxyState = simpleDeepProxy(getInitialState());
console.timeEnd("Setup: simpleDeepProxy");

console.time("Setup: Manual");
const manualState = setupManualState(getInitialState());
console.timeEnd("Setup: Manual");
console.log("--------------------");

// 2. Read Performance
console.log("\n--- Read Performance ---");
runTest("Read Primitive (Proxy)", testReadPrimitive, proxyState, ITERATIONS);
runTest("Read Primitive (Manual)", testReadPrimitive, manualState, ITERATIONS);

runTest("Read Nested    (Proxy)", testReadNested, proxyState, ITERATIONS);
runTest("Read Nested    (Manual)", testReadNested, manualState, ITERATIONS);
console.log("--------------------");

// 3. Write Performance
console.log("\n--- Write Performance ---");
runTest("Write Primitive (Proxy)", testWritePrimitive, proxyState, ITERATIONS);
runTest(
  "Write Primitive (Manual)",
  testWritePrimitive,
  manualState,
  ITERATIONS,
);
console.log("--------------------");

// 4. Computed Read Performance
console.log("\n--- Computed Read Performance ---");
runTest("Read Computed (Proxy)", testReadComputed, proxyState, ITERATIONS);
runTest("Read Computed (Manual)", testReadComputed, manualState, ITERATIONS);

runTest(
  "Read Complex Computed (Proxy)",
  testReadComplexComputed,
  proxyState,
  ITERATIONS,
);
runTest(
  "Read Complex Computed (Manual)",
  testReadComplexComputed,
  manualState,
  ITERATIONS,
);
console.log("--------------------");

// 5. Write + Computed Read Performance
console.log("\n--- Write + Computed Read Performance ---");
// Test function that writes then reads computed values
function testWriteReadComputed(state, value) {
  state.counter = value; // Write
  const d = state.doubledCounter; // Read computed 1 (dependent)
  const t = state.totalValue; // Read computed 2 (not directly dependent in this write)
  const n = state.nestedDerived; // Read computed 3 (dependent)
  return d + t + n;
}
runTest(
  "Write+Read Computed (Proxy)",
  testWriteReadComputed,
  proxyState,
  ITERATIONS,
);
runTest(
  "Write+Read Computed (Manual)",
  testWriteReadComputed,
  manualState,
  ITERATIONS,
);
console.log("--------------------");

console.log("\n--- Benchmarks Complete ---");

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

const proxyState2 = simpleDeepProxy(state);

console.log("Initial message:", proxyState2.message); // "Hello, World!"
proxyState2.greeting = "Hi";
console.log("After greeting update:", proxyState2.message); // "Hi, World!"
proxyState2.name = "Alice";
console.log("After name update:", proxyState2.message); // "Hi, Alice!"

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
