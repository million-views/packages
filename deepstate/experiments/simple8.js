// --- Benchmark Code ---

// Assuming simpleDeepProxy code from the previous step is available here
// If not, paste the 'simpleDeepProxy', 'shallow', 'derivedBy', 'IS_SHALLOW' code here.
// --- Start of simpleDeepProxy code ---
import { batch, computed, signal } from "@preact/signals-core";

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
export function shallow(obj) {
  obj[IS_SHALLOW] = true;
  return obj;
}

function derivedBy(self, fn, root, dbi) {
  const actualRoot = root; // Capture root
  const computedSignal = computed(() => {
    if (!actualRoot && fn.length > 1) { // Check if root argument expected
      dbi.error(
        "[derivedBy] Error: Root proxy is not available for computed function:",
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

export function simpleDeepProxy(initial, debug = false) {
  const dbi = (typeof debug === "object" && debug !== null &&
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

    if (Array.isArray(o)) {
      storage = [];
      storage = o.map((item) => {
        const itemIsObject = item && typeof item === "object";
        const itemIsSignalInstance = isSignal(item); // Renamed for clarity
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
          const valIsSignalInstance = isSignal(val); // Renamed
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

    const handler = {
      get(target, prop, receiver) {
        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          if (isSignal(val)) return val.value;
          return val;
        }
        if (prop in computedFns) {
          const cachedComputed = Reflect.get(target, prop);
          if (
            isSignal(cachedComputed) && cachedComputed._fn === computedFns[prop]
          ) {
            return cachedComputed.value;
          } else {
            const comp = derivedBy(receiver, computedFns[prop], root, dbi);
            target[prop] = comp;
            return comp.value;
          }
        }
        if (
          Array.isArray(target) && typeof prop === "string" &&
          prop in Array.prototype
        ) {
          const method = Array.prototype[prop];
          if (typeof method === "function") return method.bind(receiver);
        }
        return undefined;
      },
      set(target, prop, newVal, receiver) {
        const currentVal = Reflect.get(target, prop);
        if (isSignal(currentVal)) {
          currentVal.value = newVal;
          return true;
        } else {
          return Reflect.set(target, prop, newVal);
        }
      },
      has(target, prop) {
        return (prop in target) || (prop in computedFns);
      },
      deleteProperty(target, prop) {
        /* ... simplified ... */ return Reflect.deleteProperty(target, prop);
      },
    };
    proxy = new Proxy(storage, handler);
    return proxy;
  } // End _deepProxy

  const finalProxy = _deepProxy(initial);
  root = finalProxy;
  return root;
}
// --- End of simpleDeepProxy code ---

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
