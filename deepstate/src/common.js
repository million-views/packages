// common.js - Core implementation of DeepState with improved API
// This implementation supports:
// 1. Unified state and computed definitions
// 2. Cross-reference support through self/root context
// 3. Seamless SSR compatibility
// 4. Deep reactivity with proper reference handling

// Symbol for marking objects as shallow (non-deep reactive)
const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");

// Symbol for identifying computed properties vs regular methods
const IS_COMPUTED = Symbol("@m5nv/deepstate/is-computed");

// Symbol for tracking parent references in the state tree
const PARENT_REF = Symbol("@m5nv/deepstate/parent-ref");

// Symbol for tracking root references in the state tree
const ROOT_REF = Symbol("@m5nv/deepstate/root-ref");

// SSR-compatible signal implementation for server rendering
function createSSRSignal(initialValue) {
  let value = initialValue;

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      value = newValue;
    },
    // These methods ensure proper string coercion during SSR
    toString() {
      return String(value);
    },
    valueOf() {
      return value;
    },
    [Symbol.toPrimitive]() {
      return value;
    },
  };
}

// SSR-compatible computed implementation
function createSSRComputed(computeFn, self, root) {
  return {
    get value() {
      try {
        return computeFn(self, root);
      } catch (error) {
        console.error("Error in computed property:", error);
        return undefined;
      }
    },
    toString() {
      try {
        return String(computeFn(self, root));
      } catch (error) {
        console.error("Error stringifying computed property:", error);
        return "";
      }
    },
    valueOf() {
      try {
        return computeFn(self, root);
      } catch (error) {
        console.error("Error in computed valueOf:", error);
        return undefined;
      }
    },
    [Symbol.toPrimitive]() {
      try {
        return computeFn(self, root);
      } catch (error) {
        console.error("Error in computed toPrimitive:", error);
        return undefined;
      }
    },
  };
}

// The main factory function to create DeepState APIs for different signal libraries
export function createDeepStateAPI(
  { signal, computed, untracked },
  escapeHatchPrefix = "$",
) {
  // Determine if we're in SSR mode
  const isSSR = typeof process !== "undefined"
    ? process.env.DEEPSTATE_MODE === "SSR"
    : typeof window === "undefined";

  // Use appropriate signal implementation based on environment
  const createSignal = isSSR ? createSSRSignal : signal;
  const createComputed = isSSR ? createSSRComputed : computed;
  const safeUntracked = isSSR ? ((fn) => fn()) : untracked;

  // Mark an object for shallow wrapping (non-recursive reactivity)
  function shallow(obj) {
    if (obj && typeof obj === "object") {
      obj[IS_SHALLOW] = true;
    }
    return obj;
  }

  // Mark a function as a computed property
  function computedProp(fn) {
    fn[IS_COMPUTED] = true;
    return fn;
  }

  // Determine if a value should be proxied for reactivity
  function shouldProxy(value) {
    return (
      value &&
      typeof value === "object" &&
      !value[IS_SHALLOW] &&
      (Array.isArray(value) || value.constructor === Object)
    );
  }

  // Process initial state object to identify and separate computed properties
  function processInitialState(
    initialState,
    permissive,
    parentObj = null,
    rootObj = null,
  ) {
    // Skip processing for shallow or non-object values
    if (
      !initialState || typeof initialState !== "object" ||
      initialState[IS_SHALLOW]
    ) {
      return { plainState: initialState, computedDefs: {} };
    }

    const plainState = Array.isArray(initialState) ? [] : {};
    const computedDefs = {};

    // For internal tracking - set parent and root references
    if (parentObj) {
      Object.defineProperty(plainState, PARENT_REF, {
        value: parentObj,
        enumerable: false,
        configurable: true,
      });
    }

    if (rootObj) {
      Object.defineProperty(plainState, ROOT_REF, {
        value: rootObj,
        enumerable: false,
        configurable: true,
      });
    }

    // Process each property in the initial state
    for (const [key, value] of Object.entries(initialState)) {
      // Skip symbol properties
      if (typeof key === "symbol") continue;

      // Identify computed properties (functions marked with IS_COMPUTED or all functions if we want that behavior)
      if (
        typeof value === "function" &&
        (value[IS_COMPUTED] || key.startsWith("get"))
      ) {
        computedDefs[key] = value;
        continue;
      }

      // Process nested objects and arrays recursively
      if (shouldProxy(value)) {
        const rootReference = rootObj || plainState;
        const { plainState: nestedPlain, computedDefs: nestedComputed } =
          processInitialState(
            value,
            permissive,
            plainState,
            rootReference,
          );

        plainState[key] = nestedPlain;

        // Add nested computed properties with their full paths
        for (const [nestedKey, nestedFn] of Object.entries(nestedComputed)) {
          computedDefs[`${key}.${nestedKey}`] = nestedFn;
        }
      } else {
        // Direct assignment for primitive values or shallow objects
        plainState[key] = value;
      }
    }

    return { plainState, computedDefs };
  }

  // Create signals for all properties in the state object
  function createStateSignals(stateObj, permissive) {
    const signals = {};

    // Always include a version signal for tracking changes
    signals.__version = createSignal(0);

    // Create signals for all properties
    for (const key in stateObj) {
      if (Object.prototype.hasOwnProperty.call(stateObj, key)) {
        // Deeply wrap nested objects/arrays unless marked as shallow
        const value = stateObj[key];
        const wrappedValue = shouldProxy(value)
          ? createDeepProxy(
            value,
            permissive,
            undefined,
            stateObj,
            getRootObject(stateObj),
          )
          : value;

        signals[key] = createSignal(wrappedValue);
      }
    }

    return signals;
  }

  // Get the root object from a nested object using the ROOT_REF symbol
  function getRootObject(obj) {
    if (!obj || typeof obj !== "object") return undefined;
    if (obj[ROOT_REF]) return obj[ROOT_REF];
    return obj;
  }

  // Register computed properties with their contexts
  function registerComputedProperties(
    stateObj,
    signals,
    computedDefs,
    rootObj,
  ) {
    const computedSignals = {};

    // First pass: create all computed signals
    for (const [path, computeFn] of Object.entries(computedDefs)) {
      const pathParts = path.split(".");
      const propName = pathParts[pathParts.length - 1];

      // Find target object for this computed property
      let target = stateObj;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (/^\d+$/.test(part) && Array.isArray(target)) {
          target = target[parseInt(part, 10)];
        } else {
          target = target[part];
        }

        if (!target) {
          console.error(`Cannot find target for computed property: ${path}`);
          break;
        }
      }

      // Skip if target is not found
      if (!target) continue;

      // Create a proxy-wrapped version of the state object
      // This ensures computed properties can access other computed properties
      const stateProxy = new Proxy(stateObj, {
        get(t, p) {
          // First check if it's a computed property
          if (p in computedSignals) {
            return computedSignals[p].value;
          }
          // Then check regular properties
          if (p in signals) {
            return signals[p].value;
          }
          // Default behavior for anything else
          return Reflect.get(t, p);
        },
      });

      // Create computed with access to the proxy that can resolve other computed properties
      const signal = isSSR
        ? createSSRComputed(
          () => computeFn.call(target, stateProxy, stateProxy),
          target,
          rootObj || stateObj,
        )
        : createComputed(() => computeFn.call(target, stateProxy, stateProxy));

      // Store computed signal
      if (pathParts.length === 1) {
        computedSignals[propName] = signal;
      } else {
        const nestedPath = pathParts.slice(0, -1).join(".");
        computedSignals[`${nestedPath}.${propName}`] = signal;
      }
    }

    return computedSignals;
  }

  // Create a proxy handler for reactive state
  function createProxyHandler(
    stateObj,
    signals,
    computedSignals,
    permissive,
    parentObj,
    rootObj,
  ) {
    return {
      get(target, prop, receiver) {
        // Handle special symbols
        if (prop === Symbol.toStringTag || prop === Symbol.iterator) {
          return Reflect.get(target, prop, receiver);
        }

        // Handle escape hatch access to signals
        if (typeof prop === "string" && prop.startsWith(escapeHatchPrefix)) {
          const key = prop.slice(escapeHatchPrefix.length);

          // Access to computed signal
          if (key in computedSignals) {
            // In SSR mode, return the unwrapped value directly
            return isSSR ? computedSignals[key].value : computedSignals[key];
          }

          // Direct access to regular signal
          if (key in signals) {
            // In SSR mode, return the unwrapped value directly
            return isSSR ? signals[key].value : signals[key];
          }

          // Handle nested computed properties
          for (const path in computedSignals) {
            if (path.endsWith(`.${key}`)) {
              return isSSR
                ? computedSignals[path].value
                : computedSignals[path];
            }
          }

          // No signal found
          if (!permissive) {
            console.warn(`No signal found for escape hatch property: ${key}`);
          }

          return undefined;
        }

        // For non-escape-hatch access:

        // 1. Handle special built-in methods
        if (prop === "toJSON") {
          return function () {
            return toJSON(target, signals, computedSignals);
          };
        }

        // For arrays, track access via __version to ensure reactivity
        if (Array.isArray(target) && signals.__version) {
          signals.__version.value; // Read to establish dependency
        }

        // 2. Handle computed property access
        if (prop in computedSignals) {
          return computedSignals[prop].value;
        }

        // 3. Handle signal access - return the current value
        if (prop in signals) {
          return signals[prop].value;
        }

        // Handle nested computed properties
        for (const path in computedSignals) {
          if (path.endsWith(`.${prop}`)) {
            return computedSignals[path].value;
          }
        }

        // 4. Handle parent/root references
        if (prop === PARENT_REF) {
          return parentObj;
        }

        if (prop === ROOT_REF) {
          return rootObj || target;
        }

        // 5. Default property access
        return Reflect.get(target, prop, receiver);
      },

      set(target, prop, value, receiver) {
        // Handle escape hatch property assignment in SSR mode
        if (typeof prop === "string" && prop.startsWith(escapeHatchPrefix)) {
          const key = prop.slice(escapeHatchPrefix.length);

          // In SSR mode, allow direct assignment of primitive values or arrays to the signal value
          if (isSSR && key in signals) {
            // If trying to assign an object with a value property, reject it
            // This catches attempts to directly assign to the signal object
            if (value && typeof value === "object" && "value" in value) {
              throw new Error(
                `Cannot directly set '${prop}'. Use the signal's 'value' property.`,
              );
            }

            // Otherwise, allow direct value assignments in SSR mode
            const wrappedValue = shouldProxy(value)
              ? createDeepProxy(
                value,
                permissive,
                undefined,
                target,
                rootObj || target,
              )
              : value;

            signals[key].value = wrappedValue;
            target[key] = value;

            // Increment version
            if (signals.__version) {
              signals.__version.value++;
            }

            return true;
          }

          // In non-SSR mode, throw error to enforce .value usage
          throw new Error(
            `Cannot directly set '${prop}'. Use the signal's 'value' property.`,
          );
        }

        // Special handling for array length
        if (Array.isArray(target) && prop === "length") {
          const result = Reflect.set(target, prop, value, receiver);
          if (signals.__version) {
            signals.__version.value++;
          }
          return result;
        }

        // Prevent array replacement for deep arrays
        if (
          Array.isArray(target[prop]) &&
          Array.isArray(value) &&
          !target[prop][IS_SHALLOW]
        ) {
          throw new Error(
            `Whole array replacement is disallowed for deep arrays. Use the '${escapeHatchPrefix}' escape hatch.`,
          );
        }

        // Handle array element updates
        if (
          Array.isArray(target) && typeof prop === "string" &&
          /^\d+$/.test(prop)
        ) {
          const index = parseInt(prop, 10);

          // Wrap the value if it's a complex object
          const wrappedValue = shouldProxy(value)
            ? createDeepProxy(
              value,
              permissive,
              undefined,
              target,
              rootObj || target,
            )
            : value;

          // Update or create signal for this index
          if (index in signals) {
            signals[index].value = wrappedValue;
          } else {
            signals[index] = createSignal(wrappedValue);
          }

          // Update target
          target[index] = value;

          // Increment version to trigger reactivity
          if (signals.__version) {
            signals.__version.value++;
          }

          return true;
        }

        // Reject function assignments
        if (typeof value === "function" && !value[IS_COMPUTED]) {
          throw new Error(
            "Functions are not allowed as state properties in DeepState. Use computedProp() to mark computed properties.",
          );
        }

        // Add this block for computed property assignments
        if (typeof value === "function" && value[IS_COMPUTED]) {
          // Handle dynamic computed property assignment
          const computedSignal = isSSR
            ? createSSRComputed(
              () => value.call(target, receiver, rootObj || target),
              target,
              rootObj || target,
            )
            : createComputed(() =>
              value.call(target, receiver, rootObj || target)
            );

          // Store in computedSignals
          computedSignals[prop] = computedSignal;

          // Don't store the function itself in the target
          // Just store a placeholder so the property exists
          target[prop] = { [IS_COMPUTED]: true };

          // Increment version for coarse-grained reactivity
          if (signals.__version) {
            signals.__version.value++;
          }

          return true;
        }

        // Handle existing property updates
        if (prop in signals) {
          const wrappedValue = shouldProxy(value)
            ? createDeepProxy(
              value,
              permissive,
              undefined,
              target,
              rootObj || target,
            )
            : value;

          signals[prop].value = wrappedValue;

          // Still update the underlying object for consistency
          target[prop] = value;

          // Increment version for coarse-grained reactivity
          if (signals.__version) {
            signals.__version.value++;
          }

          return true;
        }

        // Handle new property addition
        if (!permissive && !(prop in target)) {
          throw new Error(`Cannot add new property '${prop}' in strict mode.`);
        }

        // Create new signal for property
        const wrappedValue = shouldProxy(value)
          ? createDeepProxy(
            value,
            permissive,
            undefined,
            target,
            rootObj || target,
          )
          : value;

        signals[prop] = createSignal(wrappedValue);
        target[prop] = value;

        // Increment version
        if (signals.__version) {
          signals.__version.value++;
        }

        return true;
      },

      deleteProperty(target, prop) {
        // Handle array element deletion
        if (
          Array.isArray(target) && typeof prop === "string" &&
          /^\d+$/.test(prop)
        ) {
          const result = Reflect.deleteProperty(target, prop);

          if (signals[prop]) {
            signals[prop].value = undefined;
          }

          // Increment version
          if (signals.__version) {
            signals.__version.value++;
          }

          return result;
        }

        // Handle regular property deletion
        const result = Reflect.deleteProperty(target, prop);

        if (signals[prop]) {
          signals[prop].value = undefined;
        }

        return result;
      },

      ownKeys(target) {
        // Include computed properties in keys
        let keys = Reflect.ownKeys(target);

        // Add computed property keys
        for (const key in computedSignals) {
          if (!key.includes(".")) { // Only top-level computed properties
            keys.push(key);
          }
        }

        // Filter out internal props
        return keys.filter((k) =>
          k !== "toJSON" &&
          k !== PARENT_REF &&
          k !== ROOT_REF &&
          k !== "__version"
        );
      },

      getOwnPropertyDescriptor(target, prop) {
        // Check if it's a computed property
        if (prop in computedSignals && !prop.includes(".")) {
          return {
            enumerable: true,
            configurable: true,
            get: () => computedSignals[prop].value,
          };
        }

        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    };
  }

  // Create JSON representation of the state
  function toJSON(target, signals, computedSignals) {
    return safeUntracked(() => {
      const result = {};

      // Process regular properties
      for (const key in signals) {
        if (
          key !== "__version" &&
          !key.startsWith(escapeHatchPrefix) &&
          typeof signals[key].value !== "function"
        ) {
          result[key] = signals[key].value;
        }
      }

      return result;
    });
  }

  // Create a deep proxy for an object
  function createDeepProxy(obj, permissive, signalStore, parentObj, rootObj) {
    // Skip for shallow objects
    if (obj && obj[IS_SHALLOW]) {
      return obj;
    }

    // Process the object and extract computed properties
    const { plainState, computedDefs } = processInitialState(
      obj,
      permissive,
      parentObj,
      rootObj,
    );

    // Create signals for the state
    const signals = signalStore || createStateSignals(plainState, permissive);

    // Register computed properties
    const computedSignals = registerComputedProperties(
      plainState,
      signals,
      computedDefs,
      rootObj || plainState,
    );

    // Create and return the proxy
    return new Proxy(
      plainState,
      createProxyHandler(
        plainState,
        signals,
        computedSignals,
        permissive,
        parentObj,
        rootObj,
      ),
    );
  }

  // The main reify function - creates a reactive state store
  function reify(initialState, options = { permissive: false }) {
    if (!initialState || typeof initialState !== "object") {
      throw new TypeError(
        "initialState must be a non-null object. Use signal(...) for simple types.",
      );
    }
    const { permissive } = options;
    // Process initial state and computed properties
    const { plainState, computedDefs } = processInitialState(
      initialState,
      permissive,
    );

    // Create signals for state properties
    const signals = createStateSignals(plainState, permissive);

    // Register computed properties
    const computedSignals = registerComputedProperties(
      plainState,
      signals,
      computedDefs,
    );

    // Create the state proxy
    const stateProxy = new Proxy(
      plainState,
      createProxyHandler(plainState, signals, computedSignals, permissive),
    );

    // Create the store object
    const store = {
      state: stateProxy,
      __version: signals.__version,
      toJSON: () => stateProxy.toJSON(),
    };

    // Method to attach actions to the store
    store.attach = function (actions = {}) {
      const boundActions = {};

      // Bind each action to the state
      for (const [name, fn] of Object.entries(actions)) {
        boundActions[name] = (...args) => fn(store.state, ...args);
      }

      store.actions = boundActions;
      return store;
    };

    return store;
  }

  // Return the public API
  return {
    shallow,
    computedProp,
    reify,
  };
}
