// common.js - DeepState with immediate nested proxy creation
// ensuring no plain objects ever overwrite the proxies

const IS_SHALLOW = Symbol("@m5nv/deepstate/is-shallow");
const PARENT_REF = Symbol("@m5nv/deepstate/parent-ref");
const ROOT_REF = Symbol("@m5nv/deepstate/root-ref");

// We'll track the path of each plain object in this WeakMap
const pathMap = new WeakMap();

function resolvePropertyPath(parentPath, prop) {
  if (typeof prop === "symbol") return parentPath;
  if (!parentPath) return String(prop);
  return `${parentPath}.${prop}`;
}

function createSSRSignal(initialValue) {
  let value = initialValue;
  return {
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    },
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

function createSSRComputed(fn, self, root) {
  return {
    get value() {
      try {
        return fn(self, root);
      } catch (err) {
        console.error("Error in computed property:", err);
        return undefined;
      }
    },
    toString() {
      try {
        return String(fn(self, root));
      } catch {
        return "";
      }
    },
    valueOf() {
      try {
        return fn(self, root);
      } catch {
        return undefined;
      }
    },
    [Symbol.toPrimitive]() {
      try {
        return fn(self, root);
      } catch {
        return undefined;
      }
    },
  };
}

export function createDeepStateAPI(
  { signal, computed, untracked },
  escapeHatchPrefix = "$",
) {
  // Force SPA mode
  const isSSR = false;
  const createSignal = isSSR ? createSSRSignal : signal;
  const createComputed = isSSR ? createSSRComputed : computed;
  const safeUntracked = isSSR ? (fn) => fn() : untracked;

  function shallow(obj) {
    if (obj && typeof obj === "object") {
      obj[IS_SHALLOW] = true;
    }
    return obj;
  }

  function shouldProxy(value) {
    return (
      value &&
      typeof value === "object" &&
      !value[IS_SHALLOW] &&
      (Array.isArray(value) || value.constructor === Object)
    );
  }

  /**
   * Process the initial state:
   * - Auto-detect any function with 1 or 2 arguments as a computed property.
   * - Immediately proxy nested objects/arrays.
   */
  function processInitialState(
    initialState,
    permissive,
    parentObj = null,
    rootObj = null,
    parentPath = "",
  ) {
    if (
      !initialState ||
      typeof initialState !== "object" ||
      initialState[IS_SHALLOW]
    ) {
      return { plainState: initialState, computedDefs: {} };
    }

    const isArr = Array.isArray(initialState);
    const plainState = isArr ? [] : {};
    const computedDefs = {};

    if (parentObj) {
      Object.defineProperty(plainState, PARENT_REF, {
        value: parentObj,
        enumerable: false,
      });
    }
    if (rootObj) {
      Object.defineProperty(plainState, ROOT_REF, {
        value: rootObj,
        enumerable: false,
      });
    }

    pathMap.set(plainState, parentPath);

    for (const [key, val] of Object.entries(initialState)) {
      if (typeof key === "symbol") continue;
      const propPath = parentPath ? `${parentPath}.${key}` : key;

      if (typeof val === "function" && (val.length === 1 || val.length === 2)) {
        console.log(
          `[DEBUG] Auto-detected computed property: ${key} (path: ${propPath})`,
        );
        computedDefs[key] = val;
        continue;
      }

      if (shouldProxy(val)) {
        console.log(`[DEBUG] Creating nested proxy for path: ${propPath}`);
        const proxied = createDeepProxy(
          val,
          permissive,
          undefined,
          plainState,
          rootObj || plainState,
          propPath,
        );
        plainState[key] = proxied;
      } else {
        plainState[key] = val;
      }
    }
    return { plainState, computedDefs };
  }

  // Wrap top-level plain state with signals.
  function createStateSignals(stateObj, permissive) {
    const signals = {};
    signals.__version = createSignal(0);
    for (const key in stateObj) {
      if (Object.prototype.hasOwnProperty.call(stateObj, key)) {
        signals[key] = createSignal(stateObj[key]);
        console.log(
          `[createStateSignals] Key="${key}" -> storing:`,
          stateObj[key],
        );
      }
    }
    // For arrays, also create a signal for "length"
    if (Array.isArray(stateObj) && !("length" in signals)) {
      signals["length"] = createSignal(stateObj.length);
      console.log(
        `[createStateSignals] Key="length" -> storing:`,
        stateObj.length,
      );
    }
    return signals;
  }

  function getRootObject(obj) {
    if (!obj || typeof obj !== "object") return undefined;
    if (obj[ROOT_REF]) return obj[ROOT_REF];
    return obj;
  }

  // Walk a dot-delimited path from the root.
  function getProxyForPath(rootProxy, path) {
    if (!path) return rootProxy;
    const segs = path.split(".");
    let cur = rootProxy;
    for (const s of segs) {
      if (cur == null) break;
      cur = cur[s];
    }
    return cur;
  }

  /**
   * Register computed properties.
   * Computed functions are called with (self, root).
   * For keys "errors", "isValid", and "validation", if the computed result is undefined we supply a default.
   */
  function registerComputedProperties(
    plainState,
    signals,
    computedDefs,
    getSelf,
    root,
  ) {
    console.log(
      `[DEBUG] Registering ${
        Object.keys(computedDefs).length
      } computed properties:`,
      Object.keys(computedDefs),
    );
    const computedSignals = {};
    for (const [localKey, fn] of Object.entries(computedDefs)) {
      console.log(`[DEBUG] Creating computed signal for: ${localKey}`);
      const compFn = () => {
        const selfProxy = getSelf();
        console.log(`[DEBUG] Evaluating computed property: ${localKey}`);
        let result;
        try {
          result = fn.call(selfProxy, selfProxy, root);
        } catch (err) {
          console.error(
            `[DEBUG] Error in computed property ${localKey}:`,
            err,
          );
          result = undefined;
        }
        if (localKey === "errors") {
          result = result === undefined ? {} : result;
        } else if (localKey === "isValid") {
          result = result === undefined ? false : result;
        } else if (localKey === "validation") {
          result = result === undefined ? {} : result;
        }
        console.log(`[DEBUG] Computed ${localKey} result:`, result);
        return result;
      };
      computedSignals[localKey] = createComputed(compFn);
    }
    return computedSignals;
  }

  function createProxyHandler(
    stateObj,
    signals,
    computedSignals,
    permissive,
    parentObj,
    rootObj,
    path,
  ) {
    return {
      get(target, prop, receiver) {
        // Escape hatch access for keys prefixed with escapeHatchPrefix.
        if (typeof prop === "string" && prop.startsWith(escapeHatchPrefix)) {
          const actualKey = prop.slice(escapeHatchPrefix.length);
          if (actualKey in signals) {
            return signals[actualKey];
          }
          if (actualKey in computedSignals) {
            return computedSignals[actualKey];
          }
          return undefined;
        }

        // For array mutators, wrap native methods to bump __version.
        if (
          Array.isArray(target) &&
          typeof prop === "string" &&
          ["push", "pop", "splice", "shift", "unshift", "sort", "reverse"]
            .includes(prop)
        ) {
          const orig = target[prop];
          return function (...args) {
            const result = orig.apply(receiver, args);
            if (signals.__version) signals.__version.value++;
            // Also update the "length" signal if present.
            if (signals.length) signals.length.value = target.length;
            return result;
          };
        }

        if (
          typeof prop === "string" && !prop.startsWith("__") &&
          prop !== "toJSON"
        ) {
          console.log(
            `[DEBUG] (get trap) path=${pathMap.get(target) || ""} prop=${prop}`,
          );
        }

        if (prop in signals) {
          return signals[prop].value;
        }
        if (prop in computedSignals) {
          return computedSignals[prop].value;
        }
        const rawVal = Reflect.get(target, prop, receiver);
        if (typeof rawVal === "function") {
          if (Array.isArray(target)) {
            const nativeMethod = Array.prototype[prop];
            if (typeof nativeMethod === "function" && rawVal === nativeMethod) {
              return nativeMethod.bind(receiver);
            }
          }
          console.log(
            `[DEBUG] Executing inline function at prop: ${String(prop)}`,
          );
          try {
            return rawVal.call(receiver, receiver, rootObj || receiver);
          } catch (e) {
            console.error(`[DEBUG] inline function error at ${prop}:`, e);
            return undefined;
          }
        }
        return rawVal;
      },

      set(target, prop, value, receiver) {
        console.log(
          `[SET TRAP] path=${pathMap.get(target) || ""}, prop=${prop}, value=`,
          value,
        );

        if (typeof prop === "string" && prop.startsWith(escapeHatchPrefix)) {
          throw new Error(
            `Cannot directly set '${prop}'. Use the signal's 'value' property.`,
          );
        }

        const isNumeric = (typeof prop === "string" && /^[0-9]+$/.test(prop)) ||
          typeof prop === "number";
        if (Array.isArray(target) && (isNumeric || prop === "length")) {
          let newVal = value;
          if (shouldProxy(newVal)) {
            newVal = createDeepProxy(
              newVal,
              permissive,
              undefined,
              target,
              rootObj || target,
              resolvePropertyPath(pathMap.get(target) || "", prop),
            );
          }
          if (Object.is(target[prop], newVal)) return true;
          const result = Reflect.set(target, prop, newVal, receiver);
          if (signals.__version) signals.__version.value++;
          if (prop === "length" && signals["length"]) {
            signals["length"].value = newVal;
          }
          return result;
        }

        const wrapped = shouldProxy(value)
          ? createDeepProxy(
            value,
            permissive,
            undefined,
            target,
            rootObj || target,
            resolvePropertyPath(pathMap.get(target) || "", prop),
          )
          : value;

        if (prop in signals) {
          if (Object.is(signals[prop].value, wrapped)) return true;
          signals[prop].value = wrapped;
        } else {
          if (!permissive && !(prop in target)) {
            throw new Error(
              `Cannot add new property '${String(prop)}' in strict mode.`,
            );
          }
          signals[prop] = createSignal(wrapped);
        }
        target[prop] = wrapped;
        if (signals.__version) signals.__version.value++;
        return true;
      },

      deleteProperty(target, prop) {
        console.log("[DELETE TRAP]", prop, "on", pathMap.get(target));
        const r = Reflect.deleteProperty(target, prop);
        if (signals[prop]) signals[prop].value = undefined;
        if (signals.__version) signals.__version.value++;
        return r;
      },

      ownKeys(target) {
        if (Array.isArray(target)) {
          return Reflect.ownKeys(target);
        }
        const keys = Reflect.ownKeys(target);
        for (const key of Object.keys(computedSignals)) {
          if (!keys.includes(key)) {
            keys.push(key);
          }
        }
        return keys.filter((x) => x !== "toJSON" && x !== "__version");
      },

      getOwnPropertyDescriptor(target, prop) {
        if (prop in computedSignals) {
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

  function toJSON(target, signals, computedSignals, computedDefs) {
    return safeUntracked(() => {
      if (Array.isArray(target)) {
        // For arrays, return a simple unwrapped copy of the elements.
        return target.map((item) =>
          item && typeof item === "object" && typeof item.toJSON === "function"
            ? item.toJSON()
            : item
        );
      }
      const out = {};
      for (const key in signals) {
        if (
          key === "__version" ||
          key.startsWith(escapeHatchPrefix) ||
          key in computedSignals ||
          (computedDefs && computedDefs.hasOwnProperty(key)) ||
          typeof signals[key].value === "function"
        ) {
          continue;
        }
        out[key] = signals[key].value;
      }
      return out;
    });
  }

  /**
   * Create a deep proxy for the given object.
   */
  function createDeepProxy(
    obj,
    permissive,
    signalStore,
    parentObj,
    rootObj,
    path = "",
  ) {
    const { plainState, computedDefs } = processInitialState(
      obj,
      permissive,
      parentObj,
      rootObj,
      path,
    );
    const signals = signalStore || createStateSignals(plainState, permissive);

    const interimProxy = new Proxy(
      plainState,
      createProxyHandler(
        plainState,
        signals,
        {},
        permissive,
        parentObj,
        rootObj,
      ),
    );

    let finalProxy;
    const getSelf = () => finalProxy;
    const computedSignals = registerComputedProperties(
      plainState,
      signals,
      computedDefs,
      getSelf,
      rootObj || interimProxy,
    );

    finalProxy = new Proxy(
      plainState,
      createProxyHandler(
        plainState,
        signals,
        computedSignals,
        permissive,
        parentObj,
        rootObj || interimProxy,
      ),
    );
    return finalProxy;
  }

  // Top-level reify.
  function reify(initialState, options = { permissive: false }) {
    if (!initialState || typeof initialState !== "object") {
      throw new TypeError("initialState must be an object.");
    }
    const { permissive } = options;
    const { plainState, computedDefs } = processInitialState(
      initialState,
      permissive,
    );
    const signals = createStateSignals(plainState, permissive);
    const rootProxy = new Proxy(
      plainState,
      createProxyHandler(plainState, signals, {}, permissive, null, null),
    );
    let finalProxy;
    const getSelf = () => finalProxy;
    const computedSignals = registerComputedProperties(
      plainState,
      signals,
      computedDefs,
      getSelf,
      rootProxy,
    );
    finalProxy = new Proxy(
      plainState,
      createProxyHandler(
        plainState,
        signals,
        computedSignals,
        permissive,
        null,
        rootProxy,
      ),
    );

    const store = {
      state: finalProxy,
      __version: signals.__version,
      toJSON: () => toJSON(plainState, signals, computedSignals, computedDefs),
    };

    store.attach = function (actions = {}) {
      const bound = {};
      for (const [name, fn] of Object.entries(actions)) {
        bound[name] = (...args) => fn(store.state, ...args);
      }
      store.actions = bound;
      return store;
    };

    return store;
  }

  return {
    shallow,
    reify,
  };
}
