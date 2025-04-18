// src/common.js

// --- Error Messages ---
const ERROR_MESSAGES = {
  ROOT_PROXY_UNAVAILABLE: (name) =>
    `Root proxy not available for computed function ${name || "anonymous"}`,
  INITIAL_VALUE_MUST_BE_OBJECT: "Initial value must be a plain object.",
  CANNOT_SET_ESCAPED: (prop) =>
    `Cannot directly set escaped property "${
      String(prop)
    }". Use the '.value' property on the underlying signal (if applicable) or mutation methods.`,
  CANNOT_SET_COMPUTED: (prop) =>
    `Cannot set a computed property "${String(prop)}".`,
  CANNOT_ADD_STRICT: (prop) =>
    `Cannot add new property "${String(prop)}" in strict mode (object).`,
  CANNOT_REPLACE_PROXY: (prop) =>
    `Whole array/object replacement is disallowed for deep property "${
      String(prop)
    }". Use mutation methods or actions.`,
  CANNOT_DELETE_ESCAPED: (prop) =>
    `Cannot directly delete escaped property "${String(prop)}".`,
  CANNOT_DELETE_STRICT: (prop) =>
    `Cannot delete existing property "${String(prop)}" in strict mode.`,
  STORE_NOT_INITIALIZED: "Store not initialized before calling attach.",
  ACTION_ERROR: (name, error) => `Error executing action "${name}": ${error}`,
};

// --- SSR Mock Implementations ---
function SSRSignal(init) {
  let _v = init;
  return {
    get value() {
      return _v;
    },
    set value(x) {
      _v = x;
    },
    toString() {
      return String(_v);
    },
    valueOf() {
      return _v;
    },
    toJSON() {
      return _v;
    },

    [Symbol.toPrimitive]() {
      return _v;
    },
    peek() {
      return _v;
    },
    subscribe(run) {
      run(_v);
      return () => {};
    },
  };
}

function SSRComputed(fn) {
  const computedObject = {
    get value() {
      return fn();
    },
    toString() {
      return String(fn());
    },
    valueOf() {
      return fn();
    },
    toJSON() {
      return fn();
    },
    [Symbol.toPrimitive]() {
      return fn();
    },
    peek() {
      return fn();
    },
    subscribe(run) {
      run(fn());
      return () => {};
    },
  };
  computedObject._fn = fn;
  return computedObject;
}

// --- Main API Factory ---
export function createDeepStateAPIv2(
  {
    signal: injectedSignal,
    computed: injectedComputed,
    untracked: injectedUntracked,
    batch: injectedBatch,
  } = {},
  config = {},
) {
  const {
    debug = false, // Default debug to false
    escapeHatch: esc = "$", // Default escape hatch to '$'
    enableReactSsrEscapeHatchPatch: useReactSsrPatch = false, // Default patch to disabled
  } = config;
  // --- Debug Interface Setup ---
  const dbi = (typeof debug === "object" && debug !== null &&
      typeof debug.log === "function")
    ? debug
    : (debug === true ? console : { log: () => {}, error: () => {} });

  dbi.log("[Factory] Initializing DeepState API v2");

  dbi.log(
    `[Factory] React SSR Escape Hatch Patch configured: ${useReactSsrPatch}`,
  );

  // --- Shallow Marker ---
  const IS_SHALLOW = Symbol("@m5nv/deepstate/v2/is-shallow");
  function shallow(obj) {
    if (obj && typeof obj === "object") obj[IS_SHALLOW] = true;
    return obj;
  }

  // --- Environment Detection ---
  const isNode = typeof process !== "undefined" && process.versions != null &&
    process.versions.node != null;
  const isBrowser = typeof window !== "undefined" &&
    typeof window.document !== "undefined";
  const mode = typeof process === "undefined"
    ? "SPA"
    : process.env.DEEPSTATE_MODE;
  const isSSR = mode ? mode === "SSR" : (!isBrowser && isNode);

  dbi.log(
    `[Factory] Environment detection: isNode=${isNode}, isBrowser=${isBrowser}, mode=${mode}, isSSR=${isSSR}`,
  );

  // --- Safe Primitives Setup ---
  const safeSignal = isSSR ? SSRSignal : injectedSignal;
  const safeComputed = isSSR ? SSRComputed : injectedComputed;
  const safeUntracked = isSSR ? ((fn) => fn()) : injectedUntracked;
  const safeBatch = (!isSSR && typeof injectedBatch === "function")
    ? injectedBatch
    : (fn) => fn();

  // --- Utility Functions ---
  const isSignal = (val) =>
    val && typeof val === "object" && typeof val.peek === "function";

  function derivedBy(self, fn, rootFromClosure) {
    const root = rootFromClosure;
    const computedSignal = safeComputed(() => {
      if (!root && fn.length > 1) {
        const errorMsg = ERROR_MESSAGES.ROOT_PROXY_UNAVAILABLE(fn?.name);
        dbi.error("[derivedBy] Error:", errorMsg);
        throw new Error(errorMsg);
      }
      const result = fn.length > 1 ? fn(self, root) : fn(self);
      return result;
    });
    if (computedSignal) computedSignal._fn = fn;
    return computedSignal;
  }

  function createSnapshot(
    source,
    options = { forJson: false },
    untrackedFn,
    escapeHatch = esc,
    proxyMap = new WeakMap(),
  ) {
    const { forJson } = options;
    return untrackedFn(() => {
      if (!source || typeof source !== "object" || source[IS_SHALLOW]) {
        return typeof source === "function" && forJson ? undefined : source;
      }
      if (isSignal(source)) {
        return createSnapshot(
          source.peek(),
          options,
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }
      if (proxyMap.has(source)) return proxyMap.get(source);

      if (Array.isArray(source)) {
        const snapshotArray = [];
        proxyMap.set(source, snapshotArray);
        for (const key of Reflect.ownKeys(source)) {
          const isIndex = String(parseInt(key, 10)) === key &&
            parseInt(key, 10) >= 0;
          const isLength = key === "length";
          if (
            !isIndex && !isLength || isLength || key === "__version" ||
            typeof key === "symbol"
          ) continue;
          const value = source[key];
          if (forJson && typeof value === "function") continue;
          snapshotArray[key] = createSnapshot(
            value,
            options,
            untrackedFn,
            escapeHatch,
            proxyMap,
          );
        }
        return snapshotArray;
      }

      const snapshotObject = {};
      proxyMap.set(source, snapshotObject);
      for (const key of Reflect.ownKeys(source)) {
        if (
          typeof key === "symbol" ||
          (typeof key === "string" && key.startsWith(escapeHatch)) ||
          key === "__version" || key === "snapshot" || key === "toJSON"
        ) continue;
        const value = source[key];
        if (forJson && typeof value === "function") continue;
        snapshotObject[key] = createSnapshot(
          value,
          options,
          untrackedFn,
          escapeHatch,
          proxyMap,
        );
      }
      return snapshotObject;
    });
  }

  // --- Proxy Creation Logic ---
  function _createStateProxy(initial, options) { // options = { permissive }
    const { permissive = false } = options; // Extract permissive from options
    if (
      initial === null || typeof initial !== "object" || Array.isArray(initial)
    ) {
      throw new Error(ERROR_MESSAGES.INITIAL_VALUE_MUST_BE_OBJECT);
    }
    let root = null; // To be assigned after root proxy is created

    function should_proxy(val) {
      return val && typeof val === "object" && !val[IS_SHALLOW] &&
        (val.constructor === Object || Array.isArray(val));
    }

    function deep_wrap(val, currentLevelOpts) {
      // Ensure currentLevelOpts is passed down for recursive calls
      return should_proxy(val)
        ? _recursiveDeepProxy(val, currentLevelOpts)
        : val;
    }

    // Recursive function to build the proxy tree
    function _recursiveDeepProxy(o, currentLevelOpts) {
      // currentLevelOpts now includes { permissive, _useReactSsrPatch }
      const computedFns = {}; // Store initial function definitions for computeds
      let storage; // The underlying plain object or array holding signals/proxies
      let proxy; // The proxy object itself

      if (Array.isArray(o)) {
        storage = [];
        Object.defineProperty(storage, "__version", {
          value: safeSignal(0),
          writable: false,
          enumerable: false,
          configurable: false,
        });
        storage.push(...o.map((item) => {
          const itemIsObject = item && typeof item === "object";
          const itemIsSignalInstance = isSignal(item);
          const itemIsShallow = itemIsObject && item[IS_SHALLOW];
          if (itemIsObject && !itemIsSignalInstance && !itemIsShallow) {
            return _recursiveDeepProxy(item, currentLevelOpts);
          } else if (itemIsShallow) {
            // Store shallow objects directly as per baseline code provided
            // NOTE: V2 spec discussion suggested maybe wrapping these in signals too.
            // Sticking EXACTLY to user baseline code now.
            return item;
          } else {
            return itemIsSignalInstance ? item : safeSignal(item);
          }
        }));
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
              storage[key] = _recursiveDeepProxy(val, currentLevelOpts);
            } else if (valIsShallow) {
              // Wrap shallow references in signals per baseline code provided
              storage[key] = safeSignal(val);
            } else {
              storage[key] = valIsSignalInstance ? val : safeSignal(val);
            }
          }
        }
      }

      // --- The Proxy Handler ---
      const handler = {
        get: (target, prop, receiver) => {
          // --- Escape Hatch Logic (WITH CONDITIONAL PATCH) ---
          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const actualProp = prop.substring(esc.length);
            dbi.log(`[Get EscapeHatch] "${prop}" -> "${actualProp}"`);

            let underlyingSignal = null; // Variable to hold the found signal/computed

            // Check initial computed properties
            if (actualProp in computedFns) {
              let computedSignalInstance = Reflect.get(target, actualProp);
              if (
                !isSignal(computedSignalInstance) ||
                computedSignalInstance._fn !== computedFns[actualProp]
              ) {
                dbi.log(
                  `[Get EscapeHatch] Materializing computed signal for "${actualProp}"`,
                );
                computedSignalInstance = derivedBy(
                  receiver,
                  computedFns[actualProp],
                  root,
                );
                target[actualProp] = computedSignalInstance; // Cache the computed signal object
              }
              underlyingSignal = computedSignalInstance;
            } // Check target storage
            else if (actualProp in target) {
              underlyingSignal = Reflect.get(target, actualProp);
            }

            // If a signal/computed was found...
            if (underlyingSignal !== null) {
              // *** === CONDITIONAL SSR PATCH LOGIC === ***
              // Check: Is it SSR mode? Is the React patch enabled for this API instance? Is the underlying thing actually a signal?
              if (
                isSSR && currentLevelOpts._useReactSsrPatch &&
                isSignal(underlyingSignal)
              ) {
                dbi.log(
                  `[Get EscapeHatch SSR ReactPatch] Returning .value for "${actualProp}"`,
                );
                return underlyingSignal.value; // Return primitive value (Patched Behavior)
              } else {
                return underlyingSignal; // Return signal object / underlying item (Default V2 Behavior)
              }
              // *** === END CONDITIONAL LOGIC === ***
            } else {
              return undefined; // Prop not found via escape hatch
            }
          }
          // --- END: Escape Hatch Logic ---

          // --- START: Non-Escape Hatch Logic ---
          // Handle snapshot and toJSON properties first (identical to baseline)
          if (prop === "snapshot") {
            const snapshotFn = () => {
              dbi.log(`[Snapshot] Pre-materializing...`);
              for (const key in computedFns) {
                if (Object.hasOwnProperty.call(computedFns, key)) {
                  try {
                    receiver[key]; // Access via receiver to trigger caching
                  } catch (e) {
                    dbi.error(`[Snapshot] Error materializing '${key}':`, e);
                  }
                }
              }
              dbi.log(`[Snapshot] Pre-materialization complete.`);
              return createSnapshot(
                receiver,
                { forJson: false },
                safeUntracked,
                esc,
              );
            };
            return snapshotFn;
          }
          if (prop === "toJSON") {
            return () =>
              createSnapshot(receiver, { forJson: true }, safeUntracked, esc);
          }

          // Track array access for reactivity (SPA only) (identical to baseline)
          if (
            !isSSR && Array.isArray(target) && prop !== "__version" &&
            target.__version
          ) {
            target.__version.value; // Read signal value
          }

          // Check target storage for the property (identical to baseline)
          if (prop in target) {
            const val = Reflect.get(target, prop, receiver);
            if (prop === "__version" && isSignal(val)) return val; // Return __version signal itself
            if (isSignal(val)) return val.value; // Unwrap signal values
            return val; // Return nested proxy or raw value
          }

          // Check initially defined computed properties (identical to baseline)
          if (prop in computedFns) {
            const cachedComputed = Reflect.get(target, prop);
            if (
              isSignal(cachedComputed) &&
              cachedComputed._fn === computedFns[prop]
            ) {
              return cachedComputed.value; // Return cached computed value
            } else {
              dbi.log(
                `[Get] Materializing initial computed signal for "${
                  String(prop)
                }"`,
              );
              const comp = derivedBy(receiver, computedFns[prop], root);
              target[prop] = comp; // Cache the computed signal object
              return comp.value; // Return computed value
            }
          }

          // Handle array methods (identical to baseline)
          if (
            Array.isArray(target) && typeof prop === "string" &&
            prop in Array.prototype
          ) {
            const method = Array.prototype[prop];
            if (typeof method === "function") return method.bind(receiver);
          }

          return undefined; // Property not found
          // --- END: Non-Escape Hatch Logic ---
        }, // End get trap

        // --- set, has, deleteProperty traps remain IDENTICAL to your working baseline ---
        set: (target, prop, newVal, receiver) => {
          dbi.log(`[Set] Request to set prop "${String(prop)}"`);
          const currentVal = Reflect.get(target, prop);
          const isTargetArray = Array.isArray(target);
          const propAsString = typeof prop === "string" ? prop : "";
          const isArrayIndex = isTargetArray &&
            String(Number(propAsString)) === propAsString &&
            Number(propAsString) >= 0;
          const isArrayLength = isTargetArray && prop === "length";

          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const errorMsg = ERROR_MESSAGES.CANNOT_SET_ESCAPED(prop);
            dbi.error(errorMsg);
            throw new TypeError(errorMsg);
          }
          if (prop in computedFns) {
            const errorMsg = ERROR_MESSAGES.CANNOT_SET_COMPUTED(prop);
            dbi.error(errorMsg);
            throw new TypeError(errorMsg);
          }
          if (isSignal(currentVal)) {
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            if (currentVal.peek() !== wrappedNewVal) {
              currentVal.value = wrappedNewVal;
              if ((isArrayIndex || isArrayLength) && target.__version) {
                target.__version.value++;
              }
            }
            return true;
          } else if (isArrayIndex) {
            const alreadyExisted = prop in target;
            const wrappedNewVal = deep_wrap(newVal, currentLevelOpts);
            let valueChanged = !alreadyExisted ||
              (!isSignal(Reflect.get(target, prop)) ||
                Reflect.get(target, prop).peek() !== wrappedNewVal); // Using baseline logic here
            if (valueChanged) {
              target[prop] = wrappedNewVal; // Assign wrapped value (might be proxy or primitive)
              // Need to ensure it's signal or proxy in storage? Baseline code implied assignment was enough. Let's stick to baseline assignment.
              if (target.__version) target.__version.value++;
            }
            return true;
          } else if (isArrayLength) {
            const currentLength = target.length;
            try {
              target[prop] = newVal; // Use standard length assignment
              if (target.length !== currentLength && target.__version) {
                target.__version.value++;
              }
              return true;
            } catch (e) {
              dbi.error(`Error setting array length:`, e);
              throw e;
            }
          } else if (!(prop in target)) {
            if (currentLevelOpts.permissive) {
              if (typeof newVal === "function") {
                dbi.log(
                  `[Set Permissive] Adding NEW COMPUTED property "${
                    String(prop)
                  }"`,
                );
                const computedSignal = derivedBy(receiver, newVal, root);
                target[prop] = computedSignal;
                return true;
              } else {
                dbi.log(
                  `[Set Permissive] Adding new object property "${
                    String(prop)
                  }"`,
                );
                target[prop] = safeSignal(deep_wrap(newVal, currentLevelOpts));
                return true;
              }
            } else {
              const errorMsg = ERROR_MESSAGES.CANNOT_ADD_STRICT(prop);
              dbi.error(errorMsg);
              throw new TypeError(errorMsg);
            }
          } else { // Prop exists, but isn't a signal - implies wholesale replacement attempt
            // Need to check if newVal requires proxying to match spec's intent more closely?
            if (should_proxy(currentVal) && should_proxy(newVal)) { // Check if both old and new are proxy-able objects/arrays
              const errorMsg = ERROR_MESSAGES.CANNOT_REPLACE_PROXY(prop);
              dbi.error(errorMsg);
              throw new TypeError(errorMsg);
            } else {
              // Allow replacement if not replacing proxy with proxy? Baseline seems to hit type error below.
              // Let's stick closer to baseline's apparent simpler logic which might error implicitly here.
              // Or explicitly throw:
              const errorMsg = `[Set] Unhandled replacement for prop "${
                String(prop)
              }"`;
              dbi.error(errorMsg);
              throw new TypeError(errorMsg); // Be explicit about disallowed replacement
            }
          }
        }, // End set
        has: (target, prop) => {
          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            const actualProp = prop.substring(esc.length);
            return (actualProp in target) || (actualProp in computedFns);
          }
          return (prop in target) || (prop in computedFns);
        }, // End has
        deleteProperty: (target, prop) => {
          dbi.log(`[Delete] Request for prop: "${String(prop)}"`);
          const hadPropInTarget = prop in target;
          const isComputed = prop in computedFns;
          const isPermissive = currentLevelOpts.permissive;

          if (
            typeof esc === "string" && esc.length > 0 &&
            typeof prop === "string" && prop.startsWith(esc)
          ) {
            dbi.error(ERROR_MESSAGES.CANNOT_DELETE_ESCAPED(prop));
            return true;
          }
          if (!isPermissive) {
            const isTargetArray = Array.isArray(target);
            const isArrayIndex = isTargetArray &&
              String(Number(prop)) === String(prop) && Number(prop) >= 0;
            if ((hadPropInTarget || isComputed) && !isArrayIndex) {
              const errorMsg = ERROR_MESSAGES.CANNOT_DELETE_STRICT(prop);
              dbi.error(errorMsg);
              throw new TypeError(errorMsg);
            }
            dbi.log(
              `[Delete] Allowing potential deletion for "${
                String(prop)
              }" in strict mode (must be array index or non-existent).`,
            );
          }

          let deleted = false;
          if (isComputed) {
            dbi.log(
              `[Delete Permissive] Removing computed definition "${
                String(prop)
              }"`,
            );
            delete computedFns[prop];
            if (hadPropInTarget) Reflect.deleteProperty(target, prop);
            deleted = true; // Report success
          } else if (hadPropInTarget) {
            deleted = Reflect.deleteProperty(target, prop);
            dbi.log(
              `[Delete${
                isPermissive ? " Permissive" : ""
              }] Deleting from target storage "${String(prop)}": ${deleted}`,
            );
            const isTargetArray = Array.isArray(target);
            const isArrayIndex = isTargetArray &&
              String(Number(prop)) === String(prop) && Number(prop) >= 0;
            if (deleted && isArrayIndex && target.__version) {
              dbi.log(
                `[Delete] Incrementing array __version for index "${
                  String(prop)
                }"`,
              );
              target.__version.value++;
            }
          } else {
            dbi.log(`[Delete] Property "${String(prop)}" not found.`);
            deleted = true; // Deleting non-existent is successful
          }
          return deleted;
        }, // End deleteProperty
      }; // End handler

      proxy = new Proxy(storage, handler);
      return proxy;
    } // End _recursiveDeepProxy

    // *** MODIFIED ***: Pass the config flag down via optionsForProxy
    const optionsForProxy = {
      permissive: options.permissive, // Pass permissive flag
      _useReactSsrPatch: useReactSsrPatch, // Pass patch flag
    };
    const finalProxy = _recursiveDeepProxy(initial, optionsForProxy);
    root = finalProxy; // Assign root proxy *after* creation
    dbi.log("[_createStateProxy] Root proxy established.");
    return finalProxy;
  } // End _createStateProxy

  // --- Public API ---
  // reify and attach remain IDENTICAL to your working baseline code
  function reify(
    initial,
    options = { permissive: false, actions: {} },
  ) {
    const { permissive, actions: providedActions = {} } = options;
    const proxyOptions = { permissive };
    const topVersion = safeSignal(0);
    let store = null;

    dbi.log("[reify] Creating state proxy...");
    const rootProxy = _createStateProxy(initial, proxyOptions);
    dbi.log("[reify] State proxy created.");

    function attach(actions = {}) {
      if (!store) {
        dbi.error(ERROR_MESSAGES.STORE_NOT_INITIALIZED);
        console.error(ERROR_MESSAGES.STORE_NOT_INITIALIZED);
        return store;
      }
      if (!store.actions) store.actions = {};
      for (const name in actions) {
        if (Object.hasOwnProperty.call(actions, name)) {
          store.actions[name] = (...args) => {
            let result;
            dbi.log(`[Action] Running action "${name}"...`);
            safeBatch(() => {
              try {
                result = actions[name](store.state, ...args);
              } catch (error) {
                dbi.error(`[Action Error] Action "${name}":`, error);
                console.error(ERROR_MESSAGES.ACTION_ERROR(name, error));
                throw error;
              }
            });
            dbi.log(
              `[Action] Completed action "${name}". Incrementing topVersion.`,
            );
            topVersion.value++;
            return result;
          };
        }
      }
      return store;
    } // End attach

    function toJSON() {
      return rootProxy.toJSON ? rootProxy.toJSON() : undefined;
    }
    function snapshot() {
      return rootProxy.snapshot ? rootProxy.snapshot() : undefined;
    }

    store = { state: rootProxy, attach, toJSON, snapshot };
    Object.defineProperty(store, "__version", {
      value: topVersion,
      writable: false,
      enumerable: false,
    });
    if (providedActions && Object.keys(providedActions).length > 0) { // Check providedActions exists
      dbi.log("[reify] Attaching initial actions...");
      attach(providedActions);
    }
    dbi.log("[reify] Store created successfully.");
    return store;
  } // End reify

  // Return the public API functions from the factory
  return { shallow, reify };
} // End createDeepStateAPIv2
