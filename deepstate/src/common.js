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

  // Helper for explicitly marked computed properties.
  function computedProp(fn) {
    return fn;
  }

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
   * We now accept a getter function getSelf() for the current proxy
   * and a 'root' parameter (the top-level proxy) so that computed functions
   * get the correct self and root.
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
        try {
          // Pass self as the current proxy and root as the top-level state.
          const result = fn.call(selfProxy, selfProxy, root);
          console.log(`[DEBUG] Computed ${localKey} result:`, result);
          return result;
        } catch (err) {
          console.error(
            `[DEBUG] Error in computed property ${localKey}:`,
            err,
          );
          return undefined;
        }
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
        if (
          typeof prop === "string" &&
          !prop.startsWith("__") &&
          prop !== "toJSON"
        ) {
          console.log(
            `[DEBUG] (get trap) path=${pathMap.get(target) || ""} prop=${prop}`,
          );
        }

        // Return computed signal value if defined.
        if (prop in computedSignals) {
          return computedSignals[prop].value;
        }

        // Return underlying signal value if available.
        if (prop in signals) {
          return signals[prop].value;
        }

        const rawVal = Reflect.get(target, prop, receiver);

        // If rawVal is a function, decide how to handle it.
        if (typeof rawVal === "function") {
          // If target is an array, check if a native method exists on Array.prototype.
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
      set(target, prop, value) {
        console.log(
          `[SET TRAP] path=${pathMap.get(target) || ""}, prop=${prop}, value=`,
          value,
        );
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
          signals[prop].value = wrapped;
        } else {
          if (!permissive && !(prop in target)) {
            throw new Error(
              `Cannot add new property '${String(prop)}' in strict mode.`,
            );
          }
          signals[prop] = createSignal(wrapped);
        }
        target[prop] = value;
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
        const keys = Reflect.ownKeys(target);
        const base = pathMap.get(target) || "";
        for (const k in computedSignals) {
          if (base ? k.startsWith(base + ".") : !k.includes(".")) {
            const suffix = k.slice(base.length).replace(/^\./, "");
            if (!suffix.includes(".") && !keys.includes(suffix)) {
              keys.push(suffix);
            }
          }
        }
        return keys.filter((x) => x !== "toJSON" && x !== "__version");
      },
      getOwnPropertyDescriptor(target, prop) {
        const base = pathMap.get(target) || "";
        const pth = resolvePropertyPath(base, prop);
        if (pth in computedSignals) {
          return {
            enumerable: true,
            configurable: true,
            get: () => computedSignals[pth].value,
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    };
  }

  function toJSON(target, signals, computedSignals) {
    return safeUntracked(() => {
      const out = {};
      for (const key in signals) {
        if (
          key !== "__version" &&
          !key.startsWith(escapeHatchPrefix) &&
          typeof signals[key].value !== "function"
        ) {
          out[key] = signals[key].value;
        }
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

    // Create an interim proxy for computed registration.
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
    // For nested objects, pass the top-level proxy from rootObj if available;
    // otherwise, for top-level, use interimProxy.
    const computedRoot = rootObj || interimProxy;
    const computedSignals = registerComputedProperties(
      plainState,
      signals,
      computedDefs,
      getSelf,
      computedRoot,
    );

    finalProxy = new Proxy(
      plainState,
      createProxyHandler(
        plainState,
        signals,
        computedSignals,
        permissive,
        parentObj,
        interimProxy,
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
      toJSON: () => finalProxy.toJSON(),
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
    computedProp,
    reify,
  };
}
